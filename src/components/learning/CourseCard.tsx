import { Link } from "react-router-dom";
import { BookOpen, Clock, Lock } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import type { CourseProgress, CourseSummary, LmsLockReason } from "@/lib/api";
import { ACCESS_LABEL, formatMinutes } from "@/lib/lms";

type Props = {
  course: CourseSummary & { locked?: boolean; lockReason?: LmsLockReason; progress?: CourseProgress | null };
};

const CourseCard = ({ course }: Props) => (
  <Link
    to={`/learn/${course.slug}`}
    className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
  >
    <div className="relative aspect-[16/9] bg-violet-50">
      {course.coverImageUrl ? (
        <img src={course.coverImageUrl} alt="" className="h-full w-full object-cover" loading="lazy" />
      ) : (
        <div className="flex h-full w-full items-center justify-center">
          <BookOpen className="h-10 w-10 text-violet-300" />
        </div>
      )}
      <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-semibold text-slate-700 shadow-sm">
        {course.locked && <Lock size={11} />}
        {ACCESS_LABEL[course.access]}
      </span>
    </div>
    <div className="flex flex-1 flex-col p-5">
      <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-violet-600">
        {[course.category, course.level].filter(Boolean).join(" · ")}
      </p>
      <h3 className="mt-1 font-heading text-lg font-bold leading-snug text-slate-900 group-hover:text-violet-700">{course.title}</h3>
      {course.subtitle && <p className="mt-1 line-clamp-2 text-sm text-slate-600">{course.subtitle}</p>}
      <div className="mt-auto pt-4">
        {course.progress ? (
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-medium text-slate-600">
              <span>{course.progress.percent === 100 ? "Completed" : "In progress"}</span>
              <span>{course.progress.percent}%</span>
            </div>
            <Progress value={course.progress.percent} className="h-1.5" />
          </div>
        ) : (
          <div className="flex items-center gap-3 text-xs text-slate-500">
            <span>{course.lessonCount} lessons</span>
            {course.totalMinutes > 0 && (
              <span className="inline-flex items-center gap-1">
                <Clock size={12} /> {formatMinutes(course.totalMinutes)}
              </span>
            )}
            {course.instructorName && <span className="truncate">· {course.instructorName}</span>}
          </div>
        )}
      </div>
    </div>
  </Link>
);

export default CourseCard;
