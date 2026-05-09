import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, CalendarDays, MapPin, Ticket, ExternalLink } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { events } from "@/lib/events";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useSEO } from "@/hooks/useSEO";
import {
  getPublicEventsApi,
  type DynamicEvent,
} from "@/lib/api";

const Events = () => {
  // SEO Hook
  useSEO({
    title: "Upcoming Events | Founders Connect",
    description: "Discover founder meetups, investor networking nights, and exclusive member events. Connect with India's top founders and investors at Founders Connect events.",
    keywords: "founder events, networking events, startup events India, investor meetups, founder meetups",
    ogType: "website",
    canonicalUrl: "https://founders.connect/events",
  });

  const [eventList, setEventList] = useState<DynamicEvent[]>(events);

  useEffect(() => {
    getPublicEventsApi()
      .then((response) => {
        if (response.events.length) {
          setEventList(response.events);
        }
      })
      .catch(() => {
        setEventList(events);
      });
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <section className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto mb-10 max-w-3xl text-center">
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-primary">Founders Connect Events</p>
            <h1 className="font-heading text-4xl font-extrabold md:text-5xl">Discover curated founder-first events.</h1>
            <p className="mt-4 text-muted-foreground">
              Every event is linked to an external registration platform (Luma, Eventbrite, etc.) for a seamless RSVP experience.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {eventList.map((event) => (
              <Card key={event.slug} className="overflow-hidden border-border/60 shadow-lg hover-scale flex flex-col">
                <img src={event.bannerImage} alt={event.bannerAlt} className="h-48 w-full object-cover" />
                <CardHeader>
                  <div className="flex items-start justify-between gap-3">
                    <CardTitle className="text-xl leading-snug">{event.title}</CardTitle>
                    <div className="flex flex-wrap gap-2 justify-end">
                      {event.ticketLabel ? (
                        <Badge className="bg-violet-100 text-violet-800 hover:bg-violet-100 flex items-center gap-1">
                          <Ticket size={12} /> {event.ticketLabel}
                        </Badge>
                      ) : (
                        <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100 flex items-center gap-1">
                          <Ticket size={12} /> Founders Connect
                        </Badge>
                      )}
                    </div>
                  </div>
                  <CardDescription className="line-clamp-1">{event.subtitle}</CardDescription>
                </CardHeader>
                <CardContent className="flex-grow">
                  <p className="mb-4 text-sm text-muted-foreground line-clamp-2">{event.shortDescription}</p>
                  <div className="mb-4 space-y-2 text-xs text-muted-foreground">
                    <p className="flex items-center gap-1">
                      <CalendarDays size={13} /> {event.dateLabel}
                    </p>
                    <p className="flex items-center gap-1">
                      <MapPin size={13} /> {event.locationLabel}
                    </p>
                  </div>
                  <div className="mb-6 flex flex-wrap gap-2">
                    {event.tags.slice(0, 3).map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-[10px]">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  
                  <div className="mt-auto grid grid-cols-2 gap-3">
                    <Button asChild variant="outline" size="sm" className="w-full">
                      <Link to={`/events/${event.slug}`}>
                        Details
                      </Link>
                    </Button>
                    <Button asChild size="sm" className="w-full bg-primary hover:bg-primary/90">
                      <a href={event.registrationUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1">
                        Register <ExternalLink size={14} />
                      </a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default Events;
