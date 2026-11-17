"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Avatar,
  ErrorNote,
  LEAD_STATUSES,
  PageHeader,
  Pagination,
  Pill,
  RowChevron,
  STATUS_META,
  SearchInput,
  StatusPill,
  Tabs,
  readQueryParam,
  thCls,
  timeAgo,
  type LeadRow,
  type LeadStatus,
} from "@/src/components/admin/shared";

const LIMIT = 12;
type Filter = "" | LeadStatus;

export default function LeadsPage() {
  const router = useRouter();
  const [leads, setLeads] = useState<LeadRow[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<Filter>("");
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [counts, setCounts] = useState<Record<LeadStatus, number> | null>(null);
  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Pick up ?q= (sidebar search) and ?status= (dashboard links) once
  useEffect(() => {
    const q = readQueryParam("q") ?? "";
    const s = (readQueryParam("status") ?? "").toUpperCase();
    setSearch(q);
    setQuery(q);
    if ((LEAD_STATUSES as readonly string[]).includes(s)) setStatus(s as LeadStatus);
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    const t = setTimeout(() => {
      setQuery(search.trim());
      setPage(1);
    }, 300);
    return () => clearTimeout(t);
  }, [search, ready]);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((r) => (r.ok ? r.json() : null))
      .then((s) => s && setCounts(s.leads.byStatus))
      .catch(() => {});
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams({ page: String(page), limit: String(LIMIT) });
      if (status) params.set("status", status);
      if (query) params.set("query", query);
      const res = await fetch(`/api/lead?${params}`);
      if (res.status === 401) return router.replace("/admin/login");
      if (!res.ok) throw new Error("failed");
      const json = await res.json();
      setLeads(json.data);
      setTotal(json.total);
      setTotalPages(json.totalPages);
    } catch {
      setError("Could not load leads.");
    } finally {
      setLoading(false);
    }
  }, [page, status, query, router]);

  useEffect(() => {
    if (ready) load();
  }, [load, ready]);

  const allCount = counts ? Object.values(counts).reduce((a, b) => a + b, 0) : undefined;
  const tabs = [
    { value: "" as Filter, label: "All", count: allCount },
    ...LEAD_STATUSES.map((s) => ({ value: s as Filter, label: STATUS_META[s].label, count: counts?.[s] })),
  ];

  return (
    <div>
      <PageHeader
        breadcrumb={[{ label: "Workspace", href: "/admin" }, { label: "Leads" }]}
        title="Leads"
        badge={allCount !== undefined && <Pill>{allCount} total</Pill>}
        description="Demo requests from the landing page. Open a lead to see the details and move it forward."
      />

      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <Tabs
          label="Filter leads by status"
          tabs={tabs}
          value={status}
          onChange={(v) => {
            setStatus(v);
            setPage(1);
          }}
        />
        <SearchInput value={search} onChange={setSearch} placeholder="Search name, email or company" />
      </div>

      {error && <ErrorNote message={error} onRetry={load} />}

      <section className="overflow-hidden rounded-2xl border border-line bg-white">
        <div className="overflow-x-auto">
          <table className="w-full min-w-190 text-left text-sm">
            <thead className="border-b border-line">
              <tr>
                <th scope="col" className={thCls}>Lead</th>
                <th scope="col" className={thCls}>Company</th>
                <th scope="col" className={thCls}>Team</th>
                <th scope="col" className={thCls}>Status</th>
                <th scope="col" className={thCls}>Received</th>
                <th scope="col" className="w-10" aria-label="Open" />
              </tr>
            </thead>
            <tbody className={`divide-y divide-line ${loading && leads.length ? "opacity-60" : ""}`}>
              {loading && !leads.length ? (
                Array.from({ length: 6 }, (_, i) => (
                  <tr key={i}>
                    <td colSpan={6} className="px-5 py-4">
                      <div className="h-5 animate-pulse rounded bg-canvas" />
                    </td>
                  </tr>
                ))
              ) : !leads.length ? (
                <tr>
                  <td colSpan={6} className="px-5 py-16 text-center">
                    <div className="text-sm font-medium text-ink">{query || status ? "No leads match" : "No leads yet"}</div>
                    <div className="mt-1 text-sm text-ink-soft">
                      {query || status ? "Clear the search or pick another status." : "Demo requests from the landing page will appear here."}
                    </div>
                  </td>
                </tr>
              ) : (
                leads.map((l) => {
                  const team = (l.noOfAdmin ?? 0) + (l.noOfManagers ?? 0) + (l.noOfemployee ?? 0);
                  return (
                    <tr key={l._id} onClick={() => router.push(`/admin/leads/${l._id}`)} className="group cursor-pointer transition-colors hover:bg-canvas/70">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <Avatar name={l.name} />
                          <div className="min-w-0">
                            <Link href={`/admin/leads/${l._id}`} onClick={(e) => e.stopPropagation()} className="block truncate font-medium text-ink focus-visible:underline">
                              {l.name}
                            </Link>
                            <div className="truncate text-xs text-ink-faint">{l.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-ink">{l.companyName}</td>
                      <td className="px-5 py-3 tabular-nums text-ink-soft">{team ? `${team} people` : "—"}</td>
                      <td className="px-5 py-3">
                        <StatusPill status={l.status} />
                      </td>
                      <td className="whitespace-nowrap px-5 py-3 text-ink-soft">{timeAgo(l.createdAt)}</td>
                      <td className="pr-4">
                        <RowChevron />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        <Pagination page={page} totalPages={totalPages} total={total} limit={LIMIT} onPage={setPage} />
      </section>
    </div>
  );
}
