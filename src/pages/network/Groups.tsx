import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { CalendarClock, Lock, Plus, Search, Star, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { useSEO } from "@/hooks/useSEO";
import { Chip, Empty, FilterPills, NetworkLayout, Spinner } from "@/components/network/NetworkUI";
import GroupFormDialog from "@/components/network/GroupFormDialog";
import { createGroupApi, listGroupsApi, type GroupData } from "@/lib/api";
import { getToken } from "@/lib/session";
import { formatDateTime } from "@/lib/lms";

const KIND_LABEL = { group: "Groups", circle: "Peer circles" };

const GroupCard = ({ g }: { g: GroupData }) => (
  <Link to={`/groups/${g.slug}`} className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white transition-all hover:-translate-y-0.5 hover:border-violet-300 hover:shadow-sm">
    <div className="relative h-24 bg-gradient-to-br from-violet-100 to-violet-50">
      {g.coverImageUrl && <img src={g.coverImageUrl} alt="" className="h-full w-full object-cover" loading="lazy" />}
      <div className="absolute left-3 top-3 flex gap-1.5">
        {g.isFeatured && <span className="inline-flex items-center gap-1 rounded-full bg-white/95 px-2 py-0.5 text-[11px] font-semibold text-amber-700"><Star size={10} /> Featured</span>}
        <span className="rounded-full bg-white/95 px-2 py-0.5 text-[11px] font-semibold text-slate-700">{g.kind === "circle" ? "Peer circle" : "Group"}</span>
      </div>
    </div>
    <div className="flex flex-1 flex-col p-4">
      <h3 className="flex items-center gap-1.5 font-heading font-bold text-slate-900 group-hover:text-violet-700">
        {g.privacy === "private" && <Lock size={13} className="text-slate-400" />} {g.name}
      </h3>
      <p className="mt-1 line-clamp-2 text-sm text-slate-600">{g.description}</p>
      {g.kind === "circle" && g.nextMeetingAt && (
        <p className="mt-2 inline-flex items-center gap-1 text-xs text-violet-700"><CalendarClock size={12} /> Next: {formatDateTime(g.nextMeetingAt)}</p>
      )}
      <div className="mt-auto flex items-center justify-between pt-3 text-xs text-slate-500">
        <span className="inline-flex items-center gap-1"><Users size={12} /> {g.memberCount}{g.maxMembers ? `/${g.maxMembers}` : ""} members</span>
        {g.membership?.status === "active" ? <Chip tone="emerald">Joined</Chip> : g.membership?.status === "pending" ? <Chip tone="amber">Requested</Chip> : g.isFull ? <Chip>Full</Chip> : null}
      </div>
    </div>
  </Link>
);

const Groups = () => {
  useSEO({ title: "Groups & Peer Circles | Founders Connect", description: "Join founder groups and small peer circles." });
  const token = getToken() || "";
  const { toast } = useToast();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [kind, setKind] = useState<"group" | "circle" | "">("");
  const [mine, setMine] = useState(params.get("mine") === "1");
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [groups, setGroups] = useState<GroupData[] | null>(null);
  const [creating, setCreating] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setGroups(null);
    listGroupsApi(token, { kind: kind || undefined, mine: mine ? "1" : undefined, search: query || undefined }).then((r) => setGroups(r.groups)).catch(() => setGroups([]));
  }, [token, kind, mine, query]);

  return (
    <NetworkLayout
      title="Groups & peer circles"
      subtitle="Open groups for your sector, city or stage, and small peer circles (6–12 founders) that meet regularly."
      actions={<Button onClick={() => setCreating(true)} className="bg-violet-600 hover:bg-violet-700"><Plus size={14} className="mr-1" /> Create</Button>}
    >
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <FilterPills options={["group", "circle"] as ("group" | "circle")[]} labels={KIND_LABEL} value={kind} onChange={setKind} />
        <div className="flex items-center gap-3">
          <form onSubmit={(e) => { e.preventDefault(); setQuery(search.trim()); }} className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input className="h-9 w-56 pl-9" placeholder="Search" value={search} onChange={(e) => setSearch(e.target.value)} />
          </form>
          <label className="flex items-center gap-2 whitespace-nowrap text-sm"><Switch checked={mine} onCheckedChange={setMine} /> Mine</label>
        </div>
      </div>

      {!groups ? (
        <Spinner />
      ) : groups.length === 0 ? (
        <Empty icon={Users} title={mine ? "You haven't joined any groups yet" : "No groups found"} text="Start one for your sector, city or a topic you care about." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{groups.map((g) => <GroupCard key={g._id} g={g} />)}</div>
      )}

      <GroupFormDialog
        open={creating}
        onOpenChange={setCreating}
        saving={saving}
        title="Create a group or peer circle"
        onSubmit={async (input) => {
          setSaving(true);
          try {
            const res = await createGroupApi(token, input);
            navigate(`/groups/${res.group.slug}`);
          } catch (e) {
            toast({ title: "Could not create", description: (e as Error).message, variant: "destructive" });
          } finally {
            setSaving(false);
          }
        }}
      />
    </NetworkLayout>
  );
};

export default Groups;
