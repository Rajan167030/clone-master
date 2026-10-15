import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BackButton from "@/components/BackButton";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useSEO } from "@/hooks/useSEO";
import { Rocket, Globe, Network, ArrowRight, Leaf, Zap, Users } from "lucide-react";
import { Link } from "react-router-dom";

const ecosystemPartners = [
  {
    name: "T-Hub",
    type: "Incubator",
    city: "Hyderabad",
    description: "Asia's largest innovation hub supporting 1,500+ startups across sectors.",
    initials: "TH",
    color: "from-red-500 to-orange-500",
  },
  {
    name: "NSRCEL",
    type: "Accelerator",
    city: "Bengaluru",
    description: "IIMB's startup incubator nurturing high-potential early-stage ventures.",
    initials: "NS",
    color: "from-blue-500 to-indigo-500",
  },
  {
    name: "SINE IIT Bombay",
    type: "Research Incubator",
    city: "Mumbai",
    description: "Society for Innovation and Entrepreneurship at IIT Bombay.",
    initials: "SI",
    color: "from-emerald-500 to-teal-500",
  },
  {
    name: "Startup India",
    type: "Government Initiative",
    city: "Pan India",
    description: "Flagship government program fostering innovation and entrepreneurship across India.",
    initials: "SI",
    color: "from-amber-500 to-yellow-500",
  },
  {
    name: "Kerala Startup Mission",
    type: "State Agency",
    city: "Thiruvananthapuram",
    description: "Government nodal agency for startups and entrepreneurship development in Kerala.",
    initials: "KS",
    color: "from-green-500 to-lime-500",
  },
  {
    name: "Nasscom 10K Startups",
    type: "Industry Body",
    city: "Pan India",
    description: "India's largest tech startup ecosystem builder by Nasscom.",
    initials: "N1",
    color: "from-purple-500 to-violet-500",
  },
];

const whatWeOffer = [
  {
    icon: Network,
    title: "Cross-Network Events",
    desc: "Joint events, masterclasses, and demo days combining our networks for maximum reach.",
  },
  {
    icon: Rocket,
    title: "Cohort Integration",
    desc: "Seamlessly enroll startups from partner programs into Founders Connect cohorts.",
  },
  {
    icon: Globe,
    title: "Global Exposure",
    desc: "Help startups from partner ecosystems gain international visibility and connections.",
  },
  {
    icon: Leaf,
    title: "Shared Resources",
    desc: "Co-create resources, toolkits, and frameworks that benefit both our communities.",
  },
];

const EcosystemPartners = () => {
  useSEO({
    title: "Ecosystem Partners | Founders Connect",
    description:
      "Founders Connect's ecosystem partners — leading incubators, accelerators, and government bodies building India's startup ecosystem.",
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden pt-8 md:pt-12 pb-20">
        <div className="pointer-events-none absolute -left-24 top-0 h-72 w-72 rounded-full bg-primary/5 blur-3xl" />
        <div className="pointer-events-none absolute right-0 top-20 h-80 w-80 rounded-full bg-green-400/5 blur-3xl" />

        <div className="container mx-auto px-4">
          <BackButton className="mb-6" />
          <div className="text-center max-w-3xl mx-auto">
            <Badge variant="outline" className="mb-4 gap-1.5 px-4 py-1 text-primary border-primary/20 bg-primary/5">
              <Globe size={14} /> Ecosystem Collaboration
            </Badge>
            <h1 className="font-heading text-4xl font-extrabold tracking-tight md:text-6xl">
              Building India's Startup{" "}
              <span className="text-primary italic">Ecosystem Together</span>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground md:text-xl">
              We collaborate with India's leading incubators, accelerators, government bodies, and
              industry associations to amplify opportunities for every founder.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Button asChild size="lg" className="btn-metallic btn-metallic-purple text-white">
                <Link to="/partner-with-us">
                  <span className="relative z-[2] flex items-center gap-2">
                    Partner with Us <ArrowRight size={16} />
                  </span>
                </Link>
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
              { icon: Users, value: "50+", label: "Ecosystem Partners" },
              { icon: Rocket, value: "20+", label: "Incubators & Accelerators" },
              { icon: Globe, value: "10+", label: "Government Bodies" },
              { icon: Zap, value: "100+", label: "Joint Programs" },
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

      {/* What We Offer Partners */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold">What We Offer Partners</h2>
            <p className="mt-2 text-muted-foreground">
              Meaningful collaboration that creates value for both ecosystems
            </p>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            {whatWeOffer.map((item) => (
              <div
                key={item.title}
                className="rounded-2xl border border-border bg-card p-6 hover:border-primary/30 hover:shadow-md transition-all group"
              >
                <div className="mb-4 p-3 rounded-xl bg-primary/10 w-fit group-hover:bg-primary/20 transition-colors">
                  <item.icon size={22} className="text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Ecosystem Partners Grid */}
      <section className="py-20 bg-secondary/20">
        <div className="container mx-auto px-4">
          <div className="mb-12 border-b pb-6">
            <h2 className="text-3xl font-bold">Our Ecosystem Partners</h2>
            <p className="text-muted-foreground mt-2">
              Organisations we proudly collaborate with
            </p>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {ecosystemPartners.map((partner) => (
              <Card
                key={partner.name}
                className="group overflow-hidden hover:border-primary/30 hover:shadow-lg transition-all duration-300"
              >
                <CardContent className="p-6">
                  <div className="flex items-start gap-4 mb-4">
                    <div
                      className={`h-14 w-14 rounded-2xl bg-gradient-to-br ${partner.color} flex items-center justify-center text-white font-bold text-sm flex-shrink-0`}
                    >
                      {partner.initials}
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg leading-tight">{partner.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">{partner.type}</Badge>
                        <span className="text-xs text-muted-foreground">{partner.city}</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{partner.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 py-20">
        <Card className="bg-gradient-primary border-none text-primary-foreground overflow-hidden">
          <div className="relative px-8 py-12 text-center md:py-20">
            <div className="pointer-events-none absolute -left-10 top-0 h-40 w-40 rounded-full bg-white/10 blur-3xl" />
            <div className="pointer-events-none absolute -right-10 bottom-0 h-40 w-40 rounded-full bg-white/10 blur-3xl" />
            <h2 className="text-3xl font-bold md:text-4xl">Let's Build Together</h2>
            <p className="mt-4 mx-auto max-w-xl text-primary-foreground/80">
              If your organization supports the startup ecosystem, let's explore how we can create
              meaningful impact together.
            </p>
            <div className="mt-8">
              <Button asChild variant="secondary" size="lg" className="px-8">
                <Link to="/partner-with-us">Start a Conversation</Link>
              </Button>
            </div>
          </div>
        </Card>
      </section>

      <Footer />
    </div>
  );
};

export default EcosystemPartners;
