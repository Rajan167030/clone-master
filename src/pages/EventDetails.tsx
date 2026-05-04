import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle2,
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
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getEventBySlug } from "@/lib/events";
import {
  getMyEventRegistrationsApi,
  getPublicEventBySlugApi,
  registerForEventApi,
  submitEventInterestApi,
  updateEventRegistrationApi,
  type DynamicEvent,
  type EventRegistration,
} from "@/lib/api";
import { getToken, isAuthenticated } from "@/lib/session";
import NotFound from "./NotFound";
import EventRegistrationForm from "@/components/EventRegistrationForm";

const EventDetails = () => {
  const { slug = "" } = useParams();
  const fallbackEvent = useMemo(() => getEventBySlug(slug), [slug]);
  const token = useMemo(() => getToken(), []);
  const memberAuthenticated = useMemo(() => isAuthenticated(), []);
  const [event, setEvent] = useState<DynamicEvent | null>(fallbackEvent || null);
  const [registration, setRegistration] = useState<EventRegistration | null>(null);
  const [noteDraft, setNoteDraft] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [isSavingNote, setIsSavingNote] = useState(false);
  const [interestOpen, setInterestOpen] = useState(false);
  const [isSubmittingInterest, setIsSubmittingInterest] = useState(false);
  const [registrationFormOpen, setRegistrationFormOpen] = useState(false);
  const [interestForm, setInterestForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    city: "",
    occupation: "",
    startupName: "",
    note: "",
  });

  useEffect(() => {
    getPublicEventBySlugApi(slug)
      .then((response) => {
        setEvent(response.event);
      })
      .catch(() => {
        setEvent(fallbackEvent || null);
      });
  }, [fallbackEvent, slug]);

  useEffect(() => {
    if (!event) {
      return;
    }

    if (!token) {
      return;
    }

    getMyEventRegistrationsApi(token)
      .then((response) => {
        const matched = response.registrations.find((item) => item.slug === event.slug) || null;
        setRegistration(matched);
        setNoteDraft(matched?.note || "");
      })
      .catch(() => {
        setRegistration(null);
        setNoteDraft("");
      });
  }, [event, token]);

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

  const handleRegister = () => {
    if (!memberAuthenticated) {
      // Show registration form for non-members
      setRegistrationFormOpen(true);
      return;
    }

    if (!token) {
      return;
    }

    setIsRegistering(true);
    registerForEventApi(token, {
      slug: event.slug,
      title: event.title,
      subtitle: event.subtitle,
      dateLabel: event.dateLabel,
      locationLabel: event.locationLabel,
      ticketLabel: event.ticketLabel,
    })
      .then((response) => {
        setRegistration(response.registration);
        setNoteDraft(response.registration.note || "");
        window.alert(response.message);
      })
      .catch((error) => {
        window.alert(error instanceof Error ? error.message : "Unable to register for event.");
      })
      .finally(() => {
        setIsRegistering(false);
      });
  };

  const handleInterestSubmit = () => {
    const { fullName, email, phone, city } = interestForm;
    if (!fullName.trim() || !email.trim() || !phone.trim() || !city.trim()) {
      window.alert("Please fill full name, email, phone, and city.");
      return;
    }

    setIsSubmittingInterest(true);
    submitEventInterestApi({
      slug: event.slug,
      title: event.title,
      fullName,
      email,
      phone,
      city,
      occupation: interestForm.occupation,
      startupName: interestForm.startupName,
      note: interestForm.note,
    })
      .then((response) => {
        window.alert(response.message);
        setInterestOpen(false);
        setInterestForm({
          fullName: "",
          email: "",
          phone: "",
          city: "",
          occupation: "",
          startupName: "",
          note: "",
        });
      })
      .catch((error) => {
        window.alert(error instanceof Error ? error.message : "Unable to submit event interest.");
      })
      .finally(() => {
        setIsSubmittingInterest(false);
      });
  };

  const handleSaveNote = (status?: "registered" | "attended") => {
    if (!token || !registration) {
      return;
    }

    setIsSavingNote(true);
    updateEventRegistrationApi(token, event.slug, {
      note: noteDraft,
      ...(status ? { status } : {}),
    })
      .then((response) => {
        setRegistration(response.registration);
        setNoteDraft(response.registration.note || "");
        window.alert(response.message);
      })
      .catch((error) => {
        window.alert(error instanceof Error ? error.message : "Unable to save event note.");
      })
      .finally(() => {
        setIsSavingNote(false);
      });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <section className="relative overflow-hidden pt-20">
        <div className="pointer-events-none absolute -left-20 top-10 h-64 w-64 rounded-full bg-blob" />
        <div className="pointer-events-none absolute -right-20 top-40 h-72 w-72 rounded-full bg-blob" />

        <div className="container mx-auto px-4 py-10">
          <Link to="/events" className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline">
            <ArrowLeft size={15} /> Back to all events
          </Link>
          <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
            <Card className="overflow-hidden border-0 shadow-2xl bg-gradient-to-br from-background to-secondary/40">
              <div className="relative h-[340px] md:h-[420px]">
                <img src={event.bannerImage} alt={event.bannerAlt} className="h-full w-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/45 to-transparent" />
                <div className="absolute bottom-0 left-0 w-full p-6 md:p-8">
                  <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-background/90 px-3 py-1 text-xs font-semibold">
                    <BadgeCheck size={14} className="text-primary" />
                    Founders Connect
                  </div>
                  <h1 className="font-heading text-3xl font-extrabold leading-tight md:text-5xl">{event.title}</h1>
                  <p className="mt-2 text-base text-muted-foreground md:text-lg">{event.subtitle}</p>
                </div>
              </div>
            </Card>

            <Card className="border-border/60 shadow-xl">
              <CardHeader>
                <CardTitle className="text-xl">Ready to join?</CardTitle>
                <CardDescription>{event.shortDescription}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {!memberAuthenticated && (
                  <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                    This event supports guest registration too. Non-members can fill the quick form and submit their request.
                  </div>
                )}
                {registration ? (
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
                    <div className="flex items-center gap-2 font-semibold">
                      <CheckCircle2 size={16} />
                      Registration confirmed
                    </div>
                    <p className="mt-2 text-emerald-800">
                      You registered on {new Date(registration.registeredAt).toLocaleDateString()} and your current status is{" "}
                      <span className="font-semibold capitalize">{registration.status}</span>.
                    </p>
                  </div>
                ) : (
                  <Button
                    type="button"
                    disabled={isRegistering}
                    className="w-full gap-2 bg-gradient-primary text-primary-foreground"
                    onClick={handleRegister}
                  >
                    I&apos;m Interested <ArrowRight size={16} />
                  </Button>
                )}
                <Button type="button" variant="outline" className="w-full gap-2" onClick={handleShare}>
                  <Share2 size={16} /> Share Event
                </Button>
                <Button asChild variant="secondary" className="w-full gap-2">
                  <a
                    href={event.calendarUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <CalendarDays size={16} /> Add to Calendar
                  </a>
                </Button>
                {registration && (
                  <div className="rounded-xl border bg-muted/20 p-4">
                    <p className="text-sm font-semibold text-foreground">Event Notes</p>
                    <p className="mb-3 text-xs text-muted-foreground">
                      Add your preparation notes, follow-ups, or takeaways. Mark attended once you complete the event.
                    </p>
                    <Textarea
                      value={noteDraft}
                      onChange={(eventTarget) => setNoteDraft(eventTarget.target.value)}
                      placeholder="Add event note, meeting summary, investor follow-up, or next action."
                      className="min-h-28"
                    />
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Button type="button" size="sm" onClick={() => handleSaveNote("registered")} disabled={isSavingNote}>
                        Save Note
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="secondary"
                        onClick={() => handleSaveNote("attended")}
                        disabled={isSavingNote}
                      >
                        Mark Attended
                      </Button>
                    </div>
                  </div>
                )}
                <div className="rounded-xl border bg-muted/30 p-4 text-sm">
                  <div className="mb-2 flex items-center gap-2 font-semibold">
                    <CalendarDays size={16} className="text-primary" />
                    Date & Location
                  </div>
                  <p className="text-muted-foreground">{event.dateLabel}</p>
                  <p className="text-muted-foreground">{event.locationLabel}</p>
                  <a
                    href={event.mapUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-2 inline-flex items-center gap-1 text-primary hover:underline"
                  >
                    <MapPin size={14} /> View on map
                  </a>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="container mx-auto grid gap-6 px-4 pb-16 lg:grid-cols-[1.2fr_0.8fr]">
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
                className="w-full bg-gradient-primary text-primary-foreground"
                onClick={handleRegister}
                disabled={Boolean(registration) || isRegistering}
              >
                {registration ? "Already Registered" : "Register Event"}
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
      </section>

      <Footer />

      <EventRegistrationForm
        isOpen={registrationFormOpen}
        onOpenChange={setRegistrationFormOpen}
        eventTitle={event.title}
        eventDate={event.dateLabel}
        eventLocation={event.locationLabel}
        ticketPrice={999}
        eventSlug={event.slug}
        onSuccess={() => {
          // Refresh registration status
          if (token) {
            getMyEventRegistrationsApi(token).then((response) => {
              const matched = response.registrations.find((item) => item.slug === event.slug) || null;
              setRegistration(matched);
            });
          }
        }}
      />

      <Dialog open={interestOpen} onOpenChange={setInterestOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Event Registration Form</DialogTitle>
            <DialogDescription>
              You are not signed in as a member yet. Fill this form and we will register your event request.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="interest-fullName" className="text-sm font-medium text-slate-700">
                Full Name
              </label>
              <Input
                id="interest-fullName"
                value={interestForm.fullName}
                onChange={(eventTarget) =>
                  setInterestForm((current) => ({ ...current, fullName: eventTarget.target.value }))
                }
                placeholder="Your full name"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="interest-email" className="text-sm font-medium text-slate-700">
                Email
              </label>
              <Input
                id="interest-email"
                type="email"
                value={interestForm.email}
                onChange={(eventTarget) =>
                  setInterestForm((current) => ({ ...current, email: eventTarget.target.value }))
                }
                placeholder="name@email.com"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="interest-phone" className="text-sm font-medium text-slate-700">
                Phone
              </label>
              <Input
                id="interest-phone"
                value={interestForm.phone}
                onChange={(eventTarget) =>
                  setInterestForm((current) => ({ ...current, phone: eventTarget.target.value }))
                }
                placeholder="+91 9876543210"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="interest-city" className="text-sm font-medium text-slate-700">
                City
              </label>
              <Input
                id="interest-city"
                value={interestForm.city}
                onChange={(eventTarget) =>
                  setInterestForm((current) => ({ ...current, city: eventTarget.target.value }))
                }
                placeholder="Your city"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="interest-occupation" className="text-sm font-medium text-slate-700">
                Occupation
              </label>
              <Input
                id="interest-occupation"
                value={interestForm.occupation}
                onChange={(eventTarget) =>
                  setInterestForm((current) => ({ ...current, occupation: eventTarget.target.value }))
                }
                placeholder="Founder, operator, student..."
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="interest-startupName" className="text-sm font-medium text-slate-700">
                Startup Name
              </label>
              <Input
                id="interest-startupName"
                value={interestForm.startupName}
                onChange={(eventTarget) =>
                  setInterestForm((current) => ({ ...current, startupName: eventTarget.target.value }))
                }
                placeholder="Optional"
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <label htmlFor="interest-note" className="text-sm font-medium text-slate-700">
                Why do you want to attend?
              </label>
              <Textarea
                id="interest-note"
                value={interestForm.note}
                onChange={(eventTarget) =>
                  setInterestForm((current) => ({ ...current, note: eventTarget.target.value }))
                }
                placeholder="Tell us your interest, role, or what you want from this event."
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setInterestOpen(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={handleInterestSubmit} disabled={isSubmittingInterest}>
              {isSubmittingInterest ? "Submitting..." : "Submit Registration"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EventDetails;
