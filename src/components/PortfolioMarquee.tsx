import { useEffect, useState } from "react";
import { getPublicPartnersApi, type PartnerLogo } from "@/lib/api";

const companies = [
  "Base1 Gaming", "Digvets", "Flicka", "Purpled TV", "Punjabi Angithi",
  "CitizenChat", "Ride N Repair", "Ease My Edu", "Doc N Meds", "Taxida",
  "Everhome", "Fresh2All", "Edumayra", "Zappfresh", "Clensta",
  "Shiplog", "World Trail", "Unimart", "Tastes2Plate", "Klassroom",
  "Niramaya Soul", "Sepal", "Gravid", "Scoopman", "Hobit",
  "Flutrr", "StudyAtHome", "Green Farm Market", "MobiPay", "Burger Singh",
  "TalentGum", "2WheelR", "NSN Hotels", "Arza", "Trosvy",
  "Repestro", "100Krafts", "JJ Tax", "Physeek Fit", "Nextgen",
];

const PortfolioMarquee = () => {
  const [partners, setPartners] = useState<PartnerLogo[]>([]);

  useEffect(() => {
    getPublicPartnersApi()
      .then((response) => setPartners(response.partners || []))
      .catch(() => setPartners([]));
  }, []);

  const partnerItems = partners.length
    ? partners.map((partner) => ({
        key: partner._id,
        name: partner.name,
        logoUrl: partner.logoUrl,
        websiteUrl: partner.websiteUrl,
      }))
    : companies.map((name) => ({ key: name, name, logoUrl: "", websiteUrl: "" }));

  return (
    <section id="portfolio" className="py-24 border-t border-border relative">
      <div className="container mx-auto px-4 mb-12">
        <div className="text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-4">
            <span className="text-[11px] font-semibold uppercase tracking-widest text-primary">
              Portfolio
            </span>
          </div>
          <h2 className="font-heading font-bold text-4xl md:text-5xl text-foreground tracking-tight">
            Our <span className="text-gradient">Partners</span>
          </h2>
          <p className="text-muted-foreground mt-4">
            50+ funded companies building the future across industries.
          </p>
        </div>
      </div>

      <div className="relative overflow-hidden">
        <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />

        <div className="animate-marquee flex whitespace-nowrap">
          {[...partnerItems, ...partnerItems].map((partner, i) => {
            const content = (
              <div className="inline-flex items-center justify-center mx-3 px-7 py-4 rounded-xl border border-border card-gradient min-w-[180px] h-[72px] hover:border-primary/40 hover:shadow-lg transition-all cursor-pointer">
                {partner.logoUrl ? (
                  <img src={partner.logoUrl} alt={partner.name} className="max-h-10 w-auto object-contain" />
                ) : (
                  <span className="text-base md:text-xl font-semibold text-foreground">{partner.name}</span>
                )}
              </div>
            );

            return partner.websiteUrl ? (
              <a key={`${partner.key}-${i}`} href={partner.websiteUrl} target="_blank" rel="noreferrer">
                {content}
              </a>
            ) : (
              <div key={`${partner.key}-${i}`}>{content}</div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default PortfolioMarquee;
