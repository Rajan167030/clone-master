import { useEffect, useMemo, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useSEO } from "@/hooks/useSEO";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";
import { getPublicSpeakerInvestorProfilesApi, type SpeakerInvestorProfile } from "@/lib/api";

const stats = [
  { label: "Past speakers", value: "25+" },
  { label: "Investor guests", value: "15+" },
  { label: "Cities reached", value: "8" },
];

const RANDOM_AVATARS = [
  "https://i.pravatar.cc/300?img=1",
  "https://i.pravatar.cc/300?img=2",
  "https://i.pravatar.cc/300?img=3",
  "https://i.pravatar.cc/300?img=5",
  "https://i.pravatar.cc/300?img=6",
  "https://i.pravatar.cc/300?img=7",
  "https://i.pravatar.cc/300?img=8",
  "https://i.pravatar.cc/300?img=10",
  "https://i.pravatar.cc/300?img=11",
  "https://i.pravatar.cc/300?img=12",
  "https://i.pravatar.cc/300?img=14",
  "https://i.pravatar.cc/300?img=15",
];

const getRandomAvatar = (index: number) => RANDOM_AVATARS[index % RANDOM_AVATARS.length];

const DEMO_SPEAKERS: Array<Omit<SpeakerInvestorProfile, "_id" | "isActive" | "createdAt" | "updatedAt">> = [
  { slug: "harpreet-singh", category: "speaker", name: "Mr. Harpreet Singh",  designation: "Founder & CEO",     company: "F2 Fintech",      order: 1 },
  { slug: "abhinav-awal",   category: "speaker", name: "Mr. Abhinav Awal",    designation: "Co-Founder & MD",   company: "F2 Fintech",      order: 2 },
  { slug: "piyush-kumar",   category: "speaker", name: "Mr. Piyush Kumar",    designation: "Founder & CEO",     company: "Insanex Media",   order: 3 },
  { slug: "shaily-goel",    category: "speaker", name: "Ms. Shaily Goel",     designation: "Lead UX Designer",  company: "",                order: 4 },
  { slug: "rahul-sharma",   category: "speaker", name: "Mr. Rahul Sharma",    designation: "CTO",               company: "TechVentures",    order: 5 },
  { slug: "priya-mehta",    category: "speaker", name: "Ms. Priya Mehta",     designation: "VP Product",        company: "GrowthLab",       order: 6 },
  { slug: "arjun-kapoor",   category: "speaker", name: "Mr. Arjun Kapoor",    designation: "Managing Director", company: "StartupX",        order: 7 },
  { slug: "neha-joshi",     category: "speaker", name: "Ms. Neha Joshi",      designation: "Angel Investor",    company: "NJ Ventures",     order: 8 },
];

const DEMO_INVESTORS: Array<Omit<SpeakerInvestorProfile, "_id" | "isActive" | "createdAt" | "updatedAt">> = [
  { slug: "vikram-malhotra", category: "investor", name: "Mr. Vikram Malhotra", designation: "Managing Partner",    company: "Sequoia India",   order: 1 },
  { slug: "sunita-rao",      category: "investor", name: "Ms. Sunita Rao",      designation: "Angel Investor",      company: "100X.VC",         order: 2 },
  { slug: "rohit-bansal",    category: "investor", name: "Mr. Rohit Bansal",    designation: "Venture Partner",     company: "Kalaari Capital", order: 3 },
  { slug: "ananya-singh",    category: "investor", name: "Ms. Ananya Singh",    designation: "Principal",           company: "Accel India",     order: 4 },
  { slug: "deepak-verma",    category: "investor", name: "Mr. Deepak Verma",    designation: "Founder & GP",        company: "Blume Ventures",  order: 5 },
  { slug: "kavitha-nair",    category: "investor", name: "Ms. Kavitha Nair",    designation: "Investment Director", company: "Nexus VP",        order: 6 },
];

/* ─────────────────────────────────────────────────────────────────────────
   Main Page
───────────────────────────────────────────────────────────────────────── */
const PastSpeakersInvestors = () => {
  const [profiles, setProfiles]     = useState<SpeakerInvestorProfile[]>([]);
  const [loading, setLoading]       = useState(true);
  const [loadError, setLoadError]   = useState("");

  useSEO({
    title: "Past Speakers & Investors | Founders Connect",
    description: "Explore the past speakers and investors featured at Founders Connect events, panels, and community sessions.",
    keywords: "past speakers, past investors, founders connect speakers, founders connect investors",
    ogType: "website",
    canonicalUrl: "https://founders.connect/past-speakers-investors",
  });

  useEffect(() => {
    getPublicSpeakerInvestorProfilesApi()
      .then((res) => setProfiles(res.profiles))
      .catch((err) => setLoadError(err instanceof Error ? err.message : "Unable to load profiles."))
      .finally(() => setLoading(false));
  }, []);

  const speakerProfiles  = useMemo(() => profiles.filter((p) => p.category === "speaker").sort((a, b) => a.order - b.order),  [profiles]);
  const investorProfiles = useMemo(() => profiles.filter((p) => p.category === "investor").sort((a, b) => a.order - b.order), [profiles]);

  const displaySpeakers  = speakerProfiles.length  > 0 ? speakerProfiles  : (!loading ? DEMO_SPEAKERS  as SpeakerInvestorProfile[] : []);
  const displayInvestors = investorProfiles.length > 0 ? investorProfiles : (!loading ? DEMO_INVESTORS as SpeakerInvestorProfile[] : []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* ── Hero ── */}
      <section className="relative overflow-hidden pt-20 sm:pt-24">
        {/* Radial gradient background */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[480px] bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.18),_transparent_32%),radial-gradient(circle_at_top_right,_rgba(14,165,233,0.15),_transparent_28%)]" />

        {/* ── Decorative corner triangles (matches reference design) ── */}
        {/* Top-left triangle stack */}
        <div className="pointer-events-none absolute left-0 top-0" aria-hidden>
          <svg width="180" height="180" viewBox="0 0 180 180" fill="none" className="w-24 h-24 sm:w-36 sm:h-36 md:w-44 md:h-44">
            {/* Back triangle (lighter) */}
            <polygon points="0,0 180,0 0,180" fill="#3b82f6" opacity="0.15" />
            {/* Front triangle (stronger) */}
            <polygon points="0,0 110,0 0,110" fill="#2563eb" opacity="0.25" />
            {/* Accent stripe */}
            <polygon points="0,0 60,0 0,60"  fill="#1d4ed8" opacity="0.35" />
          </svg>
        </div>

        {/* Top-right triangle stack */}
        <div className="pointer-events-none absolute right-0 top-0" aria-hidden>
          <svg width="180" height="180" viewBox="0 0 180 180" fill="none" className="w-24 h-24 sm:w-36 sm:h-36 md:w-44 md:h-44">
            {/* Back triangle (lighter) */}
            <polygon points="180,0 0,0 180,180" fill="#3b82f6" opacity="0.15" />
            {/* Front triangle (stronger) */}
            <polygon points="180,0 70,0 180,110"  fill="#2563eb" opacity="0.25" />
            {/* Accent stripe */}
            <polygon points="180,0 120,0 180,60"  fill="#1d4ed8" opacity="0.35" />
          </svg>
        </div>

        <div className="container relative z-10 mx-auto px-4 py-8 sm:py-12 md:py-16">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="font-heading text-3xl font-extrabold leading-tight text-foreground sm:text-4xl md:text-5xl lg:text-6xl">
              Speakers &amp; Investors
            </h1>
            <p className="mt-3 text-sm text-muted-foreground sm:mt-4 sm:text-base md:text-lg">
              Celebrating the brilliant minds who shaped our community events.
            </p>

            <div className="mt-6 flex flex-wrap justify-center gap-2 sm:mt-8 sm:gap-3">
              <Button asChild size="sm" className="gap-2 bg-gradient-primary text-primary-foreground sm:size-default">
                <a href="#speakers">
                  View Speakers <ArrowRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                </a>
              </Button>
              <Button asChild variant="outline" size="sm" className="gap-2 sm:size-default">
                <a href="#investors">
                  View Investors <ArrowRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                </a>
              </Button>
            </div>
          </div>

          {/* Stats — 3 columns even on mobile (small values) */}
          <div className="mt-8 grid grid-cols-3 gap-2 sm:mt-12 sm:gap-4">
            {stats.map((stat) => (
              <Card key={stat.label} className="border-border/60 bg-background/90 shadow-sm backdrop-blur">
                <CardContent className="p-3 text-center sm:p-6">
                  <div className="text-2xl font-extrabold text-foreground sm:text-3xl">{stat.value}</div>
                  <p className="mt-1 text-xs text-muted-foreground sm:mt-2 sm:text-sm">{stat.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {loadError && (
            <div className="mx-auto mt-6 max-w-3xl rounded-xl border border-amber-200 bg-amber-50 px-4 py-2 text-xs text-amber-700 sm:mt-8 sm:py-3 sm:text-sm">
              ⚠️ {loadError} — Showing demo data below.
            </div>
          )}
        </div>
      </section>

      {/* ── Past Speakers ── */}
      <section id="speakers" className="py-10 sm:py-14 md:py-20">
        <div className="container mx-auto px-4">
          <SectionBanner title="Our Past Speakers" accentColor="#0ea5e9" bgClass="bg-teal-600 border-teal-500 shadow-teal-500/20" />

          <div className="mt-4 sm:mt-6">
            {loading ? (
              <EmptyState message="Loading speaker profiles…" />
            ) : displaySpeakers.length === 0 ? (
              <EmptyState message="No speaker profiles have been added yet." />
            ) : (
              /* 2-col on tiny mobile → 3-col sm → 4-col md+ */
              <div className="grid grid-cols-2 gap-x-3 gap-y-10 sm:grid-cols-3 sm:gap-x-6 sm:gap-y-12 md:grid-cols-4 lg:grid-cols-4 justify-items-center">
                {displaySpeakers.map((speaker, i) => (
                  <OvalCard
                    key={speaker.slug}
                    name={speaker.name}
                    designation={speaker.designation}
                    company={speaker.company}
                    photoUrl={speaker.photoUrl || getRandomAvatar(i)}
                    photoAlt={speaker.photoAlt || speaker.name}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── Past Investors ── */}
      <section id="investors" className="border-y border-border/60 bg-muted/30 py-10 sm:py-14 md:py-20">
        <div className="container mx-auto px-4">
          <SectionBanner
            title="Our Past Investors"
            accentColor="#6366f1"
            bgClass="bg-indigo-600 border-indigo-500 shadow-indigo-500/20"
          />

          <div className="mt-4 sm:mt-6">
            {loading ? (
              <EmptyState message="Loading investor profiles…" />
            ) : displayInvestors.length === 0 ? (
              <EmptyState message="No investor profiles have been added yet." />
            ) : (
              <div className="grid grid-cols-2 gap-x-3 gap-y-10 sm:grid-cols-3 sm:gap-x-6 sm:gap-y-12 md:grid-cols-4 lg:grid-cols-4 justify-items-center">
                {displayInvestors.map((investor, i) => (
                  <OvalCard
                    key={investor.slug}
                    name={investor.name}
                    designation={investor.designation}
                    company={investor.company}
                    photoUrl={investor.photoUrl || getRandomAvatar(i + 6)}
                    photoAlt={investor.photoAlt || investor.name}
                    ringColor="#6366f1"
                    ringLightColor="#c7d2fe"
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-10 sm:py-14 md:py-20">
        <div className="container mx-auto px-4">
          <Card className="overflow-hidden border-border/60 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-white shadow-2xl">
            <CardContent className="p-6 sm:p-8 md:grid md:grid-cols-[1.2fr_0.8fr] md:gap-8 md:p-10">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/70 sm:text-sm">
                  Want to add more names?
                </p>
                <h2 className="mt-3 font-heading text-2xl font-extrabold sm:mt-4 sm:text-3xl md:text-4xl">
                  Keep this page updated as your network grows.
                </h2>
                <p className="mt-3 text-xs leading-6 text-white/80 sm:mt-4 sm:text-sm sm:leading-7">
                  Add real speaker and investor records from the admin dashboard, include photos and
                  designations, and this page will update automatically.
                </p>
              </div>

              <div className="mt-6 flex flex-col gap-3 md:mt-0 md:justify-center md:items-end">
                <Button asChild className="w-full gap-2 bg-white text-slate-950 hover:bg-white/90 md:w-auto">
                  <a href="/partner-with-us">Partner With Us</a>
                </Button>
                <Button asChild variant="outline" className="w-full border-white/20 bg-white/5 text-white hover:bg-white/10 md:w-auto">
                  <a href="/events">Browse Events</a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <Footer />
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────────────────
   Decorative section banner  (works on all screen sizes)
───────────────────────────────────────────────────────────────────────── */
const SectionBanner = ({
  title,
  accentColor,
  bgClass,
}: {
  title: string;
  accentColor: string;
  bgClass: string;
}) => (
  <div className="relative flex items-center justify-center mb-8 sm:mb-12">
    {/* Wing SVGs — hidden on tiny screens, visible sm+ */}
    <div className="hidden sm:block absolute left-0 top-1/2 -translate-y-1/2">
      <svg width="100" height="44" viewBox="0 0 120 48" fill="none" aria-hidden>
        <path d="M0 24 Q30 4 60 24 Q90 44 120 24" stroke={accentColor} strokeWidth="2.5" fill="none" opacity="0.5" />
        <circle cx="0"   cy="24" r="5" fill={accentColor} opacity="0.4" />
        <circle cx="120" cy="24" r="5" fill={accentColor} opacity="0.4" />
      </svg>
    </div>

    <div className={`relative z-10 inline-flex items-center rounded-2xl border-2 px-5 py-2.5 shadow-lg sm:px-8 sm:py-3 ${bgClass}`}>
      <span className="text-lg font-extrabold tracking-wide text-white sm:text-2xl md:text-3xl">
        {title}
      </span>
    </div>

    <div className="hidden sm:block absolute right-0 top-1/2 -translate-y-1/2">
      <svg width="100" height="44" viewBox="0 0 120 48" fill="none" aria-hidden>
        <path d="M0 24 Q30 44 60 24 Q90 4 120 24" stroke={accentColor} strokeWidth="2.5" fill="none" opacity="0.5" />
        <circle cx="0"   cy="24" r="5" fill={accentColor} opacity="0.4" />
        <circle cx="120" cy="24" r="5" fill={accentColor} opacity="0.4" />
      </svg>
    </div>
  </div>
);

/* ─────────────────────────────────────────────────────────────────────────
   Empty / loading state
───────────────────────────────────────────────────────────────────────── */
const EmptyState = ({ message }: { message: string }) => (
  <div className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
    {message}
  </div>
);

/* ─────────────────────────────────────────────────────────────────────────
   Oval photo card — fluid sizing via CSS clamp so it scales on mobile
───────────────────────────────────────────────────────────────────────── */
const OvalCard = ({
  name,
  designation,
  company,
  photoUrl,
  photoAlt,
  ringColor     = "#0ea5e9",
  ringLightColor = "#bae6fd",
}: {
  name: string;
  designation: string;
  company?: string;
  photoUrl: string;
  photoAlt: string;
  ringColor?: string;
  ringLightColor?: string;
}) => (
  <div className="group flex w-full flex-col items-center text-center">
    {/*
      Fluid oval: on a tiny 320px screen each cell ≈ 140px wide,
      on tablet it's ≈ 160-180px. clamp(120px, 38vw, 180px) keeps it proportional.
    */}
    <div
      className="relative mx-auto"
      style={{
        width:  "clamp(110px, 36vw, 176px)",
        height: "clamp(132px, 43vw, 210px)",
      }}
    >
      {/* Outer light ring */}
      <div
        className="absolute inset-0"
        style={{ borderRadius: "50% / 50%", border: `5px solid ${ringLightColor}` }}
      />
      {/* Dashed accent ring overlay */}
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 176 210"
        fill="none"
        preserveAspectRatio="none"
        aria-hidden
      >
        <ellipse
          cx="88" cy="105" rx="82" ry="98"
          stroke={ringColor}
          strokeWidth="4"
          strokeDasharray="80 260"
          strokeLinecap="round"
          transform="rotate(-30 88 105)"
        />
        <ellipse
          cx="88" cy="105" rx="82" ry="98"
          stroke={ringColor}
          strokeWidth="2"
          strokeDasharray="40 300"
          strokeLinecap="round"
          transform="rotate(160 88 105)"
        />
      </svg>

      {/* Photo clipped to oval */}
      <div
        className="absolute inset-[8px] overflow-hidden bg-slate-100 transition-transform duration-300 group-hover:scale-105"
        style={{ borderRadius: "50% / 50%" }}
      >
        <img
          src={photoUrl}
          alt={photoAlt}
          className="w-full h-full object-cover object-top"
          loading="lazy"
        />
      </div>
    </div>

    {/* Text below photo */}
    <h3 className="mt-3 text-xs font-bold leading-tight text-foreground sm:mt-4 sm:text-sm md:text-base">
      {name}
    </h3>
    <p className="mt-0.5 text-[10px] font-semibold text-primary sm:text-xs md:text-sm">
      {designation}
    </p>
    {company && (
      <p className="mt-0.5 text-[10px] text-muted-foreground sm:text-xs">
        {company}
      </p>
    )}
  </div>
);

export default PastSpeakersInvestors;