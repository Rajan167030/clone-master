import { useEffect, useState, type FormEvent } from "react";
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
  ExternalLink,
  UserCheck,
  CheckCircle2,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import EventBannerImage from "@/components/EventBannerImage";
import EventMapPreview from "@/components/EventMapPreview";
import EventLocationVisualizer from "@/components/EventLocationVisualizer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  getPublicEventBySlugApi,
  type DynamicEvent,
} from "@/lib/api";
import { optimizeCloudinaryUrl } from "@/lib/cloudinary";
import { getDisplayLocationLabel } from "@/lib/googleMaps";
import NotFound from "./NotFound";
import { useToast } from "@/hooks/use-toast";

const EventDetails = () => {
  const { slug = "" } = useParams();
  const { toast } = useToast();
  const [event, setEvent] = useState<DynamicEvent | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Local Registration Modal state
  const [isLocalModalOpen, setIsLocalModalOpen] = useState(false);
  const [registering, setRegistering] = useState(false);
  const [registeredSuccess, setRegisteredSuccess] = useState(false);
  const [localForm, setLocalForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    occupation: "",
    note: "",
  });

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
    toast({
      title: "Link Copied",
      description: "Event link copied to clipboard.",
    });
  };

  const handleLocalRegisterSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!localForm.fullName.trim() || !localForm.email.trim()) {
      toast({
        title: "Missing Fields",
        description: "Please fill in your name and email.",
        variant: "destructive",
      });
      return;
    }

    setRegistering(true);
    setTimeout(() => {
      setRegistering(false);
      setRegisteredSuccess(true);
      toast({
        title: "Registration Confirmed! 🎉",
        description: `You have successfully registered for ${event.title}.`,
      });
    }, 800);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Main Container */}
      <div className="container mx-auto px-4 pt-6 pb-16 space-y-8">
        {/* Back Link */}
        <div>
          <Link
            to="/events"
            className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
          >
            <ArrowLeft size={16} /> Back to all events
          </Link>
        </div>

        {/* Clean Banner Image Box (No white fade, No text overlay on picture) */}
        <div className="relative w-full overflow-hidden rounded-2xl border border-border/80 shadow-2xl bg-slate-950 min-h-[300px] md:min-h-[480px]">
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
        </div>

        {/* Event Header Information Bar (Directly below banner image) */}
        <Card className="border-border/80 shadow-xl bg-card">
          <CardContent className="p-6 md:p-8 space-y-6">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 border border-primary/20 px-3.5 py-1 text-xs font-semibold text-primary">
                <BadgeCheck size={14} className="text-primary" />
                Founders Connect Event
              </div>
              <h1 className="font-heading text-3xl font-extrabold tracking-tight text-foreground md:text-5xl">
                {event.title}
              </h1>
              {event.subtitle && (
                <p className="text-base md:text-lg text-muted-foreground leading-relaxed max-w-4xl">
                  {event.subtitle}
                </p>
              )}
            </div>

            {/* Date & Location Quick Badges */}
            <div className="flex flex-wrap items-center gap-3 pt-1 text-sm text-foreground">
              <div className="flex items-center gap-2 rounded-xl bg-muted/50 border border-border px-4 py-2.5">
                <CalendarDays size={18} className="text-primary shrink-0" />
                <span className="font-medium">{event.dateLabel}</span>
              </div>
              <div className="flex items-center gap-2 rounded-xl bg-muted/50 border border-border px-4 py-2.5">
                <MapPin size={18} className="text-primary shrink-0" />
                <span className="font-medium">{getDisplayLocationLabel(event.locationLabel)}</span>
              </div>
            </div>

            {/* Registration Options: External Link Redirect + Local App Registration */}
            <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-border">
              {/* Option 1: Hyperlink External Site Redirect */}
              <Button
                asChild
                size="lg"
                variant="outline"
                className="gap-2 border-primary/50 text-primary hover:bg-primary/10 font-semibold"
              >
                <a href={event.registrationUrl} target="_blank" rel="noreferrer">
                  Register via Link <ExternalLink size={18} />
                </a>
              </Button>

              {/* Option 2: Register directly on local app */}
              <Button
                type="button"
                size="lg"
                onClick={() => {
                  setRegisteredSuccess(false);
                  setIsLocalModalOpen(true);
                }}
                className="gap-2 bg-gradient-primary text-primary-foreground font-semibold shadow-md hover:shadow-lg transition-all"
              >
                <UserCheck size={18} /> Register on App (Local)
              </Button>

              <Button
                type="button"
                variant="outline"
                size="lg"
                className="gap-2"
                onClick={handleShare}
              >
                <Share2 size={18} /> Share Event
              </Button>

              <Button
                asChild
                variant="secondary"
                size="lg"
                className="gap-2"
              >
                <a href={event.calendarUrl} target="_blank" rel="noreferrer">
                  <CalendarDays size={18} /> Add to Calendar
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* All Event Details Section */}
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

            {/* Venue Location & Google Maps Visualizer Section */}
            <EventLocationVisualizer
              mapUrl={event.mapUrl}
              locationLabel={event.locationLabel}
              eventTitle={event.title}
            />

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
                <CardTitle className="text-xl">Registration Options</CardTitle>
                <CardDescription>{event.shortDescription}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col gap-2.5">
                  <Button
                    asChild
                    variant="outline"
                    className="w-full gap-2 border-primary/50 text-primary hover:bg-primary/10 font-semibold"
                  >
                    <a href={event.registrationUrl} target="_blank" rel="noreferrer">
                      Register via External Link <ExternalLink size={16} />
                    </a>
                  </Button>
                  <Button
                    type="button"
                    onClick={() => {
                      setRegisteredSuccess(false);
                      setIsLocalModalOpen(true);
                    }}
                    className="w-full gap-2 bg-gradient-primary text-primary-foreground font-semibold"
                  >
                    <UserCheck size={16} /> Register on App (Local)
                  </Button>
                </div>
                
                <div className="rounded-xl border bg-muted/30 p-4 text-sm">
                  <div className="mb-2 flex items-center gap-2 font-semibold">
                    <CalendarDays size={16} className="text-primary" />
                    Date & Location
                  </div>
                  <p className="text-muted-foreground">{event.dateLabel}</p>
                  <p className="text-muted-foreground font-medium">{getDisplayLocationLabel(event.locationLabel)}</p>
                  <div className="mt-3 overflow-hidden rounded-lg border border-border">
                    <EventMapPreview
                      mapUrl={event.mapUrl}
                      locationLabel={event.locationLabel}
                      className="h-48 w-full"
                      title={`Map for ${event.title}`}
                    />
                  </div>

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
                  type="button"
                  onClick={() => setIsLocalModalOpen(true)}
                  className="w-full bg-gradient-primary text-primary-foreground"
                >
                  Register Now
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
      </div>

      {/* Local Event Registration Modal */}
      <Dialog open={isLocalModalOpen} onOpenChange={setIsLocalModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl flex items-center gap-2">
              <UserCheck className="text-primary h-5 w-5" /> Local Event Registration
            </DialogTitle>
            <DialogDescription>
              Register directly for {event.title} on this app.
            </DialogDescription>
          </DialogHeader>

          {registeredSuccess ? (
            <div className="flex flex-col items-center justify-center py-6 text-center space-y-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                <CheckCircle2 size={32} />
              </div>
              <h3 className="text-xl font-bold text-foreground">You&apos;re Registered!</h3>
              <p className="text-sm text-muted-foreground max-w-xs">
                We have recorded your registration for <span className="font-semibold text-foreground">{event.title}</span>. Our team will reach out with further updates.
              </p>
              <Button
                type="button"
                className="mt-4"
                onClick={() => setIsLocalModalOpen(false)}
              >
                Close
              </Button>
            </div>
          ) : (
            <form onSubmit={handleLocalRegisterSubmit} className="space-y-4 pt-2">
              <div className="space-y-1.5">
                <label htmlFor="fullName" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Full Name <span className="text-destructive">*</span>
                </label>
                <Input
                  id="fullName"
                  placeholder="e.g. Jane Doe"
                  required
                  value={localForm.fullName}
                  onChange={(e) => setLocalForm((prev) => ({ ...prev, fullName: e.target.value }))}
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="email" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Email Address <span className="text-destructive">*</span>
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="e.g. jane@example.com"
                  required
                  value={localForm.email}
                  onChange={(e) => setLocalForm((prev) => ({ ...prev, email: e.target.value }))}
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="phone" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Phone Number
                </label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="e.g. 9876543210"
                  value={localForm.phone}
                  onChange={(e) => setLocalForm((prev) => ({ ...prev, phone: e.target.value }))}
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="occupation" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Occupation / Startup Name
                </label>
                <Input
                  id="occupation"
                  placeholder="e.g. Founder at TechCorp"
                  value={localForm.occupation}
                  onChange={(e) => setLocalForm((prev) => ({ ...prev, occupation: e.target.value }))}
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="note" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Note / Expectations
                </label>
                <Textarea
                  id="note"
                  placeholder="Anything specific you'd like to share or learn?"
                  rows={2}
                  value={localForm.note}
                  onChange={(e) => setLocalForm((prev) => ({ ...prev, note: e.target.value }))}
                />
              </div>

              <Button
                type="submit"
                disabled={registering}
                className="w-full bg-gradient-primary text-primary-foreground font-semibold mt-2"
              >
                {registering ? "Confirming Registration..." : "Complete Registration"}
              </Button>
            </form>
          )}
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default EventDetails;
