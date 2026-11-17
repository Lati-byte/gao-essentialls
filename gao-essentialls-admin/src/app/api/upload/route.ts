import { NextResponse } from "next/server";
import fs from "node:fs";
import path from "node:path";
import { getAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

const MIME_TO_EXT: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/jpg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/svg+xml": ".svg",
  "image/gif": ".gif",
};

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
    const mimeType = file.type.toLowerCase();
    if (!MIME_TO_EXT[mimeType]) {
      return NextResponse.json(
        { error: "Invalid file type. Only JPEG, PNG, WEBP, GIF, and SVG are accepted." },
        { status: 400 }
      );
    }

    // Limit size to 5MB (fits safely within MongoDB 16MB document limit)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File size exceeds 5MB limit." },
        { status: 400 }
      );
    }

    const rawExt = path.extname(file.name).toLowerCase();
    const ext = rawExt || MIME_TO_EXT[mimeType] || ".jpg";
    const baseName = path.basename(file.name, path.extname(file.name))
      .replace(/[^a-z0-9]/gi, "-")
      .replace(/-+/g, "-")
      .replace(/(^-|-$)/g, "")
      .toLowerCase() || "image";
    const fileName = `${Date.now()}-${baseName}${ext}`;
    const bytes = new Uint8Array(await file.arrayBuffer());

    // Persist in MongoDB so both Admin and Storefront containers serve it reliably on Render
    await prisma.uploadedImage.create({
      data: {
        filename: fileName,
        mimeType,
        data: bytes,
        size: bytes.byteLength,
      },
    });

    // Optional local disk write for faster local dev caching (never fail deployment if ephemeral/isolated)
    try {
      const adminUploadDir = path.join(process.cwd(), "public", "uploads");
      if (!fs.existsSync(adminUploadDir)) {
        fs.mkdirSync(adminUploadDir, { recursive: true });
      }
      fs.writeFileSync(path.join(adminUploadDir, fileName), bytes);
    } catch {
      // MongoDB holds the source of truth
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
