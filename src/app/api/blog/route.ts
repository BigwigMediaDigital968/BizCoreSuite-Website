import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { connectDB } from "@/src/db/connect";
import { Blog } from "@/src/db/models/Blog";
import { ADMIN_COOKIE, verifySessionToken } from "@/src/utils/adminSession";

const STATUSES = ["DRAFT", "PUBLISHED"];
const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const slugify = (s: string) =>
  s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);

/**
 * GET /api/blog?query=&status=&page=&limit=
 * Public callers only ever see PUBLISHED posts; signed-in admins see everything.
 */
export async function GET(request: Request) {
  try {
    await connectDB();
    const authed = await verifySessionToken((await cookies()).get(ADMIN_COOKIE)?.value);

    const { searchParams } = new URL(request.url);
    const query = searchParams.get("query")?.trim();
    const status = searchParams.get("status")?.toUpperCase();
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") ?? "20", 10) || 20));

    if (status && !STATUSES.includes(status)) {
      return NextResponse.json({ error: `Invalid status. Use one of: ${STATUSES.join(", ")}` }, { status: 400 });
    }

    const filter: Record<string, unknown> = {};
    if (!authed) filter.status = "PUBLISHED";
    else if (status) filter.status = status;
    if (query) {
      const rx = new RegExp(escapeRegex(query), "i");
      filter.$or = [{ title: rx }, { excerpt: rx }, { author: rx }];
    }

    const projection = authed ? {} : { content: 0 };
    const [posts, total] = await Promise.all([
      Blog.find(filter, projection).sort({ updatedAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
      Blog.countDocuments(filter),
    ]);

    return NextResponse.json({ data: posts, page, limit, total, totalPages: Math.ceil(total / limit) });
  } catch (error) {
    console.error("GET /api/blog failed:", error);
    return NextResponse.json({ error: "Failed to fetch posts" }, { status: 500 });
  }
}

/** POST /api/blog — admin only (enforced in proxy.ts) */
export async function POST(req: Request) {
  try {
    await connectDB();
    let body: Record<string, unknown>;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const title = String(body.title ?? "").trim();
    if (!title) return NextResponse.json({ error: "Title is required" }, { status: 400 });

    const slug = slugify(String(body.slug || title));
    if (!slug) return NextResponse.json({ error: "Slug is invalid" }, { status: 400 });

    const status: "DRAFT" | "PUBLISHED" = body.status === "PUBLISHED" ? "PUBLISHED" : "DRAFT";
    const post = await Blog.create({
      title,
      slug,
      excerpt: String(body.excerpt ?? ""),
      content: String(body.content ?? ""),
      author: String(body.author ?? "").trim() || undefined,
      status,
      publishedAt: status === "PUBLISHED" ? new Date() : undefined,
    });
    return NextResponse.json(post, { status: 201 });
  } catch (error: unknown) {
    if ((error as { code?: number })?.code === 11000) {
      return NextResponse.json({ error: "A post with this slug already exists" }, { status: 409 });
    }
    console.error("POST /api/blog failed:", error);
    return NextResponse.json({ error: "Failed to create post" }, { status: 500 });
  }
}
