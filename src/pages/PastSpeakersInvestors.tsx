import { useEffect, useMemo, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useSEO } from "@/hooks/useSEO";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Mic2, Sparkles, TrendingUp, UsersRound } from "lucide-react";
import { getPublicSpeakerInvestorProfilesApi, type SpeakerInvestorProfile } from "@/lib/api";

const stats = [
  { label: "Past speakers", value: "25+" },
  { label: "Investor guests", value: "15+" },
  { label: "Cities reached", value: "8" },
];

const emptyPhoto =
  "data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='600' viewBox='0 0 600 600'%3E%3Crect width='600' height='600' rx='40' fill='%230f172a'/%3E%3Ccircle cx='300' cy='240' r='92' fill='%231e293b'/%3E%3Cpath d='M168 492c26-78 84-118 132-118s106 40 132 118' fill='%231e293b'/%3E%3C/svg%3E";

const PastSpeakersInvestors = () => {
  const [profiles, setProfiles] = useState<SpeakerInvestorProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  useSEO({
    title: "Past Speakers & Investors | Founders Connect",
    description:
      "Explore the past speakers and investors featured at Founders Connect events, panels, and community sessions.",
    keywords: "past speakers, past investors, founders connect speakers, founders connect investors",
    ogType: "website",
    canonicalUrl: "https://founders.connect/past-speakers-investors",
  });

  useEffect(() => {
    getPublicSpeakerInvestorProfilesApi()
      .then((response) => {
        setProfiles(response.profiles);
      })
      .catch((error) => {
        setLoadError(error instanceof Error ? error.message : "Unable to load speaker and investor profiles.");
      })
      .finally(() => setLoading(false));
  }, []);

  const speakerProfiles = useMemo(
    () => profiles.filter((profile) => profile.category === "speaker").sort((a, b) => a.order - b.order),
    [profiles],
  );

  const investorProfiles = useMemo(
    () => profiles.filter((profile) => profile.category === "investor").sort((a, b) => a.order - b.order),
    [profiles],
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <section className="relative overflow-hidden pt-24">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[520px] bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.18),_transparent_32%),radial-gradient(circle_at_top_right,_rgba(14,165,233,0.15),_transparent_28%),linear-gradient(180deg,_rgba(2,6,23,0.06),_transparent_70%)]" />
        <div className="container relative z-10 mx-auto px-4 py-12 md:py-16">
          <div className="mx-auto max-w-4xl text-center">
            <Badge variant="secondary" className="mb-4 gap-2 px-4 py-1.5 text-sm font-medium">
              <Sparkles className="h-4 w-4" />
              Community Highlights
            </Badge>
            <h1 className="font-heading text-4xl font-extrabold leading-tight text-foreground md:text-6xl">
               Speakers & Investors
            </h1>
            

            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Button asChild className="gap-2 bg-gradient-primary text-primary-foreground">
                <a href="#speakers">
                  View Speakers
                  <ArrowRight className="h-4 w-4" />
                </a>
              </Button>
              <Button asChild variant="outline" className="gap-2">
                <a href="#investors">
                  View Investors
                  <ArrowRight className="h-4 w-4" />
                </a>
              </Button>
            </div>
          </div>

          <div className="mt-12 grid gap-4 md:grid-cols-3">
            {stats.map((stat) => (
              <Card key={stat.label} className="border-border/60 bg-background/90 shadow-sm backdrop-blur">
                <CardContent className="p-6 text-center">
                  <div className="text-3xl font-extrabold text-foreground">{stat.value}</div>
                  <p className="mt-2 text-sm text-muted-foreground">{stat.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {loadError && (
            <div className="mx-auto mt-8 max-w-3xl rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {loadError}
            </div>
          )}
        </div>
      </section>

      <section id="speakers" className="py-16 md:py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-2xl text-center">
            <Badge variant="outline" className="gap-2 px-3 py-1">
              <Mic2 className="h-4 w-4" />
              Past Speakers
            </Badge>
            <h2 className="mt-4 font-heading text-3xl font-extrabold text-foreground md:text-4xl">
              Voices that shaped the room.
            </h2>
            <p className="mt-4 text-muted-foreground">
              Use this section to highlight the speakers who helped founders learn, build, and move faster.
            </p>
          </div>

          <div className="mt-10">
            {loading && !speakerProfiles.length ? (
              <div className="rounded-2xl border border-dashed border-border p-10 text-center text-muted-foreground">Loading speaker profiles...</div>
            ) : speakerProfiles.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border p-10 text-center text-muted-foreground">No speaker profiles have been added yet.</div>
            ) : (
              <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 items-start">
                {speakerProfiles.map((speaker) => (
                  <div key={speaker.slug} className="text-center px-4">
                    <div className="relative mx-auto w-52 h-52">
                      <div className="absolute inset-0 rounded-full">
                        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden>
                          <defs></defs>
                          <circle cx="50" cy="50" r="46" fill="white" />
                          <circle cx="50" cy="50" r="46" stroke="#dbeafe" strokeWidth="6" fill="none" />
                          <circle cx="50" cy="50" r="46" stroke="#0369a1" strokeWidth="6" fill="none" strokeDasharray="120 400" transform="rotate(-40 50 50)" />
                        </svg>
                      </div>

                      <div className="relative z-10 rounded-full overflow-hidden w-full h-full">
                        <img
                          src={speaker.photoUrl || emptyPhoto}
                          alt={speaker.photoAlt || speaker.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>

                    <h3 className="mt-6 font-heading text-xl font-bold text-foreground">{speaker.name}</h3>
                    <p className="mt-2 text-sm font-semibold text-primary">{speaker.designation}</p>
                    {speaker.company && <p className="mt-1 text-sm text-muted-foreground">{speaker.company}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      <section id="investors" className="border-y border-border/60 bg-muted/30 py-16 md:py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-2xl text-center">
            <Badge variant="outline" className="gap-2 px-3 py-1">
              <TrendingUp className="h-4 w-4" />
              Past Investors
            </Badge>
            
            <p className="mt-4 text-muted-foreground">
              Showcase investors who attended, spoke, mentored, or supported founders across your events.
            </p>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {loading && !investorProfiles.length ? (
              <div className="md:col-span-2 xl:col-span-3 rounded-2xl border border-dashed border-border p-10 text-center text-muted-foreground">
                Loading investor profiles...
              </div>
            ) : investorProfiles.length === 0 ? (
              <div className="md:col-span-2 xl:col-span-3 rounded-2xl border border-dashed border-border p-10 text-center text-muted-foreground">
                No investor profiles have been added yet.
              </div>
            ) : (
              investorProfiles.map((investor) => (
                <Card key={investor.slug} className="h-full overflow-hidden border-border/60 bg-background shadow-sm transition-transform duration-200 hover:-translate-y-1 hover:shadow-lg">
                  <div className="relative h-60 w-full bg-slate-100">
                    <img
                      src={investor.photoUrl || emptyPhoto}
                      alt={investor.photoAlt || investor.name}
                      className="h-full w-full object-cover"
                    />
                    <Badge className="absolute left-4 top-4 bg-slate-950/80 text-white hover:bg-slate-950/80">
                      Investor
                    </Badge>
                  </div>
                  <CardContent className="flex h-full flex-col p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="font-heading text-2xl font-bold text-foreground">{investor.name}</h3>
                        <p className="mt-1 text-sm font-semibold text-primary">{investor.designation}</p>
                        {investor.company && <p className="mt-1 text-sm text-muted-foreground">{investor.company}</p>}
                      </div>
                      <div className="rounded-full bg-primary/10 p-3 text-primary">
                        <TrendingUp className="h-5 w-5" />
                      </div>
                    </div>

                    {investor.summary && (
                      <p className="mt-5 text-sm leading-6 text-muted-foreground">{investor.summary}</p>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </section>

      <section className="py-16 md:py-20">
        <div className="container mx-auto px-4">
          <Card className="overflow-hidden border-border/60 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-white shadow-2xl">
            <CardContent className="grid gap-8 p-8 md:grid-cols-[1.2fr_0.8fr] md:p-10">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-white/70">Want to add more names?</p>
                <h2 className="mt-4 font-heading text-3xl font-extrabold md:text-4xl">
                  Keep this page updated as your network grows.
                </h2>
                <p className="mt-4 max-w-2xl text-sm leading-7 text-white/80">
                  Add real speaker and investor records from the admin dashboard, include photos and designations,
                  and this page will update automatically.
                </p>
              </div>

              <div className="flex flex-col justify-center gap-3 md:items-end">
                <Button asChild className="w-full gap-2 bg-white text-slate-950 hover:bg-white/90 md:w-auto">
                  <a href="/partner-with-us">Partner With Us</a>
                </Button>
                <Button asChild variant="outline" className="w-full border-white/20 bg-white/5 text-white hover:bg-white/10 md:w-auto">
                  <a href="/events">Browse Events</a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default PastSpeakersInvestors;