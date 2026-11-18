import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Award, BookOpen, CalendarClock, CheckCircle2, ClipboardList, GraduationCap, Loader2, Users } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import CourseCard from "@/components/learning/CourseCard";
import { useSEO } from "@/hooks/useSEO";
import { getMyLearningApi, type MyLearningResponse } from "@/lib/api";
import { getAccount, getToken } from "@/lib/session";
import { formatDateTime, formatMinutes } from "@/lib/lms";

const SUBMISSION_STYLE = {
  submitted: { label: "Awaiting review", cls: "bg-violet-100 text-violet-800" },
  reviewed: { label: "Reviewed", cls: "bg-emerald-100 text-emerald-800" },
  "needs-revision": { label: "Revise & resubmit", cls: "bg-amber-100 text-amber-800" },
} as const;

const MyLearning = () => {
  const token = getToken() || "";
  const account = getAccount();
  const [data, setData] = useState<MyLearningResponse | null>(null);
  const [error, setError] = useState("");

  useSEO({ title: "My Learning | Founders Connect", description: "Your courses, progress and upcoming live sessions." });

  useEffect(() => {
    getMyLearningApi(token).then(setData).catch((e) => setError(e.message));
  }, [token]);

  const active = data?.courses.filter((c) => c.progress.percent < 100) || [];
  const finished = data?.courses.filter((c) => c.progress.percent === 100) || [];

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="container mx-auto max-w-6xl px-4 py-10">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-violet-600">My learning</p>
            <h1 className="font-heading text-3xl font-extrabold text-slate-900">
              {account?.fullName ? `Welcome back, ${account.fullName.split(" ")[0]}` : "Welcome back"}
            </h1>
          </div>
          <Button asChild variant="outline"><Link to="/learn">Browse all courses</Link></Button>
        </div>

        {error && <p className="mb-6 rounded-md bg-red-50 px-4 py-2 text-sm text-red-700">{error}</p>}
        {!data && !error && <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-violet-600" /></div>}

        {data && (
          <div className="space-y-10">
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              {[
                { label: "Courses enrolled", value: data.stats.enrolled, icon: BookOpen },
                { label: "Courses completed", value: data.stats.completed, icon: Award },
                { label: "Lessons completed", value: data.stats.lessonsCompleted, icon: CheckCircle2 },
                { label: "Awaiting feedback", value: data.stats.pendingFeedback, icon: ClipboardList },
              ].map((s) => (
                <div key={s.label} className="rounded-2xl border border-slate-200 bg-white p-5">
                  <s.icon className="mb-2 h-5 w-5 text-violet-600" />
                  <p className="text-3xl font-bold text-slate-900">{s.value}</p>
                  <p className="text-xs font-medium text-slate-500">{s.label}</p>
                </div>
              ))}
            </div>

            {data.cohorts.length > 0 && (
              <div className="flex items-center gap-3 rounded-xl border border-violet-200 bg-violet-50 px-4 py-3 text-sm text-violet-900">
                <Users size={16} />
                Cohort access unlocked: <strong>{data.cohorts.join(", ")}</strong>
              </div>
            )}

            <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
              <section>
                <h2 className="mb-4 font-heading text-xl font-bold text-slate-900">Continue learning</h2>
                {active.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
                    <GraduationCap className="mx-auto mb-3 h-8 w-8 text-violet-400" />
                    <p className="font-semibold text-slate-800">No courses in progress</p>
                    <p className="mt-1 text-sm text-slate-500">Pick a course below or browse the full catalog.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {active.map((c) => (
                      <div key={c._id} className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 sm:flex-row sm:items-center">
                        <div className="h-20 w-full shrink-0 overflow-hidden rounded-xl bg-violet-50 sm:w-32">
                          {c.coverImageUrl && <img src={c.coverImageUrl} alt="" className="h-full w-full object-cover" />}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="truncate font-semibold text-slate-900">{c.title}</h3>
                          {c.progress.nextLessonTitle && <p className="truncate text-sm text-slate-500">Next: {c.progress.nextLessonTitle}</p>}
                          <div className="mt-2 flex items-center gap-3">
                            <Progress value={c.progress.percent} className="h-1.5 flex-1" />
                            <span className="text-xs font-semibold text-slate-600">{c.progress.percent}%</span>
                          </div>
                        </div>
                        <Button asChild size="sm" className="bg-violet-600 hover:bg-violet-700">
                          <Link to={`/learn/${c.slug}${c.progress.nextLessonId ? `?lesson=${c.progress.nextLessonId}` : ""}`}>
                            Resume <ArrowRight size={14} className="ml-1" />
                          </Link>
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

                {finished.length > 0 && (
                  <div className="mt-8">
                    <h2 className="mb-4 font-heading text-lg font-bold text-slate-900">Completed</h2>
                    <div className="flex flex-wrap gap-3">
                      {finished.map((c) => (
                        <Link key={c._id} to={`/learn/${c.slug}`} className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-sm font-medium text-emerald-800">
                          <Award size={14} /> {c.title}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </section>

              <aside className="space-y-8">
                <section>
                  <h2 className="mb-3 flex items-center gap-2 font-heading text-lg font-bold text-slate-900">
                    <CalendarClock size={18} className="text-violet-600" /> Upcoming live sessions
                  </h2>
                  {data.upcomingSessions.length === 0 ? (
                    <p className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-500">Nothing scheduled right now.</p>
                  ) : (
                    <ul className="space-y-3">
                      {data.upcomingSessions.map((s) => (
                        <li key={s._id} className="rounded-xl border border-slate-200 bg-white p-4">
                          <p className="font-semibold text-slate-900">{s.title}</p>
                          <p className="text-xs text-slate-500">{formatDateTime(s.startsAt)} · {formatMinutes(s.durationMinutes)}</p>
                          {s.joinUrl && (
                            <a href={s.joinUrl} target="_blank" rel="noreferrer" className="mt-2 inline-block text-sm font-semibold text-violet-700 hover:underline">
                              Join link →
                            </a>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                </section>

                <section>
                  <h2 className="mb-3 flex items-center gap-2 font-heading text-lg font-bold text-slate-900">
                    <ClipboardList size={18} className="text-violet-600" /> My assignments
                  </h2>
                  {data.submissions.length === 0 ? (
                    <p className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-500">No submissions yet.</p>
                  ) : (
                    <ul className="space-y-3">
                      {data.submissions.map((s) => (
                        <li key={s._id}>
                          <Link to={`/learn/${s.courseSlug}?lesson=${s.lessonId}`} className="block rounded-xl border border-slate-200 bg-white p-4 hover:border-violet-300">
                            <div className="flex items-start justify-between gap-2">
                              <p className="font-medium text-slate-900">{s.lessonTitle}</p>
                              <span className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold ${SUBMISSION_STYLE[s.status].cls}`}>
                                {SUBMISSION_STYLE[s.status].label}
                              </span>
                            </div>
                            <p className="text-xs text-slate-500">{s.courseTitle}</p>
                            {s.feedback && <p className="mt-2 line-clamp-2 text-sm text-slate-600">“{s.feedback}”</p>}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </section>
              </aside>
            </div>

            {data.recommended.length > 0 && (
              <section>
                <h2 className="mb-4 font-heading text-xl font-bold text-slate-900">Recommended for you</h2>
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                  {data.recommended.map((c) => <CourseCard key={c._id} course={c} />)}
                </div>
              </section>
            )}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default MyLearning;
