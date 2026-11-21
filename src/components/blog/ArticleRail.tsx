"use client";

import { useEffect, useState } from "react";
import { Check, Link2, List } from "lucide-react";
import type { TocItem } from "@/src/lib/sanitizeHtml";

/** The heading closest to (just under) the navbar is the current section. */
function useActiveHeading(toc: TocItem[]) {
  const [active, setActive] = useState<string | null>(toc[0]?.id ?? null);

  useEffect(() => {
    const headings = toc.map((t) => document.getElementById(t.id)).filter((el): el is HTMLElement => !!el);
    if (!headings.length) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-110px 0px -65% 0px", threshold: 0 }
    );
    headings.forEach((h) => observer.observe(h));
    return () => observer.disconnect();
  }, [toc]);

  return active;
}

function TocList({ toc, active }: { toc: TocItem[]; active: string | null }) {
  return (
    <ol className="space-y-0.5 border-l border-tint-300/70">
      {toc.map((item) => {
        const current = item.id === active;
        return (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              aria-current={current ? "location" : undefined}
              className={`-ml-px block border-l-2 py-1.5 text-[13px] leading-snug transition-colors ${
                item.level === 3 ? "pl-6" : "pl-4"
              } ${
                current
                  ? "border-brand-600 font-semibold text-brand-600"
                  : "border-transparent text-navy-muted hover:text-navy-900"
              }`}
            >
              {item.text}
            </a>
          </li>
        );
      })}
    </ol>
  );
}

export function CopyLinkButton() {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable (insecure context): nothing to do */
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      className="inline-flex items-center gap-2 rounded-full border border-tint-200/80 bg-white/80 px-3.5 py-2 text-xs font-semibold text-navy-900 shadow-sm transition hover:bg-white hover:text-brand-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
    >
      {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Link2 className="h-3.5 w-3.5" />}
      <span aria-live="polite">{copied ? "Link copied" : "Copy link"}</span>
    </button>
  );
}

/** Large screens: sticky "On this page" rail with the current section marked. */
export function ArticleRail({ toc }: { toc: TocItem[] }) {
  const active = useActiveHeading(toc);
  return (
    <aside className="hidden lg:block">
      <div className="sticky top-28 space-y-6">
        {toc.length > 1 && (
          <nav aria-label="On this page">
            <p className="mb-3 text-sm font-bold text-navy-900">On this page</p>
            <TocList toc={toc} active={active} />
          </nav>
        )}
        <CopyLinkButton />
      </div>
    </aside>
  );
}

/** Small screens: a collapsed list above the article. */
export function MobileToc({ toc }: { toc: TocItem[] }) {
  const active = useActiveHeading(toc);
  if (toc.length < 2) return null;
  return (
    <details className="mb-8 rounded-2xl border border-tint-200/80 bg-white/70 p-4 backdrop-blur lg:hidden">
      <summary className="flex cursor-pointer list-none items-center gap-2 text-sm font-semibold text-navy-900 [&::-webkit-details-marker]:hidden">
        <List className="h-4 w-4 text-brand-600" />
        On this page
      </summary>
      <div className="mt-3">
        <TocList toc={toc} active={active} />
      </div>
    </details>
  );
}
