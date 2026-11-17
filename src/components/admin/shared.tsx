"use client";

import Link from "next/link";
import { useEffect, useRef, type ReactNode } from "react";

/* ───────── Domain ───────── */

export const LEAD_STATUSES = ["NEW", "CONTACTED", "PENDING", "CLOSED", "REJECTED"] as const;
export type LeadStatus = (typeof LEAD_STATUSES)[number];
/** The forward path a lead travels; REJECTED can happen at any point. */
export const LEAD_FLOW: LeadStatus[] = ["NEW", "CONTACTED", "PENDING", "CLOSED"];

export interface LeadRow {
  _id: string;
  name: string;
  email: string;
  phone: string;
  companyName: string;
  noOfAdmin?: number;
  noOfManagers?: number;
  noOfemployee?: number;
  status: LeadStatus;
  createdAt: string;
  updatedAt?: string;
}

export const STATUS_META: Record<LeadStatus, { label: string; dot: string; pill: string; text: string }> = {
  NEW: { label: "New", dot: "bg-blue-500", pill: "bg-blue-50 text-blue-700", text: "text-blue-700" },
  CONTACTED: { label: "Contacted", dot: "bg-amber-500", pill: "bg-amber-50 text-amber-800", text: "text-amber-800" },
  PENDING: { label: "Pending", dot: "bg-violet-500", pill: "bg-violet-50 text-violet-700", text: "text-violet-700" },
  CLOSED: { label: "Closed", dot: "bg-emerald-500", pill: "bg-emerald-50 text-emerald-700", text: "text-emerald-700" },
  REJECTED: { label: "Rejected", dot: "bg-rose-400", pill: "bg-rose-50 text-rose-700", text: "text-rose-700" },
};

/* ───────── Formatting ───────── */

export const formatDate = (iso?: string) =>
  iso ? new Date(iso).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" }) : "—";

export const formatDateTime = (iso?: string) =>
  iso
    ? new Date(iso).toLocaleString(undefined, { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" })
    : "—";

export const formatTime = (iso: string) => new Date(iso).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });

export const timeAgo = (iso: string) => {
  const s = Math.max(0, (Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)} min ago`;
  if (s < 86400) return `${Math.floor(s / 3600)} h ago`;
  if (s < 86400 * 7) return `${Math.floor(s / 86400)} d ago`;
  return formatDate(iso);
};

/* ───────── Styles ───────── */

export const inputCls =
  "w-full rounded-lg border border-line bg-white px-3 py-2 text-sm text-ink placeholder:text-ink-faint outline-none transition focus:border-ink/40 focus:ring-4 focus:ring-ink/5";

const focusRing = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink";

export const btnPrimary = `inline-flex cursor-pointer items-center justify-center gap-2 rounded-full bg-ink px-4 py-2 text-sm font-semibold text-white transition hover:bg-ink/85 disabled:cursor-not-allowed disabled:opacity-50 ${focusRing}`;

export const btnSecondary = `inline-flex cursor-pointer items-center justify-center gap-2 rounded-full border border-line bg-white px-4 py-2 text-sm font-medium text-ink transition hover:bg-canvas disabled:cursor-not-allowed disabled:opacity-50 ${focusRing}`;

export const btnDanger = `inline-flex cursor-pointer items-center justify-center gap-2 rounded-full border border-rose-200 bg-white px-4 py-2 text-sm font-medium text-rose-700 transition hover:bg-rose-50 disabled:opacity-50 ${focusRing}`;

/* ───────── Primitives ───────── */

export function StatusPill({ status }: { status: LeadStatus }) {
  const m = STATUS_META[status];
  return (
    <span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-medium ${m.pill}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${m.dot}`} />
      {m.label}
    </span>
  );
}

export function Pill({ children, tone = "neutral" }: { children: ReactNode; tone?: "neutral" | "green" | "rose" }) {
  const cls = {
    neutral: "bg-canvas text-ink-soft",
    green: "bg-emerald-50 text-emerald-700",
    rose: "bg-rose-50 text-rose-700",
  }[tone];
  return <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium ${cls}`}>{children}</span>;
}

const AVATAR_TONES = [
  "bg-[#e8efe9] text-[#2f5d3a]",
  "bg-[#ece8f5] text-[#4b3a7a]",
  "bg-[#f6ebe1] text-[#7a4a1f]",
  "bg-[#e4eef6] text-[#24527a]",
  "bg-[#f5e6ea] text-[#7a2e45]",
];

export function Avatar({ name, size = "md" }: { name: string; size?: "sm" | "md" | "lg" }) {
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");
  const tone = AVATAR_TONES[[...name].reduce((a, c) => a + c.charCodeAt(0), 0) % AVATAR_TONES.length];
  const sz = { sm: "h-7 w-7 text-[11px]", md: "h-9 w-9 text-xs", lg: "h-14 w-14 text-lg" }[size];
  return (
    <span className={`inline-flex shrink-0 items-center justify-center rounded-full font-semibold ${sz} ${tone}`} aria-hidden>
      {initials || "?"}
    </span>
  );
}

export function Panel({
  title,
  action,
  children,
  className = "",
  bodyClassName = "p-5",
}: {
  title?: ReactNode;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
}) {
  return (
    <section className={`rounded-2xl border border-line bg-white ${className}`}>
      {title && (
        <div className="flex items-center justify-between gap-3 px-5 pt-4">
          <h2 className="text-[15px] font-semibold text-ink">{title}</h2>
          {action}
        </div>
      )}
      <div className={bodyClassName}>{children}</div>
    </section>
  );
}

export function Breadcrumb({ items }: { items: { label: string; href?: string }[] }) {
  return (
    <nav aria-label="Breadcrumb" className="mb-3 flex items-center gap-1.5 text-[13px] text-ink-soft">
      {items.map((it, i) => (
        <span key={i} className="flex items-center gap-1.5">
          {i > 0 && <span className="text-ink-faint">/</span>}
          {it.href ? (
            <Link href={it.href} className="hover:text-ink">
              {it.label}
            </Link>
          ) : (
            <span className="font-medium text-ink" aria-current="page">
              {it.label}
            </span>
          )}
        </span>
      ))}
    </nav>
  );
}

export function PageHeader({
  breadcrumb,
  leading,
  title,
  badge,
  description,
  actions,
}: {
  breadcrumb?: { label: string; href?: string }[];
  leading?: ReactNode;
  title: string;
  badge?: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <header className="mb-6">
      {breadcrumb && <Breadcrumb items={breadcrumb} />}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-4">
          {leading}
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="truncate text-[28px] font-semibold leading-tight tracking-tight text-ink">{title}</h1>
              {badge}
            </div>
            {description && <p className="mt-1 text-sm text-ink-soft">{description}</p>}
          </div>
        </div>
        {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
      </div>
    </header>
  );
}

/** Segmented tabs (reference: "Overview · Care plan · Touches"). */
export function Tabs<T extends string>({
  tabs,
  value,
  onChange,
  label,
}: {
  tabs: { value: T; label: string; count?: number }[];
  value: T;
  onChange: (v: T) => void;
  label: string;
}) {
  return (
    <div role="tablist" aria-label={label} className="inline-flex max-w-full gap-0.5 overflow-x-auto rounded-full border border-line bg-white p-1">
      {tabs.map((t) => {
        const active = t.value === value;
        return (
          <button
            key={t.value || "all"}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(t.value)}
            className={`cursor-pointer flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1.5 text-[13px] transition ${focusRing} ${
              active ? "bg-canvas font-semibold text-ink" : "font-medium text-ink-soft hover:text-ink"
            }`}
          >
            {t.label}
            {t.count !== undefined && <span className="text-xs tabular-nums text-ink-faint">{t.count}</span>}
          </button>
        );
      })}
    </div>
  );
}

export type StepState = "done" | "current" | "todo" | "failed";

/** Horizontal record timeline (reference: Received → Validation → … → Accepted). */
export function Stepper({ steps }: { steps: { label: string; sub?: string; state: StepState }[] }) {
  return (
    <ol className="flex overflow-x-auto px-5 py-4">
      {steps.map((s, i) => (
        <li key={s.label} className="relative min-w-[132px] flex-1 pr-4">
          <div className="flex items-center">
            <StepDot state={s.state} />
            {i < steps.length - 1 && (
              <span
                className={`mx-2 h-0 flex-1 border-t-2 border-dotted ${s.state === "done" ? "border-ink/50" : "border-line"}`}
                aria-hidden
              />
            )}
          </div>
          <div className={`mt-2 text-[13px] font-medium ${s.state === "todo" ? "text-ink-faint" : "text-ink"}`}>{s.label}</div>
          {s.sub && <div className="text-xs text-ink-faint">{s.sub}</div>}
          <span className="sr-only">
            {{ done: "completed", current: "current step", todo: "not reached", failed: "stopped here" }[s.state]}
          </span>
        </li>
      ))}
    </ol>
  );
}

function StepDot({ state }: { state: StepState }) {
  if (state === "todo") return <span className="h-5 w-5 shrink-0 rounded-full border-2 border-line bg-white" />;
  if (state === "failed")
    return (
      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-rose-500 text-white">
        <svg viewBox="0 0 12 12" className="h-2.5 w-2.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <path d="m3 3 6 6M9 3 3 9" />
        </svg>
      </span>
    );
  return (
    <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-white ${state === "current" ? "bg-emerald-600 ring-4 ring-emerald-100" : "bg-ink"}`}>
      <svg viewBox="0 0 12 12" className="h-2.5 w-2.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m2.5 6.2 2.3 2.3L9.5 3.8" />
      </svg>
    </span>
  );
}

export function Notice({ tone, title, children }: { tone: "green" | "rose" | "amber"; title: string; children?: ReactNode }) {
  const cls = {
    green: "border-emerald-200 bg-emerald-50/70 text-emerald-900",
    rose: "border-rose-200 bg-rose-50/70 text-rose-900",
    amber: "border-amber-200 bg-amber-50/70 text-amber-900",
  }[tone];
  return (
    <div className={`rounded-2xl border px-5 py-4 text-sm ${cls}`} role="status">
      <div className="font-semibold">{title}</div>
      {children && <div className="mt-0.5 opacity-80">{children}</div>}
    </div>
  );
}

export function ErrorNote({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div role="alert" className="mb-4 flex items-center justify-between gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
      <span>{message}</span>
      {onRetry && (
        <button onClick={onRetry} className="font-semibold underline underline-offset-2">
          Retry
        </button>
      )}
    </div>
  );
}

export function SearchInput({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder: string }) {
  return (
    <div className="relative w-full sm:w-72">
      <svg className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
        <circle cx="9" cy="9" r="6" />
        <path d="m14 14 3.5 3.5" />
      </svg>
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className={`${inputCls} rounded-full pl-9`}
      />
    </div>
  );
}

export function Pagination({ page, totalPages, total, limit, onPage }: { page: number; totalPages: number; total: number; limit: number; onPage: (p: number) => void }) {
  const from = total === 0 ? 0 : (page - 1) * limit + 1;
  const to = Math.min(total, page * limit);
  return (
    <div className="flex items-center justify-between border-t border-line px-5 py-3 text-[13px]">
      <span className="tabular-nums text-ink-soft">
        {from}–{to} of {total}
      </span>
      <div className="flex gap-2">
        <button onClick={() => onPage(page - 1)} disabled={page <= 1} className={`${btnSecondary} px-3 py-1.5 text-[13px]`}>
          Previous
        </button>
        <button onClick={() => onPage(page + 1)} disabled={page >= totalPages} className={`${btnSecondary} px-3 py-1.5 text-[13px]`}>
          Next
        </button>
      </div>
    </div>
  );
}

/** Data table header cell + row chevron so clickable rows have a resting affordance. */
export const thCls = "px-5 py-3 text-xs font-medium text-ink-faint";
export function RowChevron() {
  return (
    <svg className="h-4 w-4 text-ink-faint transition group-hover:translate-x-0.5 group-hover:text-ink" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="m6 4 4 4-4 4" />
    </svg>
  );
}

/**
 * Right-hand slide-over. Esc / backdrop closes; focus is trapped while open
 * and returned to the trigger on close.
 */
export function SlideOver({ open, title, onClose, children }: { open: boolean; title: string; onClose: () => void; children: ReactNode }) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement as HTMLElement | null;
    const first = panelRef.current?.querySelector<HTMLElement>("input, textarea, select");
    (first ?? panelRef.current)?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "Tab" && panelRef.current) {
        const f = panelRef.current.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])');
        if (!f.length) return;
        const a = f[0];
        const z = f[f.length - 1];
        if (e.shiftKey && document.activeElement === a) {
          e.preventDefault();
          z.focus();
        } else if (!e.shiftKey && document.activeElement === z) {
          e.preventDefault();
          a.focus();
        }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      previous?.focus?.();
    };
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50">
      <div className="admin-fade absolute inset-0 bg-ink/25" onClick={onClose} aria-hidden />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        className="admin-slide-in absolute inset-y-2 right-2 flex w-[calc(100%-1rem)] max-w-lg flex-col overflow-hidden rounded-2xl border border-line bg-white shadow-2xl outline-none"
      >
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <h2 className="text-[15px] font-semibold text-ink">{title}</h2>
          <button onClick={onClose} aria-label="Close" className="rounded-full p-1.5 text-ink-soft hover:bg-canvas">
            <svg className="h-4 w-4" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              <path d="m5 5 10 10M15 5 5 15" />
            </svg>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-5">{children}</div>
      </div>
    </div>
  );
}

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-line py-3 text-sm last:border-0">
      <dt className="text-ink-soft">{label}</dt>
      <dd className="min-w-0 truncate text-right font-medium text-ink">{children}</dd>
    </div>
  );
}

/** Reads a query param once on mount without useSearchParams (avoids a Suspense boundary). */
export function readQueryParam(key: string): string | null {
  if (typeof window === "undefined") return null;
  return new URLSearchParams(window.location.search).get(key);
}
