"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Avatar,
  ErrorNote,
  LEAD_FLOW,
  PageHeader,
  Panel,
  STATUS_META,
  StatusPill,
  btnPrimary,
  btnSecondary,
  timeAgo,
  type LeadRow,
  type LeadStatus,
} from "@/src/components/admin/shared";

interface Stats {
  leads: {
    total: number;
    byStatus: Record<LeadStatus, number>;
    series: { date: string; count: number }[];
    recent: LeadRow[];
    stale: number;
  };
  blogs: { total: number; PUBLISHED: number; DRAFT: number };
}

export default function DashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setError("");
    try {
      const res = await fetch("/api/admin/stats");
      if (res.status === 401) return router.replace("/admin/login");
      if (!res.ok) throw new Error("failed");
      setStats(await res.json());
    } catch {
      setError("Could not load the dashboard.");
    }
  }, [router]);

  useEffect(() => {
    load();
  }, [load]);

  const now = new Date();
  const hour = now.getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return (
    <div>
      <PageHeader
        title={greeting}
        description={now.toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long" })}
        actions={
          <>
            <Link href="/admin/blogs?new=1" className={btnSecondary}>
              New post
            </Link>
            <Link href="/admin/leads?status=NEW" className={btnPrimary}>
              Work new leads
            </Link>
          </>
        }
      />

      {error && <ErrorNote message={error} onRetry={load} />}
      {!stats ? !error && <Skeleton /> : <Content stats={stats} />}
    </div>
  );
}

function Content({ stats }: { stats: Stats }) {
  const { total, byStatus, series, recent, stale } = stats.leads;
  const thisWeek = series.slice(-7).reduce((a, d) => a + d.count, 0);
  const lastWeek = series.slice(0, 7).reduce((a, d) => a + d.count, 0);
  const decided = byStatus.CLOSED + byStatus.REJECTED;
  const closeRate = decided ? Math.round((byStatus.CLOSED / decided) * 100) : null;

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
      <div className="min-w-0 space-y-5">
        {/* Pipeline — every lead, by stage, in the order they move */}
        <Panel title="Lead pipeline" action={<span className="text-[13px] tabular-nums text-ink-soft">{total} leads</span>} bodyClassName="">
          <ol className="flex overflow-x-auto px-5 pb-5 pt-4">
            {LEAD_FLOW.map((s, i) => (
              <li key={s} className="min-w-[128px] flex-1 pr-4">
                <div className="flex items-center">
                  <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${STATUS_META[s].dot}`} />
                  {i < LEAD_FLOW.length - 1 && <span className="mx-2 h-0 flex-1 border-t-2 border-dotted border-line" aria-hidden />}
                </div>
                <Link href={`/admin/leads?status=${s}`} className="group mt-2 block">
                  <div className="text-[13px] text-ink-soft group-hover:text-ink">{STATUS_META[s].label}</div>
                  <div className="text-3xl font-light tabular-nums tracking-tight text-ink">{byStatus[s]}</div>
                </Link>
              </li>
            ))}
          </ol>
          <div className="flex items-center justify-between border-t border-line px-5 py-3 text-[13px]">
            <span className="text-ink-soft">
              <span className="font-medium text-ink">{byStatus.REJECTED}</span> rejected along the way
            </span>
            <Link href="/admin/leads" className="font-medium text-ink hover:underline">
              Open leads
            </Link>
          </div>
        </Panel>

        {/* Stat strip */}
        <Panel bodyClassName="grid divide-y divide-line sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          <Stat label="New leads this week" value={String(thisWeek)} note={weekDelta(thisWeek, lastWeek)} />
          <Stat label="Close rate" value={closeRate === null ? "—" : `${closeRate}%`} note={closeRate === null ? "no decided leads yet" : `of ${decided} decided`} />
          <Stat
            label="Waiting over 2 days"
            value={String(stale)}
            note={stale ? "still marked new" : "none waiting"}
            tone={stale ? "warn" : "ok"}
          />
        </Panel>

        <Trend series={series} />
      </div>

      {/* Right rail */}
      <div className="space-y-5">
        <Panel title="Activity" action={<Link href="/admin/leads" className="text-[13px] font-medium text-ink-soft hover:text-ink">All</Link>} bodyClassName="px-5 pb-4 pt-3">
          {recent.length === 0 ? (
            <p className="py-6 text-sm text-ink-soft">No leads yet. Demo requests from the landing page will show up here.</p>
          ) : (
            <ul className="space-y-1">
              {recent.map((l) => (
                <li key={l._id}>
                  <Link href={`/admin/leads/${l._id}`} className="-mx-2 flex items-start gap-3 rounded-xl px-2 py-2 transition hover:bg-canvas">
                    <Avatar name={l.name} size="sm" />
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-medium text-ink">{l.name}</div>
                      <div className="truncate text-xs text-ink-faint">
                        {l.companyName} · {timeAgo(l.createdAt)}
                      </div>
                    </div>
                    <StatusPill status={l.status} />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel title="Blog" bodyClassName="px-5 pb-5 pt-3">
          <dl className="grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-canvas p-3">
              <dt className="text-xs text-ink-soft">Published</dt>
              <dd className="mt-1 text-2xl font-light tabular-nums text-ink">{stats.blogs.PUBLISHED}</dd>
            </div>
            <div className="rounded-xl bg-canvas p-3">
              <dt className="text-xs text-ink-soft">Drafts</dt>
              <dd className="mt-1 text-2xl font-light tabular-nums text-ink">{stats.blogs.DRAFT}</dd>
            </div>
          </dl>
          <Link href={stats.blogs.total ? "/admin/blogs" : "/admin/blogs?new=1"} className="mt-4 inline-block text-[13px] font-medium text-ink hover:underline">
            {stats.blogs.total ? "Manage posts" : "Write your first post"}
          </Link>
        </Panel>
      </div>
    </div>
  );
}

function weekDelta(now: number, prev: number) {
  if (!prev) return now ? "first leads in two weeks" : "quiet two weeks";
  const pct = Math.round(((now - prev) / prev) * 100);
  if (pct === 0) return "same as last week";
  return `${pct > 0 ? "up" : "down"} ${Math.abs(pct)}% on last week`;
}

function Stat({ label, value, note, tone }: { label: string; value: string; note: string; tone?: "warn" | "ok" }) {
  return (
    <div className="px-5 py-4">
      <div className="text-xs text-ink-soft">{label}</div>
      <div className="mt-1.5 flex items-baseline gap-2">
        <span className="text-4xl font-light tabular-nums tracking-tight text-ink">{value}</span>
      </div>
      <div className={`mt-1 text-xs ${tone === "warn" ? "text-amber-700" : "text-ink-faint"}`}>{note}</div>
    </div>
  );
}

/** Leads per day with gridlines; the last 7 days sit in a highlighted band (reference: "this week"). */
function Trend({ series }: { series: { date: string; count: number }[] }) {
  const max = Math.max(4, ...series.map((d) => d.count));
  const top = Math.ceil(max / 4) * 4;
  const ticks = [top, (top * 3) / 4, top / 2, top / 4, 0];
  const total = series.reduce((a, d) => a + d.count, 0);
  const label = (iso: string) => new Date(iso + "T00:00").toLocaleDateString(undefined, { day: "numeric", month: "short" });

  return (
    <Panel
      title="Leads per day"
      action={
        <span className="flex items-center gap-3 text-xs text-ink-soft">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-ink" /> Leads
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-sm bg-blue-100" /> This week
          </span>
        </span>
      }
      bodyClassName="px-5 pb-4 pt-4"
    >
      <div className="flex gap-3" role="img" aria-label={`Leads per day over the last 14 days, ${total} in total`}>
        <div className="flex h-44 flex-col justify-between pb-5 text-right text-[11px] tabular-nums text-ink-faint">
          {ticks.map((t) => (
            <span key={t}>{t}</span>
          ))}
        </div>
        <div className="relative flex-1">
          {/* gridlines */}
          <div className="absolute inset-x-0 top-0 flex h-39 flex-col justify-between" aria-hidden>
            {ticks.map((t) => (
              <span key={t} className="border-t border-dashed border-line" />
            ))}
          </div>
          {/* this-week band */}
          <div className="absolute bottom-5 right-0 top-0 w-1/2 rounded-lg bg-blue-50" aria-hidden />
          <div className="relative flex h-44 items-end gap-1.5 pb-5">
            {series.map((d, i) => (
              <div key={d.date} className="group relative flex h-full flex-1 flex-col justify-end" title={`${label(d.date)}: ${d.count}`}>
                <div
                  className={`mx-auto w-full max-w-[22px] rounded-t-md transition-colors ${d.count ? (i >= 7 ? "bg-ink" : "bg-ink/35") : "bg-line"}`}
                  style={{ height: d.count ? `${(d.count / top) * 100}%` : "3px" }}
                />
                {(i === 0 || i === 7 || i === series.length - 1) && (
                  <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 translate-y-full whitespace-nowrap text-[11px] text-ink-faint">
                    {i === series.length - 1 ? "Today" : label(d.date)}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </Panel>
  );
}

function Skeleton() {
  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]" aria-busy="true" aria-label="Loading dashboard">
      <div className="space-y-5">
        <div className="h-40 animate-pulse rounded-2xl bg-white" />
        <div className="h-28 animate-pulse rounded-2xl bg-white" />
        <div className="h-64 animate-pulse rounded-2xl bg-white" />
      </div>
      <div className="space-y-5">
        <div className="h-80 animate-pulse rounded-2xl bg-white" />
        <div className="h-36 animate-pulse rounded-2xl bg-white" />
      </div>
    </div>
  );
}
