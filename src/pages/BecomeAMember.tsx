import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BackButton from "@/components/BackButton";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useSEO } from "@/hooks/useSEO";
import {
  Check,
  Sparkles,
  Zap,
  ShieldCheck,
  Users,
  Compass,
  ArrowRight,
  TrendingUp,
  Award,
  HelpCircle,
} from "lucide-react";
import { Link } from "react-router-dom";

interface MembershipPlan {
  id: string;
  name: string;
  badge?: string;
  tagline: string;
  price: string;
  period: string;
  popular?: boolean;
  features: string[];
  ctaText: string;
  ctaLink: string;
  colorScheme: string;
}

const plans: MembershipPlan[] = [
  {
    id: "early",
    name: "Founder Fellow",
    tagline: "For early-stage & first-time founders building from 0 to 1.",
    price: "Free",
    period: "curated approval",
    popular: false,
    colorScheme: "border-slate-200 hover:border-slate-300",
    features: [
      "Access to city chapter meetups & demo nights",
      "Founders Connect Slack & WhatsApp private groups",
      "Directory of 500+ verified founders across India",
      "Weekly newsletter with curated grant & funding alerts",
      "Founders Connect open-source resource library",
      "Discounted entry to national flagship conferences",
    ],
    ctaText: "Apply as Fellow",
    ctaLink: "/register/founder",
  },
  {
    id: "growth",
    name: "Venture Member",
    badge: "Most Popular",
    tagline: "For funded or revenue-generating startups scaling rapidly.",
    price: "Curated",
    period: "invite or application",
    popular: true,
    colorScheme: "border-purple-400 ring-2 ring-purple-500/20 shadow-xl",
    features: [
      "Everything in Founder Fellow, plus:",
      "Direct 1-on-1 pitch access to 150+ active angels & VCs",
      "VIP access to SAIS deal rooms & investor mixers",
      "Personalized mentor pairing with 100+ domain experts",
      "$50,000+ perks (AWS, Stripe, Notion, HubSpot, Google Cloud)",
      "Co-working passes in Bangalore, Delhi, Mumbai, Pune",
      "Priority spotlight in FC newsletters & podcast features",
    ],
    ctaText: "Apply for Venture Membership",
    ctaLink: "/register/founder",
  },
  {
    id: "investor",
    name: "Angel & Syndicate Pass",
    tagline: "For angel investors, scouts, family offices, and emerging VCs.",
    price: "Accredited",
    period: "verified investors only",
    popular: false,
    colorScheme: "border-slate-200 hover:border-slate-300",
    features: [
      "Curated weekly deal flow matched to your investment thesis",
      "Exclusive access to SAIS pitch rooms & Bangalore activity tables",
      "Quarterly closed-door investor dinners & LP summits",
      "Direct founder intro without intermediary broker friction",
      "Co-investment syndication with top Tier-1 angel networks",
      "Full investor directory & portfolio performance tracking",
    ],
    ctaText: "Join as Investor",
    ctaLink: "/register/investor",
  },
];

const faqs = [
  {
    question: "What is the criteria to get approved as a Founder Fellow?",
    answer: "We review every application manually. We look for active founders working on a validated idea, an MVP, or an operational business. Whether you are bootstrapping or pre-seed, passion and high agency matter most.",
  },
  {
    question: "How does the mentor matching work?",
    answer: "Once accepted, our community operations team reviews your monthly bottlenecks (fundraising, tech stack, hiring, or GTM) and introduces you to 2 seasoned mentors with verified expertise in that domain.",
  },
  {
    question: "Are there any hidden fees or equity requirements?",
    answer: "No. Founders Connect takes 0% equity for standard membership. We believe in founder sovereignty and only charge a fair operational fee for specialized high-intensity cohorts.",
  },
  {
    question: "Can I attend city chapter events in multiple cities?",
    answer: "Yes! Your membership badge is valid across all active city communities including Bangalore, Mumbai, Delhi NCR, Hyderabad, Pune, Chennai, and Jaipur.",
  },
];

const BecomeAMember = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  useSEO({
    title: "Become a Member | Founders Connect Community",
    description: "Join India's most vibrant network of high-conviction founders, mentors, and venture capital investors. Apply for membership today.",
    keywords: "founder membership, startup community, founders connect member, angel network, investor community",
    ogType: "website",
    canonicalUrl: "https://founders.connect/become-a-member",
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-[#FAF7F0] bg-[radial-gradient(circle,#EFE9D8_1px,transparent_1px)] bg-[length:22px_22px] pt-8 pb-16 md:pt-12 md:pb-20 border-b border-[#1B1B1F]/10">
        <div className="container mx-auto px-4">
          <BackButton className="px-0 mx-0 max-w-none mb-6 animate-reveal-left" />

          <div className="max-w-3xl mx-auto text-center">
            <p className="mb-3 inline-flex items-center gap-2 font-['IBM_Plex_Mono'] text-xs font-semibold uppercase tracking-[0.22em] text-[#6B8F71]">
              <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-[#6B8F71]" />
              Exclusive Founder Network
            </p>
            <h1 className="font-['Space_Grotesk'] text-4xl sm:text-5xl font-extrabold tracking-tight text-[#1B1B1F]">
              Your Strategic Network in <span className="text-[#E4572E]">Scaling</span> Startups
            </h1>
            <p className="mt-4 text-base md:text-lg text-[#6B6558] max-w-2xl mx-auto leading-relaxed">
              Connect with ambitious builders, access warm investor intros, and collaborate with experienced operators.
            </p>
          </div>

          {/* Value Badges */}
          <div className="mt-8 flex flex-wrap justify-center items-center gap-6 text-xs md:text-sm font-medium text-slate-600">
            <span className="flex items-center gap-2">
              <ShieldCheck className="text-emerald-600" size={18} /> Verified Founder Community
            </span>
            <span className="flex items-center gap-2">
              <Zap className="text-amber-500" size={18} /> Direct Investor Deal Rooms
            </span>
            <span className="flex items-center gap-2">
              <Users className="text-purple-600" size={18} /> Regional City Chapters
            </span>
          </div>
        </div>
      </section>

      {/* Pricing / Tiers Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-extrabold text-slate-900 font-['Space_Grotesk']">
                Choose the Membership Tailored to Your Stage
              </h2>
              <p className="text-slate-600 text-sm md:text-base mt-2">
                Designed to support you whether you are drafting your first deck or scaling to Series A.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
              {plans.map((plan) => (
                <Card
                  key={plan.id}
                  className={`flex flex-col justify-between rounded-2xl bg-white transition-all duration-300 relative ${plan.colorScheme} ${
                    plan.popular ? "scale-105 z-10 bg-gradient-to-b from-purple-50/40 to-white" : ""
                  }`}
                >
                  {plan.badge && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                      <Badge className="bg-purple-600 text-white font-semibold text-xs px-3 py-1 shadow-md">
                        <Sparkles size={12} className="mr-1" /> {plan.badge}
                      </Badge>
                    </div>
                  )}

                  <CardContent className="p-8">
                    <h3 className="font-['Space_Grotesk'] text-2xl font-bold text-slate-900">
                      {plan.name}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 min-h-[32px]">{plan.tagline}</p>

                    <div className="mt-6 mb-6 pb-6 border-b border-slate-100">
                      <div className="flex items-baseline gap-2">
                        <span className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-['Space_Grotesk']">
                          {plan.price}
                        </span>
                        <span className="text-xs text-slate-500 font-medium">/ {plan.period}</span>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Included Benefits</p>
                      {plan.features.map((feature, idx) => (
                        <div key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700">
                          <Check size={16} className="text-emerald-600 flex-shrink-0 mt-0.5" />
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>

                  <div className="p-8 pt-0">
                    <Button
                      asChild
                      className={`w-full rounded-xl py-6 font-semibold transition-all ${
                        plan.popular
                          ? "btn-metallic btn-metallic-purple text-white shadow-lg shadow-purple-500/25"
                          : "bg-slate-900 hover:bg-slate-800 text-white"
                      }`}
                    >
                      <Link to={plan.ctaLink} className="flex items-center justify-center gap-2">
                        {plan.ctaText}
                        <ArrowRight size={16} />
                      </Link>
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Member Testimonial / Perks Highlights */}
      <section className="py-16 bg-slate-900 text-white">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
            <div className="p-6 rounded-xl bg-slate-800/60 border border-slate-700/60">
              <Award className="text-amber-400 mb-3 mx-auto md:mx-0" size={32} />
              <h4 className="text-lg font-bold font-['Space_Grotesk'] text-white">Direct Investor Intros</h4>
              <p className="text-xs sm:text-sm text-slate-400 mt-2">
                Curated introductions to accredited angel investors, family offices, and venture capital partners.
              </p>
            </div>
            <div className="p-6 rounded-xl bg-slate-800/60 border border-slate-700/60">
              <TrendingUp className="text-purple-400 mb-3 mx-auto md:mx-0" size={32} />
              <h4 className="text-lg font-bold font-['Space_Grotesk'] text-white">Curated City Chapters</h4>
              <p className="text-xs sm:text-sm text-slate-400 mt-2">
                Private in-person founder meetups, demo days, and co-working sessions across active Indian startup hubs.
              </p>
            </div>
            <div className="p-6 rounded-xl bg-slate-800/60 border border-slate-700/60">
              <Sparkles className="text-emerald-400 mb-3 mx-auto md:mx-0" size={32} />
              <h4 className="text-lg font-bold font-['Space_Grotesk'] text-white">Cloud & Tool Perks</h4>
              <p className="text-xs sm:text-sm text-slate-400 mt-2">
                Access to partner cloud credits, payment processing credits, and dev tool perks for accepted founders.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-white border-t border-slate-100">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-extrabold text-slate-900 font-['Space_Grotesk']">
              Frequently Asked Questions
            </h2>
            <p className="text-slate-600 text-sm mt-2">Everything you need to know about joining Founders Connect.</p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="border border-slate-200 rounded-xl overflow-hidden transition-all bg-white"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="w-full flex items-center justify-between p-5 text-left font-semibold text-slate-900 hover:text-purple-600 transition-colors"
                >
                  <span className="text-sm sm:text-base font-['Space_Grotesk']">{faq.question}</span>
                  <HelpCircle
                    size={18}
                    className={`text-slate-400 transition-transform ${openFaq === index ? "rotate-180 text-purple-600" : ""}`}
                  />
                </button>
                {openFaq === index && (
                  <div className="px-5 pb-5 text-xs sm:text-sm text-slate-600 border-t border-slate-100 pt-3 leading-relaxed">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <p className="text-sm text-slate-600 mb-4">Have custom partnership inquiries or sponsor queries?</p>
            <Button asChild variant="outline" className="border-slate-300 hover:bg-slate-50">
              <Link to="/contact-us">Contact our Community Team</Link>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default BecomeAMember;
