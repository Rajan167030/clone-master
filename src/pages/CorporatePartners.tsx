import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BackButton from "@/components/BackButton";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useSEO } from "@/hooks/useSEO";
import {
  Building2,
  Clock,
  ArrowRight,
  Handshake,
  Loader2,
  ExternalLink,
} from "lucide-react";
import { Link } from "react-router-dom";
import { getPublicPartnersApi, type PartnerLogo } from "@/lib/api";

const CorporatePartners = () => {
  const [partners, setPartners] = useState<PartnerLogo[]>([]);
  const [loading, setLoading] = useState(true);

  useSEO({
    title: "Corporate Partners | Founders Connect",
    description: "Partner with Founders Connect to connect with top tech startups, drive innovation pilots, and support entrepreneurship across India.",
    keywords: "corporate startup partnerships, open innovation, startup pilot programs, corporate sponsors India",
    ogType: "website",
    canonicalUrl: "https://founders.connect/corporate-partners",
  });

  useEffect(() => {
    let active = true;
    getPublicPartnersApi()
      .then((res) => {
        if (!active) return;
        setPartners(res.partners || []);
      })
      .catch(() => {
        if (active) setPartners([]);
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
              Enterprise & Ecosystem
            </p>
            <h1 className="font-['Space_Grotesk'] text-4xl sm:text-5xl font-extrabold tracking-tight text-[#1B1B1F]">
              Corporate <span className="text-[#E4572E]">Partners</span>
            </h1>
            <p className="mt-4 text-base md:text-lg text-[#6B6558] max-w-2xl mx-auto leading-relaxed">
              Collaborating with enterprise leaders to bridge high-growth startups with corporate innovation programs, pilot trials, and cloud infrastructure.
            </p>
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 max-w-6xl">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <Loader2 className="h-8 w-8 animate-spin text-purple-600 mb-4" />
              <p className="text-sm text-slate-500">Checking verified partners from database...</p>
            </div>
          ) : partners.length > 0 ? (
            /* Real Partners from Database */
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
              {partners.map((partner) => (
                <Card
                  key={partner._id}
                  className="rounded-2xl border-slate-200 overflow-hidden hover:border-purple-300 hover:shadow-md transition-all bg-white flex flex-col items-center justify-center p-6 text-center"
                >
                  {partner.imageUrl ? (
                    <img
                      src={partner.imageUrl}
                      alt={partner.name}
                      className="h-16 w-auto max-w-[140px] object-contain mb-3"
                    />
                  ) : (
                    <div className="h-14 w-14 rounded-xl bg-purple-100 text-purple-700 font-bold flex items-center justify-center mb-3">
                      {partner.name.charAt(0)}
                    </div>
                  )}
                  <h3 className="font-['Space_Grotesk'] font-bold text-sm text-slate-900">
                    {partner.name}
                  </h3>
                  {partner.websiteUrl && (
                    <a
                      href={partner.websiteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 text-xs text-purple-600 inline-flex items-center gap-1 hover:underline"
                    >
                      Visit Website <ExternalLink size={12} />
                    </a>
                  )}
                </Card>
              ))}
            </div>
          ) : (
            /* Coming Soon State (No fake data) */
            <div className="max-w-2xl mx-auto text-center py-12 px-6 rounded-3xl bg-slate-50 border border-slate-200 shadow-sm">
              <div className="w-14 h-14 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center mx-auto mb-4">
                <Clock size={28} />
              </div>
              <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-100 border-none px-3 py-1 text-xs mb-3">
                Coming Soon
              </Badge>
              <h2 className="text-2xl sm:text-3xl font-bold font-['Space_Grotesk'] text-slate-900">
                Corporate Partnership Showcase Launching Soon
              </h2>
              <p className="text-sm text-slate-600 mt-3 leading-relaxed max-w-lg mx-auto">
                We are actively finalizing official partner agreements and integration programs with leading tech enterprises, cloud infrastructure providers, and financial institutions.
              </p>

              <div className="mt-8 flex flex-wrap gap-3 justify-center">
                <Button asChild className="btn-metallic btn-metallic-purple text-white px-6">
                  <Link to="/partner-with-us">
                    Explore Partnership Opportunities <ArrowRight size={16} className="ml-2" />
                  </Link>
                </Button>
                <Button asChild variant="outline" className="border-slate-300">
                  <Link to="/contact-us">Contact Partnerships Team</Link>
                </Button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Partnership Inquiry CTA */}
      <section className="py-16 bg-[#FAF7F0] border-t border-slate-200">
        <div className="container mx-auto px-4 max-w-3xl text-center">
          <Badge className="mb-3 bg-purple-100 text-purple-700 border-none px-3 py-1 text-xs">
            Open Innovation
          </Badge>
          <h2 className="text-3xl font-extrabold text-slate-900 font-['Space_Grotesk']">
            Become a Corporate Partner
          </h2>
          <p className="mt-3 text-slate-600 text-sm md:text-base leading-relaxed">
            Gain direct access to vetted, high-trajectory startups across B2B SaaS, FinTech, DeepTech, and Consumer domains.
          </p>
          <div className="mt-6 flex flex-wrap gap-4 justify-center">
            <Button asChild className="btn-metallic btn-metallic-purple text-white px-6">
              <Link to="/partner-with-us">Submit Corporate Inquiry</Link>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default CorporatePartners;
