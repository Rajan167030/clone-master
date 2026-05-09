import { useState, type ChangeEvent, type FormEvent } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useSEO } from "@/hooks/useSEO";
import {
  getPublicCloudinaryUploadSignatureApi,
  submitFundingApplicationApi,
  type FundingApplicationPayload,
} from "@/lib/api";
import { 
  CheckCircle2, 
  ArrowLeft,
  ShieldCheck,
  Zap,
  Users
} from "lucide-react";
import { Link } from "react-router-dom";

const initialState = {
  name: "",
  mobile: "",
  email: "",
  address: "",
  startupName: "",
  startupLink: "",
  sector: "",
  sectorOther: "",
  mrr: "",
  mrrOther: "",
  brief: "",
  problem: "",
  solution: "",
  targetCustomers: "",
  revenue6Months: "",
  growthRate: "",
  payingCustomers: "",
  raisedBefore: "",
  raisedDetails: "",
  raiseAmountRange: "",
  stage: "",
  agreeAccurate: false,
  agreePromo: false,
  file: null as File | null,
};

export default function FundingApplication() {
  useSEO({
    title: "Funding Application | Founders Connect",
    description: "Submit your startup details for curated funding access to our exclusive VC network.",
  });

  const [form, setForm] = useState(initialState);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [deckUploadStatus, setDeckUploadStatus] = useState("");

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    if (type === "checkbox") {
      setForm((s) => ({ ...s, [name]: (e.target as HTMLInputElement).checked }));
      return;
    }
    setForm((s) => ({ ...s, [name]: value }));
  };

  const handleFile = (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files && e.target.files[0];
    setForm((s) => ({ ...s, file: f || null }));
    setDeckUploadStatus(f ? `Selected: ${f.name}` : "");
  };

  const validate = () => {
    const required = [
      "name",
      "mobile",
      "email",
      "address",
      "startupName",
      "brief",
      "problem",
      "solution",
      "targetCustomers",
    ];
    for (const k of required) {
      // @ts-ignore
      if (!String(form[k] || "").trim()) return `${k} is required`;
    }
    if (!form.agreeAccurate) return "Please confirm the information is accurate.";
    return null;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const err = validate();
    if (err) {
      window.alert(err);
      return;
    }
    setSubmitting(true);
    try {
      let pitchDeckUrl = "";
      let pitchDeckName = "";

      if (form.file) {
        const signature = await getPublicCloudinaryUploadSignatureApi({
          folder: "founders-connect/funding-decks",
          resourceType: "auto",
        });

        const uploadFormData = new FormData();
        uploadFormData.append("file", form.file);
        uploadFormData.append("api_key", signature.apiKey);
        uploadFormData.append("timestamp", String(signature.timestamp));
        uploadFormData.append("signature", signature.signature);
        uploadFormData.append("folder", signature.folder);
        uploadFormData.append("resource_type", "auto");
        if (signature.publicId) {
          uploadFormData.append("public_id", signature.publicId);
        }

        const uploadResponse = await fetch(signature.uploadUrl, {
          method: "POST",
          body: uploadFormData,
        });

        const uploadData = (await uploadResponse.json().catch(() => ({}))) as { secure_url?: string; error?: { message?: string } };
        if (!uploadResponse.ok || !uploadData.secure_url) {
          throw new Error(uploadData.error?.message || "Pitch deck upload failed.");
        }

        pitchDeckUrl = uploadData.secure_url;
        pitchDeckName = form.file.name;
      }

      const payload: FundingApplicationPayload = {
        name: form.name.trim(),
        mobile: form.mobile.trim(),
        email: form.email.trim(),
        address: form.address.trim(),
        startupName: form.startupName.trim(),
        startupLink: form.startupLink.trim(),
        sector: form.sector.trim(),
        sectorOther: form.sectorOther.trim(),
        mrr: form.mrr.trim(),
        mrrOther: form.mrrOther.trim(),
        brief: form.brief.trim(),
        pitchDeckUrl,
        pitchDeckName,
        problem: form.problem.trim(),
        solution: form.solution.trim(),
        targetCustomers: form.targetCustomers.trim(),
        revenue6Months: form.revenue6Months.trim(),
        growthRate: form.growthRate.trim(),
        payingCustomers: form.payingCustomers.trim(),
        raisedBefore: form.raisedBefore.trim(),
        raisedDetails: form.raisedDetails.trim(),
        raiseAmountRange: form.raiseAmountRange.trim(),
        stage: form.stage.trim(),
        agreeAccurate: form.agreeAccurate,
        agreePromo: form.agreePromo,
      };

      await submitFundingApplicationApi(payload);
      setSuccess(true);
      setForm(initialState);
      setDeckUploadStatus("");
      window.alert("Application submitted successfully!");
    } catch (err) {
      window.alert(err instanceof Error ? err.message : "Submission failed");
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
          <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-primary">
            <CheckCircle2 size={48} />
          </div>
          <h1 className="font-heading text-4xl font-bold">Application Received!</h1>
          <p className="mt-4 max-w-md text-lg text-muted-foreground">
            Thank you for applying. Our investment team will review your details and reach out via email or WhatsApp within 5-7 business days.
          </p>
          <Button asChild className="mt-8" size="lg">
            <Link to="/">Back to Home</Link>
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50">
      <Navbar />

      <section className="pt-32 pb-24">
        <div className="container mx-auto px-4">
          <Link to="/get-funding" className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline">
            <ArrowLeft size={16} /> Back to Get Funding
          </Link>
          
          <div className="grid gap-12 lg:grid-cols-[1fr_1.8fr]">
            <div className="space-y-8">
              <div className="rounded-3xl bg-white p-8 shadow-sm border border-slate-100">
                <h1 className="font-heading text-3xl font-bold">Apply for Funding</h1>
                <p className="mt-4 text-muted-foreground leading-relaxed">
                  Join 100+ startups who have leveraged our network to scale. Please provide precise details about your traction and business model.
                </p>
                <div className="mt-8 space-y-6">
                  {[
                    { icon: ShieldCheck, title: "Secure & Confidential", desc: "Your data is only shared with verified institutional investors." },
                    { icon: Zap, title: "Fast Feedback", desc: "Average response time is 48-72 hours for high-intent startups." },
                    { icon: Users, title: "VC Access", desc: "Direct route to top Tier-1 and Tier-2 VCs in India." }
                  ].map((item, i) => (
                    <div key={i} className="flex gap-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <item.icon size={20} />
                      </div>
                      <div>
                        <h4 className="font-bold">{item.title}</h4>
                        <p className="text-sm text-slate-500">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="relative overflow-hidden rounded-3xl group">
                <img 
                  src="/investor_handshake_1778315491253.png" 
                  alt="Partnership" 
                  className="h-64 w-full object-cover transition duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/20 to-transparent" />
              </div>
            </div>

            <Card className="border-none shadow-2xl shadow-slate-200/50 lg:px-6">
              <CardHeader className="pb-8">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="outline" className="text-primary border-primary/20 bg-primary/5">Application Form</Badge>
                </div>
                <CardTitle className="text-3xl font-bold">Tell us about your startup</CardTitle>
                <CardDescription className="text-base">Provide as much detail as possible to help us understand your vision.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold">Founder Name *</label>
                    <Input name="name" placeholder="John Doe" value={form.name} onChange={handleChange} required className="h-11" />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold">WhatsApp Number *</label>
                    <Input name="mobile" placeholder="+91 XXXX XXXX" value={form.mobile} onChange={handleChange} required className="h-11" />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold">Email Address *</label>
                    <Input type="email" placeholder="john@startup.com" name="email" value={form.email} onChange={handleChange} required className="h-11" />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold">Base City *</label>
                    <Input name="address" placeholder="Mumbai, India" value={form.address} onChange={handleChange} required className="h-11" />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold">Startup Name *</label>
                    <Input name="startupName" placeholder="TechVision AI" value={form.startupName} onChange={handleChange} required className="h-11" />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold">Product Link</label>
                    <Input name="startupLink" placeholder="https://..." value={form.startupLink} onChange={handleChange} className="h-11" />
                  </div>

                  <div className="md:col-span-2 space-y-2">
                    <label className="text-sm font-semibold">Startup Sector / Industry</label>
                    <select name="sector" value={form.sector} onChange={handleChange} className="w-full rounded-md border border-input bg-background h-11 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary">
                      <option value="">Select sector</option>
                      <option>FinTech</option>
                      <option>HealthTech</option>
                      <option>EdTech</option>
                      <option>AgriTech</option>
                      <option>SaaS</option>
                      <option>AI / ML</option>
                      <option>E-commerce</option>
                      <option>Climate / CleanTech</option>
                      <option>D2C</option>
                      <option>Other</option>
                    </select>
                  </div>

                  {form.sector === "Other" && (
                    <div className="md:col-span-2 space-y-2 animate-in fade-in slide-in-from-top-1">
                      <label className="text-sm font-semibold">Specify Sector</label>
                      <Input name="sectorOther" value={form.sectorOther} onChange={handleChange} className="h-11" />
                    </div>
                  )}

                  <div className="md:col-span-2 space-y-2">
                    <label className="text-sm font-semibold">Monthly Recurring Revenue (MRR) *</label>
                    <select name="mrr" value={form.mrr} onChange={handleChange} required className="w-full rounded-md border border-input bg-background h-11 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary">
                      <option value="">Select Range</option>
                      <option>Pre-revenue</option>
                      <option>₹1L – ₹5L</option>
                      <option>₹5L – ₹20L</option>
                      <option>₹20L+</option>
                      <option>Other</option>
                    </select>
                  </div>

                  {form.mrr === "Other" && (
                    <div className="md:col-span-2 space-y-2 animate-in fade-in slide-in-from-top-1">
                      <label className="text-sm font-semibold">Please specify MRR</label>
                      <Input name="mrrOther" value={form.mrrOther} onChange={handleChange} className="h-11" />
                    </div>
                  )}

                  <div className="md:col-span-2 space-y-2">
                    <label className="text-sm font-semibold">Startup Description *</label>
                    <Textarea 
                      name="brief" 
                      placeholder="What exactly does your startup do in one sentence?"
                      value={form.brief} 
                      onChange={handleChange} 
                      required 
                      rows={3} 
                    />
                  </div>

                  <div className="md:col-span-2 space-y-2">
                    <label className="text-sm font-semibold">Pitch Deck (PDF Preferred)</label>
                    <div className="flex items-center gap-4 rounded-xl border-2 border-dashed p-6 hover:border-primary/50 transition-colors bg-slate-50/50">
                      <Input 
                        type="file" 
                        accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,image/*" 
                        onChange={handleFile}
                        className="cursor-pointer border-none bg-transparent shadow-none"
                      />
                    </div>
                    {deckUploadStatus && <p className="mt-2 text-xs font-medium text-primary flex items-center gap-1"><CheckCircle2 size={12}/> {deckUploadStatus}</p>}
                  </div>

                  <div className="md:col-span-2 space-y-2 pt-4">
                    <h3 className="font-bold text-lg border-b pb-2">Business & Product</h3>
                    <div className="grid gap-6 mt-4">
                      <div className="space-y-2">
                        <label className="text-sm font-semibold">Problem You're Solving *</label>
                        <Textarea name="problem" value={form.problem} onChange={handleChange} required rows={3} placeholder="Describe the core pain point..." />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-semibold">Proposed Solution *</label>
                        <Textarea name="solution" value={form.solution} onChange={handleChange} required rows={3} placeholder="How does your product solve this?" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-semibold">Target Market *</label>
                        <Textarea name="targetCustomers" value={form.targetCustomers} onChange={handleChange} required rows={2} placeholder="Who are your primary customers?" />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold">Approx. Revenue (Last 6 Months)</label>
                    <Input name="revenue6Months" placeholder="e.g. ₹50L" value={form.revenue6Months} onChange={handleChange} className="h-11" />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold">Avg. Monthly Growth %</label>
                    <Input name="growthRate" placeholder="e.g. 15%" value={form.growthRate} onChange={handleChange} className="h-11" />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold">Paying Customers</label>
                    <Input name="payingCustomers" placeholder="e.g. 500+" value={form.payingCustomers} onChange={handleChange} className="h-11" />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold">Current Fundraise Target</label>
                    <select name="raiseAmountRange" value={form.raiseAmountRange} onChange={handleChange} className="w-full rounded-md border border-input bg-background h-11 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary">
                      <option value="">Select Range</option>
                      <option>₹0L – ₹10L</option>
                      <option>₹10L – ₹20L</option>
                      <option>₹20L – ₹50L</option>
                      <option>₹50L – ₹1cr</option>
                      <option>₹1cr+</option>
                    </select>
                  </div>

                  <div className="md:col-span-2 flex flex-col gap-4 mt-4 border-t pt-8">
                    <label className="flex items-start gap-3 cursor-pointer group">
                      <input 
                        type="checkbox" 
                        name="agreeAccurate" 
                        checked={Boolean(form.agreeAccurate)} 
                        onChange={handleChange} 
                        className="mt-1 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary transition-colors"
                      />
                      <span className="text-sm text-slate-600 leading-tight">I confirm that all provided information is accurate and verified to the best of my knowledge.</span>
                    </label>
                  </div>

                  <div className="md:col-span-2 mt-8">
                    <Button 
                      type="submit" 
                      disabled={submitting} 
                      className="w-full h-14 text-lg font-bold bg-primary hover:bg-primary/90 transition-all shadow-xl shadow-primary/25 rounded-2xl"
                    >
                      {submitting ? "Processing Application..." : "Submit Funding Application"}
                    </Button>
                    <p className="text-center text-xs text-slate-400 mt-6 italic">
                      Founders Connect ensures your data privacy. By submitting, you agree to our Terms of Service.
                    </p>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
