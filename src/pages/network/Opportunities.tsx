import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Bookmark, BookmarkCheck, CalendarClock, ExternalLink, Plus, Search, Star, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useSEO } from "@/hooks/useSEO";
import { Chip, Empty, FilterPills, Logo, NetworkLayout, Spinner } from "@/components/network/NetworkUI";
import OpportunityForm from "@/components/network/OpportunityForm";
import { listOpportunitiesApi, suggestOpportunityApi, toggleSaveOpportunityApi, type OpportunityData, type OpportunityType } from "@/lib/api";
import { getToken } from "@/lib/session";
import { OPPORTUNITY_LABEL, formatDeadline } from "@/lib/network";

const Opportunities = () => {
  useSEO({ title: "Grants, Competitions & Programs | Founders Connect", description: "Startup grants, competitions, accelerators, fellowships and credits, all in one place." });
  const token = getToken();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [params] = useSearchParams();
  const [type, setType] = useState<OpportunityType | "">("");
  const [saved, setSaved] = useState(params.get("saved") === "1");
  const [showClosed, setShowClosed] = useState(false);
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [items, setItems] = useState<OpportunityData[] | null>(null);
  const [suggesting, setSuggesting] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setItems(null);
    listOpportunitiesApi({ type: type || undefined, saved: saved ? "1" : undefined, show: showClosed ? "all" : undefined, search: query || undefined }, token)
      .then((r) => setItems(r.opportunities))
      .catch(() => setItems([]));
  }, [type, saved, showClosed, query, token]);

  const toggleSave = async (o: OpportunityData) => {
    if (!token) return navigate("/login");
    const r = await toggleSaveOpportunityApi(token, o._id).catch(() => null);
    if (r) setItems((prev) => (saved && !r.savedByMe ? prev?.filter((x) => x._id !== o._id) : prev?.map((x) => (x._id === o._id ? { ...x, savedByMe: r.savedByMe } : x))) || null);
  };

  return (
    <NetworkLayout
      title="Opportunities"
      subtitle="Grants, competitions, accelerators, fellowships, credits and pitch events for startups."
      actions={token ? <Button variant="outline" onClick={() => setSuggesting(true)}><Plus size={14} className="mr-1" /> Suggest one</Button> : undefined}
    >
      <div className="mb-6 space-y-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <form onSubmit={(e) => { e.preventDefault(); setQuery(search.trim()); }} className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input className="pl-9" placeholder="Search by name, organizer or tag" value={search} onChange={(e) => setSearch(e.target.value)} />
          </form>
          {token && <label className="flex items-center gap-2 text-sm"><Switch checked={saved} onCheckedChange={setSaved} /> Saved</label>}
          <label className="flex items-center gap-2 text-sm"><Switch checked={showClosed} onCheckedChange={setShowClosed} /> Include closed</label>
        </div>
        <FilterPills options={Object.keys(OPPORTUNITY_LABEL) as OpportunityType[]} labels={OPPORTUNITY_LABEL} value={type} onChange={setType} />
      </div>

      {!items ? (
        <Spinner />
      ) : items.length === 0 ? (
        <Empty icon={Trophy} title={saved ? "No saved opportunities" : "No open opportunities right now"} text="New grants and competitions are added every week." />
      ) : (
        <div className="space-y-3">
          {items.map((o) => (
            <div key={o._id} className={`flex flex-col gap-4 rounded-2xl border bg-white p-5 sm:flex-row sm:items-center ${o.isFeatured ? "border-violet-300" : "border-slate-200"} ${o.isClosed ? "opacity-60" : ""}`}>
              <Logo name={o.organizer || o.title} url={o.logoUrl} size={52} />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <Chip tone="violet">{OPPORTUNITY_LABEL[o.type]}</Chip>
                  {o.isFeatured && <Chip tone="amber"><Star size={10} className="mr-0.5 inline" /> Featured</Chip>}
                  {o.closingSoon && <Chip tone="red">Closing soon</Chip>}
                  {o.isOnline && <Chip>Online</Chip>}
                </div>
                <Link to={`/opportunities/${o.slug}`} className="mt-1 block font-heading text-lg font-bold text-slate-900 hover:text-violet-700">{o.title}</Link>
                <p className="text-sm text-slate-500">{[o.organizer, o.benefits].filter(Boolean).join(" · ")}</p>
                {o.summary && <p className="mt-1 line-clamp-2 text-sm text-slate-600">{o.summary}</p>}
              </div>
              <div className="flex shrink-0 flex-row items-center gap-2 sm:flex-col sm:items-end">
                <span className={`inline-flex items-center gap-1 text-xs font-medium ${o.closingSoon ? "text-red-700" : "text-slate-500"}`}><CalendarClock size={12} /> {formatDeadline(o.deadline)}</span>
                <div className="flex gap-2">
                  <Button size="icon" variant="ghost" aria-label="Save" onClick={() => toggleSave(o)}>
                    {o.savedByMe ? <BookmarkCheck size={17} className="text-violet-700" /> : <Bookmark size={17} />}
                  </Button>
                  {!o.isClosed && (
                    <Button asChild size="sm" className="bg-violet-600 hover:bg-violet-700">
                      <a href={o.applyUrl} target="_blank" rel="noreferrer">Apply <ExternalLink size={13} className="ml-1" /></a>
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={suggesting} onOpenChange={setSuggesting}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader><DialogTitle>Suggest an opportunity</DialogTitle></DialogHeader>
          <OpportunityForm
            saving={saving}
            onSubmit={async (input) => {
              setSaving(true);
              try {
                const r = await suggestOpportunityApi(token || "", input);
                toast({ title: r.message });
                setSuggesting(false);
              } catch (e) {
                toast({ title: "Could not submit", description: (e as Error).message, variant: "destructive" });
              } finally {
                setSaving(false);
              }
            }}
          />
        </DialogContent>
      </Dialog>
    </NetworkLayout>
  );
};

export default Opportunities;
