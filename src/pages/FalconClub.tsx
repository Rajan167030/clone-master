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
} from "lucide-react";
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
    accentColor: "from-amber-700/30 to-amber-900/30",
    badgeBg: "bg-amber-950/60 text-amber-300 border-amber-600/40",
    glowColor: "rgba(217, 119, 6, 0.25)",
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
    accentColor: "from-yellow-600/30 to-yellow-800/30",
    badgeBg: "bg-yellow-950/80 text-yellow-300 border-yellow-500/50",
    glowColor: "rgba(234, 179, 8, 0.35)",
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
    accentColor: "from-purple-800/40 via-amber-700/30 to-yellow-600/30",
    badgeBg: "bg-gradient-to-r from-purple-950 to-amber-950 text-amber-200 border-amber-400/60 shadow-lg shadow-amber-500/20",
    glowColor: "rgba(245, 158, 11, 0.45)",
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError("");

    if (
      !formData.personalNetWorth ||
      !formData.annualCompanyRevenue ||
      !formData.companyValuation ||
      !formData.valuationBasis
    ) {
      setSubmitError("Please select your Net Worth, Revenue, Valuation and Valuation Basis.");
      return;
    }

    if (!formData.linkedinUrl.trim() && !formData.companyWebsite.trim() && formData.alternativeInfo.trim().length < 20) {
      setSubmitError(
        "Please share your LinkedIn profile, company website, or a short description of your business background (at least 20 characters) so we can verify your profile."
      );
      return;
    }

    if (!formData.confirmedAccurate || !formData.agreedTerms) {
      setSubmitError("Please confirm your information accuracy and accept the review policy.");
      return;
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
    <div className="min-h-screen bg-[#090a0f] text-slate-100 selection:bg-amber-500/30 selection:text-amber-200">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-24 md:pt-20 md:pb-32 border-b border-amber-500/10">
        {/* Ambient luxury lighting */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="h-[550px] w-[550px] rounded-full bg-gradient-to-tr from-amber-600/[0.06] via-purple-600/[0.04] to-transparent blur-[140px]" />
          <div className="absolute top-10 right-1/4 h-[350px] w-[350px] rounded-full bg-amber-500/[0.04] blur-[120px]" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Elite Circle Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-500/15 via-amber-400/10 to-amber-500/15 border border-amber-500/30 text-amber-300 text-xs sm:text-sm font-semibold tracking-wider uppercase mb-6 backdrop-blur-md shadow-[0_0_12px_rgba(245,158,11,0.08)]">
            <Crown size={15} className="text-amber-400" />
            <span>FALCON Club · By Founders Connect</span>
            <span className="text-amber-500/50">|</span>
            <span className="text-slate-300">Invite-Only Founders Circle</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white mb-6">
            A Private Circle for India’s{" "}
            <span className="bg-gradient-to-r from-amber-200 via-amber-400 to-yellow-500 bg-clip-text text-transparent drop-shadow-[0_4px_16px_rgba(245,158,11,0.1)]">
              Most Ambitious Founders
            </span>
          </h1>

          <p className="text-lg sm:text-2xl font-light text-amber-100/90 tracking-wide max-w-3xl mx-auto mb-4 font-serif italic">
            “Request Access. Get Verified. Earn Your Place.”
          </p>

          <p className="text-sm sm:text-base text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            Where unicorn leaders, high-trajectory entrepreneurs, generational business owners, and curated institutional investors assemble. Admission is strictly by manual verification — every seat is earned.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              onClick={scrollToApply}
              size="lg"
              className="w-full sm:w-auto bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-8 py-6 rounded-xl shadow-[0_0_16px_rgba(245,158,11,0.15)] transition-all transform hover:-translate-y-0.5"
            >
              Request Access
              <ArrowRight size={18} className="ml-2" />
            </Button>

            <a
              href="#membership-criteria"
              className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3.5 rounded-xl border border-slate-700 bg-slate-900/60 hover:bg-slate-800 text-slate-200 font-medium text-sm transition-all hover:border-amber-500/40"
            >
              Explore 5 Eligibility Tiers
            </a>

            <a
              href="#members-directory"
              className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3.5 rounded-xl border border-slate-800 bg-slate-950/70 hover:bg-slate-900 text-slate-300 font-medium text-sm transition-all hover:text-amber-300"
            >
              <Users2 size={16} className="mr-2 text-amber-400" />
              Member Directory
            </a>
          </div>

          {/* Verification Protocol Notice */}
          <div className="mt-14 max-w-2xl mx-auto p-4 rounded-xl border border-amber-500/20 bg-amber-500/5 backdrop-blur-sm flex items-start gap-3 text-left">
            <ShieldCheck size={20} className="text-amber-400 shrink-0 mt-0.5" />
            <div className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              <span className="font-semibold text-amber-300">Verification Protocol:</span>{" "}
              Submitting an application does not automatically grant admission. Every applicant’s professional footprint, entity metrics, and financial references undergo strict manual vetting by the admissions council.
            </div>
          </div>
        </div>
      </section>

      {/* Section 2: Membership Levels & Eligibility Criteria */}
      <section id="membership-criteria" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/30 mb-3 px-3 py-1">
            Membership Architecture
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
            Five Levels of Distinction
          </h2>
          <p className="mt-3 text-slate-400 text-sm sm:text-base">
            Applicants qualify under <span className="text-amber-300 font-semibold">any one</span> of the three financial metrics: Personal Net Worth, Annual Company Revenue, or Company Valuation.
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
                  ? "bg-amber-500 text-slate-950 border-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.12)] scale-105"
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
              className={`p-6 sm:p-10 rounded-2xl border border-amber-500/20 bg-gradient-to-b ${tier.accentColor} to-[#0d0f18] shadow-2xl relative overflow-hidden backdrop-blur-xl mb-12`}
            >
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 pb-8 border-b border-white/10">
                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
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

                <div className="text-xs text-amber-300/80 bg-amber-500/10 border border-amber-500/20 px-3.5 py-2 rounded-lg flex items-center gap-2">
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
                    <p className="text-2xl sm:text-3xl font-black text-amber-300 mt-2">
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
                      <CheckCircle2 size={16} className="text-amber-400 shrink-0" />
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
                  ? "border-amber-400 bg-amber-500/10 shadow-[0_0_8px_rgba(245,158,11,0.08)]"
                  : "border-slate-800 bg-slate-900/40 hover:border-slate-700 hover:bg-slate-900/70"
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-mono text-amber-400">0{index + 1}</span>
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
        className="py-20 bg-gradient-to-b from-[#0b0c14] to-[#07080d] border-y border-amber-500/15"
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/30 mb-3 px-3 py-1">
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
            <div className="p-8 sm:p-12 rounded-2xl border border-amber-500/30 bg-gradient-to-b from-amber-950/20 to-slate-950 text-center">
              <div className="h-16 w-16 mx-auto mb-6 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                <CheckCircle2 size={36} />
              </div>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-white mb-3">
                Application Received for Vetting
              </h3>
              <p className="text-slate-300 text-sm sm:text-base max-w-lg mx-auto mb-6 leading-relaxed">
                Thank you, <span className="font-semibold text-white">{formData.fullName}</span>. Your application for <span className="font-semibold text-white">{formData.companyName}</span> has been securely entered into the admissions queue.
              </p>

              <div className="max-w-md mx-auto p-5 rounded-xl border border-amber-500/30 bg-amber-500/5 mb-8 text-left">
                <p className="text-xs uppercase tracking-wider text-slate-400 mb-1">
                  Automated Suggested Tier:
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-xl font-bold text-amber-300">{submitSuccess.tier}</span>
                  <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/40">
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
                  }}
                  variant="outline"
                  className="border-slate-700 text-slate-300 hover:bg-slate-800"
                >
                  Submit Another Request
                </Button>
                <a
                  href="#members-directory"
                  className="px-5 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 font-semibold text-sm transition-colors"
                >
                  View Member Directory
                </a>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-8">
              {submitError && (
                <div className="p-4 rounded-xl border border-red-500/30 bg-red-950/30 text-red-300 text-sm flex items-start gap-3">
                  <AlertCircle size={18} className="shrink-0 mt-0.5" />
                  <span>{submitError}</span>
                </div>
              )}

              {/* Group A: Personal Details */}
              <div className="p-6 sm:p-8 rounded-2xl border border-white/10 bg-slate-950/60 backdrop-blur-md">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/10">
                  <div className="h-8 w-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold text-sm">
                    A
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">Personal Details</h3>
                    <p className="text-xs text-slate-400">Primary candidate information</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">
                      Full Name <span className="text-amber-400">*</span>
                    </label>
                    <Input
                      required
                      placeholder="e.g. Vikramaditya Singhania"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      className="bg-slate-900 border-slate-700 text-white placeholder:text-slate-600 focus:border-amber-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">
                      Mobile Number <span className="text-amber-400">*</span>
                    </label>
                    <Input
                      required
                      type="tel"
                      placeholder="e.g. +91 98765 43210"
                      value={formData.mobileNumber}
                      onChange={(e) => setFormData({ ...formData, mobileNumber: e.target.value })}
                      className="bg-slate-900 border-slate-700 text-white placeholder:text-slate-600 focus:border-amber-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">
                      Work / Primary Email Address <span className="text-amber-400">*</span>
                    </label>
                    <Input
                      required
                      type="email"
                      placeholder="e.g. founder@company.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="bg-slate-900 border-slate-700 text-white placeholder:text-slate-600 focus:border-amber-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">
                      Current City <span className="text-amber-400">*</span>
                    </label>
                    <Input
                      required
                      placeholder="e.g. Bengaluru / Mumbai / Delhi NCR"
                      value={formData.currentCity}
                      onChange={(e) => setFormData({ ...formData, currentCity: e.target.value })}
                      className="bg-slate-900 border-slate-700 text-white placeholder:text-slate-600 focus:border-amber-400"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center justify-between">
                      <span>LinkedIn Profile URL</span>
                      <span className="text-[11px] text-amber-400/80">Optional, but highly preferred</span>
                    </label>
                    <Input
                      type="url"
                      placeholder="https://www.linkedin.com/in/username"
                      value={formData.linkedinUrl}
                      onChange={(e) => setFormData({ ...formData, linkedinUrl: e.target.value })}
                      className="bg-slate-900 border-slate-700 text-white placeholder:text-slate-600 focus:border-amber-400"
                    />
                  </div>
                </div>
              </div>

              {/* Group B: Company Details */}
              <div className="p-6 sm:p-8 rounded-2xl border border-white/10 bg-slate-950/60 backdrop-blur-md">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/10">
                  <div className="h-8 w-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold text-sm">
                    B
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">Company Details</h3>
                    <p className="text-xs text-slate-400">Enterprise or startup identity</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">
                      Company / Startup Name <span className="text-amber-400">*</span>
                    </label>
                    <Input
                      required
                      placeholder="e.g. HyperScale Technologies"
                      value={formData.companyName}
                      onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                      className="bg-slate-900 border-slate-700 text-white placeholder:text-slate-600 focus:border-amber-400"
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
                      className="bg-slate-900 border-slate-700 text-white placeholder:text-slate-600 focus:border-amber-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">
                      Your Designation <span className="text-amber-400">*</span>
                    </label>
                    <select
                      value={formData.designation}
                      onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                      className="w-full h-10 px-3 rounded-md bg-slate-900 border border-slate-700 text-white text-sm focus:border-amber-400 focus:outline-none"
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
                        Specify Designation <span className="text-amber-400">*</span>
                      </label>
                      <Input
                        required
                        placeholder="e.g. Managing Partner / Director"
                        value={formData.customDesignation}
                        onChange={(e) => setFormData({ ...formData, customDesignation: e.target.value })}
                        className="bg-slate-900 border-slate-700 text-white placeholder:text-slate-600 focus:border-amber-400"
                      />
                    </div>
                  ) : (
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1.5">
                        Industry / Sector <span className="text-amber-400">*</span>
                      </label>
                      <Input
                        required
                        placeholder="e.g. FinTech / SaaS / D2C / HealthTech / DeepTech"
                        value={formData.industry}
                        onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                        className="bg-slate-900 border-slate-700 text-white placeholder:text-slate-600 focus:border-amber-400"
                      />
                    </div>
                  )}

                  {formData.designation === "Other" && (
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-medium text-slate-300 mb-1.5">
                        Industry / Sector <span className="text-amber-400">*</span>
                      </label>
                      <Input
                        required
                        placeholder="e.g. FinTech / SaaS / D2C / CleanTech"
                        value={formData.industry}
                        onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                        className="bg-slate-900 border-slate-700 text-white placeholder:text-slate-600 focus:border-amber-400"
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
                      className="bg-slate-900 border-slate-700 text-white placeholder:text-slate-600 focus:border-amber-400 text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Group C: Financial Details with Dropdowns & Real-time Suggested Tier Calculator */}
              <div className="p-6 sm:p-8 rounded-2xl border border-amber-500/25 bg-gradient-to-b from-slate-950 via-[#0d0e17] to-slate-950 shadow-xl relative">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/10">
                  <div className="h-8 w-8 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 font-bold text-sm">
                    C
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">Financial Criteria</h3>
                    <p className="text-xs text-slate-400">Strictly confidential · Determines suggested eligibility</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">
                      Personal Net Worth <span className="text-amber-400">*</span>
                    </label>
                    <select
                      value={formData.personalNetWorth}
                      onChange={(e) => setFormData({ ...formData, personalNetWorth: e.target.value })}
                      className="w-full h-10 px-3 rounded-md bg-slate-900 border border-slate-700 text-white text-sm focus:border-amber-400 focus:outline-none"
                      required
                    >
                      <option value="" disabled>
                        Select an option
                      </option>
                      {NET_WORTH_OPTIONS.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">
                      Annual Company Revenue <span className="text-amber-400">*</span>
                    </label>
                    <select
                      value={formData.annualCompanyRevenue}
                      onChange={(e) => setFormData({ ...formData, annualCompanyRevenue: e.target.value })}
                      className="w-full h-10 px-3 rounded-md bg-slate-900 border border-slate-700 text-white text-sm focus:border-amber-400 focus:outline-none"
                      required
                    >
                      <option value="" disabled>
                        Select an option
                      </option>
                      {REVENUE_OPTIONS.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">
                      Company Valuation <span className="text-amber-400">*</span>
                    </label>
                    <select
                      value={formData.companyValuation}
                      onChange={(e) => setFormData({ ...formData, companyValuation: e.target.value })}
                      className="w-full h-10 px-3 rounded-md bg-slate-900 border border-slate-700 text-white text-sm focus:border-amber-400 focus:outline-none"
                      required
                    >
                      <option value="" disabled>
                        Select an option
                      </option>
                      {VALUATION_OPTIONS.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">
                      Valuation Basis <span className="text-amber-400">*</span>
                    </label>
                    <select
                      value={formData.valuationBasis}
                      onChange={(e) => setFormData({ ...formData, valuationBasis: e.target.value })}
                      className="w-full h-10 px-3 rounded-md bg-slate-900 border border-slate-700 text-white text-sm focus:border-amber-400 focus:outline-none"
                      required
                    >
                      <option value="" disabled>
                        Select an option
                      </option>
                      {VALUATION_BASIS_OPTIONS.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Real-time Automatic Classification Banner */}
                <div className="mt-6 p-4 rounded-xl border border-amber-500/30 bg-gradient-to-r from-amber-500/10 via-amber-400/5 to-purple-500/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <Sparkles className="text-amber-400 h-6 w-6 shrink-0" />
                    <div>
                      <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">
                        Automated System Classification:
                      </p>
                      <p className="text-base sm:text-lg font-extrabold text-amber-300">
                        {formData.personalNetWorth && formData.annualCompanyRevenue && formData.companyValuation
                          ? computedLiveTier.label
                          : "SELECT YOUR FINANCIAL RANGES"}
                      </p>
                    </div>
                  </div>
                  <div className="text-[11px] text-slate-400 max-w-xs sm:text-right">
                    *Suggested eligibility only. Highest qualifying metric takes precedence. Final status subject to manual verification.
                  </div>
                </div>
              </div>

              {/* Group D: Final Details & Consent */}
              <div className="p-6 sm:p-8 rounded-2xl border border-white/10 bg-slate-950/60 backdrop-blur-md">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/10">
                  <div className="h-8 w-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold text-sm">
                    D
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">Final Details & Compliance</h3>
                    <p className="text-xs text-slate-400">Personal statement & affirmations</p>
                  </div>
                </div>

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
                      className="bg-slate-900 border-slate-700 text-white placeholder:text-slate-600 focus:border-amber-400 text-sm"
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
                      className="bg-slate-900 border-slate-700 text-white placeholder:text-slate-600 focus:border-amber-400"
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
                        className="border-slate-600 data-[state=checked]:bg-amber-500 data-[state=checked]:border-amber-500"
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
                        className="border-slate-600 data-[state=checked]:bg-amber-500 data-[state=checked]:border-amber-500"
                      />
                      <label htmlFor="agreedTerms" className="text-xs text-slate-300 leading-snug cursor-pointer">
                        I agree to the{" "}
                        <button
                          type="button"
                          onClick={() => setShowTermsModal(true)}
                          className="text-amber-400 underline hover:text-amber-300 font-medium"
                        >
                          FALCON Club Membership Terms & Review Process
                        </button>{" "}
                        and the platform{" "}
                        <Link to="/privacy-policy" className="text-amber-400 underline hover:text-amber-300 font-medium" target="_blank">
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
                            className="border-slate-600 data-[state=checked]:bg-amber-500 data-[state=checked]:border-amber-500"
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
                            className="border-slate-600 data-[state=checked]:bg-amber-500 data-[state=checked]:border-amber-500"
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

                <div className="mt-8 pt-4">
                  <Button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold py-6 text-base rounded-xl shadow-[0_0_14px_rgba(245,158,11,0.12)] transition-all"
                  >
                    {submitting ? (
                      <span className="inline-flex items-center gap-2">
                        <span className="h-4 w-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                        Submitting Application...
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-2">
                        <Crown size={18} />
                        Request Membership
                      </span>
                    )}
                  </Button>
                </div>
              </div>
            </form>
          )}
        </div>
      </section>

      {/* Section 4: Verification & Approval Process */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/30 mb-3 px-3 py-1">
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
                <div className="text-4xl font-black text-amber-500/20 mb-4 font-mono">{item.step}</div>
                <div className="h-10 w-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-4">
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
      <section id="members-directory" className="py-20 bg-[#08090e] border-t border-amber-500/15">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div>
              <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/30 mb-3 px-3 py-1">
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
                  className="pl-9 h-10 w-full sm:w-64 bg-slate-900 border-slate-700 text-white placeholder:text-slate-600 focus:border-amber-400 text-xs"
                />
              </div>

              {/* Tier Filter */}
              <select
                value={directoryTierFilter}
                onChange={(e) => setDirectoryTierFilter(e.target.value)}
                className="h-10 px-3 rounded-md bg-slate-900 border border-slate-700 text-white text-xs focus:border-amber-400 focus:outline-none"
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
          <div className="p-4 rounded-xl border border-amber-500/20 bg-amber-500/5 mb-8 flex items-center justify-between text-xs text-slate-300">
            <div className="flex items-center gap-2">
              <Lock size={15} className="text-amber-400" />
              <span>
                <strong className="text-amber-300">Confidentiality Guarantee:</strong> Member financial details (Net Worth, Revenue, Valuation) and supporting documents are never disclosed to the public or fellow members.
              </span>
            </div>
          </div>

          {/* Members Table / Grid */}
          {!authToken ? (
            <div className="py-16 text-center border border-dashed border-slate-800 rounded-2xl bg-slate-950/40">
              <Lock size={32} className="mx-auto text-amber-500/40 mb-3" />
              <p className="text-slate-300 font-semibold text-base">Sign in to view the member directory</p>
              <p className="text-slate-500 text-xs sm:text-sm max-w-md mx-auto mt-1 mb-6">
                The FALCON Club directory is private and visible only to signed-in Founders Connect accounts.
              </p>
              <Link
                to="/login"
                className="inline-flex px-5 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs"
              >
                Sign In
              </Link>
            </div>
          ) : directoryLoading ? (
            <div className="py-20 text-center text-slate-500 text-sm">
              <span className="inline-block h-6 w-6 border-2 border-amber-400 border-t-transparent rounded-full animate-spin mb-3" />
              <p>Loading verified members directory...</p>
            </div>
          ) : directoryMembers.length === 0 ? (
            <div className="py-16 text-center border border-dashed border-slate-800 rounded-2xl bg-slate-950/40">
              <Crown size={32} className="mx-auto text-amber-500/40 mb-3" />
              <p className="text-slate-300 font-semibold text-base">Inaugural Cohort Currently in Verification</p>
              <p className="text-slate-500 text-xs sm:text-sm max-w-md mx-auto mt-1 mb-6">
                Applications are actively undergoing committee vetting. Be among the first to earn your place in the FALCON Club directory.
              </p>
              <Button onClick={scrollToApply} className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs">
                Request Access Now
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {directoryMembers.map((member) => (
                <div
                  key={member._id}
                  className="p-5 rounded-xl border border-white/10 bg-slate-950/70 hover:border-amber-500/30 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div>
                        <h4 className="text-base font-bold text-white">{member.fullName}</h4>
                        <p className="text-xs text-amber-300 font-medium">
                          {member.designation} · {member.companyName}
                        </p>
                      </div>
                      <Badge className="bg-amber-500/15 text-amber-300 border-amber-500/30 text-[10px] uppercase font-bold shrink-0">
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
                        className="inline-flex items-center gap-1.5 text-xs text-amber-400 hover:text-amber-300 transition-colors"
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
      <section className="py-8 border-t border-amber-500/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-slate-400">
          <button type="button" onClick={() => setShowTermsModal(true)} className="hover:text-amber-300 underline underline-offset-4">
            FALCON Club Membership Terms &amp; Conditions
          </button>
          <Link to="/privacy-policy" className="hover:text-amber-300 underline underline-offset-4">
            Privacy Policy
          </Link>
          <span className="text-slate-600">Applying does not guarantee membership. All applications are subject to verification and approval.</span>
        </div>
      </section>

      {/* Section 6: Comprehensive Terms & Conditions Modal */}
      {showTermsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="max-w-2xl w-full max-h-[85vh] bg-[#0c0d14] border border-amber-500/30 rounded-2xl p-6 sm:p-8 overflow-y-auto text-left shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-6">
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="text-amber-400 h-6 w-6" />
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
              <div className="p-3.5 rounded-lg border border-amber-500/20 bg-amber-500/5">
                <p className="font-semibold text-amber-300 mb-1">1. No Guaranteed Admission</p>
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
                className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold"
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
