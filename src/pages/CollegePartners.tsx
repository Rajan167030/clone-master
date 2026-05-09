import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getPublicPartnersApi, type PartnerLogo } from "@/lib/api";
import { useSEO } from "@/hooks/useSEO";
import { GraduationCap, MapPin, Globe, Sparkles, Building2, Rocket } from "lucide-react";

const CollegePartners = () => {
  useSEO({
    title: "College Partners | Founders Connect",
    description: "Our network of prestigious college partners and E-Cells fostering innovation.",
  });

  const [partners, setPartners] = useState<PartnerLogo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPublicPartnersApi()
      .then((response) => {
        // Filter for college or ecell partners
        const filtered = response.partners.filter(
          (p) => p.category === "college" || p.category === "ecell"
        );
        setPartners(filtered);
      })
      .catch((error) => {
        console.error("Failed to load college partners:", error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const colleges = partners.filter(p => p.category === "college");
  const ecells = partners.filter(p => p.category === "ecell");

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-32 pb-20">
        <div className="pointer-events-none absolute -left-20 top-10 h-64 w-64 rounded-full bg-primary/5 blur-3xl" />
        <div className="pointer-events-none absolute -right-20 top-40 h-72 w-72 rounded-full bg-primary/5 blur-3xl" />
        
        <div className="container relative mx-auto px-4 text-center">
          <Badge variant="outline" className="mb-4 gap-1 px-4 py-1 text-primary border-primary/20 bg-primary/5">
            <Sparkles size={14} /> Ecosystem Partners
          </Badge>
          <h1 className="font-heading text-4xl font-extrabold tracking-tight md:text-6xl">
            Empowering <span className="text-primary italic">Campus</span> Entrepreneurs
          </h1>
          <p className="mt-6 mx-auto max-w-2xl text-lg text-muted-foreground md:text-xl">
            We partner with India&apos;s leading institutions and E-Cells to nurture the next generation of founders at the grassroots level.
          </p>
        </div>
      </section>

      {/* College Partners Grid */}
      <section className="py-16 bg-secondary/20">
        <div className="container mx-auto px-4">
          <div className="mb-12 flex items-center justify-between border-b pb-6">
            <div>
              <h2 className="text-3xl font-bold flex items-center gap-3">
                <GraduationCap className="text-primary" size={32} /> University Partners
              </h2>
              <p className="text-muted-foreground mt-2">Integrating entrepreneurship into academic excellence.</p>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-5">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-32 rounded-xl bg-muted/50 animate-pulse" />
              ))}
            </div>
          ) : colleges.length > 0 ? (
            <div className="grid grid-cols-2 gap-8 md:grid-cols-3 lg:grid-cols-5">
              {colleges.map((partner) => (
                <div key={partner._id} className="flex flex-col items-center justify-center group hover:opacity-80 transition-opacity">
                  {partner.logoUrl ? (
                    <img
                      src={partner.logoUrl}
                      alt={partner.name}
                      style={{
                        width: partner.logoWidth || "auto",
                        height: partner.logoHeight || "auto",
                      }}
                      className="object-contain transition-transform group-hover:scale-110"
                    />
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <Building2 size={32} strokeWidth={1.5} />
                      <span className="text-center text-sm text-xs italic font-medium">{partner.name}</span>
                    </div>
                  )}
                  {partner.websiteUrl && (
                    <a
                      href={partner.websiteUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-2 text-xs text-primary opacity-0 group-hover:opacity-100 transition-opacity underline flex items-center gap-1"
                    >
                       <Globe size={10} /> Visit
                    </a>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 rounded-2xl border-2 border-dashed bg-muted/20">
              <p className="text-muted-foreground">No college partners listed yet. Check back soon!</p>
            </div>
          )}
        </div>
      </section>

      {/* E-Cell Partners Grid */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="mb-12 flex items-center justify-between border-b pb-6">
            <div>
              <h2 className="text-3xl font-bold flex items-center gap-3">
                <Rocket className="text-primary" size={32} /> E-Cell Collaborations
              </h2>
              <p className="text-muted-foreground mt-2">Active partnerships with student-led entrepreneurship bodies.</p>
            </div>
          </div>

          {loading ? (
             <div className="grid grid-cols-2 gap-6 md:grid-cols-4 lg:grid-cols-6">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-24 rounded-lg bg-muted/50 animate-pulse" />
                ))}
             </div>
          ) : ecells.length > 0 ? (
            <div className="grid grid-cols-2 gap-6 md:grid-cols-4 lg:grid-cols-6">
              {ecells.map((partner) => (
                <a 
                  key={partner._id}
                  href={partner.websiteUrl || "#"}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center transition-all hover:opacity-80 group"
                >
                  {partner.logoUrl ? (
                    <img
                      src={partner.logoUrl}
                      alt={partner.name}
                      style={{
                        width: partner.logoWidth || "auto",
                        height: partner.logoHeight || "auto",
                      }}
                      className="object-contain grayscale group-hover:grayscale-0 transition-all"
                    />
                  ) : (
                    <span className="text-center text-sm font-semibold text-muted-foreground">{partner.name}</span>
                  )}
                </a>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 rounded-2xl border-2 border-dashed bg-muted/20">
              <p className="text-muted-foreground">E-Cell partners will appear here soon.</p>
            </div>
          )}
        </div>
      </section>

      {/* Join as Partner CTA */}
      <section className="container mx-auto px-4 pb-24">
        <Card className="bg-gradient-primary border-none text-primary-foreground overflow-hidden">
          <div className="relative px-8 py-12 text-center md:py-20">
            <div className="pointer-events-none absolute -left-10 top-0 h-40 w-40 rounded-full bg-white/10 blur-3xl" />
            <div className="pointer-events-none absolute -right-10 bottom-0 h-40 w-40 rounded-full bg-white/10 blur-3xl" />
            
            <h2 className="text-3xl font-bold md:text-4xl">Partner with Founders Connect</h2>
            <p className="mt-4 mx-auto max-w-xl text-primary-foreground/80">
              Want to bring the Founders Connect ecosystem to your campus? Let&apos;s build the future together.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <a href="/partner-with-us">
                <Button variant="secondary" size="lg" className="px-8">
                  Get in Touch
                </Button>
              </a>
            </div>
          </div>
        </Card>
      </section>

      <Footer />
    </div>
  );
};

export default CollegePartners;
