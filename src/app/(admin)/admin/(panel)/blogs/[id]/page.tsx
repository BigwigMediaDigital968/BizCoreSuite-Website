"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ErrorNote } from "@/src/components/admin/shared";
import type { Post } from "@/src/types/blog";
import BlogPostForm from "@/src/components/admin/BlogPostForm";

export default function EditBlogPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;
    let active = true;

    async function fetchPost() {
      setLoading(true);
      setError("");
      try {
        const res = await fetch(`/api/blog/${id}`);
        if (res.status === 401) {
          router.replace("/admin/login");
          return;
        }
        if (!res.ok) throw new Error("Not found");
        const json = await res.json();
        if (active) setPost(json.data || json);
      } catch {
        if (active) setError("Could not load this blog post.");
      } finally {
        if (active) setLoading(false);
      }
    }

    fetchPost();
    return () => {
      active = false;
    };
  }, [id, router]);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-10 w-64 animate-pulse rounded-xl bg-canvas" />
        <div className="h-96 animate-pulse rounded-2xl bg-canvas" />
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="space-y-4">
        <ErrorNote message={error || "Post not found."} onRetry={() => router.refresh()} />
      </div>
    );
  }

  return <BlogPostForm initialPost={post} />;
}