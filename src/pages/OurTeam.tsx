import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BackButton from "@/components/BackButton";
import PixelTransition from "@/components/ui/PixelTransition";
import { useSEO } from "@/hooks/useSEO";
import { getPublicTeamMembersApi } from "@/lib/api";
import { X, ExternalLink, Briefcase, Users } from "lucide-react";

type MemberShape = {
  name: string;
  role: string;
  imageUrl: string;
  linkedinUrl?: string;
};

const LinkedinIcon = ({ size = 16 }: { size?: number }) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    style={{ width: size, height: size }}
    aria-hidden="true"
  >
    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
  </svg>
);

const DEFAULT_TEAM_MEMBERS: MemberShape[] = [
  { name: "Ashish Shah", role: "Visionary Leader", imageUrl: "https://images.unsplash.com/photo-1557862921-37829c790f19?q=80&w=600&h=750&fit=crop", linkedinUrl: "https://linkedin.com/in/ashishshah" },
  { name: "Piyush Kanth", role: "Tech Guru", imageUrl: "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?q=80&w=600&h=750&fit=crop", linkedinUrl: "https://linkedin.com/in/piyushkanth" },
  { name: "Rajan Jha", role: "Creative Head", imageUrl: "https://images.unsplash.com/photo-1564564321837-a57b7070ac5c?q=80&w=600&h=750&fit=crop", linkedinUrl: "https://linkedin.com/in/rajanjha" },
  { name: "Kedarnath", role: "Marketing Maestro", imageUrl: "https://images.unsplash.com/photo-1615109398623-88346a601842?q=80&w=600&h=750&fit=crop", linkedinUrl: "https://linkedin.com/in/kedarnath" },
  { name: "Unnati Verma", role: "Product Lead", imageUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=600&h=750&fit=crop", linkedinUrl: "https://linkedin.com/in/unnativerma" },
  { name: "Shalni", role: "Design Expert", imageUrl: "https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=600&h=750&fit=crop", linkedinUrl: "https://linkedin.com/in/shalni" },
  { name: "Tushar", role: "Frontend Wizard", imageUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=600&h=750&fit=crop", linkedinUrl: "https://linkedin.com/in/tushar" },
  { name: "Shivansh", role: "Backend Rockstar", imageUrl: "https://images.unsplash.com/photo-1548142813-c348350df52b?q=80&w=600&h=750&fit=crop", linkedinUrl: "https://linkedin.com/in/shivansh" },
];

/* ─── Member Detail Modal ─── */
const MemberModal = ({
  member,
  onClose,
}: {
  member: MemberShape;
  onClose: () => void;
}) => {
  // Close on backdrop click
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  // Close on Escape key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-label={`${member.name} profile`}
    >
      <div className="relative w-full max-w-md rounded-3xl overflow-hidden shadow-2xl border border-purple-500/20 bg-gradient-to-b from-slate-900 to-slate-950 animate-in zoom-in-95 duration-200">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-all"
          aria-label="Close"
        >
          <X size={18} />
        </button>

        {/* Full photo */}
        <div className="relative h-72 w-full overflow-hidden bg-slate-800">
          <img
            src={member.imageUrl}
            alt={member.name}
            className="h-full w-full object-cover object-top"
          />
          {/* Gradient overlay at bottom */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/30 to-transparent" />
        </div>

        {/* Info section */}
        <div className="px-7 pb-8 pt-5 space-y-5">
          {/* Name + Role */}
          <div>
            <h2 className="font-heading text-2xl font-extrabold text-white leading-tight">
              {member.name}
            </h2>
            <div className="mt-2 inline-flex items-center gap-2 rounded-full bg-purple-500/15 border border-purple-500/30 px-3 py-1">
              <Briefcase size={13} className="text-purple-300" />
              <span className="text-xs font-semibold text-purple-200">{member.role}</span>
            </div>
          </div>

          {/* Team affiliation */}
          <div className="flex items-start gap-3 rounded-xl bg-white/5 border border-white/10 p-4">
            <Users size={18} className="text-purple-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Organization</p>
              <p className="text-sm text-slate-200 font-medium mt-0.5">Founders Connect</p>
              <p className="text-xs text-slate-400 mt-0.5">{member.role} • Core Team</p>
            </div>
          </div>

          {/* LinkedIn button */}
          {member.linkedinUrl ? (
            <a
              href={member.linkedinUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex w-full items-center justify-center gap-2.5 rounded-xl bg-[#0A66C2] hover:bg-[#0856a8] text-white font-semibold text-sm px-5 py-3 transition-all duration-200 shadow-lg hover:shadow-blue-900/30 hover:-translate-y-0.5"
              onClick={(e) => e.stopPropagation()}
            >
              <LinkedinIcon size={18} />
              View LinkedIn Profile
              <ExternalLink size={14} className="opacity-75" />
            </a>
          ) : (
            <div className="flex w-full items-center justify-center gap-2 rounded-xl bg-white/5 border border-white/10 text-slate-500 text-sm px-5 py-3">
              <LinkedinIcon size={16} />
              No LinkedIn profile linked
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/* ─── Main Page ─── */
const OurTeam = () => {
  const [members, setMembers] = useState<MemberShape[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMember, setSelectedMember] = useState<MemberShape | null>(null);

  useSEO({
    title: "Our Team | Founders Connect",
    description: "Meet the passionate individuals driving the Founders Connect vision forward.",
  });

  useEffect(() => {
    getPublicTeamMembersApi()
      .then((res) => {
        setMembers(res.members && res.members.length > 0 ? res.members : DEFAULT_TEAM_MEMBERS);
      })
      .catch(() => setMembers(DEFAULT_TEAM_MEMBERS))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-background font-body text-foreground">
      <Navbar />
      <main className="container mx-auto px-4 py-24">
        <BackButton className="px-0 mx-0 max-w-none mb-6 animate-reveal-left" />

        <div className="text-center max-w-2xl mx-auto mb-16">
          <h1 className="font-heading font-bold text-4xl md:text-5xl text-foreground tracking-tight">
            Meet Our Team
          </h1>
          <p className="text-muted-foreground mt-4 text-lg">
            The passionate individuals driving our vision forward.
          </p>
          <p className="text-sm text-muted-foreground/60 mt-2">
            Click any card to learn more • Hover to see name &amp; role
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="aspect-[4/5] rounded-2xl bg-muted animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
            {members.map((member) => (
              <div
                key={member.name}
                className="flex flex-col items-center cursor-pointer"
                onClick={() => setSelectedMember(member)}
              >
                {/* Card with pixel hover effect */}
                <PixelTransition
                  firstContent={
                    <div className="relative w-full h-full bg-slate-950 overflow-hidden">
                      {/* Full photo */}
                      <img
                        src={member.imageUrl}
                        alt={member.name}
                        className="w-full h-full object-cover object-top"
                        loading="lazy"
                      />

                      {/* Bottom gradient + name/role overlay */}
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950 via-slate-900/60 to-transparent p-3 pt-10">
                        <h3 className="font-heading text-sm font-bold text-white drop-shadow">{member.name}</h3>
                        <p className="text-[11px] text-purple-300 font-medium">{member.role}</p>
                      </div>

                      {/* LinkedIn badge top-right */}
                      {member.linkedinUrl && (
                        <div className="absolute top-2.5 right-2.5 flex h-7 w-7 items-center justify-center rounded-full bg-[#0A66C2] shadow-lg shadow-blue-900/40">
                          <LinkedinIcon size={14} />
                        </div>
                      )}

                      {/* Tap hint */}
                      <div className="absolute top-2.5 left-2.5 rounded-full bg-black/40 backdrop-blur-sm px-2 py-0.5 text-[9px] font-semibold text-white/70 uppercase tracking-wider">
                        Click for details
                      </div>
                    </div>
                  }
                  secondContent={
                    <div className="w-full h-full flex flex-col items-center justify-center bg-purple-950/95 backdrop-blur-sm p-5 text-center gap-3">
                      <h3 className="font-heading text-xl font-extrabold text-white leading-tight">{member.name}</h3>
                      <div className="inline-flex items-center gap-1.5 rounded-full bg-purple-500/20 border border-purple-400/30 px-3 py-1">
                        <Briefcase size={12} className="text-purple-300" />
                        <span className="text-[11px] font-semibold text-purple-200">{member.role}</span>
                      </div>
                      <p className="text-xs text-purple-300/70 mt-1">Founders Connect • Core Team</p>
                      <div className="mt-1 flex items-center gap-2 text-[11px] text-white/50 font-medium">
                        <span className="h-px w-8 bg-white/20" />
                        tap to view profile
                        <span className="h-px w-8 bg-white/20" />
                      </div>
                    </div>
                  }
                  pixelColor="#8b5cf6"
                  className="mx-auto shadow-xl"
                  aspectRatio="125%"
                />
              </div>
            ))}
          </div>
        )}
      </main>
      <Footer />

      {/* Member Detail Modal */}
      {selectedMember && (
        <MemberModal member={selectedMember} onClose={() => setSelectedMember(null)} />
      )}
    </div>
  );
};

export default OurTeam;