import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ExternalLink, ArrowRight } from "lucide-react";
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

const DEMO_INVESTORS: SpeakerInvestorProfile[] = [
  { _id: "1", slug: "vikram-malhotra", category: "investor", name: "Mr. Vikram Malhotra",  designation: "Managing Partner",    company: "Sequoia India",   order: 1, linkedinUrl: "https://linkedin.com/in/vikram-malhotra", introduction: "Leading venture investor focused on enterprise SaaS and deep tech startups across India.", isActive: true },
  { _id: "2", slug: "sunita-rao",      category: "investor", name: "Ms. Sunita Rao",       designation: "Angel Investor",       company: "100X.VC",         order: 2, linkedinUrl: "https://linkedin.com/in/sunita-rao",      introduction: "Angel investor and mentor supporting early-stage founders building consumer tech solutions.", isActive: true },
  { _id: "3", slug: "rohit-bansal",    category: "investor", name: "Mr. Rohit Bansal",     designation: "Venture Partner",      company: "Kalaari Capital", order: 3, linkedinUrl: "https://linkedin.com/in/rohit-bansal",    introduction: "Focused on fintech, healthtech, and logistics innovation with expertise in India's startup ecosystem.", isActive: true },
  { _id: "4", slug: "ananya-singh",    category: "investor", name: "Ms. Ananya Singh",     designation: "Principal",            company: "Accel India",     order: 4, linkedinUrl: "https://linkedin.com/in/ananya-singh",    introduction: "Investing in B2B SaaS and climate tech companies creating global impact from India.", isActive: true },
  { _id: "5", slug: "deepak-verma",    category: "investor", name: "Mr. Deepak Verma",     designation: "Founder & GP",         company: "Blume Ventures",  order: 5, linkedinUrl: "https://linkedin.com/in/deepak-verma",    introduction: "Dedicated to supporting early-stage founders with mentorship and capital deployment.", isActive: true },
  { _id: "6", slug: "kavitha-nair",    category: "investor", name: "Ms. Kavitha Nair",     designation: "Investment Director",  company: "Nexus VP",        order: 6, linkedinUrl: "https://linkedin.com/in/kavitha-nair",    introduction: "Passionate about diversity and backing women entrepreneurs in the startup space.", isActive: true },
];

const InvestorCard = ({
  profile,
  index,
}: {
  profile: SpeakerInvestorProfile;
  index: number;
}) => {
  const photoUrl = profile.photoUrl || RANDOM_AVATARS[index % RANDOM_AVATARS.length];

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.08, duration: 0.4 }}
      className="group relative flex flex-col overflow-hidden rounded-[24px] bg-slate-900 border border-white/5 aspect-[3/4] w-full max-w-sm mx-auto shadow-xl"
    >
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
      
      {/* Default Bottom Gradient Overlay */}
      <div className="absolute inset-x-0 bottom-0 h-[60%] bg-gradient-to-t from-[#020202] via-[#020202]/60 to-transparent transition-opacity duration-300" />

      {/* Hover Overlay Gradient (Full dark overlay for better text readability on hover) */}
      <div className="absolute inset-0 bg-[#020202]/80 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

      {/* Content Container */}
      <div className="relative flex h-full flex-col justify-end p-6 z-10">
        
        {/* Hover Bio Text (Reveals on hover) */}
        <div className="overflow-hidden transition-all duration-500 max-h-0 opacity-0 group-hover:max-h-60 group-hover:opacity-100 mb-0 group-hover:mb-4">
          <p className="text-sm text-slate-300 line-clamp-5 leading-relaxed">
            {profile.introduction || "No description provided."}
          </p>
          {profile.linkedinUrl && (
            <a
              href={profile.linkedinUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-violet-400 hover:text-violet-300 transition-colors"
            >
              <ExternalLink size={14} /> View LinkedIn
            </a>
          )}
        </div>

        {/* Name and Designation */}
        <div className="transition-transform duration-300 transform translate-y-0 group-hover:-translate-y-2">
          <h3 className="font-heading text-xl font-bold text-white">{profile.name}</h3>
          <p className="mt-1 text-sm font-medium text-slate-300">
            {profile.designation}{profile.company ? ` - ${profile.company}` : ''}
          </p>
        </div>
      </div>
    </motion.div>
  );
};

const InvestorsSection = ({ className }: { className?: string }) => {
  const [investors, setInvestors] = useState<SpeakerInvestorProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPublicSpeakerInvestorProfilesApi()
      .then((res) => {
        const inv = res.profiles.filter((p) => p.category === "investor").sort((a, b) => a.order - b.order);
        setInvestors(inv.length > 0 ? inv : DEMO_INVESTORS);
      })
      .catch(() => setInvestors(DEMO_INVESTORS))
      .finally(() => setLoading(false));
  }, []);

  const displayInvestors = investors.length > 0 ? investors : (loading ? [] : DEMO_INVESTORS);

  return (
    <section
      className={`relative mx-3 overflow-hidden rounded-[2.25rem] border border-white/10 bg-gradient-to-b from-[#111113] via-[#09090b] to-[#020202] py-20 sm:py-24 ${className ?? ""}`}
    >
      {/* Background radial glow */}
      <div className="pointer-events-none absolute inset-0 opacity-40 [background:radial-gradient(circle_at_top,_rgba(139,92,246,0.1),_transparent_60%)]" />
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-48 [background:radial-gradient(ellipse_at_bottom,_rgba(45,212,191,0.06),_transparent_70%)]" />

      <div className="container relative mx-auto px-4">
        {/* Header */}
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-violet-100/40 bg-violet-50/10 px-4 py-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-violet-400" />
            <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-violet-300">
              Top Titans
            </span>
          </div>
          <h2 className="font-heading text-4xl font-bold tracking-tight text-white md:text-5xl">
            Meet Our{" "}
            <span className="bg-gradient-to-r from-violet-300 to-violet-400 bg-clip-text text-transparent">
              Investors
            </span>
          </h2>
          <p className="mt-4 text-base text-slate-400">
            Venture partners and angel investors shaping India's next generation of startups.
          </p>
        </div>

        {/* Investor Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-violet-400 border-t-transparent" />
          </div>
        ) : (
          <div className="mx-auto mb-16 grid max-w-7xl grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {displayInvestors.map((investor, i) => (
              <InvestorCard key={investor.slug} profile={investor} index={i} />
            ))}
          </div>
        )}

        {/* CTA Buttons */}
        <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button
            asChild
            size="lg"
            className="h-12 border border-violet-100/20 bg-white/[0.02] px-8 font-semibold text-white transition-all hover:bg-white/[0.06]"
          >
            <a href="/past-speakers-investors#investors">
              View All Investors <ArrowRight size={18} className="ml-1" />
            </a>
          </Button>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="h-12 border-white/20 bg-transparent px-8 font-semibold text-slate-100 hover:bg-white/10 hover:text-white"
          >
            <a href="/join-us">Join the Network <ArrowRight size={18} className="ml-1" /></a>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default InvestorsSection;
