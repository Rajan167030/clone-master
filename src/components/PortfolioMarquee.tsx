import { useEffect, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ArrowUpRight, Handshake } from "lucide-react";
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

// Partner logos stored in Cloudinary (founders-connect/partners), shown until partners are added from the admin panel.
const CLOUDINARY_PARTNERS = "https://res.cloudinary.com/dbgsxczyi/image/upload/f_auto,q_auto,h_120/";
const partnerLogos = [
  { name: "IDFC FIRST Bank", path: "v1786960583/founders-connect/partners/deppxq3duea105fiewhf.png" },
  { name: "Scaler", path: "v1786960386/founders-connect/partners/jnrnhn63l9fi5plb0mqr.png" },
  { name: "Amity University", path: "v1786960463/founders-connect/partners/idoxynblnlzh8wgen2yh.png" },
  { name: "PW Institute of Innovation", path: "v1786960526/founders-connect/partners/pkga5thzs7la3lhaf3n5.jpg" },
  { name: "QNG", path: "v1786960656/founders-connect/partners/rneobtad3ue5ljskihrl.png" },
];

type PartnerItem = {
  key: string;
  name: string;
  logoUrl: string;
  websiteUrl: string;
};

type RowEntry = { kind: "partner"; item: PartnerItem } | { kind: "feature"; id: string };

const MIN_ITEMS_PER_ROW = 8;
const ROW_DURATIONS = [60, 72, 66];

const getInitials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

// Split partners across three rows, repeating short lists so every row fills the width.
const buildRows = (items: PartnerItem[]): PartnerItem[][] => {
  const rows: PartnerItem[][] = [[], [], []];
  items.forEach((item, index) => rows[index % 3].push(item));
  return rows.map((row) => {
    if (!row.length) return row;
    const filled = [...row];
    while (filled.length < MIN_ITEMS_PER_ROW) filled.push(...row);
    return filled;
  });
};

// One highlight card per row, placed a couple of slots in.
const withFeature = (row: PartnerItem[], featureId: string, position: number): RowEntry[] => {
  const entries: RowEntry[] = row.map((item) => ({ kind: "partner", item }));
  entries.splice(Math.min(position, entries.length), 0, { kind: "feature", id: featureId });
  return entries;
};

const CARD_BASE =
  "flex h-[84px] md:h-[100px] shrink-0 items-center rounded-2xl border border-white bg-white/80 shadow-[0_1px_2px_rgba(25,16,36,0.04)] transition-colors duration-300";

const PartnerCard = ({ item }: { item: PartnerItem }) => {
  const content = (
    <div className={`${CARD_BASE} min-w-[200px] md:min-w-[230px] justify-center gap-3 px-6 hover:border-violet-200 hover:bg-white`}>
      {item.logoUrl ? (
        <img src={item.logoUrl} alt={item.name} loading="lazy" className="max-h-10 md:max-h-12 max-w-[150px] object-contain" />
      ) : (
        <>
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-violet-100 text-[11px] font-bold text-violet-700">
            {getInitials(item.name)}
          </span>
          <span className="whitespace-nowrap text-sm md:text-base font-medium text-slate-800">{item.name}</span>
        </>
      )}
    </div>
  );

  return item.websiteUrl ? (
    <a href={item.websiteUrl} target="_blank" rel="noreferrer" aria-label={item.name}>
      {content}
    </a>
  ) : (
    content
  );
};

const FeatureCard = ({ id }: { id: string }) => {
  const cards: Record<string, ReactNode> = {
    funded: (
      <div className={`${CARD_BASE} gap-5 px-6 md:px-7`}>
        <span className="whitespace-nowrap text-2xl md:text-3xl font-semibold tracking-tight text-slate-900">50+</span>
        <span className="h-10 w-px bg-slate-200" />
        <span className="max-w-[230px] whitespace-normal text-xs md:text-sm leading-snug text-slate-500">
          Funded companies building the future across industries.
        </span>
      </div>
    ),
    partner: (
      <Link
        to="/partner-with-us"
        className={`${CARD_BASE} group gap-5 px-6 md:px-7 hover:border-violet-200 hover:bg-white`}
      >
        <span className="flex items-center gap-2 whitespace-nowrap text-sm md:text-base font-semibold text-violet-700">
          <Handshake className="h-5 w-5" />
          Partner with us
        </span>
        <span className="h-10 w-px bg-slate-200" />
        <span className="flex max-w-[220px] items-center gap-1 whitespace-normal text-xs md:text-sm leading-snug text-slate-500">
          Put your brand in front of founders and investors.
          <ArrowUpRight className="h-4 w-4 shrink-0 text-violet-600 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </span>
      </Link>
    ),
    founders: (
      <div className={`${CARD_BASE} flex-col items-start justify-center px-6 md:px-7`}>
        <span className="whitespace-nowrap text-xl md:text-2xl font-semibold tracking-tight text-slate-900">Founders first</span>
        <span className="mt-1 whitespace-nowrap text-[10px] md:text-[11px] font-medium uppercase tracking-[0.18em] text-slate-500">
          Partnerships that help startups grow
        </span>
      </div>
    ),
  };

  return <>{cards[id]}</>;
};

const PortfolioMarquee = ({ className }: { className?: string }) => {
  const [partners, setPartners] = useState<PartnerLogo[]>([]);

  useEffect(() => {
    getPublicPartnersApi()
      .then((response) => setPartners(response.partners || []))
      .catch(() => setPartners([]));
  }, []);

  const partnerItems: PartnerItem[] = partners.length
    ? partners.map((partner) => ({
        key: partner._id,
        name: partner.name,
        logoUrl: partner.logoUrl,
        websiteUrl: partner.websiteUrl,
      }))
    : [
        ...partnerLogos.map(({ name, path }) => ({ key: name, name, logoUrl: CLOUDINARY_PARTNERS + path, websiteUrl: "" })),
        ...companies.map((name) => ({ key: name, name, logoUrl: "", websiteUrl: "" })),
      ];

  const [rowA, rowB, rowC] = buildRows(partnerItems);
  const rows: RowEntry[][] = [
    withFeature(rowA, "funded", 2),
    withFeature(rowB, "partner", 3),
    withFeature(rowC, "founders", 1),
  ].filter((row) => row.some((entry) => entry.kind === "partner"));

  return (
    <section id="portfolio" className={`py-24 relative ${className}`}>
      <div className="container mx-auto px-4">
        <div className="overflow-hidden rounded-[2.5rem] border border-[#e8e1f5] bg-[#f6f4fb] py-14 md:py-20">
          {/* Heading */}
          <div className="mx-auto max-w-3xl px-6 text-center">
            <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-violet-700">Our Partners</span>
            <h2 className="mt-4 text-2xl font-light leading-snug tracking-tight text-slate-800 sm:text-3xl md:text-4xl md:leading-[1.3]">
              Backed by <strong className="font-semibold text-slate-900">50+ funded companies</strong>. Built so founders
              meet the <strong className="font-semibold text-slate-900">right partners</strong>, not just more people.
            </h2>
            <Link
              to="/partner-with-us"
              className="mt-7 inline-flex items-center gap-2 rounded-full bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-violet-700 hover:shadow-md active:scale-95"
            >
              <Handshake className="h-4 w-4" />
              Partner With Us
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {/* Scrolling bento rows, faded at both edges */}
          <div className="mt-12 space-y-3 [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]">
            {rows.map((row, rowIndex) => (
              <div key={rowIndex} className="group/row overflow-hidden">
                <div
                  className={`flex w-max group-hover/row:[animation-play-state:paused] motion-reduce:animate-none ${
                    rowIndex % 2 === 0 ? "animate-marquee-reverse" : "animate-marquee"
                  }`}
                  style={{ animationDuration: `${ROW_DURATIONS[rowIndex % ROW_DURATIONS.length]}s` }}
                >
                  {/* Two identical halves so the -50% loop is seamless */}
                  {[0, 1].map((copy) => (
                    <div key={copy} className="flex gap-3 pr-3" aria-hidden={copy === 1 ? true : undefined}>
                      {row.map((entry, index) =>
                        entry.kind === "partner" ? (
                          <PartnerCard key={`${entry.item.key}-${index}`} item={entry.item} />
                        ) : (
                          <FeatureCard key={`${entry.id}-${index}`} id={entry.id} />
                        )
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default PortfolioMarquee;
