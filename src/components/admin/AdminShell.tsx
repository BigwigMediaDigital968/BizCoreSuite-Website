"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";

interface Counts {
  newLeads: number;
  stale: number;
  drafts: number;
}

const ICONS: Record<string, ReactNode> = {
  dashboard: <path d="M3.5 3.5h5v5h-5zM11.5 3.5h5v5h-5zM3.5 11.5h5v5h-5zM11.5 11.5h5v5h-5z" />,
  leads: (
    <>
      <circle cx="8" cy="7" r="2.8" />
      <path d="M2.8 16c.4-2.6 2.4-4 5.2-4s4.8 1.4 5.2 4M13.5 4.6a2.6 2.6 0 0 1 0 4.8M14.6 12.2c1.6.5 2.4 1.7 2.7 3.6" />
    </>
  ),
  blogs: (
    <>
      <path d="M5 3.5h7l3.5 3.5v9a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-11.5a1 1 0 0 1 1-1z" />
      <path d="M12 3.5V7h3.5M7 10.5h6M7 13.5h4" />
    </>
  ),
  site: <path d="M8 4H5a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1v-3M11 4h5v5M16 4l-6 6" />,
  logout: <path d="M8 4H5a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3M12 6l4 4-4 4M16 10H8" />,
};

function Icon({ name }: { name: string }) {
  return (
    <svg className="h-4.5 w-4.5 shrink-0" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      {ICONS[name]}
    </svg>
  );
}

function NavItem({ href, label, icon, active, badge, onNavigate }: { href: string; label: string; icon: string; active: boolean; badge?: ReactNode; onNavigate?: () => void }) {
  return (
    <Link
      href={href}
      onClick={onNavigate}
      aria-current={active ? "page" : undefined}
      className={`flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-ink ${active ? "bg-white font-semibold text-ink shadow-[0_1px_2px_rgba(0,0,0,0.06)] ring-1 ring-line" : "text-ink-soft hover:bg-hover hover:text-ink"
        }`}
    >
      <Icon name={icon} />
      <span className="flex-1">{label}</span>
      {badge}
    </Link>
  );
}

function Sidebar({ counts, onNavigate }: { counts: Counts | null; onNavigate?: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const searchRef = useRef<HTMLInputElement>(null);
  const [q, setQ] = useState("");
  const [busy, setBusy] = useState(false);

  // ⌘K / Ctrl+K focuses search
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  function onSearch(e: FormEvent) {
    e.preventDefault();
    const term = q.trim();
    router.push(term ? `/admin/leads?q=${encodeURIComponent(term)}` : "/admin/leads");
    onNavigate?.();
  }

  async function logout() {
    setBusy(true);
    try {
      await fetch("/api/admin/logout", { method: "POST" });
    } finally {
      router.replace("/admin/login");
      router.refresh();
    }
  }

  const is = (href: string, exact = false) => (exact ? pathname === href : pathname.startsWith(href));

  return (
    <div className="flex h-full flex-col gap-4 p-3">
      {/* Workspace card */}
      <div className="flex items-center gap-1 rounded-xl bg-white p-2.5 ring-1 ring-line">
        <Image src={"/bizcore-logo.png"} alt='bizcoresute' width={30} height={25} />
        <Image src={"/bizcore-brandname.png"} alt='bizcoresute' width={130} height={40} />
      </div>

      {/* Search */}
      {/* <form onSubmit={onSearch} role="search" className="relative">
        <svg className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
          <circle cx="9" cy="9" r="6" />
          <path d="m14 14 3.5 3.5" />
        </svg>
        <input
          ref={searchRef}
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search leads"
          aria-label="Search leads"
          className="w-full rounded-xl bg-transparent py-2 pl-9 pr-12 text-sm text-ink placeholder:text-ink-soft outline-none transition hover:bg-hover focus:bg-white focus:ring-1 focus:ring-line"
        />
        <kbd className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md border border-line bg-white px-1.5 py-0.5 text-[10px] font-medium text-ink-faint">
          Ctrl K
        </kbd>
      </form> */}

      <nav aria-label="Admin" className="flex-1 space-y-5 overflow-y-auto">
        <div>
          <div className="px-3 pb-1.5 text-xs font-medium text-ink-faint">Workspace</div>
          <div className="space-y-0.5">
            <NavItem href="/admin" label="Dashboard" icon="dashboard" active={is("/admin", true)} onNavigate={onNavigate} />
            <NavItem
              href="/admin/leads"
              label="Leads"
              icon="leads"
              active={is("/admin/leads")}
              onNavigate={onNavigate}
              badge={
                counts && counts.newLeads > 0 ? (
                  <span className="text-xs font-semibold tabular-nums text-rose-600" aria-label={`${counts.newLeads} new`}>
                    {counts.newLeads}
                  </span>
                ) : null
              }
            />
            <NavItem
              href="/admin/blogs"
              label="Blogs"
              icon="blogs"
              active={is("/admin/blogs")}
              onNavigate={onNavigate}
              badge={
                counts && counts.drafts > 0 ? (
                  <span className="text-xs tabular-nums text-ink-faint" aria-label={`${counts.drafts} drafts`}>
                    {counts.drafts}
                  </span>
                ) : null
              }
            />
          </div>
        </div>
        <div>
          <div className="px-3 pb-1.5 text-xs font-medium text-ink-faint">Account</div>
          <a href="/" target="_blank" rel="noreferrer" className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-ink-soft transition-colors hover:bg-hover hover:text-ink">
            <Icon name="site" />
            View site
          </a>
        </div>
      </nav>

      {/* Status card (reference: "Support line is open") */}
      {/* {counts && (
        <div className="rounded-xl bg-white p-3 text-xs ring-1 ring-line">
          <div className="flex items-center gap-2 font-semibold text-ink">
            <span className={`h-2 w-2 rounded-full ${counts.stale > 0 ? "bg-amber-500" : "bg-emerald-500"}`} />
            {counts.stale > 0 ? "Leads are waiting" : "All caught up"}
          </div>
          <p className="mt-1 leading-relaxed text-ink-soft">
            {counts.stale > 0
              ? `${counts.stale} new ${counts.stale === 1 ? "lead has" : "leads have"} waited more than 2 days for a reply.`
              : "Every new lead has been picked up within 2 days."}
          </p>
        </div>
      )} */}

      {/* User */}
      <div className="flex items-center gap-3 rounded-xl px-2 py-1.5">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#e4eef6] text-xs font-semibold text-[#24527a]">AD</span>
        <div className="min-w-0 flex-1 leading-tight">
          <div className="text-sm font-semibold text-ink">Admin</div>
          <div className="truncate text-xs text-ink-faint">Full access</div>
        </div>
        <button onClick={logout} disabled={busy} aria-label="Sign out" title="Sign out" className="cursor-pointer rounded-lg p-1.5 text-ink-soft transition hover:bg-hover hover:text-ink disabled:opacity-50">
          <Icon name="logout" />
        </button>
      </div>
    </div>
  );
}

export function AdminShell({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [counts, setCounts] = useState<Counts | null>(null);
  const pathname = usePathname();

  // Badge counts — refreshed on every navigation so they follow edits made on other pages
  useEffect(() => {
    let cancelled = false;
    fetch("/api/admin/stats")
      .then((r) => (r.ok ? r.json() : null))
      .then((s) => {
        if (!cancelled && s) setCounts({ newLeads: s.leads.byStatus.NEW, stale: s.leads.stale, drafts: s.blogs.DRAFT });
      })
      .catch(() => { });
    return () => {
      cancelled = true;
    };
  }, [pathname]);

  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <div className="min-h-screen bg-canvas text-ink lg:pl-[256px]">
      <aside className="fixed inset-y-0 left-0 hidden w-[256px] lg:block">
        <Sidebar counts={counts} />
      </aside>

      <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-line bg-canvas/90 px-4 backdrop-blur lg:hidden">
        <button onClick={() => setOpen(true)} aria-label="Open menu" aria-expanded={open} className="rounded-lg p-2 hover:bg-hover">
          <svg className="h-5 w-5" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
            <path d="M3 5.5h14M3 10h14M3 14.5h14" />
          </svg>
        </button>
        <span className="text-sm font-semibold">BizCore Suite</span>
      </header>

      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="admin-fade absolute inset-0 bg-ink/30" onClick={() => setOpen(false)} aria-hidden />
          <aside className="admin-slide-in-left absolute inset-y-0 left-0 w-[272px] bg-canvas shadow-2xl">
            <Sidebar counts={counts} onNavigate={() => setOpen(false)} />
          </aside>
        </div>
      )}

      <main className="mx-auto w-full max-w-[1200px] px-4 py-6 sm:px-8 sm:py-8">{children}</main>
    </div>
  );
}
