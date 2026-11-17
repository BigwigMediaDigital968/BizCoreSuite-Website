"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Avatar,
  ErrorNote,
  Field,
  LEAD_FLOW,
  LEAD_STATUSES,
  Notice,
  PageHeader,
  Panel,
  STATUS_META,
  StatusPill,
  Stepper,
  btnDanger,
  btnPrimary,
  btnSecondary,
  formatDateTime,
  inputCls,
  type LeadRow,
  type LeadStatus,
  type StepState,
} from "@/src/components/admin/shared";

/** The one-click next move for each stage. */
const NEXT_ACTION: Partial<Record<LeadStatus, { to: LeadStatus; label: string }>> = {
  NEW: { to: "CONTACTED", label: "Mark as contacted" },
  CONTACTED: { to: "PENDING", label: "Move to pending" },
  PENDING: { to: "CLOSED", label: "Close as won" },
};

export default function LeadDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [lead, setLead] = useState<LeadRow | null>(null);
  const [error, setError] = useState("");
  const [notFound, setNotFound] = useState(false);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const load = useCallback(async () => {
    setError("");
    try {
      const res = await fetch(`/api/lead/${id}`);
      if (res.status === 401) return router.replace("/admin/login");
      if (res.status === 404 || res.status === 400) return setNotFound(true);
      if (!res.ok) throw new Error("failed");
      setLead(await res.json());
    } catch {
      setError("Could not load this lead.");
    }
  }, [id, router]);

  useEffect(() => {
    load();
  }, [load]);

  async function setStatus(next: LeadStatus) {
    if (!lead || next === lead.status) return;
    setSaving(true);
    setError("");
    try {
      const res = await fetch(`/api/lead/${lead._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next }),
      });
      if (!res.ok) throw new Error("failed");
      setLead(await res.json());
    } catch {
      setError("Could not update the status. Try again.");
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    if (!lead) return;
    setSaving(true);
    const res = await fetch(`/api/lead/${lead._id}`, { method: "DELETE" });
    setSaving(false);
    if (!res.ok) return setError("Could not delete this lead.");
    router.replace("/admin/leads");
  }

  if (notFound) {
    return (
      <div className="py-24 text-center">
        <h1 className="text-xl font-semibold text-ink">Lead not found</h1>
        <p className="mt-1 text-sm text-ink-soft">It may have been deleted.</p>
        <Link href="/admin/leads" className={`${btnSecondary} mt-5`}>
          Back to leads
        </Link>
      </div>
    );
  }

  if (!lead) {
    return error ? <ErrorNote message={error} onRetry={load} /> : <DetailSkeleton />;
  }

  const next = NEXT_ACTION[lead.status];
  const changed = lead.updatedAt && lead.updatedAt !== lead.createdAt;
  const team = { Admins: lead.noOfAdmin, Managers: lead.noOfManagers, Employees: lead.noOfemployee };

  return (
    <div>
      <PageHeader
        breadcrumb={[{ label: "Leads", href: "/admin/leads" }, { label: lead.name }]}
        leading={<Avatar name={lead.name} size="lg" />}
        title={lead.name}
        badge={<StatusPill status={lead.status} />}
        description={
          <>
            {lead.companyName} · Received {formatDateTime(lead.createdAt)}
          </>
        }
        actions={
          <>
            <a href={`mailto:${lead.email}`} className={btnSecondary}>
              Email
            </a>
            {next && (
              <button onClick={() => setStatus(next.to)} disabled={saving} className={btnPrimary}>
                {saving ? "Saving…" : next.label}
              </button>
            )}
          </>
        }
      />

      {error && <ErrorNote message={error} />}

      <Panel className="mb-5" bodyClassName="">
        <Stepper steps={buildSteps(lead)} />
      </Panel>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="min-w-0 space-y-5">
          {lead.status === "CLOSED" && <Notice tone="green" title="Closed as won">This company is now a customer. Hand it over to onboarding.</Notice>}
          {lead.status === "REJECTED" && <Notice tone="rose" title="Rejected">This lead is out of the pipeline. Reopen it below if that changes.</Notice>}
          {lead.status === "NEW" && <Notice tone="amber" title="Waiting for first contact">Reach out by email or phone, then mark the lead as contacted.</Notice>}

          <Panel title="Contact" bodyClassName="px-5 pb-2 pt-1">
            <dl>
              <Field label="Email">
                <a href={`mailto:${lead.email}`} className="hover:underline">
                  {lead.email}
                </a>
              </Field>
              <Field label="Phone">
                <a href={`tel:${lead.phone}`} className="hover:underline">
                  {lead.phone}
                </a>
              </Field>
              <Field label="Company">{lead.companyName}</Field>
            </dl>
          </Panel>

          <Panel title="Team size" bodyClassName="grid grid-cols-3 divide-x divide-line">
            {Object.entries(team).map(([label, value]) => (
              <div key={label} className="px-5 py-4">
                <div className="text-xs text-ink-soft">{label}</div>
                <div className="mt-1 text-3xl font-light tabular-nums tracking-tight text-ink">{value ?? "—"}</div>
              </div>
            ))}
          </Panel>

          <Panel title="Status" bodyClassName="px-5 pb-5 pt-3">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div className="w-full sm:max-w-xs">
                <label htmlFor="status" className="mb-1.5 block text-[13px] text-ink-soft">
                  Set any status
                </label>
                <select id="status" value={lead.status} disabled={saving} onChange={(e) => setStatus(e.target.value as LeadStatus)} className={inputCls}>
                  {LEAD_STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {STATUS_META[s].label}
                    </option>
                  ))}
                </select>
              </div>
              {confirmDelete ? (
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-ink-soft">Delete {lead.name}? This cannot be undone.</span>
                  <button onClick={() => setConfirmDelete(false)} className={btnSecondary}>
                    Keep
                  </button>
                  <button onClick={remove} disabled={saving} className="inline-flex items-center rounded-full bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-500 disabled:opacity-50">
                    Delete lead
                  </button>
                </div>
              ) : (
                <button onClick={() => setConfirmDelete(true)} className={btnDanger}>
                  Delete lead
                </button>
              )}
            </div>
          </Panel>
        </div>

        <Panel title="Activity" bodyClassName="px-5 pb-5 pt-4">
          <ol className="relative space-y-5 before:absolute before:bottom-2 before:left-[13px] before:top-2 before:w-px before:bg-line">
            {changed && (
              <ActivityItem
                dot={STATUS_META[lead.status].dot}
                title={`Status set to ${STATUS_META[lead.status].label.toLowerCase()}`}
                meta={formatDateTime(lead.updatedAt)}
              />
            )}
            <ActivityItem dot="bg-ink" title="Lead received" meta={`From the landing page demo form · ${formatDateTime(lead.createdAt)}`} />
          </ol>
        </Panel>
      </div>
    </div>
  );
}

function ActivityItem({ dot, title, meta }: { dot: string; title: string; meta: string }) {
  return (
    <li className="relative flex gap-3">
      <span className="relative z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white ring-1 ring-line">
        <span className={`h-2 w-2 rounded-full ${dot}`} />
      </span>
      <div className="min-w-0 pt-0.5">
        <div className="text-sm font-medium text-ink">{title}</div>
        <div className="text-xs text-ink-faint">{meta}</div>
      </div>
    </li>
  );
}

function buildSteps(lead: LeadRow): { label: string; sub?: string; state: StepState }[] {
  if (lead.status === "REJECTED") {
    return [
      { label: "Received", sub: formatDateTime(lead.createdAt), state: "done" },
      { label: "Rejected", sub: formatDateTime(lead.updatedAt), state: "failed" },
    ];
  }
  const at = LEAD_FLOW.indexOf(lead.status);
  return LEAD_FLOW.map((s, i) => ({
    label: i === 0 ? "Received" : STATUS_META[s].label,
    sub: i === 0 ? formatDateTime(lead.createdAt) : i === at ? formatDateTime(lead.updatedAt) : i > at ? "Not yet" : undefined,
    state: i < at ? "done" : i === at ? (i === 0 ? "done" : "current") : "todo",
  }));
}

function DetailSkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading lead">
      <div className="mb-6 flex items-center gap-4">
        <div className="h-14 w-14 animate-pulse rounded-full bg-white" />
        <div className="h-8 w-64 animate-pulse rounded-lg bg-white" />
      </div>
      <div className="mb-5 h-20 animate-pulse rounded-2xl bg-white" />
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="h-80 animate-pulse rounded-2xl bg-white" />
        <div className="h-48 animate-pulse rounded-2xl bg-white" />
      </div>
    </div>
  );
}
