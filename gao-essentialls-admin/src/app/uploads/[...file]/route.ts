import { NextRequest, NextResponse } from "next/server";
import fs from "node:fs";
import path from "node:path";

const MIME_TYPES: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".gif": "image/gif",
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ file: string[] }> }
) {
  const { file } = await params;
  const fileName = file.join("/");
  const safeName = path.normalize(fileName).replace(/^(\.\.[\/\\])+/, "");
  const filePath = path.join(process.cwd(), "public", "uploads", safeName);

  if (!fs.existsSync(filePath)) {
    return new NextResponse("Not Found", { status: 404 });
  }

  const stat = fs.statSync(filePath);
  if (!stat.isFile()) {
    return new NextResponse("Not Found", { status: 404 });
  }

  const ext = path.extname(safeName).toLowerCase();
  const contentType = MIME_TYPES[ext] || "application/octet-stream";
  const fileBuffer = fs.readFileSync(filePath);

  return new NextResponse(fileBuffer, {
    status: 200,
    headers: {
      "Content-Type": contentType,
      "Content-Length": stat.size.toString(),
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
