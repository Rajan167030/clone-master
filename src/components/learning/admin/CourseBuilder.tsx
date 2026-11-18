import { useState } from "react";
import { ArrowDown, ArrowUp, ChevronDown, ChevronRight, Loader2, Plus, Save, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { AdminCourse, AdminLesson, AdminModule, AdminQuizQuestion, Cohort, LessonType } from "@/lib/api";
import { LESSON_META } from "@/lib/lms";
import { AccessField, ImageField, fromLocalInput, selectClass, toLocalInput } from "./shared";

export const emptyCourse = (): AdminCourse => ({
  title: "",
  subtitle: "",
  description: "",
  coverImageUrl: "",
  category: "",
  level: "beginner",
  tags: [],
  instructorName: "",
  instructorTitle: "",
  instructorPhotoUrl: "",
  access: "members",
  cohortSlugs: [],
  isPublished: false,
  order: 0,
  modules: [],
});

const emptyLesson = (type: LessonType = "video"): AdminLesson => ({
  title: "",
  type,
  summary: "",
  durationMinutes: 0,
  isPreview: false,
  videoUrl: "",
  content: "",
  resources: [],
  liveAt: null,
  liveUrl: "",
  quizPassPercent: 70,
  quizQuestions: [],
  assignmentInstructions: "",
});

const emptyQuestion = (): AdminQuizQuestion => ({ question: "", options: ["", ""], correctIndex: 0, explanation: "" });

const move = <T,>(list: T[], from: number, to: number) => {
  if (to < 0 || to >= list.length) return list;
  const next = [...list];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
};

type Props = {
  value: AdminCourse;
  onChange: (c: AdminCourse) => void;
  cohorts: Cohort[];
  saving: boolean;
  onSave: () => void;
  onCancel: () => void;
  onError: (msg: string) => void;
};

const QuizEditor = ({ lesson, onChange }: { lesson: AdminLesson; onChange: (l: AdminLesson) => void }) => {
  const setQ = (qi: number, q: AdminQuizQuestion) =>
    onChange({ ...lesson, quizQuestions: lesson.quizQuestions.map((x, i) => (i === qi ? q : x)) });
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <Label className="shrink-0">Pass mark (%)</Label>
        <Input
          type="number"
          min={0}
          max={100}
          className="w-24"
          value={lesson.quizPassPercent}
          onChange={(e) => onChange({ ...lesson, quizPassPercent: Number(e.target.value) })}
        />
      </div>
      {lesson.quizQuestions.map((q, qi) => (
        <div key={q._id || qi} className="space-y-2 rounded-lg border border-slate-200 bg-white p-3">
          <div className="flex gap-2">
            <Input placeholder={`Question ${qi + 1}`} value={q.question} onChange={(e) => setQ(qi, { ...q, question: e.target.value })} />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => onChange({ ...lesson, quizQuestions: lesson.quizQuestions.filter((_, i) => i !== qi) })}
            >
              <Trash2 size={14} />
            </Button>
          </div>
          {q.options.map((opt, oi) => (
            <div key={oi} className="flex items-center gap-2">
              <input
                type="radio"
                name={`correct-${qi}-${q._id || ""}`}
                title="Correct answer"
                className="accent-emerald-600"
                checked={q.correctIndex === oi}
                onChange={() => setQ(qi, { ...q, correctIndex: oi })}
              />
              <Input
                className="h-8"
                placeholder={`Option ${oi + 1}`}
                value={opt}
                onChange={(e) => setQ(qi, { ...q, options: q.options.map((o, i) => (i === oi ? e.target.value : o)) })}
              />
              {q.options.length > 2 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() =>
                    setQ(qi, {
                      ...q,
                      options: q.options.filter((_, i) => i !== oi),
                      correctIndex: q.correctIndex === oi ? 0 : q.correctIndex > oi ? q.correctIndex - 1 : q.correctIndex,
                    })
                  }
                >
                  <X size={13} />
                </Button>
              )}
            </div>
          ))}
          <div className="flex items-center justify-between">
            {q.options.length < 6 ? (
              <Button type="button" variant="link" size="sm" className="h-auto px-0 text-violet-700" onClick={() => setQ(qi, { ...q, options: [...q.options, ""] })}>
                + Add option
              </Button>
            ) : (
              <span />
            )}
            <span className="text-[11px] text-slate-400">Select the radio button next to the correct answer</span>
          </div>
          <Input
            className="h-8"
            placeholder="Explanation shown after submitting (optional)"
            value={q.explanation}
            onChange={(e) => setQ(qi, { ...q, explanation: e.target.value })}
          />
        </div>
      ))}
      <Button type="button" variant="outline" size="sm" onClick={() => onChange({ ...lesson, quizQuestions: [...lesson.quizQuestions, emptyQuestion()] })}>
        <Plus size={13} className="mr-1" /> Add question
      </Button>
    </div>
  );
};

const LessonEditor = ({ lesson, onChange }: { lesson: AdminLesson; onChange: (l: AdminLesson) => void }) => {
  const set = <K extends keyof AdminLesson>(k: K, v: AdminLesson[K]) => onChange({ ...lesson, [k]: v });
  return (
    <div className="space-y-4 rounded-lg bg-slate-50 p-4">
      <div className="grid gap-3 sm:grid-cols-[1fr_160px_110px]">
        <div className="space-y-1.5">
          <Label>Lesson title</Label>
          <Input value={lesson.title} onChange={(e) => set("title", e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label>Type</Label>
          <select className={selectClass} value={lesson.type} onChange={(e) => set("type", e.target.value as LessonType)}>
            {(Object.keys(LESSON_META) as LessonType[]).map((t) => (
              <option key={t} value={t}>{LESSON_META[t].label}</option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5">
          <Label>Minutes</Label>
          <Input type="number" min={0} value={lesson.durationMinutes || ""} onChange={(e) => set("durationMinutes", Number(e.target.value))} />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label>Short summary</Label>
        <Input value={lesson.summary} onChange={(e) => set("summary", e.target.value)} />
      </div>

      {(lesson.type === "video" || lesson.type === "live") && (
        <div className="space-y-1.5">
          <Label>{lesson.type === "live" ? "Recording URL (after the session)" : "Video URL"}</Label>
          <Input placeholder="YouTube, Vimeo, Loom, Google Drive or .mp4" value={lesson.videoUrl} onChange={(e) => set("videoUrl", e.target.value)} />
        </div>
      )}
      {lesson.type === "live" && (
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label>Session date & time</Label>
            <Input type="datetime-local" value={toLocalInput(lesson.liveAt)} onChange={(e) => set("liveAt", fromLocalInput(e.target.value))} />
          </div>
          <div className="space-y-1.5">
            <Label>Join URL</Label>
            <Input placeholder="Zoom / Meet link" value={lesson.liveUrl} onChange={(e) => set("liveUrl", e.target.value)} />
          </div>
        </div>
      )}
      {lesson.type !== "quiz" && (
        <div className="space-y-1.5">
          <Label>{lesson.type === "reading" ? "Lesson content" : "Notes / description (optional)"}</Label>
          <Textarea rows={lesson.type === "reading" ? 10 : 4} value={lesson.content} onChange={(e) => set("content", e.target.value)} />
        </div>
      )}
      {lesson.type === "assignment" && (
        <div className="space-y-1.5">
          <Label>Assignment instructions</Label>
          <Textarea rows={5} value={lesson.assignmentInstructions} onChange={(e) => set("assignmentInstructions", e.target.value)} />
        </div>
      )}
      {lesson.type === "quiz" && <QuizEditor lesson={lesson} onChange={onChange} />}

      <div className="space-y-2">
        <Label>Resources & downloads</Label>
        {lesson.resources.map((r, ri) => (
          <div key={ri} className="flex gap-2">
            <Input className="h-8" placeholder="Label" value={r.label} onChange={(e) => set("resources", lesson.resources.map((x, i) => (i === ri ? { ...x, label: e.target.value } : x)))} />
            <Input className="h-8" placeholder="https://" value={r.url} onChange={(e) => set("resources", lesson.resources.map((x, i) => (i === ri ? { ...x, url: e.target.value } : x)))} />
            <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={() => set("resources", lesson.resources.filter((_, i) => i !== ri))}>
              <X size={13} />
            </Button>
          </div>
        ))}
        <Button type="button" variant="link" size="sm" className="h-auto px-0 text-violet-700" onClick={() => set("resources", [...lesson.resources, { label: "", url: "" }])}>
          + Add resource link
        </Button>
      </div>

      <label className="flex items-center gap-2 text-sm">
        <Switch checked={lesson.isPreview} onCheckedChange={(v) => set("isPreview", v)} />
        Free preview: viewable even by people without access
      </label>
    </div>
  );
};

const CourseBuilder = ({ value, onChange, cohorts, saving, onSave, onCancel, onError }: Props) => {
  const [openLesson, setOpenLesson] = useState<string>("");
  const [collapsed, setCollapsed] = useState<Record<number, boolean>>({});
  const set = <K extends keyof AdminCourse>(k: K, v: AdminCourse[K]) => onChange({ ...value, [k]: v });
  const setModules = (modules: AdminModule[]) => onChange({ ...value, modules });
  const setModule = (mi: number, m: AdminModule) => setModules(value.modules.map((x, i) => (i === mi ? m : x)));

  const totalLessons = value.modules.reduce((s, m) => s + m.lessons.length, 0);

  return (
    <div className="space-y-6">
      <div className="sticky top-0 z-10 -mx-1 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white/95 px-4 py-3 backdrop-blur">
        <div>
          <p className="font-semibold text-slate-900">{value._id ? "Edit course" : "New course"}</p>
          <p className="text-xs text-slate-500">{value.modules.length} modules · {totalLessons} lessons</p>
        </div>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-sm font-medium">
            <Switch checked={value.isPublished} onCheckedChange={(v) => set("isPublished", v)} />
            {value.isPublished ? "Published" : "Draft"}
          </label>
          <Button variant="outline" onClick={onCancel}>Cancel</Button>
          <Button onClick={onSave} disabled={saving} className="bg-violet-600 hover:bg-violet-700">
            {saving ? <Loader2 size={14} className="mr-1.5 animate-spin" /> : <Save size={14} className="mr-1.5" />} Save course
          </Button>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
        <Card className="border-slate-200">
          <CardHeader><CardTitle className="text-base">Course details</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5 sm:col-span-2">
                <Label>Title *</Label>
                <Input value={value.title} onChange={(e) => set("title", e.target.value)} />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label>Subtitle</Label>
                <Input value={value.subtitle} onChange={(e) => set("subtitle", e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>URL slug</Label>
                <Input placeholder="auto from title" value={value.slug || ""} onChange={(e) => set("slug", e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Category</Label>
                <Input placeholder="e.g. Fundraising" value={value.category} onChange={(e) => set("category", e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Level</Label>
                <select className={selectClass} value={value.level} onChange={(e) => set("level", e.target.value as AdminCourse["level"])}>
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <Label>Display order</Label>
                <Input type="number" value={value.order} onChange={(e) => set("order", Number(e.target.value))} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Description</Label>
              <Textarea rows={5} value={value.description} onChange={(e) => set("description", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Tags (comma separated)</Label>
              <Input value={value.tags.join(", ")} onChange={(e) => set("tags", e.target.value.split(",").map((t) => t.trimStart()))} />
            </div>
            <ImageField id="cb-cover" label="Cover image" value={value.coverImageUrl} onChange={(v) => set("coverImageUrl", v)} folder="founders-connect/courses" onError={onError} />
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="border-slate-200">
            <CardHeader><CardTitle className="text-base">Access</CardTitle></CardHeader>
            <CardContent>
              <AccessField
                access={value.access}
                cohortSlugs={value.cohortSlugs}
                cohorts={cohorts}
                onChange={(access, cohortSlugs) => onChange({ ...value, access, cohortSlugs })}
              />
            </CardContent>
          </Card>
          <Card className="border-slate-200">
            <CardHeader><CardTitle className="text-base">Instructor</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <Input placeholder="Name" value={value.instructorName} onChange={(e) => set("instructorName", e.target.value)} />
              <Input placeholder="Title, e.g. Partner at XYZ Ventures" value={value.instructorTitle} onChange={(e) => set("instructorTitle", e.target.value)} />
              <ImageField id="cb-instr" label="Photo" value={value.instructorPhotoUrl} onChange={(v) => set("instructorPhotoUrl", v)} folder="founders-connect/courses" onError={onError} />
            </CardContent>
          </Card>
        </div>
      </div>

      <Card className="border-slate-200">
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle className="text-base">Curriculum</CardTitle>
          <Button size="sm" variant="outline" onClick={() => setModules([...value.modules, { title: `Module ${value.modules.length + 1}`, description: "", lessons: [] }])}>
            <Plus size={14} className="mr-1" /> Add module
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {value.modules.length === 0 && <p className="text-sm text-slate-500">Add a module to start building the curriculum.</p>}
          {value.modules.map((m, mi) => (
            <div key={m._id || `new-${mi}`} className="rounded-xl border border-slate-200">
              <div className="flex items-center gap-2 border-b border-slate-100 bg-slate-50/70 px-3 py-2">
                <button type="button" onClick={() => setCollapsed((p) => ({ ...p, [mi]: !p[mi] }))} className="text-slate-500">
                  {collapsed[mi] ? <ChevronRight size={16} /> : <ChevronDown size={16} />}
                </button>
                <span className="text-xs font-bold text-slate-500">M{mi + 1}</span>
                <Input className="h-8 flex-1 border-transparent bg-transparent font-semibold focus-visible:border-input" value={m.title} onChange={(e) => setModule(mi, { ...m, title: e.target.value })} />
                <Button variant="ghost" size="icon" className="h-8 w-8" disabled={mi === 0} onClick={() => setModules(move(value.modules, mi, mi - 1))}><ArrowUp size={14} /></Button>
                <Button variant="ghost" size="icon" className="h-8 w-8" disabled={mi === value.modules.length - 1} onClick={() => setModules(move(value.modules, mi, mi + 1))}><ArrowDown size={14} /></Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-red-600"
                  onClick={() => {
                    if (m.lessons.length && !window.confirm(`Delete "${m.title}" and its ${m.lessons.length} lessons?`)) return;
                    setModules(value.modules.filter((_, i) => i !== mi));
                  }}
                >
                  <Trash2 size={14} />
                </Button>
              </div>
              {!collapsed[mi] && (
                <div className="space-y-2 p-3">
                  <Input className="h-8 text-sm" placeholder="Module description (optional)" value={m.description} onChange={(e) => setModule(mi, { ...m, description: e.target.value })} />
                  {m.lessons.map((l, li) => {
                    const key = l._id || `${mi}-${li}`;
                    const Icon = LESSON_META[l.type].icon;
                    const open = openLesson === key;
                    const setLessons = (lessons: AdminLesson[]) => setModule(mi, { ...m, lessons });
                    return (
                      <div key={key} className="rounded-lg border border-slate-200 bg-white">
                        <div className="flex items-center gap-2 px-3 py-2">
                          <button type="button" className="flex flex-1 items-center gap-2 text-left text-sm" onClick={() => setOpenLesson(open ? "" : key)}>
                            {open ? <ChevronDown size={14} className="text-slate-400" /> : <ChevronRight size={14} className="text-slate-400" />}
                            <Icon size={14} className="text-violet-600" />
                            <span className={l.title ? "font-medium text-slate-800" : "italic text-slate-400"}>{l.title || "Untitled lesson"}</span>
                            {l.isPreview && <span className="rounded bg-emerald-50 px-1.5 text-[10px] font-semibold text-emerald-700">PREVIEW</span>}
                            {l.type === "quiz" && <span className="text-[11px] text-slate-400">{l.quizQuestions.length} Qs</span>}
                          </button>
                          <Button variant="ghost" size="icon" className="h-7 w-7" disabled={li === 0} onClick={() => setLessons(move(m.lessons, li, li - 1))}><ArrowUp size={13} /></Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7" disabled={li === m.lessons.length - 1} onClick={() => setLessons(move(m.lessons, li, li + 1))}><ArrowDown size={13} /></Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-red-600"
                            onClick={() => window.confirm("Delete this lesson? Learner progress on it will be lost.") && setLessons(m.lessons.filter((_, i) => i !== li))}
                          >
                            <Trash2 size={13} />
                          </Button>
                        </div>
                        {open && (
                          <div className="px-3 pb-3">
                            <LessonEditor lesson={l} onChange={(nl) => setLessons(m.lessons.map((x, i) => (i === li ? nl : x)))} />
                          </div>
                        )}
                      </div>
                    );
                  })}
                  <div className="flex flex-wrap gap-2 pt-1">
                    {(Object.keys(LESSON_META) as LessonType[]).map((t) => {
                      const Icon = LESSON_META[t].icon;
                      return (
                        <Button
                          key={t}
                          type="button"
                          variant="outline"
                          size="sm"
                          className="h-7 text-xs"
                          onClick={() => {
                            setModule(mi, { ...m, lessons: [...m.lessons, emptyLesson(t)] });
                            setOpenLesson(`${mi}-${m.lessons.length}`);
                          }}
                        >
                          <Icon size={12} className="mr-1" /> {LESSON_META[t].label}
                        </Button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default CourseBuilder;
