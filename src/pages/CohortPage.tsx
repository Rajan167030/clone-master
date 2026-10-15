import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BackButton from "@/components/BackButton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useSEO } from "@/hooks/useSEO";
import {
  Rocket,
  ShoppingBag,
  Clock,
  ArrowRight,
  Sparkles,
  Calendar,
  CheckCircle2,
  Bell,
} from "lucide-react";
import { Link } from "react-router-dom";

const CohortPage = () => {
  useSEO({
    title: "Cohorts & Programs | Founders Connect",
    description: "Founders Connect cohort programs for early-stage tech startups and D2C brands. Join the waitlist for upcoming cohort announcements.",
    keywords: "startup accelerator, D2C cohort, founder bootcamp, startup program India, early stage cohort",
    ogType: "website",
    canonicalUrl: "https://founders.connect/cohorts",
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Header */}
      <section className="relative overflow-hidden bg-[#FAF7F0] bg-[radial-gradient(circle,#EFE9D8_1px,transparent_1px)] bg-[length:22px_22px] pt-8 pb-16 md:pt-12 md:pb-20 border-b border-[#1B1B1F]/10">
        <div className="container mx-auto px-4">
          <BackButton className="px-0 mx-0 max-w-none mb-6 animate-reveal-left" />

          <div className="max-w-3xl mx-auto text-center">
            <p className="mb-3 inline-flex items-center gap-2 font-['IBM_Plex_Mono'] text-xs font-semibold uppercase tracking-[0.22em] text-[#6B8F71]">
              <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-[#6B8F71]" />
              Accelerator Programs
            </p>
            <h1 className="font-['Space_Grotesk'] text-4xl sm:text-5xl font-extrabold tracking-tight text-[#1B1B1F]">
              Founders Connect <span className="text-[#E4572E]">Cohorts</span>
            </h1>
            <p className="mt-4 text-base md:text-lg text-[#6B6558] max-w-2xl mx-auto leading-relaxed">
              High-intensity, structured accelerator cohorts designed to take early-stage founders and D2C brands from validation to scale with capital, operator mentorship, and community.
            </p>
          </div>
        </div>
      </section>

      {/* Coming Soon Showcase */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center py-14 px-6 sm:px-12 rounded-3xl bg-slate-50 border border-slate-200 shadow-sm">
            <div className="w-16 h-16 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center mx-auto mb-5 shadow-sm">
              <Clock size={32} />
            </div>

            <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-100 border-none px-3.5 py-1 text-xs mb-3 font-semibold">
              Coming Soon
            </Badge>

            <h2 className="text-2xl sm:text-3xl font-extrabold font-['Space_Grotesk'] text-slate-900 leading-snug">
              Accelerator Cohorts Launching Soon
            </h2>

            <p className="text-sm sm:text-base text-slate-600 mt-4 leading-relaxed max-w-xl mx-auto">
              We are finalizing the curriculum, mentor lineup, and partner funds for our upcoming Startup and D2C accelerator programs. Applications will open shortly.
            </p>

            {/* Upcoming Cohort Tracks Preview */}
            <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
              <div id="startup-cohorts" className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
                    <Rocket size={20} />
                  </div>
                  <div>
                    <h3 className="font-['Space_Grotesk'] font-bold text-slate-900 text-base">
                      Tech & SaaS Startup Cohort
                    </h3>
                    <p className="text-xs text-slate-500">For early-stage tech founders</p>
                  </div>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Focusing on PMF validation, technical architecture, B2B enterprise sales pipelines, and investor readiness.
                </p>
                <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-purple-600">
                  <span>Applications Opening Soon</span>
                  <span className="text-[11px] bg-purple-50 px-2 py-0.5 rounded border border-purple-200">Waitlist Open</span>
                </div>
              </div>

              <div id="d2c" className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center">
                    <ShoppingBag size={20} />
                  </div>
                  <div>
                    <h3 className="font-['Space_Grotesk'] font-bold text-slate-900 text-base">
                      D2C Launchpad Cohort
                    </h3>
                    <p className="text-xs text-slate-500">For consumer brand builders</p>
                  </div>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Focusing on unit economics, repeat customer cohorts, omnichannel retail distribution, and brand positioning.
                </p>
                <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-purple-600">
                  <span>Applications Opening Soon</span>
                  <span className="text-[11px] bg-purple-50 px-2 py-0.5 rounded border border-purple-200">Waitlist Open</span>
                </div>
              </div>
            </div>

            <div id="upcoming" className="mt-10 flex flex-wrap gap-4 justify-center">
              <Button asChild className="btn-metallic btn-metallic-purple text-white px-6">
                <Link to="/join-us">
                  Join Waitlist & Get Notified <ArrowRight size={16} className="ml-2" />
                </Link>
              </Button>
              <Button asChild variant="outline" className="border-slate-300">
                <Link to="/get-funding">Explore Funding Programs</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Program Benefits */}
      <section className="py-16 bg-[#FAF7F0] border-t border-slate-200">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <Badge className="mb-3 bg-purple-100 text-purple-700 border-none px-3 py-1 text-xs">
            Founder First
          </Badge>
          <h2 className="text-3xl font-extrabold text-slate-900 font-['Space_Grotesk']">
            Zero Equity. Pure Value.
          </h2>
          <p className="mt-3 text-slate-600 text-sm md:text-base max-w-2xl mx-auto leading-relaxed">
            Our upcoming cohorts will operate on a founder-friendly structure with hands-on operator office hours, pitch demo days, and cloud perk grants.
          </p>
          <div className="mt-6 flex flex-wrap gap-4 justify-center">
            <Button asChild className="btn-metallic btn-metallic-purple text-white px-6">
              <Link to="/contact-us">Inquire About Cohort Sponsorships</Link>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default CohortPage;
