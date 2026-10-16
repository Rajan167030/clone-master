import { useEffect, useMemo, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useSEO } from "@/hooks/useSEO";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Loader } from "lucide-react";
import { DetailedProfileModal, PremiumProfileCard } from "@/components/ProfileShowcaseCard";

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
        <DetailedProfileModal
          profile={selectedProfile}
          photoUrl={selectedProfile.photoUrl || getRandomAvatar(Math.abs(selectedProfile.slug.charCodeAt(0)))}
          onClose={() => setSelectedProfile(null)}
        />
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

export default PastSpeakersInvestors;