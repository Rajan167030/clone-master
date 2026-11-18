import { useState } from "react";
import { Link } from "react-router-dom";
import { CheckCircle2, Circle, Landmark, Loader2 } from "lucide-react";
import ToolShell, { Pill, ScoreBadge, Section, levelTone, useToolArtifact } from "@/components/ai/ToolShell";
import { Field, FormCard, GenerateBar, StageSelect } from "@/components/ai/ToolForm";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useSEO } from "@/hooks/useSEO";
import { assessInvestorReadinessApi, type InvestorReadiness as Result, type ReadinessInput } from "@/lib/api";
import { getToken } from "@/lib/session";

const CHECKLIST: { key: string; label: string }[] = [
  { key: "pitchDeck", label: "Pitch deck" },
  { key: "financialModel", label: "Financial model (3-yr)" },
  { key: "capTable", label: "Clean cap table" },
  { key: "incorporationDocs", label: "Incorporation documents" },
  { key: "founderAgreement", label: "Founders' agreement / vesting" },
  { key: "ipAssignment", label: "IP assigned to company" },
  { key: "metricsDashboard", label: "Metrics dashboard" },
  { key: "customerReferences", label: "Customer references" },
];

const LEVEL: Record<Result["level"], string> = {
  early: "Early: keep building",
  building: "Building toward a raise",
  almost_ready: "Almost ready",
  ready: "Ready to raise",
};

const emptyInput: ReadinessInput = {
  startupName: "",
  stage: "",
  sector: "",
  monthlyRevenue: "",
  growth: "",
  customers: "",
  runwayMonths: "",
  burn: "",
  teamSize: "",
  founders: "",
  raisedSoFar: "",
  raiseAmount: "",
  useOfFunds: "",
  entity: "",
  notes: "",
  checklist: {},
};

const ReadinessResult = ({ r, checklist }: { r: Result; checklist: Record<string, boolean> }) => (
  <div className="space-y-6">
    <div className="flex flex-col gap-5 rounded-2xl border border-slate-200 bg-white p-6 sm:flex-row sm:items-center">
      <ScoreBadge score={r.readinessScore} label="Readiness" />
      <div>
        <Pill tone={r.level === "ready" ? "emerald" : r.level === "almost_ready" ? "violet" : r.level === "building" ? "amber" : "red"}>{LEVEL[r.level]}</Pill>
        <p className="mt-2 text-slate-700">{r.summary}</p>
      </div>
    </div>

    <Section title="Where you stand">
      <div className="grid gap-4 md:grid-cols-2">
        {r.dimensions.map((d) => (
          <div key={d.name} className="rounded-xl border border-slate-200 p-4">
            <div className="mb-1.5 flex items-center justify-between">
              <span className="font-semibold text-slate-900">{d.name}</span>
              <Pill tone={d.status === "strong" ? "emerald" : levelTone(d.status)}>{d.status}</Pill>
            </div>
            <Progress value={d.score * 10} className="h-1.5" />
            <p className="mt-2 text-sm text-slate-600">{d.advice}</p>
          </div>
        ))}
      </div>
    </Section>

    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <Section title="Gaps to close">
        <ul className="space-y-3">
          {r.gaps.map((g, i) => (
            <li key={i} className="flex gap-3">
              <Pill tone={levelTone(g.priority)}>{g.priority}</Pill>
              <div>
                <p className="font-medium text-slate-900">{g.item}</p>
                <p className="text-sm text-slate-600">{g.action}</p>
              </div>
            </li>
          ))}
        </ul>
      </Section>
      <Section title="Data room">
        <ul className="space-y-2 text-sm">
          {CHECKLIST.map((c) => (
            <li key={c.key} className="flex items-center gap-2">
              {checklist[c.key] ? <CheckCircle2 size={16} className="text-emerald-600" /> : <Circle size={16} className="text-slate-300" />}
              <span className={checklist[c.key] ? "text-slate-700" : "text-slate-500"}>{c.label}</span>
            </li>
          ))}
        </ul>
        <Button asChild variant="outline" size="sm" className="mt-4 w-full">
          <Link to="/tools/pitch-deck">Build your deck</Link>
        </Button>
      </Section>
    </div>

    <div className="grid gap-6 md:grid-cols-2">
      <Section title="Suggested raise">
        <p className="text-2xl font-bold text-slate-900">{r.suggestedRaise.amountRange || "—"}</p>
        {r.suggestedRaise.instrument && <p className="text-sm font-medium text-violet-800">{r.suggestedRaise.instrument}</p>}
        <p className="mt-2 text-sm text-slate-600">{r.suggestedRaise.rationale}</p>
      </Section>
      <Section title="Who to pitch">
        <ul className="space-y-2">
          {r.investorTypes.map((t, i) => (
            <li key={i}>
              <p className="font-medium text-slate-900">{t.type}</p>
              <p className="text-sm text-slate-600">{t.why}</p>
            </li>
          ))}
        </ul>
        <Button asChild variant="outline" size="sm" className="mt-4">
          <Link to="/investors">Browse investors on Founders Connect</Link>
        </Button>
      </Section>
    </div>

    <Section title="90-day plan">
      <ol className="relative space-y-5 border-l-2 border-violet-200 pl-5">
        {r.ninetyDayPlan.map((p, i) => (
          <li key={i}>
            <span className="absolute -left-[7px] mt-1.5 h-3 w-3 rounded-full bg-violet-600" />
            <p className="text-xs font-bold uppercase tracking-wide text-violet-700">{p.period}</p>
            <p className="font-semibold text-slate-900">{p.focus}</p>
            <ul className="mt-1 list-disc pl-5 text-sm text-slate-600">
              {p.actions.map((a, j) => <li key={j}>{a}</li>)}
            </ul>
          </li>
        ))}
      </ol>
    </Section>
  </div>
);

const InvestorReadiness = () => {
  useSEO({ title: "Investor Readiness Check | Founders Connect", description: "Find out if you're ready to raise and what to fix first." });
  const { artifact, loadingArtifact, open, reset, refreshKey } = useToolArtifact<Result>("investor_readiness");
  const [input, setInput] = useState<ReadinessInput>(emptyInput);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const set = (k: keyof ReadinessInput) => (v: string) => setInput((p) => ({ ...p, [k]: v }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.stage || !input.founders.trim()) return setError("Stage and a short description of the founding team are required.");
    setLoading(true);
    setError("");
    try {
      open((await assessInvestorReadinessApi(getToken() || "", input)).artifact);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ToolShell
      kind="investor_readiness"
      icon={Landmark}
      title="Fundraising & Investor Readiness"
      description="A readiness score, the gaps to close, a realistic raise and a 90-day plan."
      hasResult={Boolean(artifact)}
      onNew={reset}
      refreshKey={refreshKey}
    >
      {loadingArtifact ? (
        <div className="flex justify-center py-20"><Loader2 className="h-7 w-7 animate-spin text-violet-600" /></div>
      ) : artifact ? (
        <ReadinessResult r={artifact.output} checklist={(artifact.input.checklist as Record<string, boolean>) || {}} />
      ) : (
        <FormCard onSubmit={submit}>
          <div className="grid gap-4 sm:grid-cols-3">
            <Field id="ir-name" label="Startup name" value={input.startupName} onChange={set("startupName")} />
            <StageSelect value={input.stage} onChange={set("stage")} />
            <Field id="ir-sector" label="Sector" value={input.sector} onChange={set("sector")} />
            <Field id="ir-mrr" label="Monthly revenue" placeholder="e.g. ₹4L MRR" value={input.monthlyRevenue} onChange={set("monthlyRevenue")} />
            <Field id="ir-growth" label="Growth" placeholder="e.g. 15% MoM for 6 months" value={input.growth} onChange={set("growth")} />
            <Field id="ir-cust" label="Customers / users" value={input.customers} onChange={set("customers")} />
            <Field id="ir-runway" label="Runway (months)" value={input.runwayMonths} onChange={set("runwayMonths")} />
            <Field id="ir-burn" label="Monthly burn" value={input.burn} onChange={set("burn")} />
            <Field id="ir-team" label="Team size" value={input.teamSize} onChange={set("teamSize")} />
          </div>
          <Field id="ir-founders" label="Founding team" required rows={3} placeholder="Who are the founders, roles, relevant experience, full-time?" value={input.founders} onChange={set("founders")} />
          <div className="grid gap-4 sm:grid-cols-2">
            <Field id="ir-raised" label="Raised so far" placeholder="e.g. ₹50L from angels (iSAFE)" value={input.raisedSoFar} onChange={set("raisedSoFar")} />
            <Field id="ir-raise" label="Planning to raise" value={input.raiseAmount} onChange={set("raiseAmount")} />
            <Field id="ir-entity" label="Legal entity" placeholder="e.g. Pvt Ltd (India), DPIIT recognised" value={input.entity} onChange={set("entity")} />
            <Field id="ir-uof" label="Use of funds" value={input.useOfFunds} onChange={set("useOfFunds")} />
          </div>
          <div>
            <p className="mb-2 text-sm font-medium">What's ready in your data room?</p>
            <div className="grid gap-2 sm:grid-cols-2">
              {CHECKLIST.map((c) => (
                <label key={c.key} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    className="accent-violet-600"
                    checked={Boolean(input.checklist[c.key])}
                    onChange={(e) => setInput((p) => ({ ...p, checklist: { ...p.checklist, [c.key]: e.target.checked } }))}
                  />
                  {c.label}
                </label>
              ))}
            </div>
          </div>
          <Field id="ir-notes" label="Anything else" rows={2} value={input.notes} onChange={set("notes")} />
          <GenerateBar loading={loading} error={error} label="Check my readiness" />
        </FormCard>
      )}
    </ToolShell>
  );
};

export default InvestorReadiness;
