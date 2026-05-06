import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, CalendarDays, MapPin, Ticket } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { events } from "@/lib/events";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useSEO } from "@/hooks/useSEO";
import {
  getMyEventRegistrationsApi,
  getPublicEventsApi,
  type DynamicEvent,
  type EventRegistration,
} from "@/lib/api";
import { getToken, getSession } from "@/lib/session";

const Events = () => {
  // SEO Hook
  useSEO({
    title: "Upcoming Events | Founders Connect",
    description: "Discover founder meetups, investor networking nights, and exclusive member events. Connect with India's top founders and investors at Founders Connect events.",
    keywords: "founder events, networking events, startup events India, investor meetups, founder meetups",
    ogType: "website",
    canonicalUrl: "https://founders.connect/events",
  });
  const token = useMemo(() => getToken(), []);
  const session = useMemo(() => getSession(), []);
  const isMember = useMemo(() => {
    if (!session?.account) return false;
    return session.account.membershipTier && session.account.membershipTier !== "free";
  }, [session]);
  const [registrations, setRegistrations] = useState<EventRegistration[]>([]);
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

  useEffect(() => {
    if (!token) {
      return;
    }

    getMyEventRegistrationsApi(token)
      .then((response) => {
        setRegistrations(response.registrations);
      })
      .catch(() => {
        setRegistrations([]);
      });
  }, [token]);

  const registrationsBySlug = new Map(registrations.map((item) => [item.slug, item]));

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <section className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto mb-10 max-w-3xl text-center">
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-primary">Founders Connect Events</p>
            <h1 className="font-heading text-4xl font-extrabold md:text-5xl">Discover curated founder-first events.</h1>
            <p className="mt-4 text-muted-foreground">
              Every event card is dynamic and linked to its own detail page with FAQ, registration, host details, and full context.
            </p>
            <div className="mt-6 space-y-3">
              <div className="inline-flex rounded-full border border-violet-200 bg-violet-50 px-4 py-2 text-sm font-medium text-violet-800">
                You currently have {registrations.length} event registration{registrations.length === 1 ? "" : "s"}.
              </div>
              <div className="mt-3">
                {isMember ? (
                  <div className="inline-flex rounded-full border border-green-200 bg-green-50 px-4 py-2 text-sm font-medium text-green-800">
                    ✓ Member Account - All events FREE
                  </div>
                ) : (
                  <div className="inline-flex rounded-full border border-orange-200 bg-orange-50 px-4 py-2 text-sm font-medium text-orange-800">
                    Non-Member - Events ₹999 each | <Link to="/membership" className="ml-2 font-semibold hover:underline">Upgrade to save</Link>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {eventList.map((event) => (
              <Card key={event.slug} className="overflow-hidden border-border/60 shadow-lg hover-scale">
                <img src={event.bannerImage} alt={event.bannerAlt} className="h-48 w-full object-cover" />
                <CardHeader>
                  <div className="flex items-start justify-between gap-3">
                    <CardTitle className="text-xl leading-snug">{event.title}</CardTitle>
                    <div className="flex flex-wrap gap-2 justify-end">
                      {registrationsBySlug.has(event.slug) && (
                        <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100">
                          {registrationsBySlug.get(event.slug)?.status === "attended" ? "Attended" : "Registered"}
                        </Badge>
                      )}
                      {isMember ? (
                        <Badge className="bg-green-100 text-green-800 hover:bg-green-100 flex items-center gap-1">
                          <Ticket size={12} /> FREE
                        </Badge>
                      ) : (
                        <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100 flex items-center gap-1">
                          <Ticket size={12} /> ₹999
                        </Badge>
                      )}
                    </div>
                  </div>
                  <CardDescription>{event.subtitle}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="mb-4 text-sm text-muted-foreground">{event.shortDescription}</p>
                  <div className="mb-4 space-y-2 text-xs text-muted-foreground">
                    <p className="inline-flex items-center gap-1">
                      <CalendarDays size={13} /> {event.dateLabel}
                    </p>
                    <p className="inline-flex items-center gap-1">
                      <MapPin size={13} /> {event.locationLabel}
                    </p>
                  </div>
                  <div className="mb-5 flex flex-wrap gap-2">
                    {event.tags.slice(0, 3).map((tag) => (
                      <Badge key={tag} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  <Link to={`/events/${event.slug}`} className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline">
                    {registrationsBySlug.has(event.slug) ? "Manage Registration" : "View Event"}
                    <ArrowRight size={15} />
                  </Link>
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
