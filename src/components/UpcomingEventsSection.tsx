import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, CalendarDays, MapPin } from "lucide-react";
import { getPublicEventsApi, type DynamicEvent } from "@/lib/api";
import { optimizeCloudinaryUrl } from "@/lib/cloudinary";
import EventBannerImage from "@/components/EventBannerImage";

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
    <section className={`py-12 sm:py-16 md:py-24 lg:py-32 ${className}`}>
      <div className="container mx-auto px-4">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between mb-10 md:mb-14">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-4">
              <span className="text-[10px] md:text-[11px] font-semibold uppercase tracking-widest text-primary">
                Events
              </span>
            </div>
            <h2 className="font-heading font-bold text-3xl sm:text-4xl md:text-5xl text-foreground tracking-tight">
              Meet the community <span className="text-gradient">in person</span>
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground mt-3 md:mt-4">
              Curated founder meetups, pitch nights, and investor sessions happening right now.
            </p>
          </div>
          <Link
            to="/events"
            className="group inline-flex shrink-0 items-center gap-1.5 text-sm font-medium text-foreground border-b border-foreground/30 pb-0.5 transition-colors duration-200 hover:border-foreground w-fit"
          >
            View all events
            <ArrowRight size={15} className="transition-transform duration-200 group-hover:translate-x-1" />
          </Link>
        </div>

        {loading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-[360px] rounded-2xl bg-muted/50 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {events.map((event) => (
              <Link
                key={event.slug}
                to={`/events/${event.slug}`}
                className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition-shadow duration-300 hover:shadow-lg"
              >
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted">
                  <EventBannerImage
                    src={optimizeCloudinaryUrl(event.bannerImage, 800)}
                    alt={event.bannerAlt || event.title}
                    className="absolute inset-0 transition-transform duration-500 group-hover:scale-[1.03]"
                  />
                  {event.tags[0] && (
                    <span className="absolute left-4 top-4 rounded-full border border-border bg-background/95 px-3 py-1 font-mono text-[11px] font-medium text-foreground backdrop-blur-sm">
                      {event.tags[0]}
                    </span>
                  )}
                </div>

                <div className="flex flex-1 flex-col p-6">
                  <h3 className="font-heading text-lg font-semibold leading-snug text-foreground line-clamp-2 mb-2 group-hover:text-primary transition-colors duration-200">
                    {event.title}
                  </h3>
                  {event.shortDescription && (
                    <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed mb-4">
                      {event.shortDescription}
                    </p>
                  )}

                  <div className="mt-auto flex flex-col gap-1.5 pt-4 border-t border-border text-xs text-muted-foreground">
                    {event.dateLabel && (
                      <span className="inline-flex items-center gap-1.5">
                        <CalendarDays size={13} /> {event.dateLabel}
                      </span>
                    )}
                    {event.locationLabel && (
                      <span className="inline-flex items-center gap-1.5">
                        <MapPin size={13} /> {event.locationLabel}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default UpcomingEventsSection;
