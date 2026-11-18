import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, CalendarClock, Heart, Loader2, Lock, MessageSquare, Pin, Settings, Trash2, Users, Video } from "lucide-react";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useSEO } from "@/hooks/useSEO";
import { Chip, Empty, PersonLine, Spinner } from "@/components/network/NetworkUI";
import GroupFormDialog from "@/components/network/GroupFormDialog";
import {
  archiveGroupApi,
  commentGroupPostApi,
  createGroupPostApi,
  deleteGroupPostApi,
  getGroupApi,
  joinGroupApi,
  leaveGroupApi,
  likeGroupPostApi,
  listGroupMembersApi,
  listGroupPostsApi,
  manageGroupMemberApi,
  pinGroupPostApi,
  updateGroupApi,
  type GroupData,
  type GroupMemberData,
  type GroupPostData,
} from "@/lib/api";
import { getToken } from "@/lib/session";
import { formatDateTime } from "@/lib/lms";
import { timeAgo } from "@/lib/network";

const GroupDetail = () => {
  const { slug = "" } = useParams();
  const token = getToken() || "";
  const { toast } = useToast();
  const navigate = useNavigate();
  const [info, setInfo] = useState<{ group: GroupData; canModerate: boolean; canReadPosts: boolean; pendingCount: number } | null>(null);
  const [posts, setPosts] = useState<GroupPostData[] | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [members, setMembers] = useState<GroupMemberData[] | null>(null);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [editing, setEditing] = useState(false);
  const [comment, setComment] = useState<Record<string, string>>({});
  const [error, setError] = useState("");

  useSEO({ title: info ? `${info.group.name} | Founders Connect` : "Group | Founders Connect", description: info?.group.description || "A Founders Connect group." });

  const fail = (e: unknown) => toast({ title: "Something went wrong", description: (e as Error).message, variant: "destructive" });

  const load = useCallback(async () => {
    try {
      const r = await getGroupApi(token, slug);
      setInfo(r);
      if (r.canReadPosts) {
        const p = await listGroupPostsApi(token, slug);
        setPosts(p.posts);
        setHasMore(p.hasMore);
      } else {
        setPosts([]);
      }
    } catch (e) {
      setError((e as Error).message);
    }
  }, [token, slug]);
  useEffect(() => { load(); }, [load]);

  const loadMembers = useCallback(() => listGroupMembersApi(token, slug).then((r) => setMembers(r.members)).catch(() => setMembers([])), [token, slug]);

  if (error) return <div className="min-h-screen bg-slate-50"><Navbar /><div className="py-20 text-center"><p className="font-semibold">{error}</p><Button asChild variant="outline" className="mt-4"><Link to="/groups">All groups</Link></Button></div></div>;
  if (!info) return <div className="min-h-screen bg-slate-50"><Navbar /><Spinner /></div>;

  const g = info.group;
  const member = g.membership?.status === "active";
  const pending = g.membership?.status === "pending";
  const isOwner = g.membership?.role === "owner";

  const join = async () => {
    setBusy(true);
    try {
      const r = await joinGroupApi(token, slug);
      toast({ title: r.status === "active" ? `Welcome to ${g.name}!` : "Request sent. A moderator will review it." });
      await load();
    } catch (e) { fail(e); } finally { setBusy(false); }
  };
  const leave = async () => {
    if (!window.confirm(pending ? "Cancel your request?" : `Leave ${g.name}?`)) return;
    setBusy(true);
    try { await leaveGroupApi(token, slug); await load(); } catch (e) { fail(e); } finally { setBusy(false); }
  };
  const post = async () => {
    if (!draft.trim()) return;
    setBusy(true);
    try {
      const r = await createGroupPostApi(token, slug, draft);
      setPosts((p) => [r.post, ...(p || [])]);
      setDraft("");
    } catch (e) { fail(e); } finally { setBusy(false); }
  };
  const replacePost = (np: GroupPostData) => setPosts((p) => p?.map((x) => (x._id === np._id ? np : x)) || null);

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="relative h-40 bg-gradient-to-br from-violet-200 to-violet-50 sm:h-52">
        {g.coverImageUrl && <img src={g.coverImageUrl} alt="" className="h-full w-full object-cover" />}
      </div>
      <div className="container mx-auto max-w-5xl px-4">
        <div className="-mt-12 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <Link to="/groups" className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-violet-700"><ArrowLeft size={12} /> Groups & circles</Link>
          <div className="mt-2 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <Chip tone="violet">{g.kind === "circle" ? "Peer circle" : "Group"}</Chip>
                <Chip>{g.category}</Chip>
                {g.privacy === "private" && <Chip><Lock size={10} className="mr-0.5 inline" /> By approval</Chip>}
                {g.isArchived && <Chip tone="red">Archived</Chip>}
              </div>
              <h1 className="mt-2 font-heading text-2xl font-bold text-slate-900">{g.name}</h1>
              <p className="mt-1 text-sm text-slate-500">
                <Users size={13} className="mr-1 inline" />{g.memberCount}{g.maxMembers ? ` of ${g.maxMembers}` : ""} members · started by {g.owner?.fullName}
              </p>
            </div>
            <div className="flex shrink-0 flex-wrap gap-2">
              {info.canModerate && <Button variant="outline" size="sm" onClick={() => setEditing(true)}><Settings size={14} className="mr-1.5" /> Settings</Button>}
              {member ? (
                !isOwner && <Button variant="outline" size="sm" disabled={busy} onClick={leave}>Leave</Button>
              ) : pending ? (
                <Button variant="outline" size="sm" disabled={busy} onClick={leave}>Requested · cancel</Button>
              ) : (
                <Button size="sm" disabled={busy || (g.isFull && g.privacy === "open")} onClick={join} className="bg-violet-600 hover:bg-violet-700">
                  {busy && <Loader2 size={14} className="mr-1.5 animate-spin" />}
                  {g.isFull && g.privacy === "open" ? "Full" : g.privacy === "private" ? "Request to join" : "Join"}
                </Button>
              )}
            </div>
          </div>
          {g.description && <p className="mt-4 whitespace-pre-line text-slate-700">{g.description}</p>}
          {g.kind === "circle" && (g.meetingCadence || g.nextMeetingAt) && (
            <div className="mt-4 flex flex-wrap items-center gap-3 rounded-xl bg-violet-50 px-4 py-3 text-sm text-violet-900">
              <CalendarClock size={16} />
              {g.meetingCadence && <span>{g.meetingCadence}</span>}
              {g.nextMeetingAt && <span className="font-semibold">Next: {formatDateTime(g.nextMeetingAt)}</span>}
              {member && g.meetingUrl && <a href={g.meetingUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 font-semibold underline"><Video size={14} /> Join call</a>}
            </div>
          )}
        </div>

        <Tabs defaultValue="feed" className="py-6" onValueChange={(v) => v === "members" && !members && loadMembers()}>
          <TabsList>
            <TabsTrigger value="feed" className="gap-1.5"><MessageSquare size={14} /> Discussion</TabsTrigger>
            <TabsTrigger value="members" className="gap-1.5"><Users size={14} /> Members{info.canModerate && info.pendingCount > 0 ? ` (${info.pendingCount} pending)` : ""}</TabsTrigger>
          </TabsList>

          <TabsContent value="feed" className="space-y-4">
            {!info.canReadPosts ? (
              <Empty icon={Lock} title="This is a private group" text="Request to join to see the discussion." />
            ) : (
              <>
                {member && (
                  <div className="rounded-2xl border border-slate-200 bg-white p-4">
                    <Textarea rows={3} maxLength={3000} placeholder={`Share an update or ask ${g.name} a question…`} value={draft} onChange={(e) => setDraft(e.target.value)} />
                    <div className="mt-2 flex justify-end"><Button size="sm" disabled={busy || !draft.trim()} onClick={post} className="bg-violet-600 hover:bg-violet-700">Post</Button></div>
                  </div>
                )}
                {!posts ? <Spinner /> : posts.length === 0 ? (
                  <Empty icon={MessageSquare} title="No posts yet" text={member ? "Kick things off with an introduction." : "Join to start the conversation."} />
                ) : (
                  posts.map((p) => (
                    <article key={p._id} className={`rounded-2xl border bg-white p-5 ${p.isPinned ? "border-violet-300" : "border-slate-200"}`}>
                      <div className="flex items-start justify-between gap-2">
                        <PersonLine person={p.author} sub={timeAgo(p.createdAt)} />
                        <div className="flex items-center gap-1">
                          {p.isPinned && <Chip tone="violet"><Pin size={10} className="mr-0.5 inline" /> Pinned</Chip>}
                          {info.canModerate && (
                            <Button size="icon" variant="ghost" className="h-8 w-8" aria-label="Pin" onClick={async () => { const r = await pinGroupPostApi(token, slug, p._id).catch(() => null); if (r) replacePost({ ...p, isPinned: r.isPinned }); }}><Pin size={14} /></Button>
                          )}
                          {(p.isMine || info.canModerate) && (
                            <Button size="icon" variant="ghost" className="h-8 w-8 text-slate-400 hover:text-red-600" aria-label="Delete" onClick={async () => { if (window.confirm("Delete this post?")) { await deleteGroupPostApi(token, slug, p._id).catch(fail); setPosts((x) => x?.filter((y) => y._id !== p._id) || null); } }}><Trash2 size={14} /></Button>
                          )}
                        </div>
                      </div>
                      <p className="mt-3 whitespace-pre-line text-slate-800">{p.content}</p>
                      <div className="mt-3 flex items-center gap-4 text-sm text-slate-500">
                        <button type="button" disabled={!member} onClick={async () => { const r = await likeGroupPostApi(token, slug, p._id).catch(() => null); if (r) replacePost({ ...p, ...r }); }} className={`inline-flex items-center gap-1 ${p.likedByMe ? "text-violet-700" : ""}`}>
                          <Heart size={15} fill={p.likedByMe ? "currentColor" : "none"} /> {p.likeCount}
                        </button>
                        <span className="inline-flex items-center gap-1"><MessageSquare size={15} /> {p.comments.length}</span>
                      </div>
                      {p.comments.length > 0 && (
                        <ul className="mt-3 space-y-2 border-t border-slate-100 pt-3">
                          {p.comments.map((c) => (
                            <li key={c._id} className="rounded-lg bg-slate-50 px-3 py-2 text-sm">
                              <span className="font-semibold text-slate-800">{c.author.fullName}</span> <span className="text-xs text-slate-400">{timeAgo(c.createdAt)}</span>
                              <p className="text-slate-700">{c.content}</p>
                            </li>
                          ))}
                        </ul>
                      )}
                      {member && (
                        <form
                          className="mt-3 flex gap-2"
                          onSubmit={async (e) => {
                            e.preventDefault();
                            const text = (comment[p._id] || "").trim();
                            if (!text) return;
                            const r = await commentGroupPostApi(token, slug, p._id, text).catch((err) => { fail(err); return null; });
                            if (r) { replacePost(r.post); setComment((c) => ({ ...c, [p._id]: "" })); }
                          }}
                        >
                          <Input className="h-9" placeholder="Write a comment…" value={comment[p._id] || ""} onChange={(e) => setComment((c) => ({ ...c, [p._id]: e.target.value }))} />
                          <Button size="sm" variant="outline" type="submit">Reply</Button>
                        </form>
                      )}
                    </article>
                  ))
                )}
                {hasMore && posts && (
                  <div className="text-center">
                    <Button variant="outline" onClick={async () => { const last = posts.filter((p) => !p.isPinned).at(-1); const r = await listGroupPostsApi(token, slug, last?.createdAt).catch(() => null); if (r) { setPosts([...posts, ...r.posts]); setHasMore(r.hasMore); } }}>Load older posts</Button>
                  </div>
                )}
              </>
            )}
          </TabsContent>

          <TabsContent value="members">
            {!members ? <Spinner /> : (
              <div className="space-y-2">
                {members.map((m) => (
                  <div key={m.accountId} className={`flex flex-col gap-2 rounded-xl border bg-white p-3 sm:flex-row sm:items-center sm:justify-between ${m.status === "pending" ? "border-amber-200" : "border-slate-200"}`}>
                    <div>
                      <PersonLine person={m.person} sub={m.status === "pending" ? "Wants to join" : m.role !== "member" ? m.role : `Joined ${timeAgo(m.joinedAt)}`} />
                      {m.requestNote && <p className="ml-[52px] mt-1 text-sm text-slate-600">“{m.requestNote}”</p>}
                    </div>
                    {info.canModerate && m.role !== "owner" && (
                      <div className="flex gap-2">
                        {m.status === "pending" ? (
                          <>
                            <Button size="sm" className="bg-violet-600 hover:bg-violet-700" onClick={async () => { await manageGroupMemberApi(token, slug, m.accountId, "approve").catch(fail); loadMembers(); load(); }}>Approve</Button>
                            <Button size="sm" variant="outline" onClick={async () => { await manageGroupMemberApi(token, slug, m.accountId, "reject").catch(fail); loadMembers(); load(); }}>Decline</Button>
                          </>
                        ) : (
                          <>
                            {isOwner && <Button size="sm" variant="ghost" onClick={async () => { await manageGroupMemberApi(token, slug, m.accountId, m.role === "moderator" ? "demote" : "promote").catch(fail); loadMembers(); }}>{m.role === "moderator" ? "Remove mod" : "Make mod"}</Button>}
                            <Button size="sm" variant="ghost" className="text-red-600" onClick={async () => { if (window.confirm(`Remove ${m.person.fullName}?`)) { await manageGroupMemberApi(token, slug, m.accountId, "remove").catch(fail); loadMembers(); load(); } }}>Remove</Button>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      <GroupFormDialog
        open={editing}
        onOpenChange={setEditing}
        saving={busy}
        title="Group settings"
        initial={g}
        onSubmit={async (input) => {
          setBusy(true);
          try {
            await updateGroupApi(token, slug, input);
            setEditing(false);
            await load();
          } catch (e) { fail(e); } finally { setBusy(false); }
        }}
      />
      {isOwner && editing && (
        <div className="fixed bottom-4 left-1/2 z-[60] -translate-x-1/2">
          <Button variant="outline" className="border-red-200 bg-white text-red-600" onClick={async () => { if (window.confirm("Delete this group for everyone?")) { await archiveGroupApi(token, slug).catch(fail); navigate("/groups"); } }}>
            <Trash2 size={14} className="mr-1.5" /> Delete group
          </Button>
        </div>
      )}
    </div>
  );
};

export default GroupDetail;
