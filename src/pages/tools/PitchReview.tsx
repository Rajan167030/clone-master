import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { AlertTriangle, ArrowRight, Loader2, MessageSquareText } from "lucide-react";
import ToolShell, { BulletList, Pill, ScoreBadge, Section, scoreTone, useToolArtifact } from "@/components/ai/ToolShell";
import { Field, FormCard, GenerateBar, StageSelect, selectClass } from "@/components/ai/ToolForm";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { useSEO } from "@/hooks/useSEO";
import { listAiArtifactsApi, reviewPitchApi, type AiArtifactRow, type PitchReview as Review } from "@/lib/api";
import { getToken } from "@/lib/session";

const VERDICT: Record<Review["verdict"], { label: string; tone: "red" | "amber" | "violet" | "emerald" }> = {
  not_ready: { label: "Not ready yet", tone: "red" },
  needs_work: { label: "Needs work", tone: "amber" },
  promising: { label: "Promising", tone: "violet" },
  investor_ready: { label: "Investor ready", tone: "emerald" },
};

const ReviewResult = ({ review }: { review: Review }) => (
  <div className="space-y-6">
    <div className="flex flex-col gap-5 rounded-2xl border border-slate-200 bg-white p-6 sm:flex-row sm:items-center">
      <ScoreBadge score={review.overallScore} label="Score" />
      <div>
        <Pill tone={VERDICT[review.verdict].tone}>{VERDICT[review.verdict].label}</Pill>
        <p className="mt-2 text-slate-700">{review.summary}</p>
      </div>
    </div>

    <Section title="Scorecard">
      <div className="space-y-4">
        {review.criteria.map((c) => (
          <div key={c.name}>
            <div className="mb-1 flex items-center justify-between text-sm">
              <span className="font-medium text-slate-800">{c.name}</span>
              <span className={`rounded-md border px-1.5 text-xs font-bold ${scoreTone(c.score, 10)}`}>{c.score}/10</span>
            </div>
            <Progress value={c.score * 10} className="h-1.5" />
            <p className="mt-1.5 text-sm text-slate-600">{c.feedback}</p>
          </div>
        ))}
      </div>
    </Section>

    <div className="grid gap-6 md:grid-cols-2">
      <Section title="Strengths"><BulletList items={review.strengths} /></Section>
      <Section title="Weaknesses"><BulletList items={review.weaknesses} /></Section>
    </div>

    {review.redFlags.length > 0 && (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-5">
        <p className="mb-2 flex items-center gap-1.5 font-heading font-bold text-red-900"><AlertTriangle size={16} /> Red flags for investors</p>
        <BulletList items={review.redFlags} />
      </div>
    )}

    {review.rewrites.length > 0 && (
      <Section title="Sharper wording">
        <div className="space-y-4">
          {review.rewrites.map((r, i) => (
            <div key={i} className="grid gap-2 rounded-xl bg-slate-50 p-4 md:grid-cols-[1fr_auto_1fr] md:items-center">
              <p className="text-sm text-slate-500 line-through decoration-slate-300">{r.original}</p>
              <ArrowRight size={16} className="hidden text-violet-500 md:block" />
              <div>
                <p className="text-sm font-medium text-slate-900">{r.improved}</p>
                {r.why && <p className="mt-1 text-xs text-slate-500">{r.why}</p>}
              </div>
            </div>
          ))}
        </div>
      </Section>
    )}

    <div className="grid gap-6 md:grid-cols-2">
      <Section title="Questions investors will ask">
        <ol className="list-decimal space-y-1.5 pl-5 text-sm text-slate-700">
          {review.likelyInvestorQuestions.map((q, i) => <li key={i}>{q}</li>)}
        </ol>
      </Section>
      <Section title="Next steps">
        <ol className="list-decimal space-y-1.5 pl-5 text-sm text-slate-700">
          {review.nextSteps.map((q, i) => <li key={i}>{q}</li>)}
        </ol>
      </Section>
    </div>
  </div>
);

const PitchReviewPage = () => {
  useSEO({ title: "AI Pitch Review | Founders Connect", description: "Get investor-style feedback on your pitch in a minute." });
  const [params] = useSearchParams();
  const { artifact, loadingArtifact, open, reset, refreshKey } = useToolArtifact<Review>("pitch_review");
  const [decks, setDecks] = useState<AiArtifactRow[]>([]);
  const [deckId, setDeckId] = useState(params.get("deck") || "");
  const [pitchText, setPitchText] = useState("");
  const [stage, setStage] = useState("");
  const [sector, setSector] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    listAiArtifactsApi(getToken() || "", "pitch_deck").then((r) => setDecks(r.artifacts)).catch(() => {});
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deckId && pitchText.trim().length < 150) return setError("Paste your pitch (at least a few paragraphs) or pick a saved deck.");
    setLoading(true);
    setError("");
    try {
      const res = await reviewPitchApi(getToken() || "", deckId ? { deckArtifactId: deckId, stage, sector } : { pitchText, stage, sector });
      open(res.artifact);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ToolShell
      kind="pitch_review"
      icon={MessageSquareText}
      title="AI Pitch Review"
      description="Investor-style scorecard, red flags, sharper wording and the questions you'll be asked."
      hasResult={Boolean(artifact)}
      onNew={reset}
      refreshKey={refreshKey}
    >
      {loadingArtifact ? (
        <div className="flex justify-center py-20"><Loader2 className="h-7 w-7 animate-spin text-violet-600" /></div>
      ) : artifact ? (
        <ReviewResult review={artifact.output} />
      ) : (
        <FormCard onSubmit={submit}>
          {decks.length > 0 && (
            <div className="space-y-1.5">
              <Label htmlFor="pr-deck">Review a deck from the Pitch Builder</Label>
              <select id="pr-deck" className={selectClass} value={deckId} onChange={(e) => setDeckId(e.target.value)}>
                <option value="">No, I'll paste my pitch</option>
                {decks.map((d) => <option key={d._id} value={d._id}>{d.title} ({d.slideCount} slides)</option>)}
              </select>
            </div>
          )}
          {!deckId && (
            <Field
              id="pr-text"
              label="Your pitch"
              rows={12}
              placeholder="Paste your deck text slide by slide, your pitch script, or your executive summary."
              value={pitchText}
              onChange={setPitchText}
              hint={`${pitchText.length} characters`}
            />
          )}
          <div className="grid gap-4 sm:grid-cols-2">
            <StageSelect value={stage} onChange={setStage} />
            <Field id="pr-sector" label="Sector" value={sector} onChange={setSector} />
          </div>
          <GenerateBar loading={loading} error={error} label="Review my pitch" />
        </FormCard>
      )}
    </ToolShell>
  );
};

export default PitchReviewPage;
