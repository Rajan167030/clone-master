import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BackButton from "@/components/BackButton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useSEO } from "@/hooks/useSEO";
import {
  FileText,
  Clock,
  ArrowRight,
  BookOpen,
  DollarSign,
  ShieldCheck,
  TrendingUp,
  CheckCircle2,
} from "lucide-react";
import { Link } from "react-router-dom";

const StartupResources = () => {
  useSEO({
    title: "Startup Resources & Founder Toolkits | Founders Connect",
    description: "Curated founder playbooks, pitch deck templates, cap table calculators, and legal frameworks coming soon on Founders Connect.",
    keywords: "startup resources, pitch deck template, cap table spreadsheet, term sheet guide, founder playbook",
    ogType: "website",
    canonicalUrl: "https://founders.connect/startup-resources",
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
              Founder Toolkits
            </p>
            <h1 className="font-['Space_Grotesk'] text-4xl sm:text-5xl font-extrabold tracking-tight text-[#1B1B1F]">
              Startup <span className="text-[#E4572E]">Resources</span>
            </h1>
            <p className="mt-4 text-base md:text-lg text-[#6B6558] max-w-2xl mx-auto leading-relaxed">
              Curated, battle-tested templates, legal checklists, financial models, and operational frameworks to help founders navigate early stage hurdles.
            </p>
          </div>
        </div>
      </section>

      {/* Coming Soon Section */}
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
              Curated Founder Library Launching Soon
            </h2>

            <p className="text-sm sm:text-base text-slate-600 mt-4 leading-relaxed max-w-xl mx-auto">
              We are assembling and verifying open-source tools with legal partners, venture associates, and operators so you get accurate, production-ready resources.
            </p>

            {/* Upcoming Toolkits Preview */}
            <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-left">
              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
                <DollarSign className="text-emerald-600 mb-2" size={20} />
                <h4 className="font-bold text-sm text-slate-900 font-['Space_Grotesk']">Fundraising Kit</h4>
                <p className="text-xs text-slate-500 mt-1">Cap table models, seed pitch deck templates, and SAFE agreement guides.</p>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
                <ShieldCheck className="text-blue-600 mb-2" size={20} />
                <h4 className="font-bold text-sm text-slate-900 font-['Space_Grotesk']">Legal & Compliance</h4>
                <p className="text-xs text-slate-500 mt-1">Pvt Ltd incorporation checklists, founder vesting agreements, and IP assignment.</p>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
                <TrendingUp className="text-purple-600 mb-2" size={20} />
                <h4 className="font-bold text-sm text-slate-900 font-['Space_Grotesk']">GTM & Sales Playbooks</h4>
                <p className="text-xs text-slate-500 mt-1">First 10 customers outbound cadence, ICP validation matrix, and PMF surveys.</p>
              </div>
            </div>

            <div className="mt-10 flex flex-wrap gap-4 justify-center">
              <Button asChild className="btn-metallic btn-metallic-purple text-white px-6">
                <Link to="/contact-us">
                  Request a Resource or Template <ArrowRight size={16} className="ml-2" />
                </Link>
              </Button>
              <Button asChild variant="outline" className="border-slate-300">
                <Link to="/get-funding">Explore Funding Programs</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Community Contribution CTA */}
      <section className="py-16 bg-[#FAF7F0] border-t border-slate-200">
        <div className="container mx-auto px-4 max-w-3xl text-center">
          <Badge className="mb-3 bg-purple-100 text-purple-700 border-none px-3 py-1 text-xs">
            Open Source
          </Badge>
          <h2 className="text-3xl font-extrabold text-slate-900 font-['Space_Grotesk']">
            Want to Share a Founder Tool or Playbook?
          </h2>
          <p className="mt-3 text-slate-600 text-sm md:text-base leading-relaxed">
            If you have built an open-source model, hiring scorecard, or template that helped your startup, share it with our founder community.
          </p>
          <div className="mt-6 flex flex-wrap gap-4 justify-center">
            <Button asChild className="btn-metallic btn-metallic-purple text-white px-6">
              <Link to="/contact-us">Submit a Resource</Link>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default StartupResources;
