import { createHash } from "node:crypto";

/**
 * Minimal server-side Cloudinary client (signed uploads via the REST API,
 * so no SDK dependency). Requires, in .env:
 *   CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET
 * Optional: CLOUDINARY_UPLOAD_FOLDER (default "bizcore/blog")
 */

export interface CloudinaryUpload {
  publicId: string;
  /** Original secure URL */
  url: string;
  /** URL with automatic format + quality (f_auto,q_auto) — use this in content */
  optimizedUrl: string;
  width: number;
  height: number;
  format: string;
  bytes: number;
}

export function cloudinaryConfig() {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  if (!cloudName || !apiKey || !apiSecret) return null;
  return {
    cloudName,
    apiKey,
    apiSecret,
    folder: process.env.CLOUDINARY_UPLOAD_FOLDER || "bizcore/blog",
  };
}

function sign(params: Record<string, string>, secret: string) {
  const toSign = Object.keys(params)
    .sort()
    .map((k) => `${k}=${params[k]}`)
    .join("&");
  return createHash("sha1").update(toSign + secret).digest("hex");
}

/** Insert f_auto,q_auto after /upload/ so browsers get WebP/AVIF at sane quality. */
export function optimizeUrl(url: string) {
  return url.includes("/upload/") && !url.includes("/upload/f_auto")
    ? url.replace("/upload/", "/upload/f_auto,q_auto/")
    : url;
}

export async function uploadImage(file: File): Promise<CloudinaryUpload> {
  const cfg = cloudinaryConfig();
  if (!cfg) throw new Error("CLOUDINARY_NOT_CONFIGURED");

  const timestamp = String(Math.floor(Date.now() / 1000));
  const signed = { folder: cfg.folder, timestamp };

  const fd = new FormData();
  fd.append("file", file);
  fd.append("api_key", cfg.apiKey);
  fd.append("timestamp", timestamp);
  fd.append("folder", cfg.folder);
  fd.append("signature", sign(signed, cfg.apiSecret));

  const res = await fetch(`https://api.cloudinary.com/v1_1/${cfg.cloudName}/image/upload`, {
    method: "POST",
    body: fd,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.secure_url) {
    throw new Error(data?.error?.message || "Cloudinary upload failed");
  }

  return {
    publicId: data.public_id,
    url: data.secure_url,
    optimizedUrl: optimizeUrl(data.secure_url),
    width: data.width,
    height: data.height,
    format: data.format,
    bytes: data.bytes,
  };
}

/* ───────── Cleanup helpers ───────── */

/** Cloudinary public_id for one of our delivery URLs, or null for anything else. */
export function publicIdFromUrl(url: string): string | null {
  const cfg = cloudinaryConfig();
  if (!cfg) return null;
  const m = url.match(/^https?:\/\/res\.cloudinary\.com\/([^/]+)\/image\/upload\/(.+)$/);
  if (!m || m[1] !== cfg.cloudName) return null;

  let segs = m[2].split("?")[0].split("/");
  const v = segs.findIndex((s) => /^v\d+$/.test(s));
  segs = v >= 0 ? segs.slice(v + 1) : segs.filter((s) => !(s.includes(",") || /^[a-z]{1,3}_/.test(s)));
  if (!segs.length) return null;

  const id = decodeURIComponent(segs.join("/")).replace(/\.[a-z0-9]+$/i, "");
  // Only ever touch assets inside our own upload folder
  return id.startsWith(`${cfg.folder}/`) ? id : null;
}

/** All of our Cloudinary public IDs referenced by a cover URL and/or HTML content. */
export function collectPublicIds(coverImage?: string, content?: string): Set<string> {
  const urls = [coverImage || ""];
  for (const m of (content || "").matchAll(/<img\b[^>]*?\bsrc=["']([^"']+)["']/gi)) urls.push(m[1]);
  const ids = new Set<string>();
  for (const u of urls) {
    const id = u ? publicIdFromUrl(u) : null;
    if (id) ids.add(id);
  }
  return ids;
}

export async function destroyImage(publicId: string): Promise<void> {
  const cfg = cloudinaryConfig();
  if (!cfg) return;
  const timestamp = String(Math.floor(Date.now() / 1000));
  const fd = new FormData();
  fd.append("public_id", publicId);
  fd.append("api_key", cfg.apiKey);
  fd.append("timestamp", timestamp);
  fd.append("signature", sign({ public_id: publicId, timestamp }, cfg.apiSecret));
  const res = await fetch(`https://api.cloudinary.com/v1_1/${cfg.cloudName}/image/destroy`, {
    method: "POST",
    body: fd,
  });
  if (!res.ok) throw new Error(`Cloudinary destroy failed (${res.status}) for ${publicId}`);
}
