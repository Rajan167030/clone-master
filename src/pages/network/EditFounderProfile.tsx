import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ExternalLink, Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { useSEO } from "@/hooks/useSEO";
import { NetworkLayout, Spinner } from "@/components/network/NetworkUI";
import { getMyFounderProfileApi, updateMyFounderProfileApi, type CofounderRole, type FounderProfileData, type LookingFor } from "@/lib/api";
import { getToken } from "@/lib/session";
import { COFOUNDER_ROLE_LABEL, LOOKING_FOR_LABEL, STAGE_LABEL } from "@/lib/network";

const selectClass = "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm";

const Toggle = <T extends string>({ options, labels, value, onChange }: { options: T[]; labels: Record<string, string>; value: T[]; onChange: (v: T[]) => void }) => (
  <div className="flex flex-wrap gap-2">
    {options.map((o) => {
      const on = value.includes(o);
      return (
        <button
          key={o}
          type="button"
          onClick={() => onChange(on ? value.filter((x) => x !== o) : [...value, o])}
          className={`rounded-full border px-3 py-1 text-xs font-semibold ${on ? "border-violet-600 bg-violet-600 text-white" : "border-slate-200 bg-white text-slate-600 hover:border-violet-300"}`}
        >
          {labels[o]}
        </button>
      );
    })}
  </div>
);

const Card = ({ title, children, desc }: { title: string; desc?: string; children: React.ReactNode }) => (
  <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
    <div>
      <h2 className="font-heading text-lg font-bold text-slate-900">{title}</h2>
      {desc && <p className="text-sm text-slate-500">{desc}</p>}
    </div>
    {children}
  </section>
);

const EditFounderProfile = () => {
  useSEO({ title: "Founder Profile | Founders Connect", description: "Edit your founder and startup profile." });
  const token = getToken() || "";
  const { toast } = useToast();
  const [p, setP] = useState<FounderProfileData | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    getMyFounderProfileApi(token).then((r) => setP(r.profile)).catch((e) => toast({ title: "Could not load", description: e.message, variant: "destructive" }));
  }, [token, toast]);

  if (!p) return <NetworkLayout title="Founder profile"><Spinner /></NetworkLayout>;

  const set = <K extends keyof FounderProfileData>(k: K, v: FounderProfileData[K]) => setP({ ...p, [k]: v });
  const setCo = <K extends keyof FounderProfileData["cofounder"]>(k: K, v: FounderProfileData["cofounder"][K]) => setP({ ...p, cofounder: { ...p.cofounder, [k]: v } });
  const csv = (v: string) => v.split(",").map((x) => x.trimStart()).slice(0, 15);

  const save = async () => {
    setSaving(true);
    try {
      const res = await updateMyFounderProfileApi(token, { ...p, skills: p.skills.map((s) => s.trim()).filter(Boolean), sectors: p.sectors.map((s) => s.trim()).filter(Boolean) });
      setP(res.profile);
      toast({ title: "Profile saved" });
    } catch (e) {
      toast({ title: "Could not save", description: (e as Error).message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <NetworkLayout
      title="Your founder profile"
      subtitle="This powers the startup directory, co-founder matching and suggestions."
      actions={
        <>
          <Button asChild variant="outline"><Link to={`/startups/${p.slug}`}><ExternalLink size={14} className="mr-1.5" /> Preview</Link></Button>
          <Button onClick={save} disabled={saving} className="bg-violet-600 hover:bg-violet-700">
            {saving ? <Loader2 size={14} className="mr-1.5 animate-spin" /> : <Save size={14} className="mr-1.5" />} Save
          </Button>
        </>
      }
    >
      <div className="grid gap-6 lg:grid-cols-2">
        <Card title="Startup">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 overflow-hidden rounded-xl border border-slate-200 bg-violet-50">
              {p.logoUrl && <img src={p.logoUrl} alt="" className="h-full w-full object-cover" />}
            </div>
            <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-md border border-input px-3 py-2 text-sm hover:bg-slate-50">
              {uploading && <Loader2 size={14} className="animate-spin" />} Upload logo
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={async (e) => {
                  const f = e.target.files?.[0];
                  e.target.value = "";
                  if (!f) return;
                  setUploading(true);
                  try {
                    // Founders use the public signed upload endpoint (admin one needs admin auth).
                    const { getPublicCloudinaryUploadSignatureApi } = await import("@/lib/api");
                    const sig = await getPublicCloudinaryUploadSignatureApi({ folder: "founders-connect/startups", resourceType: "image" });
                    const fd = new FormData();
                    fd.append("file", f);
                    fd.append("api_key", sig.apiKey);
                    fd.append("timestamp", String(sig.timestamp));
                    fd.append("signature", sig.signature);
                    fd.append("folder", sig.folder);
                    if (sig.publicId) fd.append("public_id", sig.publicId);
                    const r = await fetch(sig.uploadUrl, { method: "POST", body: fd });
                    const d = (await r.json()) as { secure_url?: string; error?: { message?: string } };
                    if (!d.secure_url) throw new Error(d.error?.message || "Upload failed");
                    set("logoUrl", d.secure_url);
                  } catch (err) {
                    toast({ title: "Upload failed", description: (err as Error).message, variant: "destructive" });
                  } finally {
                    setUploading(false);
                  }
                }}
              />
            </label>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5 sm:col-span-2"><Label>Startup name</Label><Input value={p.startupName} onChange={(e) => set("startupName", e.target.value)} /></div>
            <div className="space-y-1.5 sm:col-span-2"><Label>One-liner</Label><Input maxLength={200} placeholder="We help ___ do ___" value={p.oneLiner} onChange={(e) => set("oneLiner", e.target.value)} /></div>
            <div className="space-y-1.5">
              <Label>Stage</Label>
              <select className={selectClass} value={p.stage} onChange={(e) => set("stage", e.target.value as FounderProfileData["stage"])}>
                <option value="">Select</option>
                {Object.entries(STAGE_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label>Business model</Label>
              <select className={selectClass} value={p.businessModel} onChange={(e) => set("businessModel", e.target.value)}>
                <option value="">Select</option>
                {["b2b", "b2c", "b2b2c", "d2c", "marketplace", "other"].map((m) => <option key={m} value={m}>{m.toUpperCase()}</option>)}
              </select>
            </div>
            <div className="space-y-1.5"><Label>Sectors (comma separated)</Label><Input placeholder="Fintech, SaaS" value={p.sectors.join(", ")} onChange={(e) => set("sectors", csv(e.target.value))} /></div>
            <div className="space-y-1.5"><Label>City</Label><Input value={p.city} onChange={(e) => set("city", e.target.value)} /></div>
            <div className="space-y-1.5"><Label>Team size</Label><Input type="number" min={1} value={p.teamSize} onChange={(e) => set("teamSize", Number(e.target.value))} /></div>
            <div className="space-y-1.5"><Label>Founded (year)</Label><Input type="number" value={p.foundedYear ?? ""} onChange={(e) => set("foundedYear", e.target.value ? Number(e.target.value) : null)} /></div>
            <div className="space-y-1.5">
              <Label>Funding</Label>
              <select className={selectClass} value={p.fundingStatus} onChange={(e) => set("fundingStatus", e.target.value)}>
                <option value="">Select</option>
                <option value="bootstrapped">Bootstrapped</option>
                <option value="angel">Angel funded</option>
                <option value="pre_seed">Pre-seed</option>
                <option value="seed">Seed</option>
                <option value="series_a_plus">Series A+</option>
              </select>
            </div>
            <div className="space-y-1.5"><Label>Website</Label><Input placeholder="https://" value={p.website} onChange={(e) => set("website", e.target.value)} /></div>
          </div>
          <div className="space-y-1.5"><Label>About the startup</Label><Textarea rows={5} value={p.description} onChange={(e) => set("description", e.target.value)} /></div>
          <div className="space-y-2">
            <Label>Looking for</Label>
            <Toggle options={Object.keys(LOOKING_FOR_LABEL) as LookingFor[]} labels={LOOKING_FOR_LABEL} value={p.lookingFor} onChange={(v) => set("lookingFor", v)} />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <Switch checked={p.isListed} onCheckedChange={(v) => set("isListed", v)} /> Show my startup in the public directory
          </label>
        </Card>

        <div className="space-y-6">
          <Card title="You">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5"><Label>Your role</Label><Input placeholder="CEO & Co-founder" value={p.role} onChange={(e) => set("role", e.target.value)} /></div>
              <div className="space-y-1.5"><Label>LinkedIn</Label><Input placeholder="https://linkedin.com/in/…" value={p.linkedinUrl} onChange={(e) => set("linkedinUrl", e.target.value)} /></div>
            </div>
            <div className="space-y-1.5"><Label>Short bio</Label><Textarea rows={4} value={p.bio} onChange={(e) => set("bio", e.target.value)} /></div>
            <div className="space-y-1.5"><Label>Skills (comma separated)</Label><Input placeholder="React, B2B sales, Fundraising" value={p.skills.join(", ")} onChange={(e) => set("skills", csv(e.target.value))} /></div>
            <div className="space-y-1.5">
              <Label>Profile URL</Label>
              <div className="flex items-center gap-1 text-sm text-slate-500">/startups/<Input className="h-8" value={p.slug} onChange={(e) => set("slug", e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"))} /></div>
            </div>
          </Card>

          <Card title="Co-founder search" desc="Turn this on to appear in co-founder discovery and get matched by complementary roles.">
            <label className="flex items-center gap-2 text-sm font-medium">
              <Switch checked={p.cofounder.isLooking} onCheckedChange={(v) => setCo("isLooking", v)} /> I'm looking for a co-founder
            </label>
            {p.cofounder.isLooking && (
              <>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label>I bring</Label>
                    <select className={selectClass} value={p.cofounder.myRole} onChange={(e) => setCo("myRole", e.target.value as CofounderRole)}>
                      <option value="">Select</option>
                      {Object.entries(COFOUNDER_ROLE_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Commitment</Label>
                    <select className={selectClass} value={p.cofounder.commitment} onChange={(e) => setCo("commitment", e.target.value as FounderProfileData["cofounder"]["commitment"])}>
                      <option value="">Select</option>
                      <option value="full_time">Full-time</option>
                      <option value="part_time">Part-time</option>
                      <option value="flexible">Flexible</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Looking for a co-founder in</Label>
                  <Toggle options={Object.keys(COFOUNDER_ROLE_LABEL) as CofounderRole[]} labels={COFOUNDER_ROLE_LABEL} value={p.cofounder.rolesWanted} onChange={(v) => setCo("rolesWanted", v)} />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5"><Label>Equity on offer</Label><Input placeholder="e.g. 15–25%, negotiable" value={p.cofounder.equity} onChange={(e) => setCo("equity", e.target.value)} /></div>
                  <label className="flex items-center gap-2 pt-6 text-sm"><Switch checked={p.cofounder.remoteOk} onCheckedChange={(v) => setCo("remoteOk", v)} /> Open to remote</label>
                </div>
                <div className="space-y-1.5"><Label>Your pitch to a co-founder</Label><Textarea rows={3} placeholder="What you're building, why now, and who you want to build it with" value={p.cofounder.pitch} onChange={(e) => setCo("pitch", e.target.value)} /></div>
              </>
            )}
          </Card>
        </div>
      </div>
    </NetworkLayout>
  );
};

export default EditFounderProfile;
