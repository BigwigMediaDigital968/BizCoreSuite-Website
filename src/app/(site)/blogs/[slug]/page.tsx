import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { connectDB } from "@/src/db/connect";
import { Blog } from "@/src/db/models/Blog";
import { BlogChrome, formatPostDate, readingTime } from "@/src/components/blog/BlogChrome";
import { GradientButton } from "@/src/components/ui/GradientButton";

interface Post {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  author: string;
  publishedAt?: Date;
  createdAt: Date;
}

async function getPost(slug: string): Promise<Post | null> {
  await connection();
  await connectDB();
  return (await Blog.findOne({ slug: slug.toLowerCase(), status: "PUBLISHED" }).lean()) as unknown as Post | null;
}

export async function generateMetadata({ params }: PageProps<"/blogs/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return { title: "Post not found — Bizcore Suite" };
  return { title: `${post.title} — Bizcore Suite`, description: post.excerpt || undefined };
}

/**
 * Content is plain text: blank lines split paragraphs, a line starting with "## "
 * becomes a section heading, and lines starting with "- " become a bullet list.
 */
function renderContent(content: string) {
  return content
    .replace(/\r\n/g, "\n")
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean)
    .map((block, i) => {
      if (block.startsWith("## ")) {
        return (
          <h2 key={i} className="mt-10 text-2xl font-extrabold tracking-tight text-navy-900">
            {block.slice(3)}
          </h2>
        );
      }
      const lines = block.split("\n");
      if (lines.every((l) => l.trim().startsWith("- "))) {
        return (
          <ul key={i} className="mt-5 list-disc space-y-1.5 pl-5">
            {lines.map((l, j) => (
              <li key={j}>{l.trim().slice(2)}</li>
            ))}
          </ul>
        );
      }
      return (
        <p key={i} className="mt-5">
          {lines.map((l, j) => (
            <span key={j}>
              {j > 0 && <br />}
              {l}
            </span>
          ))}
        </p>
      );
    });
}

export default async function BlogPostPage({ params }: PageProps<"/blogs/[slug]">) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();

  return (
    <BlogChrome>
      <article className="mx-auto w-full max-w-3xl px-4 pb-16 sm:px-6">
        <Link
          href="/blogs"
          className="inline-flex rounded-full border border-tint-200/80 bg-white/70 px-3.5 py-1.5 text-xs font-semibold text-navy-900 shadow-sm transition hover:bg-white hover:text-brand-600"
        >
          All posts
        </Link>

        <h1 className="scene-display-title mt-6 text-navy-900">
          {post.title}
        </h1>
        <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-sm text-navy-muted">
          <span>{post.author}</span>
          <time>{formatPostDate(post.publishedAt ?? post.createdAt)}</time>
          <span>{readingTime(post.content)} min read</span>
        </div>

        <div className="glass-card mt-8 rounded-3xl px-6 py-8 sm:px-10 sm:py-10">
          {post.excerpt && <p className="section-subtitle font-medium text-navy-900">{post.excerpt}</p>}
          <div className="mt-2 text-[17px] leading-[1.75] text-navy-900/85">
            {post.content ? renderContent(post.content) : null}
          </div>
        </div>

        <aside className="mt-10 rounded-3xl bg-brand-gradient p-7 text-white shadow-blue-glow sm:p-9">
          <h2 className="text-xl font-bold tracking-tight sm:text-2xl">See Bizcore running your business</h2>
          <p className="mt-2 max-w-md text-white/75">
            Book a 15-minute walkthrough of branches, attendance, payroll and leads in one place.
          </p>
          <GradientButton href="/#final-cta" variant="secondary" size="sm" showArrow className="mt-5">
            Book a Demo
          </GradientButton>
        </aside>
      </article>
    </BlogChrome>
  );
}
