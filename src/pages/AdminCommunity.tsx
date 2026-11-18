import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Check, Edit, ExternalLink, Network, Plus, Star, Trash2, X } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import OpportunityForm from "@/components/network/OpportunityForm";
import { PersonLine, Spinner } from "@/components/network/NetworkUI";
import {
  deleteAdminOpportunityApi,
  deleteCollabApi,
  getAdminNetworkStatsApi,
  listAdminCollabApi,
  listAdminGroupsApi,
  listAdminOpportunitiesApi,
  moderateAdminOpportunityApi,
  saveAdminOpportunityApi,
  updateAdminGroupFlagsApi,
  type CollabPostData,
  type GroupData,
  type OpportunityData,
} from "@/lib/api";
import { getToken } from "@/lib/session";
import { COLLAB_LABEL, OPPORTUNITY_LABEL, formatDeadline, timeAgo } from "@/lib/network";

const STATUS_BADGE: Record<string, string> = {
  published: "bg-emerald-100 text-emerald-800",
  pending: "bg-amber-100 text-amber-800",
  rejected: "bg-slate-200 text-slate-700",
};

const AdminCommunity = () => {
  const token = getToken() || "";
  const { toast } = useToast();
  const [stats, setStats] = useState<Awaited<ReturnType<typeof getAdminNetworkStatsApi>> | null>(null);
  const [opps, setOpps] = useState<OpportunityData[] | null>(null);
  const [oppFilter, setOppFilter] = useState("");
  const [editing, setEditing] = useState<OpportunityData | null | "new">(null);
  const [saving, setSaving] = useState(false);
  const [groups, setGroups] = useState<GroupData[] | null>(null);
  const [collab, setCollab] = useState<CollabPostData[] | null>(null);

  const fail = useCallback((e: unknown) => toast({ title: "Something went wrong", description: (e as Error).message, variant: "destructive" }), [toast]);
  const loadStats = useCallback(() => getAdminNetworkStatsApi(token).then(setStats).catch(() => {}), [token]);
  const loadOpps = useCallback(() => listAdminOpportunitiesApi(token, oppFilter || undefined).then((r) => setOpps(r.opportunities)).catch(fail), [token, oppFilter, fail]);

  useEffect(() => { loadStats(); }, [loadStats]);
  useEffect(() => { setOpps(null); loadOpps(); }, [loadOpps]);

  const moderate = async (o: OpportunityData, payload: { status?: string; isFeatured?: boolean }) => {
    try {
      const r = await moderateAdminOpportunityApi(token, o._id, payload);
      setOpps((prev) => prev?.map((x) => (x._id === o._id ? r.opportunity : x)) || null);
      loadStats();
    } catch (e) { fail(e); }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="border-b bg-white">
        <div className="container mx-auto flex flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <Button asChild variant="ghost" size="icon"><Link to="/admin"><ArrowLeft size={18} /></Link></Button>
            <div>
              <div className="flex items-center gap-2"><Network className="h-5 w-5 text-violet-600" /><h1 className="font-heading text-xl font-bold text-slate-900">Community & Networking</h1></div>
              <p className="text-xs text-slate-500">Opportunities, groups and the collaboration board.</p>
            </div>
          </div>
          <Button asChild variant="outline" size="sm"><Link to="/startups" target="_blank" className="gap-1.5"><ExternalLink size={14} /> View directory</Link></Button>
        </div>
      </div>

      <main className="container mx-auto px-4 py-8">
        {stats && (
          <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4 xl:grid-cols-8">
            {[
              ["Founder profiles", stats.profiles],
              ["Listed startups", stats.listed],
              ["Seeking co-founder", stats.cofounders],
              ["Connections", stats.connections],
              ["Active groups", stats.groups],
              ["Open collab posts", stats.openCollabs],
              ["Live opportunities", stats.opportunities],
              ["Pending suggestions", stats.pendingOpportunities],
            ].map(([label, value]) => (
              <Card key={label} className="border-slate-200"><CardContent className="p-4"><p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">{label}</p><p className="mt-1 text-2xl font-bold text-slate-900">{value}</p></CardContent></Card>
            ))}
          </div>
        )}

        <Tabs defaultValue="opps" onValueChange={(v) => {
          if (v === "groups" && !groups) listAdminGroupsApi(token).then((r) => setGroups(r.groups)).catch(fail);
          if (v === "collab" && !collab) listAdminCollabApi(token).then((r) => setCollab(r.posts)).catch(fail);
        }}>
          <TabsList className="mb-6">
            <TabsTrigger value="opps">Opportunities{stats?.pendingOpportunities ? <Badge className="ml-1.5 h-5 bg-violet-600 px-1.5">{stats.pendingOpportunities}</Badge> : null}</TabsTrigger>
            <TabsTrigger value="groups">Groups & circles</TabsTrigger>
            <TabsTrigger value="collab">Collab board</TabsTrigger>
          </TabsList>

          <TabsContent value="opps" className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex gap-2">
                {["", "pending", "published", "rejected"].map((s) => (
                  <button key={s || "all"} type="button" onClick={() => setOppFilter(s)} className={`rounded-full border px-3 py-1 text-xs font-semibold capitalize ${oppFilter === s ? "border-violet-600 bg-violet-600 text-white" : "border-slate-200 bg-white text-slate-600"}`}>{s || "All"}</button>
                ))}
              </div>
              <Button onClick={() => setEditing("new")} className="bg-violet-600 hover:bg-violet-700"><Plus size={14} className="mr-1" /> Add opportunity</Button>
            </div>
            {!opps ? <Spinner /> : opps.length === 0 ? <p className="rounded-xl border border-dashed border-slate-300 bg-white py-12 text-center text-sm text-slate-500">No opportunities here.</p> : (
              <div className="space-y-2">
                {opps.map((o) => (
                  <div key={o._id} className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 md:flex-row md:items-center">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-semibold text-slate-900">{o.title}</span>
                        <Badge className={STATUS_BADGE[o.status]}>{o.status}</Badge>
                        <Badge variant="outline">{OPPORTUNITY_LABEL[o.type]}</Badge>
                        {o.isFeatured && <Badge className="bg-amber-100 text-amber-800">Featured</Badge>}
                      </div>
                      <p className="text-xs text-slate-500">{[o.organizer, formatDeadline(o.deadline), `${o.saveCount} saves`].filter(Boolean).join(" · ")}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {o.status === "pending" && (
                        <>
                          <Button size="sm" className="bg-violet-600 hover:bg-violet-700" onClick={() => moderate(o, { status: "published" })}><Check size={13} className="mr-1" /> Approve</Button>
                          <Button size="sm" variant="outline" onClick={() => moderate(o, { status: "rejected" })}><X size={13} className="mr-1" /> Reject</Button>
                        </>
                      )}
                      <Button size="sm" variant="ghost" onClick={() => moderate(o, { status: o.status, isFeatured: !o.isFeatured })}><Star size={14} className={o.isFeatured ? "fill-amber-400 text-amber-500" : ""} /></Button>
                      <Button size="sm" variant="outline" onClick={() => setEditing(o)}><Edit size={13} className="mr-1" /> Edit</Button>
                      <Button size="sm" variant="ghost" className="text-red-600" onClick={async () => { if (window.confirm(`Delete "${o.title}"?`)) { await deleteAdminOpportunityApi(token, o._id).catch(fail); setOpps((p) => p?.filter((x) => x._id !== o._id) || null); loadStats(); } }}><Trash2 size={14} /></Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="groups">
            {!groups ? <Spinner /> : (
              <div className="space-y-2">
                {groups.map((g) => (
                  <div key={g._id} className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 md:flex-row md:items-center">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <Link to={`/groups/${g.slug}`} target="_blank" className="font-semibold text-slate-900 hover:text-violet-700">{g.name}</Link>
                        <Badge variant="outline">{g.kind}</Badge>
                        <Badge variant="outline">{g.privacy}</Badge>
                        {g.isFeatured && <Badge className="bg-amber-100 text-amber-800">Featured</Badge>}
                        {g.isArchived && <Badge className="bg-slate-200 text-slate-700">Archived</Badge>}
                      </div>
                      <p className="text-xs text-slate-500">{g.memberCount} members · owner {g.owner?.fullName} · {timeAgo(g.createdAt)}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={async () => { const r = await updateAdminGroupFlagsApi(token, g._id, { isFeatured: !g.isFeatured }).catch((e) => { fail(e); return null; }); if (r) setGroups((p) => p?.map((x) => (x._id === g._id ? { ...x, ...r.group, owner: x.owner } : x)) || null); }}>{g.isFeatured ? "Unfeature" : "Feature"}</Button>
                      <Button size="sm" variant="ghost" className={g.isArchived ? "" : "text-red-600"} onClick={async () => { const r = await updateAdminGroupFlagsApi(token, g._id, { isArchived: !g.isArchived }).catch((e) => { fail(e); return null; }); if (r) setGroups((p) => p?.map((x) => (x._id === g._id ? { ...x, ...r.group, owner: x.owner } : x)) || null); }}>{g.isArchived ? "Restore" : "Archive"}</Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="collab">
            {!collab ? <Spinner /> : (
              <div className="space-y-2">
                {collab.map((p) => (
                  <div key={p._id} className="rounded-xl border border-slate-200 bg-white p-4">
                    <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2"><Badge variant="outline">{COLLAB_LABEL[p.type]}</Badge><Badge className={p.status === "open" ? "bg-emerald-100 text-emerald-800" : "bg-slate-200 text-slate-700"}>{p.status}</Badge></div>
                        <p className="mt-1 font-semibold text-slate-900">{p.title}</p>
                        <p className="line-clamp-2 text-sm text-slate-600">{p.description}</p>
                      </div>
                      <Button size="sm" variant="ghost" className="text-red-600" onClick={async () => { if (window.confirm("Remove this post?")) { await deleteCollabApi(token, p._id).catch(fail); setCollab((x) => x?.filter((y) => y._id !== p._id) || null); loadStats(); } }}><Trash2 size={14} className="mr-1" /> Remove</Button>
                    </div>
                    <div className="mt-2"><PersonLine person={p.author} sub={`${timeAgo(p.createdAt)} · ${p.interestCount} responses`} /></div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>

      <Dialog open={editing !== null} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader><DialogTitle>{editing === "new" ? "Add opportunity" : "Edit opportunity"}</DialogTitle></DialogHeader>
          <OpportunityForm
            admin
            saving={saving}
            initial={editing === "new" ? null : editing}
            onSubmit={async (input) => {
              setSaving(true);
              try {
                await saveAdminOpportunityApi(token, { ...input, _id: editing && editing !== "new" ? editing._id : undefined });
                setEditing(null);
                loadOpps();
                loadStats();
              } catch (e) { fail(e); } finally { setSaving(false); }
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminCommunity;
