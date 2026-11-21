import { Blog } from "@/src/db/models/Blog";
import { destroyImage } from "@/src/lib/cloudinary";

const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/**
 * Best-effort: deletes the given Cloudinary images unless another post still
 * references them. Never throws — a failed cleanup must not fail a save/delete.
 */
export async function deleteUnusedImages(publicIds: Iterable<string>, excludePostId: string) {
  for (const id of publicIds) {
    try {
      const rx = new RegExp(`/${escapeRegex(id)}(\\.[a-z0-9]+)?(["'?]|$)`, "i");
      const stillUsed = await Blog.exists({
        _id: { $ne: excludePostId },
        $or: [{ coverImage: rx }, { content: rx }],
      });
      if (!stillUsed) await destroyImage(id);
    } catch (error) {
      console.error("Cloudinary cleanup failed:", error);
    }
  }
}
