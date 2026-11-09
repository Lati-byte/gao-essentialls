import { NextResponse } from "next/server";
import fs from "node:fs";
import path from "node:path";
import { getAdminSession } from "@/lib/auth";

export async function POST(request: Request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate mime type
    const validTypes = ["image/jpeg", "image/png", "image/webp", "image/svg+xml", "image/jpg"];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Only JPEG, PNG, WEBP, and SVG are accepted." },
        { status: 400 }
      );
    }

    // Limit size to 5MB
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File size exceeds 5MB limit." },
        { status: 400 }
      );
    }

    // Local admin uploads directory
    const adminUploadDir = path.join(process.cwd(), "public", "uploads");
    if (!fs.existsSync(adminUploadDir)) {
      fs.mkdirSync(adminUploadDir, { recursive: true });
    }

    // Storefront uploads directory
    const storePublicDir =
      process.env.STORE_PUBLIC_DIR || path.resolve(process.cwd(), "..", "gao-essentialls", "public");
    const storeUploadDir = path.resolve(storePublicDir, "uploads");
    if (!fs.existsSync(storeUploadDir)) {
      try {
        fs.mkdirSync(storeUploadDir, { recursive: true });
      } catch (e) {
        console.warn("Could not create storefront uploads directory:", e);
      }
    }

    const ext = path.extname(file.name) || ".jpg";
    const cleanName = path.basename(file.name, ext).replace(/[^a-z0-9]/gi, "-").toLowerCase();
    const fileName = `${Date.now()}-${cleanName}${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());

    // Write to admin public/uploads
    fs.writeFileSync(path.join(adminUploadDir, fileName), buffer);

    // Sync write to storefront public/uploads
    try {
      if (fs.existsSync(storeUploadDir)) {
        fs.writeFileSync(path.join(storeUploadDir, fileName), buffer);
      }
    } catch (e) {
      console.warn("Could not sync uploaded file to storefront uploads directory:", e);
    }

    return NextResponse.json({
      success: true,
      url: `/uploads/${fileName}`,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Failed to upload file." }, { status: 500 });
  }
}
