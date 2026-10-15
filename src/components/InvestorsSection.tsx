import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ExternalLink, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getPublicSpeakerInvestorProfilesApi, type SpeakerInvestorProfile } from "@/lib/api";

const RANDOM_AVATARS = [
  "https://i.pravatar.cc/300?img=11",
  "https://i.pravatar.cc/300?img=12",
  "https://i.pravatar.cc/300?img=14",
  "https://i.pravatar.cc/300?img=15",
  "https://i.pravatar.cc/300?img=3",
  "https://i.pravatar.cc/300?img=5",
  "https://i.pravatar.cc/300?img=6",
  "https://i.pravatar.cc/300?img=7",
];

const TitanCard = ({
  profile,
  index,
}: {
  profile: SpeakerInvestorProfile;
  index: number;
}) => {
  const photoUrl = profile.photoUrl || RANDOM_AVATARS[index % RANDOM_AVATARS.length];
  const categoryLabel =
    profile.category === "mentor"
      ? "Mentor"
      : profile.category === "speaker"
      ? "Speaker"
      : "Investor";

  const categoryBadgeClasses =
    profile.category === "mentor"
      ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/30"
      : profile.category === "speaker"
      ? "bg-amber-500/20 text-amber-300 border-amber-500/30"
      : "bg-violet-500/20 text-violet-300 border-violet-500/30";

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.06, duration: 0.4 }}
      className="group relative flex flex-col overflow-hidden rounded-[24px] bg-slate-900 border border-white/5 aspect-[3/4] w-full max-w-sm mx-auto shadow-xl"
    >
      {/* Category Pill Tag */}
      <div className="absolute top-4 left-4 z-20">
        <span
          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider backdrop-blur-md border ${categoryBadgeClasses}`}
        >
          {categoryLabel}
        </span>
      </div>

      {/* Background Image */}
      <img
        src={photoUrl}
        alt={profile.name}
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-110 group-hover:blur-[2px]"
        loading="lazy"
        onError={(e) => {
          (e.currentTarget as HTMLImageElement).src = RANDOM_AVATARS[index % RANDOM_AVATARS.length];
        }}
      />

      {/* Default Bottom Dark Overlay */}
      <div className="absolute inset-x-0 bottom-0 h-[65%] bg-gradient-to-t from-[#020202] via-[#020202]/70 to-transparent transition-opacity duration-300" />

      {/* Hover Overlay */}
      <div className="absolute inset-0 bg-[#020202]/85 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

      {/* Content Container */}
      <div className="relative flex h-full flex-col justify-end p-5 sm:p-6 z-10">
        {/* Hover Bio / Introduction */}
        <div className="overflow-hidden transition-all duration-500 max-h-0 opacity-0 group-hover:max-h-60 group-hover:opacity-100 mb-0 group-hover:mb-3">
          <p className="text-xs sm:text-sm text-slate-300 line-clamp-4 leading-relaxed">
            {profile.introduction || profile.summary || "No description provided."}
          </p>
          {profile.linkedinUrl && (
            <a
              href={profile.linkedinUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-violet-400 hover:text-violet-300 transition-colors"
            >
              <ExternalLink size={13} /> View Profile
            </a>
          )}
        </div>

        {/* Name and Designation */}
        <div className="transition-transform duration-300 transform translate-y-0 group-hover:-translate-y-1">
          <h3 className="font-heading text-lg sm:text-xl font-bold text-white leading-tight">
            {profile.name}
          </h3>
          <p className="mt-1 text-xs sm:text-sm font-medium text-slate-300 line-clamp-1">
            {profile.designation}
            {profile.company ? ` • ${profile.company}` : ""}
          </p>
        </div>
      </div>
    </motion.div>
  );
};

const InvestorsSection = ({ className }: { className?: string }) => {
  const [profiles, setProfiles] = useState<SpeakerInvestorProfile[]>([]);
  const [activeCategory, setActiveCategory] = useState<"all" | "investor" | "mentor" | "speaker">("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPublicSpeakerInvestorProfilesApi()
      .then((res) => {
        const sorted = (res.profiles || []).sort((a, b) => a.order - b.order);
        setProfiles(sorted);
      })
      .catch(() => setProfiles([]))
      .finally(() => setLoading(false));
  }, []);

  const filteredProfiles =
    activeCategory === "all"
      ? profiles
      : profiles.filter((p) => p.category === activeCategory);

  const investorCount = profiles.filter((p) => p.category === "investor").length;
  const mentorCount = profiles.filter((p) => p.category === "mentor").length;
  const speakerCount = profiles.filter((p) => p.category === "speaker").length;

  if (!loading && profiles.length === 0) return null;

  return (
    <section
      className={`relative mx-2 sm:mx-3 overflow-hidden rounded-[2rem] sm:rounded-[2.25rem] border border-white/10 bg-[#09090b] py-14 sm:py-20 md:py-24 ${className ?? ""}`}
    >
      <div className="container relative mx-auto px-4">
        {/* Header */}
        <div className="mx-auto mb-10 sm:mb-12 max-w-3xl text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-violet-100/30 bg-violet-50/10 px-4 py-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-violet-400" />
            <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-violet-300">
              Top Titans
            </span>
          </div>

          <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white">
            Meet Our
          </h2>
          <p className="mt-2 text-2xl sm:text-3xl md:text-4xl font-extrabold text-violet-400 font-heading">
            Investors, Mentors & Speakers
          </p>
          <p className="mt-3 text-xs sm:text-base text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Venture partners, serial operators, and keynote speakers shaping India&apos;s next generation of startups.
          </p>

          {/* Interactive Filter Pills */}
          <div className="mt-7 flex flex-wrap items-center justify-center gap-2">
            {[
              { key: "all", label: "All Titans", count: profiles.length },
              { key: "investor", label: "Investors", count: investorCount },
              { key: "mentor", label: "Mentors", count: mentorCount },
              { key: "speaker", label: "Speakers", count: speakerCount },
            ].map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveCategory(tab.key as typeof activeCategory)}
                className={`rounded-full px-3.5 sm:px-4 py-1.5 text-xs sm:text-sm font-semibold transition-all duration-200 ${
                  activeCategory === tab.key
                    ? "bg-violet-600 text-white shadow-md shadow-violet-500/25"
                    : "bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white border border-white/10"
                }`}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </div>
        </div>

        {/* Profile Cards Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-violet-400 border-t-transparent" />
          </div>
        ) : filteredProfiles.length === 0 ? (
          <div className="mx-auto max-w-md py-12 text-center rounded-2xl border border-white/10 bg-white/[0.02] p-8">
            <Sparkles className="mx-auto h-8 w-8 text-violet-400 mb-3" />
            <h3 className="font-heading text-lg font-bold text-white">Profiles Arriving Soon</h3>
            <p className="mt-2 text-xs sm:text-sm text-slate-400">
              Profiles for this category are being verified and will be added here shortly.
            </p>
          </div>
        ) : (
          <div className="mx-auto mb-12 sm:mb-16 grid max-w-7xl grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {filteredProfiles.map((profile, i) => (
              <TitanCard key={profile.slug || `${profile.name}-${i}`} profile={profile} index={i} />
            ))}
          </div>
        )}

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button
            asChild
            size="lg"
            className="w-full sm:w-auto h-12 border border-violet-100/20 bg-violet-600 px-7 font-semibold text-white transition-all hover:bg-violet-700"
          >
            <a href="/past-speakers-investors">
              Explore All Titans <ArrowRight size={16} className="ml-1.5" />
            </a>
          </Button>

          <Button
            asChild
            size="lg"
            variant="outline"
            className="w-full sm:w-auto h-12 border-white/20 bg-transparent px-7 font-semibold text-slate-100 hover:bg-white/10 hover:text-white"
          >
            <a href="/mentors">
              Explore Mentors Network <ArrowRight size={16} className="ml-1.5" />
            </a>
          </Button>

          <Button
            asChild
            size="lg"
            variant="ghost"
            className="w-full sm:w-auto h-12 border border-transparent px-7 font-semibold text-slate-300 hover:bg-white/5 hover:text-white"
          >
            <a href="/join-us">Join the Network →</a>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default InvestorsSection;
