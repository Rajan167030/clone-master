import { useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BackButton from "@/components/BackButton";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useSEO } from "@/hooks/useSEO";
import {
  Rocket,
  ShoppingBag,
  Calendar,
  ArrowRight,
  Users,
  TrendingUp,
  Clock,
  CheckCircle2,
  Star,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const startupCohorts = [
  {
    name: "FC Startup Cohort 4.0",
    batch: "Batch 4",
    status: "Completed",
    startups: 20,
    duration: "3 months",
    focus: "B2B SaaS · FinTech · DeepTech",
    highlights: ["₹2Cr+ raised", "8 pilot partnerships", "15 investor meetings"],
    color: "from-blue-500 to-indigo-600",
  },
  {
    name: "FC Startup Cohort 3.0",
    batch: "Batch 3",
    status: "Completed",
    startups: 18,
    duration: "3 months",
    focus: "HealthTech · EdTech · AgriTech",
    highlights: ["₹1.5Cr+ raised", "6 demo day investors", "12 mentorship sessions"],
    color: "from-purple-500 to-violet-600",
  },
];

const d2cCohorts = [
  {
    name: "FC D2C Launchpad 2.0",
    batch: "Batch 2",
    status: "Completed",
    startups: 15,
    duration: "6 weeks",
    focus: "Personal Care · Food & Beverage · Fashion",
    highlights: ["₹50L+ GMV growth", "3 retail partnerships", "Digital-first brand building"],
    color: "from-rose-500 to-pink-600",
  },
  {
    name: "FC D2C Launchpad 1.0",
    batch: "Batch 1",
    status: "Completed",
    startups: 12,
    duration: "6 weeks",
    focus: "Home Decor · Wellness · Apparel",
    highlights: ["10× ROAS average", "Amazon onboarding", "Influencer playbook"],
    color: "from-orange-500 to-amber-600",
  },
];

const upcomingPrograms = [
  {
    name: "FC Startup Cohort 5.0",
    type: "Startup",
    applicationOpen: "November 2025",
    programStart: "January 2026",
    seats: "25 startups",
    theme: "AI-First Products & Platforms",
    icon: Rocket,
    color: "from-blue-500 to-indigo-600",
  },
  {
    name: "FC D2C Launchpad 3.0",
    type: "D2C",
    applicationOpen: "December 2025",
    programStart: "February 2026",
    seats: "20 brands",
    theme: "Quick Commerce & Omnichannel Growth",
    icon: ShoppingBag,
    color: "from-rose-500 to-pink-600",
  },
  {
    name: "Women Founders Accelerator",
    type: "Special Program",
    applicationOpen: "January 2026",
    programStart: "March 2026",
    seats: "15 founders",
    theme: "Funding, Scale, and Market Expansion",
    icon: Star,
    color: "from-purple-500 to-violet-600",
  },
];

const CohortPage = () => {
  const location = useLocation();

  useSEO({
    title: "Cohorts & Programs | Founders Connect",
    description:
      "Founders Connect cohort programs for startups and D2C brands. Apply to our upcoming cohorts to accelerate your growth journey.",
  });

  useEffect(() => {
    if (location.pathname.endsWith("/d2c") || location.hash === "#d2c") {
      document.getElementById("d2c")?.scrollIntoView({ behavior: "smooth" });
    } else if (location.pathname.endsWith("/upcoming") || location.hash === "#upcoming") {
      document.getElementById("upcoming")?.scrollIntoView({ behavior: "smooth" });
    } else if (location.pathname.endsWith("/cohorts") && location.hash === "#startup-cohorts") {
      document.getElementById("startup-cohorts")?.scrollIntoView({ behavior: "smooth" });
    }
  }, [location.pathname, location.hash]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden pt-8 md:pt-12 pb-20">
        <div className="pointer-events-none absolute -left-24 top-0 h-72 w-72 rounded-full bg-primary/5 blur-3xl" />
        <div className="pointer-events-none absolute right-0 top-20 h-80 w-80 rounded-full bg-rose-400/5 blur-3xl" />

        <div className="container mx-auto px-4">
          <BackButton className="mb-6" />
          <div className="text-center max-w-3xl mx-auto">
            <Badge variant="outline" className="mb-4 gap-1.5 px-4 py-1 text-primary border-primary/20 bg-primary/5">
              <Rocket size={14} /> Accelerator Programs
            </Badge>
            <h1 className="font-heading text-4xl font-extrabold tracking-tight md:text-6xl">
              Cohorts That{" "}
              <span className="text-primary italic">Transform Startups</span>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground md:text-xl">
              Intensive, structured programs that take early-stage startups and D2C brands from
              idea to traction — with mentorship, capital, and community.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Button asChild size="lg" className="btn-metallic btn-metallic-purple text-white">
                <a href="#upcoming">
                  <span className="relative z-[2] flex items-center gap-2">
                    Apply Now <ArrowRight size={16} />
                  </span>
                </a>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to="/join-us">Join Community</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { icon: Users, value: "85+", label: "Alumni Startups" },
              { icon: TrendingUp, value: "₹5Cr+", label: "Funding Raised" },
              { icon: Calendar, value: "6", label: "Cohorts Run" },
              { icon: CheckCircle2, value: "90%", label: "Satisfaction Rate" },
            ].map((stat) => (
              <div key={stat.label} className="flex flex-col items-center gap-2">
                <div className="p-3 rounded-xl bg-primary/10">
                  <stat.icon size={24} className="text-primary" />
                </div>
                <p className="text-3xl font-extrabold text-foreground">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Startup Cohorts */}
      <section id="startup-cohorts" className="py-20 scroll-mt-20">
        <div className="container mx-auto px-4">
          <div className="mb-12 border-b pb-6 flex items-center gap-3">
            <Rocket className="text-primary" size={28} />
            <div>
              <h2 className="text-3xl font-bold">Startup Cohorts</h2>
              <p className="text-muted-foreground mt-1">For early-stage tech and product startups</p>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {startupCohorts.map((cohort) => (
              <Card
                key={cohort.name}
                className="group relative overflow-hidden hover:border-primary/30 hover:shadow-xl transition-all duration-300"
              >
                <div className={`absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r ${cohort.color}`} />
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold">{cohort.name}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{cohort.focus}</p>
                    </div>
                    <Badge variant="outline" className="text-xs">{cohort.status}</Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="text-center p-3 rounded-lg bg-secondary/50">
                      <p className="text-xl font-bold">{cohort.startups}</p>
                      <p className="text-xs text-muted-foreground">Startups</p>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-secondary/50">
                      <p className="text-xl font-bold">{cohort.duration}</p>
                      <p className="text-xs text-muted-foreground flex items-center justify-center gap-1"><Clock size={10} /> Duration</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {cohort.highlights.map((h) => (
                      <div key={h} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <CheckCircle2 size={14} className="text-green-500 flex-shrink-0" />
                        {h}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* D2C Cohorts */}
      <section id="d2c" className="py-20 bg-secondary/20 scroll-mt-20">
        <div className="container mx-auto px-4">
          <div className="mb-12 border-b pb-6 flex items-center gap-3">
            <ShoppingBag className="text-primary" size={28} />
            <div>
              <h2 className="text-3xl font-bold">D2C Cohorts</h2>
              <p className="text-muted-foreground mt-1">For direct-to-consumer brands and consumer startups</p>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {d2cCohorts.map((cohort) => (
              <Card
                key={cohort.name}
                className="group relative overflow-hidden hover:border-primary/30 hover:shadow-xl transition-all duration-300"
              >
                <div className={`absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r ${cohort.color}`} />
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold">{cohort.name}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{cohort.focus}</p>
                    </div>
                    <Badge variant="outline" className="text-xs">{cohort.status}</Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="text-center p-3 rounded-lg bg-secondary/50">
                      <p className="text-xl font-bold">{cohort.startups}</p>
                      <p className="text-xs text-muted-foreground">Brands</p>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-secondary/50">
                      <p className="text-xl font-bold">{cohort.duration}</p>
                      <p className="text-xs text-muted-foreground flex items-center justify-center gap-1"><Clock size={10} /> Duration</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {cohort.highlights.map((h) => (
                      <div key={h} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <CheckCircle2 size={14} className="text-green-500 flex-shrink-0" />
                        {h}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Upcoming Programs */}
      <section id="upcoming" className="py-20">
        <div className="container mx-auto px-4">
          <div className="mb-12 border-b pb-6 flex items-center gap-3">
            <Calendar className="text-primary" size={28} />
            <div>
              <h2 className="text-3xl font-bold">Upcoming Programs</h2>
              <p className="text-muted-foreground mt-1">Applications opening soon — secure your spot early</p>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {upcomingPrograms.map((program) => (
              <Card
                key={program.name}
                className="group relative overflow-hidden hover:border-primary/30 hover:shadow-xl transition-all duration-300"
              >
                <div className={`absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r ${program.color}`} />
                <CardContent className="p-6">
                  <div className="mb-4">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${program.color} flex items-center justify-center mb-3`}>
                      <program.icon size={22} className="text-white" />
                    </div>
                    <h3 className="text-xl font-bold">{program.name}</h3>
                    <Badge variant="secondary" className="mt-2 text-xs">{program.type}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4 italic">"{program.theme}"</p>
                  <div className="space-y-2 mb-6">
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar size={14} className="text-primary" />
                      <span className="text-muted-foreground">Applications Open:</span>
                      <span className="font-medium">{program.applicationOpen}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Rocket size={14} className="text-primary" />
                      <span className="text-muted-foreground">Program Start:</span>
                      <span className="font-medium">{program.programStart}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Users size={14} className="text-primary" />
                      <span className="text-muted-foreground">Seats:</span>
                      <span className="font-medium">{program.seats}</span>
                    </div>
                  </div>
                  <Button asChild className="w-full" variant="outline">
                    <Link to="/join-us">Express Interest <ArrowRight size={14} className="ml-1" /></Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 pb-24">
        <Card className="bg-gradient-primary border-none text-primary-foreground overflow-hidden">
          <div className="relative px-8 py-12 text-center md:py-20">
            <div className="pointer-events-none absolute -left-10 top-0 h-40 w-40 rounded-full bg-white/10 blur-3xl" />
            <div className="pointer-events-none absolute -right-10 bottom-0 h-40 w-40 rounded-full bg-white/10 blur-3xl" />
            <h2 className="text-3xl font-bold md:text-4xl">Ready to Join a Cohort?</h2>
            <p className="mt-4 mx-auto max-w-xl text-primary-foreground/80">
              Apply to our upcoming programs or join our community to get notified when applications open.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Button asChild variant="secondary" size="lg" className="px-8">
                <Link to="/join-us">Apply Now</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="px-8 border-white/30 text-white hover:bg-white/10">
                <Link to="/contact-us">Contact Us</Link>
              </Button>
            </div>
          </div>
        </Card>
      </section>

      <Footer />
    </div>
  );
};

export default CohortPage;
