import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import { Link, useParams } from "react-router-dom";
import { CheckCircle2, ImageUp, Loader2, ShieldAlert, X } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useSEO } from "@/hooks/useSEO";
import {
  getPublicCloudinaryUploadSignatureApi,
  submitMentorApplicationApi,
  validateMentorInviteApi,
  type MentorApplicationPayload,
} from "@/lib/api";

const SUGGESTED_EXPERTISE = [
  "Fundraising",
  "Go-to-market",
  "B2B Sales",
  "Product Strategy",
  "Tech Architecture",
  "Marketing & Growth",
  "Hiring & Culture",
  "Finance & Unit Economics",
  "Legal & Compliance",
  "D2C & Brand",
  "Operations",
  "Pitching",
];

const MAX_PHOTO_BYTES = 5 * 1024 * 1024;

type InviteState = "checking" | "valid" | "invalid";

const emptyForm: MentorApplicationPayload = {
  fullName: "",
  email: "",
  phone: "",
  designation: "",
  company: "",
  linkedinUrl: "",
  websiteUrl: "",
  photoUrl: "",
  bio: "",
  expertise: [],
  industries: [],
  yearsOfExperience: 0,
  availability: "",
};

const MentorOnboard = () => {
  const { token = "" } = useParams();
  const [inviteState, setInviteState] = useState<InviteState>("checking");
  const [inviteMessage, setInviteMessage] = useState("");
  const [form, setForm] = useState<MentorApplicationPayload>(emptyForm);
  const [industriesText, setIndustriesText] = useState("");
  const [customExpertise, setCustomExpertise] = useState("");
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  useSEO({
    title: "Mentor Onboarding | Founders Connect",
    description: "Set up your mentor profile on the invite-only Founders Connect mentorship network.",
  });

  useEffect(() => {
    validateMentorInviteApi(token)
      .then((res) => {
        setInviteState("valid");
        setForm((prev) => ({ ...prev, fullName: res.label || "", email: res.email || "" }));
      })
      .catch((err) => {
        setInviteState("invalid");
        setInviteMessage(err instanceof Error ? err.message : "This invite link is not valid.");
      });
  }, [token]);

  const set = <K extends keyof MentorApplicationPayload>(key: K, value: MentorApplicationPayload[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const toggleExpertise = (value: string) =>
    setForm((prev) => ({
      ...prev,
      expertise: prev.expertise.includes(value)
        ? prev.expertise.filter((e) => e !== value)
        : prev.expertise.length >= 8
          ? prev.expertise
          : [...prev.expertise, value],
    }));

  const addCustomExpertise = () => {
    const value = customExpertise.trim();
    if (value && !form.expertise.includes(value)) toggleExpertise(value);
    setCustomExpertise("");
  };

  const handlePhoto = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) return setError("Please choose an image file.");
    if (file.size > MAX_PHOTO_BYTES) return setError("Photo must be under 5 MB.");

    setUploading(true);
    setError("");
    try {
      const sig = await getPublicCloudinaryUploadSignatureApi({ folder: "founders-connect/mentors", resourceType: "image" });
      const fd = new FormData();
      fd.append("file", file);
      fd.append("api_key", sig.apiKey);
      fd.append("timestamp", String(sig.timestamp));
      fd.append("signature", sig.signature);
      fd.append("folder", sig.folder);
      if (sig.publicId) fd.append("public_id", sig.publicId);
      const res = await fetch(sig.uploadUrl, { method: "POST", body: fd });
      const data = (await res.json().catch(() => ({}))) as { secure_url?: string; error?: { message?: string } };
      if (!res.ok || !data.secure_url) throw new Error(data.error?.message || "Upload failed.");
      set("photoUrl", data.secure_url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Photo upload failed. You can paste a photo URL instead.");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (form.expertise.length === 0) return setError("Pick at least one area of expertise.");
    if (form.bio.trim().length < 60) return setError("Please write a short bio (at least 60 characters).");

    setSubmitting(true);
    setError("");
    try {
      await submitMentorApplicationApi(token, {
        ...form,
        industries: industriesText.split(",").map((s) => s.trim()).filter(Boolean),
        yearsOfExperience: Number(form.yearsOfExperience) || 0,
      });
      setSubmitted(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not submit your application.");
    } finally {
      setSubmitting(false);
    }
  };

  const renderBody = () => {
    if (inviteState === "checking") {
      return (
        <div className="flex justify-center py-24">
          <Loader2 className="h-8 w-8 animate-spin text-violet-600" />
        </div>
      );
    }

    if (inviteState === "invalid") {
      return (
        <div className="mx-auto max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <ShieldAlert className="mx-auto mb-4 h-10 w-10 text-amber-500" />
          <h1 className="font-heading text-xl font-bold text-slate-900">Invite link unavailable</h1>
          <p className="mt-2 text-sm text-slate-600">{inviteMessage}</p>
          <p className="mt-4 text-sm text-slate-500">
            Our mentor network is invite-only. If you'd like to mentor founders, reach out and we'll get back to you.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Button asChild className="bg-violet-600 hover:bg-violet-700">
              <Link to="/contact-us">Request an invite</Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/mentors">View mentors</Link>
            </Button>
          </div>
        </div>
      );
    }

    if (submitted) {
      return (
        <div className="mx-auto max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-violet-100 text-violet-700">
            <CheckCircle2 size={26} />
          </div>
          <h1 className="font-heading text-xl font-bold text-slate-900">Application submitted</h1>
          <p className="mt-2 text-sm text-slate-600">
            Thanks, {form.fullName.split(" ")[0]}! Our team will review your profile and email you at{" "}
            <strong>{form.email}</strong> once it's live.
          </p>
          <Button asChild className="mt-6 bg-violet-600 hover:bg-violet-700">
            <Link to="/mentors">Explore the mentor network</Link>
          </Button>
        </div>
      );
    }

    return (
      <form onSubmit={handleSubmit} className="mx-auto max-w-2xl space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-violet-600">Invite-only</p>
          <h1 className="mt-1 font-heading text-2xl font-bold text-slate-900">Create your mentor profile</h1>
          <p className="mt-1 text-sm text-slate-500">
            This is what founders will see. Our team reviews every profile before it goes live.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-violet-50">
            {form.photoUrl ? (
              <img src={form.photoUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-xl font-bold text-violet-600">
                {(form.fullName || "?").slice(0, 2).toUpperCase()}
              </div>
            )}
          </div>
          <div className="flex-1 space-y-2">
            <Label htmlFor="mo-photo" className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-slate-200 px-3 py-2 text-sm font-medium hover:bg-slate-50">
              {uploading ? <Loader2 size={15} className="animate-spin" /> : <ImageUp size={15} />}
              {form.photoUrl ? "Change photo" : "Upload photo"}
            </Label>
            <input id="mo-photo" type="file" accept="image/*" className="hidden" onChange={handlePhoto} disabled={uploading} />
            <Input placeholder="…or paste a photo URL" value={form.photoUrl} onChange={(e) => set("photoUrl", e.target.value)} />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="mo-name">Full name *</Label>
            <Input id="mo-name" required value={form.fullName} onChange={(e) => set("fullName", e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="mo-email">Email *</Label>
            <Input id="mo-email" type="email" required value={form.email} onChange={(e) => set("email", e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="mo-designation">Designation *</Label>
            <Input id="mo-designation" required placeholder="e.g. Founder & CEO" value={form.designation} onChange={(e) => set("designation", e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="mo-company">Company</Label>
            <Input id="mo-company" value={form.company} onChange={(e) => set("company", e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="mo-linkedin">LinkedIn URL</Label>
            <Input id="mo-linkedin" type="url" placeholder="https://linkedin.com/in/…" value={form.linkedinUrl} onChange={(e) => set("linkedinUrl", e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="mo-phone">Phone</Label>
            <Input id="mo-phone" value={form.phone} onChange={(e) => set("phone", e.target.value)} />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="mo-bio">Short bio *</Label>
          <Textarea
            id="mo-bio"
            required
            rows={5}
            placeholder="What have you built or operated, and how can you help founders?"
            value={form.bio}
            onChange={(e) => set("bio", e.target.value)}
          />
          <p className="text-xs text-slate-400">{form.bio.length}/2000</p>
        </div>

        <div className="space-y-2">
          <Label>Areas of expertise * <span className="font-normal text-slate-400">(up to 8)</span></Label>
          <div className="flex flex-wrap gap-2">
            {[...new Set([...SUGGESTED_EXPERTISE, ...form.expertise])].map((e) => {
              const active = form.expertise.includes(e);
              return (
                <button
                  key={e}
                  type="button"
                  onClick={() => toggleExpertise(e)}
                  className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-semibold transition-colors ${
                    active
                      ? "border-violet-600 bg-violet-600 text-white"
                      : "border-slate-200 bg-white text-slate-600 hover:border-violet-300"
                  }`}
                >
                  {e}
                  {active && <X size={12} />}
                </button>
              );
            })}
          </div>
          <div className="flex gap-2">
            <Input
              placeholder="Add another…"
              value={customExpertise}
              onChange={(e) => setCustomExpertise(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addCustomExpertise();
                }
              }}
            />
            <Button type="button" variant="outline" onClick={addCustomExpertise}>Add</Button>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="mo-industries">Industries</Label>
            <Input id="mo-industries" placeholder="SaaS, Fintech, D2C" value={industriesText} onChange={(e) => setIndustriesText(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="mo-years">Years of experience</Label>
            <Input
              id="mo-years"
              type="number"
              min={0}
              max={60}
              value={form.yearsOfExperience || ""}
              onChange={(e) => set("yearsOfExperience", Number(e.target.value))}
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="mo-availability">Availability</Label>
          <Input
            id="mo-availability"
            placeholder="e.g. 2 hours a month, weekday evenings"
            value={form.availability}
            onChange={(e) => set("availability", e.target.value)}
          />
        </div>

        {error && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

        <Button type="submit" disabled={submitting || uploading} className="w-full bg-violet-600 hover:bg-violet-700">
          {submitting && <Loader2 size={16} className="mr-2 animate-spin" />}
          Submit for review
        </Button>
      </form>
    );
  };

  return (
    <div className="min-h-screen bg-[#FAF7F0]">
      <Navbar />
      <main className="container mx-auto px-4 py-10 md:py-14">{renderBody()}</main>
      <Footer />
    </div>
  );
};

export default MentorOnboard;
