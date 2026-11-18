import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { CalendarClock, GraduationCap, Library, Lock, PlayCircle, Radio, Search, Video } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import CourseCard from "@/components/learning/CourseCard";
import VideoEmbed from "@/components/learning/VideoEmbed";
import { useSEO } from "@/hooks/useSEO";
import {
  getLibraryApi,
  listCoursesApi,
  listLiveSessionsApi,
  type CatalogCourse,
  type LibraryItem,
  type LiveSessionView,
} from "@/lib/api";
import { getToken } from "@/lib/session";
import { ACCESS_LABEL, formatDateTime, formatMinutes, lockMessage } from "@/lib/lms";

const TABS = ["courses", "live", "library"] as const;
type Tab = (typeof TABS)[number];

const Spinner = () => (
  <div className="flex justify-center py-20">
    <div className="h-8 w-8 animate-spin rounded-full border-2 border-violet-600 border-t-transparent" />
  </div>
);

const Empty = ({ icon: Icon, title, text }: { icon: typeof Video; title: string; text: string }) => (
  <div className="mx-auto max-w-md rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
    <Icon className="mx-auto mb-3 h-8 w-8 text-violet-400" />
    <p className="font-semibold text-slate-800">{title}</p>
    <p className="mt-1 text-sm text-slate-500">{text}</p>
  </div>
);

const SessionCard = ({ session, past }: { session: LiveSessionView; past?: boolean }) => {
  const now = Date.now();
  const isLive = new Date(session.startsAt).getTime() <= now && new Date(session.endsAt).getTime() >= now;
  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center">
      <div className="flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-xl bg-violet-50 text-violet-700">
        <span className="text-[11px] font-bold uppercase">
          {new Date(session.startsAt).toLocaleDateString("en-IN", { month: "short" })}
        </span>
        <span className="text-2xl font-extrabold leading-none">{new Date(session.startsAt).getDate()}</span>
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          {isLive && (
            <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-[11px] font-bold text-red-700">
              <Radio size={11} /> LIVE NOW
            </span>
          )}
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600">{ACCESS_LABEL[session.access]}</span>
        </div>
        <h3 className="mt-1 font-heading text-base font-bold text-slate-900">{session.title}</h3>
        <p className="text-xs text-slate-500">
          {formatDateTime(session.startsAt)} · {formatMinutes(session.durationMinutes)}
          {session.hostName ? ` · ${session.hostName}` : ""}
          {session.hostTitle ? `, ${session.hostTitle}` : ""}
        </p>
        {session.description && <p className="mt-2 line-clamp-2 text-sm text-slate-600">{session.description}</p>}
      </div>
      <div className="shrink-0">
        {session.locked ? (
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500">
            <Lock size={13} /> {lockMessage(session.lockReason)}
          </span>
        ) : past ? (
          session.recordingUrl ? (
            <Button asChild size="sm" variant="outline">
              <a href={session.recordingUrl} target="_blank" rel="noreferrer">
                <PlayCircle size={14} className="mr-1" /> Watch recording
              </a>
            </Button>
          ) : (
            <span className="text-xs text-slate-400">Recording coming soon</span>
          )
        ) : session.joinUrl ? (
          <Button asChild size="sm" className="bg-violet-600 hover:bg-violet-700">
            <a href={session.joinUrl} target="_blank" rel="noreferrer">
              {isLive ? "Join now" : "Join link"}
            </a>
          </Button>
        ) : (
          <span className="text-xs text-slate-400">Join link shared before start</span>
        )}
      </div>
    </div>
  );
};

const Learn = () => {
  const [params, setParams] = useSearchParams();
  const tab: Tab = TABS.includes(params.get("tab") as Tab) ? (params.get("tab") as Tab) : "courses";
  const token = getToken();

  const [courses, setCourses] = useState<CatalogCourse[] | null>(null);
  const [sessions, setSessions] = useState<{ upcoming: LiveSessionView[]; past: LiveSessionView[] } | null>(null);
  const [library, setLibrary] = useState<LibraryItem[] | null>(null);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const [playing, setPlaying] = useState<LibraryItem | null>(null);

  useSEO({
    title: "Founder Academy | Founders Connect",
    description: "Structured courses, live workshops and a recorded video library for startup founders.",
    keywords: "startup courses, founder learning, startup workshops, fundraising course, founder academy",
    ogType: "website",
  });

  useEffect(() => {
    listCoursesApi(token).then((r) => setCourses(r.courses)).catch((e) => setError(e.message));
  }, [token]);

  useEffect(() => {
    if (tab === "live" && !sessions) listLiveSessionsApi(token).then(setSessions).catch((e) => setError(e.message));
    if (tab === "library" && !library) getLibraryApi(token).then((r) => setLibrary(r.items)).catch((e) => setError(e.message));
  }, [tab, token, sessions, library]);

  const categories = useMemo(
    () => [...new Set((courses || []).map((c) => c.category).filter(Boolean) as string[])],
    [courses],
  );
  const visibleCourses = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (courses || []).filter(
      (c) =>
        (!category || c.category === category) &&
        (!q || [c.title, c.subtitle, c.instructorName, ...(c.tags || [])].join(" ").toLowerCase().includes(q)),
    );
  }, [courses, query, category]);
  const inProgress = (courses || []).filter((c) => c.progress && c.progress.percent < 100);

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <section className="border-b border-slate-200 bg-[#FAF7F0] py-12 md:py-16">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div className="max-w-2xl">
              <p className="mb-2 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-violet-600">
                <GraduationCap size={14} /> Founder Academy
              </p>
              <h1 className="font-heading text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
                Learn what it takes to <span className="text-violet-600">build & raise</span>
              </h1>
              <p className="mt-3 text-base text-slate-600">
                Operator-led courses, live workshops and a library of recorded sessions, built for founders at every stage.
              </p>
            </div>
            {token ? (
              <Button asChild className="bg-violet-600 hover:bg-violet-700">
                <Link to="/learn/my">My learning dashboard</Link>
              </Button>
            ) : (
              <Button asChild variant="outline">
                <Link to="/login">Log in to track progress</Link>
              </Button>
            )}
          </div>
        </div>
      </section>

      <main className="container mx-auto max-w-6xl px-4 py-10">
        {error && <p className="mb-6 rounded-md bg-red-50 px-4 py-2 text-sm text-red-700">{error}</p>}

        <Tabs value={tab} onValueChange={(v) => setParams(v === "courses" ? {} : { tab: v }, { replace: true })}>
          <TabsList className="mb-8">
            <TabsTrigger value="courses" className="gap-1.5"><GraduationCap size={14} /> Courses</TabsTrigger>
            <TabsTrigger value="live" className="gap-1.5"><CalendarClock size={14} /> Live sessions</TabsTrigger>
            <TabsTrigger value="library" className="gap-1.5"><Library size={14} /> Video library</TabsTrigger>
          </TabsList>

          <TabsContent value="courses">
            {!courses ? (
              <Spinner />
            ) : courses.length === 0 ? (
              <Empty icon={GraduationCap} title="Courses are on the way" text="Our first founder courses are being recorded. Check back soon." />
            ) : (
              <>
                {inProgress.length > 0 && (
                  <div className="mb-10">
                    <h2 className="mb-4 font-heading text-xl font-bold text-slate-900">Continue learning</h2>
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                      {inProgress.slice(0, 3).map((c) => <CourseCard key={c._id} course={c} />)}
                    </div>
                  </div>
                )}
                <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <Input className="pl-9" placeholder="Search courses, topics, instructors" value={query} onChange={(e) => setQuery(e.target.value)} />
                  </div>
                  {categories.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {["", ...categories].map((c) => (
                        <button
                          key={c || "all"}
                          type="button"
                          onClick={() => setCategory(c)}
                          className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                            category === c ? "border-violet-600 bg-violet-600 text-white" : "border-slate-200 text-slate-600 hover:border-violet-300"
                          }`}
                        >
                          {c || "All"}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                {visibleCourses.length === 0 ? (
                  <Empty icon={Search} title="No matching courses" text="Try a different search or category." />
                ) : (
                  <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {visibleCourses.map((c) => <CourseCard key={c._id} course={c} />)}
                  </div>
                )}
              </>
            )}
          </TabsContent>

          <TabsContent value="live">
            {!sessions ? (
              <Spinner />
            ) : (
              <div className="space-y-10">
                <div>
                  <h2 className="mb-4 font-heading text-xl font-bold text-slate-900">Upcoming</h2>
                  {sessions.upcoming.length === 0 ? (
                    <Empty icon={CalendarClock} title="No sessions scheduled" text="New workshops are announced here and over email." />
                  ) : (
                    <div className="space-y-4">{sessions.upcoming.map((s) => <SessionCard key={s._id} session={s} />)}</div>
                  )}
                </div>
                {sessions.past.length > 0 && (
                  <div>
                    <h2 className="mb-4 font-heading text-xl font-bold text-slate-900">Past sessions</h2>
                    <div className="space-y-4">{sessions.past.map((s) => <SessionCard key={s._id} session={s} past />)}</div>
                  </div>
                )}
              </div>
            )}
          </TabsContent>

          <TabsContent value="library">
            {!library ? (
              <Spinner />
            ) : library.length === 0 ? (
              <Empty
                icon={Video}
                title="Nothing here yet"
                text={token ? "Recordings and course videos you have access to will show up here." : "Log in to see recordings and course videos."}
              />
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {library.map((item) => (
                  <button
                    key={`${item.kind}-${item.id}`}
                    type="button"
                    onClick={() => setPlaying(item)}
                    className="group overflow-hidden rounded-2xl border border-slate-200 bg-white text-left shadow-sm transition-shadow hover:shadow-md"
                  >
                    <div className="relative aspect-video bg-slate-100">
                      {item.thumbnailUrl && <img src={item.thumbnailUrl} alt="" className="h-full w-full object-cover" loading="lazy" />}
                      <div className="absolute inset-0 flex items-center justify-center bg-slate-900/20 transition-colors group-hover:bg-slate-900/35">
                        <PlayCircle className="h-12 w-12 text-white drop-shadow" />
                      </div>
                      <span className="absolute left-3 top-3 rounded-full bg-white/95 px-2 py-0.5 text-[11px] font-semibold text-slate-700">
                        {item.kind === "recording" ? "Session recording" : "Course video"}
                      </span>
                    </div>
                    <div className="p-4">
                      <h3 className="line-clamp-2 font-semibold text-slate-900">{item.title}</h3>
                      <p className="mt-1 truncate text-xs text-slate-500">
                        {[item.subtitle, formatMinutes(item.durationMinutes)].filter(Boolean).join(" · ")}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>

      <Dialog open={Boolean(playing)} onOpenChange={(o) => !o && setPlaying(null)}>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>{playing?.title}</DialogTitle>
          </DialogHeader>
          {playing && <VideoEmbed url={playing.videoUrl} title={playing.title} />}
          {playing?.courseSlug && (
            <Button asChild variant="outline" size="sm" className="w-fit">
              <Link to={`/learn/${playing.courseSlug}?lesson=${playing.id}`}>Open in course</Link>
            </Button>
          )}
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default Learn;
