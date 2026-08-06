import { NextResponse } from "next/server";
import { isAuthorized } from "@/lib/authHelper";
import { supabase } from "@/lib/supabase";
import sharp from "sharp";

export async function POST(req: Request) {
  if (!isAuthorized()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const inputBuffer = Buffer.from(bytes);

    // Cek apakah file adalah gambar yang bisa dikompres
    const isImage = file.type.startsWith("image/") && file.type !== "image/gif" && file.type !== "image/svg+xml";

    let buffer: Buffer;
    let contentType: string;
    let fileExtension: string;

    if (isImage) {
      // Kompres & resize gambar menggunakan sharp
      // - Resize max lebar 1200px (pertahankan aspect ratio)
      // - Konversi ke WebP dengan kualitas 82 (sweet spot kualitas vs ukuran)
      buffer = await sharp(inputBuffer)
        .resize({
          width: 1200,
          withoutEnlargement: true, // Tidak diperbesar jika sudah kecil
        })
        .webp({ quality: 82 })
        .toBuffer();
      contentType = "image/webp";
      fileExtension = "webp";
    } else {
      // File bukan gambar, upload langsung tanpa kompresi
      buffer = inputBuffer;
      contentType = file.type;
      fileExtension = file.name.split(".").pop() || "bin";
    }

    // Sanitize filename: hapus karakter spesial, tambah timestamp
    const baseName = file.name
      .replace(/\.[^/.]+$/, "") // hapus ekstensi asli
      .replace(/[^a-zA-Z0-9-]/g, "_"); // sanitize nama
    const filename = `${Date.now()}_${baseName}.${fileExtension}`;

    // Upload ke Supabase Storage bucket 'wedding-assets'
    const { data, error } = await supabase.storage
      .from("wedding-assets")
      .upload(filename, buffer, {
        contentType,
        upsert: true,
      });

    if (error) {
      console.error("Supabase storage upload error:", error);
      return NextResponse.json(
        { error: "Failed to upload to storage: " + error.message },
        { status: 500 }
      );
    }

    // Ambil public URL
    const { data: publicUrlData } = supabase.storage
      .from("wedding-assets")
      .getPublicUrl(data.path);

    // Return public URL beserta info ukuran untuk debugging
    return NextResponse.json({
      url: publicUrlData.publicUrl,
      compressed: isImage,
      originalSize: inputBuffer.length,
      compressedSize: buffer.length,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "File upload failed" },
      { status: 500 }
    );
  }
}
