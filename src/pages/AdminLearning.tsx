import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  CalendarClock,
  ClipboardCheck,
  Edit,
  ExternalLink,
  GraduationCap,
  Loader2,
  Plus,
  Trash2,
  Users,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import CourseBuilder, { emptyCourse } from "@/components/learning/admin/CourseBuilder";
import { AccessField, ImageField, fromLocalInput, selectClass, toLocalInput } from "@/components/learning/admin/shared";
import {
  deleteAdminCourseApi,
  deleteAdminLiveSessionApi,
  getAdminCohortsApi,
  getAdminCourseApi,
  getAdminLearningStatsApi,
  listAdminCourseLearnersApi,
  listAdminCoursesApi,
  listAdminLiveSessionsApi,
  listAdminSubmissionsApi,
  reviewAdminSubmissionApi,
  saveAdminCourseApi,
  saveAdminLiveSessionApi,
  type AdminCourse,
  type AdminCourseRow,
  type AdminLearner,
  type AdminLiveSession,
  type AdminSubmission,
  type Cohort,
  type SubmissionStatus,
} from "@/lib/api";
import { getToken } from "@/lib/session";
import { useToast } from "@/hooks/use-toast";
import { ACCESS_LABEL, formatDateTime } from "@/lib/lms";

const emptySession = (): AdminLiveSession => ({
  title: "",
  description: "",
  hostName: "",
  hostTitle: "",
  startsAt: "",
  durationMinutes: 60,
  joinUrl: "",
  recordingUrl: "",
  coverImageUrl: "",
  access: "members",
  cohortSlugs: [],
  courseSlug: "",
  isPublished: true,
});

const SUB_BADGE: Record<SubmissionStatus, string> = {
  submitted: "bg-violet-100 text-violet-800",
  reviewed: "bg-emerald-100 text-emerald-800",
  "needs-revision": "bg-amber-100 text-amber-800",
};

const AdminLearning = () => {
  const { toast } = useToast();
  const token = getToken() || "";
  const [tab, setTab] = useState("courses");
  const [stats, setStats] = useState<Awaited<ReturnType<typeof getAdminLearningStatsApi>> | null>(null);
  const [cohorts, setCohorts] = useState<Cohort[]>([]);

  const [courses, setCourses] = useState<AdminCourseRow[] | null>(null);
  const [editing, setEditing] = useState<AdminCourse | null>(null);
  const [savingCourse, setSavingCourse] = useState(false);
  const [learners, setLearners] = useState<{ course: AdminCourseRow; rows: AdminLearner[] | null } | null>(null);

  const [sessions, setSessions] = useState<AdminLiveSession[] | null>(null);
  const [sessionDraft, setSessionDraft] = useState<AdminLiveSession | null>(null);
  const [savingSession, setSavingSession] = useState(false);

  const [submissions, setSubmissions] = useState<AdminSubmission[] | null>(null);
  const [subFilter, setSubFilter] = useState<SubmissionStatus | "">("submitted");
  const [reviewDraft, setReviewDraft] = useState<Record<string, { feedback: string; grade: string }>>({});
  const [busyId, setBusyId] = useState("");

  const fail = useCallback(
    (err: unknown) => toast({ title: "Something went wrong", description: err instanceof Error ? err.message : String(err), variant: "destructive" }),
    [toast],
  );

  const loadStats = useCallback(() => getAdminLearningStatsApi(token).then(setStats).catch(() => {}), [token]);
  const loadCourses = useCallback(() => listAdminCoursesApi(token).then((r) => setCourses(r.courses)).catch(fail), [token, fail]);
  const loadSessions = useCallback(() => listAdminLiveSessionsApi(token).then((r) => setSessions(r.sessions)).catch(fail), [token, fail]);
  const loadSubmissions = useCallback(
    () => listAdminSubmissionsApi(token, subFilter || undefined).then((r) => setSubmissions(r.submissions)).catch(fail),
    [token, subFilter, fail],
  );

  useEffect(() => {
    loadStats();
    loadCourses();
    loadSessions();
    getAdminCohortsApi(token).then((r) => setCohorts(r.cohorts)).catch(() => {});
  }, [token, loadStats, loadCourses, loadSessions]);

  useEffect(() => {
    loadSubmissions();
  }, [loadSubmissions]);

  /* ---------- courses ---------- */

  const editCourse = async (id: string) => {
    try {
      const { course } = await getAdminCourseApi(token, id);
      setEditing({
        ...emptyCourse(),
        ...course,
        modules: course.modules.map((m) => ({
          ...m,
          lessons: m.lessons.map((l) => ({ ...l, liveAt: l.liveAt || null, resources: l.resources || [], quizQuestions: l.quizQuestions || [] })),
        })),
      });
    } catch (err) {
      fail(err);
    }
  };

  const saveCourse = async () => {
    if (!editing) return;
    if (!editing.title.trim()) return fail(new Error("Course title is required."));
    setSavingCourse(true);
    try {
      const res = await saveAdminCourseApi(token, editing);
      toast({ title: res.message, description: res.course.isPublished ? `Live at /learn/${res.course.slug}` : "Saved as draft." });
      setEditing(null);
      loadCourses();
      loadStats();
    } catch (err) {
      fail(err);
    } finally {
      setSavingCourse(false);
    }
  };

  const deleteCourse = async (c: AdminCourseRow) => {
    if (!window.confirm(`Delete "${c.title}"? This also removes ${c.enrolled} enrollments and all submissions.`)) return;
    try {
      await deleteAdminCourseApi(token, c._id);
      setCourses((prev) => prev?.filter((x) => x._id !== c._id) || null);
      loadStats();
    } catch (err) {
      fail(err);
    }
  };

  const showLearners = async (c: AdminCourseRow) => {
    setLearners({ course: c, rows: null });
    try {
      const r = await listAdminCourseLearnersApi(token, c._id);
      setLearners({ course: c, rows: r.learners });
    } catch (err) {
      fail(err);
      setLearners(null);
    }
  };

  /* ---------- sessions ---------- */

  const saveSession = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!sessionDraft) return;
    setSavingSession(true);
    try {
      const res = await saveAdminLiveSessionApi(token, sessionDraft);
      toast({ title: res.message });
      setSessionDraft(null);
      loadSessions();
      loadStats();
    } catch (err) {
      fail(err);
    } finally {
      setSavingSession(false);
    }
  };

  const deleteSession = async (s: AdminLiveSession) => {
    if (!s._id || !window.confirm(`Delete "${s.title}"?`)) return;
    try {
      await deleteAdminLiveSessionApi(token, s._id);
      setSessions((prev) => prev?.filter((x) => x._id !== s._id) || null);
    } catch (err) {
      fail(err);
    }
  };

  /* ---------- submissions ---------- */

  const review = async (s: AdminSubmission, status: "reviewed" | "needs-revision") => {
    const draft = reviewDraft[s._id] || { feedback: s.feedback, grade: s.grade };
    setBusyId(s._id);
    try {
      const res = await reviewAdminSubmissionApi(token, s._id, { status, feedback: draft.feedback, grade: draft.grade });
      toast({ title: res.message, description: res.emailed ? `Feedback emailed to ${s.email}.` : "Saved (email not sent; check SMTP)." });
      loadSubmissions();
      loadStats();
    } catch (err) {
      fail(err);
    } finally {
      setBusyId("");
    }
  };

  /* ---------- render ---------- */

  if (editing) {
    return (
      <div className="min-h-screen bg-slate-50">
        <main className="container mx-auto px-4 py-6">
          <CourseBuilder
            value={editing}
            onChange={setEditing}
            cohorts={cohorts}
            saving={savingCourse}
            onSave={saveCourse}
            onCancel={() => window.confirm("Discard unsaved changes?") && setEditing(null)}
            onError={(msg) => fail(new Error(msg))}
          />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="border-b bg-white">
        <div className="container mx-auto flex flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <Button asChild variant="ghost" size="icon">
              <Link to="/admin"><ArrowLeft size={18} /></Link>
            </Button>
            <div>
              <div className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-violet-600" />
                <h1 className="font-heading text-xl font-bold text-slate-900">Learning (LMS)</h1>
              </div>
              <p className="text-xs text-slate-500">Courses, live workshops, recordings and assignment reviews.</p>
            </div>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link to="/learn" target="_blank" className="gap-1.5"><ExternalLink size={14} /> View Founder Academy</Link>
          </Button>
        </div>
      </div>

      <main className="container mx-auto px-4 py-8">
        {stats && (
          <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-5">
            {[
              { label: "Published courses", value: `${stats.published}/${stats.courses}` },
              { label: "Enrollments", value: stats.enrollments },
              { label: "Completions", value: stats.completions },
              { label: "Upcoming sessions", value: stats.upcomingSessions },
              { label: "To review", value: stats.pendingSubmissions },
            ].map((s) => (
              <Card key={s.label} className="border-slate-200">
                <CardContent className="p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">{s.label}</p>
                  <p className="mt-1 text-2xl font-bold text-slate-900">{s.value}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="courses" className="gap-1.5"><GraduationCap size={14} /> Courses</TabsTrigger>
            <TabsTrigger value="sessions" className="gap-1.5"><CalendarClock size={14} /> Live sessions</TabsTrigger>
            <TabsTrigger value="submissions" className="gap-1.5">
              <ClipboardCheck size={14} /> Assignments
              {stats && stats.pendingSubmissions > 0 && <Badge className="ml-1 h-5 bg-violet-600 px-1.5">{stats.pendingSubmissions}</Badge>}
            </TabsTrigger>
          </TabsList>

          {/* Courses */}
          <TabsContent value="courses" className="space-y-4">
            <div className="flex justify-end">
              <Button onClick={() => setEditing(emptyCourse())} className="bg-violet-600 hover:bg-violet-700">
                <Plus size={14} className="mr-1" /> New course
              </Button>
            </div>
            {!courses ? (
              <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-violet-600" /></div>
            ) : courses.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-300 bg-white py-14 text-center text-sm text-slate-500">
                No courses yet. Create your first course to launch the Founder Academy.
              </div>
            ) : (
              <div className="space-y-3">
                {courses.map((c) => (
                  <div key={c._id} className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-4 md:flex-row md:items-center">
                    <div className="h-16 w-28 shrink-0 overflow-hidden rounded-lg bg-violet-50">
                      {c.coverImageUrl && <img src={c.coverImageUrl} alt="" className="h-full w-full object-cover" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-semibold text-slate-900">{c.title}</span>
                        <Badge className={c.isPublished ? "bg-emerald-100 text-emerald-800" : "bg-slate-200 text-slate-700"}>
                          {c.isPublished ? "Published" : "Draft"}
                        </Badge>
                        <Badge variant="outline">{ACCESS_LABEL[c.access]}</Badge>
                      </div>
                      <p className="mt-0.5 text-xs text-slate-500">
                        /learn/{c.slug} · {c.moduleCount} modules · {c.lessonCount} lessons
                        {c.access === "cohort" && c.cohortSlugs.length ? ` · ${c.cohortSlugs.join(", ")}` : ""}
                      </p>
                    </div>
                    <div className="flex items-center gap-4 text-center text-xs text-slate-500">
                      <div><p className="text-lg font-bold text-slate-900">{c.enrolled}</p>enrolled</div>
                      <div><p className="text-lg font-bold text-slate-900">{c.completed}</p>completed</div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => showLearners(c)}><Users size={13} className="mr-1" /> Learners</Button>
                      <Button size="sm" variant="outline" onClick={() => editCourse(c._id)}><Edit size={13} className="mr-1" /> Edit</Button>
                      <Button size="sm" variant="ghost" className="text-red-600 hover:bg-red-50" onClick={() => deleteCourse(c)}><Trash2 size={14} /></Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Live sessions */}
          <TabsContent value="sessions">
            <div className="grid gap-6 lg:grid-cols-[1fr_420px]">
              <div className="space-y-3">
                {!sessions ? (
                  <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-violet-600" /></div>
                ) : sessions.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-slate-300 bg-white py-14 text-center text-sm text-slate-500">No live sessions yet.</div>
                ) : (
                  sessions.map((s) => {
                    const past = new Date(s.startsAt).getTime() + s.durationMinutes * 60000 < Date.now();
                    return (
                      <div key={s._id} className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-center">
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-semibold text-slate-900">{s.title}</span>
                            <Badge className={past ? "bg-slate-200 text-slate-700" : "bg-violet-100 text-violet-800"}>{past ? "Past" : "Upcoming"}</Badge>
                            {!s.isPublished && <Badge variant="outline">Hidden</Badge>}
                            {past && !s.recordingUrl && <Badge className="bg-amber-100 text-amber-800">Add recording</Badge>}
                          </div>
                          <p className="text-xs text-slate-500">
                            {formatDateTime(s.startsAt)} · {s.durationMinutes} min · {ACCESS_LABEL[s.access]}
                            {s.hostName ? ` · ${s.hostName}` : ""}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => setSessionDraft({ ...emptySession(), ...s })}><Edit size={13} className="mr-1" /> Edit</Button>
                          <Button size="sm" variant="ghost" className="text-red-600 hover:bg-red-50" onClick={() => deleteSession(s)}><Trash2 size={14} /></Button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              <Card className="h-fit border-slate-200">
                <CardHeader className="flex flex-row items-center justify-between space-y-0">
                  <CardTitle className="text-base">{sessionDraft?._id ? "Edit session" : "New live session"}</CardTitle>
                  {sessionDraft && <Button variant="ghost" size="sm" onClick={() => setSessionDraft(null)}>Clear</Button>}
                </CardHeader>
                <CardContent>
                  {!sessionDraft ? (
                    <Button onClick={() => setSessionDraft(emptySession())} className="w-full bg-violet-600 hover:bg-violet-700">
                      <Plus size={14} className="mr-1" /> Schedule a session
                    </Button>
                  ) : (
                    <form onSubmit={saveSession} className="space-y-3">
                      <div className="space-y-1.5">
                        <Label>Title *</Label>
                        <Input required value={sessionDraft.title} onChange={(e) => setSessionDraft({ ...sessionDraft, title: e.target.value })} />
                      </div>
                      <div className="grid grid-cols-[1fr_100px] gap-2">
                        <div className="space-y-1.5">
                          <Label>Starts at *</Label>
                          <Input
                            required
                            type="datetime-local"
                            value={toLocalInput(sessionDraft.startsAt)}
                            onChange={(e) => setSessionDraft({ ...sessionDraft, startsAt: fromLocalInput(e.target.value) || "" })}
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label>Minutes</Label>
                          <Input type="number" min={5} value={sessionDraft.durationMinutes} onChange={(e) => setSessionDraft({ ...sessionDraft, durationMinutes: Number(e.target.value) })} />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <Input placeholder="Host name" value={sessionDraft.hostName} onChange={(e) => setSessionDraft({ ...sessionDraft, hostName: e.target.value })} />
                        <Input placeholder="Host title" value={sessionDraft.hostTitle} onChange={(e) => setSessionDraft({ ...sessionDraft, hostTitle: e.target.value })} />
                      </div>
                      <Textarea rows={3} placeholder="Description" value={sessionDraft.description} onChange={(e) => setSessionDraft({ ...sessionDraft, description: e.target.value })} />
                      <div className="space-y-1.5">
                        <Label>Join URL (Zoom / Meet)</Label>
                        <Input placeholder="https://" value={sessionDraft.joinUrl} onChange={(e) => setSessionDraft({ ...sessionDraft, joinUrl: e.target.value })} />
                      </div>
                      <div className="space-y-1.5">
                        <Label>Recording URL (after the session → video library)</Label>
                        <Input placeholder="https://" value={sessionDraft.recordingUrl} onChange={(e) => setSessionDraft({ ...sessionDraft, recordingUrl: e.target.value })} />
                      </div>
                      <ImageField
                        id="ls-cover"
                        label="Cover / thumbnail"
                        value={sessionDraft.coverImageUrl}
                        onChange={(v) => setSessionDraft({ ...sessionDraft, coverImageUrl: v })}
                        folder="founders-connect/live-sessions"
                        onError={(m) => fail(new Error(m))}
                      />
                      <AccessField
                        access={sessionDraft.access}
                        cohortSlugs={sessionDraft.cohortSlugs}
                        cohorts={cohorts}
                        onChange={(access, cohortSlugs) => setSessionDraft({ ...sessionDraft, access, cohortSlugs })}
                      />
                      <div className="space-y-1.5">
                        <Label>Related course (optional)</Label>
                        <select className={selectClass} value={sessionDraft.courseSlug} onChange={(e) => setSessionDraft({ ...sessionDraft, courseSlug: e.target.value })}>
                          <option value="">None</option>
                          {(courses || []).map((c) => <option key={c.slug} value={c.slug}>{c.title}</option>)}
                        </select>
                      </div>
                      <label className="flex items-center gap-2 text-sm">
                        <Switch checked={sessionDraft.isPublished} onCheckedChange={(v) => setSessionDraft({ ...sessionDraft, isPublished: v })} />
                        Visible on the Founder Academy
                      </label>
                      <Button type="submit" disabled={savingSession} className="w-full bg-violet-600 hover:bg-violet-700">
                        {savingSession && <Loader2 size={14} className="mr-1.5 animate-spin" />} Save session
                      </Button>
                    </form>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Submissions */}
          <TabsContent value="submissions">
            <div className="mb-4 flex flex-wrap gap-2">
              {(["submitted", "needs-revision", "reviewed", ""] as (SubmissionStatus | "")[]).map((s) => (
                <button
                  key={s || "all"}
                  type="button"
                  onClick={() => setSubFilter(s)}
                  className={`rounded-full border px-3 py-1 text-xs font-semibold capitalize ${
                    subFilter === s ? "border-violet-600 bg-violet-600 text-white" : "border-slate-200 bg-white text-slate-600 hover:border-violet-300"
                  }`}
                >
                  {s ? s.replace("-", " ") : "All"}
                </button>
              ))}
            </div>
            {!submissions ? (
              <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-violet-600" /></div>
            ) : submissions.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-300 bg-white py-14 text-center text-sm text-slate-500">Nothing to review here.</div>
            ) : (
              <div className="space-y-4">
                {submissions.map((s) => {
                  const draft = reviewDraft[s._id] || { feedback: s.feedback, grade: s.grade };
                  const setDraft = (d: Partial<typeof draft>) => setReviewDraft((p) => ({ ...p, [s._id]: { ...draft, ...d } }));
                  return (
                    <Card key={s._id} className="border-slate-200">
                      <CardContent className="grid gap-4 p-5 md:grid-cols-[1fr_320px]">
                        <div className="min-w-0 space-y-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-semibold text-slate-900">{s.fullName || s.email}</span>
                            <Badge className={`${SUB_BADGE[s.status]} capitalize`}>{s.status.replace("-", " ")}</Badge>
                          </div>
                          <p className="text-xs text-slate-500">
                            {s.email} · {s.courseTitle} → <strong>{s.lessonTitle}</strong> · {formatDateTime(s.updatedAt)}
                          </p>
                          {s.text && <p className="whitespace-pre-line rounded-lg bg-slate-50 p-3 text-sm text-slate-700">{s.text}</p>}
                          {s.linkUrl && (
                            <a href={s.linkUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-sm font-semibold text-violet-700">
                              <ExternalLink size={13} /> Open submitted link
                            </a>
                          )}
                        </div>
                        <div className="space-y-2">
                          <Textarea rows={4} placeholder="Feedback for the founder" value={draft.feedback} onChange={(e) => setDraft({ feedback: e.target.value })} />
                          <Input placeholder="Grade (optional), e.g. A, 8/10" value={draft.grade} onChange={(e) => setDraft({ grade: e.target.value })} />
                          <div className="flex gap-2">
                            <Button size="sm" disabled={busyId === s._id} className="flex-1 bg-violet-600 hover:bg-violet-700" onClick={() => review(s, "reviewed")}>
                              {busyId === s._id && <Loader2 size={13} className="mr-1 animate-spin" />} Mark reviewed
                            </Button>
                            <Button size="sm" variant="outline" disabled={busyId === s._id} className="flex-1" onClick={() => review(s, "needs-revision")}>
                              Request revision
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>

      <Dialog open={Boolean(learners)} onOpenChange={(o) => !o && setLearners(null)}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Learners · {learners?.course.title}</DialogTitle>
          </DialogHeader>
          {!learners?.rows ? (
            <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-violet-600" /></div>
          ) : learners.rows.length === 0 ? (
            <p className="py-6 text-center text-sm text-slate-500">No one has enrolled yet.</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {learners.rows.map((l) => (
                <li key={l._id} className="flex items-center gap-4 py-3">
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-slate-900">{l.fullName || l.email}</p>
                    <p className="truncate text-xs text-slate-500">{l.email} · last active {formatDateTime(l.lastActivityAt)}</p>
                  </div>
                  <div className="w-36">
                    <div className="mb-1 flex justify-between text-[11px] text-slate-500">
                      <span>{l.progress.completedLessons}/{l.progress.totalLessons}</span>
                      <span>{l.progress.percent}%</span>
                    </div>
                    <Progress value={l.progress.percent} className="h-1.5" />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminLearning;
