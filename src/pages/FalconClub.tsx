import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { getToken } from "@/lib/session";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  ShieldCheck,
  Award,
  Crown,
  Sparkles,
  TrendingUp,
  Lock,
  CheckCircle2,
  AlertCircle,
  Search,
  ExternalLink,
  ChevronRight,
  ArrowRight,
  FileCheck,
  Users2,
  Building2,
  DollarSign,
  HelpCircle,
  Flame,
  Info,
  ArrowLeft,
  Check,
  UserRound,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  submitFalconClubApplicationApi,
  getFalconClubMembersApi,
  type FalconClubPublicMember,
} from "@/lib/api";

// 5 Membership Levels & Financial Thresholds
const MEMBERSHIP_TIERS = [
  {
    id: "achiever",
    name: "ACHIEVER",
    tagline: "High-Trajectory Builders",
    accentColor: "from-purple-700/30 to-purple-900/30",
    badgeBg: "bg-purple-950/60 text-purple-300 border-purple-600/40",
    glowColor: "rgba(126, 34, 206, 0.25)",
    icon: Award,
    criteria: [
      { label: "Personal Net Worth", value: "₹1 Crore+" },
      { label: "Annual Company Revenue", value: "₹1 Crore+" },
      { label: "Company Valuation", value: "₹1 Crore+" },
    ],
    privileges: [
      "Access to Achiever Founder Circles",
      "Quarterly Private Networking Dinners",
      "Direct Introductions to Seed & Pre-Series A Angels",
      "Founders Connect Masterclass Access",
    ],
  },
  {
    id: "millionaire",
    name: "MILLIONAIRE",
    tagline: "Proven Growth Champions",
    accentColor: "from-slate-600/30 to-slate-800/30",
    badgeBg: "bg-slate-900/80 text-slate-200 border-slate-500/40",
    glowColor: "rgba(148, 163, 184, 0.25)",
    icon: TrendingUp,
    criteria: [
      { label: "Personal Net Worth", value: "₹5 Crore+" },
      { label: "Annual Company Revenue", value: "₹5 Crore+" },
      { label: "Company Valuation", value: "₹5 Crore+" },
    ],
    privileges: [
      "Everything in Achiever Tier",
      "Closed-Door Growth Stage Roundtables",
      "Priority Access to Institutional VC Mixers",
      "Executive Peer Advisory Board",
    ],
  },
  {
    id: "elite",
    name: "ELITE",
    tagline: "Market Leaders & Scale-up Titans",
    accentColor: "from-purple-600/30 to-purple-800/30",
    badgeBg: "bg-purple-950/80 text-purple-300 border-purple-500/50",
    glowColor: "rgba(168, 85, 247, 0.35)",
    icon: Crown,
    criteria: [
      { label: "Personal Net Worth", value: "₹10 Crore+" },
      { label: "Annual Company Revenue", value: "₹10 Crore+" },
      { label: "Company Valuation", value: "₹10 Crore+" },
    ],
    privileges: [
      "Everything in Millionaire Tier",
      "Invitations to Annual Founders Retreat",
      "Curated Co-Investment Syndicates",
      "Strategic Cross-Border Expansion Councils",
    ],
  },
  {
    id: "signature",
    name: "SIGNATURE",
    tagline: "Category Defining Innovators",
    accentColor: "from-emerald-700/30 to-emerald-950/40",
    badgeBg: "bg-emerald-950/80 text-emerald-300 border-emerald-500/50",
    glowColor: "rgba(16, 185, 129, 0.35)",
    icon: Sparkles,
    criteria: [
      { label: "Personal Net Worth", value: "₹25 Crore+" },
      { label: "Annual Company Revenue", value: "₹25 Crore+" },
      { label: "Company Valuation", value: "₹25 Crore+" },
    ],
    privileges: [
      "Everything in Elite Tier",
      "Private Sovereign & Family Office Conclaves",
      "White-Glove VIP Concierge for Global Summits",
      "Exclusive Board Advisory & Mentor Seatings",
    ],
  },
  {
    id: "legacy",
    name: "LEGACY",
    tagline: "Visionary Industry Icons",
    accentColor: "from-purple-800/40 via-purple-700/30 to-purple-600/30",
    badgeBg: "bg-gradient-to-r from-purple-950 to-purple-950 text-purple-200 border-purple-400/60 shadow-lg shadow-purple-500/20",
    glowColor: "rgba(147, 51, 234, 0.45)",
    icon: Flame,
    criteria: [
      { label: "Personal Net Worth", value: "₹50 Crore+" },
      { label: "Annual Company Revenue", value: "₹100 Crore+" },
      { label: "Company Valuation", value: "₹100 Crore+" },
    ],
    privileges: [
      "Highest Level Prestige in Founders Connect Ecosystem",
      "Advisory Governance in Annual Selection Committee",
      "Private Sovereign Dinners with Unicorn Founders & Global VCs",
      "Keynote Honor at Annual Flagship Global Conclave",
    ],
  },
];

// Fixed positions so the hero background is identical on every render.
const HERO_SPECKS = [
  { top: "14%", left: "12%", size: 3, opacity: 0.35, duration: 4 },
  { top: "22%", left: "84%", size: 2, opacity: 0.3, duration: 5 },
  { top: "36%", left: "6%", size: 2, opacity: 0.25, duration: 6 },
  { top: "62%", left: "90%", size: 3, opacity: 0.3, duration: 4.5 },
  { top: "74%", left: "18%", size: 2, opacity: 0.25, duration: 5.5 },
  { top: "10%", left: "58%", size: 2, opacity: 0.25, duration: 6.5 },
  { top: "84%", left: "70%", size: 2, opacity: 0.3, duration: 5 },
  { top: "48%", left: "95%", size: 2, opacity: 0.2, duration: 7 },
  { top: "56%", left: "3%", size: 3, opacity: 0.25, duration: 4 },
  { top: "28%", left: "30%", size: 2, opacity: 0.2, duration: 6 },
];

// Hero background: repeating "pleated" beams — each band ramps from dark to
// gold, then drops off sharply — plus an SVG noise tile for grain.
const HERO_BEAMS =
  "repeating-linear-gradient(112deg, transparent 0px, transparent 26px, rgba(107,33,168,0.10) 50px, rgba(147,51,234,0.30) 94px, rgba(9,10,15,0.85) 96px, transparent 124px)";
const HERO_GRAIN =
  "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")";

// Dropdown options matching specifications
const NET_WORTH_OPTIONS = [
  "Below ₹1 Cr",
  "₹1–5 Cr",
  "₹5–10 Cr",
  "₹10–25 Cr",
  "₹25–50 Cr",
  "₹50 Cr+",
  "Prefer Not to Disclose",
];

const REVENUE_OPTIONS = [
  "Pre-revenue",
  "Below ₹1 Cr",
  "₹1–5 Cr",
  "₹5–10 Cr",
  "₹10–25 Cr",
  "₹25–100 Cr",
  "₹100 Cr+",
  "Prefer Not to Disclose",
];

const VALUATION_OPTIONS = [
  "Not Formally Valued",
  "Below ₹1 Cr",
  "₹1–5 Cr",
  "₹5–10 Cr",
  "₹10–25 Cr",
  "₹25–100 Cr",
  "₹100 Cr+",
  "Prefer Not to Disclose",
];

const VALUATION_BASIS_OPTIONS = [
  "Funding Round",
  "Valuation Report",
  "Internal Estimate",
  "Other / Not Formally Valued",
];

const DESIGNATION_OPTIONS = [
  "Founder",
  "Co-founder",
  "Business Owner",
  "Exited Founder",
  "Investor",
  "Other",
];

// Financial fields start empty so applicants make an explicit choice.
const INITIAL_FORM = {
  fullName: "",
  mobileNumber: "",
  email: "",
  currentCity: "",
  linkedinUrl: "",
  companyName: "",
  companyWebsite: "",
  designation: "Founder",
  customDesignation: "",
  industry: "",
  alternativeInfo: "",
  personalNetWorth: "",
  annualCompanyRevenue: "",
  companyValuation: "",
  valuationBasis: "",
  whyJoin: "",
  referredBy: "",
  confirmedAccurate: false,
  agreedTerms: false,
  consentDirectory: false,
  consentLinkedin: false,
};

// Application wizard steps
const FORM_STEPS = [
  { title: "Personal", subtitle: "Who you are", icon: UserRound, heading: "Tell us about yourself", description: "Your contact details stay private to the admissions team." },
  { title: "Company", subtitle: "What you build", icon: Building2, heading: "Your company", description: "Help us verify your business. No website or LinkedIn? Describe your background instead." },
  { title: "Financials", subtitle: "Confidential", icon: TrendingUp, heading: "Financial criteria", description: "Pick a range for each. You qualify through any one — the highest level wins." },
  { title: "Confirm", subtitle: "Final details", icon: ShieldCheck, heading: "Almost there", description: "A few final details and your consent, then request membership." },
];

const FIELD_CLASS =
  "h-11 rounded-xl bg-white/[0.03] border-white/10 text-white placeholder:text-slate-600 transition-colors focus-visible:ring-2 focus-visible:ring-purple-500/40 focus-visible:ring-offset-0 focus-visible:border-purple-500/60";
const TEXTAREA_CLASS =
  "rounded-xl bg-white/[0.03] border-white/10 text-white placeholder:text-slate-600 text-sm transition-colors focus-visible:ring-2 focus-visible:ring-purple-500/40 focus-visible:ring-offset-0 focus-visible:border-purple-500/60";
const SELECT_CLASS =
  "w-full h-11 px-3 rounded-xl bg-[#0f1118] border border-white/10 text-white text-sm transition-colors focus:outline-none focus:border-purple-500/60 focus:ring-2 focus:ring-purple-500/40";

// Single-choice pill group used for the financial ranges.
const OptionChips = ({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: string[];
  value: string;
  onChange: (value: string) => void;
}) => (
  <div>
    <p className="mb-2.5 text-xs font-medium text-slate-300">
      {label} <span className="text-purple-400">*</span>
    </p>
    <div role="radiogroup" aria-label={label} className="flex flex-wrap gap-2">
      {options.map((option) => {
        const active = value === option;
        return (
          <button
            key={option}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(option)}
            className={`rounded-full border px-3.5 py-1.5 text-xs font-medium transition-all ${
              active
                ? "border-purple-400 bg-purple-600 text-white shadow-[0_0_0_3px_rgba(147,51,234,0.2)]"
                : "border-white/10 bg-white/[0.03] text-slate-300 hover:border-purple-500/50 hover:text-white"
            }`}
          >
            {option}
          </button>
        );
      })}
    </div>
  </div>
);

export default function FalconClub() {
  const [selectedTierTab, setSelectedTierTab] = useState("achiever");
  const authToken = getToken() || "";
  const { hash } = useLocation();

  // Scroll to #section links (navbar, landing page) once this lazy page has rendered.
  useEffect(() => {
    if (!hash) return undefined;
    const timer = window.setTimeout(() => {
      document.getElementById(decodeURIComponent(hash.slice(1)))?.scrollIntoView({ behavior: "smooth" });
    }, 100);
    return () => window.clearTimeout(timer);
  }, [hash]);

  // Form state
  const [formData, setFormData] = useState(INITIAL_FORM);

  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState<{
    id: string;
    tier: string;
    reason?: string;
  } | null>(null);
  const [submitError, setSubmitError] = useState("");

  // Multi-step application wizard
  const [step, setStep] = useState(0);
  const [stepDirection, setStepDirection] = useState(1);

  // Directory state
  const [directoryMembers, setDirectoryMembers] = useState<FalconClubPublicMember[]>([]);
  const [directoryLoading, setDirectoryLoading] = useState(true);
  const [directorySearch, setDirectorySearch] = useState("");
  const [directoryTierFilter, setDirectoryTierFilter] = useState("all");

  // Terms modal
  const [showTermsModal, setShowTermsModal] = useState(false);

  // Live Automatic Tier Calculation on frontend
  const computedLiveTier = useMemo(() => {
    let nwScore = 0;
    if (formData.personalNetWorth === "₹50 Cr+") nwScore = 5;
    else if (formData.personalNetWorth === "₹25–50 Cr") nwScore = 4;
    else if (formData.personalNetWorth === "₹10–25 Cr") nwScore = 3;
    else if (formData.personalNetWorth === "₹5–10 Cr") nwScore = 2;
    else if (formData.personalNetWorth === "₹1–5 Cr") nwScore = 1;

    let revScore = 0;
    if (formData.annualCompanyRevenue === "₹100 Cr+") revScore = 5;
    else if (formData.annualCompanyRevenue === "₹25–100 Cr") revScore = 4;
    else if (formData.annualCompanyRevenue === "₹10–25 Cr") revScore = 3;
    else if (formData.annualCompanyRevenue === "₹5–10 Cr") revScore = 2;
    else if (formData.annualCompanyRevenue === "₹1–5 Cr") revScore = 1;

    let valScore = 0;
    if (formData.companyValuation === "₹100 Cr+") valScore = 5;
    else if (formData.companyValuation === "₹25–100 Cr") valScore = 4;
    else if (formData.companyValuation === "₹10–25 Cr") valScore = 3;
    else if (formData.companyValuation === "₹5–10 Cr") valScore = 2;
    else if (formData.companyValuation === "₹1–5 Cr") valScore = 1;

    const max = Math.max(nwScore, revScore, valScore);
    if (max === 5) return { tier: "Legacy", score: 5, label: "LEGACY TIER" };
    if (max === 4) return { tier: "Signature", score: 4, label: "SIGNATURE TIER" };
    if (max === 3) return { tier: "Elite", score: 3, label: "ELITE TIER" };
    if (max === 2) return { tier: "Millionaire", score: 2, label: "MILLIONAIRE TIER" };
    if (max === 1) return { tier: "Achiever", score: 1, label: "ACHIEVER TIER" };
    return { tier: "Under Evaluation", score: 0, label: "DISCRETIONARY EVALUATION" };
  }, [formData.personalNetWorth, formData.annualCompanyRevenue, formData.companyValuation]);

  // Load private directory (logged-in accounts only)
  useEffect(() => {
    if (!authToken) {
      setDirectoryLoading(false);
      return undefined;
    }

    let cancelled = false;
    setDirectoryLoading(true);

    getFalconClubMembersApi(authToken, {
      search: directorySearch,
      tier: directoryTierFilter,
    })
      .then((res) => {
        if (!cancelled && res.success) {
          setDirectoryMembers(res.members);
        }
      })
      .catch((err) => {
        console.error("Directory fetch failed:", err);
      })
      .finally(() => {
        if (!cancelled) setDirectoryLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [authToken, directorySearch, directoryTierFilter]);

  const financialsChosen = Boolean(
    formData.personalNetWorth && formData.annualCompanyRevenue && formData.companyValuation
  );

  // Returns an error message for the given wizard step, or "" when it is complete.
  const validateStep = (index: number): string => {
    if (index === 0) {
      if (!formData.fullName.trim() || !formData.mobileNumber.trim() || !formData.email.trim() || !formData.currentCity.trim()) {
        return "Please fill in your name, mobile number, email and city.";
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(formData.email.trim())) return "Please enter a valid email address.";
      const digits = formData.mobileNumber.replace(/\D/g, "");
      if (digits.length < 10 || digits.length > 15) return "Please enter a valid mobile number.";
      return "";
    }
    if (index === 1) {
      if (!formData.companyName.trim() || !formData.industry.trim()) return "Please add your company name and industry.";
      if (formData.designation === "Other" && !formData.customDesignation.trim()) return "Please specify your designation.";
      if (!formData.linkedinUrl.trim() && !formData.companyWebsite.trim() && formData.alternativeInfo.trim().length < 20) {
        return "Add your company website, your LinkedIn (previous step), or a short business background (20+ characters) so we can verify your profile.";
      }
      return "";
    }
    if (index === 2) {
      if (!financialsChosen || !formData.valuationBasis) {
        return "Please choose your Net Worth, Revenue, Valuation and Valuation Basis.";
      }
      return "";
    }
    if (!formData.confirmedAccurate || !formData.agreedTerms) {
      return "Please confirm your information accuracy and accept the review policy.";
    }
    return "";
  };

  const goToStep = (target: number) => {
    // Moving forward requires every step before the target to be valid.
    if (target > step) {
      for (let i = step; i < target; i += 1) {
        const error = validateStep(i);
        if (error) {
          setStep(i);
          setSubmitError(error);
          return;
        }
      }
    }
    setSubmitError("");
    setStepDirection(target > step ? 1 : -1);
    setStep(target);
    document.getElementById("membership-form-section")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError("");

    // Enter on an earlier step just advances the wizard.
    if (step < FORM_STEPS.length - 1) {
      goToStep(step + 1);
      return;
    }

    for (let i = 0; i < FORM_STEPS.length; i += 1) {
      const error = validateStep(i);
      if (error) {
        setStepDirection(-1);
        setStep(i);
        setSubmitError(error);
        return;
      }
    }

    setSubmitting(true);
    try {
      const response = await submitFalconClubApplicationApi(formData);
      if (response.success) {
        setSubmitSuccess({
          id: response.application._id,
          tier: response.application.suggestedTier,
          reason: response.application.suggestedTierReason,
        });
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to submit application. Please try again.";
      setSubmitError(message);
    } finally {
      setSubmitting(false);
    }
  };

  const scrollToApply = () => {
    const el = document.getElementById("membership-form-section");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen bg-[#090a0f] text-slate-100 selection:bg-purple-500/30 selection:text-purple-200">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-24 md:pt-20 md:pb-32 border-b border-purple-500/10">
        {/* Diagonal gold light beams with film grain, brightest behind the headline */}
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div
            className="absolute inset-0 [mask-image:radial-gradient(ellipse_65%_80%_at_50%_40%,black_20%,transparent_75%)]"
            style={{ backgroundImage: HERO_BEAMS }}
          />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_38%_45%_at_50%_38%,rgba(192,132,252,0.12),transparent_70%)]" />
          <div className="absolute inset-0 opacity-[0.22] mix-blend-overlay" style={{ backgroundImage: HERO_GRAIN }} />
          <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-[#090a0f]" />
        </div>

        {/* Fine gold grid, faded out toward the edges */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 [background-image:linear-gradient(rgba(147,51,234,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(147,51,234,0.06)_1px,transparent_1px)] [background-size:56px_56px] [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_70%)]"
        />

        {/* Concentric "seal" rings behind the headline */}
        <div aria-hidden className="pointer-events-none absolute left-1/2 top-[42%] -translate-x-1/2 -translate-y-1/2">
          <div className="relative h-[680px] w-[680px] sm:h-[820px] sm:w-[820px]">
            <div className="absolute inset-0 rounded-full border border-purple-500/[0.07]" />
            <div className="absolute inset-[12%] rounded-full border border-dashed border-purple-400/[0.09] motion-safe:animate-[spin_140s_linear_infinite]" />
            <div className="absolute inset-[26%] rounded-full border border-purple-500/[0.06]" />
            <div className="absolute inset-[38%] rounded-full border border-purple-400/[0.06]" />
          </div>
        </div>

        {/* Scattered gold specks */}
        <div aria-hidden className="pointer-events-none absolute inset-0">
          {HERO_SPECKS.map((speck, index) => (
            <span
              key={index}
              className="absolute rounded-full bg-purple-300 motion-safe:animate-pulse"
              style={{
                top: speck.top,
                left: speck.left,
                width: speck.size,
                height: speck.size,
                opacity: speck.opacity,
                animationDuration: `${speck.duration}s`,
                animationDelay: `${index * 0.4}s`,
              }}
            />
          ))}
        </div>

        {/* Soft fade into the next section */}
        <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-b from-transparent to-[#090a0f]" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Elite Circle Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-purple-500/15 via-purple-400/10 to-purple-500/15 border border-purple-500/30 text-purple-300 text-xs sm:text-sm font-semibold tracking-wider uppercase mb-6 backdrop-blur-md shadow-[0_0_12px_rgba(147,51,234,0.08)]">
            <Crown size={15} className="text-purple-400" />
            <span>FALCON Club · By Founders Connect</span>
            <span className="text-purple-500/50">|</span>
            <span className="text-slate-300">Invite-Only Founders Circle</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white mb-6">
            A Private Circle for India’s{" "}
            <span className="bg-gradient-to-r from-purple-200 via-purple-400 to-purple-500 bg-clip-text text-transparent drop-shadow-[0_4px_16px_rgba(147,51,234,0.1)]">
              Most Ambitious Founders
            </span>
          </h1>

          <p className="text-lg sm:text-2xl font-light text-purple-100/90 tracking-wide max-w-3xl mx-auto mb-4 font-serif italic">
            “Request Access. Get Verified. Earn Your Place.”
          </p>

          <p className="text-sm sm:text-base text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            Where unicorn leaders, high-trajectory entrepreneurs, generational business owners, and curated institutional investors assemble. Admission is strictly by manual verification — every seat is earned.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              onClick={scrollToApply}
              size="lg"
              className="w-full sm:w-auto bg-purple-500 hover:bg-purple-600 text-white font-bold px-8 py-6 rounded-xl shadow-[0_0_16px_rgba(147,51,234,0.15)] transition-all transform hover:-translate-y-0.5"
            >
              Request Access
              <ArrowRight size={18} className="ml-2" />
            </Button>

            <a
              href="#membership-criteria"
              className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3.5 rounded-xl border border-slate-700 bg-slate-900/60 hover:bg-slate-800 text-slate-200 font-medium text-sm transition-all hover:border-purple-500/40"
            >
              Explore 5 Eligibility Tiers
            </a>

            <a
              href="#members-directory"
              className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3.5 rounded-xl border border-slate-800 bg-slate-950/70 hover:bg-slate-900 text-slate-300 font-medium text-sm transition-all hover:text-purple-300"
            >
              <Users2 size={16} className="mr-2 text-purple-400" />
              Member Directory
            </a>
          </div>
        </div>
      </section>

      {/* Section 2: Membership Levels & Eligibility Criteria */}
      <section id="membership-criteria" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <Badge className="bg-purple-500/10 text-purple-400 border-purple-500/30 mb-3 px-3 py-1">
            Membership Architecture
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
            Five Levels of Distinction
          </h2>
          <p className="mt-3 text-slate-400 text-sm sm:text-base">
            Applicants qualify under <span className="text-purple-300 font-semibold">any one</span> of the three financial metrics: Personal Net Worth, Annual Company Revenue, or Company Valuation.
          </p>
        </div>

        {/* Tier switcher tabs */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
          {MEMBERSHIP_TIERS.map((tier) => (
            <button
              key={tier.id}
              onClick={() => setSelectedTierTab(tier.id)}
              className={`px-4 sm:px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold uppercase tracking-wider transition-all border ${
                selectedTierTab === tier.id
                  ? "bg-purple-500 text-white border-purple-400 shadow-[0_0_10px_rgba(147,51,234,0.12)] scale-105"
                  : "bg-slate-900/80 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-slate-200"
              }`}
            >
              {tier.name}
            </button>
          ))}
        </div>

        {/* Active Tier Spotlight Card */}
        {(() => {
          const tier = MEMBERSHIP_TIERS.find((t) => t.id === selectedTierTab) || MEMBERSHIP_TIERS[0];
          const Icon = tier.icon;
          return (
            <div
              className={`p-6 sm:p-10 rounded-2xl border border-purple-500/20 bg-gradient-to-b ${tier.accentColor} to-[#0d0f18] shadow-2xl relative overflow-hidden backdrop-blur-xl mb-12`}
            >
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 pb-8 border-b border-white/10">
                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
                    <Icon size={28} />
                  </div>
                  <div>
                    <div className="flex items-center gap-3">
                      <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-wide">
                        {tier.name}
                      </h3>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider border ${tier.badgeBg}`}>
                        Tier Level
                      </span>
                    </div>
                    <p className="text-slate-400 text-sm mt-1">{tier.tagline}</p>
                  </div>
                </div>

                <div className="text-xs text-purple-300/80 bg-purple-500/10 border border-purple-500/20 px-3.5 py-2 rounded-lg flex items-center gap-2">
                  <Info size={15} />
                  <span>Applicant qualifies via ANY one criterion below</span>
                </div>
              </div>

              {/* 3 Criteria columns */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-8">
                {tier.criteria.map((c) => (
                  <div
                    key={c.label}
                    className="p-5 rounded-xl border border-white/10 bg-slate-950/60 backdrop-blur-sm"
                  >
                    <p className="text-xs uppercase tracking-wider text-slate-400 font-medium">
                      {c.label}
                    </p>
                    <p className="text-2xl sm:text-3xl font-black text-purple-300 mt-2">
                      {c.value}
                    </p>
                    <p className="text-[11px] text-slate-500 mt-1">Verified minimum benchmark</p>
                  </div>
                ))}
              </div>

              {/* Privileges list */}
              <div>
                <p className="text-xs uppercase tracking-wider text-slate-400 font-semibold mb-3">
                  Tier Privileges & Experience:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {tier.privileges.map((p) => (
                    <div key={p} className="flex items-center gap-2.5 text-sm text-slate-300">
                      <CheckCircle2 size={16} className="text-purple-400 shrink-0" />
                      <span>{p}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })()}

        {/* Overview Grid of all 5 Tiers */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {MEMBERSHIP_TIERS.map((t, index) => (
            <div
              key={t.id}
              onClick={() => setSelectedTierTab(t.id)}
              className={`p-5 rounded-xl border cursor-pointer transition-all ${
                selectedTierTab === t.id
                  ? "border-purple-400 bg-purple-500/10 shadow-[0_0_8px_rgba(147,51,234,0.08)]"
                  : "border-slate-800 bg-slate-900/40 hover:border-slate-700 hover:bg-slate-900/70"
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-mono text-purple-400">0{index + 1}</span>
                <span className="text-xs font-bold text-slate-300">{t.name}</span>
              </div>
              <p className="text-lg font-bold text-white mb-2">{t.criteria[0].value}</p>
              <p className="text-xs text-slate-400 leading-tight">Net Worth / Revenue / Valuation</p>
            </div>
          ))}
        </div>

        {/* Advisory footnote */}
        <p className="text-xs text-slate-500 text-center mt-6 italic">
          *Note: These are proposed eligibility criteria. Final thresholds are subject to formal approval by Founders Connect leadership prior to official cohort launch.
        </p>
      </section>

      {/* Section 3: Membership Application Form */}
      <section
        id="membership-form-section"
        className="py-20 bg-gradient-to-b from-[#0b0c14] to-[#07080d] border-y border-purple-500/15"
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Badge className="bg-purple-500/10 text-purple-400 border-purple-500/30 mb-3 px-3 py-1">
              Common Membership Application
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
              Request Your Membership
            </h2>
            <p className="mt-3 text-slate-400 text-sm sm:text-base max-w-xl mx-auto">
              A single application covers all five tiers. Based on your metrics, the system automatically classifies your suggested qualifying tier for manual committee review.
            </p>
          </div>

          {submitSuccess ? (
            <div className="p-8 sm:p-12 rounded-2xl border border-purple-500/30 bg-gradient-to-b from-purple-950/20 to-slate-950 text-center">
              <div className="h-16 w-16 mx-auto mb-6 rounded-full bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-400">
                <CheckCircle2 size={36} />
              </div>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-white mb-3">
                Application Received for Vetting
              </h3>
              <p className="text-slate-300 text-sm sm:text-base max-w-lg mx-auto mb-6 leading-relaxed">
                Thank you, <span className="font-semibold text-white">{formData.fullName}</span>. Your application for <span className="font-semibold text-white">{formData.companyName}</span> has been securely entered into the admissions queue.
              </p>

              <div className="max-w-md mx-auto p-5 rounded-xl border border-purple-500/30 bg-purple-500/5 mb-8 text-left">
                <p className="text-xs uppercase tracking-wider text-slate-400 mb-1">
                  Automated Suggested Tier:
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-xl font-bold text-purple-300">{submitSuccess.tier}</span>
                  <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/40">
                    Pending Verification
                  </Badge>
                </div>
                {submitSuccess.reason && (
                  <p className="text-xs text-slate-400 mt-2">{submitSuccess.reason}</p>
                )}
                <div className="mt-4 pt-3 border-t border-white/10 text-[11px] text-slate-500">
                  Application Reference ID: <span className="font-mono text-slate-300">{submitSuccess.id}</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button
                  onClick={() => {
                    setSubmitSuccess(null);
                    setFormData(INITIAL_FORM);
                    setStep(0);
                  }}
                  variant="outline"
                  className="border-slate-700 text-slate-300 hover:bg-slate-800"
                >
                  Submit Another Request
                </Button>
                <a
                  href="#members-directory"
                  className="px-5 py-2.5 rounded-lg bg-purple-500 hover:bg-purple-600 text-white font-semibold text-sm transition-colors"
                >
                  View Member Directory
                </a>
              </div>
            </div>
          ) : (
            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px] lg:items-start">
              <form
                onSubmit={handleSubmit}
                noValidate
                className="overflow-hidden rounded-3xl border border-white/10 bg-[#0d0e15]/80 shadow-2xl shadow-purple-950/30 backdrop-blur-md"
              >
                {/* Progress + stepper */}
                <div className="border-b border-white/10 p-5 sm:p-6">
                  <div className="flex items-center justify-between text-[11px] font-medium uppercase tracking-wider text-slate-500">
                    <span>
                      Step {step + 1} of {FORM_STEPS.length}
                    </span>
                    <span>{Math.round(((step + 1) / FORM_STEPS.length) * 100)}% complete</span>
                  </div>
                  <div className="mt-2 h-1 overflow-hidden rounded-full bg-white/5">
                    <motion.div
                      className="h-full rounded-full bg-purple-500"
                      initial={false}
                      animate={{ width: `${((step + 1) / FORM_STEPS.length) * 100}%` }}
                      transition={{ duration: 0.4, ease: "easeOut" }}
                    />
                  </div>
                  <ol className="mt-5 grid grid-cols-4 gap-2">
                    {FORM_STEPS.map((item, index) => {
                      const Icon = item.icon;
                      const done = index < step;
                      const active = index === step;
                      return (
                        <li key={item.title}>
                          <button
                            type="button"
                            onClick={() => goToStep(index)}
                            className="flex w-full flex-col items-center gap-1.5 text-center sm:flex-row sm:gap-2.5 sm:text-left"
                            aria-current={active ? "step" : undefined}
                          >
                            <span
                              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border transition-all duration-300 ${
                                active
                                  ? "border-purple-400 bg-purple-600 text-white shadow-[0_0_0_4px_rgba(147,51,234,0.18)]"
                                  : done
                                    ? "border-purple-500/50 bg-purple-500/15 text-purple-300"
                                    : "border-white/10 bg-white/[0.03] text-slate-500"
                              }`}
                            >
                              {done ? <Check size={16} /> : <Icon size={16} />}
                            </span>
                            <span className="min-w-0">
                              <span className={`block text-[11px] font-semibold sm:text-xs ${active ? "text-white" : "text-slate-400"}`}>
                                {item.title}
                              </span>
                              <span className="hidden text-[10px] text-slate-500 sm:block">{item.subtitle}</span>
                            </span>
                          </button>
                        </li>
                      );
                    })}
                  </ol>
                </div>

                {/* Active step */}
                <div className="relative overflow-hidden p-5 sm:p-7">
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.div
                      key={step}
                      initial={{ opacity: 0, x: stepDirection * 40 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: stepDirection * -40 }}
                      transition={{ duration: 0.25, ease: "easeOut" }}
                    >
                      <div className="mb-6">
                        <h3 className="text-xl font-bold text-white sm:text-2xl">{FORM_STEPS[step].heading}</h3>
                        <p className="mt-1 text-sm text-slate-400">{FORM_STEPS[step].description}</p>
                      </div>

                      {step === 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">
                      Full Name <span className="text-purple-400">*</span>
                    </label>
                    <Input
                      required
                      placeholder="e.g. Vikramaditya Singhania"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      className={FIELD_CLASS}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">
                      Mobile Number <span className="text-purple-400">*</span>
                    </label>
                    <Input
                      required
                      type="tel"
                      placeholder="e.g. +91 98765 43210"
                      value={formData.mobileNumber}
                      onChange={(e) => setFormData({ ...formData, mobileNumber: e.target.value })}
                      className={FIELD_CLASS}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">
                      Work / Primary Email Address <span className="text-purple-400">*</span>
                    </label>
                    <Input
                      required
                      type="email"
                      placeholder="e.g. founder@company.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className={FIELD_CLASS}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">
                      Current City <span className="text-purple-400">*</span>
                    </label>
                    <Input
                      required
                      placeholder="e.g. Bengaluru / Mumbai / Delhi NCR"
                      value={formData.currentCity}
                      onChange={(e) => setFormData({ ...formData, currentCity: e.target.value })}
                      className={FIELD_CLASS}
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center justify-between">
                      <span>LinkedIn Profile URL</span>
                      <span className="text-[11px] text-purple-400/80">Optional, but highly preferred</span>
                    </label>
                    <Input
                      type="url"
                      placeholder="https://www.linkedin.com/in/username"
                      value={formData.linkedinUrl}
                      onChange={(e) => setFormData({ ...formData, linkedinUrl: e.target.value })}
                      className={FIELD_CLASS}
                    />
                  </div>
                </div>
                      )}

                      {step === 1 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">
                      Company / Startup Name <span className="text-purple-400">*</span>
                    </label>
                    <Input
                      required
                      placeholder="e.g. HyperScale Technologies"
                      value={formData.companyName}
                      onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                      className={FIELD_CLASS}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">
                      Company Website <span className="text-slate-500">(Optional)</span>
                    </label>
                    <Input
                      type="url"
                      placeholder="https://company.com"
                      value={formData.companyWebsite}
                      onChange={(e) => setFormData({ ...formData, companyWebsite: e.target.value })}
                      className={FIELD_CLASS}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">
                      Your Designation <span className="text-purple-400">*</span>
                    </label>
                    <select
                      value={formData.designation}
                      onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                      className={SELECT_CLASS}
                    >
                      {DESIGNATION_OPTIONS.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </div>

                  {formData.designation === "Other" ? (
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1.5">
                        Specify Designation <span className="text-purple-400">*</span>
                      </label>
                      <Input
                        required
                        placeholder="e.g. Managing Partner / Director"
                        value={formData.customDesignation}
                        onChange={(e) => setFormData({ ...formData, customDesignation: e.target.value })}
                        className={FIELD_CLASS}
                      />
                    </div>
                  ) : (
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1.5">
                        Industry / Sector <span className="text-purple-400">*</span>
                      </label>
                      <Input
                        required
                        placeholder="e.g. FinTech / SaaS / D2C / HealthTech / DeepTech"
                        value={formData.industry}
                        onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                        className={FIELD_CLASS}
                      />
                    </div>
                  )}

                  {formData.designation === "Other" && (
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-medium text-slate-300 mb-1.5">
                        Industry / Sector <span className="text-purple-400">*</span>
                      </label>
                      <Input
                        required
                        placeholder="e.g. FinTech / SaaS / D2C / CleanTech"
                        value={formData.industry}
                        onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                        className={FIELD_CLASS}
                      />
                    </div>
                  )}

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">
                      Alternative Company Information / Background{" "}
                      <span className="text-slate-500">(Required if you have no LinkedIn or website)</span>
                    </label>
                    <Textarea
                      rows={2}
                      placeholder="If you do not have an active website or LinkedIn URL, please describe your business background, operating track record, or company registration details here."
                      value={formData.alternativeInfo}
                      onChange={(e) => setFormData({ ...formData, alternativeInfo: e.target.value })}
                      className={TEXTAREA_CLASS}
                    />
                  </div>
                </div>
                      )}

                      {step === 2 && (
                <div className="space-y-6">
                  <OptionChips
                    label="Personal Net Worth"
                    options={NET_WORTH_OPTIONS}
                    value={formData.personalNetWorth}
                    onChange={(value) => setFormData({ ...formData, personalNetWorth: value })}
                  />
                  <OptionChips
                    label="Annual Company Revenue"
                    options={REVENUE_OPTIONS}
                    value={formData.annualCompanyRevenue}
                    onChange={(value) => setFormData({ ...formData, annualCompanyRevenue: value })}
                  />
                  <OptionChips
                    label="Company Valuation"
                    options={VALUATION_OPTIONS}
                    value={formData.companyValuation}
                    onChange={(value) => setFormData({ ...formData, companyValuation: value })}
                  />
                  <OptionChips
                    label="Valuation Basis"
                    options={VALUATION_BASIS_OPTIONS}
                    value={formData.valuationBasis}
                    onChange={(value) => setFormData({ ...formData, valuationBasis: value })}
                  />
                  <div className="flex items-start gap-2.5 rounded-xl border border-white/10 bg-white/[0.02] p-3.5 text-[11px] leading-relaxed text-slate-400">
                    <Lock size={14} className="mt-0.5 shrink-0 text-purple-400" />
                    Strictly confidential. The suggested level is only an indication — your final membership level is confirmed after manual verification.
                  </div>
                </div>
                      )}

                      {step === 3 && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">
                      Why do you want to join FALCON Club? <span className="text-slate-500">(Optional)</span>
                    </label>
                    <Textarea
                      rows={3}
                      placeholder="Share your goals, what you seek from the peer circle, or how you intend to contribute to fellow members."
                      value={formData.whyJoin}
                      onChange={(e) => setFormData({ ...formData, whyJoin: e.target.value })}
                      className={TEXTAREA_CLASS}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">
                      Referred By / Invitation Code <span className="text-slate-500">(Optional)</span>
                    </label>
                    <Input
                      placeholder="e.g. Existing member name or invitation referral token"
                      value={formData.referredBy}
                      onChange={(e) => setFormData({ ...formData, referredBy: e.target.value })}
                      className={FIELD_CLASS}
                    />
                  </div>

                  <div className="pt-4 border-t border-white/10 space-y-3">
                    <div className="flex items-start gap-3">
                      <Checkbox
                        id="confirmedAccurate"
                        checked={formData.confirmedAccurate}
                        onCheckedChange={(checked) =>
                          setFormData({ ...formData, confirmedAccurate: Boolean(checked) })
                        }
                        className="border-slate-600 data-[state=checked]:bg-purple-500 data-[state=checked]:border-purple-500"
                      />
                      <label htmlFor="confirmedAccurate" className="text-xs text-slate-300 leading-snug cursor-pointer">
                        <span className="font-semibold text-white">Accuracy Confirmation:</span> I confirm that all personal, company, and financial data provided in this application is accurate and true to the best of my knowledge.
                      </label>
                    </div>

                    <div className="flex items-start gap-3">
                      <Checkbox
                        id="agreedTerms"
                        checked={formData.agreedTerms}
                        onCheckedChange={(checked) =>
                          setFormData({ ...formData, agreedTerms: Boolean(checked) })
                        }
                        className="border-slate-600 data-[state=checked]:bg-purple-500 data-[state=checked]:border-purple-500"
                      />
                      <label htmlFor="agreedTerms" className="text-xs text-slate-300 leading-snug cursor-pointer">
                        I agree to the{" "}
                        <button
                          type="button"
                          onClick={() => setShowTermsModal(true)}
                          className="text-purple-400 underline hover:text-purple-300 font-medium"
                        >
                          FALCON Club Membership Terms & Review Process
                        </button>{" "}
                        and the platform{" "}
                        <Link to="/privacy-policy" className="text-purple-400 underline hover:text-purple-300 font-medium" target="_blank">
                          Privacy Policy
                        </Link>
                        . I understand that application does not guarantee membership and is subject to verification.
                      </label>
                    </div>

                    <div className="pt-3 border-t border-white/10">
                      <p className="text-xs font-semibold text-white mb-2">
                        Member Directory Permissions <span className="font-normal text-slate-500">(Optional · applies only if approved)</span>
                      </p>
                      <div className="space-y-3">
                        <div className="flex items-start gap-3">
                          <Checkbox
                            id="consentDirectory"
                            checked={formData.consentDirectory}
                            onCheckedChange={(checked) =>
                              setFormData({
                                ...formData,
                                consentDirectory: Boolean(checked),
                                consentLinkedin: checked ? formData.consentLinkedin : false,
                              })
                            }
                            className="border-slate-600 data-[state=checked]:bg-purple-500 data-[state=checked]:border-purple-500"
                          />
                          <label htmlFor="consentDirectory" className="text-xs text-slate-300 leading-snug cursor-pointer">
                            List my name, company, designation and membership level in the private FALCON Club member directory.
                          </label>
                        </div>

                        <div className="flex items-start gap-3">
                          <Checkbox
                            id="consentLinkedin"
                            disabled={!formData.consentDirectory}
                            checked={formData.consentLinkedin}
                            onCheckedChange={(checked) =>
                              setFormData({ ...formData, consentLinkedin: Boolean(checked) })
                            }
                            className="border-slate-600 data-[state=checked]:bg-purple-500 data-[state=checked]:border-purple-500"
                          />
                          <label
                            htmlFor="consentLinkedin"
                            className={`text-xs leading-snug cursor-pointer ${formData.consentDirectory ? "text-slate-300" : "text-slate-600"}`}
                          >
                            Also show my LinkedIn profile link in the directory.
                          </label>
                        </div>
                        <p className="text-[11px] text-slate-500">
                          Your financial details and documents are never shown in the directory.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                      )}
                    </motion.div>
                  </AnimatePresence>

                  {submitError && (
                    <div className="mt-6 flex items-start gap-3 rounded-xl border border-red-500/30 bg-red-950/30 p-4 text-sm text-red-300">
                      <AlertCircle size={18} className="mt-0.5 shrink-0" />
                      <span>{submitError}</span>
                    </div>
                  )}
                </div>

                {/* Navigation */}
                <div className="flex items-center justify-between gap-3 border-t border-white/10 px-5 py-4 sm:px-7">
                  <Button
                    type="button"
                    variant="ghost"
                    disabled={step === 0}
                    onClick={() => goToStep(step - 1)}
                    className="gap-1.5 text-slate-300 hover:bg-white/5 hover:text-white disabled:opacity-30"
                  >
                    <ArrowLeft size={16} />
                    Back
                  </Button>

                  {step < FORM_STEPS.length - 1 ? (
                    <Button
                      type="button"
                      onClick={() => goToStep(step + 1)}
                      className="group gap-1.5 rounded-xl bg-purple-600 px-6 text-white hover:bg-purple-500"
                    >
                      Continue
                      <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
                    </Button>
                  ) : (
                    <Button
                      type="submit"
                      disabled={submitting}
                      className="gap-2 rounded-xl bg-purple-600 px-6 font-semibold text-white hover:bg-purple-500"
                    >
                      {submitting ? (
                        <>
                          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                          Submitting…
                        </>
                      ) : (
                        <>
                          <Crown size={16} />
                          Request Membership
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </form>

              {/* Live application preview */}
              <aside className="space-y-4 lg:sticky lg:top-24">
                <div className="relative overflow-hidden rounded-3xl border border-purple-500/25 bg-gradient-to-b from-purple-500/[0.08] to-transparent p-5">
                  <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-purple-300">Live application</p>

                  <div className="mt-4 flex items-center gap-3">
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-purple-600/20 text-base font-bold text-purple-200 ring-1 ring-purple-500/40">
                      {formData.fullName.trim() ? (
                        formData.fullName
                          .trim()
                          .split(/\s+/)
                          .slice(0, 2)
                          .map((part) => part[0])
                          .join("")
                          .toUpperCase()
                      ) : (
                        <UserRound size={20} />
                      )}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-white">{formData.fullName.trim() || "Your name"}</p>
                      <p className="truncate text-xs text-slate-400">
                        {formData.designation === "Other" ? formData.customDesignation || "Other" : formData.designation}
                        {formData.companyName.trim() ? ` · ${formData.companyName.trim()}` : ""}
                      </p>
                    </div>
                  </div>

                  <div className="mt-5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase tracking-wider text-slate-500">Suggested level</span>
                      <span className="text-xs font-bold text-purple-300">
                        {financialsChosen ? computedLiveTier.tier : "—"}
                      </span>
                    </div>
                    <div className="mt-2 grid grid-cols-5 gap-1">
                      {[1, 2, 3, 4, 5].map((level) => (
                        <span
                          key={level}
                          className={`h-1.5 rounded-full transition-colors duration-500 ${
                            financialsChosen && level <= computedLiveTier.score ? "bg-purple-500" : "bg-white/10"
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  <ul className="mt-5 space-y-2">
                    {FORM_STEPS.map((item, index) => {
                      const complete = validateStep(index) === "";
                      return (
                        <li key={item.title} className="flex items-center gap-2 text-xs">
                          <span
                            className={`flex h-4 w-4 items-center justify-center rounded-full transition-colors ${
                              complete ? "bg-purple-500 text-white" : "border border-white/15"
                            }`}
                          >
                            {complete && <Check size={10} />}
                          </span>
                          <span className={complete ? "text-slate-200" : "text-slate-500"}>{item.title}</span>
                        </li>
                      );
                    })}
                  </ul>
                </div>

                <div className="flex items-start gap-2.5 rounded-2xl border border-white/10 bg-white/[0.02] p-4 text-[11px] leading-relaxed text-slate-400">
                  <Lock size={14} className="mt-0.5 shrink-0 text-purple-400" />
                  Your financial details are strictly confidential, reviewed only by the admissions team, and never shown publicly.
                </div>
              </aside>
            </div>
          )}
        </div>
      </section>

      {/* Section 4: Verification & Approval Process */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <Badge className="bg-purple-500/10 text-purple-400 border-purple-500/30 mb-3 px-3 py-1">
            Council Due Diligence
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
            The Multi-Stage Verification Workflow
          </h2>
          <p className="mt-3 text-slate-400 text-sm sm:text-base">
            How every application is thoroughly audited to safeguard the caliber and integrity of the private circle.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            {
              step: "01",
              title: "LinkedIn & Background",
              desc: "Deep background check on founders' professional pedigree, educational roots, and operational history.",
              icon: Search,
            },
            {
              step: "02",
              title: "Corporate Validation",
              desc: "Cross-verification of company website, MCA / Registrar records, operating footprint, and public mentions.",
              icon: Building2,
            },
            {
              step: "03",
              title: "Financial Evidence",
              desc: "Secure, confidential validation of valuation reports, funding rounds, or revenue milestones when required.",
              icon: FileCheck,
            },
            {
              step: "04",
              title: "Council Induction",
              desc: "Admissions council reviews final file, confirms the approved membership tier, and issues welcome credentials.",
              icon: ShieldCheck,
            },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.step}
                className="p-6 rounded-2xl border border-white/10 bg-slate-950/60 relative overflow-hidden backdrop-blur-sm"
              >
                <div className="text-4xl font-black text-purple-500/20 mb-4 font-mono">{item.step}</div>
                <div className="h-10 w-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 mb-4">
                  <Icon size={20} />
                </div>
                <h4 className="text-lg font-bold text-white mb-2">{item.title}</h4>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">{item.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Section 5: Member Leaderboard / Directory */}
      <section id="members-directory" className="py-20 bg-[#08090e] border-t border-purple-500/15">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div>
              <Badge className="bg-purple-500/10 text-purple-400 border-purple-500/30 mb-3 px-3 py-1">
                Verified Circle
              </Badge>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
                Member Directory & Leaderboard
              </h2>
              <p className="mt-2 text-slate-400 text-sm max-w-xl">
                Private directory of approved and verified members. Visible only to signed-in Founders Connect accounts, and only members who chose to be listed appear here.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              {/* Search */}
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <Input
                  placeholder="Search name, company, city..."
                  value={directorySearch}
                  onChange={(e) => setDirectorySearch(e.target.value)}
                  className="pl-9 h-10 w-full sm:w-64 bg-slate-900 border-slate-700 text-white placeholder:text-slate-600 focus:border-purple-400 text-xs"
                />
              </div>

              {/* Tier Filter */}
              <select
                value={directoryTierFilter}
                onChange={(e) => setDirectoryTierFilter(e.target.value)}
                className="h-10 px-3 rounded-md bg-slate-900 border border-slate-700 text-white text-xs focus:border-purple-400 focus:outline-none"
              >
                <option value="all">All Tiers</option>
                <option value="Legacy">Legacy</option>
                <option value="Signature">Signature</option>
                <option value="Elite">Elite</option>
                <option value="Millionaire">Millionaire</option>
                <option value="Achiever">Achiever</option>
              </select>
            </div>
          </div>

          {/* Strict Confidentiality Reminder */}
          <div className="p-4 rounded-xl border border-purple-500/20 bg-purple-500/5 mb-8 flex items-center justify-between text-xs text-slate-300">
            <div className="flex items-center gap-2">
              <Lock size={15} className="text-purple-400" />
              <span>
                <strong className="text-purple-300">Confidentiality Guarantee:</strong> Member financial details (Net Worth, Revenue, Valuation) and supporting documents are never disclosed to the public or fellow members.
              </span>
            </div>
          </div>

          {/* Members Table / Grid */}
          {!authToken ? (
            <div className="py-16 text-center border border-dashed border-slate-800 rounded-2xl bg-slate-950/40">
              <Lock size={32} className="mx-auto text-purple-500/40 mb-3" />
              <p className="text-slate-300 font-semibold text-base">Sign in to view the member directory</p>
              <p className="text-slate-500 text-xs sm:text-sm max-w-md mx-auto mt-1 mb-6">
                The FALCON Club directory is private and visible only to signed-in Founders Connect accounts.
              </p>
              <Link
                to="/login"
                className="inline-flex px-5 py-2.5 rounded-lg bg-purple-500 hover:bg-purple-600 text-white font-bold text-xs"
              >
                Sign In
              </Link>
            </div>
          ) : directoryLoading ? (
            <div className="py-20 text-center text-slate-500 text-sm">
              <span className="inline-block h-6 w-6 border-2 border-purple-400 border-t-transparent rounded-full animate-spin mb-3" />
              <p>Loading verified members directory...</p>
            </div>
          ) : directoryMembers.length === 0 ? (
            <div className="py-16 text-center border border-dashed border-slate-800 rounded-2xl bg-slate-950/40">
              <Crown size={32} className="mx-auto text-purple-500/40 mb-3" />
              <p className="text-slate-300 font-semibold text-base">Inaugural Cohort Currently in Verification</p>
              <p className="text-slate-500 text-xs sm:text-sm max-w-md mx-auto mt-1 mb-6">
                Applications are actively undergoing committee vetting. Be among the first to earn your place in the FALCON Club directory.
              </p>
              <Button onClick={scrollToApply} className="bg-purple-500 hover:bg-purple-600 text-white font-bold text-xs">
                Request Access Now
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {directoryMembers.map((member) => (
                <div
                  key={member._id}
                  className="p-5 rounded-xl border border-white/10 bg-slate-950/70 hover:border-purple-500/30 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div>
                        <h4 className="text-base font-bold text-white">{member.fullName}</h4>
                        <p className="text-xs text-purple-300 font-medium">
                          {member.designation} · {member.companyName}
                        </p>
                      </div>
                      <Badge className="bg-purple-500/15 text-purple-300 border-purple-500/30 text-[10px] uppercase font-bold shrink-0">
                        {member.membershipTier}
                      </Badge>
                    </div>

                    <div className="space-y-1 text-xs text-slate-400 mb-4">
                      <p>
                        <span className="text-slate-500">Industry:</span> {member.industry}
                      </p>
                      <p>
                        <span className="text-slate-500">City:</span> {member.currentCity}
                      </p>
                    </div>
                  </div>

                  {member.linkedinUrl && (
                    <div className="pt-3 border-t border-white/10 flex items-center justify-between">
                      <a
                        href={member.linkedinUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs text-purple-400 hover:text-purple-300 transition-colors"
                      >
                        <span>LinkedIn Profile</span>
                        <ExternalLink size={12} />
                      </a>
                      <span className="text-[10px] text-slate-600">Verified Member</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Terms & Privacy links */}
      <section className="py-8 border-t border-purple-500/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-slate-400">
          <button type="button" onClick={() => setShowTermsModal(true)} className="hover:text-purple-300 underline underline-offset-4">
            FALCON Club Membership Terms &amp; Conditions
          </button>
          <Link to="/privacy-policy" className="hover:text-purple-300 underline underline-offset-4">
            Privacy Policy
          </Link>
          <span className="text-slate-600">Applying does not guarantee membership. All applications are subject to verification and approval.</span>
        </div>
      </section>

      {/* Section 6: Comprehensive Terms & Conditions Modal */}
      {showTermsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="max-w-2xl w-full max-h-[85vh] bg-[#0c0d14] border border-purple-500/30 rounded-2xl p-6 sm:p-8 overflow-y-auto text-left shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-6">
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="text-purple-400 h-6 w-6" />
                <h3 className="text-xl font-bold text-white">
                  FALCON Club · Terms & Conditions
                </h3>
              </div>
              <button
                onClick={() => setShowTermsModal(false)}
                className="text-slate-400 hover:text-white text-lg p-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs sm:text-sm text-slate-300 leading-relaxed">
              <div className="p-3.5 rounded-lg border border-purple-500/20 bg-purple-500/5">
                <p className="font-semibold text-purple-300 mb-1">1. No Guaranteed Admission</p>
                <p className="text-slate-300">
                  Submission of an application does not automatically grant or guarantee membership in FALCON Club. Every profile is subject to manual due diligence, background screening, and admissions committee vote.
                </p>
              </div>

              <div className="p-3.5 rounded-lg border border-white/10 bg-slate-900/40">
                <p className="font-semibold text-white mb-1">2. Verification of Profile & Financials</p>
                <p>
                  All applications are subject to rigorous verification. Candidates may be requested to furnish verifiable proof of professional standing, corporate status, or financial metrics via secure channels.
                </p>
              </div>

              <div className="p-3.5 rounded-lg border border-white/10 bg-slate-900/40">
                <p className="font-semibold text-white mb-1">3. Zero Tolerance for Misrepresentation</p>
                <p>
                  Providing inaccurate, misleading, or fraudulent financial metrics, company information, or designations will result in immediate disqualification, permanent blacklisting, and revocation of any awarded privileges.
                </p>
              </div>

              <div className="p-3.5 rounded-lg border border-white/10 bg-slate-900/40">
                <p className="font-semibold text-white mb-1">4. Transparent Dues, Benefits & Refund Policy</p>
                <p>
                  Membership fees (if applicable for specific tiers), renewal terms, exclusive benefits, and cancellation/refund policies will be explicitly communicated and mutually confirmed prior to any financial transaction.
                </p>
              </div>

              <div className="p-3.5 rounded-lg border border-white/10 bg-slate-900/40">
                <p className="font-semibold text-white mb-1">5. No Investment or Funding Guarantee</p>
                <p>
                  Membership within FALCON Club provides curated high-signal networking and peer conclaves. It does not constitute an investment solicitation or guarantee capital deployment, investor commitments, or commercial outcomes.
                </p>
              </div>

              <div className="p-3.5 rounded-lg border border-white/10 bg-slate-900/40">
                <p className="font-semibold text-white mb-1">6. Absolute Confidentiality</p>
                <p>
                  All financial disclosures, supporting documents, and verification artifacts submitted by applicants are strictly confidential and protected under non-disclosure obligations. They are never published or shared.
                </p>
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-white/10 flex justify-end">
              <Button
                onClick={() => setShowTermsModal(false)}
                className="bg-purple-500 hover:bg-purple-600 text-white font-bold"
              >
                I Understand and Accept
              </Button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
