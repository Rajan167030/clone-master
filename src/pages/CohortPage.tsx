import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  Calendar,
  CheckCircle2,
  Clock,
  ExternalLink,
  Handshake,
  Hourglass,
  MapPin,
  MessagesSquare,
  Presentation,
  Rocket,
  Search,
  Sparkles,
  Users,
  Wallet,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BackButton from "@/components/BackButton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useSEO } from "@/hooks/useSEO";
import { cn } from "@/lib/utils";
import {
  getPublicCohortsApi,
  submitCohortApplicationApi,
  type Cohort,
  type CohortApplicationInput,
} from "@/lib/api";

const CATEGORY_TABS = [
  { key: "all", label: "All Programs" },
  { key: "startup", label: "Startup" },
  { key: "d2c", label: "D2C" },
  { key: "general", label: "Fellowships" },
  { key: "upcoming", label: "Upcoming" },
];

const CATEGORY_LABEL: Record<Cohort["category"], string> = {
  startup: "Startup Cohort",
  d2c: "D2C Cohort",
  general: "Fellowship",
  upcoming: "Upcoming",
};

const STAGE_OPTIONS = ["Idea", "Pre-seed", "Seed", "Series A+"];
const TEAM_OPTIONS = ["Solo", "2–5", "6–15", "16–50", "50+"];
const REVENUE_OPTIONS = ["Pre-revenue", "Below ₹1 L", "₹1–10 L", "₹10–50 L", "₹50 L+"];

const STEPS = [
  { icon: Rocket, title: "Apply", desc: "One short form. Takes about 5 minutes." },
  { icon: Search, title: "Review", desc: "Our team reads every application by hand." },
  { icon: MessagesSquare, title: "Interview", desc: "A 20-minute call with a program lead." },
  { icon: BadgeCheck, title: "Join the cohort", desc: "Onboard with your batch and start building." },
];

const BENEFITS = [
  { icon: Users, title: "Operator mentors", desc: "Weekly 1-on-1s with founders and operators who have scaled." },
  { icon: Presentation, title: "Demo Day", desc: "Pitch to 40+ active VCs and angels at the end of the program." },
  { icon: Wallet, title: "Zero equity", desc: "No equity, no fees. You keep 100% of your company." },
  { icon: Sparkles, title: "Perks & credits", desc: "$100K+ in cloud, SaaS and AI infra credits from partners." },
  { icon: Handshake, title: "Warm intros", desc: "Curated introductions to customers, partners and investors." },
  { icon: MessagesSquare, title: "Peer circle", desc: "A tight batch of founders you will keep for years." },
];

const FAQS = [
  {
    q: "Do you take equity or charge a fee?",
    a: "No. Founders Connect cohorts are free and take zero equity unless a program clearly says otherwise.",
  },
  {
    q: "Who should apply?",
    a: "Founders from idea to seed stage. Each program lists the stage and sector it is built for — if you are unsure, apply anyway and we will route you to the best fit.",
  },
  {
    q: "How long does selection take?",
    a: "Most applicants hear back within 7–10 days of the application deadline. Shortlisted founders are invited to a short interview.",
  },
  {
    q: "Can I apply to more than one cohort?",
    a: "Yes, but you can only apply once per cohort. If you are selected for two, we will help you pick the right one.",
  },
];

const EMPTY_APPLICATION: CohortApplicationInput = {
  founderName: "",
  email: "",
  phone: "",
  city: "",
  linkedinUrl: "",
  startupName: "",
  website: "",
  industry: "",
  stage: "",
  teamSize: "",
  monthlyRevenue: "",
  fundingRaised: "",
  pitch: "",
  whyJoin: "",
  deckUrl: "",
  referralSource: "",
};

const statusTone = (status = "") => {
  const s = status.toLowerCase();
  if (s.includes("closing")) return "bg-amber-100 text-amber-800 ring-amber-200";
  if (s.includes("closed")) return "bg-slate-100 text-slate-600 ring-slate-200";
  if (s.includes("waitlist") || s.includes("early")) return "bg-sky-100 text-sky-800 ring-sky-200";
  return "bg-emerald-100 text-emerald-800 ring-emerald-200";
};

const isExternal = (url?: string) => Boolean(url && /^https?:\/\//i.test(url));

const Field = ({ label, required, children }: { label: string; required?: boolean; children: ReactNode }) => (
  <label className="block">
    <span className="mb-1.5 block text-xs font-semibold text-slate-700">
      {label} {required && <span className="text-violet-600">*</span>}
    </span>
    {children}
  </label>
);

const Chips = ({ options, value, onChange }: { options: string[]; value: string; onChange: (v: string) => void }) => (
  <div className="flex flex-wrap gap-2">
    {options.map((option) => (
      <button
        key={option}
        type="button"
        onClick={() => onChange(value === option ? "" : option)}
        className={cn(
          "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
          value === option
            ? "border-violet-600 bg-violet-600 text-white"
            : "border-slate-200 bg-white text-slate-600 hover:border-violet-300 hover:text-violet-700"
        )}
      >
        {option}
      </button>
    ))}
  </div>
);

const ApplyDialog = ({ cohort, onClose }: { cohort: Cohort | null; onClose: () => void }) => {
  const [view, setView] = useState<"details" | "form" | "done">("details");
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<CohortApplicationInput>(EMPTY_APPLICATION);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (cohort) {
      setView("details");
      setStep(0);
      setError("");
    }
  }, [cohort]);

  if (!cohort) return null;

  const set = (key: keyof CohortApplicationInput) => (value: string) => setForm((f) => ({ ...f, [key]: value }));
  const closed = cohort.acceptingApplications === false;

  const validateStep = (index: number) => {
    if (index === 0) {
      if (!form.founderName.trim() || !form.email.trim() || !form.phone.trim()) return "Please add your name, email and phone.";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.email.trim())) return "Please enter a valid email address.";
      const digits = form.phone.replace(/\D/g, "");
      if (digits.length < 10 || digits.length > 15) return "Please enter a valid phone number.";
    }
    if (index === 1) {
      if (!form.startupName.trim()) return "Please add your startup name.";
      if (form.pitch.trim().length < 30) return "Tell us what you are building in at least 30 characters.";
    }
    return "";
  };

  const next = () => {
    const message = validateStep(step);
    setError(message);
    if (!message) setStep((s) => s + 1);
  };

  const submit = async () => {
    const message = validateStep(0) || validateStep(1);
    if (message) {
      setError(message);
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      await submitCohortApplicationApi(cohort.slug, form);
      setView("done");
      setForm(EMPTY_APPLICATION);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not submit your application. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={Boolean(cohort)} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[92vh] max-w-2xl overflow-y-auto p-0">
        {view === "details" && (
          <>
            <div className="relative aspect-[16/7] w-full overflow-hidden rounded-t-lg bg-violet-100">
              {cohort.imageUrl ? (
                <img src={cohort.imageUrl} alt="" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center text-violet-400">
                  <Rocket size={48} />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 to-transparent" />
              <span className={cn("absolute left-4 top-4 rounded-full px-3 py-1 text-[11px] font-semibold ring-1", statusTone(cohort.status))}>
                {cohort.status || "Applications Open"}
              </span>
            </div>
            <div className="p-6 sm:p-8">
              <DialogHeader className="text-left">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-violet-700">{CATEGORY_LABEL[cohort.category]}</p>
                <DialogTitle className="font-['Space_Grotesk'] text-2xl font-bold text-slate-900">{cohort.title}</DialogTitle>
                {cohort.tagline && <DialogDescription className="text-sm text-slate-600">{cohort.tagline}</DialogDescription>}
              </DialogHeader>

              <dl className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {[
                  { icon: Clock, label: "Duration", value: cohort.duration },
                  { icon: MapPin, label: "Mode", value: cohort.mode },
                  { icon: Calendar, label: "Starts", value: cohort.startDate },
                  { icon: Users, label: "Seats", value: cohort.seats ? `${cohort.seats} founders` : "" },
                ]
                  .filter((item) => item.value)
                  .map(({ icon: Icon, label, value }) => (
                    <div key={label} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                      <dt className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                        <Icon size={12} className="text-violet-600" /> {label}
                      </dt>
                      <dd className="mt-1 text-sm font-semibold text-slate-900">{value}</dd>
                    </div>
                  ))}
              </dl>

              {cohort.description && <p className="mt-5 text-sm leading-relaxed text-slate-600">{cohort.description}</p>}

              {cohort.highlights && cohort.highlights.length > 0 && (
                <ul className="mt-5 grid gap-2 sm:grid-cols-2">
                  {cohort.highlights.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm text-slate-700">
                      <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-violet-600" /> {item}
                    </li>
                  ))}
                </ul>
              )}

              <div className="mt-6 flex flex-col gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="text-xs text-slate-500">
                  {cohort.fee && <p className="font-semibold text-slate-700">{cohort.fee}</p>}
                  {cohort.applicationDeadline && <p>Apply by {cohort.applicationDeadline}</p>}
                </div>
                {closed ? (
                  <Button disabled>Applications closed</Button>
                ) : isExternal(cohort.applicationUrl) ? (
                  <Button asChild className="gap-2 bg-violet-600 hover:bg-violet-700">
                    <a href={cohort.applicationUrl} target="_blank" rel="noopener noreferrer">
                      Apply now <ExternalLink size={14} />
                    </a>
                  </Button>
                ) : (
                  <Button onClick={() => setView("form")} className="gap-2 bg-violet-600 hover:bg-violet-700">
                    Apply to this cohort <ArrowRight size={14} />
                  </Button>
                )}
              </div>
            </div>
          </>
        )}

        {view === "form" && (
          <div className="p-6 sm:p-8">
            <DialogHeader className="text-left">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-violet-700">Apply · {cohort.title}</p>
              <DialogTitle className="font-['Space_Grotesk'] text-2xl font-bold text-slate-900">
                {step === 0 ? "About you" : step === 1 ? "Your startup" : "Final details"}
              </DialogTitle>
              <DialogDescription>Step {step + 1} of 3 · Your details stay private to the selection team.</DialogDescription>
            </DialogHeader>

            <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-violet-100">
              <motion.div className="h-full rounded-full bg-violet-600" animate={{ width: `${((step + 1) / 3) * 100}%` }} />
            </div>

            <div className="mt-6 space-y-4">
              {step === 0 && (
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Full name" required>
                    <Input value={form.founderName} onChange={(e) => set("founderName")(e.target.value)} placeholder="Your name" />
                  </Field>
                  <Field label="Email" required>
                    <Input type="email" value={form.email} onChange={(e) => set("email")(e.target.value)} placeholder="you@startup.com" />
                  </Field>
                  <Field label="Phone" required>
                    <Input type="tel" value={form.phone} onChange={(e) => set("phone")(e.target.value)} placeholder="+91 98765 43210" />
                  </Field>
                  <Field label="City">
                    <Input value={form.city} onChange={(e) => set("city")(e.target.value)} placeholder="Bengaluru" />
                  </Field>
                  <div className="sm:col-span-2">
                    <Field label="LinkedIn profile">
                      <Input value={form.linkedinUrl} onChange={(e) => set("linkedinUrl")(e.target.value)} placeholder="https://linkedin.com/in/..." />
                    </Field>
                  </div>
                </div>
              )}

              {step === 1 && (
                <div className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Startup name" required>
                      <Input value={form.startupName} onChange={(e) => set("startupName")(e.target.value)} placeholder="Acme Labs" />
                    </Field>
                    <Field label="Website">
                      <Input value={form.website} onChange={(e) => set("website")(e.target.value)} placeholder="https://" />
                    </Field>
                    <div className="sm:col-span-2">
                      <Field label="Industry / sector">
                        <Input value={form.industry} onChange={(e) => set("industry")(e.target.value)} placeholder="FinTech, D2C, SaaS…" />
                      </Field>
                    </div>
                  </div>
                  <Field label="Stage">
                    <Chips options={STAGE_OPTIONS} value={form.stage} onChange={set("stage")} />
                  </Field>
                  <Field label="Team size">
                    <Chips options={TEAM_OPTIONS} value={form.teamSize} onChange={set("teamSize")} />
                  </Field>
                  <Field label="What are you building?" required>
                    <Textarea
                      rows={4}
                      value={form.pitch}
                      onChange={(e) => set("pitch")(e.target.value)}
                      placeholder="The problem, your solution, who it's for and any traction so far."
                    />
                    <span className="mt-1 block text-right text-[11px] text-slate-400">{form.pitch.trim().length} / 30+ characters</span>
                  </Field>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-4">
                  <Field label="Monthly revenue">
                    <Chips options={REVENUE_OPTIONS} value={form.monthlyRevenue} onChange={set("monthlyRevenue")} />
                  </Field>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Funding raised so far">
                      <Input value={form.fundingRaised} onChange={(e) => set("fundingRaised")(e.target.value)} placeholder="Bootstrapped / ₹50 L" />
                    </Field>
                    <Field label="Pitch deck link">
                      <Input value={form.deckUrl} onChange={(e) => set("deckUrl")(e.target.value)} placeholder="Google Drive, DocSend…" />
                    </Field>
                  </div>
                  <Field label="Why this cohort?">
                    <Textarea rows={3} value={form.whyJoin} onChange={(e) => set("whyJoin")(e.target.value)} placeholder="What do you want to get out of it?" />
                  </Field>
                  <Field label="How did you hear about us?">
                    <Input value={form.referralSource} onChange={(e) => set("referralSource")(e.target.value)} placeholder="LinkedIn, a friend, an event…" />
                  </Field>
                </div>
              )}
            </div>

            {error && (
              <p className="mt-5 flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
                <AlertCircle size={16} className="mt-0.5 shrink-0" /> {error}
              </p>
            )}

            <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-5">
              <Button
                variant="ghost"
                onClick={() => (step === 0 ? setView("details") : setStep((s) => s - 1))}
                className="gap-1.5 text-slate-600"
              >
                <ArrowLeft size={14} /> Back
              </Button>
              {step < 2 ? (
                <Button onClick={next} className="gap-2 bg-violet-600 hover:bg-violet-700">
                  Continue <ArrowRight size={14} />
                </Button>
              ) : (
                <Button onClick={submit} disabled={submitting} className="gap-2 bg-violet-600 hover:bg-violet-700">
                  {submitting ? "Submitting…" : "Submit application"}
                </Button>
              )}
            </div>
          </div>
        )}

        {view === "done" && (
          <div className="p-8 text-center sm:p-12">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-violet-100 text-violet-700">
              <CheckCircle2 size={34} />
            </div>
            <DialogTitle className="mt-5 font-['Space_Grotesk'] text-2xl font-bold text-slate-900">Application submitted</DialogTitle>
            <DialogDescription className="mx-auto mt-2 max-w-sm text-sm text-slate-600">
              Thanks for applying to {cohort.title}. We've sent a confirmation to your email and will get back to you with next steps.
            </DialogDescription>
            <Button onClick={onClose} className="mt-6 bg-violet-600 hover:bg-violet-700">
              Back to cohorts
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

const CohortCard = ({ cohort, onOpen, index }: { cohort: Cohort; onOpen: () => void; index: number }) => (
  <motion.article
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, amount: 0.2 }}
    transition={{ duration: 0.45, delay: (index % 3) * 0.08 }}
    className="group flex flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-violet-200 hover:shadow-xl hover:shadow-violet-900/5"
  >
    <button type="button" onClick={onOpen} className="relative aspect-[16/9] w-full overflow-hidden bg-violet-50 text-left">
      {cohort.imageUrl ? (
        <img
          src={cohort.imageUrl}
          alt={cohort.title}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      ) : (
        <div className="flex h-full items-center justify-center text-violet-300">
          <Rocket size={42} />
        </div>
      )}
      <span className="absolute left-3 top-3 rounded-full bg-white/95 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-violet-700 shadow-sm">
        {CATEGORY_LABEL[cohort.category]}
      </span>
      <span className={cn("absolute right-3 top-3 rounded-full px-2.5 py-1 text-[10px] font-semibold ring-1", statusTone(cohort.status))}>
        {cohort.status || "Applications Open"}
      </span>
    </button>

    <div className="flex flex-1 flex-col p-6">
      <h3 className="font-['Space_Grotesk'] text-xl font-bold leading-snug text-slate-900 transition-colors group-hover:text-violet-700">
        {cohort.title}
      </h3>
      {cohort.tagline && <p className="mt-1 text-sm text-slate-500">{cohort.tagline}</p>}

      <div className="mt-4 flex flex-wrap gap-2 text-[11px] text-slate-600">
        {[
          { icon: Clock, value: cohort.duration },
          { icon: MapPin, value: cohort.mode },
          { icon: Calendar, value: cohort.startDate },
        ]
          .filter((m) => m.value)
          .map(({ icon: Icon, value }) => (
            <span key={value} className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2.5 py-1">
              <Icon size={12} className="text-violet-600" /> {value}
            </span>
          ))}
      </div>

      {cohort.highlights && cohort.highlights.length > 0 && (
        <ul className="mt-4 space-y-1.5 border-t border-slate-100 pt-4 text-xs text-slate-700">
          {cohort.highlights.slice(0, 3).map((item) => (
            <li key={item} className="flex items-center gap-2">
              <CheckCircle2 size={14} className="shrink-0 text-violet-600" />
              <span className="line-clamp-1">{item}</span>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-auto flex items-center justify-between gap-3 pt-6">
        <div className="text-[11px] leading-tight text-slate-500">
          {cohort.applicationDeadline ? (
            <span className="inline-flex items-center gap-1 font-medium text-slate-700">
              <Hourglass size={12} className="text-violet-600" /> Apply by {cohort.applicationDeadline}
            </span>
          ) : (
            <span>Rolling applications</span>
          )}
          {cohort.seats ? <span className="mt-0.5 block">{cohort.seats} seats</span> : null}
        </div>
        <Button onClick={onOpen} size="sm" className="gap-1.5 bg-violet-600 hover:bg-violet-700">
          {cohort.acceptingApplications === false ? "View details" : "Apply"} <ArrowRight size={14} />
        </Button>
      </div>
    </div>
  </motion.article>
);

const CohortPage = () => {
  const location = useLocation();
  const [cohorts, setCohorts] = useState<Cohort[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("all");
  const [openCohort, setOpenCohort] = useState<Cohort | null>(null);

  useSEO({
    title: "Cohorts & Programs | Founders Connect",
    description:
      "Founders Connect cohort programs for early-stage tech startups and D2C brands. Operator mentorship, Demo Day and zero equity.",
    keywords: "startup accelerator, D2C cohort, founder bootcamp, startup program India, early stage cohort",
    ogType: "website",
    canonicalUrl: "https://founders.connect/cohorts",
  });

  useEffect(() => {
    if (location.pathname.includes("/d2c")) setActiveCategory("d2c");
    else if (location.pathname.includes("/upcoming")) setActiveCategory("upcoming");
    else setActiveCategory("all");
  }, [location.pathname]);

  useEffect(() => {
    getPublicCohortsApi()
      .then((res) => setCohorts(res.cohorts || []))
      .catch(() => setCohorts([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = activeCategory === "all" ? cohorts : cohorts.filter((c) => c.category === activeCategory);
  const tabs = CATEGORY_TABS.filter((t) => t.key === "all" || cohorts.some((c) => c.category === t.key));
  const totalSeats = useMemo(() => cohorts.reduce((sum, c) => sum + (c.seats || 0), 0), [cohorts]);
  const openCount = cohorts.filter((c) => c.acceptingApplications !== false).length;

  const scrollToPrograms = () => document.getElementById("programs")?.scrollIntoView({ behavior: "smooth" });

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-violet-100 bg-gradient-to-b from-violet-50 to-white">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-40 [background-image:radial-gradient(#c4b5fd_1px,transparent_1px)] [background-size:22px_22px] [mask-image:linear-gradient(to_bottom,black,transparent_75%)]"
        />
        <div className="container relative mx-auto px-4 pb-16 pt-8 md:pb-20 md:pt-10">
          <BackButton className="mx-0 mb-8 max-w-none px-0" />
          <div className="mx-auto max-w-3xl text-center">
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 rounded-full border border-violet-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-violet-700 shadow-sm"
            >
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-violet-600" />
              {openCount > 0 ? `${openCount} programs open for applications` : "Accelerator programs"}
            </motion.p>
            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="mt-6 font-['Space_Grotesk'] text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl"
            >
              Build faster with a <span className="text-violet-700">cohort</span> behind you
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-slate-600 md:text-lg"
            >
              Structured, operator-led programs that take early-stage founders and D2C brands from validation to scale — with
              mentorship, capital access and a peer group that has your back.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="mt-8 flex flex-col justify-center gap-3 sm:flex-row"
            >
              <Button size="lg" onClick={scrollToPrograms} className="gap-2 bg-violet-600 hover:bg-violet-700">
                Explore programs <ArrowRight size={16} />
              </Button>
              <Button size="lg" variant="outline" asChild className="border-violet-200 text-violet-800 hover:bg-violet-50">
                <a href="#how-it-works">How selection works</a>
              </Button>
            </motion.div>
          </div>

          <dl className="mx-auto mt-14 grid max-w-4xl grid-cols-2 gap-3 md:grid-cols-4">
            {[
              { value: cohorts.length || "—", label: "Live programs" },
              { value: totalSeats ? `${totalSeats}+` : "—", label: "Founder seats" },
              { value: "40+", label: "Demo Day investors" },
              { value: "0%", label: "Equity taken" },
            ].map((stat) => (
              <div key={stat.label} className="rounded-2xl border border-violet-100 bg-white/90 p-5 text-center shadow-sm">
                <dd className="font-['Space_Grotesk'] text-3xl font-bold text-slate-900">{stat.value}</dd>
                <dt className="mt-1 text-xs font-medium text-slate-500">{stat.label}</dt>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* Programs */}
      <section id="programs" className="scroll-mt-20 py-16 md:py-20">
        <div className="container mx-auto max-w-7xl px-4">
          {loading ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[0, 1, 2].map((i) => (
                <div key={i} className="h-[440px] animate-pulse rounded-3xl bg-slate-100" />
              ))}
            </div>
          ) : cohorts.length > 0 ? (
            <>
              <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-700">Programs</p>
                  <h2 className="mt-2 font-['Space_Grotesk'] text-3xl font-extrabold text-slate-900">Find your cohort</h2>
                </div>
                <div className="flex flex-wrap gap-2">
                  {tabs.map((tab) => (
                    <button
                      key={tab.key}
                      onClick={() => setActiveCategory(tab.key)}
                      className={cn(
                        "rounded-full px-4 py-2 text-xs font-semibold transition-all",
                        activeCategory === tab.key
                          ? "bg-violet-600 text-white shadow-sm"
                          : "bg-slate-100 text-slate-600 hover:bg-violet-50 hover:text-violet-700"
                      )}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {filtered.length > 0 ? (
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {filtered.map((cohort, index) => (
                    <CohortCard key={cohort.slug} cohort={cohort} index={index} onOpen={() => setOpenCohort(cohort)} />
                  ))}
                </div>
              ) : (
                <p className="rounded-2xl border border-dashed border-slate-200 py-14 text-center text-sm text-slate-500">
                  No programs in this category right now.{" "}
                  <button className="font-semibold text-violet-700" onClick={() => setActiveCategory("all")}>
                    See all programs
                  </button>
                </p>
              )}
            </>
          ) : (
            <div className="mx-auto max-w-2xl rounded-3xl border border-violet-100 bg-violet-50/50 px-6 py-14 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-violet-700 shadow-sm">
                <Clock size={28} />
              </div>
              <h2 className="mt-5 font-['Space_Grotesk'] text-2xl font-extrabold text-slate-900">New cohorts launching soon</h2>
              <p className="mx-auto mt-3 max-w-md text-sm text-slate-600">
                We're curating the next batches for early-stage founders and consumer brands. Join the waitlist to hear first.
              </p>
              <Button asChild className="mt-6 gap-2 bg-violet-600 hover:bg-violet-700">
                <Link to="/join-us">
                  Join the waitlist <ArrowRight size={16} />
                </Link>
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="scroll-mt-20 border-y border-violet-100 bg-violet-50/40 py-16 md:py-20">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-700">Selection</p>
            <h2 className="mt-2 font-['Space_Grotesk'] text-3xl font-extrabold text-slate-900">From application to cohort in four steps</h2>
          </div>
          <ol className="relative mt-12 grid gap-4 md:grid-cols-4">
            <div aria-hidden className="absolute left-[12%] right-[12%] top-7 hidden h-px bg-violet-200 md:block" />
            {STEPS.map(({ icon: Icon, title, desc }, index) => (
              <li key={title} className="relative rounded-2xl border border-violet-100 bg-white p-6 text-center shadow-sm">
                <span className="relative mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-600 text-white shadow-md shadow-violet-600/20">
                  <Icon size={24} />
                </span>
                <p className="mt-4 text-[11px] font-bold uppercase tracking-wider text-violet-600">Step {index + 1}</p>
                <h3 className="mt-1 font-['Space_Grotesk'] text-lg font-bold text-slate-900">{title}</h3>
                <p className="mt-1.5 text-sm text-slate-500">{desc}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16 md:py-20">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-700">What you get</p>
            <h2 className="mt-2 font-['Space_Grotesk'] text-3xl font-extrabold text-slate-900">Zero equity. Real leverage.</h2>
          </div>
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {BENEFITS.map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="group rounded-2xl border border-slate-200 bg-white p-6 transition-all hover:-translate-y-0.5 hover:border-violet-200 hover:shadow-md"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-50 text-violet-700 transition-colors group-hover:bg-violet-600 group-hover:text-white">
                  <Icon size={20} />
                </span>
                <h3 className="mt-4 font-['Space_Grotesk'] text-lg font-bold text-slate-900">{title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-slate-500">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ + CTA */}
      <section className="border-t border-slate-100 bg-slate-50/60 py-16 md:py-20">
        <div className="container mx-auto grid max-w-6xl gap-10 px-4 lg:grid-cols-[1fr_1.2fr]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-700">FAQ</p>
            <h2 className="mt-2 font-['Space_Grotesk'] text-3xl font-extrabold text-slate-900">Questions founders ask</h2>
            <p className="mt-3 text-sm text-slate-600">Still unsure? Talk to us about cohorts or sponsoring one.</p>
            <Button asChild variant="outline" className="mt-6 border-violet-200 text-violet-800 hover:bg-violet-50">
              <Link to="/contact-us">Contact the team</Link>
            </Button>
          </div>
          <Accordion type="single" collapsible className="rounded-2xl border border-slate-200 bg-white px-5">
            {FAQS.map((faq) => (
              <AccordionItem key={faq.q} value={faq.q}>
                <AccordionTrigger className="text-left text-sm font-semibold text-slate-900">{faq.q}</AccordionTrigger>
                <AccordionContent className="text-sm leading-relaxed text-slate-600">{faq.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      <ApplyDialog cohort={openCohort} onClose={() => setOpenCohort(null)} />
      <Footer />
    </div>
  );
};

export default CohortPage;
