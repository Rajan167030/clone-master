import { useCallback, useEffect, useState } from "react";
import { Download, ExternalLink, Inbox, Mail, Phone, RefreshCw, Search, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { getToken } from "@/lib/session";
import { cn } from "@/lib/utils";
import {
  deleteAdminCohortApplicationApi,
  getAdminCohortApplicationsApi,
  updateAdminCohortApplicationApi,
  type Cohort,
  type CohortApplication,
  type CohortApplicationStats,
  type CohortApplicationStatus,
} from "@/lib/api";

const APPLICATION_STATUSES: { key: CohortApplicationStatus; label: string; tone: string }[] = [
  { key: "new", label: "New", tone: "bg-sky-50 text-sky-700 border-sky-200" },
  { key: "reviewing", label: "Reviewing", tone: "bg-amber-50 text-amber-700 border-amber-200" },
  { key: "shortlisted", label: "Shortlisted", tone: "bg-violet-50 text-violet-700 border-violet-200" },
  { key: "interview", label: "Interview", tone: "bg-indigo-50 text-indigo-700 border-indigo-200" },
  { key: "accepted", label: "Accepted", tone: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  { key: "waitlisted", label: "Waitlisted", tone: "bg-slate-100 text-slate-700 border-slate-200" },
  { key: "rejected", label: "Rejected", tone: "bg-rose-50 text-rose-700 border-rose-200" },
];

const STATUS_META = Object.fromEntries(APPLICATION_STATUSES.map((s) => [s.key, s])) as Record<
  CohortApplicationStatus,
  (typeof APPLICATION_STATUSES)[number]
>;

const PAGE_SIZE = 25;

const formatDate = (value?: string) =>
  value ? new Date(value).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—";

const formatDateTime = (value?: string) =>
  value
    ? new Date(value).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })
    : "—";

const StatusBadge = ({ status }: { status: CohortApplicationStatus }) => (
  <span className={cn("inline-flex rounded-full border px-2 py-0.5 text-[11px] font-semibold", STATUS_META[status]?.tone)}>
    {STATUS_META[status]?.label || status}
  </span>
);

const CSV_COLUMNS: [keyof CohortApplication, string][] = [
  ["cohortTitle", "Cohort"],
  ["founderName", "Founder"],
  ["email", "Email"],
  ["phone", "Phone"],
  ["city", "City"],
  ["linkedinUrl", "LinkedIn"],
  ["startupName", "Startup"],
  ["website", "Website"],
  ["industry", "Industry"],
  ["stage", "Stage"],
  ["teamSize", "Team size"],
  ["monthlyRevenue", "Monthly revenue"],
  ["fundingRaised", "Funding raised"],
  ["pitch", "Pitch"],
  ["whyJoin", "Why join"],
  ["deckUrl", "Deck"],
  ["referralSource", "Source"],
  ["status", "Status"],
  ["score", "Score"],
  ["adminNotes", "Admin notes"],
  ["createdAt", "Applied at"],
];

const toCsv = (rows: CohortApplication[]) => {
  const escape = (value: unknown) => `"${String(value ?? "").replace(/"/g, '""')}"`;
  return [
    CSV_COLUMNS.map(([, label]) => escape(label)).join(","),
    ...rows.map((row) => CSV_COLUMNS.map(([key]) => escape(row[key])).join(",")),
  ].join("\n");
};

type Props = {
  cohorts: Cohort[];
  cohortFilter: string;
  onCohortFilterChange: (slug: string) => void;
  onChanged: () => void;
};

const AdminCohortApplications = ({ cohorts, cohortFilter, onCohortFilterChange, onChanged }: Props) => {
  const token = getToken() || "";
  const { toast } = useToast();

  const [applications, setApplications] = useState<CohortApplication[]>([]);
  const [stats, setStats] = useState<CohortApplicationStats | null>(null);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("all");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  const [selected, setSelected] = useState<CohortApplication | null>(null);
  const [draft, setDraft] = useState({ status: "new" as CohortApplicationStatus, statusNote: "", adminNotes: "", score: "" });
  const [saving, setSaving] = useState(false);

  // Debounce the search box.
  useEffect(() => {
    const timer = window.setTimeout(() => setSearch(searchInput.trim()), 300);
    return () => window.clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => setPage(1), [cohortFilter, status, search]);

  const load = useCallback(() => {
    if (!token) return;
    setLoading(true);
    getAdminCohortApplicationsApi(token, { cohort: cohortFilter, status, search, page, limit: PAGE_SIZE })
      .then((res) => {
        setApplications(res.applications);
        setStats(res.stats);
        setTotal(res.total);
        setPages(res.pages);
      })
      .catch((error) =>
        toast({
          title: "Failed to load applications",
          description: error instanceof Error ? error.message : "Please try again.",
          variant: "destructive",
        })
      )
      .finally(() => setLoading(false));
  }, [token, cohortFilter, status, search, page, toast]);

  useEffect(() => {
    load();
  }, [load]);

  const openApplication = (application: CohortApplication) => {
    setSelected(application);
    setDraft({
      status: application.status,
      statusNote: "",
      adminNotes: application.adminNotes || "",
      score: application.score === null || application.score === undefined ? "" : String(application.score),
    });
  };

  const applyUpdate = (updated: CohortApplication) => {
    setApplications((list) => list.map((a) => (a._id === updated._id ? updated : a)));
    if (selected?._id === updated._id) setSelected(updated);
  };

  const quickStatus = async (application: CohortApplication, next: CohortApplicationStatus) => {
    try {
      const res = await updateAdminCohortApplicationApi(token, application._id, { status: next });
      applyUpdate(res.application);
      toast({ title: `Moved to ${STATUS_META[next].label}`, description: application.founderName });
      load();
      onChanged();
    } catch (error) {
      toast({ title: "Update failed", description: error instanceof Error ? error.message : "", variant: "destructive" });
    }
  };

  const saveDraft = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      const res = await updateAdminCohortApplicationApi(token, selected._id, {
        status: draft.status,
        statusNote: draft.statusNote,
        adminNotes: draft.adminNotes,
        score: draft.score === "" ? null : Number(draft.score),
      });
      applyUpdate(res.application);
      setDraft((d) => ({ ...d, statusNote: "" }));
      toast({ title: "Application saved", description: selected.founderName });
      load();
      onChanged();
    } catch (error) {
      toast({ title: "Save failed", description: error instanceof Error ? error.message : "", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const remove = async (application: CohortApplication) => {
    if (!window.confirm(`Delete the application from ${application.founderName} (${application.startupName})?`)) return;
    try {
      await deleteAdminCohortApplicationApi(token, application._id);
      toast({ title: "Application deleted" });
      setSelected(null);
      load();
      onChanged();
    } catch (error) {
      toast({ title: "Delete failed", description: error instanceof Error ? error.message : "", variant: "destructive" });
    }
  };

  const exportCsv = async () => {
    setExporting(true);
    try {
      const rows: CohortApplication[] = [];
      for (let p = 1; ; p += 1) {
        const res = await getAdminCohortApplicationsApi(token, { cohort: cohortFilter, status, search, page: p, limit: 200 });
        rows.push(...res.applications);
        if (p >= res.pages) break;
      }
      const blob = new Blob([toCsv(rows)], { type: "text/csv;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `cohort-applications-${cohortFilter}-${new Date().toISOString().slice(0, 10)}.csv`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      toast({ title: "Export failed", description: error instanceof Error ? error.message : "", variant: "destructive" });
    } finally {
      setExporting(false);
    }
  };

  const selectedCohort = cohorts.find((c) => c.slug === cohortFilter);

  return (
    <div className="space-y-5">
      {/* Pipeline tiles */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
        {[{ key: "all", label: "Total", tone: "" }, ...APPLICATION_STATUSES].map((item) => {
          const count = item.key === "all" ? stats?.total ?? 0 : stats?.[item.key as CohortApplicationStatus] ?? 0;
          const active = status === item.key;
          return (
            <button
              key={item.key}
              type="button"
              onClick={() => setStatus(item.key)}
              className={cn(
                "rounded-xl border bg-white p-3 text-left transition-all hover:border-purple-300",
                active ? "border-purple-500 ring-2 ring-purple-500/15" : "border-slate-200"
              )}
            >
              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">{item.label}</p>
              <p className="mt-1 font-heading text-2xl font-bold text-slate-900">{count}</p>
            </button>
          );
        })}
      </div>

      {selectedCohort?.seats ? (
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-700">Seats filled · {selectedCohort.title}</span>
            <span className="text-slate-500">
              {stats?.accepted ?? 0} / {selectedCohort.seats}
            </span>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-purple-600 transition-all"
              style={{ width: `${Math.min(100, ((stats?.accepted ?? 0) / selectedCohort.seats) * 100)}%` }}
            />
          </div>
        </div>
      ) : null}

      {/* Filters */}
      <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-3 md:flex-row md:items-center">
        <select
          value={cohortFilter}
          onChange={(e) => onCohortFilterChange(e.target.value)}
          className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm md:w-64"
        >
          <option value="all">All cohorts</option>
          {cohorts.map((c) => (
            <option key={c.slug} value={c.slug}>
              {c.title}
            </option>
          ))}
        </select>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm md:w-44"
        >
          <option value="all">All statuses</option>
          {APPLICATION_STATUSES.map((s) => (
            <option key={s.key} value={s.key}>
              {s.label}
            </option>
          ))}
        </select>
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search founder, startup, email, city, industry…"
            className="pl-9"
          />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={load} className="h-10 gap-1.5">
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={exportCsv} disabled={exporting || total === 0} className="h-10 gap-1.5">
            <Download size={14} /> {exporting ? "Exporting…" : "Export CSV"}
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        {loading && applications.length === 0 ? (
          <div className="flex justify-center py-16">
            <div className="h-7 w-7 animate-spin rounded-full border-2 border-purple-600 border-t-transparent" />
          </div>
        ) : applications.length === 0 ? (
          <div className="py-16 text-center text-slate-500">
            <Inbox className="mx-auto h-8 w-8 text-slate-300" />
            <p className="mt-2 text-sm font-medium">No applications match these filters.</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead>Founder / Startup</TableHead>
                <TableHead className="hidden lg:table-cell">Cohort</TableHead>
                <TableHead className="hidden md:table-cell">Stage</TableHead>
                <TableHead className="hidden md:table-cell">City</TableHead>
                <TableHead className="hidden sm:table-cell">Applied</TableHead>
                <TableHead className="hidden sm:table-cell">Score</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {applications.map((application) => (
                <TableRow key={application._id} className="cursor-pointer" onClick={() => openApplication(application)}>
                  <TableCell>
                    <p className="font-semibold text-slate-900">
                      {application.founderName}
                      {application.isDemo && (
                        <Badge variant="outline" className="ml-2 text-[9px] uppercase text-slate-400">
                          Demo
                        </Badge>
                      )}
                    </p>
                    <p className="text-xs text-slate-500">
                      {application.startupName}
                      {application.industry ? ` · ${application.industry}` : ""}
                    </p>
                  </TableCell>
                  <TableCell className="hidden max-w-[200px] truncate text-xs text-slate-600 lg:table-cell">
                    {application.cohortTitle}
                  </TableCell>
                  <TableCell className="hidden text-xs text-slate-600 md:table-cell">{application.stage || "—"}</TableCell>
                  <TableCell className="hidden text-xs text-slate-600 md:table-cell">{application.city || "—"}</TableCell>
                  <TableCell className="hidden text-xs text-slate-600 sm:table-cell">{formatDate(application.createdAt)}</TableCell>
                  <TableCell className="hidden text-xs font-semibold text-slate-700 sm:table-cell">
                    {application.score ?? "—"}
                  </TableCell>
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <select
                      value={application.status}
                      onChange={(e) => quickStatus(application, e.target.value as CohortApplicationStatus)}
                      className={cn(
                        "rounded-full border px-2 py-1 text-[11px] font-semibold focus:outline-none",
                        STATUS_META[application.status]?.tone
                      )}
                    >
                      {APPLICATION_STATUSES.map((s) => (
                        <option key={s.key} value={s.key}>
                          {s.label}
                        </option>
                      ))}
                    </select>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {pages > 1 && (
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span>
            Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, total)} of {total}
          </span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
              Previous
            </Button>
            <Button variant="outline" size="sm" disabled={page >= pages} onClick={() => setPage((p) => p + 1)}>
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Detail drawer */}
      <Sheet open={Boolean(selected)} onOpenChange={(open) => !open && setSelected(null)}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-xl">
          {selected && (
            <>
              <SheetHeader className="text-left">
                <div className="flex items-center gap-2">
                  <StatusBadge status={selected.status} />
                  {selected.isDemo && <Badge variant="outline" className="text-[10px] uppercase">Demo</Badge>}
                </div>
                <SheetTitle className="font-heading text-xl">{selected.founderName}</SheetTitle>
                <SheetDescription>
                  {selected.startupName} · {selected.cohortTitle}
                </SheetDescription>
              </SheetHeader>

              <div className="mt-4 flex flex-wrap gap-2">
                <Button asChild variant="outline" size="sm" className="gap-1.5">
                  <a href={`mailto:${selected.email}`}>
                    <Mail size={14} /> {selected.email}
                  </a>
                </Button>
                <Button asChild variant="outline" size="sm" className="gap-1.5">
                  <a href={`tel:${selected.phone}`}>
                    <Phone size={14} /> {selected.phone}
                  </a>
                </Button>
              </div>

              <dl className="mt-5 grid grid-cols-2 gap-3 text-sm">
                {[
                  ["City", selected.city],
                  ["Industry", selected.industry],
                  ["Stage", selected.stage],
                  ["Team size", selected.teamSize],
                  ["Monthly revenue", selected.monthlyRevenue],
                  ["Funding raised", selected.fundingRaised],
                  ["Source", selected.referralSource],
                  ["Applied", formatDate(selected.createdAt)],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-lg bg-slate-50 p-2.5">
                    <dt className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">{label}</dt>
                    <dd className="mt-0.5 font-medium text-slate-800">{value || "—"}</dd>
                  </div>
                ))}
              </dl>

              <div className="mt-4 flex flex-wrap gap-3 text-xs">
                {[
                  ["Website", selected.website],
                  ["LinkedIn", selected.linkedinUrl],
                  ["Pitch deck", selected.deckUrl],
                ]
                  .filter(([, url]) => url)
                  .map(([label, url]) => (
                    <a
                      key={label}
                      href={/^https?:\/\//i.test(url) ? url : `https://${url}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 font-semibold text-purple-700 hover:underline"
                    >
                      {label} <ExternalLink size={12} />
                    </a>
                  ))}
              </div>

              {selected.pitch && (
                <div className="mt-5">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">What they're building</p>
                  <p className="mt-1.5 whitespace-pre-line text-sm leading-relaxed text-slate-700">{selected.pitch}</p>
                </div>
              )}
              {selected.whyJoin && (
                <div className="mt-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Why this cohort</p>
                  <p className="mt-1.5 whitespace-pre-line text-sm leading-relaxed text-slate-700">{selected.whyJoin}</p>
                </div>
              )}

              {/* Review controls */}
              <div className="mt-6 space-y-3 rounded-xl border border-purple-100 bg-purple-50/40 p-4">
                <p className="text-sm font-semibold text-slate-900">Review</p>
                <div className="grid grid-cols-[1fr_96px] gap-3">
                  <label className="space-y-1">
                    <span className="text-xs font-semibold text-slate-600">Status</span>
                    <select
                      value={draft.status}
                      onChange={(e) => setDraft((d) => ({ ...d, status: e.target.value as CohortApplicationStatus }))}
                      className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm"
                    >
                      {APPLICATION_STATUSES.map((s) => (
                        <option key={s.key} value={s.key}>
                          {s.label}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="space-y-1">
                    <span className="text-xs font-semibold text-slate-600">Score /10</span>
                    <Input
                      type="number"
                      min={0}
                      max={10}
                      value={draft.score}
                      onChange={(e) => setDraft((d) => ({ ...d, score: e.target.value }))}
                      className="bg-white"
                    />
                  </label>
                </div>
                {draft.status !== selected.status && (
                  <Input
                    value={draft.statusNote}
                    onChange={(e) => setDraft((d) => ({ ...d, statusNote: e.target.value }))}
                    placeholder="Note for this status change (optional)"
                    className="bg-white"
                  />
                )}
                <label className="block space-y-1">
                  <span className="text-xs font-semibold text-slate-600">Internal notes</span>
                  <Textarea
                    rows={3}
                    value={draft.adminNotes}
                    onChange={(e) => setDraft((d) => ({ ...d, adminNotes: e.target.value }))}
                    placeholder="Only visible to admins"
                    className="bg-white"
                  />
                </label>
                <div className="flex items-center justify-between pt-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => remove(selected)}
                    className="gap-1.5 text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                  >
                    <Trash2 size={14} /> Delete
                  </Button>
                  <Button onClick={saveDraft} disabled={saving} className="bg-purple-600 text-white hover:bg-purple-700">
                    {saving ? "Saving…" : "Save changes"}
                  </Button>
                </div>
              </div>

              {/* History */}
              {selected.statusHistory?.length > 0 && (
                <div className="mt-6">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Activity</p>
                  <ol className="mt-3 space-y-3 border-l border-slate-200 pl-4">
                    {[...selected.statusHistory].reverse().map((entry, index) => (
                      <li key={`${entry.changedAt}-${index}`} className="relative">
                        <span className="absolute -left-[21px] top-1.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-purple-500" />
                        <div className="flex flex-wrap items-center gap-2">
                          <StatusBadge status={entry.status} />
                          <span className="text-[11px] text-slate-400">{formatDateTime(entry.changedAt)}</span>
                        </div>
                        <p className="mt-1 text-xs text-slate-600">
                          {entry.note}
                          {entry.changedBy ? <span className="text-slate-400"> · {entry.changedBy}</span> : null}
                        </p>
                      </li>
                    ))}
                  </ol>
                </div>
              )}
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default AdminCohortApplications;
