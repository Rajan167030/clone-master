import { useCallback, useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Inbox, Loader2, MapPin, MessageCircle, Plus, Search, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useSEO } from "@/hooks/useSEO";
import { Chip, Empty, FilterPills, NetworkLayout, PersonLine, Spinner } from "@/components/network/NetworkUI";
import {
  createCollabApi,
  deleteCollabApi,
  expressCollabInterestApi,
  listCollabApi,
  listCollabInterestsApi,
  updateCollabApi,
  type CollabInput,
  type CollabPostData,
  type CollabType,
  type NetworkPerson,
} from "@/lib/api";
import { getToken } from "@/lib/session";
import { COLLAB_LABEL, COMMITMENT_LABEL, timeAgo } from "@/lib/network";

const selectClass = "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm";
const emptyPost: CollabInput = { type: "collaboration", title: "", description: "", skills: [], commitment: "", location: "", remoteOk: true, compensation: "" };

const CollabBoard = () => {
  useSEO({ title: "Collaboration Board | Founders Connect", description: "Find co-founders, collaborators, early hires and partners." });
  const token = getToken() || "";
  const { toast } = useToast();
  const [params, setParams] = useSearchParams();
  const [type, setType] = useState<CollabType | "">("");
  const [mine, setMine] = useState(false);
  const [search, setSearch] = useState("");
  const [posts, setPosts] = useState<CollabPostData[] | null>(null);
  const [draft, setDraft] = useState<CollabInput | null>(null);
  const [saving, setSaving] = useState(false);
  const [replyTo, setReplyTo] = useState<CollabPostData | null>(null);
  const [replyText, setReplyText] = useState("");
  const [interests, setInterests] = useState<{ post: CollabPostData; rows: { _id: string; message: string; createdAt: string; person: NetworkPerson }[] | null } | null>(null);
  const focus = params.get("post");

  const load = useCallback(() => {
    setPosts(null);
    listCollabApi(token, { type: type || undefined, mine: mine ? "1" : undefined, search: search || undefined })
      .then((r) => setPosts(r.posts))
      .catch(() => setPosts([]));
  }, [token, type, mine, search]);
  useEffect(load, [load]);

  useEffect(() => {
    if (focus && posts) document.getElementById(`collab-${focus}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [focus, posts]);

  const submitPost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft) return;
    setSaving(true);
    try {
      const res = await createCollabApi(token, { ...draft, skills: draft.skills.map((s) => s.trim()).filter(Boolean) });
      setPosts((prev) => [res.post, ...(prev || [])]);
      setDraft(null);
      toast({ title: "Posted" });
    } catch (err) {
      toast({ title: "Could not post", description: (err as Error).message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const sendInterest = async () => {
    if (!replyTo) return;
    setSaving(true);
    try {
      const res = await expressCollabInterestApi(token, replyTo._id, replyText);
      setPosts((prev) => prev?.map((p) => (p._id === replyTo._id ? { ...p, hasExpressedInterest: true, interestCount: p.interestCount + 1 } : p)) || null);
      toast({ title: res.message });
      setReplyTo(null);
      setReplyText("");
    } catch (err) {
      toast({ title: "Could not send", description: (err as Error).message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const openInterests = async (post: CollabPostData) => {
    setInterests({ post, rows: null });
    const r = await listCollabInterestsApi(token, post._id).catch(() => ({ interests: [] }));
    setInterests({ post, rows: r.interests });
  };

  const toggleStatus = async (post: CollabPostData) => {
    const res = await updateCollabApi(token, post._id, { status: post.status === "open" ? "closed" : "open" }).catch(() => null);
    if (res) setPosts((prev) => prev?.filter((p) => p._id !== post._id || res.post.status === "open") || null);
  };

  return (
    <NetworkLayout
      title="Collaboration board"
      subtitle="Co-founder searches, collaborations, early hires, partnerships and asks for feedback."
      actions={<Button onClick={() => setDraft({ ...emptyPost })} className="bg-violet-600 hover:bg-violet-700"><Plus size={14} className="mr-1" /> New post</Button>}
    >
      <div className="mb-6 space-y-3">
        <form onSubmit={(e) => { e.preventDefault(); load(); }} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input className="pl-9" placeholder="Search posts and skills" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <label className="flex items-center gap-2 text-sm"><Switch checked={mine} onCheckedChange={setMine} /> My posts</label>
        </form>
        <FilterPills options={Object.keys(COLLAB_LABEL) as CollabType[]} labels={COLLAB_LABEL} value={type} onChange={setType} />
      </div>

      {!posts ? (
        <Spinner />
      ) : posts.length === 0 ? (
        <Empty icon={Inbox} title="Nothing here yet" text="Be the first to post what you're looking for." />
      ) : (
        <div className="space-y-4">
          {posts.map((p) => (
            <article key={p._id} id={`collab-${p._id}`} className={`rounded-2xl border bg-white p-5 ${focus === p._id ? "border-violet-400 ring-2 ring-violet-100" : "border-slate-200"}`}>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <Chip tone="violet">{COLLAB_LABEL[p.type]}</Chip>
                    {p.commitment && <Chip>{COMMITMENT_LABEL[p.commitment]}</Chip>}
                    {p.remoteOk && <Chip>Remote OK</Chip>}
                    {p.status === "closed" && <Chip tone="red">Closed</Chip>}
                  </div>
                  <h3 className="mt-2 font-heading text-lg font-bold text-slate-900">{p.title}</h3>
                </div>
                <span className="shrink-0 text-xs text-slate-400">{timeAgo(p.createdAt)}</span>
              </div>
              <p className="mt-2 whitespace-pre-line text-sm text-slate-700">{p.description}</p>
              <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                {p.skills.length > 0 && <span>Skills: {p.skills.join(", ")}</span>}
                {p.location && <span className="inline-flex items-center gap-1"><MapPin size={11} /> {p.location}</span>}
                {p.compensation && <span>Comp: {p.compensation}</span>}
              </div>
              <div className="mt-4 flex flex-col gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
                <PersonLine person={p.author} />
                <div className="flex gap-2">
                  {p.isMine ? (
                    <>
                      <Button size="sm" variant="outline" onClick={() => openInterests(p)}>Responses ({p.interestCount})</Button>
                      <Button size="sm" variant="ghost" onClick={() => toggleStatus(p)}>{p.status === "open" ? "Close" : "Reopen"}</Button>
                      <Button size="sm" variant="ghost" className="text-red-600" onClick={async () => { if (window.confirm("Delete this post?")) { await deleteCollabApi(token, p._id).catch(() => {}); setPosts((prev) => prev?.filter((x) => x._id !== p._id) || null); } }}><Trash2 size={14} /></Button>
                    </>
                  ) : p.hasExpressedInterest ? (
                    <Button asChild size="sm" variant="outline"><Link to={`/community/messages/${p.author.id}`}><MessageCircle size={14} className="mr-1.5" /> Continue chat</Link></Button>
                  ) : p.status === "open" ? (
                    <Button size="sm" className="bg-violet-600 hover:bg-violet-700" onClick={() => setReplyTo(p)}>I'm interested</Button>
                  ) : null}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      <Dialog open={Boolean(draft)} onOpenChange={(o) => !o && setDraft(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader><DialogTitle>New collab post</DialogTitle></DialogHeader>
          {draft && (
            <form onSubmit={submitPost} className="space-y-3">
              <div className="space-y-1.5">
                <Label>Type</Label>
                <select className={selectClass} value={draft.type} onChange={(e) => setDraft({ ...draft, type: e.target.value as CollabType })}>
                  {Object.entries(COLLAB_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </div>
              <div className="space-y-1.5"><Label>Title *</Label><Input required maxLength={140} placeholder="e.g. Looking for a technical co-founder for a B2B fintech" value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} /></div>
              <div className="space-y-1.5"><Label>Details *</Label><Textarea required rows={5} value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} /></div>
              <div className="space-y-1.5"><Label>Skills (comma separated)</Label><Input value={draft.skills.join(", ")} onChange={(e) => setDraft({ ...draft, skills: e.target.value.split(",").map((x) => x.trimStart()) })} /></div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label>Commitment</Label>
                  <select className={selectClass} value={draft.commitment} onChange={(e) => setDraft({ ...draft, commitment: e.target.value })}>
                    <option value="">Any</option>
                    {Object.entries(COMMITMENT_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5"><Label>Location</Label><Input value={draft.location} onChange={(e) => setDraft({ ...draft, location: e.target.value })} /></div>
                <div className="space-y-1.5"><Label>Compensation</Label><Input placeholder="Equity, paid, rev-share…" value={draft.compensation} onChange={(e) => setDraft({ ...draft, compensation: e.target.value })} /></div>
                <label className="flex items-center gap-2 pt-6 text-sm"><Switch checked={draft.remoteOk} onCheckedChange={(v) => setDraft({ ...draft, remoteOk: v })} /> Remote OK</label>
              </div>
              <Button type="submit" disabled={saving} className="w-full bg-violet-600 hover:bg-violet-700">{saving && <Loader2 size={14} className="mr-1.5 animate-spin" />} Post</Button>
            </form>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(replyTo)} onOpenChange={(o) => !o && setReplyTo(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Respond to {replyTo?.author.fullName}</DialogTitle>
            <DialogDescription>Your message goes straight to their inbox so you can keep talking there.</DialogDescription>
          </DialogHeader>
          <Textarea rows={5} placeholder="Why you're a good fit, relevant experience, availability…" value={replyText} onChange={(e) => setReplyText(e.target.value)} />
          <Button disabled={saving || replyText.trim().length < 10} onClick={sendInterest} className="bg-violet-600 hover:bg-violet-700">{saving && <Loader2 size={14} className="mr-1.5 animate-spin" />} Send</Button>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(interests)} onOpenChange={(o) => { if (!o) { setInterests(null); setParams({}); } }}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader><DialogTitle>Responses · {interests?.post.title}</DialogTitle></DialogHeader>
          {!interests?.rows ? <Spinner /> : interests.rows.length === 0 ? <p className="py-6 text-center text-sm text-slate-500">No responses yet.</p> : (
            <ul className="space-y-3">
              {interests.rows.map((r) => (
                <li key={r._id} className="rounded-xl border border-slate-200 p-3">
                  <div className="flex items-center justify-between gap-2">
                    <PersonLine person={r.person} sub={timeAgo(r.createdAt)} />
                    <Button asChild size="sm" variant="outline"><Link to={`/community/messages/${r.person.id}`}>Reply</Link></Button>
                  </div>
                  <p className="mt-2 whitespace-pre-line text-sm text-slate-700">{r.message}</p>
                </li>
              ))}
            </ul>
          )}
        </DialogContent>
      </Dialog>
    </NetworkLayout>
  );
};

export default CollabBoard;
