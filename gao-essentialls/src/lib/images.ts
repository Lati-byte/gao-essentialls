import "server-only";
import fs from "node:fs";
import path from "node:path";

/** Resolve /images/<name>.<ext> for whichever extension exists in /public/images. */
export function publicImage(name: string, fallback = "/images/placeholder.svg"): string {
  const dir = path.join(process.cwd(), "public", "images");
  for (const ext of ["webp", "jpg", "jpeg", "png", "svg"]) {
    if (fs.existsSync(path.join(dir, `${name}.${ext}`))) return `/images/${name}.${ext}`;
  }
  return fallback;
}
