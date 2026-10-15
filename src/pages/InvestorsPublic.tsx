import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BackButton from "@/components/BackButton";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useSEO } from "@/hooks/useSEO";
import {
  TrendingUp,
  Clock,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Users,
  Linkedin,
  Loader2,
  ExternalLink,
} from "lucide-react";
import { Link } from "react-router-dom";
import { getPublicSpeakerInvestorProfilesApi, type SpeakerInvestorProfile } from "@/lib/api";

const InvestorsPublic = () => {
  const [investors, setInvestors] = useState<SpeakerInvestorProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useSEO({
    title: "Investors Network | Founders Connect",
    description: "Connect with angel investors, family offices, and venture capital funds supporting high-growth founders across India.",
    keywords: "startup investors, angel investors, venture capital, seed funding India, angel network",
    ogType: "website",
    canonicalUrl: "https://founders.connect/investors",
  });

  useEffect(() => {
    let active = true;
    getPublicSpeakerInvestorProfilesApi()
      .then((res) => {
        if (!active) return;
        const realInvestors = (res.profiles || []).filter(
          (p) => p.category === "investor" && p.isActive !== false
        );
        setInvestors(realInvestors);
      })
      .catch(() => {
        if (active) setInvestors([]);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

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
              Capital Network
            </p>
            <h1 className="font-['Space_Grotesk'] text-4xl sm:text-5xl font-extrabold tracking-tight text-[#1B1B1F]">
              Investors Backing <span className="text-[#E4572E]">Bold</span> Founders
            </h1>
            <p className="mt-4 text-base md:text-lg text-[#6B6558] max-w-2xl mx-auto leading-relaxed">
              Connect with high-conviction angels, syndicate leads, and micro VCs investing in early-stage startups across India.
            </p>
          </div>
        </div>
      </section>

      {/* Main Content Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 max-w-6xl">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <Loader2 className="h-8 w-8 animate-spin text-purple-600 mb-4" />
              <p className="text-sm text-slate-500">Loading verified investors from database...</p>
            </div>
          ) : investors.length > 0 ? (
            /* Real Investors from Database */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {investors.map((inv) => (
                <Card
                  key={inv._id || inv.slug}
                  className="rounded-2xl border-slate-200 overflow-hidden hover:border-purple-300 hover:shadow-lg transition-all bg-white flex flex-col justify-between"
                >
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4 mb-4">
                      {inv.photoUrl ? (
                        <img
                          src={inv.photoUrl}
                          alt={inv.name}
                          className="h-14 w-14 rounded-full object-cover border border-slate-100"
                        />
                      ) : (
                        <div className="h-14 w-14 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 text-white font-bold flex items-center justify-center text-lg">
                          {inv.name.charAt(0)}
                        </div>
                      )}
                      <div>
                        <h3 className="font-['Space_Grotesk'] font-bold text-slate-900 text-base">
                          {inv.name}
                        </h3>
                        <p className="text-xs text-purple-600 font-medium">{inv.designation}</p>
                        {inv.company && (
                          <p className="text-xs text-slate-500">{inv.company}</p>
                        )}
                      </div>
                    </div>

                    {inv.summary && (
                      <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed mb-4">
                        {inv.summary}
                      </p>
                    )}

                    {inv.linkedinUrl && (
                      <a
                        href={inv.linkedinUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-purple-600 transition-colors"
                      >
                        <Linkedin size={14} /> View LinkedIn
                      </a>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            /* Coming Soon State (When DB has no profiles yet) */
            <div className="max-w-2xl mx-auto text-center py-12 px-6 rounded-3xl bg-slate-50 border border-slate-200 shadow-sm">
              <div className="w-14 h-14 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center mx-auto mb-4">
                <Clock size={28} />
              </div>
              <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-100 border-none px-3 py-1 text-xs mb-3">
                Coming Soon
              </Badge>
              <h2 className="text-2xl sm:text-3xl font-bold font-['Space_Grotesk'] text-slate-900">
                Verified Investor Directory Launching Soon
              </h2>
              <p className="text-sm text-slate-600 mt-3 leading-relaxed max-w-lg mx-auto">
                We are actively onboarding and verifying top angel investors, family offices, and institutional VCs into our platform directory.
              </p>

              <div className="mt-8 flex flex-wrap gap-3 justify-center">
                <Button asChild className="btn-metallic btn-metallic-purple text-white px-6">
                  <Link to="/register/investor">
                    Apply to Join as an Investor <ArrowRight size={16} className="ml-2" />
                  </Link>
                </Button>
                <Button asChild variant="outline" className="border-slate-300">
                  <Link to="/get-funding">Apply for Pitch / Funding</Link>
                </Button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Verified Syndicate Info */}
      <section className="py-16 bg-[#FAF7F0] border-t border-slate-200">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <Badge className="mb-3 bg-emerald-100 text-emerald-800 border-none px-3 py-1 text-xs">
            Direct Founder Access
          </Badge>
          <h2 className="text-3xl font-extrabold text-slate-900 font-['Space_Grotesk']">
            Are You an Active Investor?
          </h2>
          <p className="mt-3 text-slate-600 text-sm md:text-base max-w-2xl mx-auto">
            Get access to curated weekly deal flow matched to your sector thesis, private pitch room recordings, and SAIS showcase events.
          </p>
          <div className="mt-6 flex flex-wrap gap-4 justify-center">
            <Button asChild className="btn-metallic btn-metallic-purple text-white px-6">
              <Link to="/register/investor">Register as an Investor</Link>
            </Button>
            <Button asChild variant="outline" className="border-slate-300">
              <Link to="/contact-us">Contact Investor Relations</Link>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default InvestorsPublic;
