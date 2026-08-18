import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ExternalLink, Search, Filter, MapPin } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BackButton from "@/components/BackButton";
import EventBannerImage from "@/components/EventBannerImage";
import { useSEO } from "@/hooks/useSEO";
import {
  getPublicEventsApi,
  type DynamicEvent,
} from "@/lib/api";
import { optimizeCloudinaryUrl } from "@/lib/cloudinary";

// Full literal Tailwind class strings (not built from interpolated values) so
// the JIT scanner can pick them up — cycled per card index/category.
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

// Best-effort day/month extraction from the admin-authored free-text dateLabel
// (e.g. "30 Aug 2026" or "Sat, Aug 15, 2026 • 5:00 PM") — purely for the
// hand-circled date mark. Falls back to hiding the mark if unparsable.
const extractDateMark = (dateLabel: string): { day: string; month: string } | null => {
  const dayFirst = dateLabel.match(/\b(\d{1,2})(?:st|nd|rd|th)?\b[^A-Za-z]{0,4}\b([A-Za-z]{3})[a-z]*\b/);
  if (dayFirst) return { day: dayFirst[1], month: dayFirst[2].toUpperCase() };

  const monthFirst = dateLabel.match(/\b([A-Za-z]{3})[a-z]*\b[^0-9]{0,4}\b(\d{1,2})(?:st|nd|rd|th)?\b/);
  if (monthFirst) return { day: monthFirst[2], month: monthFirst[1].toUpperCase() };

  return null;
};

// Same free-text dateLabel doesn't guarantee a machine-parsable date, so this
// only flips to "past" when it can confidently parse one — otherwise it
// defaults to "upcoming" rather than mislabeling a real event.
const getEventStatus = (dateLabel: string): "upcoming" | "past" => {
  const parsed = new Date(dateLabel);
  if (!Number.isNaN(parsed.getTime())) {
    return parsed.getTime() >= Date.now() ? "upcoming" : "past";
  }
  return "upcoming";
};

const initialOf = (name: string) => (name || "F").trim().charAt(0).toUpperCase();

const Events = () => {
  const navigate = useNavigate();

  // SEO Hook
  useSEO({
    title: "Upcoming Events | Founders Connect",
    description: "Discover founder meetups, investor networking nights, and exclusive member events. Connect with India's top founders and investors at Founders Connect events.",
    keywords: "founder events, networking events, startup events India, investor meetups, founder meetups",
    ogType: "website",
    canonicalUrl: "https://founders.connect/events",
  });

  const [eventList, setEventList] = useState<DynamicEvent[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTag, setSelectedTag] = useState("All");

  useEffect(() => {
    getPublicEventsApi()
      .then((response) => {
        if (response.events.length) {
          setEventList(response.events);
        }
      })
      .catch(() => {
        setEventList([]);
      });
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <section className="relative bg-[#FAF7F0] bg-[radial-gradient(circle,#EFE9D8_1px,transparent_1px)] bg-[length:22px_22px] pt-6 pb-16 md:pt-8">
        <div className="container mx-auto px-4">
          <BackButton className="px-0 mx-0 max-w-none mb-6 animate-reveal-left" />

          <div className="mx-auto mb-10 max-w-3xl text-center">
            <p className="mb-3 inline-flex items-center gap-2 font-['IBM_Plex_Mono'] text-xs font-semibold uppercase tracking-[0.22em] text-[#6B8F71]">
              <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-[#6B8F71]" />
              Founders Connect Events
            </p>
            <h1 className="font-['Space_Grotesk'] text-4xl font-extrabold tracking-tight text-[#1B1B1F] md:text-5xl">
              Discover curated founder-first <span className="text-[#E4572E]">events.</span>
            </h1>
            <p className="mt-4 font-[#6B6558] text-sm md:text-base">
              Click any event card to view full details or register directly.
            </p>
          </div>

          <div className="mb-12 flex flex-col items-center justify-between gap-4 rounded-sm border border-[#1B1B1F]/10 bg-white p-4 shadow-[0_6px_16px_rgba(27,27,31,0.08)] sm:flex-row md:mb-16">
            <div className="relative w-full sm:w-96">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Search size={16} className="text-[#6B6558]" />
              </div>
              <input
                type="text"
                placeholder="Search events..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-sm border border-[#1B1B1F]/15 bg-white py-2.5 pl-10 pr-4 font-['Inter'] text-sm text-[#1B1B1F] focus:border-[#E4572E] focus:outline-none focus:ring-1 focus:ring-[#E4572E]"
              />
            </div>
            <div className="relative flex w-full items-center gap-2 sm:w-auto">
              <Filter size={16} className="hidden text-[#6B6558] sm:block" />
              <select
                value={selectedTag}
                onChange={(e) => setSelectedTag(e.target.value)}
                className="w-full cursor-pointer rounded-sm border border-[#1B1B1F]/15 bg-white px-4 py-2.5 font-['Inter'] text-sm text-[#1B1B1F] focus:border-[#E4572E] focus:outline-none focus:ring-1 focus:ring-[#E4572E] sm:w-48"
              >
                <option value="All">All Categories</option>
                {Array.from(new Set(eventList.flatMap(e => e.tags))).sort().map(tag => (
                  <option key={tag} value={tag}>{tag}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-x-8 gap-y-16 min-[900px]:grid-cols-3">
            {eventList.filter(event => {
              const matchesSearch = (event.title + " " + event.subtitle + " " + event.shortDescription + " " + event.locationLabel)
                .toLowerCase().includes(searchTerm.toLowerCase());
              const matchesTag = selectedTag === "All" || event.tags.includes(selectedTag);
              return matchesSearch && matchesTag;
            }).map((event, index) => {
              const rotation = CARD_ROTATIONS[index % CARD_ROTATIONS.length];
              const category = (event.tags[0] || "event").toLowerCase();
              const tapeColor = TAPE_COLORS[hashString(category) % TAPE_COLORS.length];
              const dateMark = extractDateMark(event.dateLabel);
              const status = getEventStatus(event.dateLabel);

              return (
                <div
                  key={event.slug}
                  role="button"
                  tabIndex={0}
                  onClick={() => navigate(`/events/${event.slug}`)}
                  onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && navigate(`/events/${event.slug}`)}
                  className={`group relative flex flex-col bg-white p-3 pb-4 cursor-pointer shadow-[0_10px_24px_rgba(27,27,31,0.14)] transition-all duration-[280ms] ease-[cubic-bezier(0.22,1,0.36,1)] hover:z-10 hover:-translate-y-1.5 hover:rotate-0 hover:shadow-[0_20px_38px_rgba(27,27,31,0.24)] focus-within:z-10 focus-within:-translate-y-1.5 focus-within:rotate-0 focus-within:shadow-[0_20px_38px_rgba(27,27,31,0.24)] motion-reduce:transition-none motion-reduce:transform-none ${rotation}`}
                >
                  {/* Pushpin */}
                  <span
                    aria-hidden="true"
                    className="absolute -top-2 right-7 z-20 h-4 w-4 rounded-full bg-[#E4572E] shadow-[inset_-2px_-2px_3px_rgba(0,0,0,0.35),inset_2px_2px_2px_rgba(255,255,255,0.5),0_2px_4px_rgba(0,0,0,0.3)]"
                  />

                  {/* Washi tape */}
                  <span
                    aria-hidden="true"
                    className={`absolute -left-4 -top-3 z-10 rotate-[-6deg] px-3 py-1 font-['Caveat'] text-base font-semibold lowercase text-[#1B1B1F]/80 ${tapeColor}`}
                  >
                    {category}
                  </span>

                  {/* Photo, with hand-circled date + RSVP/Archived stamp */}
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

                  {/* Meta */}
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

                  {/* Title */}
                  <h3 className="mt-1.5 line-clamp-2 font-['Space_Grotesk'] text-[19px] font-bold leading-snug text-[#1B1B1F]">
                    {event.title}
                  </h3>

                  {/* Excerpt */}
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

                  {/* Tear line */}
                  <div className="my-4 border-t border-dashed border-[#1B1B1F]/20" />

                  {/* Footer */}
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
                        onClick={(e) => e.stopPropagation()}
                        className="font-['IBM_Plex_Mono'] text-[11px] font-semibold uppercase tracking-[0.1em] text-[#1B1B1F]/70 underline decoration-dashed decoration-[#1B1B1F]/30 underline-offset-4 transition-colors hover:text-[#1B1B1F] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#E4572E]"
                      >
                        Details
                      </Link>
                      <a
                        href={event.registrationUrl}
                        target="_blank"
                        rel="noreferrer"
                        onClick={(e) => e.stopPropagation()}
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
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default Events;

