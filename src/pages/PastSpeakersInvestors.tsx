import { useEffect, useMemo, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useSEO } from "@/hooks/useSEO";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, ExternalLink, X, Loader } from "lucide-react";
import { getPublicSpeakerInvestorProfilesApi, type SpeakerInvestorProfile } from "@/lib/api";

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
  { slug: "harpreet-singh", category: "speaker", name: "Mr. Harpreet Singh",  designation: "Founder & CEO",     company: "F2 Fintech",      order: 1, linkedinUrl: "https://linkedin.com/in/harpreet-singh" },
  { slug: "abhinav-awal",   category: "speaker", name: "Mr. Abhinav Awal",    designation: "Co-Founder & MD",   company: "F2 Fintech",      order: 2, linkedinUrl: "https://linkedin.com/in/abhinav-awal" },
  { slug: "piyush-kumar",   category: "speaker", name: "Mr. Piyush Kumar",    designation: "Founder & CEO",     company: "Insanex Media",   order: 3, linkedinUrl: "https://linkedin.com/in/piyush-kumar" },
  { slug: "shaily-goel",    category: "speaker", name: "Ms. Shaily Goel",     designation: "Lead UX Designer",  company: "",                order: 4, linkedinUrl: "https://linkedin.com/in/shaily-goel" },
  { slug: "rahul-sharma",   category: "speaker", name: "Mr. Rahul Sharma",    designation: "CTO",               company: "TechVentures",    order: 5, linkedinUrl: "https://linkedin.com/in/rahul-sharma" },
  { slug: "priya-mehta",    category: "speaker", name: "Ms. Priya Mehta",     designation: "VP Product",        company: "GrowthLab",       order: 6, linkedinUrl: "https://linkedin.com/in/priya-mehta" },
  { slug: "arjun-kapoor",   category: "speaker", name: "Mr. Arjun Kapoor",    designation: "Managing Director", company: "StartupX",        order: 7, linkedinUrl: "https://linkedin.com/in/arjun-kapoor" },
  { slug: "neha-joshi",     category: "speaker", name: "Ms. Neha Joshi",      designation: "Angel Investor",    company: "NJ Ventures",     order: 8, linkedinUrl: "https://linkedin.com/in/neha-joshi" },
];

const DEMO_INVESTORS: Array<Omit<SpeakerInvestorProfile, "_id" | "isActive" | "createdAt" | "updatedAt">> = [
  { slug: "vikram-malhotra", category: "investor", name: "Mr. Vikram Malhotra", designation: "Managing Partner",    company: "Sequoia India",   order: 1, linkedinUrl: "https://linkedin.com/in/vikram-malhotra", introduction: "Leading venture investor focused on enterprise SaaS and deep tech startups across India." },
  { slug: "sunita-rao",      category: "investor", name: "Ms. Sunita Rao",      designation: "Angel Investor",      company: "100X.VC",         order: 2, linkedinUrl: "https://linkedin.com/in/sunita-rao", introduction: "Angel investor and mentor supporting early-stage founders building consumer tech solutions." },
  { slug: "rohit-bansal",    category: "investor", name: "Mr. Rohit Bansal",    designation: "Venture Partner",     company: "Kalaari Capital", order: 3, linkedinUrl: "https://linkedin.com/in/rohit-bansal", introduction: "Focused on fintech, healthtech, and logistics innovation with expertise in India's startup ecosystem." },
  { slug: "ananya-singh",    category: "investor", name: "Ms. Ananya Singh",    designation: "Principal",           company: "Accel India",     order: 4, linkedinUrl: "https://linkedin.com/in/ananya-singh", introduction: "Investing in B2B SaaS and climate tech companies creating global impact from India." },
  { slug: "deepak-verma",    category: "investor", name: "Mr. Deepak Verma",    designation: "Founder & GP",        company: "Blume Ventures",  order: 5, linkedinUrl: "https://linkedin.com/in/deepak-verma", introduction: "Dedicated to supporting early-stage founders with mentorship and capital deployment." },
  { slug: "kavitha-nair",    category: "investor", name: "Ms. Kavitha Nair",    designation: "Investment Director", company: "Nexus VP",        order: 6, linkedinUrl: "https://linkedin.com/in/kavitha-nair", introduction: "Passionate about diversity and backing women entrepreneurs in the startup space." },
];


/* ─────────────────────────────────────────────────────────────────────────
   Detailed Profile Modal
───────────────────────────────────────────────────────────────────────── */
const DetailedProfileModal = ({
  profile,
  onClose,
}: {
  profile: SpeakerInvestorProfile;
  onClose: () => void;
}) => {
  const avatarIndex = Math.abs(profile.slug.charCodeAt(0)) % RANDOM_AVATARS.length;
  const photoUrl = profile.photoUrl || getRandomAvatar(avatarIndex);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl rounded-3xl bg-white shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 rounded-full bg-white/90 p-2 hover:bg-white transition-colors"
          aria-label="Close modal"
        >
          <X size={24} className="text-slate-900" />
        </button>

        <div className="grid gap-0 md:grid-cols-[280px_1fr]">
          {/* Photo section */}
          <div className="relative aspect-square overflow-hidden bg-slate-100">
            <img
              src={photoUrl}
              alt={profile.photoAlt || profile.name}
              className="h-full w-full object-cover object-top"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/20 via-transparent to-transparent" />
          </div>

          {/* Details section */}
          <div className="flex flex-col p-4 sm:p-6">
            <div className="mb-3">
              <h2 className="text-2xl font-extrabold tracking-tight text-black">
                {profile.name}
              </h2>
              <p className="mt-1 text-base font-semibold text-indigo-600">
                {profile.designation}
              </p>
              {profile.company && (
                <p className="mt-1 text-base text-slate-600">
                  {profile.company}
                </p>
              )}
            </div>

            {profile.introduction && (
              <div className="mb-4 bg-indigo-50 border border-indigo-200 rounded-lg p-3">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-700 mb-2">
                  Introduction
                </p>
                <p className="text-sm leading-6 text-indigo-900">
                  {profile.introduction}
                </p>
              </div>
            )}

            {profile.summary && (
              <div className="mb-6 flex-1">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400 mb-2">
                  About
                </p>
                <p className="text-sm leading-7 text-slate-700">
                  {profile.summary}
                </p>
              </div>
            )}

            <div className="flex flex-col gap-3 border-t border-slate-200 pt-6">
              {profile.linkedinUrl && (
                <a
                  href={profile.linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-slate-700 hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-700 transition-colors"
                >
                  <ExternalLink size={20} />
                  <span className="font-semibold">View LinkedIn Profile</span>
                </a>
              )}
              {profile.websiteUrl && (
                <a
                  href={profile.websiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-slate-700 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700 transition-colors"
                >
                  <ArrowRight size={20} />
                  <span className="font-semibold">Visit Website</span>
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────────────────
   Main Page
───────────────────────────────────────────────────────────────────────── */
const PastSpeakersInvestors = () => {
  const [profiles, setProfiles]     = useState<SpeakerInvestorProfile[]>([]);
  const [loading, setLoading]       = useState(true);
  const [loadError, setLoadError]   = useState("");
  const [selectedProfile, setSelectedProfile] = useState<SpeakerInvestorProfile | null>(null);

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
     

      {/* ── Past Speakers ── */}
      <section id="speakers" className="relative overflow-hidden border-y border-slate-200 bg-white py-16 sm:py-20 md:py-24">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(6,182,212,0.08),_transparent_32%),radial-gradient(circle_at_bottom_left,_rgba(34,197,94,0.06),_transparent_28%)]" />

        <div className="container relative mx-auto px-4">
          <div className="mb-8 flex flex-col gap-3 md:mb-12 md:flex-row md:items-end md:justify-between">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-teal-600">Speakers</p>
              <h2 className="mt-2 font-heading text-3xl font-extrabold tracking-tight text-black sm:text-4xl md:text-5xl">
                Past Speakers
              </h2>
              <p className="mt-3 max-w-xl text-sm leading-7 text-slate-500 sm:text-base">
                A curated showcase of visionary founders and industry leaders who have inspired our community.
              </p>
            </div>

            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 shadow-sm">
              Community Leaders
            </div>
          </div>

          <div className="mt-6">
            {loading ? (
              <EmptyState message="Loading speaker profiles…" />
            ) : displaySpeakers.length === 0 ? (
              <EmptyState message="No speaker profiles have been added yet." />
            ) : (
              <div className="grid grid-cols-1 justify-items-center gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
                {displaySpeakers.map((speaker, i) => (
                  <PremiumSpeakerCard
                    key={speaker.slug}
                    profile={speaker}
                    photoUrl={speaker.photoUrl || getRandomAvatar(i)}
                    photoAlt={speaker.photoAlt || speaker.name}
                    affiliationBadge={speaker.company ? getCompanyBadge(speaker.company) : undefined}
                    onCardClick={() => setSelectedProfile(speaker)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── Past Investors ── */}
      <section id="investors" className="relative overflow-hidden border-y border-slate-200 bg-white py-16 sm:py-20 md:py-24">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(99,102,241,0.08),_transparent_32%),radial-gradient(circle_at_bottom_left,_rgba(59,130,246,0.06),_transparent_28%)]" />

        <div className="container relative mx-auto px-4">
          <div className="mb-8 flex flex-col gap-3 md:mb-12 md:flex-row md:items-end md:justify-between">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-indigo-600">Investors</p>
              <h2 className="mt-2 font-heading text-3xl font-extrabold tracking-tight text-black sm:text-4xl md:text-5xl">
                Past Investors
              </h2>
              <p className="mt-3 max-w-xl text-sm leading-7 text-slate-500 sm:text-base">
                A curated showcase of venture partners and angel investors shaping India’s startup ecosystem.
              </p>
            </div>

            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 shadow-sm">
              Premium VC showcase
            </div>
          </div>

          <div className="mt-6">
            {loading ? (
              <EmptyState message="Loading investor profiles…" />
            ) : displayInvestors.length === 0 ? (
              <EmptyState message="No investor profiles have been added yet." />
            ) : (
              <div className="grid grid-cols-1 justify-items-center gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                {displayInvestors.map((investor, i) => (
                  <PremiumInvestorCard
                    key={investor.slug}
                    profile={investor}
                    photoUrl={investor.photoUrl || getRandomAvatar(i + 6)}
                    photoAlt={investor.photoAlt || investor.name}
                    companyLogo={investor.company ? getCompanyBadge(investor.company) : undefined}
                    onCardClick={() => setSelectedProfile(investor)}
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

      {/* ── Detailed Profile Modal ── */}
      {selectedProfile && (
        <DetailedProfileModal profile={selectedProfile} onClose={() => setSelectedProfile(null)} />
      )}
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
const EmptyState = ({ message }: { message: string }) => {
  const isLoading = message.includes("Loading");
  
  return (
    <div className="rounded-[28px] border border-dashed border-slate-200 bg-white p-8 text-center text-sm text-slate-500 shadow-[0_20px_60px_-35px_rgba(15,23,42,0.14)]">
      {isLoading ? (
        <div className="flex flex-col items-center justify-center gap-4">
          <Loader size={40} className="animate-spin text-indigo-600" />
          <p className="text-slate-600 font-medium">{message}</p>
        </div>
      ) : (
        message
      )}
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────────────────
   Speaker oval card
───────────────────────────────────────────────────────────────────────── */
const OvalCard = ({
  name,
  designation,
  company,
  photoUrl,
  photoAlt,
  ringColor = "#0ea5e9",
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
    <div
      className="relative mx-auto"
      style={{
        width: "clamp(110px, 36vw, 176px)",
        height: "clamp(132px, 43vw, 210px)",
      }}
    >
      <div
        className="absolute inset-0"
        style={{ borderRadius: "50% / 50%", border: `5px solid ${ringLightColor}` }}
      />
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 176 210" fill="none" preserveAspectRatio="none" aria-hidden>
        <ellipse cx="88" cy="105" rx="82" ry="98" stroke={ringColor} strokeWidth="4" strokeDasharray="80 260" strokeLinecap="round" transform="rotate(-30 88 105)" />
        <ellipse cx="88" cy="105" rx="82" ry="98" stroke={ringColor} strokeWidth="2" strokeDasharray="40 300" strokeLinecap="round" transform="rotate(160 88 105)" />
      </svg>

      <div
        className="absolute inset-[8px] overflow-hidden bg-slate-100 transition-transform duration-300 group-hover:scale-105"
        style={{ borderRadius: "50% / 50%" }}
      >
        <img
          src={photoUrl}
          alt={photoAlt}
          className="h-full w-full object-cover object-top"
          loading="lazy"
        />
      </div>
    </div>

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

/* ─────────────────────────────────────────────────────────────────────────
   Premium investor card
───────────────────────────────────────────────────────────────────────── */
const PremiumInvestorCard = ({
  profile,
  photoUrl,
  photoAlt,
  companyLogo,
  onCardClick,
}: {
  profile: SpeakerInvestorProfile;
  photoUrl: string;
  photoAlt: string;
  companyLogo?: string;
  onCardClick?: () => void;
}) => (
  <article className="group flex h-full w-full max-w-[260px] flex-col overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-[0_12px_32px_-24px_rgba(15,23,42,0.3)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_50px_-26px_rgba(15,23,42,0.28)] sm:max-w-[280px] md:max-w-[300px]">
    <div
      className="relative aspect-[3/4] overflow-hidden bg-slate-100 cursor-pointer"
      onClick={onCardClick}
    >
      <img
        src={photoUrl}
        alt={photoAlt}
        className="h-full w-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
        loading="lazy"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/12 via-transparent to-transparent" />
    </div>

    <div className="flex flex-1 flex-col gap-3 p-4 sm:p-5">
      <div className="cursor-pointer" onClick={onCardClick}>
        <h3 className="text-[clamp(1rem,1.6vw,1.2rem)] font-extrabold tracking-tight text-black">
          {profile.name}
        </h3>
        <p className="mt-1 text-xs font-semibold text-indigo-600 sm:text-sm">
          {profile.designation}
        </p>
      </div>

      <div className="mt-auto flex items-end justify-between gap-3 border-t border-slate-200 pt-3">
        <div className="cursor-pointer flex-1" onClick={onCardClick}>
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">
            Company
          </p>
          <p className="mt-1 text-xs font-medium text-slate-500 sm:text-sm">
            {profile.company || "Independent Investor"}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {profile.linkedinUrl && (
            <a
              href={profile.linkedinUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="flex-shrink-0 rounded-full border border-slate-200 bg-slate-50 p-1.5 text-slate-500 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 transition-colors"
              aria-label="LinkedIn Profile"
            >
              <ExternalLink size={16} />
            </a>
          )}
          <div className="flex-shrink-0 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
            {companyLogo || "VC"}
          </div>
        </div>
      </div>
    </div>
  </article>
);

/* ─────────────────────────────────────────────────────────────────────────
   Premium speaker card (same visual language as investors)
───────────────────────────────────────────────────────────────────────── */
function PremiumSpeakerCard({
  profile,
  photoUrl,
  photoAlt,
  affiliationBadge,
  onCardClick,
}: {
  profile: SpeakerInvestorProfile;
  photoUrl: string;
  photoAlt: string;
  affiliationBadge?: string;
  onCardClick?: () => void;
}) {
  return (
    <article className="group flex h-full w-full max-w-[260px] flex-col overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-[0_12px_32px_-24px_rgba(15,23,42,0.3)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_50px_-26px_rgba(15,23,42,0.28)] sm:max-w-[280px] md:max-w-[300px]">
      <div
        className="relative aspect-[3/4] overflow-hidden bg-slate-100 cursor-pointer"
        onClick={onCardClick}
      >
        <img
          src={photoUrl}
          alt={photoAlt}
          className="h-full w-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/12 via-transparent to-transparent" />
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4 sm:p-5">
        <div className="cursor-pointer" onClick={onCardClick}>
          <h3 className="text-[clamp(1rem,1.6vw,1.2rem)] font-extrabold tracking-tight text-black">
            {profile.name}
          </h3>
          <p className="mt-1 text-xs font-semibold text-indigo-600 sm:text-sm">
            {profile.designation}
          </p>
        </div>

        <div className="mt-auto flex items-end justify-between gap-3 border-t border-slate-200 pt-3">
          <div className="cursor-pointer flex-1" onClick={onCardClick}>
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">Affiliation</p>
            <p className="mt-1 text-xs font-medium text-slate-500 sm:text-sm">{profile.company || "Independent"}</p>
          </div>

          <div className="flex items-center gap-2">
            {profile.linkedinUrl && (
              <a
                href={profile.linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="flex-shrink-0 rounded-full border border-slate-200 bg-slate-50 p-1.5 text-slate-500 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 transition-colors"
                aria-label="LinkedIn Profile"
              >
                <ExternalLink size={16} />
              </a>
            )}
            <div className="flex-shrink-0 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
              {affiliationBadge || "SPK"}
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
const getCompanyBadge = (company?: string) => {
  if (!company) return "VC";
  return company
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
};

export default PastSpeakersInvestors;