import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/src/db/connect";
import { Blog } from "@/src/db/models/Blog";

const STATUSES = ["DRAFT", "PUBLISHED"];
const EDITABLE = ["title", "slug", "excerpt", "content", "author", "status"];
const slugify = (s: string) =>
  s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80);

type Ctx = { params: Promise<{ id: string }> };

async function resolveId(ctx: Ctx) {
  const { id } = await ctx.params;
  return mongoose.isValidObjectId(id) ? id : null;
}

export async function GET(_req: Request, ctx: Ctx) {
  try {
    const id = await resolveId(ctx);
    if (!id) return NextResponse.json({ error: "Invalid post id" }, { status: 400 });
    await connectDB();
    const post = await Blog.findById(id).lean();
    if (!post) return NextResponse.json({ error: "Post not found" }, { status: 404 });
    return NextResponse.json(post);
  } catch (error) {
    console.error("GET /api/blog/[id] failed:", error);
    return NextResponse.json({ error: "Failed to fetch post" }, { status: 500 });
  }
}

export async function PATCH(req: Request, ctx: Ctx) {
  try {
    const id = await resolveId(ctx);
    if (!id) return NextResponse.json({ error: "Invalid post id" }, { status: 400 });

    let body: Record<string, unknown>;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const update: Record<string, unknown> = {};
    for (const key of EDITABLE) if (body[key] !== undefined) update[key] = body[key];
    if (!Object.keys(update).length) {
      return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
    }
    if (update.title !== undefined && !String(update.title).trim()) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }
    if (update.slug !== undefined) {
      update.slug = slugify(String(update.slug));
      if (!update.slug) return NextResponse.json({ error: "Slug is invalid" }, { status: 400 });
    }
    if (update.status !== undefined && !STATUSES.includes(String(update.status))) {
      return NextResponse.json({ error: `Invalid status. Use one of: ${STATUSES.join(", ")}` }, { status: 400 });
    }

    await connectDB();
    // Stamp publishedAt the first time a post goes live
    if (update.status === "PUBLISHED") {
      const existing = await Blog.findById(id, { publishedAt: 1 }).lean();
      if (existing && !existing.publishedAt) update.publishedAt = new Date();
    }
    const post = await Blog.findByIdAndUpdate(id, update, { new: true, runValidators: true }).lean();
    if (!post) return NextResponse.json({ error: "Post not found" }, { status: 404 });
    return NextResponse.json(post);
  } catch (error: unknown) {
    if ((error as { code?: number })?.code === 11000) {
      return NextResponse.json({ error: "A post with this slug already exists" }, { status: 409 });
    }
    console.error("PATCH /api/blog/[id] failed:", error);
    return NextResponse.json({ error: "Failed to update post" }, { status: 500 });
  }
}

export async function DELETE(_req: Request, ctx: Ctx) {
  try {
    const id = await resolveId(ctx);
    if (!id) return NextResponse.json({ error: "Invalid post id" }, { status: 400 });
    await connectDB();
    const post = await Blog.findByIdAndDelete(id).lean();
    if (!post) return NextResponse.json({ error: "Post not found" }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/blog/[id] failed:", error);
    return NextResponse.json({ error: "Failed to delete post" }, { status: 500 });
  }
}
