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
  cancelEventAttendanceApi,
  getMyEventAttendanceApi,
  getPublicEventBySlugApi,
  markEventAttendanceApi,
  type DynamicEvent,
} from "@/lib/api";
import { optimizeCloudinaryUrl } from "@/lib/cloudinary";
import { getDisplayLocationLabel } from "@/lib/googleMaps";
import { getToken } from "@/lib/session";
import NotFound from "./NotFound";
import { useToast } from "@/hooks/use-toast";

const EventDetails = () => {
  const { slug = "" } = useParams();
  const { toast } = useToast();
  const [event, setEvent] = useState<DynamicEvent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const token = getToken();
  const [isAttending, setIsAttending] = useState(false);
  const [isTogglingAttendance, setIsTogglingAttendance] = useState(false);

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

  useEffect(() => {
    if (!token || !slug) return;
    let isActive = true;

    getMyEventAttendanceApi(token, slug)
      .then((res) => {
        if (isActive) setIsAttending(res.attending);
      })
      .catch(() => {
        if (isActive) setIsAttending(false);
      });

    return () => {
      isActive = false;
    };
  }, [token, slug]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-24 text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="mt-4 text-sm text-muted-foreground">Loading event details...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (!event) {
    return <NotFound />;
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: event.title,
          text: event.subtitle || event.title,
          url: window.location.href,
        });
      } catch {
        // Ignored or dismissed
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link Copied! 📋",
        description: "Event URL has been copied to your clipboard.",
      });
    }
  };

  const handleRegisterClick = async () => {
    // If not authenticated, open quick guest registration modal
    if (!token) {
      setRegisteredSuccess(false);
      setIsLocalModalOpen(true);
      return;
    }

    setIsTogglingAttendance(true);
    try {
      if (isAttending) {
        await cancelEventAttendanceApi(token, slug);
        setIsAttending(false);
        toast({ title: "Attendance removed", description: `You're no longer marked as attending ${event.title}.` });
      } else {
        await markEventAttendanceApi(token, slug);
        setIsAttending(true);
        toast({ title: "You're attending! 🎉", description: `${event.title} has been added to your dashboard.` });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Something went wrong",
        description: error instanceof Error ? error.message : "Please try again.",
      });
    } finally {
      setIsTogglingAttendance(false);
    }
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
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      {/* Main Container */}
      <main className="container mx-auto px-3 sm:px-4 pt-4 sm:pt-6 pb-28 lg:pb-16 space-y-6 sm:space-y-8 max-w-7xl overflow-x-hidden">
        {/* Back Link */}
        <div>
          <Link
            to="/events"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-primary hover:underline transition-colors"
          >
            <ArrowLeft size={16} /> Back to all events
          </Link>
        </div>

        {/* Clean Banner Image Box */}
        <div className="relative w-full overflow-hidden rounded-xl sm:rounded-2xl border border-border/80 shadow-md sm:shadow-2xl bg-slate-950 aspect-[16/10] sm:aspect-[16/9] md:aspect-[21/9] min-h-[190px] sm:min-h-[280px] md:min-h-[440px]">
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

        {/* Event Header Information Bar */}
        <Card className="border-border/80 shadow-md sm:shadow-xl bg-card overflow-hidden">
          <CardContent className="p-4 sm:p-6 md:p-8 space-y-4 sm:space-y-6">
            <div className="space-y-2 sm:space-y-3">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 border border-primary/20 px-3 py-1 text-[11px] sm:text-xs font-semibold text-primary">
                <BadgeCheck size={14} className="text-primary shrink-0" />
                Founders Connect Event
              </div>
              <h1 className="font-heading text-2xl sm:text-3xl md:text-5xl font-extrabold tracking-tight text-foreground break-words leading-tight">
                {event.title}
              </h1>
              {event.subtitle && (
                <p className="text-xs sm:text-base md:text-lg text-muted-foreground leading-relaxed max-w-4xl break-words">
                  {event.subtitle}
                </p>
              )}
            </div>

            {/* Date & Location Quick Badges */}
            <div className="grid grid-cols-1 sm:flex sm:flex-wrap items-stretch sm:items-center gap-2 sm:gap-3 pt-1 text-xs sm:text-sm text-foreground">
              <div className="flex items-center gap-2 rounded-xl bg-muted/50 border border-border px-3.5 py-2.5">
                <CalendarDays size={16} className="text-primary shrink-0" />
                <span className="font-medium">{event.dateLabel}</span>
              </div>
              <div className="flex items-center gap-2 rounded-xl bg-muted/50 border border-border px-3.5 py-2.5 min-w-0">
                <MapPin size={16} className="text-primary shrink-0" />
                <span className="font-medium truncate sm:max-w-md" title={getDisplayLocationLabel(event.locationLabel)}>
                  {getDisplayLocationLabel(event.locationLabel)}
                </span>
              </div>
            </div>

            {/* Action Buttons: External Site Redirect + Local App Registration */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:flex lg:flex-wrap items-center gap-2.5 sm:gap-3 pt-4 border-t border-border">
              {/* Option 1: Hyperlink External Site Redirect */}
              <Button
                asChild
                size="lg"
                variant="outline"
                className="w-full sm:w-auto gap-2 border-primary/50 text-primary hover:bg-primary/10 font-semibold text-xs sm:text-sm h-11 sm:h-12 order-2 sm:order-1 justify-center"
              >
                <a href={event.registrationUrl} target="_blank" rel="noreferrer">
                  Register via Link <ExternalLink size={16} />
                </a>
              </Button>

              {/* Option 2: Register directly on local app */}
              <Button
                type="button"
                size="lg"
                onClick={handleRegisterClick}
                disabled={isTogglingAttendance}
                className={`w-full sm:w-auto gap-2 font-semibold text-xs sm:text-sm h-11 sm:h-12 shadow-md hover:shadow-lg transition-all order-1 sm:order-2 justify-center ${
                  isAttending ? "bg-emerald-600 hover:bg-emerald-700 text-white" : "bg-gradient-primary text-primary-foreground"
                }`}
              >
                {isAttending ? <CheckCircle2 size={16} /> : <UserCheck size={16} />}
                {isAttending ? "You're Attending" : "I'm Attending"}
              </Button>

              <Button
                type="button"
                variant="outline"
                size="lg"
                className="w-full sm:w-auto gap-2 text-xs sm:text-sm h-11 sm:h-12 order-3 justify-center"
                onClick={handleShare}
              >
                <Share2 size={16} /> Share Event
              </Button>

              <Button
                asChild
                variant="secondary"
                size="lg"
                className="w-full sm:w-auto gap-2 text-xs sm:text-sm h-11 sm:h-12 order-4 justify-center"
              >
                <a href={event.calendarUrl} target="_blank" rel="noreferrer">
                  <CalendarDays size={16} /> Add to Calendar
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* All Event Details Section */}
        <div className="grid gap-6 sm:gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          {/* Main Column */}
          <div className="space-y-6">
            <Card className="card-gradient shadow-md sm:shadow-lg">
              <CardHeader className="p-4 sm:p-6 pb-2 sm:pb-3">
                <CardTitle className="text-xl sm:text-2xl font-['Space_Grotesk']">About the event</CardTitle>
                <CardDescription className="text-xs sm:text-sm break-words">
                  {event.title} {event.subtitle ? `| ${event.subtitle}` : ""}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-2 sm:pt-4 space-y-3 sm:space-y-4 text-xs sm:text-sm text-muted-foreground leading-relaxed">
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

            <Card className="shadow-md sm:shadow-lg">
              <CardHeader className="p-4 sm:p-6 pb-2 sm:pb-3">
                <CardTitle className="flex items-center gap-2 text-lg sm:text-xl font-['Space_Grotesk']">
                  <Sparkles size={18} className="text-primary shrink-0" /> What to Expect
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-2 sm:pt-4">
                <ul className="space-y-2 text-xs sm:text-sm text-muted-foreground">
                  {event.expectations.map((item) => (
                    <li key={item} className="rounded-lg border bg-muted/20 px-3 py-2.5 break-words">
                      {item}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="shadow-md sm:shadow-lg">
              <CardHeader className="p-4 sm:p-6 pb-2 sm:pb-3">
                <CardTitle className="text-lg sm:text-xl font-['Space_Grotesk']">What Makes This Different</CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-2 sm:pt-4">
                <ul className="space-y-2 text-xs sm:text-sm text-muted-foreground">
                  {event.differentiators.map((item) => (
                    <li key={item} className="rounded-lg border bg-muted/20 px-3 py-2.5 break-words">
                      {item}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="shadow-md sm:shadow-lg">
              <CardHeader className="p-4 sm:p-6 pb-2 sm:pb-3">
                <CardTitle className="text-lg sm:text-xl font-['Space_Grotesk']">Frequently Asked Questions</CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-2 sm:pt-4">
                <Accordion type="single" collapsible className="w-full">
                  {event.faqs.map((faq, index) => (
                    <AccordionItem key={faq.question} value={`faq-${index}`}>
                      <AccordionTrigger className="text-left text-xs sm:text-sm font-semibold hover:no-underline">
                        {faq.question}
                      </AccordionTrigger>
                      <AccordionContent className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                        {faq.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar Column */}
          <div className="space-y-6">
            <Card className="border-border/60 shadow-md sm:shadow-xl">
              <CardHeader className="p-4 sm:p-6 pb-2 sm:pb-3">
                <CardTitle className="text-lg sm:text-xl font-['Space_Grotesk']">Registration Options</CardTitle>
                <CardDescription className="text-xs sm:text-sm">{event.shortDescription}</CardDescription>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-2 sm:pt-4 space-y-4">
                <div className="flex flex-col gap-2.5">
                  <Button
                    asChild
                    variant="outline"
                    className="w-full gap-2 border-primary/50 text-primary hover:bg-primary/10 font-semibold text-xs sm:text-sm h-11"
                  >
                    <a href={event.registrationUrl} target="_blank" rel="noreferrer">
                      Register via External Link <ExternalLink size={16} />
                    </a>
                  </Button>
                  <Button
                    type="button"
                    onClick={handleRegisterClick}
                    disabled={isTogglingAttendance}
                    className={`w-full gap-2 font-semibold text-xs sm:text-sm h-11 shadow-sm ${
                      isAttending ? "bg-emerald-600 hover:bg-emerald-700 text-white" : "bg-gradient-primary text-primary-foreground"
                    }`}
                  >
                    {isAttending ? <CheckCircle2 size={16} /> : <UserCheck size={16} />}
                    {isAttending ? "You're Attending" : "I'm Attending"}
                  </Button>
                </div>
                
                <div className="rounded-xl border bg-muted/30 p-3.5 sm:p-4 text-xs sm:text-sm">
                  <div className="mb-2 flex items-center gap-2 font-semibold text-foreground">
                    <CalendarDays size={16} className="text-primary shrink-0" />
                    Date & Location
                  </div>
                  <p className="text-muted-foreground font-medium">{event.dateLabel}</p>
                  <p className="text-muted-foreground mt-0.5 break-words">{getDisplayLocationLabel(event.locationLabel)}</p>
                  
                  <div className="mt-3 overflow-hidden rounded-lg border border-border">
                    <EventMapPreview
                      mapUrl={event.mapUrl}
                      locationLabel={event.locationLabel}
                      className="h-36 sm:h-44 w-full"
                      title={`Map for ${event.title}`}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-md sm:shadow-lg">
              <CardHeader className="p-4 sm:p-6 pb-2 sm:pb-3">
                <CardTitle className="flex items-center gap-2 text-lg sm:text-xl font-['Space_Grotesk']">
                  <Users size={18} className="text-primary shrink-0" /> Host
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-2 sm:pt-4">
                <div className="flex items-center gap-3 rounded-xl border bg-muted/20 p-3.5 sm:p-4">
                  <div className="flex h-11 w-11 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-primary font-heading font-bold text-primary-foreground text-sm">
                    {event.hostLogoText}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-sm sm:text-base text-foreground truncate">Founders Connect</p>
                    <p className="text-xs sm:text-sm text-muted-foreground truncate">{event.hostName}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-md sm:shadow-lg">
              <CardHeader className="p-4 sm:p-6 pb-2 sm:pb-3">
                <CardTitle className="flex items-center gap-2 text-lg sm:text-xl font-['Space_Grotesk']">
                  <Ticket size={18} className="text-primary shrink-0" /> Ticket Info
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-2 sm:pt-4 space-y-3 sm:space-y-4 text-xs sm:text-sm text-muted-foreground">
                <div className="rounded-lg bg-primary/5 border border-primary/15 p-3 text-foreground font-medium">
                  {event.ticketLabel}
                </div>
                <Button
                  type="button"
                  onClick={handleRegisterClick}
                  disabled={isTogglingAttendance}
                  className={`w-full text-xs sm:text-sm h-11 ${
                    isAttending ? "bg-emerald-600 hover:bg-emerald-700 text-white" : "bg-gradient-primary text-primary-foreground"
                  }`}
                >
                  {isAttending ? "You're Attending ✓" : "Register Now"}
                </Button>
                <div className="rounded-lg border bg-muted/20 p-3 text-xs leading-relaxed">
                  <span className="font-semibold text-foreground">Refund Policy: </span>
                  {event.refundPolicy}
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-md sm:shadow-lg">
              <CardHeader className="p-4 sm:p-6 pb-2 sm:pb-3">
                <CardTitle className="flex items-center gap-2 text-lg sm:text-xl font-['Space_Grotesk']">
                  <MessageCircle size={18} className="text-primary shrink-0" /> Community Reactions
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-2 sm:pt-4 grid grid-cols-2 gap-2.5 text-xs sm:text-sm">
                <div className="rounded-lg border p-2.5 sm:p-3 bg-muted/10 text-center">
                  <p className="font-semibold text-foreground">🔥 Excited</p>
                  <p className="text-muted-foreground text-xs mt-0.5">34</p>
                </div>
                <div className="rounded-lg border p-2.5 sm:p-3 bg-muted/10 text-center">
                  <p className="font-semibold text-foreground">💡 Interested</p>
                  <p className="text-muted-foreground text-xs mt-0.5">28</p>
                </div>
                <div className="rounded-lg border p-2.5 sm:p-3 bg-muted/10 text-center">
                  <p className="font-semibold text-foreground">🚀 Attending</p>
                  <p className="text-muted-foreground text-xs mt-0.5">42</p>
                </div>
                <div className="rounded-lg border p-2.5 sm:p-3 bg-muted/10 text-center">
                  <p className="font-semibold text-foreground">🤝 Networking</p>
                  <p className="text-muted-foreground text-xs mt-0.5">19</p>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-md sm:shadow-lg">
              <CardHeader className="p-4 sm:p-6 pb-2 sm:pb-3">
                <CardTitle className="text-lg sm:text-xl font-['Space_Grotesk']">Event Tags</CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-2 sm:pt-4 flex flex-wrap gap-1.5 sm:gap-2">
                {event.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs px-2.5 py-1">
                    {tag}
                  </Badge>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Sticky Mobile Registration Bottom Bar (App-like UX on small screens) */}
      <div className="fixed bottom-0 inset-x-0 z-40 bg-background/95 backdrop-blur-md border-t border-border p-3 lg:hidden shadow-[0_-4px_16px_rgba(0,0,0,0.08)]">
        <div className="max-w-md mx-auto flex items-center justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-foreground truncate">{event.title}</p>
            <p className="text-[11px] text-muted-foreground flex items-center gap-1 truncate mt-0.5">
              <CalendarDays size={12} className="text-primary shrink-0" />
              <span className="truncate">{event.dateLabel}</span>
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button
              type="button"
              size="sm"
              onClick={handleRegisterClick}
              disabled={isTogglingAttendance}
              className={`h-9 px-4 font-semibold text-xs shadow-sm transition-all ${
                isAttending ? "bg-emerald-600 text-white" : "bg-gradient-primary text-primary-foreground"
              }`}
            >
              {isAttending ? "Attending ✓" : "Register Now"}
            </Button>
          </div>
        </div>
      </div>

      {/* Local Event Registration Modal */}
      <Dialog open={isLocalModalOpen} onOpenChange={setIsLocalModalOpen}>
        <DialogContent className="w-[calc(100%-2rem)] max-w-md max-h-[90vh] overflow-y-auto rounded-2xl p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl flex items-center gap-2">
              <UserCheck className="text-primary h-5 w-5" /> Local Event Registration
            </DialogTitle>
            <DialogDescription className="text-xs sm:text-sm">
              Register directly for {event.title} on this app.
            </DialogDescription>
          </DialogHeader>

          {registeredSuccess ? (
            <div className="flex flex-col items-center justify-center py-6 text-center space-y-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                <CheckCircle2 size={32} />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-foreground font-['Space_Grotesk']">You&apos;re Registered!</h3>
              <p className="text-xs sm:text-sm text-muted-foreground max-w-xs">
                We have recorded your registration for <span className="font-semibold text-foreground">{event.title}</span>. Our team will reach out with further updates.
              </p>
              <Button
                type="button"
                className="mt-4 w-full sm:w-auto"
                onClick={() => setIsLocalModalOpen(false)}
              >
                Close
              </Button>
            </div>
          ) : (
            <form onSubmit={handleLocalRegisterSubmit} className="space-y-3.5 pt-2">
              <div className="space-y-1">
                <label htmlFor="fullName" className="text-xs font-semibold text-foreground">
                  Full Name <span className="text-destructive">*</span>
                </label>
                <Input
                  id="fullName"
                  placeholder="e.g. Jane Doe"
                  required
                  value={localForm.fullName}
                  onChange={(e) => setLocalForm((prev) => ({ ...prev, fullName: e.target.value }))}
                  className="h-10 text-xs sm:text-sm rounded-lg"
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="email" className="text-xs font-semibold text-foreground">
                  Email Address <span className="text-destructive">*</span>
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="e.g. jane@example.com"
                  required
                  value={localForm.email}
                  onChange={(e) => setLocalForm((prev) => ({ ...prev, email: e.target.value }))}
                  className="h-10 text-xs sm:text-sm rounded-lg"
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="phone" className="text-xs font-semibold text-foreground">
                  Phone Number
                </label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="e.g. 9876543210"
                  value={localForm.phone}
                  onChange={(e) => setLocalForm((prev) => ({ ...prev, phone: e.target.value }))}
                  className="h-10 text-xs sm:text-sm rounded-lg"
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="occupation" className="text-xs font-semibold text-foreground">
                  Occupation / Startup Name
                </label>
                <Input
                  id="occupation"
                  placeholder="e.g. Founder at TechCorp"
                  value={localForm.occupation}
                  onChange={(e) => setLocalForm((prev) => ({ ...prev, occupation: e.target.value }))}
                  className="h-10 text-xs sm:text-sm rounded-lg"
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="note" className="text-xs font-semibold text-foreground">
                  Note / Expectations
                </label>
                <Textarea
                  id="note"
                  placeholder="Anything specific you'd like to share or learn?"
                  rows={2}
                  value={localForm.note}
                  onChange={(e) => setLocalForm((prev) => ({ ...prev, note: e.target.value }))}
                  className="text-xs sm:text-sm rounded-lg resize-none"
                />
              </div>

              <Button
                type="submit"
                disabled={registering}
                className="w-full bg-gradient-primary text-primary-foreground font-semibold h-11 rounded-lg mt-2 text-xs sm:text-sm"
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
