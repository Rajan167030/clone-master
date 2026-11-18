import { useEffect, useState } from "react";
import { Loader2, MessageSquareText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { submitAssignmentApi, type LearnerLesson, type LearnerSubmission } from "@/lib/api";

type Props = {
  slug: string;
  lesson: LearnerLesson;
  token: string | null;
  submission?: LearnerSubmission;
  onSubmitted: (res: Awaited<ReturnType<typeof submitAssignmentApi>>) => void;
};

const STATUS_STYLE: Record<LearnerSubmission["status"], { label: string; cls: string }> = {
  submitted: { label: "Submitted · awaiting review", cls: "bg-violet-100 text-violet-800" },
  reviewed: { label: "Reviewed", cls: "bg-emerald-100 text-emerald-800" },
  "needs-revision": { label: "Revision requested", cls: "bg-amber-100 text-amber-800" },
};

const AssignmentPanel = ({ slug, lesson, token, submission, onSubmitted }: Props) => {
  const [text, setText] = useState(submission?.text || "");
  const [linkUrl, setLinkUrl] = useState(submission?.linkUrl || "");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setText(submission?.text || "");
    setLinkUrl(submission?.linkUrl || "");
    setError("");
  }, [lesson._id, submission?.text, submission?.linkUrl]);

  const locked = submission?.status === "reviewed";

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!token) return setError("Log in to submit your assignment.");
    if (!text.trim() && !linkUrl.trim()) return setError("Add your response or a link to your work.");
    setSubmitting(true);
    setError("");
    try {
      onSubmitted(await submitAssignmentApi(token, slug, lesson._id, { text, linkUrl }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not submit.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-5">
      {lesson.assignmentInstructions && (
        <div className="rounded-xl border border-violet-100 bg-violet-50/60 p-4">
          <p className="mb-1 text-xs font-bold uppercase tracking-wide text-violet-700">Instructions</p>
          <p className="whitespace-pre-line text-sm text-slate-700">{lesson.assignmentInstructions}</p>
        </div>
      )}

      {submission && (
        <div className="space-y-2">
          <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_STYLE[submission.status].cls}`}>
            {STATUS_STYLE[submission.status].label}
          </span>
          {(submission.feedback || submission.grade) && (
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <p className="mb-1 inline-flex items-center gap-1.5 text-sm font-semibold text-slate-900">
                <MessageSquareText size={15} className="text-violet-600" /> Feedback from the team
                {submission.grade && <span className="ml-2 rounded bg-slate-100 px-1.5 py-0.5 text-xs">Grade: {submission.grade}</span>}
              </p>
              {submission.feedback && <p className="whitespace-pre-line text-sm text-slate-700">{submission.feedback}</p>}
            </div>
          )}
        </div>
      )}

      <form onSubmit={submit} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="as-text">Your response</Label>
          <Textarea id="as-text" rows={8} disabled={locked} value={text} onChange={(e) => setText(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="as-link">Link to your work (Google Doc, deck, Notion…)</Label>
          <Input id="as-link" type="url" disabled={locked} placeholder="https://" value={linkUrl} onChange={(e) => setLinkUrl(e.target.value)} />
        </div>
        {error && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
        {!locked && (
          <Button type="submit" disabled={submitting} className="bg-violet-600 hover:bg-violet-700">
            {submitting && <Loader2 size={14} className="mr-1.5 animate-spin" />}
            {submission ? "Resubmit" : "Submit assignment"}
          </Button>
        )}
      </form>
    </div>
  );
};

export default AssignmentPanel;
