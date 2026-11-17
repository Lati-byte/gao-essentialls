import { NextRequest, NextResponse } from "next/server";
import fs from "node:fs";
import path from "node:path";
import { prisma } from "@/lib/db";

const MIME_TYPES: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".gif": "image/gif",
};

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ file: string[] }> }
) {
  const { file } = await params;
  const dbName = file.join("/").replace(/^(\.\.[/\\])+/, "");
  const safeName = path.normalize(dbName).replace(/^(\.\.[/\\])+/, "");
  const filePath = path.join(process.cwd(), "public", "uploads", safeName);

  // Fast path: serve from local disk if present
  if (fs.existsSync(filePath)) {
    const stat = fs.statSync(filePath);
    if (stat.isFile()) {
      const ext = path.extname(safeName).toLowerCase();
      const contentType = MIME_TYPES[ext] || "application/octet-stream";
      const fileBuffer = fs.readFileSync(filePath);
      return new NextResponse(new Uint8Array(fileBuffer), {
        status: 200,
        headers: {
          "Content-Type": contentType,
          "Content-Length": stat.size.toString(),
          "Cache-Control": "public, max-age=31536000, immutable",
        },
      });
    }
  }

  // Primary cloud path: serve persisted image from MongoDB
  try {
    const record = await prisma.uploadedImage.findUnique({
      where: { filename: dbName },
    });

    if (!record) {
      return new NextResponse("Not Found", { status: 404 });
    }

    return new NextResponse(new Uint8Array(record.data), {
      status: 200,
      headers: {
        "Content-Type": record.mimeType || "application/octet-stream",
        "Content-Length": String(record.size),
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    console.error("Failed to load uploaded image from MongoDB:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
