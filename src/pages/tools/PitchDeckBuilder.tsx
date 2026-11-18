import { useState } from "react";
import { Loader2, Presentation } from "lucide-react";
import ToolShell, { useToolArtifact } from "@/components/ai/ToolShell";
import DeckEditor from "@/components/ai/DeckEditor";
import { Field, FormCard, GenerateBar, StageSelect, selectClass } from "@/components/ai/ToolForm";
import { Label } from "@/components/ui/label";
import { useSEO } from "@/hooks/useSEO";
import { generatePitchDeckApi, type PitchDeck, type StartupBrief } from "@/lib/api";
import { getToken } from "@/lib/session";

const emptyBrief: StartupBrief = {
  startupName: "",
  oneLiner: "",
  stage: "",
  sector: "",
  problem: "",
  solution: "",
  targetCustomer: "",
  market: "",
  businessModel: "",
  traction: "",
  competition: "",
  team: "",
  ask: "",
  audience: "investor",
};

const PitchDeckBuilder = () => {
  useSEO({ title: "AI Pitch Deck Builder | Founders Connect", description: "Turn your startup story into an investor-ready pitch deck." });
  const { artifact, setArtifact, loadingArtifact, open, reset, refreshKey } = useToolArtifact<PitchDeck>("pitch_deck");
  const [brief, setBrief] = useState<StartupBrief>(emptyBrief);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const set = (k: keyof StartupBrief) => (v: string) => setBrief((p) => ({ ...p, [k]: v }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!brief.startupName.trim() || !brief.problem.trim() || !brief.solution.trim()) {
      return setError("Startup name, problem and solution are required.");
    }
    setLoading(true);
    setError("");
    try {
      const res = await generatePitchDeckApi(getToken() || "", brief);
      open(res.artifact);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ToolShell
      kind="pitch_deck"
      icon={Presentation}
      title="AI Pitch Builder"
      description="Answer a few questions. Get a 10–13 slide investor deck you can edit and download."
      hasResult={Boolean(artifact)}
      onNew={reset}
      refreshKey={refreshKey}
    >
      {loadingArtifact ? (
        <div className="flex justify-center py-20"><Loader2 className="h-7 w-7 animate-spin text-violet-600" /></div>
      ) : artifact ? (
        <DeckEditor artifact={artifact} onSaved={setArtifact} />
      ) : (
        <FormCard onSubmit={submit}>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field id="pd-name" label="Startup name" required value={brief.startupName} onChange={set("startupName")} />
            <Field id="pd-sector" label="Sector" placeholder="e.g. B2B SaaS, D2C, Fintech" value={brief.sector} onChange={set("sector")} />
            <div className="sm:col-span-2">
              <Field id="pd-one" label="One-liner" placeholder="We help ___ do ___ by ___" value={brief.oneLiner} onChange={set("oneLiner")} />
            </div>
            <StageSelect value={brief.stage} onChange={set("stage")} />
            <div className="space-y-1.5">
              <Label htmlFor="pd-aud">Audience</Label>
              <select id="pd-aud" className={selectClass} value={brief.audience} onChange={(e) => setBrief((p) => ({ ...p, audience: e.target.value as StartupBrief["audience"] }))}>
                <option value="investor">Seed / pre-seed investors</option>
                <option value="accelerator">Accelerator application</option>
                <option value="demo_day">Demo day</option>
              </select>
            </div>
          </div>
          <Field id="pd-problem" label="Problem" required rows={3} placeholder="Who has the problem, how painful is it, how do they solve it today?" value={brief.problem} onChange={set("problem")} />
          <Field id="pd-solution" label="Solution / product" required rows={3} value={brief.solution} onChange={set("solution")} />
          <div className="grid gap-4 sm:grid-cols-2">
            <Field id="pd-cust" label="Target customer" rows={2} value={brief.targetCustomer} onChange={set("targetCustomer")} />
            <Field id="pd-market" label="Market" rows={2} placeholder="Market size estimates, why now" value={brief.market} onChange={set("market")} />
            <Field id="pd-bm" label="Business model" rows={2} placeholder="Who pays, how much, how often" value={brief.businessModel} onChange={set("businessModel")} />
            <Field id="pd-traction" label="Traction" rows={2} placeholder="Users, revenue, growth, pilots, LOIs" value={brief.traction} onChange={set("traction")} />
            <Field id="pd-comp" label="Competition" rows={2} value={brief.competition} onChange={set("competition")} />
            <Field id="pd-team" label="Team" rows={2} placeholder="Founders and relevant experience" value={brief.team} onChange={set("team")} />
          </div>
          <Field id="pd-ask" label="The ask" placeholder="e.g. Raising ₹2 Cr to hire 4 engineers and reach ₹50L ARR" value={brief.ask} onChange={set("ask")} />
          <GenerateBar loading={loading} error={error} label="Generate pitch deck" note="Missing numbers show up as [placeholders] for you to fill in." />
        </FormCard>
      )}
    </ToolShell>
  );
};

export default PitchDeckBuilder;
