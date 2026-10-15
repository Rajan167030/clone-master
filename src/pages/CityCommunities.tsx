import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BackButton from "@/components/BackButton";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useSEO } from "@/hooks/useSEO";
import { MapPin, Users, Calendar, ArrowRight, Zap } from "lucide-react";
import { Link } from "react-router-dom";

const cities = [
  {
    city: "Bengaluru",
    state: "Karnataka",
    members: "1,200+",
    events: "48",
    active: true,
    emoji: "🔥",
    color: "from-orange-500 to-red-500",
    lead: "Arjun Mehta",
  },
  {
    city: "Mumbai",
    state: "Maharashtra",
    members: "980+",
    events: "36",
    active: true,
    emoji: "🌊",
    color: "from-blue-500 to-cyan-500",
    lead: "Priya Shah",
  },
  {
    city: "Delhi NCR",
    state: "Delhi",
    members: "850+",
    events: "30",
    active: true,
    emoji: "🏛️",
    color: "from-violet-500 to-purple-600",
    lead: "Rohit Kapoor",
  },
  {
    city: "Hyderabad",
    state: "Telangana",
    members: "620+",
    events: "22",
    active: true,
    emoji: "💎",
    color: "from-emerald-500 to-teal-500",
    lead: "Divya Reddy",
  },
  {
    city: "Pune",
    state: "Maharashtra",
    members: "490+",
    events: "18",
    active: true,
    emoji: "⚡",
    color: "from-yellow-500 to-amber-500",
    lead: "Siddharth Joshi",
  },
  {
    city: "Chennai",
    state: "Tamil Nadu",
    members: "410+",
    events: "15",
    active: true,
    emoji: "🌟",
    color: "from-pink-500 to-rose-500",
    lead: "Kavitha Nair",
  },
  {
    city: "Ahmedabad",
    state: "Gujarat",
    members: "350+",
    events: "12",
    active: false,
    emoji: "🚀",
    color: "from-indigo-500 to-blue-600",
    lead: "Nikhil Patel",
  },
  {
    city: "Jaipur",
    state: "Rajasthan",
    members: "220+",
    events: "8",
    active: false,
    emoji: "🏰",
    color: "from-fuchsia-500 to-pink-500",
    lead: "Mansi Agarwal",
  },
  {
    city: "Kolkata",
    state: "West Bengal",
    members: "180+",
    events: "7",
    active: false,
    emoji: "🌸",
    color: "from-teal-400 to-green-500",
    lead: "Sourav Das",
  },
];

const CityCommunities = () => {
  useSEO({
    title: "City Communities | Founders Connect",
    description:
      "Join the Founders Connect city community in your region. Attend local meetups, connect with founders, and grow your startup network.",
  });

  const activeCities = cities.filter((c) => c.active);
  const growingCities = cities.filter((c) => !c.active);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden pt-8 md:pt-12 pb-20">
        <div className="pointer-events-none absolute -left-24 top-0 h-72 w-72 rounded-full bg-primary/5 blur-3xl" />
        <div className="pointer-events-none absolute right-0 top-20 h-80 w-80 rounded-full bg-blue-400/5 blur-3xl" />

        <div className="container mx-auto px-4">
          <BackButton className="mb-6" />
          <div className="text-center max-w-3xl mx-auto">
            <Badge variant="outline" className="mb-4 gap-1.5 px-4 py-1 text-primary border-primary/20 bg-primary/5">
              <MapPin size={14} /> Community-First Network
            </Badge>
            <h1 className="font-heading text-4xl font-extrabold tracking-tight md:text-6xl">
              Founders in Your{" "}
              <span className="text-primary italic">City</span>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground md:text-xl">
              Local startup communities powered by Founders Connect — meetups, masterclasses, and
              meaningful connections, right in your city.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Button asChild size="lg" className="btn-metallic btn-metallic-purple text-white">
                <Link to="/join-us">
                  <span className="relative z-[2] flex items-center gap-2">
                    Join Your City Chapter <ArrowRight size={16} />
                  </span>
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to="/chapters">Explore All Chapters</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Active Cities */}
      <section className="py-20 bg-secondary/20">
        <div className="container mx-auto px-4">
          <div className="mb-12 flex items-center justify-between border-b pb-6">
            <div>
              <h2 className="text-3xl font-bold flex items-center gap-3">
                <Zap className="text-primary" size={28} /> Active City Communities
              </h2>
              <p className="text-muted-foreground mt-2">
                Thriving chapters with regular events and an engaged founder base
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {activeCities.map((c) => (
              <Card
                key={c.city}
                className="group relative overflow-hidden hover:border-primary/30 hover:shadow-xl transition-all duration-300 cursor-pointer"
              >
                <div className={`absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r ${c.color}`} />
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <span className="text-3xl">{c.emoji}</span>
                      <h3 className="text-xl font-bold mt-2">{c.city}</h3>
                      <p className="text-sm text-muted-foreground">{c.state}</p>
                    </div>
                    <Badge className="bg-green-100 text-green-700 border-green-200 text-xs">
                      Active
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="text-center p-3 rounded-lg bg-secondary/50">
                      <p className="text-xl font-bold">{c.members}</p>
                      <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                        <Users size={10} /> Members
                      </p>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-secondary/50">
                      <p className="text-xl font-bold">{c.events}</p>
                      <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                        <Calendar size={10} /> Events
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Chapter Lead: <span className="text-foreground font-medium">{c.lead}</span></span>
                    <ArrowRight size={16} className="text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Growing Cities */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="mb-12 flex items-center gap-3 border-b pb-6">
            <div>
              <h2 className="text-3xl font-bold">Growing Communities</h2>
              <p className="text-muted-foreground mt-2">Emerging chapters building momentum</p>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            {growingCities.map((c) => (
              <Card key={c.city} className="group hover:border-primary/20 hover:shadow-md transition-all">
                <CardContent className="p-5 flex items-center gap-4">
                  <span className="text-2xl">{c.emoji}</span>
                  <div className="flex-1">
                    <h3 className="font-semibold">{c.city}</h3>
                    <p className="text-xs text-muted-foreground">{c.state} · {c.members} members</p>
                  </div>
                  <Badge variant="outline" className="text-xs">Growing</Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Start Chapter CTA */}
      <section className="container mx-auto px-4 pb-24">
        <Card className="bg-gradient-primary border-none text-primary-foreground overflow-hidden">
          <div className="relative px-8 py-12 text-center md:py-20">
            <div className="pointer-events-none absolute -left-10 top-0 h-40 w-40 rounded-full bg-white/10 blur-3xl" />
            <div className="pointer-events-none absolute -right-10 bottom-0 h-40 w-40 rounded-full bg-white/10 blur-3xl" />
            <h2 className="text-3xl font-bold md:text-4xl">Start a Chapter in Your City</h2>
            <p className="mt-4 mx-auto max-w-xl text-primary-foreground/80">
              Don't see your city? Be the catalyst. We support passionate founders who want to build
              thriving startup communities in their region.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Button asChild variant="secondary" size="lg" className="px-8">
                <Link to="/contact-us">Get in Touch</Link>
              </Button>
            </div>
          </div>
        </Card>
      </section>

      <Footer />
    </div>
  );
};

export default CityCommunities;
