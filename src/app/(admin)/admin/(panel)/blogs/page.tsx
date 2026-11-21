"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ErrorNote,
  PageHeader,
  Pagination,
  Pill,
  RowChevron,
  SearchInput,
  Tabs,
  btnPrimary,
  readQueryParam,
  thCls,
  timeAgo,
} from "@/src/components/admin/shared";
import type { Post, PostStatus } from "@/src/types/blog";

type Filter = "" | PostStatus;
const LIMIT = 12;

function PostPill({ status }: { status: PostStatus }) {
  return status === "PUBLISHED" ? (
    <Pill tone="green">
      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
      Published
    </Pill>
  ) : (
    <Pill>
      <span className="h-1.5 w-1.5 rounded-full bg-ink-faint" />
      Draft
    </Pill>
  );
}

export default function BlogsPage() {
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<Filter>("");
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Preserve backward compatibility if dashboard links to /admin/blogs?new=1
  useEffect(() => {
    if (readQueryParam("new")) {
      router.replace("/admin/blogs/new");
    }
  }, [router]);

  useEffect(() => {
    const t = setTimeout(() => {
      setQuery(search.trim());
      setPage(1);
    }, 300);
    return () => clearTimeout(t);
  }, [search]);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams({ page: String(page), limit: String(LIMIT) });
      if (status) params.set("status", status);
      if (query) params.set("query", query);
      const res = await fetch(`/api/blog?${params}`);
      if (!res.ok) throw new Error("failed");
      const json = await res.json();
      setPosts(json.data);
      setTotal(json.total);
      setTotalPages(json.totalPages);
    } catch {
      setError("Could not load posts.");
    } finally {
      setLoading(false);
    }
  }, [page, status, query]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div>
      <PageHeader
        breadcrumb={[{ label: "Workspace", href: "/admin" }, { label: "Blogs" }]}
        title="Blogs"
        badge={
          <Pill>
            {total} {status ? (status === "PUBLISHED" ? "published" : "drafts") : "posts"}
          </Pill>
        }
        description="Write and publish the posts that appear on your site."
        actions={
          <Link href="/admin/blogs/new" className={btnPrimary}>
            New post
          </Link>
        }
      />

      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <Tabs
          label="Filter posts by status"
          tabs={[
            { value: "" as Filter, label: "All" },
            { value: "PUBLISHED" as Filter, label: "Published" },
            { value: "DRAFT" as Filter, label: "Drafts" },
          ]}
          value={status}
          onChange={(v) => {
            setStatus(v);
            setPage(1);
          }}
        />
        <SearchInput value={search} onChange={setSearch} placeholder="Search title or author" />
      </div>

      {error && <ErrorNote message={error} onRetry={load} />}

      <section className="overflow-hidden rounded-2xl border border-line bg-white">
        <div className="overflow-x-auto">
          <table className="w-full min-w-160 text-left text-sm">
            <thead className="border-b border-line">
              <tr>
                <th scope="col" className={thCls}>Post</th>
                <th scope="col" className={thCls}>Author</th>
                <th scope="col" className={thCls}>Status</th>
                <th scope="col" className={thCls}>Updated</th>
                <th scope="col" className="w-10" aria-label="Edit" />
              </tr>
            </thead>
            <tbody className={`divide-y divide-line ${loading && posts.length ? "opacity-60" : ""}`}>
              {loading && !posts.length ? (
                Array.from({ length: 4 }, (_, i) => (
                  <tr key={i}>
                    <td colSpan={5} className="px-5 py-4">
                      <div className="h-5 animate-pulse rounded bg-canvas" />
                    </td>
                  </tr>
                ))
              ) : !posts.length ? (
                <tr>
                  <td colSpan={5} className="px-5 py-16 text-center">
                    <div className="text-sm font-medium text-ink">
                      {query || status ? "No posts match" : "No posts yet"}
                    </div>
                    <div className="mt-1 text-sm text-ink-soft">
                      {query || status ? (
                        "Clear the search or pick another filter."
                      ) : (
                        <Link
                          href="/admin/blogs/new"
                          className="font-medium text-ink underline underline-offset-2"
                        >
                          Write your first post
                        </Link>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                posts.map((p) => (
                  <tr
                    key={p._id}
                    onClick={() => router.push(`/admin/blogs/${p._id}`)}
                    className="group cursor-pointer transition-colors hover:bg-canvas/70"
                  >
                    <td className="max-w-md px-5 py-3">
                      <Link
                        href={`/admin/blogs/${p._id}`}
                        onClick={(e) => e.stopPropagation()}
                        className="block max-w-full truncate text-left font-medium text-ink focus-visible:underline"
                      >
                        {p.title}
                      </Link>
                      <div className="truncate text-xs text-ink-faint">/blogs/{p.slug}</div>
                    </td>
                    <td className="px-5 py-3 text-ink-soft">{p.author}</td>
                    <td className="px-5 py-3">
                      <PostPill status={p.status} />
                    </td>
                    <td className="whitespace-nowrap px-5 py-3 text-ink-soft">
                      {timeAgo(p.updatedAt)}
                    </td>
                    <td className="pr-4">
                      <RowChevron />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <Pagination page={page} totalPages={totalPages} total={total} limit={LIMIT} onPage={setPage} />
      </section>
    </div>
  );
}