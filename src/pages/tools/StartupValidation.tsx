import { useState } from "react";
import { FlaskConical, Loader2 } from "lucide-react";
import ToolShell, { BulletList, Pill, ScoreBadge, Section, levelTone, useToolArtifact } from "@/components/ai/ToolShell";
import { Field, FormCard, GenerateBar, StageSelect } from "@/components/ai/ToolForm";
import { useSEO } from "@/hooks/useSEO";
import { validateStartupApi, type StartupValidation as Result, type ValidationInput } from "@/lib/api";
import { getToken } from "@/lib/session";

const emptyInput: ValidationInput = {
  title: "",
  idea: "",
  customer: "",
  problem: "",
  currentAlternatives: "",
  solution: "",
  pricing: "",
  geography: "India",
  stage: "",
  evidence: "",
};

const CanvasBox = ({ title, items, text, className = "" }: { title: string; items?: string[]; text?: string; className?: string }) => (
  <div className={`rounded-xl border border-slate-200 bg-white p-3 ${className}`}>
    <p className="mb-1.5 text-[11px] font-bold uppercase tracking-wide text-violet-700">{title}</p>
    {text ? <p className="text-sm text-slate-700">{text}</p> : <BulletList items={items || []} empty="—" />}
  </div>
);

const ValidationResult = ({ r }: { r: Result }) => {
  const lc = r.leanCanvas;
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-5 rounded-2xl border border-slate-200 bg-white p-6 sm:flex-row sm:items-center">
        <ScoreBadge score={r.viabilityScore} label="Viability" />
        <p className="text-slate-700">{r.summary}</p>
      </div>

      <Section title="Lean canvas">
        <div className="grid gap-3 md:grid-cols-5">
          <CanvasBox title="Problem" items={lc.problem} className="md:row-span-2" />
          <CanvasBox title="Solution" items={lc.solution} />
          <CanvasBox title="Unique value proposition" text={lc.uniqueValueProposition} className="md:row-span-2" />
          <CanvasBox title="Unfair advantage" text={lc.unfairAdvantage} />
          <CanvasBox title="Customer segments" items={lc.customerSegments} className="md:row-span-2" />
          <CanvasBox title="Key metrics" items={lc.keyMetrics} />
          <CanvasBox title="Channels" items={lc.channels} />
          <CanvasBox title="Cost structure" items={lc.costStructure} className="md:col-span-2" />
          <CanvasBox title="Revenue streams" items={lc.revenueStreams} className="md:col-span-3" />
        </div>
      </Section>

      <Section title="Riskiest assumptions">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-500">
                <th className="py-2 pr-3">Assumption</th>
                <th className="py-2 pr-3">Risk</th>
                <th className="py-2">How to test it</th>
              </tr>
            </thead>
            <tbody>
              {r.assumptions.map((a, i) => (
                <tr key={i} className="border-b border-slate-100 align-top">
                  <td className="py-2.5 pr-3 font-medium text-slate-800">{a.assumption}</td>
                  <td className="py-2.5 pr-3"><Pill tone={levelTone(a.risk)}>{a.risk}</Pill></td>
                  <td className="py-2.5 text-slate-600">{a.howToTest}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section title="Validation experiments">
        <div className="grid gap-4 md:grid-cols-2">
          {r.experiments.map((e, i) => (
            <div key={i} className="rounded-xl border border-slate-200 p-4">
              <div className="flex items-start justify-between gap-2">
                <p className="font-semibold text-slate-900">{e.name}</p>
                <Pill tone={levelTone(e.effort)}>{e.effort} effort</Pill>
              </div>
              <p className="mt-1 text-sm text-slate-600">{e.description}</p>
              <p className="mt-2 text-xs text-slate-500"><strong className="text-slate-700">Success:</strong> {e.successMetric}{e.timeframe ? ` · ${e.timeframe}` : ""}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Business model options">
        <div className="grid gap-4 md:grid-cols-2">
          {r.revenueModels.map((m, i) => (
            <div key={i} className="rounded-xl border border-slate-200 p-4">
              <div className="flex items-start justify-between gap-2">
                <p className="font-semibold text-slate-900">{m.model}</p>
                <Pill tone={m.fit === "high" ? "emerald" : m.fit === "medium" ? "amber" : "red"}>{m.fit} fit</Pill>
              </div>
              {m.pricingIdea && <p className="mt-1 text-sm font-medium text-violet-800">{m.pricingIdea}</p>}
              <p className="mt-1 text-sm text-slate-600">{m.notes}</p>
            </div>
          ))}
        </div>
      </Section>

      <div className="grid gap-6 md:grid-cols-2">
        <Section title="Key risks"><BulletList items={r.risks} /></Section>
        <Section title="Market questions to answer"><BulletList items={r.marketQuestions} /></Section>
      </div>
    </div>
  );
};

const StartupValidation = () => {
  useSEO({ title: "Startup Validation Assistant | Founders Connect", description: "Stress-test your idea and business model with AI." });
  const { artifact, loadingArtifact, open, reset, refreshKey } = useToolArtifact<Result>("validation");
  const [input, setInput] = useState<ValidationInput>(emptyInput);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const set = (k: keyof ValidationInput) => (v: string) => setInput((p) => ({ ...p, [k]: v }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (input.idea.trim().length < 30) return setError("Describe your idea in at least a couple of sentences.");
    setLoading(true);
    setError("");
    try {
      open((await validateStartupApi(getToken() || "", input)).artifact);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ToolShell
      kind="validation"
      icon={FlaskConical}
      title="Startup Validation & Business Model"
      description="Lean canvas, riskiest assumptions, experiments to run next and business model options."
      hasResult={Boolean(artifact)}
      onNew={reset}
      refreshKey={refreshKey}
    >
      {loadingArtifact ? (
        <div className="flex justify-center py-20"><Loader2 className="h-7 w-7 animate-spin text-violet-600" /></div>
      ) : artifact ? (
        <ValidationResult r={artifact.output} />
      ) : (
        <FormCard onSubmit={submit}>
          <Field id="sv-title" label="Name (optional)" placeholder="e.g. Kirana inventory app" value={input.title || ""} onChange={set("title")} />
          <Field id="sv-idea" label="The idea" required rows={4} placeholder="What are you building and for whom?" value={input.idea} onChange={set("idea")} />
          <div className="grid gap-4 sm:grid-cols-2">
            <Field id="sv-customer" label="Target customer" rows={2} value={input.customer} onChange={set("customer")} />
            <Field id="sv-problem" label="Problem" rows={2} value={input.problem} onChange={set("problem")} />
            <Field id="sv-alt" label="How do they solve it today?" rows={2} value={input.currentAlternatives} onChange={set("currentAlternatives")} />
            <Field id="sv-solution" label="Your solution" rows={2} value={input.solution} onChange={set("solution")} />
            <Field id="sv-pricing" label="Pricing idea" value={input.pricing} onChange={set("pricing")} />
            <Field id="sv-geo" label="Geography" value={input.geography} onChange={set("geography")} />
            <StageSelect value={input.stage} onChange={set("stage")} />
          </div>
          <Field
            id="sv-evidence"
            label="Evidence so far"
            rows={3}
            placeholder="Customer interviews, waitlist, pilots, pre-orders, anything you've learned"
            value={input.evidence}
            onChange={set("evidence")}
          />
          <GenerateBar loading={loading} error={error} label="Validate my idea" />
        </FormCard>
      )}
    </ToolShell>
  );
};

export default StartupValidation;
