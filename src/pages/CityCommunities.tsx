import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BackButton from "@/components/BackButton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useSEO } from "@/hooks/useSEO";
import {
  MapPin,
  Clock,
  ArrowRight,
  Sparkles,
  Users,
  Compass,
  CheckCircle2,
} from "lucide-react";
import { Link } from "react-router-dom";

const CityCommunities = () => {
  useSEO({
    title: "City Communities | Founders Connect",
    description: "Explore Founders Connect regional chapters and hyper-local city communities across India.",
    keywords: "city startup communities, founder meetups Bangalore, Delhi NCR startups, Mumbai founders, regional startup chapters",
    ogType: "website",
    canonicalUrl: "https://founders.connect/city-communities",
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
              Regional Ecosystem
            </p>
            <h1 className="font-['Space_Grotesk'] text-4xl sm:text-5xl font-extrabold tracking-tight text-[#1B1B1F]">
              Hyper-Local <span className="text-[#E4572E]">City Communities</span>
            </h1>
            <p className="mt-4 text-base md:text-lg text-[#6B6558] max-w-2xl mx-auto leading-relaxed">
              Bringing India's startup ecosystem closer through city-level nodes, private founder roundtables, and monthly demo mixers.
            </p>
          </div>
        </div>
      </section>

      {/* Coming Soon Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="text-center py-14 px-6 sm:px-10 rounded-3xl bg-slate-50 border border-slate-200 shadow-sm">
            <div className="w-16 h-16 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center mx-auto mb-5 shadow-sm">
              <Clock size={32} />
            </div>

            <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-100 border-none px-3.5 py-1 text-xs mb-3 font-semibold">
              Coming Soon
            </Badge>

            <h2 className="text-2xl sm:text-3xl font-extrabold font-['Space_Grotesk'] text-slate-900 leading-snug">
              City Chapter Directory Launching Soon
            </h2>

            <p className="text-sm sm:text-base text-slate-600 mt-4 leading-relaxed max-w-xl mx-auto">
              We are currently establishing verified chapter leads, event venue partnerships, and local working groups across tier-1 and tier-2 startup hubs.
            </p>

            <div className="mt-8 pt-8 border-t border-slate-200/80 max-w-md mx-auto grid grid-cols-1 sm:grid-cols-2 gap-3 text-left text-xs sm:text-sm text-slate-700">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                <span>Monthly Closed Dinners</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                <span>Local Investor Mixers</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                <span>Co-working Days</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                <span>Cross-City Travel Pass</span>
              </div>
            </div>

            <div className="mt-10 flex flex-wrap gap-4 justify-center">
              <Button asChild className="btn-metallic btn-metallic-purple text-white px-6">
                <Link to="/contact-us">
                  Apply to Lead a City Chapter <ArrowRight size={16} className="ml-2" />
                </Link>
              </Button>
              <Button asChild variant="outline" className="border-slate-300">
                <Link to="/chapters">Explore National Chapters</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Chapter Lead Callout */}
      <section className="py-16 bg-[#FAF7F0] border-t border-slate-200">
        <div className="container mx-auto px-4 max-w-3xl text-center">
          <Badge className="mb-3 bg-purple-100 text-purple-700 border-none px-3 py-1 text-xs">
            Community Leadership
          </Badge>
          <h2 className="text-3xl font-extrabold text-slate-900 font-['Space_Grotesk']">
            Want to Champion Your City?
          </h2>
          <p className="mt-3 text-slate-600 text-sm md:text-base leading-relaxed">
            We empower local ecosystem builders with event playbooks, sponsor access, speaker rosters, and platform support.
          </p>
          <div className="mt-6 flex flex-wrap gap-4 justify-center">
            <Button asChild className="btn-metallic btn-metallic-purple text-white px-6">
              <Link to="/contact-us">Get in Touch with Community Team</Link>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default CityCommunities;
