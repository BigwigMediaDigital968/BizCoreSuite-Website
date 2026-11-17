"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  ErrorNote,
  PageHeader,
  Pagination,
  Pill,
  RowChevron,
  SearchInput,
  SlideOver,
  Tabs,
  btnDanger,
  btnPrimary,
  btnSecondary,
  inputCls,
  readQueryParam,
  thCls,
  timeAgo,
} from "@/src/components/admin/shared";

type PostStatus = "DRAFT" | "PUBLISHED";
type Filter = "" | PostStatus;

interface Post {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  author: string;
  status: PostStatus;
  updatedAt: string;
  publishedAt?: string;
}

const LIMIT = 12;
const EMPTY = { title: "", slug: "", excerpt: "", content: "", author: "", status: "DRAFT" as PostStatus };

const slugify = (s: string) => s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80);

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

  // Slide-over editor: null = closed, "new" = create, Post = edit
  const [editing, setEditing] = useState<null | "new" | Post>(null);
  const [form, setForm] = useState(EMPTY);
  const [slugTouched, setSlugTouched] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);

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

  const openNew = useCallback(() => {
    setForm(EMPTY);
    setSlugTouched(false);
    setFormError("");
    setEditing("new");
  }, []);

  // Dashboard "New post" links here with ?new=1
  useEffect(() => {
    if (readQueryParam("new")) {
      openNew();
      router.replace("/admin/blogs");
    }
  }, [openNew, router]);

  const close = useCallback(() => {
    setEditing(null);
    setConfirmDelete(false);
    setFormError("");
  }, []);

  function openEdit(p: Post) {
    setForm({ title: p.title, slug: p.slug, excerpt: p.excerpt, content: p.content, author: p.author, status: p.status });
    setSlugTouched(true);
    setFormError("");
    setEditing(p);
  }

  async function save(e: FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) return setFormError("Add a title before saving.");
    setSaving(true);
    setFormError("");
    try {
      const isNew = editing === "new";
      const res = await fetch(isNew ? "/api/blog" : `/api/blog/${(editing as Post)._id}`, {
        method: isNew ? "POST" : "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.status === 401) return router.replace("/admin/login");
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        return setFormError(data.error || "Could not save the post.");
      }
      close();
      load();
    } catch {
      setFormError("Network error. Check your connection and try again.");
    } finally {
      setSaving(false);
    }
  }

  async function remove(p: Post) {
    const res = await fetch(`/api/blog/${p._id}`, { method: "DELETE" });
    if (!res.ok) return setFormError("Could not delete the post.");
    close();
    load();
  }

  const set = (k: keyof typeof EMPTY, v: string) => setForm((f) => ({ ...f, [k]: v }));
  const isEdit = !!editing && editing !== "new";

  return (
    <div>
      <PageHeader
        breadcrumb={[{ label: "Workspace", href: "/admin" }, { label: "Blogs" }]}
        title="Blogs"
        badge={<Pill>{total} {status ? (status === "PUBLISHED" ? "published" : "drafts") : "posts"}</Pill>}
        description="Write and publish the posts that appear on your site."
        actions={
          <button onClick={openNew} className={btnPrimary}>
            New post
          </button>
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
                    <div className="text-sm font-medium text-ink">{query || status ? "No posts match" : "No posts yet"}</div>
                    <div className="mt-1 text-sm text-ink-soft">
                      {query || status ? (
                        "Clear the search or pick another filter."
                      ) : (
                        <button onClick={openNew} className="font-medium text-ink underline underline-offset-2">
                          Write your first post
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                posts.map((p) => (
                  <tr key={p._id} onClick={() => openEdit(p)} className="group cursor-pointer transition-colors hover:bg-canvas/70">
                    <td className="max-w-md px-5 py-3">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openEdit(p);
                        }}
                        className="block max-w-full truncate text-left font-medium text-ink focus-visible:underline"
                      >
                        {p.title}
                      </button>
                      <div className="truncate text-xs text-ink-faint">/blogs/{p.slug}</div>
                    </td>
                    <td className="px-5 py-3 text-ink-soft">{p.author}</td>
                    <td className="px-5 py-3">
                      <PostPill status={p.status} />
                    </td>
                    <td className="whitespace-nowrap px-5 py-3 text-ink-soft">{timeAgo(p.updatedAt)}</td>
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

      <SlideOver open={!!editing} title={isEdit ? "Edit post" : "New post"} onClose={close}>
        <form onSubmit={save} className="space-y-4" noValidate>
          <div>
            <label htmlFor="p-title" className="mb-1.5 block text-[13px] text-ink-soft">Title</label>
            <input
              id="p-title"
              value={form.title}
              onChange={(e) => {
                set("title", e.target.value);
                if (!slugTouched) set("slug", slugify(e.target.value));
              }}
              className={`${inputCls} text-base font-medium`}
            />
          </div>
          <div>
            <label htmlFor="p-slug" className="mb-1.5 block text-[13px] text-ink-soft">Web address</label>
            <div className="flex items-center rounded-lg border border-line bg-white transition focus-within:border-ink/40 focus-within:ring-4 focus-within:ring-ink/5">
              <span className="pl-3 text-sm text-ink-faint">/blogs/</span>
              <input
                id="p-slug"
                value={form.slug}
                onChange={(e) => {
                  setSlugTouched(true);
                  set("slug", slugify(e.target.value));
                }}
                className="w-full bg-transparent px-1 py-2 text-sm text-ink outline-none"
              />
            </div>
          </div>
          <div>
            <label htmlFor="p-excerpt" className="mb-1.5 block text-[13px] text-ink-soft">Summary</label>
            <textarea id="p-excerpt" rows={2} value={form.excerpt} onChange={(e) => set("excerpt", e.target.value)} className={inputCls} />
          </div>
          <div>
            <label htmlFor="p-content" className="mb-1.5 block text-[13px] text-ink-soft">Content</label>
            <textarea id="p-content" rows={12} value={form.content} onChange={(e) => set("content", e.target.value)} className={`${inputCls} leading-relaxed`} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="p-author" className="mb-1.5 block text-[13px] text-ink-soft">Author</label>
              <input id="p-author" value={form.author} onChange={(e) => set("author", e.target.value)} placeholder="BizCore Team" className={inputCls} />
            </div>
            <div>
              <label htmlFor="p-status" className="mb-1.5 block text-[13px] text-ink-soft">Status</label>
              <select id="p-status" value={form.status} onChange={(e) => set("status", e.target.value)} className={inputCls}>
                <option value="DRAFT">Draft</option>
                <option value="PUBLISHED">Published</option>
              </select>
            </div>
          </div>

          {formError && (
            <p role="alert" className="rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-800">
              {formError}
            </p>
          )}

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4">
            {isEdit ? (
              confirmDelete ? (
                <div className="flex items-center gap-3 text-sm">
                  <span className="text-ink-soft">Delete this post?</span>
                  <button type="button" onClick={() => remove(editing as Post)} className="font-semibold text-rose-700 hover:underline">
                    Delete post
                  </button>
                  <button type="button" onClick={() => setConfirmDelete(false)} className="text-ink-soft hover:underline">
                    Keep
                  </button>
                </div>
              ) : (
                <button type="button" onClick={() => setConfirmDelete(true)} className={btnDanger}>
                  Delete post
                </button>
              )
            ) : (
              <span />
            )}
            <div className="flex gap-2">
              <button type="button" onClick={close} className={btnSecondary}>
                Cancel
              </button>
              <button type="submit" disabled={saving} className={btnPrimary}>
                {saving ? "Saving…" : isEdit ? "Save changes" : form.status === "PUBLISHED" ? "Publish post" : "Save draft"}
              </button>
            </div>
          </div>
        </form>
      </SlideOver>
    </div>
  );
}
