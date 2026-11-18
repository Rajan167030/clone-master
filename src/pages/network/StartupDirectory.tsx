import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Building2, Loader2, MapPin, Search, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSEO } from "@/hooks/useSEO";
import { Chip, Empty, FilterPills, Logo, NetworkLayout, Spinner } from "@/components/network/NetworkUI";
import { listStartupsApi, type LookingFor, type StartupCard, type StartupStage } from "@/lib/api";
import { getToken } from "@/lib/session";
import { LOOKING_FOR_LABEL, STAGE_LABEL, stageLabel } from "@/lib/network";

const StartupDirectory = () => {
  useSEO({ title: "Startup Directory | Founders Connect", description: "Discover startups and founders in the Founders Connect community." });
  const token = getToken();
  const [params, setParams] = useSearchParams();
  const [search, setSearch] = useState(params.get("search") || "");
  const [items, setItems] = useState<StartupCard[] | null>(null);
  const [sectors, setSectors] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  const filters = {
    search: params.get("search") || undefined,
    sector: params.get("sector") || undefined,
    stage: params.get("stage") || undefined,
    lookingFor: params.get("lookingFor") || undefined,
    city: params.get("city") || undefined,
  };
  const key = JSON.stringify(filters);

  useEffect(() => {
    setItems(null);
    setPage(1);
    listStartupsApi({ ...filters, page: "1" }, token)
      .then((r) => {
        setItems(r.startups);
        setHasMore(r.hasMore);
        if (r.sectors.length) setSectors(r.sectors);
      })
      .catch(() => setItems([]));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, token]);

  const setFilter = (k: string, v: string) => {
    const next = new URLSearchParams(params);
    if (v) next.set(k, v);
    else next.delete(k);
    setParams(next, { replace: true });
  };

  const more = async () => {
    setLoadingMore(true);
    const r = await listStartupsApi({ ...filters, page: String(page + 1) }, token).catch(() => null);
    if (r) {
      setItems((prev) => [...(prev || []), ...r.startups]);
      setHasMore(r.hasMore);
      setPage(page + 1);
    }
    setLoadingMore(false);
  };

  return (
    <NetworkLayout
      title="Startup directory"
      subtitle="Founders building across the Founders Connect community."
      actions={token ? <Button asChild variant="outline"><Link to="/network/profile">List my startup</Link></Button> : undefined}
    >
      <div className="mb-6 space-y-3">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setFilter("search", search.trim());
          }}
          className="flex gap-2"
        >
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input className="pl-9" placeholder="Search startups, sectors, skills" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <Input className="w-40" placeholder="City" defaultValue={filters.city} onBlur={(e) => setFilter("city", e.target.value.trim())} />
          <Button type="submit" variant="outline">Search</Button>
        </form>
        <FilterPills options={Object.keys(STAGE_LABEL) as Exclude<StartupStage, "">[]} labels={STAGE_LABEL} value={(filters.stage || "") as Exclude<StartupStage, "">} onChange={(v) => setFilter("stage", v)} />
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="text-slate-500">Looking for:</span>
          <FilterPills options={Object.keys(LOOKING_FOR_LABEL) as LookingFor[]} labels={LOOKING_FOR_LABEL} value={(filters.lookingFor || "") as LookingFor} onChange={(v) => setFilter("lookingFor", v)} />
        </div>
        {sectors.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {sectors.map((s) => (
              <button key={s} type="button" onClick={() => setFilter("sector", filters.sector === s ? "" : s)} className={`rounded-md px-2 py-0.5 text-xs ${filters.sector === s ? "bg-violet-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-violet-50"}`}>
                #{s}
              </button>
            ))}
          </div>
        )}
      </div>

      {!items ? (
        <Spinner />
      ) : items.length === 0 ? (
        <Empty icon={Building2} title="No startups match" text="Try clearing a filter, or be the first by listing your startup." />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((s) => (
              <Link key={s.slug} to={`/startups/${s.slug}`} className="flex flex-col rounded-2xl border border-slate-200 bg-white p-5 transition-all hover:-translate-y-0.5 hover:border-violet-300 hover:shadow-sm">
                <div className="flex items-start gap-3">
                  <Logo name={s.startupName} url={s.logoUrl} />
                  <div className="min-w-0">
                    <p className="truncate font-heading font-bold text-slate-900">{s.startupName}</p>
                    <p className="flex items-center gap-1 text-xs text-slate-500">
                      {stageLabel(s.stage) && <span>{stageLabel(s.stage)}</span>}
                      {s.city && <><MapPin size={11} /> {s.city}</>}
                      <span className="inline-flex items-center gap-0.5"><Users size={11} /> {s.teamSize}</span>
                    </p>
                  </div>
                </div>
                {s.oneLiner && <p className="mt-3 line-clamp-2 text-sm text-slate-600">{s.oneLiner}</p>}
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {s.sectors.slice(0, 3).map((x) => <Chip key={x}>{x}</Chip>)}
                  {s.lookingFor.slice(0, 2).map((x) => <Chip key={x} tone="violet">Seeking {LOOKING_FOR_LABEL[x].toLowerCase()}</Chip>)}
                </div>
                <p className="mt-auto pt-4 text-xs text-slate-500">by <span className="font-medium text-slate-700">{s.founder.fullName}</span></p>
              </Link>
            ))}
          </div>
          {hasMore && (
            <div className="mt-6 text-center">
              <Button variant="outline" onClick={more} disabled={loadingMore}>{loadingMore && <Loader2 size={14} className="mr-1.5 animate-spin" />} Load more</Button>
            </div>
          )}
        </>
      )}
    </NetworkLayout>
  );
};

export default StartupDirectory;
