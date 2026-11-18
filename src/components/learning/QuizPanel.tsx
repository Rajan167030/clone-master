import { useEffect, useState } from "react";
import { CheckCircle2, Loader2, RotateCcw, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { submitQuizApi, type LearnerLesson, type QuizResult } from "@/lib/api";

type Props = {
  slug: string;
  lesson: LearnerLesson;
  token: string | null;
  bestScore?: number | null;
  passed: boolean;
  onResult: (result: QuizResult) => void;
};

const QuizPanel = ({ slug, lesson, token, bestScore, passed, onResult }: Props) => {
  const questions = lesson.quizQuestions || [];
  const [answers, setAnswers] = useState<(number | null)[]>(() => questions.map(() => null));
  const [result, setResult] = useState<QuizResult | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setAnswers(questions.map(() => null));
    setResult(null);
    setError("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lesson._id]);

  if (!questions.length) return <p className="text-sm text-slate-500">This quiz doesn't have any questions yet.</p>;

  const submit = async () => {
    if (!token) return setError("Log in to take the quiz.");
    if (answers.some((a) => a === null)) return setError("Answer every question before submitting.");
    setSubmitting(true);
    setError("");
    try {
      const res = await submitQuizApi(token, slug, lesson._id, answers as number[]);
      setResult(res);
      onResult(res);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not submit the quiz.");
    } finally {
      setSubmitting(false);
    }
  };

  const retry = () => {
    setAnswers(questions.map(() => null));
    setResult(null);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600">
        <span>{questions.length} questions</span>
        <span>· Pass mark {lesson.quizPassPercent ?? 70}%</span>
        {bestScore != null && <span>· Best score {bestScore}%</span>}
        {passed && (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-800">
            <CheckCircle2 size={12} /> Passed
          </span>
        )}
      </div>

      {result && (
        <div className={`rounded-xl border p-4 ${result.passed ? "border-emerald-200 bg-emerald-50" : "border-amber-200 bg-amber-50"}`}>
          <p className="font-semibold text-slate-900">
            {result.passed ? "Nice work, you passed!" : "Not quite. Review the explanations and try again."}
          </p>
          <p className="text-sm text-slate-600">
            You scored {result.scorePercent}% ({result.correct}/{result.total}). Pass mark is {result.passPercent}%.
          </p>
        </div>
      )}

      <ol className="space-y-5">
        {questions.map((q, qi) => {
          const r = result?.results[qi];
          return (
            <li key={q._id} className="rounded-xl border border-slate-200 bg-white p-4">
              <p className="mb-3 font-medium text-slate-900">
                {qi + 1}. {q.question}
              </p>
              <div className="space-y-2">
                {q.options.map((opt, oi) => {
                  const selected = answers[qi] === oi;
                  const isCorrect = r && oi === r.correctIndex;
                  const isWrongPick = r && selected && !r.correct;
                  return (
                    <label
                      key={oi}
                      className={`flex cursor-pointer items-center gap-3 rounded-lg border px-3 py-2 text-sm transition-colors ${
                        isCorrect
                          ? "border-emerald-300 bg-emerald-50"
                          : isWrongPick
                            ? "border-red-300 bg-red-50"
                            : selected
                              ? "border-violet-400 bg-violet-50"
                              : "border-slate-200 hover:border-violet-200"
                      } ${result ? "cursor-default" : ""}`}
                    >
                      <input
                        type="radio"
                        name={`q-${q._id}`}
                        className="accent-violet-600"
                        checked={selected}
                        disabled={Boolean(result)}
                        onChange={() => setAnswers((prev) => prev.map((a, i) => (i === qi ? oi : a)))}
                      />
                      <span className="flex-1">{opt}</span>
                      {isCorrect && <CheckCircle2 size={16} className="text-emerald-600" />}
                      {isWrongPick && <XCircle size={16} className="text-red-600" />}
                    </label>
                  );
                })}
              </div>
              {r?.explanation && <p className="mt-3 rounded-lg bg-slate-50 p-3 text-sm text-slate-600">{r.explanation}</p>}
            </li>
          );
        })}
      </ol>

      {error && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

      {result ? (
        <Button variant="outline" onClick={retry}>
          <RotateCcw size={14} className="mr-1.5" /> Retake quiz
        </Button>
      ) : (
        <Button onClick={submit} disabled={submitting} className="bg-violet-600 hover:bg-violet-700">
          {submitting && <Loader2 size={14} className="mr-1.5 animate-spin" />} Submit answers
        </Button>
      )}
    </div>
  );
};

export default QuizPanel;
