import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ExternalLink, MapPin } from "lucide-react";
import { getPublicEventsApi, type DynamicEvent } from "@/lib/api";
import { optimizeCloudinaryUrl } from "@/lib/cloudinary";
import EventBannerImage from "@/components/EventBannerImage";

const CARD_ROTATIONS = ["rotate-[-2.2deg]", "rotate-[1.6deg]", "rotate-[-1.3deg]"];
const TAPE_COLORS = [
  "bg-[#E8A93D]/75",
  "bg-[#6B8F71]/75",
  "bg-[#E4572E]/75",
  "bg-[#8B5CF6]/75",
  "bg-[#22D3EE]/75",
];

const hashString = (value: string) => {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
  return hash;
};

const extractDateMark = (dateLabel: string): { day: string; month: string } | null => {
  const dayFirst = dateLabel.match(/\b(\d{1,2})(?:st|nd|rd|th)?\b[^A-Za-z]{0,4}\b([A-Za-z]{3})[a-z]*\b/);
  if (dayFirst) return { day: dayFirst[1], month: dayFirst[2].toUpperCase() };

  const monthFirst = dateLabel.match(/\b([A-Za-z]{3})[a-z]*\b[^0-9]{0,4}\b(\d{1,2})(?:st|nd|rd|th)?\b/);
  if (monthFirst) return { day: monthFirst[2], month: monthFirst[1].toUpperCase() };

  return null;
};

const getEventStatus = (dateLabel: string): "upcoming" | "past" => {
  const parsed = new Date(dateLabel);
  if (!Number.isNaN(parsed.getTime())) {
    return parsed.getTime() >= Date.now() ? "upcoming" : "past";
  }
  return "upcoming";
};

const initialOf = (name: string) => (name || "F").trim().charAt(0).toUpperCase();

const UpcomingEventsSection = ({ className }: { className?: string }) => {
  const [events, setEvents] = useState<DynamicEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    getPublicEventsApi()
      .then((response) => {
        if (mounted) {
          setEvents((response.events || []).slice(0, 3));
          setLoading(false);
        }
      })
      .catch(() => {
        if (mounted) {
          setEvents([]);
          setLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  if (!loading && events.length === 0) {
    return null;
  }

  return (
    <section className={`bg-[#FAF7F0] bg-[radial-gradient(circle,#EFE9D8_1px,transparent_1px)] bg-[length:22px_22px] py-12 sm:py-16 md:py-24 lg:py-32 ${className || ""}`}>
      <div className="container mx-auto px-4">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between mb-10 md:mb-14">
          <div className="max-w-2xl">
            <div className="mb-4 inline-flex items-center gap-2 font-['IBM_Plex_Mono'] text-xs font-semibold uppercase tracking-[0.22em] text-[#6B8F71]">
              <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-[#6B8F71]" />
              <span>
                Events
              </span>
            </div>
            <h2 className="font-['Space_Grotesk'] font-extrabold text-3xl sm:text-4xl md:text-5xl text-[#1B1B1F] tracking-tight">
              Meet the community <span className="text-[#E4572E]">in person</span>
            </h2>
            <p className="font-['Inter'] text-sm sm:text-base text-[#6B6558] mt-3 md:mt-4">
              Curated founder meetups, pitch nights, and investor sessions happening right now.
            </p>
          </div>
          <Link
            to="/events"
            className="group inline-flex shrink-0 items-center gap-1.5 border-b border-[#1B1B1F]/30 pb-0.5 font-['IBM_Plex_Mono'] text-[11px] font-semibold uppercase tracking-[0.1em] text-[#1B1B1F]/75 transition-colors duration-200 hover:border-[#1B1B1F] hover:text-[#1B1B1F] w-fit"
          >
            View all events
            <ArrowRight size={15} className="transition-transform duration-200 group-hover:translate-x-1" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 gap-x-8 gap-y-12 min-[900px]:grid-cols-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-[430px] bg-white p-3 shadow-[0_10px_24px_rgba(27,27,31,0.12)] animate-pulse">
                <div className="h-3/5 bg-[#F1EDE2]" />
                <div className="mt-4 h-3 w-2/3 bg-[#EFE9D8]" />
                <div className="mt-3 h-5 w-5/6 bg-[#EFE9D8]" />
                <div className="mt-3 h-16 bg-[#EFE9D8]" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-x-8 gap-y-16 min-[900px]:grid-cols-3">
            {events.map((event, index) => {
              const rotation = CARD_ROTATIONS[index % CARD_ROTATIONS.length];
              const category = (event.tags[0] || "event").toLowerCase();
              const tapeColor = TAPE_COLORS[hashString(category) % TAPE_COLORS.length];
              const dateMark = extractDateMark(event.dateLabel);
              const status = getEventStatus(event.dateLabel);

              return (
                <div
                  key={event.slug}
                  className={`group relative flex flex-col bg-white p-3 pb-4 shadow-[0_10px_24px_rgba(27,27,31,0.14)] transition-all duration-[280ms] ease-[cubic-bezier(0.22,1,0.36,1)] hover:z-10 hover:-translate-y-1.5 hover:rotate-0 hover:shadow-[0_20px_38px_rgba(27,27,31,0.24)] focus-within:z-10 focus-within:-translate-y-1.5 focus-within:rotate-0 focus-within:shadow-[0_20px_38px_rgba(27,27,31,0.24)] motion-reduce:transition-none motion-reduce:transform-none ${rotation}`}
                >
                  <span
                    aria-hidden="true"
                    className="absolute -top-2 right-7 z-20 h-4 w-4 rounded-full bg-[#E4572E] shadow-[inset_-2px_-2px_3px_rgba(0,0,0,0.35),inset_2px_2px_2px_rgba(255,255,255,0.5),0_2px_4px_rgba(0,0,0,0.3)]"
                  />
                  <span
                    aria-hidden="true"
                    className={`absolute -left-4 -top-3 z-10 rotate-[-6deg] px-3 py-1 font-['Caveat'] text-base font-semibold lowercase text-[#1B1B1F]/80 ${tapeColor}`}
                  >
                    {category}
                  </span>

                  <div className="relative overflow-hidden bg-[#F1EDE2]">
                    {event.mobileBannerImage ? (
                      <>
                        <EventBannerImage src={optimizeCloudinaryUrl(event.mobileBannerImage, 800)} alt={event.bannerAlt || event.title} className="relative block aspect-[4/3] w-full md:hidden" />
                        <EventBannerImage src={optimizeCloudinaryUrl(event.bannerImage, 800)} alt={event.bannerAlt || event.title} className="relative hidden aspect-[4/3] w-full md:block" />
                      </>
                    ) : (
                      <EventBannerImage src={optimizeCloudinaryUrl(event.bannerImage, 800)} alt={event.bannerAlt || event.title} className="relative aspect-[4/3] w-full" />
                    )}

                    {dateMark && (
                      <div aria-hidden="true" className="absolute left-3 top-3 z-10 flex h-12 w-12 items-center justify-center">
                        <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full opacity-55" aria-hidden="true">
                          <ellipse cx="50" cy="50" rx="44" ry="38" fill="none" stroke="#1B1B1F" strokeWidth="3" transform="rotate(-6 50 50)" />
                        </svg>
                        <span className="relative flex flex-col items-center font-['Caveat'] font-bold leading-none text-[#1B1B1F]">
                          <span className="text-xl">{dateMark.day}</span>
                          <span className="text-[10px] tracking-wide">{dateMark.month}</span>
                        </span>
                      </div>
                    )}

                    <span
                      className={`absolute bottom-2 right-2 rotate-[-9deg] rounded-sm border-2 px-2 py-0.5 font-['IBM_Plex_Mono'] text-[10px] font-bold uppercase tracking-[0.14em] ${
                        status === "upcoming"
                          ? "border-[#1B7A3D] text-[#1B7A3D] bg-white/90"
                          : "border-[#6B6558] text-[#6B6558] bg-white/90"
                      }`}
                    >
                      {status === "upcoming" ? "RSVP Open" : "Archived"}
                    </span>
                  </div>

                  <div className="mt-3 flex flex-wrap items-center gap-2 font-['IBM_Plex_Mono'] text-[11px] text-[#6B6558]">
                    <span>{event.dateLabel}</span>
                    {event.locationLabel && (
                      <a
                        href={event.mapUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.locationLabel)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center gap-1 font-semibold text-[#E4572E] hover:underline"
                        title="Visualize location on Google Maps"
                      >
                        <MapPin size={12} /> {event.locationLabel}
                      </a>
                    )}
                    {event.ticketLabel ? <span>· {event.ticketLabel}</span> : null}
                  </div>

                  <h3 className="mt-1.5 line-clamp-2 font-['Space_Grotesk'] text-[19px] font-bold leading-snug text-[#1B1B1F]">
                    {event.title}
                  </h3>

                  <p className="mt-2 line-clamp-3 font-['Inter'] text-[13.5px] leading-relaxed text-[#6B6558]">
                    {event.shortDescription || event.subtitle}
                  </p>

                  {event.tags.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {event.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="rounded-sm border border-[#1B1B1F]/15 px-2 py-0.5 font-['IBM_Plex_Mono'] text-[10px] text-[#6B6558]"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="my-4 border-t border-dashed border-[#1B1B1F]/20" />

                  <div className="mt-auto flex items-center justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-2">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#1B1B1F] font-['IBM_Plex_Mono'] text-[10px] font-semibold text-white">
                        {initialOf(event.hostLogoText || event.hostName)}
                      </span>
                      <span className="truncate font-['Inter'] text-xs font-medium text-[#1B1B1F]">
                        {event.hostName || "Founders Connect"}
                      </span>
                    </div>
                    <div className="flex shrink-0 items-center gap-3">
                      <Link
                        to={`/events/${event.slug}`}
                        className="font-['IBM_Plex_Mono'] text-[11px] font-semibold uppercase tracking-[0.1em] text-[#1B1B1F]/70 underline decoration-dashed decoration-[#1B1B1F]/30 underline-offset-4 transition-colors hover:text-[#1B1B1F] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#E4572E]"
                      >
                        Details
                      </Link>
                      <a
                        href={event.registrationUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 font-['IBM_Plex_Mono'] text-[11px] font-semibold uppercase tracking-[0.1em] text-[#E4572E] transition-colors hover:text-[#c8471f] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#E4572E]"
                      >
                        Register <ExternalLink size={12} />
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};

export default UpcomingEventsSection;
