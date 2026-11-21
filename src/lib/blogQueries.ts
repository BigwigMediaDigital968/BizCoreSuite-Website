import { connection } from "next/server";
import { connectDB } from "@/src/db/connect";
import { Blog } from "@/src/db/models/Blog";
import type { Faq } from "@/src/lib/faqs";

/** Published-post shape used by the public blog pages. */
export interface PublicPost {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  author: string;
  coverImage?: string;
  coverImageAlt?: string;
  metaTitle?: string;
  metaDescription?: string;
  tags?: string[];
  faqs?: Faq[];
  publishedAt?: Date;
  createdAt: Date;
  updatedAt?: Date;
}

export type PostSummary = Omit<PublicPost, "content">;

const SUMMARY_FIELDS = { content: 0, faqs: 0 };
const BY_NEWEST = { publishedAt: -1, createdAt: -1 } as const;

/** Latest published posts, optionally filtered by tag. Returns null if the DB is unreachable. */
export async function listPublishedPosts(tag?: string): Promise<PostSummary[] | null> {
  await connection(); // render per request so newly published posts show up immediately
  try {
    await connectDB();
    const filter: Record<string, unknown> = { status: "PUBLISHED" };
    if (tag) filter.tags = tag;
    return (await Blog.find(filter, SUMMARY_FIELDS).sort(BY_NEWEST).limit(60).lean()) as unknown as PostSummary[];
  } catch (error) {
    console.error("Blog: failed to load posts", error);
    return null;
  }
}

/** Most-used tags across published posts, for the filter row. */
export async function listPopularTags(limit = 10): Promise<{ tag: string; count: number }[]> {
  await connection();
  try {
    await connectDB();
    const rows = await Blog.aggregate<{ _id: string; count: number }>([
      { $match: { status: "PUBLISHED" } },
      { $unwind: "$tags" },
      { $group: { _id: "$tags", count: { $sum: 1 } } },
      { $sort: { count: -1, _id: 1 } },
      { $limit: limit },
    ]);
    return rows.map((r) => ({ tag: r._id, count: r.count }));
  } catch (error) {
    console.error("Blog: failed to load tags", error);
    return [];
  }
}

export async function getPublishedPost(slug: string): Promise<PublicPost | null> {
  await connection();
  await connectDB();
  return (await Blog.findOne({ slug: slug.toLowerCase(), status: "PUBLISHED" }).lean()) as unknown as PublicPost | null;
}

/** Up to `limit` other posts, preferring ones that share a tag, topped up with the newest. */
export async function getRelatedPosts(post: Pick<PublicPost, "slug" | "tags">, limit = 3): Promise<PostSummary[]> {
  try {
    await connectDB();
    const base = { status: "PUBLISHED" as const, slug: { $ne: post.slug } };
    const related = post.tags?.length
      ? ((await Blog.find({ ...base, tags: { $in: post.tags } }, SUMMARY_FIELDS).sort(BY_NEWEST).limit(limit).lean()) as unknown as PostSummary[])
      : [];
    if (related.length >= limit) return related;

    const have = new Set([post.slug, ...related.map((r) => r.slug)]);
    const more = (await Blog.find({ status: "PUBLISHED", slug: { $nin: [...have] } }, SUMMARY_FIELDS)
      .sort(BY_NEWEST)
      .limit(limit - related.length)
      .lean()) as unknown as PostSummary[];
    return [...related, ...more];
  } catch (error) {
    console.error("Blog: failed to load related posts", error);
    return [];
  }
}
