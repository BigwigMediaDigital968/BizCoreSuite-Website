import Link from "next/link";
import type { Metadata } from "next";
import { BlogChrome, formatPostDate } from "@/src/components/blog/BlogChrome";
import { PostCard } from "@/src/components/blog/PostCard";
import { GradientButton } from "@/src/components/ui/GradientButton";
import { listPopularTags, listPublishedPosts } from "@/src/lib/blogQueries";
import { resizeImage } from "@/src/lib/cloudinaryUrl";

export const metadata: Metadata = {
  title: "Blog — Bizcore Suite",
  description: "Notes on running branches, people, payroll and sales from one place.",
};

const pill = (active: boolean) =>
  `rounded-full border px-3.5 py-1.5 text-xs font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 ${
    active
      ? "border-navy-900 bg-navy-900 text-white"
      : "border-tint-200/80 bg-white/70 text-navy-900 hover:bg-white hover:text-brand-600"
  }`;

export default async function BlogIndexPage({ searchParams }: PageProps<"/blogs">) {
  const { tag: rawTag } = await searchParams;
  const tag = (Array.isArray(rawTag) ? rawTag[0] : rawTag)?.trim() || undefined;

  const [posts, tags] = await Promise.all([listPublishedPosts(tag), listPopularTags()]);
  // The filter row only makes sense when there's something to filter by
  const [featured, ...rest] = posts ?? [];

  return (
    <BlogChrome>
      <section className="mx-auto w-full max-w-7xl px-4 pb-10 sm:px-6 md:px-12">
        <div className="mb-4 inline-flex items-center gap-2 py-1 font-mono text-sm font-bold uppercase text-brand-600">
          <span>Insights</span>
        </div>
        <h1 className="scene-display-title max-w-3xl text-navy-900">
          Notes on running a <span className="text-gradient-blue">multi-branch business</span>
        </h1>
        <p className="section-subtitle mt-4 max-w-2xl text-navy-muted">
          Practical guides on attendance, payroll, leave and sales, from the team building Bizcore Suite.
        </p>

        {tags.length > 0 && (
          <nav aria-label="Filter posts by topic" className="mt-8 flex flex-wrap gap-2">
            <Link href="/blogs" className={pill(!tag)} aria-current={!tag ? "page" : undefined}>
              All posts
            </Link>
            {tags.map((t) => (
              <Link
                key={t.tag}
                href={`/blogs?tag=${encodeURIComponent(t.tag)}`}
                className={pill(tag === t.tag)}
                aria-current={tag === t.tag ? "page" : undefined}
              >
                {t.tag}
              </Link>
            ))}
          </nav>
        )}
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 pb-16 sm:px-6 md:px-12">
        {posts === null ? (
          <div role="alert" className="glass-card rounded-3xl px-6 py-5 text-sm text-rose-700">
            Posts could not be loaded right now. Refresh the page in a moment.
          </div>
        ) : !featured ? (
          <div className="glass-card rounded-3xl px-6 py-16 text-center">
            <p className="text-lg font-bold text-navy-900">
              {tag ? `No posts tagged “${tag}”` : "No posts published yet"}
            </p>
            <p className="mt-1 text-sm text-navy-muted">
              {tag ? "Try another topic, or browse everything." : "New articles will appear here as soon as they go live."}
            </p>
            <div className="mt-6 flex justify-center">
              <GradientButton href={tag ? "/blogs" : "/"} size="sm" variant="secondary">
                {tag ? "Show all posts" : "Back to the product tour"}
              </GradientButton>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Newest post: cover beside the text on large screens */}
            <Link
              href={`/blogs/${featured.slug}`}
              className="group grid overflow-hidden rounded-3xl glass-card transition-[transform,box-shadow] duration-300 hover:-translate-y-0.5 hover:shadow-card-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 lg:grid-cols-[1.1fr_1fr]"
            >
              {featured.coverImage && (
                <div className="aspect-[16/10] overflow-hidden bg-tint-100 lg:aspect-auto lg:min-h-[22rem]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={resizeImage(featured.coverImage, 1200)}
                    alt={featured.coverImageAlt || ""}
                    fetchPriority="high"
                    decoding="async"
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.02]"
                  />
                </div>
              )}
              <div className={`flex flex-col justify-center p-7 sm:p-10 ${featured.coverImage ? "" : "lg:col-span-2"}`}>
                <div className="flex flex-wrap items-center gap-3 text-xs font-semibold">
                  <span className="rounded-full bg-brand-100 px-2.5 py-1 text-brand-600">Latest</span>
                  <time className="text-navy-muted">{formatPostDate(featured.publishedAt ?? featured.createdAt)}</time>
                </div>
                <h2 className="mt-4 max-w-3xl text-2xl font-extrabold leading-snug tracking-tight text-navy-900 transition-colors group-hover:text-brand-600 sm:text-4xl">
                  {featured.title}
                </h2>
                {featured.excerpt && (
                  <p className="mt-4 max-w-2xl text-base leading-relaxed text-navy-muted">{featured.excerpt}</p>
                )}
                <div className="mt-6 flex items-center gap-3 text-sm">
                  <span className="font-semibold text-navy-900">{featured.author}</span>
                  <span className="font-semibold text-brand-600">Read article</span>
                </div>
              </div>
            </Link>

            {rest.length > 0 && (
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {rest.map((p) => (
                  <PostCard key={p.slug} post={p} />
                ))}
              </div>
            )}
          </div>
        )}
      </section>
    </BlogChrome>
  );
}
