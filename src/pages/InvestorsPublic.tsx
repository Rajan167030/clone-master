import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BackButton from "@/components/BackButton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useSEO } from "@/hooks/useSEO";
import { Clock, ArrowRight, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { DetailedProfileModal, PremiumProfileCard } from "@/components/ProfileShowcaseCard";
import { getPublicSpeakerInvestorProfilesApi, type SpeakerInvestorProfile } from "@/lib/api";

const InvestorsPublic = () => {
  const [investors, setInvestors] = useState<SpeakerInvestorProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedInvestor, setSelectedInvestor] = useState<SpeakerInvestorProfile | null>(null);

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
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 sm:gap-6 justify-items-center">
              {investors.map((inv) => (
                <PremiumProfileCard
                  key={inv._id || inv.slug}
                  profile={inv}
                  photoUrl={inv.photoUrl}
                  photoAlt={inv.photoAlt || inv.name}
                  fallbackLabel="Independent Investor"
                  accent="indigo"
                  onCardClick={() => setSelectedInvestor(inv)}
                />
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
                <Button asChild className="bg-purple-600 hover:bg-purple-700 text-white px-6">
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
            <Button asChild className="bg-purple-600 hover:bg-purple-700 text-white px-6">
              <Link to="/register/investor">Register as an Investor</Link>
            </Button>
            <Button asChild variant="outline" className="border-slate-300">
              <Link to="/contact-us">Contact Investor Relations</Link>
            </Button>
          </div>
        </div>
      </section>

      <Footer />

      {selectedInvestor && (
        <DetailedProfileModal
          profile={selectedInvestor}
          photoUrl={selectedInvestor.photoUrl}
          onClose={() => setSelectedInvestor(null)}
        />
      )}
    </div>
  );
};

export default InvestorsPublic;
