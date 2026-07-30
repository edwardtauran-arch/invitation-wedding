import { NextResponse } from "next/server";
import { isAuthorized } from "@/lib/authHelper";
import { cookies } from "next/headers";
import { writeFile, mkdir } from "fs/promises";
import path from "path";



export async function POST(req: Request) {
  if (!isAuthorized()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ 
      error: "Fitur upload dinonaktifkan di Vercel (Read-Only). Harap gunakan URL gambar eksternal (Google Drive/Imgur) di Dashboard." 
    }, { status: 403 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Save directory: public/uploads
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    
    // Ensure dir exists
    await mkdir(uploadDir, { recursive: true });

    // Sanitize filename: remove special characters, add timestamp
    const cleanName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const filename = `${Date.now()}_${cleanName}`;
    const filePath = path.join(uploadDir, filename);

    await writeFile(filePath, buffer);

    // Return the accessible public URL path
    return NextResponse.json({ url: `/uploads/${filename}` });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "File upload failed" },
      { status: 500 }
    );
  }
}

