import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Bookmark, Check, MessageCircle, Pencil, Sparkles, UserMinus, Users, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { useSEO } from "@/hooks/useSEO";
import { ConnectButton, Empty, NetworkLayout, PersonLine, Spinner } from "@/components/network/NetworkUI";
import {
  getNetworkSuggestionsApi,
  getNetworkSummaryApi,
  listConnectionsApi,
  removeConnectionApi,
  respondConnectionApi,
  type ConnectionItem,
  type ConnectionState,
  type NetworkPerson,
  type NetworkSummary,
} from "@/lib/api";
import { getToken } from "@/lib/session";
import { timeAgo } from "@/lib/network";

const MyNetwork = () => {
  useSEO({ title: "My Network | Founders Connect", description: "Your founder connections, requests and suggestions." });
  const token = getToken() || "";
  const { toast } = useToast();
  const [summary, setSummary] = useState<NetworkSummary | null>(null);
  const [data, setData] = useState<{ connections: ConnectionItem[]; incoming: ConnectionItem[]; outgoing: ConnectionItem[] } | null>(null);
  const [suggested, setSuggested] = useState<{ person: NetworkPerson; reasons: string[]; state: ConnectionState }[]>([]);

  const load = useCallback(() => {
    getNetworkSummaryApi(token).then(setSummary).catch(() => {});
    listConnectionsApi(token).then(setData).catch((e) => toast({ title: "Could not load", description: e.message, variant: "destructive" }));
  }, [token, toast]);

  useEffect(() => {
    load();
    getNetworkSuggestionsApi(token).then((r) => setSuggested(r.suggestions.map((s) => ({ ...s, state: { status: "none" } })))).catch(() => {});
  }, [load, token]);

  const respond = async (c: ConnectionItem, action: "accept" | "decline") => {
    try {
      await respondConnectionApi(token, c._id, action);
      load();
    } catch (e) {
      toast({ title: "Something went wrong", description: (e as Error).message, variant: "destructive" });
    }
  };
  const remove = async (c: ConnectionItem, label: string) => {
    if (!window.confirm(`${label} ${c.person.fullName}?`)) return;
    await removeConnectionApi(token, c._id).catch(() => {});
    load();
  };

  return (
    <NetworkLayout
      title="My network"
      subtitle="Founders you're connected with, pending requests and people worth meeting."
      actions={
        <Button asChild variant="outline">
          <Link to="/network/profile"><Pencil size={14} className="mr-1.5" /> Edit founder profile</Link>
        </Button>
      }
    >
      {summary && (
        <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-5">
          <div className="col-span-2 rounded-2xl border border-slate-200 bg-white p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Profile strength</p>
            <div className="mt-2 flex items-center gap-3">
              <Progress value={summary.profileCompleteness} className="h-2 flex-1" />
              <span className="text-sm font-bold text-slate-900">{summary.profileCompleteness}%</span>
            </div>
            {summary.profileCompleteness < 100 ? (
              <Link to="/network/profile" className="mt-2 inline-block text-sm font-semibold text-violet-700 hover:underline">Complete your profile →</Link>
            ) : (
              <Link to={`/startups/${summary.profileSlug}`} className="mt-2 inline-block text-sm font-semibold text-violet-700 hover:underline">View public profile →</Link>
            )}
          </div>
          {[
            { label: "Connections", value: summary.connections, icon: Users },
            { label: "Groups", value: summary.groups, icon: Sparkles, to: "/groups?mine=1" },
            { label: "Saved opportunities", value: summary.savedOpportunities, icon: Bookmark, to: "/opportunities?saved=1" },
          ].map((s) => (
            <Link key={s.label} to={s.to || "#connections"} className="rounded-2xl border border-slate-200 bg-white p-5 hover:border-violet-300">
              <s.icon className="mb-1 h-5 w-5 text-violet-600" />
              <p className="text-2xl font-bold text-slate-900">{s.value}</p>
              <p className="text-xs text-slate-500">{s.label}</p>
            </Link>
          ))}
        </div>
      )}

      {!data ? (
        <Spinner />
      ) : (
        <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
          <div className="space-y-8">
            {data.incoming.length > 0 && (
              <section>
                <h2 className="mb-3 font-heading text-lg font-bold text-slate-900">Requests for you ({data.incoming.length})</h2>
                <div className="space-y-3">
                  {data.incoming.map((c) => (
                    <div key={c._id} className="rounded-2xl border border-violet-200 bg-white p-4">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <PersonLine person={c.person} sub={`${c.intent === "cofounder" ? "Co-founder interest" : "Connection request"} · ${timeAgo(c.createdAt)}`} />
                        <div className="flex gap-2">
                          <Button size="sm" className="bg-violet-600 hover:bg-violet-700" onClick={() => respond(c, "accept")}><Check size={14} className="mr-1" /> Accept</Button>
                          <Button size="sm" variant="outline" onClick={() => respond(c, "decline")}><X size={14} className="mr-1" /> Decline</Button>
                        </div>
                      </div>
                      {c.note && <p className="mt-3 whitespace-pre-line rounded-lg bg-slate-50 p-3 text-sm text-slate-700">{c.note}</p>}
                    </div>
                  ))}
                </div>
              </section>
            )}

            <section id="connections">
              <h2 className="mb-3 font-heading text-lg font-bold text-slate-900">Connections ({data.connections.length})</h2>
              {data.connections.length === 0 ? (
                <Empty
                  icon={Users}
                  title="No connections yet"
                  text="Browse the startup directory or the suggestions here and say hello to founders building in your space."
                  action={<Button asChild className="bg-violet-600 hover:bg-violet-700"><Link to="/startups">Explore startups</Link></Button>}
                />
              ) : (
                <div className="grid gap-3 sm:grid-cols-2">
                  {data.connections.map((c) => (
                    <div key={c._id} className="flex items-center justify-between gap-2 rounded-2xl border border-slate-200 bg-white p-4">
                      <PersonLine person={c.person} />
                      <div className="flex shrink-0 gap-1">
                        <Button asChild size="icon" variant="ghost" aria-label="Message">
                          <Link to={`/community/messages/${c.person.id}`}><MessageCircle size={16} /></Link>
                        </Button>
                        <Button size="icon" variant="ghost" aria-label="Remove" className="text-slate-400 hover:text-red-600" onClick={() => remove(c, "Remove connection with")}>
                          <UserMinus size={16} />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {data.outgoing.length > 0 && (
              <section>
                <h2 className="mb-3 font-heading text-base font-bold text-slate-700">Sent requests ({data.outgoing.length})</h2>
                <div className="space-y-2">
                  {data.outgoing.map((c) => (
                    <div key={c._id} className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-3">
                      <PersonLine person={c.person} sub={`Sent ${timeAgo(c.createdAt)}`} />
                      <Button size="sm" variant="ghost" onClick={() => remove(c, "Withdraw request to")}>Withdraw</Button>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          <aside>
            <h2 className="mb-3 font-heading text-lg font-bold text-slate-900">People to meet</h2>
            {suggested.length === 0 ? (
              <p className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-500">
                Add your sectors, city and stage to your <Link to="/network/profile" className="font-semibold text-violet-700">profile</Link> to get suggestions.
              </p>
            ) : (
              <div className="space-y-3">
                {suggested.map((s, i) => (
                  <div key={s.person.id} className="rounded-2xl border border-slate-200 bg-white p-4">
                    <PersonLine person={s.person} />
                    <p className="mt-2 text-xs text-violet-700">{s.reasons.join(" · ")}</p>
                    <div className="mt-3">
                      <ConnectButton
                        accountId={s.person.id}
                        name={s.person.fullName}
                        state={s.state}
                        onChange={(state) => setSuggested((prev) => prev.map((x, j) => (j === i ? { ...x, state } : x)))}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </aside>
        </div>
      )}
    </NetworkLayout>
  );
};

export default MyNetwork;
