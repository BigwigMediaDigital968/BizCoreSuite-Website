import Link from "next/link";
import { FileText } from "lucide-react";
import { formatPostDate } from "@/src/components/blog/BlogChrome";
import { resizeImage } from "@/src/lib/cloudinaryUrl";
import type { PostSummary } from "@/src/lib/blogQueries";

/** Grid card: cover on top (or a quiet placeholder), then date, title, excerpt, author. */
export function PostCard({ post }: { post: PostSummary }) {
  return (
    <Link
      href={`/blogs/${post.slug}`}
      className="group flex flex-col overflow-hidden rounded-3xl border border-white/80 bg-white/70 shadow-card-soft backdrop-blur transition-[transform,box-shadow] duration-300 hover:-translate-y-0.5 hover:shadow-card-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
    >
      <div className="aspect-[16/9] w-full overflow-hidden bg-tint-100">
        {post.coverImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={resizeImage(post.coverImage, 720)}
            alt={post.coverImageAlt || ""}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-brand-300" aria-hidden="true">
            <FileText className="h-9 w-9" strokeWidth={1.5} />
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-6">
        <time className="text-xs font-medium text-navy-muted">{formatPostDate(post.publishedAt ?? post.createdAt)}</time>
        <h3 className="mt-2 text-lg font-bold leading-snug tracking-tight text-navy-900 transition-colors group-hover:text-brand-600">
          {post.title}
        </h3>
        {post.excerpt && <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-navy-muted">{post.excerpt}</p>}
        <div className="mt-auto flex items-center justify-between gap-3 pt-5">
          <span className="text-xs font-semibold text-navy-900/70">{post.author}</span>
          {post.tags?.[0] && (
            <span className="rounded-full bg-brand-100 px-2.5 py-1 text-[11px] font-semibold text-brand-600">{post.tags[0]}</span>
          )}
        </div>
      </div>
    </Link>
  );
}
