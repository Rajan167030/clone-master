import { useCallback, useEffect, useState, type ReactNode } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowLeft, Clock, Plus, Sparkles, Trash2, type LucideIcon } from "lucide-react";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import {
  deleteAiArtifactApi,
  getAiArtifactApi,
  getAiUsageApi,
  listAiArtifactsApi,
  type AiArtifact,
  type AiArtifactKind,
  type AiArtifactRow,
} from "@/lib/api";
import { getToken } from "@/lib/session";

export const scoreTone = (score: number, max = 100) => {
  const pct = (score / max) * 100;
  return pct >= 75 ? "text-emerald-700 bg-emerald-50 border-emerald-200" : pct >= 50 ? "text-amber-700 bg-amber-50 border-amber-200" : "text-red-700 bg-red-50 border-red-200";
};

export const ScoreBadge = ({ score, label, max = 100 }: { score: number; label: string; max?: number }) => (
  <div className={`flex h-24 w-24 shrink-0 flex-col items-center justify-center rounded-2xl border ${scoreTone(score, max)}`}>
    <span className="text-3xl font-extrabold leading-none">{score}</span>
    <span className="mt-1 text-[10px] font-bold uppercase tracking-wide opacity-80">{label}</span>
  </div>
);

export const Pill = ({ children, tone = "slate" }: { children: ReactNode; tone?: "slate" | "violet" | "red" | "amber" | "emerald" }) => {
  const cls = {
    slate: "bg-slate-100 text-slate-700",
    violet: "bg-violet-100 text-violet-800",
    red: "bg-red-100 text-red-800",
    amber: "bg-amber-100 text-amber-800",
    emerald: "bg-emerald-100 text-emerald-800",
  }[tone];
  return <span className={`inline-block rounded-full px-2 py-0.5 text-[11px] font-semibold capitalize ${cls}`}>{children}</span>;
};

export const levelTone = (v: string): "red" | "amber" | "emerald" =>
  v === "high" || v === "gap" ? "red" : v === "medium" || v === "okay" ? "amber" : "emerald";

export const Section = ({ title, children, className = "" }: { title: string; children: ReactNode; className?: string }) => (
  <section className={`rounded-2xl border border-slate-200 bg-white p-5 ${className}`}>
    <h3 className="mb-3 font-heading text-base font-bold text-slate-900">{title}</h3>
    {children}
  </section>
);

export const BulletList = ({ items, empty = "None" }: { items: string[]; empty?: string }) =>
  items.length ? (
    <ul className="list-disc space-y-1.5 pl-5 text-sm text-slate-700">
      {items.map((x, i) => (
        <li key={i}>{x}</li>
      ))}
    </ul>
  ) : (
    <p className="text-sm text-slate-400">{empty}</p>
  );

/** Loads `?id=` artifact for a tool and exposes helpers to open/replace it. */
export const useToolArtifact = <T,>(kind: AiArtifactKind) => {
  const [params, setParams] = useSearchParams();
  const id = params.get("id");
  const [artifact, setArtifact] = useState<AiArtifact<T> | null>(null);
  const [loadingArtifact, setLoadingArtifact] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (!id) return setArtifact(null);
    if (artifact?._id === id) return;
    setLoadingArtifact(true);
    getAiArtifactApi<T>(getToken() || "", id)
      .then((r) => setArtifact(r.artifact.kind === kind ? r.artifact : null))
      .catch(() => setArtifact(null))
      .finally(() => setLoadingArtifact(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, kind]);

  const open = useCallback(
    (a: AiArtifact<T>) => {
      setArtifact(a);
      setParams({ id: a._id });
      setRefreshKey((k) => k + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    [setParams],
  );
  const reset = useCallback(() => {
    setArtifact(null);
    setParams({});
  }, [setParams]);

  return { artifact, setArtifact, loadingArtifact, open, reset, refreshKey };
};

type ShellProps = {
  kind: AiArtifactKind;
  icon: LucideIcon;
  title: string;
  description: string;
  hasResult: boolean;
  onNew: () => void;
  refreshKey: number;
  children: ReactNode;
};

const ToolShell = ({ kind, icon: Icon, title, description, hasResult, onNew, refreshKey, children }: ShellProps) => {
  const token = getToken() || "";
  const [, setParams] = useSearchParams();
  const [saved, setSaved] = useState<AiArtifactRow[]>([]);
  const [usage, setUsage] = useState<{ used: number; limit: number | null } | null>(null);

  useEffect(() => {
    listAiArtifactsApi(token, kind).then((r) => setSaved(r.artifacts)).catch(() => {});
    getAiUsageApi(token).then(setUsage).catch(() => {});
  }, [token, kind, refreshKey]);

  const remove = async (row: AiArtifactRow) => {
    if (!window.confirm(`Delete "${row.title}"?`)) return;
    await deleteAiArtifactApi(token, row._id).catch(() => {});
    setSaved((prev) => prev.filter((x) => x._id !== row._id));
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <header className="border-b border-slate-200 bg-white">
        <div className="container mx-auto flex max-w-7xl flex-col gap-4 px-4 py-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-4">
            <Link to="/tools" className="mt-1 text-slate-400 hover:text-violet-700" aria-label="All tools">
              <ArrowLeft size={18} />
            </Link>
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-violet-700">
              <Icon size={22} />
            </div>
            <div>
              <h1 className="font-heading text-2xl font-bold text-slate-900">{title}</h1>
              <p className="text-sm text-slate-500">{description}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {usage && usage.limit !== null && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 px-3 py-1 text-xs text-slate-600">
                <Sparkles size={12} className="text-violet-600" /> {Math.max(0, usage.limit - usage.used)}/{usage.limit} AI requests left today
              </span>
            )}
            {hasResult && (
              <Button variant="outline" size="sm" onClick={onNew}>
                <Plus size={14} className="mr-1" /> Start new
              </Button>
            )}
          </div>
        </div>
      </header>

      <div className="container mx-auto grid max-w-7xl gap-8 px-4 py-8 lg:grid-cols-[1fr_260px]">
        <main className="min-w-0">{children}</main>
        <aside className="order-first lg:order-none">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 lg:sticky lg:top-24">
            <p className="mb-3 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-slate-500">
              <Clock size={12} /> Saved
            </p>
            {saved.length === 0 ? (
              <p className="text-sm text-slate-400">Your results are saved here automatically.</p>
            ) : (
              <ul className="max-h-[60vh] space-y-1 overflow-y-auto">
                {saved.map((row) => (
                  <li key={row._id} className="group flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setParams({ id: row._id })}
                      className="min-w-0 flex-1 rounded-lg px-2 py-1.5 text-left text-sm hover:bg-slate-100"
                    >
                      <span className="block truncate font-medium text-slate-800">{row.title || "Untitled"}</span>
                      <span className="block text-[11px] text-slate-400">
                        {new Date(row.updatedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                        {row.score !== null ? ` · score ${row.score}` : ""}
                        {row.slideCount !== null ? ` · ${row.slideCount} slides` : ""}
                      </span>
                    </button>
                    <button type="button" onClick={() => remove(row)} className="p-1 text-slate-300 opacity-0 hover:text-red-600 group-hover:opacity-100" aria-label="Delete">
                      <Trash2 size={13} />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
};

export default ToolShell;
