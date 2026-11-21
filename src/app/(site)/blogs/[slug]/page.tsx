import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArrowLeft, ChevronDown } from "lucide-react";
import { BlogChrome, formatPostDate } from "@/src/components/blog/BlogChrome";
import { ArticleRail, CopyLinkButton, MobileToc } from "@/src/components/blog/ArticleRail";
import { PostCard } from "@/src/components/blog/PostCard";
import { GradientButton } from "@/src/components/ui/GradientButton";
import { getPublishedPost, getRelatedPosts } from "@/src/lib/blogQueries";
import { resizeImage } from "@/src/lib/cloudinaryUrl";
import { faqJsonLd } from "@/src/lib/faqs";
import { prepareArticle } from "@/src/lib/sanitizeHtml";

export async function generateMetadata({ params }: PageProps<"/blogs/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPublishedPost(slug);
  if (!post) return { title: "Post not found — Bizcore Suite" };

  const title = `${post.metaTitle || post.title} — Bizcore Suite`;
  const description = post.metaDescription || post.excerpt || undefined;
  const image = post.coverImage ? resizeImage(post.coverImage, 1200) : undefined;

  return {
    title,
    description,
    keywords: post.tags?.length ? post.tags : undefined,
    authors: post.author ? [{ name: post.author }] : undefined,
    openGraph: {
      type: "article",
      title,
      description,
      publishedTime: (post.publishedAt ?? post.createdAt)?.toISOString?.(),
      modifiedTime: post.updatedAt?.toISOString?.(),
      authors: post.author ? [post.author] : undefined,
      tags: post.tags,
      images: image ? [{ url: image, alt: post.coverImageAlt || post.title }] : undefined,
    },
    twitter: { card: image ? "summary_large_image" : "summary", title, description, images: image ? [image] : undefined },
  };
}

/** JSON-LD must not be able to close its own <script> tag. */
const jsonLd = (data: unknown) => JSON.stringify(data).replace(/</g, "\\u003c");

export default async function BlogPostPage({ params }: PageProps<"/blogs/[slug]">) {
  const { slug } = await params;
  const post = await getPublishedPost(slug);
  if (!post) notFound();

  const [related, { html, toc, wordCount }] = await Promise.all([
    getRelatedPosts(post),
    Promise.resolve(prepareArticle(post.content)),
  ]);

  const faqs = post.faqs ?? [];
  const published = post.publishedAt ?? post.createdAt;
  const minutes = Math.max(1, Math.round(wordCount / 220));

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.metaDescription || post.excerpt || undefined,
    image: post.coverImage ? [resizeImage(post.coverImage, 1200)] : undefined,
    datePublished: published?.toISOString?.(),
    dateModified: (post.updatedAt ?? published)?.toISOString?.(),
    author: post.author ? { "@type": "Person", name: post.author } : undefined,
    keywords: post.tags?.length ? post.tags.join(", ") : undefined,
    wordCount,
  };
  const faqSchema = faqJsonLd(faqs);

  return (
    <BlogChrome>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(articleSchema) }} />
      {faqSchema && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(faqSchema) }} />}

      <article className="mx-auto w-full max-w-7xl px-4 pb-16 sm:px-6 md:px-12">
        <Link
          href="/blogs"
          className="inline-flex items-center gap-1.5 rounded-full border border-tint-200/80 bg-white/70 px-3.5 py-1.5 text-xs font-semibold text-navy-900 shadow-sm transition hover:bg-white hover:text-brand-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          All posts
        </Link>

        <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-14">
          <div className="min-w-0">
            <header className="max-w-3xl">
              <h1 className="scene-display-title text-balance text-navy-900">{post.title}</h1>
              {post.excerpt && (
                <p className="section-subtitle mt-5 max-w-3xl text-navy-muted">{post.excerpt}</p>
              )}

              <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm">
                <div className="flex items-center gap-3">
                  <span
                    aria-hidden="true"
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-gradient text-sm font-bold text-white"
                  >
                    {(post.author || "B").trim().charAt(0).toUpperCase()}
                  </span>
                  <span className="font-semibold text-navy-900">{post.author}</span>
                </div>
                <time dateTime={published?.toISOString?.()} className="text-navy-muted">
                  {formatPostDate(published)}
                </time>
                <span className="text-navy-muted">{minutes} min read</span>
              </div>
            </header>

            {post.coverImage && (
              <figure className="mt-8 overflow-hidden rounded-3xl border border-white/80 bg-tint-100 shadow-card-soft">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={resizeImage(post.coverImage, 1200)}
                  alt={post.coverImageAlt || post.title}
                  fetchPriority="high"
                  decoding="async"
                  className="aspect-[16/9] w-full object-cover"
                />
              </figure>
            )}


            <div className="mt-10" />
            <MobileToc toc={toc} />

            {html ? (
              <div className="rich-content rich-content--site" dangerouslySetInnerHTML={{ __html: html }} />
            ) : (
              <p className="text-navy-muted">This post has no content yet.</p>
            )}

            {faqs.length > 0 && (
              <section aria-labelledby="faq-heading" className="mt-16">
                <h2 id="faq-heading" className="text-2xl font-extrabold tracking-tight text-navy-900">
                  Frequently asked questions
                </h2>
                <div className="mt-5 divide-y divide-tint-300/70 border-y border-tint-300/70">
                  {faqs.map((f, i) => (
                    <details key={i} className="group py-1">
                      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 text-left text-base font-semibold text-navy-900 transition-colors hover:text-brand-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 [&::-webkit-details-marker]:hidden">
                        <span>{f.question}</span>
                        <ChevronDown
                          aria-hidden="true"
                          className="h-5 w-5 shrink-0 text-brand-600 transition-transform duration-300 group-open:rotate-180"
                        />
                      </summary>
                      <p className="max-w-[40rem] whitespace-pre-line pb-5 text-[15px] leading-relaxed text-navy-900/80">
                        {f.answer}
                      </p>
                    </details>
                  ))}
                </div>
              </section>
            )}

            {(post.tags?.length ?? 0) > 0 && (
              <div className="mt-12 flex flex-wrap items-center gap-2">
                <span className="mr-1 text-sm text-navy-muted">Filed under</span>
                {post.tags!.map((t) => (
                  <Link
                    key={t}
                    href={`/blogs?tag=${encodeURIComponent(t)}`}
                    className="rounded-full border border-tint-200/80 bg-white/70 px-3 py-1 text-xs font-semibold text-navy-900 transition hover:bg-white hover:text-brand-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
                  >
                    {t}
                  </Link>
                ))}
              </div>
            )}

            <div className="mt-8 lg:hidden">
              <CopyLinkButton />
            </div>
          </div>

          <ArticleRail toc={toc}>
            {related.length > 0 && (
              <section aria-labelledby="related-side-heading">
                <h2 id="related-side-heading" className="mb-3 text-sm font-bold text-navy-900">Related posts</h2>
                <ul className="space-y-3">
                  {related.map((p) => (
                    <li key={p.slug}>
                      <Link href={`/blogs/${p.slug}`} className="group flex gap-3 rounded-xl p-1.5 -m-1.5 transition hover:bg-white/70 focus-visible:outline-2 focus-visible:outline-brand-600">
                        {p.coverImage && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={resizeImage(p.coverImage, 240)} alt="" loading="lazy" className="h-14 w-20 shrink-0 rounded-lg object-cover" />
                        )}
                        <span className="min-w-0">
                          <span className="line-clamp-2 text-[13px] font-semibold leading-snug text-navy-900 group-hover:text-brand-600">{p.title}</span>
                          <span className="mt-0.5 block text-xs text-navy-muted">{formatPostDate(p.publishedAt ?? p.createdAt)}</span>
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </ArticleRail>
        </div>

        {related.length > 0 && (
          <section aria-labelledby="related-heading" className="mt-20 lg:hidden">
            <h2 id="related-heading" className="text-2xl font-extrabold tracking-tight text-navy-900">
              Keep reading
            </h2>
            <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((p) => (
                <PostCard key={p.slug} post={p} />
              ))}
            </div>
          </section>
        )}

        <aside className="mt-16 rounded-3xl bg-brand-gradient p-7 text-white shadow-blue-glow sm:p-10">
          <h2 className="text-xl font-bold tracking-tight sm:text-2xl">See Bizcore running your business</h2>
          <p className="mt-2 max-w-md text-white/75">
            Book a 15-minute walkthrough of branches, attendance, payroll and leads in one place.
          </p>
          <GradientButton href="/#final-cta" variant="secondary" size="sm" showArrow className="mt-5">
            Book a demo
          </GradientButton>
        </aside>
      </article>
    </BlogChrome>
  );
}
