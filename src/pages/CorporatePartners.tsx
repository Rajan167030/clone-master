import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BackButton from "@/components/BackButton";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useSEO } from "@/hooks/useSEO";
import { Building2, Globe, Handshake, ArrowRight, BarChart3, Users, Zap } from "lucide-react";
import { Link } from "react-router-dom";

const corporatePartners = [
  {
    name: "TechCorp India",
    category: "Technology",
    description: "Empowering founders with cutting-edge cloud infrastructure and dev tools.",
    logo: null,
    initials: "TC",
    color: "from-blue-500 to-indigo-600",
    benefit: "Cloud Credits",
  },
  {
    name: "FinBridge Capital",
    category: "Financial Services",
    description: "Providing early-stage startups access to MSME loans and financial products.",
    logo: null,
    initials: "FB",
    color: "from-emerald-500 to-green-600",
    benefit: "Credit Access",
  },
  {
    name: "MarketPulse Media",
    category: "Media & PR",
    description: "Amplifying startup stories through strategic PR and media partnerships.",
    logo: null,
    initials: "MP",
    color: "from-purple-500 to-violet-600",
    benefit: "PR Coverage",
  },
  {
    name: "LegalEase",
    category: "Legal Services",
    description: "Simplified legal support — from incorporation to fundraise documentation.",
    logo: null,
    initials: "LE",
    color: "from-amber-500 to-orange-500",
    benefit: "Legal Support",
  },
  {
    name: "HirePro",
    category: "HR & Talent",
    description: "Connecting startups with top talent through our curated recruitment platform.",
    logo: null,
    initials: "HP",
    color: "from-rose-500 to-pink-500",
    benefit: "Talent Pipeline",
  },
  {
    name: "GrowthStack",
    category: "Marketing",
    description: "Full-stack digital marketing solutions tailored for growth-stage startups.",
    logo: null,
    initials: "GS",
    color: "from-cyan-500 to-teal-500",
    benefit: "Marketing Credits",
  },
];

const partnerBenefits = [
  {
    icon: Users,
    title: "Reach 5,000+ Founders",
    desc: "Get direct access to our network of verified founders, operators, and startup enthusiasts.",
  },
  {
    icon: BarChart3,
    title: "Branded Touchpoints",
    desc: "Your brand featured at events, newsletters, workshops and digital channels.",
  },
  {
    icon: Zap,
    title: "Co-Create Programs",
    desc: "Build exclusive programs, challenges, and bootcamps with the Founders Connect team.",
  },
  {
    icon: Handshake,
    title: "Strategic Introductions",
    desc: "Get warm introductions to relevant startups for pilots, partnerships, and procurement.",
  },
];

const CorporatePartners = () => {
  useSEO({
    title: "Corporate Partners | Founders Connect",
    description:
      "Our corporate partners power the Founders Connect ecosystem with resources, tools, and opportunities for early-stage startups.",
  });

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
              <Building2 size={14} /> Corporate Ecosystem
            </Badge>
            <h1 className="font-heading text-4xl font-extrabold tracking-tight md:text-6xl">
              Partners Who{" "}
              <span className="text-primary italic">Power Our Ecosystem</span>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground md:text-xl">
              India's leading enterprises partnering with Founders Connect to give early-stage
              startups an unfair advantage.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Button asChild size="lg" className="btn-metallic btn-metallic-purple text-white">
                <Link to="/partner-with-us">
                  <span className="relative z-[2] flex items-center gap-2">
                    Become a Partner <ArrowRight size={16} />
                  </span>
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Partner Benefits */}
      <section className="py-16 bg-secondary/20">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold">Why Partner with Us?</h2>
            <p className="mt-2 text-muted-foreground">Unlock meaningful access to India's fastest-growing startup community</p>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            {partnerBenefits.map((b) => (
              <div
                key={b.title}
                className="rounded-2xl border border-border bg-card p-6 hover:border-primary/30 hover:shadow-md transition-all group"
              >
                <div className="mb-4 p-3 rounded-xl bg-primary/10 w-fit group-hover:bg-primary/20 transition-colors">
                  <b.icon size={22} className="text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{b.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Corporate Partners Grid */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="mb-12 flex items-center gap-3 border-b pb-6">
            <div>
              <h2 className="text-3xl font-bold flex items-center gap-3">
                <Globe className="text-primary" size={28} /> Our Corporate Partners
              </h2>
              <p className="text-muted-foreground mt-2">Companies actively supporting the Founders Connect community</p>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {corporatePartners.map((partner) => (
              <Card
                key={partner.name}
                className="group relative overflow-hidden hover:border-primary/30 hover:shadow-xl transition-all duration-300"
              >
                <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${partner.color}`} />
                <CardContent className="p-6">
                  <div className="flex items-start gap-4 mb-4">
                    <div
                      className={`h-14 w-14 rounded-2xl bg-gradient-to-br ${partner.color} flex items-center justify-center text-white font-bold text-lg flex-shrink-0`}
                    >
                      {partner.initials}
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg leading-tight">{partner.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">{partner.category}</Badge>
                        <Badge className="bg-green-100 text-green-700 border-green-200 text-xs">{partner.benefit}</Badge>
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
      <section className="container mx-auto px-4 pb-24">
        <Card className="bg-gradient-primary border-none text-primary-foreground overflow-hidden">
          <div className="relative px-8 py-12 text-center md:py-20">
            <div className="pointer-events-none absolute -left-10 top-0 h-40 w-40 rounded-full bg-white/10 blur-3xl" />
            <div className="pointer-events-none absolute -right-10 bottom-0 h-40 w-40 rounded-full bg-white/10 blur-3xl" />
            <h2 className="text-3xl font-bold md:text-4xl">Partner With Founders Connect</h2>
            <p className="mt-4 mx-auto max-w-xl text-primary-foreground/80">
              Join the growing list of companies that are shaping India's startup landscape alongside us.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Button asChild variant="secondary" size="lg" className="px-8">
                <Link to="/partner-with-us">Get in Touch</Link>
              </Button>
            </div>
          </div>
        </Card>
      </section>

      <Footer />
    </div>
  );
};

export default CorporatePartners;
