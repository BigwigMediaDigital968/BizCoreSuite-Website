/**
 * Client/server-safe Cloudinary URL helper (no Node APIs).
 * Adds a width cap after our f_auto,q_auto transformation so list thumbnails
 * don't download full-size originals. Non-Cloudinary URLs are returned unchanged.
 */
export function resizeImage(url: string | undefined, width: number): string {
  if (!url) return "";
  if (!url.includes("res.cloudinary.com") || !url.includes("/upload/")) return url;
  if (/\/upload\/[^/]*w_\d+/.test(url)) return url;
  const auto = "/upload/f_auto,q_auto/";
  return url.includes(auto)
    ? url.replace(auto, `/upload/f_auto,q_auto,c_limit,w_${width}/`)
    : url.replace("/upload/", `/upload/c_limit,w_${width}/`);
}
