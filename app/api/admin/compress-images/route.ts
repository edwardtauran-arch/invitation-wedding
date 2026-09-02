import { NextResponse } from "next/server";
import { isAuthorized } from "@/lib/authHelper";
import { supabase } from "@/lib/supabase";
import { getDynamicSettings, updateDynamicSettings } from "@/lib/dbHelper";
import sharp from "sharp";

const SUPABASE_BUCKET = "wedding-assets";

// Ekstrak filename dari Supabase public URL
function extractSupabaseFilename(url: string): string | null {
  try {
    const u = new URL(url);
    // Format: .../storage/v1/object/public/wedding-assets/FILENAME
    const parts = u.pathname.split(`/public/${SUPABASE_BUCKET}/`);
    if (parts.length === 2 && parts[1]) return decodeURIComponent(parts[1]);
  } catch {}
  return null;
}

// Apakah URL ini milik Supabase storage kita?
function isOurSupabaseUrl(url: string): boolean {
  if (!url || typeof url !== "string") return false;
  return url.includes(`/storage/v1/object/public/${SUPABASE_BUCKET}/`);
}

async function compressAndReplace(
  url: string,
  results: { url: string; status: string; saved?: string }[]
) {
  if (!isOurSupabaseUrl(url)) {
    results.push({ url, status: "skipped (external)" });
    return url;
  }

  const filename = extractSupabaseFilename(url);
  if (!filename) {
    results.push({ url, status: "skipped (unrecognized url)" });
    return url;
  }

  // Skip jika sudah WebP (sudah dikompresi sebelumnya)
  if (filename.toLowerCase().endsWith(".webp") || filename.toLowerCase().includes("_c.webp")) {
    results.push({ url, status: "skipped (already webp)" });
    return url;
  }

  try {
    // Download file dari Supabase
    const { data: blob, error: dlErr } = await supabase.storage
      .from(SUPABASE_BUCKET)
      .download(filename);

    if (dlErr || !blob) {
      results.push({ url, status: `error: ${dlErr?.message ?? "download failed"}` });
      return url;
    }

    const arrayBuf = await blob.arrayBuffer();
    const inputBuf = Buffer.from(arrayBuf);
    const originalSize = inputBuf.length;

    // Kompres dengan sharp: max 1200px, WebP quality 82
    const compressed = await sharp(inputBuf)
      .resize({ width: 1200, withoutEnlargement: true })
      .webp({ quality: 82 })
      .toBuffer();

    // Nama file baru (ganti ekstensi jadi _c.webp)
    const newFilename = filename.replace(/\.[^.]+$/, "_c.webp");

    // Upload ke Supabase
    const { data: upData, error: upErr } = await supabase.storage
      .from(SUPABASE_BUCKET)
      .upload(newFilename, compressed, {
        contentType: "image/webp",
        upsert: true,
      });

    if (upErr || !upData) {
      results.push({ url, status: `error upload: ${upErr?.message}` });
      return url;
    }

    const { data: pub } = supabase.storage
      .from(SUPABASE_BUCKET)
      .getPublicUrl(newFilename);

    const savedKB = Math.round((originalSize - compressed.length) / 1024);
    results.push({
      url,
      status: "compressed",
      saved: `${savedKB}KB saved (${(originalSize / 1024) | 0}KB → ${(compressed.length / 1024) | 0}KB)`,
    });

    return pub.publicUrl;
  } catch (err: any) {
    results.push({ url, status: `error: ${err.message}` });
    return url;
  }
}

export async function POST(req: Request) {
  if (!isAuthorized()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const settings = await getDynamicSettings();
    const results: { url: string; status: string; saved?: string }[] = [];
    const imageFields: { key: string; url: string }[] = [];

    // Slide images
    const slideKeys = ["slide1","slide2","slide3","slide4","slide5","slide6","slide7","slide8","slide9","slide10","sideImage"];
    for (const k of slideKeys) {
      const url = settings.slideImages?.[k];
      if (url) imageFields.push({ key: `slideImages.${k}`, url });
    }

    // Gallery images
    if (Array.isArray(settings.galleryImages)) {
      settings.galleryImages.forEach((url: string, idx: number) => {
        if (url) imageFields.push({ key: `galleryImages_${idx}`, url });
      });
    }

    // Dresscode image
    if (settings.dresscode?.image) {
      imageFields.push({ key: "dresscode.image", url: settings.dresscode.image });
    }

    // Proses tiap gambar
    const urlMap: Record<string, string> = {};
    for (const field of imageFields) {
      const newUrl = await compressAndReplace(field.url, results);
      if (newUrl !== field.url) {
        urlMap[field.key] = newUrl;
      }
    }

    // Update settings di DB jika ada perubahan URL
    if (Object.keys(urlMap).length > 0) {
      const newSettings = JSON.parse(JSON.stringify(settings));
      for (const [key, val] of Object.entries(urlMap)) {
        if (key.startsWith("slideImages.")) {
          const sub = key.replace("slideImages.", "");
          if (!newSettings.slideImages) newSettings.slideImages = {};
          newSettings.slideImages[sub] = val;
        } else if (key.startsWith("galleryImages_")) {
          const idx = parseInt(key.replace("galleryImages_", ""));
          if (!newSettings.galleryImages) newSettings.galleryImages = [];
          newSettings.galleryImages[idx] = val;
        } else if (key.startsWith("dresscode.")) {
          const sub = key.replace("dresscode.", "");
          if (!newSettings.dresscode) newSettings.dresscode = {};
          newSettings.dresscode[sub] = val;
        } else {
          newSettings[key] = val;
        }
      }
      await updateDynamicSettings(newSettings);
    }

    const compressed = results.filter(r => r.status === "compressed").length;
    const skipped = results.filter(r => r.status.startsWith("skipped")).length;
    const errors = results.filter(r => r.status.startsWith("error")).length;

    return NextResponse.json({
      success: true,
      summary: { total: results.length, compressed, skipped, errors },
      updatedFields: Object.keys(urlMap).length,
      details: results,
    });
  } catch (err: any) {
    console.error("compress-images error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
