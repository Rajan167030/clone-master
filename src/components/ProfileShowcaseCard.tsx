import { ArrowRight, ExternalLink, Eye, X } from "lucide-react";
import type { SpeakerInvestorProfile } from "@/lib/api";

const getInitials = (name: string) =>
  name
    .replace(/^(mr|mrs|ms|dr)\.?\s+/i, "")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

/* ─────────────────────────────────────────────────────────────────────────
   Premium profile card — shared by speakers + investors pages, with a proper
   hover interaction: whole card lifts, image zooms + gets a scrim,
   a "View Profile" affordance fades in, and the socials nudge upward.
───────────────────────────────────────────────────────────────────────── */
const ACCENT_STYLES = {
  teal: {
    label: "text-teal-600",
    ring: "hover:border-teal-300",
    glow: "hover:shadow-[0_24px_60px_-24px_rgba(13,148,136,0.35)]",
    social: "hover:bg-teal-50 hover:text-teal-600 hover:border-teal-200",
  },
  indigo: {
    label: "text-indigo-600",
    ring: "hover:border-indigo-300",
    glow: "hover:shadow-[0_24px_60px_-24px_rgba(79,70,229,0.35)]",
    social: "hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200",
  },
} as const;

export const PremiumProfileCard = ({
  profile,
  photoUrl,
  photoAlt,
  fallbackLabel,
  accent,
  onCardClick,
  wide = false,
}: {
  profile: SpeakerInvestorProfile;
  photoUrl?: string;
  photoAlt: string;
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
        {photoUrl ? (
          <img
            src={photoUrl}
            alt={photoAlt}
            className="h-full w-full object-cover object-top transition-transform duration-500 ease-out group-hover:scale-110"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-indigo-50 to-white transition-transform duration-500 ease-out group-hover:scale-110">
            <span className="text-4xl font-extrabold tracking-tight text-indigo-300">{getInitials(profile.name)}</span>
          </div>
        )}
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
          </div>
        </div>
      </div>
    </article>
  );
};

/* ─────────────────────────────────────────────────────────────────────────
   Detailed Profile Modal
───────────────────────────────────────────────────────────────────────── */
export const DetailedProfileModal = ({
  profile,
  photoUrl,
  onClose,
}: {
  profile: SpeakerInvestorProfile;
  photoUrl?: string;
  onClose: () => void;
}) => (
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
          {photoUrl ? (
            <img
              src={photoUrl}
              alt={profile.name}
              className="h-full w-full object-cover object-top"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-indigo-50 text-2xl font-extrabold text-indigo-400">
              {getInitials(profile.name)}
            </div>
          )}
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
