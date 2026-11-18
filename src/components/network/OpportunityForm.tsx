import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import type { OpportunityData, OpportunityInput, OpportunityType } from "@/lib/api";
import { OPPORTUNITY_LABEL } from "@/lib/network";

const selectClass = "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm";
const toDateInput = (iso?: string | null) => (iso ? new Date(iso).toISOString().slice(0, 10) : "");

const blank: OpportunityInput = {
  title: "",
  type: "grant",
  organizer: "",
  summary: "",
  description: "",
  eligibility: "",
  benefits: "",
  deadline: null,
  location: "",
  isOnline: true,
  applyUrl: "",
  logoUrl: "",
  sectors: [],
  stages: [],
  tags: [],
  isFeatured: false,
};

type Props = {
  initial?: OpportunityData | null;
  admin?: boolean;
  saving: boolean;
  onSubmit: (o: OpportunityInput) => void;
};

const OpportunityForm = ({ initial, admin, saving, onSubmit }: Props) => {
  const [o, setO] = useState<OpportunityInput>(blank);
  useEffect(() => setO(initial ? { ...blank, ...initial } : blank), [initial]);
  const set = <K extends keyof OpportunityInput>(k: K, v: OpportunityInput[K]) => setO((p) => ({ ...p, [k]: v }));
  const csv = (v: string) => v.split(",").map((x) => x.trimStart());

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const clean = (a?: string[]) => (a || []).map((x) => x.trim()).filter(Boolean);
        onSubmit({ ...o, sectors: clean(o.sectors), stages: clean(o.stages), tags: clean(o.tags) });
      }}
      className="space-y-3"
    >
      <div className="space-y-1.5"><Label>Title *</Label><Input required value={o.title} onChange={(e) => set("title", e.target.value)} /></div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label>Type</Label>
          <select className={selectClass} value={o.type} onChange={(e) => set("type", e.target.value as OpportunityType)}>
            {Object.entries(OPPORTUNITY_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </div>
        <div className="space-y-1.5"><Label>Organizer</Label><Input value={o.organizer} onChange={(e) => set("organizer", e.target.value)} /></div>
        <div className="space-y-1.5"><Label>Deadline</Label><Input type="date" value={toDateInput(o.deadline)} onChange={(e) => set("deadline", e.target.value ? new Date(`${e.target.value}T23:59:59`).toISOString() : null)} /></div>
        <div className="space-y-1.5"><Label>Benefits / prize</Label><Input placeholder="₹10L grant + mentorship" value={o.benefits} onChange={(e) => set("benefits", e.target.value)} /></div>
      </div>
      <div className="space-y-1.5"><Label>Application / info link *</Label><Input required placeholder="https://" value={o.applyUrl} onChange={(e) => set("applyUrl", e.target.value)} /></div>
      <div className="space-y-1.5"><Label>One-line summary</Label><Input maxLength={300} value={o.summary} onChange={(e) => set("summary", e.target.value)} /></div>
      <div className="space-y-1.5"><Label>Details</Label><Textarea rows={4} value={o.description} onChange={(e) => set("description", e.target.value)} /></div>
      <div className="space-y-1.5"><Label>Eligibility</Label><Textarea rows={3} value={o.eligibility} onChange={(e) => set("eligibility", e.target.value)} /></div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5"><Label>Sectors (comma separated)</Label><Input value={(o.sectors || []).join(", ")} onChange={(e) => set("sectors", csv(e.target.value))} /></div>
        <div className="space-y-1.5"><Label>Stages (comma separated)</Label><Input placeholder="Idea, MVP" value={(o.stages || []).join(", ")} onChange={(e) => set("stages", csv(e.target.value))} /></div>
        <div className="space-y-1.5"><Label>Location</Label><Input value={o.location} onChange={(e) => set("location", e.target.value)} /></div>
        <label className="flex items-center gap-2 pt-6 text-sm"><Switch checked={o.isOnline !== false} onCheckedChange={(v) => set("isOnline", v)} /> Online / remote</label>
      </div>
      {admin && (
        <>
          <div className="space-y-1.5"><Label>Logo URL</Label><Input placeholder="https://" value={o.logoUrl} onChange={(e) => set("logoUrl", e.target.value)} /></div>
          <div className="space-y-1.5"><Label>Tags (comma separated)</Label><Input value={(o.tags || []).join(", ")} onChange={(e) => set("tags", csv(e.target.value))} /></div>
          <label className="flex items-center gap-2 text-sm"><Switch checked={Boolean(o.isFeatured)} onCheckedChange={(v) => set("isFeatured", v)} /> Featured</label>
        </>
      )}
      <Button type="submit" disabled={saving} className="w-full bg-violet-600 hover:bg-violet-700">{saving && <Loader2 size={14} className="mr-1.5 animate-spin" />} {admin ? "Save" : "Submit for review"}</Button>
    </form>
  );
};

export default OpportunityForm;
