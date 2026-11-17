import Link from "next/link";
import type { Metadata } from "next";
import { connection } from "next/server";
import { connectDB } from "@/src/db/connect";
import { Blog } from "@/src/db/models/Blog";
import { BlogChrome, formatPostDate } from "@/src/components/blog/BlogChrome";
import { GradientButton } from "@/src/components/ui/GradientButton";

export const metadata: Metadata = {
  title: "Blog — Bizcore Suite",
  description: "Notes on running branches, people, payroll and sales from one place.",
};

interface PostSummary {
  title: string;
  slug: string;
  excerpt: string;
  author: string;
  publishedAt?: Date;
  createdAt: Date;
}

async function getPosts(): Promise<PostSummary[] | null> {
  await connection(); // render per request so newly published posts show up immediately
  try {
    await connectDB();
    return (await Blog.find({ status: "PUBLISHED" }, { content: 0 })
      .sort({ publishedAt: -1, createdAt: -1 })
      .limit(50)
      .lean()) as unknown as PostSummary[];
  } catch (error) {
    console.error("Blog index: failed to load posts", error);
    return null;
  }
}

export default async function BlogIndexPage() {
  const posts = await getPosts();
  const [featured, ...rest] = posts ?? [];

  return (
    <BlogChrome>
      {/* Heading — same type language as the landing scenes */}
      <section className="mx-auto w-full max-w-7xl px-4 pb-10 sm:px-6 md:px-12">
        <div className="mb-4 inline-flex items-center gap-2 py-1 font-mono text-sm font-bold uppercase text-brand-600">
          <span>Insights</span>
        </div>
        <h1 className="scene-display-title max-w-3xl text-navy-900">
          Notes on running a <span className="text-gradient-blue">multi-branch business</span>
        </h1>
        <p className="section-subtitle mt-4 max-w-2xl text-navy-muted">
          Practical guides on attendance, payroll, leave and sales — from the team building Bizcore Suite.
        </p>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 pb-16 sm:px-6 md:px-12">
        {posts === null ? (
          <div className="glass-card rounded-3xl px-6 py-5 text-sm text-rose-700">
            Posts could not be loaded right now. Refresh the page in a moment.
          </div>
        ) : !featured ? (
          <div className="glass-card rounded-3xl px-6 py-16 text-center">
            <p className="text-lg font-bold text-navy-900">No posts published yet</p>
            <p className="mt-1 text-sm text-navy-muted">New articles will appear here as soon as they go live.</p>
            <div className="mt-6 flex justify-center">
              <GradientButton href="/" size="sm" variant="secondary">
                Back to the product tour
              </GradientButton>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Latest post */}
            <Link
              href={`/blogs/${featured.slug}`}
              className="group block rounded-3xl glass-card p-7 transition-[transform,box-shadow] duration-300 hover:-translate-y-0.5 hover:shadow-card-hover sm:p-10"
            >
              <div className="flex flex-wrap items-center gap-3 text-xs font-semibold">
                <span className="rounded-full bg-brand-100 px-2.5 py-1 text-brand-600">Latest</span>
                <span className="text-navy-muted">{formatPostDate(featured.publishedAt ?? featured.createdAt)}</span>
              </div>
              <h2 className="mt-4 max-w-3xl text-2xl font-extrabold leading-snug tracking-tight text-navy-900 transition-colors group-hover:text-brand-600 sm:text-4xl">
                {featured.title}
              </h2>
              {featured.excerpt && (
                <p className="mt-4 max-w-2xl text-base leading-relaxed text-navy-muted">{featured.excerpt}</p>
              )}
              <div className="mt-6 text-sm font-semibold text-brand-600">Read article</div>
            </Link>

            {rest.length > 0 && (
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {rest.map((p) => (
                  <Link
                    key={p.slug}
                    href={`/blogs/${p.slug}`}
                    className="group flex flex-col rounded-3xl border border-white/80 bg-white/70 p-6 shadow-card-soft backdrop-blur transition-[transform,box-shadow] duration-300 hover:-translate-y-0.5 hover:shadow-card-hover"
                  >
                    <time className="text-xs font-medium text-navy-muted">
                      {formatPostDate(p.publishedAt ?? p.createdAt)}
                    </time>
                    <h3 className="mt-2 text-lg font-bold leading-snug tracking-tight text-navy-900 transition-colors group-hover:text-brand-600">
                      {p.title}
                    </h3>
                    {p.excerpt && <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-navy-muted">{p.excerpt}</p>}
                    <div className="mt-auto pt-4 text-xs font-semibold text-navy-900/70">{p.author}</div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}
      </section>
    </BlogChrome>
  );
}
