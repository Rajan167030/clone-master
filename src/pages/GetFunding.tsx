import { useState, type ChangeEvent, type FormEvent } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useSEO } from "@/hooks/useSEO";
import {
  getPublicCloudinaryUploadSignatureApi,
  submitFundingApplicationApi,
  type FundingApplicationPayload,
} from "@/lib/api";

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

export default function GetFunding() {
  useSEO({
    title: "Get Funding | Founders Connect",
    description: "Apply for curated funding access for revenue-generating startups.",
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
      window.alert("Application submitted — we will review and get back to you.");
    } catch (err) {
      window.alert(err instanceof Error ? err.message : "Submission failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto mb-8 max-w-3xl text-center">
            <h1 className="font-heading text-3xl font-extrabold">🚀 Funding Access for Revenue-Generating Startups</h1>
            <p className="mt-4 text-muted-foreground">
              We’re curating a select group of serious startup founders who are already generating revenue and are
              looking to raise funds. This form is strictly for committed founders building scalable businesses.
            </p>

            <ul className="mt-4 mx-auto inline-block text-left text-sm">
              <li>✅ Access to investor network</li>
              <li>✅ Founder’s Connect VIP ecosystem</li>
              <li>✅ Funding & growth opportunities</li>
              <li className="text-sm text-rose-600 mt-2">⚠️ Only revenue-stage startups will be considered.</li>
            </ul>
          </div>

          <Card className="mx-auto max-w-4xl">
            <CardHeader>
              <CardTitle className="text-xl">Apply for Funding Access</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium mb-1">Name *</label>
                  <Input name="name" value={form.name} onChange={handleChange} required />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Mobile Number (WhatsApp Preferred) *</label>
                  <Input name="mobile" value={form.mobile} onChange={handleChange} required />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Email Address *</label>
                  <Input type="email" name="email" value={form.email} onChange={handleChange} required />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Address *</label>
                  <Input name="address" value={form.address} onChange={handleChange} required />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Startup Name *</label>
                  <Input name="startupName" value={form.startupName} onChange={handleChange} required />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Startup Website/App Link</label>
                  <Input name="startupLink" value={form.startupLink} onChange={handleChange} />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1">Startup Sector / Industry</label>
                  <select name="sector" value={form.sector} onChange={handleChange} className="w-full rounded border px-3 py-2">
                    <option value="">Select sector</option>
                    <option>FinTech</option>
                    <option>HealthTech</option>
                    <option>EdTech</option>
                    <option>AgriTech</option>
                    <option>SaaS</option>
                    <option>AI / ML</option>
                    <option>E-commerce</option>
                    <option>Climate / CleanTech</option>
                    <option>D2C / E-commerce</option>
                    <option>Other</option>
                  </select>
                </div>

                {form.sector === "Other" && (
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-1">Other sector</label>
                    <Input name="sectorOther" value={form.sectorOther} onChange={handleChange} />
                  </div>
                )}

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1">What is your current monthly revenue (MRR)? *</label>
                  <select name="mrr" value={form.mrr} onChange={handleChange} required className="w-full rounded border px-3 py-2">
                    <option value="">Select</option>
                    <option>Pre-revenue</option>
                    <option>₹1L – ₹5L</option>
                    <option>₹5L – ₹20L</option>
                    <option>₹20L+</option>
                    <option>Other</option>
                  </select>
                </div>

                {form.mrr === "Other" && (
                  <div>
                    <label className="block text-sm font-medium mb-1">MRR (other)</label>
                    <Input name="mrrOther" value={form.mrrOther} onChange={handleChange} />
                  </div>
                )}

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1">Brief Startup Description *</label>
                  <Textarea name="brief" value={form.brief} onChange={handleChange} required rows={4} />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Pitch deck (upload)</label>
                  <Input type="file" accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,image/*,video/*" onChange={handleFile} />
                  {deckUploadStatus && <p className="mt-2 text-xs text-muted-foreground">{deckUploadStatus}</p>}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1">Problem You Are Solving *</label>
                  <Textarea name="problem" value={form.problem} onChange={handleChange} required rows={3} />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1">Your Solution / Product Overview *</label>
                  <Textarea name="solution" value={form.solution} onChange={handleChange} required rows={3} />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1">Target Customers / Market *</label>
                  <Textarea name="targetCustomers" value={form.targetCustomers} onChange={handleChange} required rows={2} />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Revenue in last 6 months (approx)</label>
                  <Input name="revenue6Months" value={form.revenue6Months} onChange={handleChange} />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Growth rate monthly %</label>
                  <Input name="growthRate" value={form.growthRate} onChange={handleChange} />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Number of paying customers</label>
                  <Input name="payingCustomers" value={form.payingCustomers} onChange={handleChange} />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Have you raised funding before?</label>
                  <select name="raisedBefore" value={form.raisedBefore} onChange={handleChange} className="w-full rounded border px-3 py-2">
                    <option value="">Select</option>
                    <option>No</option>
                    <option>Yes</option>
                    <option>Other</option>
                  </select>
                </div>

                {form.raisedBefore === "Yes" && (
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-1">If yes → How much & from whom?</label>
                    <Input name="raisedDetails" value={form.raisedDetails} onChange={handleChange} />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium mb-1">How much funding are you looking to raise?</label>
                  <select name="raiseAmountRange" value={form.raiseAmountRange} onChange={handleChange} className="w-full rounded border px-3 py-2">
                    <option value="">Select</option>
                    <option>₹0L – ₹10L</option>
                    <option>₹10L – ₹20L</option>
                    <option>₹20L – ₹50L</option>
                    <option>₹50L – ₹1cr</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Current stage</label>
                  <select name="stage" value={form.stage} onChange={handleChange} className="w-full rounded border px-3 py-2">
                    <option value="">Select</option>
                    <option>Bootstrapped</option>
                    <option>Angel Round</option>
                    <option>Pre-Seed</option>
                    <option>Seed</option>
                  </select>
                </div>

                <div className="md:col-span-2 flex flex-col gap-2 mt-2">
                  <label className="inline-flex items-center gap-2">
                    <input type="checkbox" name="agreeAccurate" checked={Boolean(form.agreeAccurate)} onChange={handleChange} />
                    <span className="text-sm">I confirm that all the information provided above is accurate.</span>
                  </label>
                  <label className="inline-flex items-center gap-2">
                    <input type="checkbox" name="agreePromo" checked={Boolean(form.agreePromo)} onChange={handleChange} />
                    <span className="text-sm">I agree to allow the organizers to use my startup details for event-related communication and promotion.</span>
                  </label>
                </div>

                <div className="md:col-span-2 mt-4 flex items-center justify-between">
                  <div />
                  <Button type="submit" disabled={submitting} className="bg-primary text-primary-foreground">
                    {submitting ? "Submitting..." : "Submit Application"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>

      <Footer />
    </div>
  );
}
