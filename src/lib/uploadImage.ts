/** Client helper: uploads an image through /api/upload (Cloudinary) and returns its optimized URL. */

export const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
export const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"];

export function validateImage(file: File): string | null {
  if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) return "Use a JPG, PNG, WebP, GIF or AVIF image.";
  if (file.size > MAX_IMAGE_BYTES) return "Image is too large (max 10 MB).";
  return null;
}

export async function uploadImage(file: File): Promise<string> {
  const invalid = validateImage(file);
  if (invalid) throw new Error(invalid);

  const fd = new FormData();
  fd.append("file", file);
  const res = await fetch("/api/upload", { method: "POST", body: fd });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Image upload failed");
  if (!data.url) throw new Error("Upload endpoint did not return an image URL");
  return data.url as string;
}
