import type { ReactNode } from "react";
import { Navbar } from "../ui/Navbar";
import { SiteFooter } from "../ui/SiteFooter";
import { BackgroundAtmosphere } from "../ui/BackgroundAtmosphere";

/**
 * Blog pages use the landing site's own chrome: the floating glass navbar, the
 * soft background atmosphere and the compact footer bar. Only the scene/scroll
 * machinery is left out — these pages scroll like a normal document.
 */
export function BlogChrome({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-screen bg-tint-50 text-navy-900">
      <BackgroundAtmosphere />
      <Navbar />
      <main className="relative z-10 pt-28 sm:pt-32">{children}</main>
      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 pb-8 pt-4 sm:px-6 md:px-12">
        <SiteFooter />
      </div>
    </div>
  );
}

export const formatPostDate = (d?: Date | string) =>
  d ? new Date(d).toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" }) : "";

/** Rough reading time at ~220 words per minute. */
export const readingTime = (text: string) => Math.max(1, Math.round((text.trim().split(/\s+/).length || 0) / 220));
