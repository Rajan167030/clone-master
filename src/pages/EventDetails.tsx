import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  CalendarDays,
  MapPin,
  Share2,
  Users,
  Ticket,
  Sparkles,
  BadgeCheck,
  MessageCircle,
  PlayCircle,
  Image,
  ArrowRight,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import EventBannerImage from "@/components/EventBannerImage";
import EventMapPreview from "@/components/EventMapPreview";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import {
  getPublicEventBySlugApi,
  type DynamicEvent,
} from "@/lib/api";
import { optimizeCloudinaryUrl } from "@/lib/cloudinary";
import NotFound from "./NotFound";

const EventDetails = () => {
  const { slug = "" } = useParams();
  const [event, setEvent] = useState<DynamicEvent | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isActive = true;
    setIsLoading(true);
    setEvent(null);

    getPublicEventBySlugApi(slug)
      .then((response) => {
        if (isActive) {
          setEvent(response.event);
        }
      })
      .catch(() => {
        if (isActive) {
          setEvent(null);
        }
      })
      .finally(() => {
        if (isActive) {
          setIsLoading(false);
        }
      });

    return () => {
      isActive = false;
    };
  }, [slug]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto flex min-h-[60vh] items-center justify-center px-4">
          <div className="rounded-2xl border bg-background/80 px-6 py-4 text-sm text-muted-foreground shadow-lg">
            Loading event details...
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!event) {
    return <NotFound />;
  }

  const handleShare = async () => {
    const shareData = {
      title: `${event.title} | ${event.subtitle}`,
      text: event.shortDescription,
      url: window.location.href,
    };

    if (navigator.share) {
      await navigator.share(shareData);
      return;
    }

    await navigator.clipboard.writeText(window.location.href);
    window.alert("Event link copied to clipboard.");
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Full-width Banner Hero Section */}
      <section className="relative w-full overflow-hidden bg-slate-950 text-white min-h-[60vh] md:min-h-[70vh] flex flex-col justify-between">
        <div className="absolute inset-0 z-0">
          {event.mobileBannerImage ? (
            <>
              <EventBannerImage
                src={optimizeCloudinaryUrl(event.mobileBannerImage, 900)}
                alt={event.bannerAlt || event.title}
                className="absolute inset-0 block md:hidden"
              />
              <EventBannerImage
                src={optimizeCloudinaryUrl(event.bannerImage, 1400)}
                alt={event.bannerAlt || event.title}
                className="absolute inset-0 hidden md:block"
              />
            </>
          ) : (
            <EventBannerImage
              src={optimizeCloudinaryUrl(event.bannerImage, 1400)}
              alt={event.bannerAlt || event.title}
              className="absolute inset-0"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/65 to-slate-950/70" />
        </div>

        {/* Top bar with back button */}
        <div className="container relative z-10 mx-auto px-4 pt-6">
          <Link
            to="/events"
            className="inline-flex items-center gap-2 rounded-full bg-background/80 px-4 py-2 text-sm font-semibold text-foreground backdrop-blur-md transition-all hover:bg-background hover:shadow-md"
          >
            <ArrowLeft size={16} /> Back to all events
          </Link>
        </div>

        {/* Hero banner content */}
        <div className="container relative z-10 mx-auto px-4 py-12 md:py-16">
          <div className="max-w-4xl space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/20 border border-primary/30 px-3.5 py-1 text-xs font-semibold text-primary backdrop-blur-md">
              <BadgeCheck size={14} className="text-primary" />
              Founders Connect Event
            </div>
            <h1 className="font-heading text-3xl font-extrabold tracking-tight text-foreground md:text-5xl lg:text-6xl drop-shadow-sm">
              {event.title}
            </h1>
            {event.subtitle && (
              <p className="text-base text-muted-foreground md:text-xl max-w-3xl leading-relaxed">
                {event.subtitle}
              </p>
            )}

            {/* Key Quick Details on Hero */}
            <div className="flex flex-wrap items-center gap-3 pt-2 text-sm text-foreground">
              <div className="flex items-center gap-2 rounded-xl bg-background/70 backdrop-blur-md border border-border/60 px-4 py-2.5 shadow-sm">
                <CalendarDays size={18} className="text-primary shrink-0" />
                <span className="font-medium">{event.dateLabel}</span>
              </div>
              <div className="flex items-center gap-2 rounded-xl bg-background/70 backdrop-blur-md border border-border/60 px-4 py-2.5 shadow-sm">
                <MapPin size={18} className="text-primary shrink-0" />
                <span className="font-medium">{event.locationLabel}</span>
              </div>
            </div>

            {/* Main Action CTAs on Hero */}
            <div className="flex flex-wrap items-center gap-3 pt-4">
              <Button
                asChild
                size="lg"
                className="gap-2 bg-gradient-primary text-primary-foreground font-semibold shadow-lg hover:shadow-xl transition-all"
              >
                <a href={event.registrationUrl} target="_blank" rel="noreferrer">
                  I&apos;m Interested <ArrowRight size={18} />
                </a>
              </Button>
              <Button
                type="button"
                variant="outline"
                size="lg"
                className="gap-2 bg-background/80 backdrop-blur-md border-border/80 hover:bg-background"
                onClick={handleShare}
              >
                <Share2 size={18} /> Share Event
              </Button>
              <Button
                asChild
                variant="secondary"
                size="lg"
                className="gap-2 bg-secondary/80 backdrop-blur-md hover:bg-secondary"
              >
                <a href={event.calendarUrl} target="_blank" rel="noreferrer">
                  <CalendarDays size={18} /> Add to Calendar
                </a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* All Event Details Section (Below Full-Size Banner) */}
      <section className="container mx-auto px-4 py-12">
        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-6">
            <Card className="card-gradient shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl">About the event</CardTitle>
                <CardDescription>
                  {event.title} | {event.subtitle}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-muted-foreground">
                {event.about.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </CardContent>
            </Card>

            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Sparkles size={18} className="text-primary" /> What to Expect
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  {event.expectations.map((item) => (
                    <li key={item} className="rounded-lg border bg-muted/20 px-3 py-2">
                      {item}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl">What Makes This Different</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  {event.differentiators.map((item) => (
                    <li key={item} className="rounded-lg border bg-muted/20 px-3 py-2">
                      {item}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl">Frequently Asked Questions</CardTitle>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible>
                  {event.faqs.map((faq, index) => (
                    <AccordionItem key={faq.question} value={`faq-${index}`}>
                      <AccordionTrigger className="text-left">{faq.question}</AccordionTrigger>
                      <AccordionContent>{faq.answer}</AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="border-border/60 shadow-xl">
              <CardHeader>
                <CardTitle className="text-xl">Registration & Location Details</CardTitle>
                <CardDescription>{event.shortDescription}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button
                  asChild
                  className="w-full gap-2 bg-gradient-primary text-primary-foreground font-semibold"
                >
                  <a href={event.registrationUrl} target="_blank" rel="noreferrer">
                    I&apos;m Interested <ArrowRight size={16} />
                  </a>
                </Button>
                
                <div className="rounded-xl border bg-muted/30 p-4 text-sm">
                  <div className="mb-2 flex items-center gap-2 font-semibold">
                    <CalendarDays size={16} className="text-primary" />
                    Date & Location
                  </div>
                  <p className="text-muted-foreground">{event.dateLabel}</p>
                  <p className="text-muted-foreground">{event.locationLabel}</p>
                  {event.mapUrl && (
                    <div className="mt-3 overflow-hidden rounded-lg border border-border">
                      <EventMapPreview mapUrl={event.mapUrl} className="h-48 w-full" title={`Map for ${event.title}`} />
                    </div>
                  )}
                  {event.mapUrl && (
                    <a
                      href={event.mapUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-2 inline-flex items-center gap-1 text-primary hover:underline"
                    >
                      <MapPin size={14} /> View on map
                    </a>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Users size={18} className="text-primary" /> Host
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3 rounded-xl border bg-muted/20 p-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-primary font-heading font-bold text-primary-foreground">
                    {event.hostLogoText}
                  </div>
                  <div>
                    <p className="font-semibold">Founders Connect</p>
                    <p className="text-sm text-muted-foreground">{event.hostName}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Ticket size={18} className="text-primary" /> Ticket Info
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm text-muted-foreground">
                <p>{event.ticketLabel}</p>
                <Button
                  asChild
                  className="w-full bg-gradient-primary text-primary-foreground"
                >
                  <a
                    href={event.registrationUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Register Now
                  </a>
                </Button>
                <p className="rounded-lg border bg-muted/20 p-3">
                  <span className="font-semibold text-foreground">Refund Policy: </span>
                  {event.refundPolicy}
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <MessageCircle size={18} className="text-primary" /> Reactions
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-lg border p-3">
                  <p className="font-semibold">excited</p>
                  <p className="text-muted-foreground">0</p>
                </div>
                <div className="rounded-lg border p-3">
                  <p className="font-semibold">interested</p>
                  <p className="text-muted-foreground">0</p>
                </div>
                <div className="rounded-lg border p-3">
                  <p className="font-semibold">skeptical</p>
                  <p className="text-muted-foreground">0</p>
                </div>
                <div className="rounded-lg border p-3">
                  <p className="font-semibold">not for me</p>
                  <p className="text-muted-foreground">1</p>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl">Event Photos & Videos</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  {event.photos.map((item, index) => (
                    <div key={item + index} className="rounded-lg border bg-muted/20 p-3 text-sm text-muted-foreground">
                      <Image size={15} className="mb-1 text-primary" />
                      {item}
                    </div>
                  ))}
                  {event.videos.map((item, index) => (
                    <div key={item + index} className="rounded-lg border bg-muted/20 p-3 text-sm text-muted-foreground">
                      <PlayCircle size={15} className="mb-1 text-primary" />
                      {item}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl">Event Tags</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                {event.tags.map((tag) => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default EventDetails;
