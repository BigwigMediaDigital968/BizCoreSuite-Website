"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { ArrowDown, ArrowLeft, ArrowUp, ImagePlus, Loader2, Plus, Trash2 } from "lucide-react";
import {
  btnDanger,
  btnPrimary,
  btnSecondary,
  inputCls,
} from "@/src/components/admin/shared";
import SeoEditor from "./editor/SeoEditor";
import { uploadImage } from "@/src/lib/uploadImage";
import type { Faq, Post, PostFormValues, PostStatus } from "@/src/types/blog";

const SITE_DOMAIN = "yourdomain.com"; // Replace with your production domain

const slugify = (s: string) =>
  s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);

function toFormValues(post?: Post | null): PostFormValues {
  if (!post) {
    return {
      title: "",
      slug: "",
      excerpt: "",
      content: "",
      author: "",
      status: "DRAFT",
      coverImage: "",
      coverImageAlt: "",
      metaTitle: "",
      metaDescription: "",
      tagsInput: "",
      faqs: [],
    };
  }
  return {
    title: post.title || "",
    slug: post.slug || "",
    excerpt: post.excerpt || "",
    content: post.content || "",
    author: post.author || "",
    status: post.status || "DRAFT",
    coverImage: post.coverImage || "",
    coverImageAlt: post.coverImageAlt || "",
    metaTitle: post.metaTitle || "",
    metaDescription: post.metaDescription || "",
    tagsInput: Array.isArray(post.tags) ? post.tags.join(", ") : "",
    faqs: Array.isArray(post.faqs) ? post.faqs.map((f) => ({ question: f.question, answer: f.answer })) : [],
  };
}

interface BlogPostFormProps {
  /** Pass an existing Post to enter Edit mode; omit or pass null for Create mode */
  initialPost?: Post | null;
  /** Optional custom navigation after save/delete (defaults to /admin/blogs) */
  onSuccess?: (savedPost?: Post) => void;
  /** Optional custom cancel/back handler (defaults to /admin/blogs) */
  onCancel?: () => void;
}

export default function BlogPostForm({
  initialPost = null,
  onSuccess,
  onCancel,
}: BlogPostFormProps) {
  const router = useRouter();
  const coverInputRef = useRef<HTMLInputElement>(null);

  const isEdit = Boolean(initialPost?._id);
  const [form, setForm] = useState<PostFormValues>(() => toFormValues(initialPost));
  const [slugTouched, setSlugTouched] = useState<boolean>(isEdit);
  const [saving, setSaving] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [formError, setFormError] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);

  // Warn before leaving the tab with unsaved edits
  const [initialSnapshot] = useState(() => JSON.stringify(form));
  const dirty = JSON.stringify(form) !== initialSnapshot;
  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  const set = <K extends keyof PostFormValues>(k: K, v: PostFormValues[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const addFaq = () => setForm((f) => ({ ...f, faqs: [...f.faqs, { question: "", answer: "" }] }));
  const updateFaq = (i: number, patch: Partial<Faq>) =>
    setForm((f) => ({ ...f, faqs: f.faqs.map((q, idx) => (idx === i ? { ...q, ...patch } : q)) }));
  const removeFaq = (i: number) =>
    setForm((f) => ({ ...f, faqs: f.faqs.filter((_, idx) => idx !== i) }));
  const moveFaq = (i: number, dir: -1 | 1) =>
    setForm((f) => {
      const j = i + dir;
      if (j < 0 || j >= f.faqs.length) return f;
      const next = [...f.faqs];
      [next[i], next[j]] = [next[j], next[i]];
      return { ...f, faqs: next };
    });
  const incompleteFaqs = form.faqs.filter((f) => !f.question.trim() || !f.answer.trim()).length;

  const handleBack = () => {
    if (onCancel) return onCancel();
    router.push("/admin/blogs");
  };

  async function handleCoverUpload(file: File) {
    setUploadingCover(true);
    setFormError("");
    try {
      const url = await uploadImage(file);
      setForm((f) => ({
        ...f,
        coverImage: url,
        coverImageAlt: f.coverImageAlt || f.title,
      }));
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Cover image upload failed.");
    } finally {
      setUploadingCover(false);
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) return setFormError("Add a title before saving.");

    setSaving(true);
    setFormError("");
    try {
      const payload = {
        title: form.title.trim(),
        slug: form.slug.trim() || slugify(form.title),
        excerpt: form.excerpt.trim(),
        content: form.content,
        author: form.author.trim(),
        status: form.status,
        coverImage: form.coverImage,
        coverImageAlt: form.coverImageAlt.trim(),
        metaTitle: form.metaTitle.trim() || form.title.trim(),
        metaDescription: form.metaDescription.trim() || form.excerpt.trim(),
        tags: form.tagsInput
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
        // incomplete rows are dropped server-side too
        faqs: form.faqs
          .map((f) => ({ question: f.question.trim(), answer: f.answer.trim() }))
          .filter((f) => f.question && f.answer),
      };

      const endpoint = isEdit ? `/api/blog/${initialPost!._id}` : "/api/blog";
      const res = await fetch(endpoint, {
        method: isEdit ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.status === 401) return router.replace("/admin/login");
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        return setFormError(data.error || "Could not save the post.");
      }

      const json = await res.json().catch(() => ({}));
      if (onSuccess) {
        onSuccess(json.data || json);
      } else {
        router.push("/admin/blogs");
        router.refresh();
      }
    } catch {
      setFormError("Network error. Check your connection and try again.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!initialPost?._id) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/blog/${initialPost._id}`, { method: "DELETE" });
      if (res.status === 401) return router.replace("/admin/login");
      if (!res.ok) return setFormError("Could not delete the post.");

      if (onSuccess) {
        onSuccess();
      } else {
        router.push("/admin/blogs");
        router.refresh();
      }
    } catch {
      setFormError("Network error while deleting post.");
    } finally {
      setSaving(false);
    }
  }

  const serpTitle = (form.metaTitle || form.title || "Your Blog Post Title").slice(0, 65);
  const serpDesc = (
    form.metaDescription ||
    form.excerpt ||
    "Write a compelling meta description between 120–160 characters to improve click-through rates from Google."
  ).slice(0, 165);
  const metaTitleLen = (form.metaTitle || form.title).length;
  const metaDescLen = (form.metaDescription || form.excerpt).length;

  return (
    <form onSubmit={handleSubmit} noValidate className="pb-16">
      {/* Top Sticky Action Bar */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-line pb-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleBack}
            className="flex items-center gap-1.5 rounded-lg border border-line bg-white px-3 py-1.5 text-sm font-medium text-ink-soft hover:text-ink"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to posts
          </button>
          <div>
            <h1 className="text-lg font-semibold text-ink">
              {isEdit ? "Edit post" : "New post"}
            </h1>
            <p className="text-xs text-ink-faint">/blogs/{form.slug || "untitled"}</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {isEdit &&
            (confirmDelete ? (
              <div className="flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs">
                <span className="text-rose-800">Delete permanently?</span>
                <button
                  type="button"
                  disabled={saving}
                  onClick={handleDelete}
                  className="font-semibold text-rose-700 underline"
                >
                  Yes, delete
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmDelete(false)}
                  className="text-ink-soft"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmDelete(true)}
                className={btnDanger}
              >
                Delete
              </button>
            ))}

          <button type="button" onClick={handleBack} className={btnSecondary}>
            Cancel
          </button>
          <button type="submit" disabled={saving || uploadingCover} className={btnPrimary}>
            {saving
              ? "Saving…"
              : isEdit
              ? "Save changes"
              : form.status === "PUBLISHED"
              ? "Publish post"
              : "Save draft"}
          </button>
        </div>
      </div>

      {formError && (
        <p role="alert" className="mb-5 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-800">
          {formError}
        </p>
      )}

      {/* Two-Column Full-Page Layout */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
        {/* Left Main Writing Canvas (8 cols) */}
        <div className="space-y-5 xl:col-span-8">
          <div className="space-y-4 rounded-2xl border border-line bg-white p-5">
            <div>
              <label htmlFor="p-title" className="mb-1.5 block text-[13px] font-medium text-ink-soft">
                Post Title (H1)
              </label>
              <input
                id="p-title"
                value={form.title}
                placeholder="Enter a clear, keyword-rich post title…"
                onChange={(e) => {
                  set("title", e.target.value);
                  if (!slugTouched) set("slug", slugify(e.target.value));
                }}
                className={`${inputCls} text-lg font-semibold`}
              />
            </div>

            <div>
              <label htmlFor="p-slug" className="mb-1.5 block text-[13px] font-medium text-ink-soft">
                URL Slug
              </label>
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
              <label htmlFor="p-excerpt" className="mb-1.5 block text-[13px] font-medium text-ink-soft">
                Excerpt / Summary
              </label>
              <textarea
                id="p-excerpt"
                rows={2}
                value={form.excerpt}
                placeholder="Short summary shown on blog cards and feeds…"
                onChange={(e) => set("excerpt", e.target.value)}
                className={inputCls}
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-[13px] font-medium text-ink-soft">
              Article Content
            </label>
            <SeoEditor value={form.content} onChange={(html) => set("content", html)} />
          </div>

          {/* FAQs */}
          <div className="space-y-4 rounded-2xl border border-line bg-white p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-sm font-semibold text-ink">
                  Frequently Asked Questions
                  {form.faqs.length > 0 && (
                    <span className="ml-2 text-xs font-normal text-ink-faint">{form.faqs.length}</span>
                  )}
                </h2>
                <p className="mt-0.5 text-xs text-ink-faint">
                  Shown at the end of the post and eligible for Google FAQ rich results.
                </p>
              </div>
              <button
                type="button"
                onClick={addFaq}
                className="flex shrink-0 items-center gap-1.5 rounded-lg border border-line bg-white px-3 py-1.5 text-xs font-medium text-ink hover:bg-canvas"
              >
                <Plus className="h-3.5 w-3.5" />
                Add FAQ
              </button>
            </div>

            {form.faqs.length === 0 ? (
              <button
                type="button"
                onClick={addFaq}
                className="w-full rounded-xl border border-dashed border-line bg-canvas/40 py-6 text-xs text-ink-soft transition hover:border-ink/40 hover:text-ink"
              >
                No FAQs yet. Add the first question.
              </button>
            ) : (
              <ul className="space-y-3">
                {form.faqs.map((faq, i) => {
                  const incomplete = !faq.question.trim() || !faq.answer.trim();
                  return (
                    <li
                      key={i}
                      className={`rounded-xl border p-3 ${incomplete ? "border-amber-300 bg-amber-50/40" : "border-line bg-canvas/30"}`}
                    >
                      <div className="mb-2 flex items-center justify-between">
                        <span className="text-xs font-semibold text-ink-soft">Question {i + 1}</span>
                        <div className="flex items-center gap-0.5">
                          <button
                            type="button"
                            disabled={i === 0}
                            onClick={() => moveFaq(i, -1)}
                            title="Move up"
                            className="rounded-md p-1 text-ink-soft hover:bg-canvas disabled:opacity-30"
                          >
                            <ArrowUp className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            disabled={i === form.faqs.length - 1}
                            onClick={() => moveFaq(i, 1)}
                            title="Move down"
                            className="rounded-md p-1 text-ink-soft hover:bg-canvas disabled:opacity-30"
                          >
                            <ArrowDown className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => removeFaq(i)}
                            title="Remove FAQ"
                            className="rounded-md p-1 text-rose-700 hover:bg-rose-50"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                      <input
                        value={faq.question}
                        maxLength={300}
                        onChange={(e) => updateFaq(i, { question: e.target.value })}
                        placeholder="Question, e.g. How does X work?"
                        aria-label={`FAQ ${i + 1} question`}
                        className={`${inputCls} mb-2 font-medium`}
                      />
                      <textarea
                        rows={3}
                        value={faq.answer}
                        maxLength={3000}
                        onChange={(e) => updateFaq(i, { answer: e.target.value })}
                        placeholder="Answer in plain text…"
                        aria-label={`FAQ ${i + 1} answer`}
                        className={inputCls}
                      />
                    </li>
                  );
                })}
              </ul>
            )}

            {incompleteFaqs > 0 && (
              <p className="text-xs text-amber-700">
                {incompleteFaqs} FAQ{incompleteFaqs > 1 ? "s are" : " is"} missing a question or answer and
                won&apos;t be saved.
              </p>
            )}
          </div>
        </div>

        {/* Right SEO & Publishing Sidebar (4 cols) */}
        <aside className="space-y-5 xl:col-span-4">
          {/* Publishing */}
          <div className="space-y-4 rounded-2xl border border-line bg-white p-5">
            <h2 className="text-sm font-semibold text-ink">Publishing</h2>
            <div>
              <label htmlFor="p-status" className="mb-1.5 block text-[13px] text-ink-soft">
                Status
              </label>
              <select
                id="p-status"
                value={form.status}
                onChange={(e) => set("status", e.target.value as PostStatus)}
                className={inputCls}
              >
                <option value="DRAFT">Draft</option>
                <option value="PUBLISHED">Published</option>
              </select>
            </div>
            <div>
              <label htmlFor="p-author" className="mb-1.5 block text-[13px] text-ink-soft">
                Author
              </label>
              <input
                id="p-author"
                value={form.author}
                onChange={(e) => set("author", e.target.value)}
                placeholder="BizCore Team"
                className={inputCls}
              />
            </div>
            
          </div>

          {/* Featured Image */}
          <div className="space-y-3 rounded-2xl border border-line bg-white p-5">
            <h2 className="text-sm font-semibold text-ink">Featured Image (Cloudinary)</h2>
            {form.coverImage ? (
              <div className="space-y-3">
                <div className="relative overflow-hidden rounded-xl border border-line">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={form.coverImage}
                    alt={form.coverImageAlt}
                    className="h-44 w-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      set("coverImage", "");
                      set("coverImageAlt", "");
                    }}
                    className="absolute right-2 top-2 rounded-lg bg-white/90 p-1.5 text-rose-700 shadow hover:bg-white"
                    title="Remove cover image"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-ink-soft">
                    Cover Image Alt Text (SEO)
                  </label>
                  <input
                    value={form.coverImageAlt}
                    onChange={(e) => set("coverImageAlt", e.target.value)}
                    placeholder="Describe the featured image…"
                    className={inputCls}
                  />
                </div>
              </div>
            ) : (
              <button
                type="button"
                disabled={uploadingCover}
                onClick={() => coverInputRef.current?.click()}
                className="flex w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-line bg-canvas/40 py-8 text-xs text-ink-soft transition hover:border-ink/40 hover:text-ink"
              >
                {uploadingCover ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <ImagePlus className="h-5 w-5" />
                )}
                <span>{uploadingCover ? "Uploading to Cloudinary…" : "Upload cover image"}</span>
              </button>
            )}
            <input
              ref={coverInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleCoverUpload(f);
                e.target.value = "";
              }}
            />
          </div>

          {/* Google SERP Preview & Meta Tags */}
          <div className="space-y-4 rounded-2xl border border-line bg-white p-5">
            <h2 className="text-sm font-semibold text-ink">Search Engine Optimization (SERP)</h2>

            <div className="rounded-xl border border-line bg-canvas/40 p-3.5">
              <div className="text-[11px] text-ink-faint">
                https://{SITE_DOMAIN} › blogs › {form.slug || "your-post-slug"}
              </div>
              <div className="mt-0.5 line-clamp-1 text-base font-medium text-[#1a0dab]">
                {serpTitle}
              </div>
              <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-[#4d5156]">
                {serpDesc}
              </p>
            </div>

            <div>
              <div className="mb-1 flex items-center justify-between text-xs">
                <label htmlFor="p-meta-title" className="text-ink-soft">
                  Meta Title
                </label>
                <span className={metaTitleLen > 60 ? "font-medium text-amber-600" : "text-ink-faint"}>
                  {metaTitleLen}/60
                </span>
              </div>
              <input
                id="p-meta-title"
                value={form.metaTitle}
                onChange={(e) => set("metaTitle", e.target.value)}
                placeholder={form.title || "Custom SEO title tag…"}
                className={inputCls}
              />
            </div>

            <div>
              <div className="mb-1 flex items-center justify-between text-xs">
                <label htmlFor="p-meta-desc" className="text-ink-soft">
                  Meta Description
                </label>
                <span className={metaDescLen > 160 ? "font-medium text-amber-600" : "text-ink-faint"}>
                  {metaDescLen}/160
                </span>
              </div>
              <textarea
                id="p-meta-desc"
                rows={3}
                value={form.metaDescription}
                onChange={(e) => set("metaDescription", e.target.value)}
                placeholder={form.excerpt || "Summary shown in Google search snippets…"}
                className={inputCls}
              />
            </div>
            <div>
              <label htmlFor="p-tags" className="mb-1.5 block text-[13px] text-ink-soft">
                Keywords / Tags (comma-separated)
              </label>
              <input
                id="p-tags"
                value={form.tagsInput}
                onChange={(e) => set("tagsInput", e.target.value)}
                placeholder="seo, marketing, nextjs"
                className={inputCls}
              />
            </div>
          </div>
        </aside>
      </div>
    </form>
  );
}