import { NextResponse } from "next/server";
import { isAuthorized } from "@/lib/authHelper";
import { supabase } from "@/lib/supabase";

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
    const buffer = Buffer.from(bytes);

    // Sanitize filename: remove special characters, add timestamp
    const cleanName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const filename = `${Date.now()}_${cleanName}`;

    // Upload to Supabase Storage bucket 'wedding-assets'
    const { data, error } = await supabase.storage
      .from("wedding-assets")
      .upload(filename, buffer, {
        contentType: file.type,
        upsert: true,
      });

    if (error) {
      console.error("Supabase storage upload error:", error);
      return NextResponse.json(
        { error: "Failed to upload to storage" },
        { status: 500 }
      );
    }

    // Retrieve the public URL
    const { data: publicUrlData } = supabase.storage
      .from("wedding-assets")
      .getPublicUrl(filename);

    // Return the accessible public URL path
    return NextResponse.json({ url: publicUrlData.publicUrl });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "File upload failed" },
      { status: 500 }
    );
  }
}
