import { useEffect, useMemo, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useSEO } from "@/hooks/useSEO";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, ExternalLink, X, Loader, Eye } from "lucide-react";

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

const getCompanyBadge = (company?: string) => {
  if (!company) return "VC";
  return company
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
};

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
        className="relative w-full max-w-lg rounded-3xl bg-white p-6 sm:p-8 shadow-2xl animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 rounded-full bg-slate-100 p-2 hover:bg-slate-200 hover:rotate-90 transition-all duration-300"
          aria-label="Close modal"
        >
          <X size={20} className="text-slate-600" />
        </button>

        <div className="flex flex-col items-center text-center">
          <div className="mb-4 h-24 w-24 sm:h-28 sm:w-28 overflow-hidden rounded-full border-4 border-slate-50 shadow-md">
            <img
              src={photoUrl}
              alt={profile.name}
              className="h-full w-full object-cover object-top"
              loading="lazy"
            />
          </div>

          <h2 className="text-2xl font-bold text-slate-900">{profile.name}</h2>
          <p className="mt-1 font-semibold text-primary">{profile.designation}</p>
          {profile.company && (
            <p className="text-sm font-medium text-slate-500 mt-0.5">{profile.company}</p>
          )}

          <div className="mt-5 flex gap-3">
            {profile.linkedinUrl && (
              <a
                href={profile.linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-50 border border-slate-200 text-slate-600 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 hover:-translate-y-0.5 transition-all shadow-sm"
                aria-label="LinkedIn"
                title="LinkedIn Profile"
              >
                <ExternalLink size={18} />
              </a>
            )}
            {profile.websiteUrl && (
              <a
                href={profile.websiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900 hover:-translate-y-0.5 transition-all shadow-sm"
                aria-label="Website"
                title="Visit Website"
              >
                <ArrowRight size={18} />
              </a>
            )}
          </div>
        </div>

        <div className="mt-6 sm:mt-8 border-t border-slate-100 pt-6">
          {(profile.introduction || profile.summary) ? (
            <div className="text-sm leading-relaxed text-slate-600">
              {profile.introduction && <p className="mb-3">{profile.introduction}</p>}
              {profile.summary && <p>{profile.summary}</p>}
            </div>
          ) : (
            <p className="text-center text-sm italic text-slate-400">No additional information available.</p>
          )}
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
    canonicalUrl: "https://www.foundersconnect.co.in/past-speakers-investors",
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

      {loadError && !loading && (
        <div className="container mx-auto px-4 pt-6">
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
            {loadError} — showing sample profiles instead.
          </div>
        </div>
      )}

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
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-5 sm:gap-6 justify-items-center">
                {displaySpeakers.map((speaker, i) => (
                  <PremiumProfileCard
                    key={speaker.slug}
                    profile={speaker}
                    photoUrl={speaker.photoUrl || getRandomAvatar(i)}
                    photoAlt={speaker.photoAlt || speaker.name}
                    badge={speaker.company ? getCompanyBadge(speaker.company) : "SPK"}
                    fallbackLabel="Independent"
                    accent="indigo"
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
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-5 sm:gap-6 justify-items-center">
                {displayInvestors.map((investor, i) => (
                  <PremiumProfileCard
                    key={investor.slug}
                    profile={investor}
                    photoUrl={investor.photoUrl || getRandomAvatar(i + 6)}
                    photoAlt={investor.photoAlt || investor.name}
                    badge={investor.company ? getCompanyBadge(investor.company) : "VC"}
                    fallbackLabel="Independent Investor"
                    accent="indigo"
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
   Premium profile card — shared by speakers + investors, with a proper
   hover interaction: whole card lifts, image zooms + gets a scrim,
   a "View Profile" affordance fades in, and the socials nudge upward.
───────────────────────────────────────────────────────────────────────── */
const ACCENT_STYLES = {
  teal: {
    label: "text-teal-600",
    ring: "hover:border-teal-300",
    glow: "hover:shadow-[0_24px_60px_-24px_rgba(13,148,136,0.35)]",
    chip: "border-teal-200 bg-teal-50 text-teal-700",
    social: "hover:bg-teal-50 hover:text-teal-600 hover:border-teal-200",
  },
  indigo: {
    label: "text-indigo-600",
    ring: "hover:border-indigo-300",
    glow: "hover:shadow-[0_24px_60px_-24px_rgba(79,70,229,0.35)]",
    chip: "border-indigo-200 bg-indigo-50 text-indigo-700",
    social: "hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200",
  },
} as const;

const PremiumProfileCard = ({
  profile,
  photoUrl,
  photoAlt,
  badge,
  fallbackLabel,
  accent,
  onCardClick,
  wide = false,
}: {
  profile: SpeakerInvestorProfile;
  photoUrl: string;
  photoAlt: string;
  badge: string;
  fallbackLabel: string;
  accent: "teal" | "indigo";
  onCardClick?: () => void;
  wide?: boolean;
}) => {
  const styles = ACCENT_STYLES[accent];
  const widthClasses = wide
    ? "w-full max-w-[320px]"
    : "w-full max-w-[260px]";
  const aspectClass = wide ? "aspect-[4/3]" : "aspect-[3/4]";


  return (
    <article
      role="button"
      tabIndex={0}
      onClick={onCardClick}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onCardClick?.()}
      className={`group relative flex h-full w-full cursor-pointer flex-col overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-[0_12px_32px_-24px_rgba(15,23,42,0.3)] transition-all duration-300 ease-out hover:-translate-y-2 focus-visible:-translate-y-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${styles.ring} ${styles.glow} ${widthClasses}`}
    >
      <div className={`relative ${aspectClass} overflow-hidden bg-slate-100`}>
        <img
          src={photoUrl}
          alt={photoAlt}
          className="h-full w-full object-cover object-top transition-transform duration-500 ease-out group-hover:scale-110"
          loading="lazy"
        />
        {/* Scrim + "View Profile" affordance, revealed on hover/focus */}
        <div className="absolute inset-0 flex items-end justify-center bg-gradient-to-t from-slate-950/70 via-slate-950/10 to-transparent p-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100">
          <span className="mb-1 inline-flex translate-y-2 items-center gap-1.5 rounded-full bg-white/95 px-3 py-1.5 text-xs font-semibold text-slate-900 shadow-md transition-transform duration-300 group-hover:translate-y-0 group-focus-visible:translate-y-0">
            <Eye size={14} />
            View Profile
          </span>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4 sm:p-5">
        <div>
          <h3 className="text-[clamp(1rem,1.6vw,1.2rem)] font-extrabold tracking-tight text-black transition-colors group-hover:text-slate-700">
            {profile.name}
          </h3>
          <p className={`mt-1 text-xs font-semibold sm:text-sm ${styles.label}`}>
            {profile.designation}
          </p>
        </div>

        <div className="mt-auto flex items-end justify-between gap-3 border-t border-slate-200 pt-3">
          <div className="flex-1">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">
              {profile.category === "investor" ? "Company" : "Affiliation"}
            </p>
            <p className="mt-1 text-xs font-medium text-slate-500 sm:text-sm">
              {profile.company || fallbackLabel}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {profile.linkedinUrl && (
              <a
                href={profile.linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className={`flex-shrink-0 rounded-full border border-slate-200 bg-slate-50 p-1.5 text-slate-500 transition-all hover:-translate-y-0.5 hover:shadow-sm ${styles.social}`}
                aria-label="LinkedIn Profile"
              >
                <ExternalLink size={16} />
              </a>
            )}
            <div
              className={`flex-shrink-0 rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] transition-colors ${styles.chip}`}
            >
              {badge}
            </div>
          </div>
        </div>
      </div>
    </article>
  );
};

export default PastSpeakersInvestors;