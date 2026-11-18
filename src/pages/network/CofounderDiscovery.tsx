import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Handshake, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSEO } from "@/hooks/useSEO";
import { Chip, ConnectButton, Empty, FilterPills, NetworkLayout, PersonLine, Spinner } from "@/components/network/NetworkUI";
import { listCofoundersApi, type CofounderCard, type CofounderRole, type ConnectionState } from "@/lib/api";
import { getToken } from "@/lib/session";
import { COFOUNDER_ROLE_LABEL, COMMITMENT_LABEL } from "@/lib/network";

const CofounderDiscovery = () => {
  useSEO({ title: "Co-founder Discovery | Founders Connect", description: "Find a co-founder with complementary skills." });
  const token = getToken() || "";
  const [role, setRole] = useState<CofounderRole | "">("");
  const [commitment, setCommitment] = useState<"full_time" | "part_time" | "flexible" | "">("");
  const [city, setCity] = useState("");
  const [data, setData] = useState<{ myProfileComplete: boolean; cofounders: (CofounderCard & { state: ConnectionState })[] } | null>(null);

  useEffect(() => {
    setData(null);
    listCofoundersApi(token, { role: role || undefined, commitment: commitment || undefined, city: city || undefined })
      .then((r) => setData({ ...r, cofounders: r.cofounders.map((c) => ({ ...c, state: { status: "none" } })) }))
      .catch(() => setData({ myProfileComplete: false, cofounders: [] }));
  }, [token, role, commitment, city]);

  return (
    <NetworkLayout title="Co-founder discovery" subtitle="Founders looking for a co-founder, ranked by how well your roles complement each other.">
      {data && !data.myProfileComplete && (
        <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-violet-200 bg-violet-50 p-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="flex items-center gap-2 text-sm text-violet-900">
            <Sparkles size={16} /> Turn on co-founder search in your profile and add your role to get match scores and appear here.
          </p>
          <Button asChild className="bg-violet-600 hover:bg-violet-700"><Link to="/network/profile">Set up co-founder profile</Link></Button>
        </div>
      )}

      <div className="mb-6 space-y-3">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="text-slate-500">They bring:</span>
          <FilterPills options={Object.keys(COFOUNDER_ROLE_LABEL) as CofounderRole[]} labels={COFOUNDER_ROLE_LABEL} value={role} onChange={setRole} />
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <FilterPills options={["full_time", "part_time", "flexible"] as const as ("full_time" | "part_time" | "flexible")[]} labels={COMMITMENT_LABEL} value={commitment} onChange={setCommitment} />
          <Input className="h-8 w-40" placeholder="City" defaultValue={city} onBlur={(e) => setCity(e.target.value.trim())} />
        </div>
      </div>

      {!data ? (
        <Spinner />
      ) : data.cofounders.length === 0 ? (
        <Empty icon={Handshake} title="No matches yet" text="Try removing a filter. New founders join every week, and you can post on the collab board too." action={<Button asChild variant="outline"><Link to="/network/collab">Post on the collab board</Link></Button>} />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {data.cofounders.map((c, i) => (
            <div key={c.person.id} className="flex flex-col rounded-2xl border border-slate-200 bg-white p-5">
              <div className="flex items-start justify-between gap-3">
                <PersonLine person={c.person} sub={[c.startupName, c.city].filter(Boolean).join(" · ")} />
                {data.myProfileComplete && (
                  <div className={`shrink-0 rounded-xl border px-2.5 py-1 text-center ${c.matchScore >= 70 ? "border-emerald-200 bg-emerald-50 text-emerald-800" : c.matchScore >= 45 ? "border-amber-200 bg-amber-50 text-amber-800" : "border-slate-200 bg-slate-50 text-slate-600"}`}>
                    <p className="text-lg font-extrabold leading-none">{c.matchScore}</p>
                    <p className="text-[9px] font-bold uppercase">match</p>
                  </div>
                )}
              </div>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {c.cofounder.myRole && <Chip tone="violet">Brings {COFOUNDER_ROLE_LABEL[c.cofounder.myRole]}</Chip>}
                {c.cofounder.rolesWanted.map((r) => <Chip key={r}>Wants {COFOUNDER_ROLE_LABEL[r]}</Chip>)}
                {c.cofounder.commitment && <Chip>{COMMITMENT_LABEL[c.cofounder.commitment]}</Chip>}
                {c.cofounder.remoteOk && <Chip>Remote OK</Chip>}
              </div>
              {(c.cofounder.pitch || c.oneLiner) && <p className="mt-3 line-clamp-4 text-sm text-slate-600">{c.cofounder.pitch || c.oneLiner}</p>}
              {c.skills.length > 0 && <p className="mt-2 text-xs text-slate-500">Skills: {c.skills.slice(0, 6).join(", ")}</p>}
              {c.matchReasons.length > 0 && <p className="mt-2 text-xs font-medium text-violet-700">{c.matchReasons.join(" · ")}</p>}
              <div className="mt-auto flex gap-2 pt-4">
                <ConnectButton
                  accountId={c.person.id}
                  name={c.person.fullName}
                  intent="cofounder"
                  state={c.state}
                  onChange={(state) => setData((prev) => prev && { ...prev, cofounders: prev.cofounders.map((x, j) => (j === i ? { ...x, state } : x)) })}
                />
                {c.startupSlug && <Button asChild size="sm" variant="ghost"><Link to={`/startups/${c.startupSlug}`}>View profile</Link></Button>}
              </div>
            </div>
          ))}
        </div>
      )}
    </NetworkLayout>
  );
};

export default CofounderDiscovery;
