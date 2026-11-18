import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Check,
  Copy,
  ExternalLink,
  GraduationCap,
  Inbox,
  Link2,
  Loader2,
  Mail,
  MessageSquare,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  createAdminMentorInviteApi,
  deleteAdminMentorConnectRequestApi,
  deleteAdminMentorInviteApi,
  getAdminMentorshipStatsApi,
  listAdminMentorApplicationsApi,
  listAdminMentorConnectRequestsApi,
  listAdminMentorInvitesApi,
  reviewAdminMentorApplicationApi,
  setAdminMentorInviteActiveApi,
  updateAdminMentorConnectRequestApi,
  type MentorApplication,
  type MentorApplicationStatus,
  type MentorConnectRequest,
  type MentorConnectStatus,
  type MentorInvite,
} from "@/lib/api";
import { getToken } from "@/lib/session";
import { useToast } from "@/hooks/use-toast";

const inviteLink = (token: string) => `${window.location.origin}/mentors/join/${token}`;
const fmtDate = (d?: string | null) =>
  d ? new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—";

const APP_BADGE: Record<MentorApplicationStatus, string> = {
  pending: "bg-amber-100 text-amber-800",
  approved: "bg-emerald-100 text-emerald-800",
  rejected: "bg-slate-200 text-slate-700",
};
const REQ_STATUSES: MentorConnectStatus[] = ["new", "forwarded", "scheduled", "completed", "declined"];
const REQ_BADGE: Record<MentorConnectStatus, string> = {
  new: "bg-violet-100 text-violet-800",
  forwarded: "bg-sky-100 text-sky-800",
  scheduled: "bg-amber-100 text-amber-800",
  completed: "bg-emerald-100 text-emerald-800",
  declined: "bg-slate-200 text-slate-700",
};

const inviteStatus = (i: MentorInvite) => {
  if (i.usedAt) return { label: "Used", cls: "bg-emerald-100 text-emerald-800" };
  if (!i.isActive) return { label: "Revoked", cls: "bg-slate-200 text-slate-700" };
  if (i.expiresAt && new Date(i.expiresAt) < new Date()) return { label: "Expired", cls: "bg-slate-200 text-slate-700" };
  return { label: "Active", cls: "bg-violet-100 text-violet-800" };
};

const FilterPills = <T extends string>({
  options,
  value,
  onChange,
}: {
  options: T[];
  value: T | "";
  onChange: (v: T | "") => void;
}) => (
  <div className="mb-4 flex flex-wrap gap-2">
    {(["", ...options] as (T | "")[]).map((o) => (
      <button
        key={o || "all"}
        type="button"
        onClick={() => onChange(o)}
        className={`rounded-full border px-3 py-1 text-xs font-semibold capitalize ${
          value === o ? "border-violet-600 bg-violet-600 text-white" : "border-slate-200 bg-white text-slate-600 hover:border-violet-300"
        }`}
      >
        {o || "All"}
      </button>
    ))}
  </div>
);

const Empty = ({ text }: { text: string }) => (
  <div className="rounded-xl border border-dashed border-slate-300 bg-white py-14 text-center text-sm text-slate-500">{text}</div>
);

const AdminMentorship = () => {
  const { toast } = useToast();
  const token = getToken() || "";
  const [tab, setTab] = useState("applications");
  const [stats, setStats] = useState({ pendingApplications: 0, newRequests: 0, activeMentors: 0 });

  const [applications, setApplications] = useState<MentorApplication[]>([]);
  const [appFilter, setAppFilter] = useState<MentorApplicationStatus | "">("pending");
  const [requests, setRequests] = useState<MentorConnectRequest[]>([]);
  const [reqFilter, setReqFilter] = useState<MentorConnectStatus | "">("");
  const [invites, setInvites] = useState<MentorInvite[]>([]);

  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState("");
  const [notes, setNotes] = useState<Record<string, string>>({});

  const [inviteForm, setInviteForm] = useState({ label: "", email: "", expiresInDays: "14" });
  const [creatingInvite, setCreatingInvite] = useState(false);
  const [lastLink, setLastLink] = useState("");

  const fail = useCallback(
    (err: unknown) => toast({ title: "Something went wrong", description: err instanceof Error ? err.message : String(err), variant: "destructive" }),
    [toast],
  );

  const loadStats = useCallback(() => getAdminMentorshipStatsApi(token).then(setStats).catch(() => {}), [token]);

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const [a, r, i] = await Promise.all([
        listAdminMentorApplicationsApi(token, appFilter || undefined),
        listAdminMentorConnectRequestsApi(token, reqFilter || undefined),
        listAdminMentorInvitesApi(token),
      ]);
      setApplications(a.applications);
      setRequests(r.requests);
      setInvites(i.invites);
      loadStats();
    } catch (err) {
      fail(err);
    } finally {
      setLoading(false);
    }
  }, [token, appFilter, reqFilter, loadStats, fail]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({ title: "Link copied" });
    } catch {
      toast({ title: "Copy failed", description: text });
    }
  };

  /* ---------- actions ---------- */

  const review = async (app: MentorApplication, decision: "approve" | "reject") => {
    if (decision === "reject" && !window.confirm(`Reject ${app.fullName}'s application?`)) return;
    setBusyId(app._id);
    try {
      const res = await reviewAdminMentorApplicationApi(token, app._id, decision, notes[app._id]);
      toast({ title: res.message });
      await loadAll();
    } catch (err) {
      fail(err);
    } finally {
      setBusyId("");
    }
  };

  const updateRequest = async (req: MentorConnectRequest, payload: { status?: MentorConnectStatus; adminNotes?: string }) => {
    setBusyId(req._id);
    try {
      const res = await updateAdminMentorConnectRequestApi(token, req._id, payload);
      setRequests((prev) => prev.map((r) => (r._id === req._id ? res.request : r)));
      if (payload.status === "forwarded") {
        toast({
          title: res.mentorEmailed ? "Intro email sent to mentor" : "Marked as forwarded",
          description: res.mentorEmailed
            ? `${req.mentorName} can reply to ${req.email} directly.`
            : "No mentor email on file (or SMTP not configured) — please make the intro manually.",
        });
      } else {
        toast({ title: res.message });
      }
      loadStats();
    } catch (err) {
      fail(err);
    } finally {
      setBusyId("");
    }
  };

  const deleteRequest = async (req: MentorConnectRequest) => {
    if (!window.confirm(`Delete request from ${req.fullName}?`)) return;
    try {
      await deleteAdminMentorConnectRequestApi(token, req._id);
      setRequests((prev) => prev.filter((r) => r._id !== req._id));
      loadStats();
    } catch (err) {
      fail(err);
    }
  };

  const createInvite = async (event: React.FormEvent) => {
    event.preventDefault();
    setCreatingInvite(true);
    try {
      const res = await createAdminMentorInviteApi(token, {
        label: inviteForm.label,
        email: inviteForm.email,
        expiresInDays: Number(inviteForm.expiresInDays) || undefined,
      });
      const link = inviteLink(res.invite.token);
      setLastLink(link);
      setInvites((prev) => [res.invite, ...prev]);
      setInviteForm({ label: "", email: "", expiresInDays: inviteForm.expiresInDays });
      toast({
        title: "Invite created",
        description: inviteForm.email
          ? res.emailed
            ? `Invite emailed to ${inviteForm.email}.`
            : "Email could not be sent — copy the link and share it manually."
          : "Copy the link and share it with the mentor.",
      });
    } catch (err) {
      fail(err);
    } finally {
      setCreatingInvite(false);
    }
  };

  const toggleInvite = async (invite: MentorInvite) => {
    try {
      const res = await setAdminMentorInviteActiveApi(token, invite._id, !invite.isActive);
      setInvites((prev) => prev.map((i) => (i._id === invite._id ? res.invite : i)));
    } catch (err) {
      fail(err);
    }
  };

  const deleteInvite = async (invite: MentorInvite) => {
    if (!window.confirm("Delete this invite link?")) return;
    try {
      await deleteAdminMentorInviteApi(token, invite._id);
      setInvites((prev) => prev.filter((i) => i._id !== invite._id));
    } catch (err) {
      fail(err);
    }
  };

  /* ---------- render ---------- */

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="border-b bg-white">
        <div className="container mx-auto flex flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <Button asChild variant="ghost" size="icon">
              <Link to="/admin">
                <ArrowLeft size={18} />
              </Link>
            </Button>
            <div>
              <div className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-violet-600" />
                <h1 className="font-heading text-xl font-bold text-slate-900">Mentorship</h1>
              </div>
              <p className="text-xs text-slate-500">Invite mentors, approve profiles and route founder requests.</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button asChild variant="outline" size="sm">
              <Link to="/mentors" target="_blank" className="gap-1.5">
                <ExternalLink size={14} /> View public page
              </Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link to="/admin/speaker-investors" className="gap-1.5">
                Edit mentor profiles
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-6 grid gap-4 sm:grid-cols-3">
          {[
            { label: "Live mentors", value: stats.activeMentors },
            { label: "Pending applications", value: stats.pendingApplications },
            { label: "New connect requests", value: stats.newRequests },
          ].map((s) => (
            <Card key={s.label} className="border-slate-200">
              <CardContent className="p-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{s.label}</p>
                <p className="mt-1 text-3xl font-bold text-slate-900">{s.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="applications" className="gap-1.5">
              <Inbox size={14} /> Applications
              {stats.pendingApplications > 0 && <Badge className="ml-1 h-5 bg-violet-600 px-1.5">{stats.pendingApplications}</Badge>}
            </TabsTrigger>
            <TabsTrigger value="requests" className="gap-1.5">
              <MessageSquare size={14} /> Connect requests
              {stats.newRequests > 0 && <Badge className="ml-1 h-5 bg-violet-600 px-1.5">{stats.newRequests}</Badge>}
            </TabsTrigger>
            <TabsTrigger value="invites" className="gap-1.5">
              <Link2 size={14} /> Invites
            </TabsTrigger>
          </TabsList>

          {loading && (
            <div className="flex justify-center py-10">
              <Loader2 className="h-6 w-6 animate-spin text-violet-600" />
            </div>
          )}

          {/* Applications */}
          <TabsContent value="applications">
            <FilterPills<MentorApplicationStatus> options={["pending", "approved", "rejected"]} value={appFilter} onChange={setAppFilter} />
            {!loading && applications.length === 0 && <Empty text="No mentor applications here yet. Send an invite from the Invites tab." />}
            <div className="grid gap-4 lg:grid-cols-2">
              {applications.map((app) => (
                <Card key={app._id} className="border-slate-200">
                  <CardHeader className="flex flex-row items-start gap-4 space-y-0 pb-3">
                    <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-violet-50">
                      {app.photoUrl ? (
                        <img src={app.photoUrl} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center font-bold text-violet-600">
                          {app.fullName.slice(0, 2).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <CardTitle className="truncate text-base">{app.fullName}</CardTitle>
                        <Badge className={`${APP_BADGE[app.status]} capitalize`}>{app.status}</Badge>
                      </div>
                      <CardDescription>
                        {app.designation}
                        {app.company ? ` · ${app.company}` : ""}
                        {app.yearsOfExperience ? ` · ${app.yearsOfExperience} yrs` : ""}
                      </CardDescription>
                      <p className="mt-1 text-xs text-slate-500">
                        <a href={`mailto:${app.email}`} className="hover:text-violet-700">{app.email}</a>
                        {app.phone ? ` · ${app.phone}` : ""} · Applied {fmtDate(app.createdAt)}
                      </p>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="whitespace-pre-line text-sm text-slate-700">{app.bio}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {app.expertise.map((e) => (
                        <span key={e} className="rounded-full bg-violet-50 px-2 py-0.5 text-[11px] font-medium text-violet-700">{e}</span>
                      ))}
                      {app.industries.map((e) => (
                        <span key={e} className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">{e}</span>
                      ))}
                    </div>
                    {app.availability && <p className="text-xs text-slate-500">Availability: {app.availability}</p>}
                    {app.linkedinUrl && (
                      <a href={app.linkedinUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs font-semibold text-violet-600">
                        <ExternalLink size={12} /> LinkedIn
                      </a>
                    )}
                    {app.status === "pending" ? (
                      <div className="space-y-2 border-t border-slate-100 pt-3">
                        <Textarea
                          rows={2}
                          placeholder="Internal notes (optional)"
                          value={notes[app._id] || ""}
                          onChange={(e) => setNotes((p) => ({ ...p, [app._id]: e.target.value }))}
                        />
                        <div className="flex gap-2">
                          <Button size="sm" disabled={busyId === app._id} className="bg-violet-600 hover:bg-violet-700" onClick={() => review(app, "approve")}>
                            {busyId === app._id ? <Loader2 size={14} className="mr-1 animate-spin" /> : <Check size={14} className="mr-1" />}
                            Approve & publish
                          </Button>
                          <Button size="sm" variant="outline" disabled={busyId === app._id} onClick={() => review(app, "reject")}>
                            <X size={14} className="mr-1" /> Reject
                          </Button>
                        </div>
                      </div>
                    ) : (
                      app.adminNotes && <p className="border-t border-slate-100 pt-3 text-xs text-slate-500">Notes: {app.adminNotes}</p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Connect requests */}
          <TabsContent value="requests">
            <FilterPills<MentorConnectStatus> options={REQ_STATUSES} value={reqFilter} onChange={setReqFilter} />
            {!loading && requests.length === 0 && <Empty text="No connect requests yet." />}
            <div className="space-y-4">
              {requests.map((req) => (
                <Card key={req._id} className="border-slate-200">
                  <CardContent className="grid gap-4 p-5 md:grid-cols-[1fr_260px]">
                    <div className="min-w-0 space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-semibold text-slate-900">{req.fullName}</span>
                        <span className="text-slate-400">→</span>
                        <span className="font-semibold text-violet-700">{req.mentorName}</span>
                        <Badge className={`${REQ_BADGE[req.status]} capitalize`}>{req.status}</Badge>
                      </div>
                      <p className="text-xs text-slate-500">
                        <a href={`mailto:${req.email}`} className="inline-flex items-center gap-1 hover:text-violet-700">
                          <Mail size={12} /> {req.email}
                        </a>
                        {req.phone ? ` · ${req.phone}` : ""}
                        {req.startupName ? ` · ${req.startupName}` : ""}
                        {req.stage ? ` (${req.stage})` : ""} · {req.preferredMode} · {fmtDate(req.createdAt)}
                      </p>
                      <p className="text-sm font-medium text-slate-800">{req.topic}</p>
                      <p className="whitespace-pre-line rounded-lg bg-slate-50 p-3 text-sm text-slate-700">{req.message}</p>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">Status</Label>
                      <select
                        className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm capitalize"
                        value={req.status}
                        disabled={busyId === req._id}
                        onChange={(e) => updateRequest(req, { status: e.target.value as MentorConnectStatus })}
                      >
                        {REQ_STATUSES.map((s) => (
                          <option key={s} value={s}>{s === "forwarded" ? "forwarded (email mentor)" : s}</option>
                        ))}
                      </select>
                      <Textarea
                        rows={3}
                        placeholder="Internal notes"
                        defaultValue={req.adminNotes || ""}
                        onBlur={(e) => {
                          if (e.target.value !== (req.adminNotes || "")) updateRequest(req, { adminNotes: e.target.value });
                        }}
                      />
                      <Button size="sm" variant="ghost" className="w-full text-red-600 hover:bg-red-50 hover:text-red-700" onClick={() => deleteRequest(req)}>
                        <Trash2 size={14} className="mr-1" /> Delete
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Invites */}
          <TabsContent value="invites">
            <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
              <Card className="h-fit border-slate-200">
                <CardHeader>
                  <CardTitle className="text-base">New mentor invite</CardTitle>
                  <CardDescription>Single-use link. Add an email to send it automatically.</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={createInvite} className="space-y-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="inv-label">Mentor name</Label>
                      <Input id="inv-label" value={inviteForm.label} onChange={(e) => setInviteForm((p) => ({ ...p, label: e.target.value }))} />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="inv-email">Email (optional)</Label>
                      <Input id="inv-email" type="email" value={inviteForm.email} onChange={(e) => setInviteForm((p) => ({ ...p, email: e.target.value }))} />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="inv-days">Expires in (days, 0 = never)</Label>
                      <Input id="inv-days" type="number" min={0} value={inviteForm.expiresInDays} onChange={(e) => setInviteForm((p) => ({ ...p, expiresInDays: e.target.value }))} />
                    </div>
                    <Button type="submit" disabled={creatingInvite} className="w-full bg-violet-600 hover:bg-violet-700">
                      {creatingInvite ? <Loader2 size={14} className="mr-1 animate-spin" /> : <Plus size={14} className="mr-1" />}
                      Create invite
                    </Button>
                  </form>
                  {lastLink && (
                    <div className="mt-4 rounded-lg border border-violet-200 bg-violet-50 p-3">
                      <p className="mb-2 text-xs font-semibold text-violet-800">Latest invite link</p>
                      <div className="flex gap-2">
                        <Input readOnly value={lastLink} className="h-8 bg-white text-xs" />
                        <Button size="sm" variant="outline" className="h-8" onClick={() => copy(lastLink)}>
                          <Copy size={13} />
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <div className="space-y-3">
                {!loading && invites.length === 0 && <Empty text="No invites yet." />}
                {invites.map((inv) => {
                  const st = inviteStatus(inv);
                  const usable = st.label === "Active";
                  return (
                    <div key={inv._id} className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-center">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="truncate font-semibold text-slate-900">{inv.label || "Untitled invite"}</span>
                          <Badge className={st.cls}>{st.label}</Badge>
                        </div>
                        <p className="mt-0.5 text-xs text-slate-500">
                          {inv.email || "No email"} · Created {fmtDate(inv.createdAt)}
                          {inv.expiresAt ? ` · Expires ${fmtDate(inv.expiresAt)}` : ""}
                          {inv.usedAt ? ` · Used ${fmtDate(inv.usedAt)}` : ""}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        {usable && (
                          <Button size="sm" variant="outline" onClick={() => copy(inviteLink(inv.token))}>
                            <Copy size={13} className="mr-1" /> Copy link
                          </Button>
                        )}
                        {!inv.usedAt && (
                          <Button size="sm" variant="outline" onClick={() => toggleInvite(inv)}>
                            {inv.isActive ? "Revoke" : "Reactivate"}
                          </Button>
                        )}
                        <Button size="sm" variant="ghost" className="text-red-600 hover:bg-red-50" onClick={() => deleteInvite(inv)}>
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default AdminMentorship;
