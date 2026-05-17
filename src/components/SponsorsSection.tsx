import { useEffect, useState } from "react";
import { getPublicPartnersApi, type PartnerLogo } from "@/lib/api";
import { Handshake, ArrowUpRight } from "lucide-react";

// Fallback high-premium tech ecosystem sponsors to show when DB is empty
const fallbackSponsors: Array<Partial<PartnerLogo> & { _id: string }> = [
  {
    _id: "sponsor-1",
    name: "Google Cloud",
    logoUrl: "https://upload.wikimedia.org/wikipedia/commons/5/51/Google_Cloud_logo.svg",
    websiteUrl: "https://cloud.google.com",
    logoWidth: "160px",
    logoHeight: "auto",
    isActive: true,
  },
  {
    _id: "sponsor-2",
    name: "Amazon Web Services",
    logoUrl: "https://upload.wikimedia.org/wikipedia/commons/9/93/Amazon_Web_Services_Logo.svg",
    websiteUrl: "https://aws.amazon.com",
    logoWidth: "100px",
    logoHeight: "auto",
    isActive: true,
  },
  {
    _id: "sponsor-3",
    name: "Microsoft",
    logoUrl: "https://upload.wikimedia.org/wikipedia/commons/9/96/Microsoft_logo_%282012%29.svg",
    websiteUrl: "https://microsoft.com",
    logoWidth: "150px",
    logoHeight: "auto",
    isActive: true,
  },
  {
    _id: "sponsor-4",
    name: "Stripe",
    logoUrl: "https://upload.wikimedia.org/wikipedia/commons/b/ba/Stripe_Logo%2C_revised_2016.svg",
    websiteUrl: "https://stripe.com",
    logoWidth: "110px",
    logoHeight: "auto",
    isActive: true,
  },
  {
    _id: "sponsor-5",
    name: "GitHub",
    logoUrl: "https://upload.wikimedia.org/wikipedia/commons/c/c2/GitHub_Logo.svg",
    websiteUrl: "https://github.com",
    logoWidth: "100px",
    logoHeight: "auto",
    isActive: true,
  },
  {
    _id: "sponsor-6",
    name: "HDFC Bank",
    logoUrl: "https://upload.wikimedia.org/wikipedia/commons/2/28/HDFC_Bank_Logo.svg",
    websiteUrl: "https://hdfcbank.com",
    logoWidth: "120px",
    logoHeight: "auto",
    isActive: true,
  }
];

const SponsorsSection = ({ className }: { className?: string }) => {
  const [sponsors, setSponsors] = useState<PartnerLogo[]>([]);

  useEffect(() => {
    let isMounted = true;
    getPublicPartnersApi()
      .then((response) => {
        if (!isMounted) return;
        const sponsorsOnly = (response.partners || []).filter(
          (p) => p.category === "sponsor" && p.isActive
        );
        setSponsors(sponsorsOnly);
      })
      .catch(() => {
        if (!isMounted) return;
        setSponsors([]);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  const displaySponsors = sponsors.length > 0 ? sponsors : (fallbackSponsors as PartnerLogo[]);

  return (
    <section className={`py-16 sm:py-20 md:py-28 relative overflow-hidden bg-gradient-to-b from-background via-purple-50/5 to-background border-t border-purple-100/30 ${className}`}>
      {/* Background glow effects */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-72 h-72 rounded-full bg-purple-200/10 blur-[100px] pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 -translate-y-1/2 w-80 h-80 rounded-full bg-violet-200/10 blur-[120px] pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12 md:mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-50 border border-purple-200/60 mb-4 shadow-sm">
            <Handshake className="h-4 w-4 text-purple-600 animate-pulse" />
            <span className="text-[10px] md:text-[11px] font-bold uppercase tracking-widest text-purple-600">
              Partners & Supporters
            </span>
          </div>
          <h2 className="font-heading font-bold text-3xl sm:text-4xl md:text-5xl text-slate-900 tracking-tight leading-tight">
            Our Proud <span className="text-gradient">Sponsors</span>
          </h2>
          <p className="text-sm sm:text-base text-slate-500 mt-4 max-w-lg mx-auto">
            Empowering the next generation of founders and investors with resources, cloud infra, and networks.
          </p>
        </div>

        {/* Sponsor Grid */}
        <div className="mx-auto max-w-5xl">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-6 justify-center items-center">
            {displaySponsors.map((sponsor) => {
              const cardContent = (
                <div className="group relative flex flex-col justify-center items-center p-6 h-28 rounded-2xl border border-slate-100 bg-white shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all duration-300 hover:-translate-y-1 hover:border-purple-200 hover:shadow-[0_12px_24px_-8px_rgba(147,51,234,0.15)] hover:bg-white cursor-pointer overflow-hidden">
                  {/* Subtle top purple border line on hover */}
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-indigo-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />

                  {sponsor.logoUrl ? (
                    <img
                      src={sponsor.logoUrl}
                      alt={sponsor.name}
                      style={{
                        width: sponsor.logoWidth || "auto",
                        height: sponsor.logoHeight || "auto",
                      }}
                      className="max-h-12 max-w-[85%] object-contain opacity-75 grayscale transition-all duration-300 group-hover:opacity-100 group-hover:grayscale-0"
                    />
                  ) : (
                    <span className="text-sm font-semibold text-slate-700 tracking-wide text-center line-clamp-2 group-hover:text-purple-600">
                      {sponsor.name}
                    </span>
                  )}

                  {/* Corner indicator */}
                  {sponsor.websiteUrl && (
                    <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <ArrowUpRight className="h-3 w-3 text-purple-500" />
                    </div>
                  )}
                </div>
              );

              return sponsor.websiteUrl ? (
                <a
                  key={sponsor._id}
                  href={sponsor.websiteUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="block"
                >
                  {cardContent}
                </a>
              ) : (
                <div key={sponsor._id}>{cardContent}</div>
              );
            })}
          </div>

          {/* Become a Sponsor Callout */}
          <div className="mt-12 text-center">
            <a
              href="/partner-with-us"
              className="inline-flex items-center gap-2 text-xs font-semibold text-purple-600 hover:text-purple-700 hover:underline transition-colors"
            >
              Interested in sponsoring Founders Connect?
              <span className="inline-flex items-center justify-center rounded-full bg-purple-50 border border-purple-100 px-2 py-0.5 text-[9px] uppercase tracking-wider font-bold">
                Join Us
              </span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SponsorsSection;
