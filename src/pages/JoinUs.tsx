import { useId, useState, type ChangeEvent, type FormEvent } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Zap, Target, TrendingUp, Copy, CheckCircle, MessageCircle, ArrowRight, ShieldCheck, Clock3 } from "lucide-react";
import EmailVerificationBox from "@/components/EmailVerificationBox";
import { Button } from "@/components/ui/button";
import { submitJoinRequestApi } from "@/lib/api";
import { useSEO } from "@/hooks/useSEO";

const WHATSAPP_GROUP_URL = "https://chat.whatsapp.com/Hm4ZKUpvxsy9u2L7SqcfV3";

const initialFormData = {
  name: "",
  email: "",
  phone: "",
  occupation: "",
  collegeName: "",
  companyName: "",
  linkedinProfile: "",
  website: "",
  city: "",
  whyJoin: "",
  referralSource: "",
};

const occupationOptions = [
  { value: "", label: "Select your occupation" },
  { value: "Student", label: "Student" },
  { value: "Founder", label: "Founder" },
  { value: "Investor", label: "Investor" },
  { value: "Designer", label: "Designer" },
  { value: "Developer", label: "Developer" },
  { value: "Marketer", label: "Marketer" },
  { value: "Product Manager", label: "Product Manager" },
  { value: "Other", label: "Other" },
];

const benefits = [
  {
    icon: Users,
    title: "Network with Top Founders",
    description: "Connect with India's most ambitious founders, investors, and builders. Build relationships that drive growth.",
  },
  {
    icon: Zap,
    title: "Access Exclusive Events",
    description: "Attend curated founder meetups, investor networking nights, and exclusive sessions tailored for growth.",
  },
  {
    icon: Target,
    title: "Find Opportunities",
    description: "Discover partnerships, fundraising connections, talent, and strategic growth opportunities.",
  },
  {
    icon: TrendingUp,
    title: "Accelerate Your Growth",
    description: "Learn from experienced founders, get mentorship, and accelerate your startup's journey to success.",
  },
];

const joiningFlow = [
  {
    icon: ShieldCheck,
    title: "Verified Profiles",
    description: "Email verification keeps the network authentic and trusted.",
  },
  {
    icon: Clock3,
    title: "Fast Review",
    description: "Your form is reviewed by the team before onboarding.",
  },
  {
    icon: MessageCircle,
    title: "Community Access",
    description: "Approved members get connected to active founder circles.",
  },
];

const Grid = ({ pattern, size }: { pattern?: number[][]; size?: number }) => {
  const p =
    pattern ??
    [
      [Math.floor(Math.random() * 4) + 7, Math.floor(Math.random() * 6) + 1],
      [Math.floor(Math.random() * 4) + 7, Math.floor(Math.random() * 6) + 1],
      [Math.floor(Math.random() * 4) + 7, Math.floor(Math.random() * 6) + 1],
      [Math.floor(Math.random() * 4) + 7, Math.floor(Math.random() * 6) + 1],
      [Math.floor(Math.random() * 4) + 7, Math.floor(Math.random() * 6) + 1],
    ];

  return (
    <div className="pointer-events-none absolute left-1/2 top-0 -ml-20 -mt-2 h-full w-full [mask-image:linear-gradient(white,transparent)]">
      <div className="absolute inset-0 bg-gradient-to-r [mask-image:radial-gradient(farthest-side_at_top,white,transparent)] from-zinc-100/30 to-zinc-300/30 opacity-100 dark:from-zinc-900/30 dark:to-zinc-900/30">
        <GridPattern
          width={size ?? 20}
          height={size ?? 20}
          x="-12"
          y="4"
          squares={p}
          className="absolute inset-0 h-full w-full fill-black/10 stroke-black/10 mix-blend-overlay dark:fill-white/10 dark:stroke-white/10"
        />
      </div>
    </div>
  );
};

function GridPattern({ width, height, x, y, squares, ...props }: any) {
  const patternId = useId();

  return (
    <svg aria-hidden="true" {...props}>
      <defs>
        <pattern id={patternId} width={width} height={height} patternUnits="userSpaceOnUse" x={x} y={y}>
          <path d={`M.5 ${height}V.5H${width}`} fill="none" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" strokeWidth={0} fill={`url(#${patternId})`} />
      {squares && (
        <svg x={x} y={y} className="overflow-visible">
          {squares.map(([gridX, gridY]: any) => (
            <rect
              strokeWidth="0"
              key={`${gridX}-${gridY}`}
              width={width + 1}
              height={height + 1}
              x={gridX * width}
              y={gridY * height}
            />
          ))}
        </svg>
      )}
    </svg>
  );
}

const JoinUs = () => {
  // SEO Hook
  useSEO({
    title: "Join Founders Connect Community",
    description: "Join India's most valuable founder and investor network. Connect with top founders, get mentorship, and accelerate your startup journey.",
    keywords: "join founders connect, founder community, startup network India",
    ogType: "website",
    canonicalUrl: "https://founders.connect/join-us",
  });
  const [formData, setFormData] = useState(initialFormData);
  const [submitting, setSubmitting] = useState(false);
  const [copyMessage, setCopyMessage] = useState("");
  const [emailVerificationToken, setEmailVerificationToken] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    if (e.target.name === "email") {
      setEmailVerificationToken("");
    }

    // If switching from Student to another occupation, clear collegeName
    if (e.target.name === "occupation" && e.target.value !== "Student") {
      setFormData((prev) => ({
        ...prev,
        occupation: e.target.value,
        collegeName: "",
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [e.target.name]: e.target.value,
      }));
    }
  };

  const handleCopyLink = async () => {
    const shareUrl = `${window.location.origin}/join-us`;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopyMessage("Form link copied");
    } catch {
      setCopyMessage("Copy failed");
    }

    window.setTimeout(() => setCopyMessage(""), 2500);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!emailVerificationToken) {
      window.alert("Please verify your email before submitting.");
      return;
    }

    setSubmitting(true);

    try {
      const data = await submitJoinRequestApi({ ...formData, emailVerificationToken });

      if (data?.ok) {
        setFormData(initialFormData);
        setEmailVerificationToken("");
        setSubmitSuccess(true);
        window.alert("Join request submitted successfully.");
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to submit join request.";
      window.alert(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <section className="relative overflow-hidden pt-24 pb-20">
        <div className="pointer-events-none absolute -left-20 top-12 h-64 w-64 rounded-full bg-blob" />
        <div className="pointer-events-none absolute right-0 top-32 h-80 w-80 rounded-full bg-blob" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-[radial-gradient(circle_at_top,rgba(124,58,237,0.14),transparent_60%)]" />

        <div className="container mx-auto px-4">
          <div className="mx-auto mb-10 max-w-5xl rounded-3xl border border-border/70 bg-white/80 p-6 shadow-xl backdrop-blur-sm md:p-10">
            <p className="mb-3 text-center text-xs font-semibold uppercase tracking-[0.28em] text-primary md:text-sm">Join Our Community</p>
            <h1 className="text-center font-heading text-4xl font-extrabold leading-tight md:text-6xl">
              Build With India&apos;s Most Ambitious Founder Network
            </h1>
            <p className="mx-auto mt-5 max-w-3xl text-center text-base text-muted-foreground md:text-lg">
              From first-time builders to experienced operators, Founders Connect is where serious people meet,
              collaborate, and launch faster.
            </p>

            <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
              <Button type="button" variant="outline" onClick={handleCopyLink} className="gap-2">
                <Copy size={16} />
                Copy Join Link
              </Button>
              <Button
                type="button"
                onClick={() => window.open(WHATSAPP_GROUP_URL, "_blank", "noopener,noreferrer")}
                className="gap-2 bg-green-600 text-white hover:bg-green-700"
              >
                <MessageCircle size={16} />
                WhatsApp Community
              </Button>
            </div>

            <div className="mx-auto mt-7 grid max-w-3xl gap-3 sm:grid-cols-3">
              <div className="rounded-xl border border-border/70 bg-slate-50 p-3 text-center">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Members</p>
                <p className="mt-1 text-2xl font-extrabold text-slate-900">1000+</p>
              </div>
              <div className="rounded-xl border border-border/70 bg-slate-50 p-3 text-center">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Cities</p>
                <p className="mt-1 text-2xl font-extrabold text-slate-900">50+</p>
              </div>
              <div className="rounded-xl border border-border/70 bg-slate-50 p-3 text-center">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Focused On</p>
                <p className="mt-1 text-sm font-bold text-slate-900">Founder Growth</p>
              </div>
            </div>
          </div>

          {copyMessage && <p className="mt-3 text-center text-sm text-muted-foreground">{copyMessage}</p>}

          <div className="mx-auto my-14 grid max-w-7xl grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            {benefits.map(({ icon: Icon, title, description }) => (
              <Card key={title} className="group relative w-full overflow-hidden rounded-2xl border border-border/60 bg-gradient-to-b from-neutral-100 to-white px-5 py-5 shadow-lg transition-all duration-300 hover:-translate-y-2 hover:scale-[1.02] hover:border-primary/40 hover:shadow-2xl dark:from-neutral-900 dark:to-neutral-950">
                <Grid size={14} />
                <CardHeader className="relative z-10 flex-row items-start gap-4 p-0 pt-4">
                  <div className="mt-1 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-primary text-primary-foreground shadow-md transition-transform duration-300 group-hover:scale-110">
                    <Icon size={20} />
                  </div>
                  <div className="space-y-1">
                    <CardTitle className="text-base leading-snug transition-colors duration-300 group-hover:text-primary">{title}</CardTitle>
                    <CardContent className="relative z-10 p-0 text-sm leading-relaxed text-muted-foreground transition-colors duration-300 group-hover:text-foreground/80">
                      {description}
                    </CardContent>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>

          <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[1.1fr_0.75fr]">
            <Card className="border-2 border-dashed border-muted-foreground/30 bg-white shadow-xl">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl md:text-3xl">Detailed Join Form</CardTitle>
                <p className="mt-2 text-muted-foreground">Strong profiles get faster review. Fill accurate details for better matching.</p>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
                  <div className="md:col-span-2 rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 text-sm text-slate-700">
                    <p className="font-semibold text-slate-900">Before you submit</p>
                    <p className="mt-1">
                      Verify your email and make sure LinkedIn plus website URLs are correct. This helps us shortlist quickly.
                    </p>
                  </div>

                  <div className="md:col-span-2 pt-1">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Personal Details</p>
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-foreground">Full Name *</label>
                    <input required name="name" value={formData.name} onChange={handleChange} placeholder="Your full name" className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20" />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-foreground">Email *</label>
                    <input required type="email" name="email" value={formData.email} onChange={handleChange} placeholder="your@email.com" className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20" />
                    <div className="mt-2">
                      <EmailVerificationBox
                        email={formData.email}
                        purpose="join-us"
                        token={emailVerificationToken}
                        onVerified={setEmailVerificationToken}
                        onReset={() => setEmailVerificationToken("")}
                      />
                    </div>
                    <p className="mt-2 text-xs text-slate-500">
                      {emailVerificationToken ? "Email verified. You can submit now." : "Verify your email to unlock final submission."}
                    </p>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-foreground">Phone Number *</label>
                    <input required type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="+91 XXXXX XXXXX" className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20" />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-foreground">Occupation *</label>
                    <select required name="occupation" value={formData.occupation} onChange={handleChange} className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20">
                      {occupationOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {formData.occupation === "Student" && (
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-foreground">College / University Name *</label>
                      <input required name="collegeName" value={formData.collegeName} onChange={handleChange} placeholder="Your college or university name" className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20" />
                    </div>
                  )}

                  <div className="md:col-span-2 pt-1">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Professional Details</p>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-foreground">Company / Startup Name *</label>
                    <input required name="companyName" value={formData.companyName} onChange={handleChange} placeholder="Your company or startup name" className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20" />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-foreground">City / Location *</label>
                    <input required name="city" value={formData.city} onChange={handleChange} placeholder="City, State" className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20" />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-foreground">LinkedIn Profile *</label>
                    <input required type="url" name="linkedinProfile" value={formData.linkedinProfile} onChange={handleChange} placeholder="https://linkedin.com/in/yourprofile" className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20" />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-foreground">Website / Portfolio *</label>
                    <input required type="url" name="website" value={formData.website} onChange={handleChange} placeholder="https://yourwebsite.com" className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20" />
                  </div>

                  <div className="md:col-span-2 pt-1">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Intent & Discovery</p>
                  </div>

                  <div className="md:col-span-2">
                    <label className="mb-2 block text-sm font-semibold text-foreground">Why do you want to join? *</label>
                    <textarea required name="whyJoin" value={formData.whyJoin} onChange={handleChange} placeholder="Tell us what you hope to get from Founders Connect" rows={4} className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20" />
                  </div>

                  <div className="md:col-span-2">
                    <label className="mb-2 block text-sm font-semibold text-foreground">How did you hear about us? *</label>
                    <input required name="referralSource" value={formData.referralSource} onChange={handleChange} placeholder="Instagram, friend, event, LinkedIn, etc." className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20" />
                  </div>

                  <div className="md:col-span-2 mt-2 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <button type="submit" disabled={submitting} className="inline-flex items-center justify-center gap-2 rounded-md border border-border bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-all hover:brightness-95 disabled:opacity-60">
                      {submitting ? "Submitting..." : "Submit Join Request"}
                      <ArrowRight size={16} />
                    </button>

                  </div>
                </form>
              </CardContent>
            </Card>

            <div className="space-y-6">
              <Card className="border border-border/70 bg-white shadow-lg">
                <CardHeader>
                  <CardTitle className="text-xl">What Happens Next</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {joiningFlow.map(({ icon: Icon, title, description }) => (
                    <div key={title} className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
                      <div className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <Icon size={18} />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{title}</p>
                        <p className="mt-1 text-xs leading-relaxed text-slate-600">{description}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="border border-green-200 bg-gradient-to-br from-green-50 to-emerald-50 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-xl text-green-800">Already Ready?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm leading-relaxed text-green-800/90">
                    Join the live WhatsApp community to stay updated on events, founder intros, and collaboration calls.
                  </p>
                  <Button
                    type="button"
                    onClick={() => window.open(WHATSAPP_GROUP_URL, "_blank", "noopener,noreferrer")}
                    className="mt-4 w-full gap-2 bg-green-600 text-white hover:bg-green-700"
                  >
                    <MessageCircle size={18} />
                    Open Community Group
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>

          {submitSuccess && (
            <div className="mx-auto mt-8 max-w-5xl">
              <Card className="border-2 border-green-500 bg-gradient-to-br from-green-50 to-blue-50 shadow-xl">
                <CardHeader className="text-center">
                  <div className="mb-4 flex justify-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                      <CheckCircle size={32} className="text-green-600" />
                    </div>
                  </div>
                  <CardTitle className="text-2xl text-green-700 md:text-3xl">Thank You! Welcome to Founders Connect</CardTitle>
                  <p className="mt-3 text-base text-muted-foreground">
                    Your join request has been submitted successfully. Join our WhatsApp community now.
                  </p>
                </CardHeader>
                <CardContent className="text-center">
                  <Button onClick={() => window.open(WHATSAPP_GROUP_URL, "_blank", "noopener,noreferrer")} className="gap-2 bg-green-600 px-6 py-3 text-base text-white hover:bg-green-700">
                    <MessageCircle size={20} />
                    Join WhatsApp Group
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}

          <div className="mt-16 text-center">
            <h2 className="mb-4 text-2xl font-bold text-foreground">Ready to Join?</h2>
            <p className="mx-auto mb-8 max-w-2xl text-muted-foreground">
              Fill out the detailed form above. Once submitted, your request is stored in database and reviewed by our team.
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default JoinUs;
