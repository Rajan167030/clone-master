import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BackButton from "@/components/BackButton";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useSEO } from "@/hooks/useSEO";
import { TrendingUp, DollarSign, Users, Globe, ArrowRight, Zap, Shield, BarChart3 } from "lucide-react";
import { Link } from "react-router-dom";

const investorHighlights = [
  {
    initials: "SR",
    name: "Suresh Rajan",
    type: "Angel Investor",
    portfolio: "30+ startups",
    focus: "SaaS, FinTech, EdTech",
    stage: "Pre-Seed to Series A",
    color: "from-blue-500 to-indigo-600",
  },
  {
    initials: "MK",
    name: "Meera Krishnan",
    type: "Family Office",
    portfolio: "15+ startups",
    focus: "D2C, Consumer, Health",
    stage: "Seed to Series B",
    color: "from-purple-500 to-violet-600",
  },
  {
    initials: "AV",
    name: "Arjun Verma",
    type: "Micro VC",
    portfolio: "50+ startups",
    focus: "Deep Tech, AI, Climate",
    stage: "Pre-Seed",
    color: "from-emerald-500 to-green-600",
  },
  {
    initials: "NS",
    name: "Nalini Singh",
    type: "Angel Network Lead",
    portfolio: "25+ startups",
    focus: "Women-led, Impact",
    stage: "Idea to Seed",
    color: "from-rose-500 to-pink-600",
  },
  {
    initials: "PG",
    name: "Prakash Goel",
    type: "Corporate VC",
    portfolio: "20+ startups",
    focus: "Enterprise, B2B",
    stage: "Series A+",
    color: "from-orange-500 to-amber-600",
  },
  {
    initials: "RT",
    name: "Rohan Tripathi",
    type: "Impact Investor",
    portfolio: "18+ startups",
    focus: "AgriTech, Rural, BharatPe",
    stage: "Seed to Series A",
    color: "from-teal-500 to-cyan-600",
  },
];

const whyInvest = [
  {
    icon: Zap,
    title: "Deal Flow Access",
    desc: "Get exclusive access to curated, high-quality deal flow from our network of 5,000+ startups.",
  },
  {
    icon: Users,
    title: "Co-Investment Network",
    desc: "Co-invest alongside seasoned angels and VCs across India and Southeast Asia.",
  },
  {
    icon: Shield,
    title: "Due Diligence Support",
    desc: "Leverage our community's collective intelligence for faster, smarter investment decisions.",
  },
  {
    icon: BarChart3,
    title: "Portfolio Support",
    desc: "Our team helps portfolio companies with hiring, growth, and follow-on fundraising.",
  },
];

const InvestorsPublic = () => {
  useSEO({
    title: "Investors | Founders Connect",
    description:
      "Connect with India's most active angel investors, VCs and family offices through the Founders Connect network.",
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden pt-8 md:pt-12 pb-20">
        <div className="pointer-events-none absolute -left-24 top-0 h-72 w-72 rounded-full bg-primary/5 blur-3xl" />
        <div className="pointer-events-none absolute right-0 top-20 h-80 w-80 rounded-full bg-emerald-400/5 blur-3xl" />

        <div className="container mx-auto px-4">
          <BackButton className="mb-6" />
          <div className="text-center max-w-3xl mx-auto">
            <Badge variant="outline" className="mb-4 gap-1.5 px-4 py-1 text-primary border-primary/20 bg-primary/5">
              <TrendingUp size={14} /> Active Investment Network
            </Badge>
            <h1 className="font-heading text-4xl font-extrabold tracking-tight md:text-6xl">
              India's Most Active{" "}
              <span className="text-primary italic">Investor Community</span>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground md:text-xl">
              Connect with 200+ active investors — angels, family offices, and micro-VCs —
              actively deploying capital into early-stage Indian startups.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Button asChild size="lg" className="btn-metallic btn-metallic-purple text-white">
                <Link to="/join-us">
                  <span className="relative z-[2] flex items-center gap-2">
                    Join as Investor <ArrowRight size={16} />
                  </span>
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to="/get-funding">Raise Funding</Link>
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
              { icon: Users, value: "200+", label: "Active Investors" },
              { icon: DollarSign, value: "₹500Cr+", label: "Capital Deployed" },
              { icon: TrendingUp, value: "150+", label: "Portfolio Companies" },
              { icon: Globe, value: "15+", label: "Cities Represented" },
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

      {/* Why Invest Through FC */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold">Why Invest Through Founders Connect?</h2>
            <p className="mt-2 text-muted-foreground">Built for investors who want quality deal flow and community</p>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            {whyInvest.map((item) => (
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

      {/* Featured Investors */}
      <section className="py-20 bg-secondary/20">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold">Featured Investors</h2>
            <p className="mt-2 text-muted-foreground">A glimpse of the investors in our network</p>
          </div>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {investorHighlights.map((investor) => (
              <Card
                key={investor.name}
                className="group hover:border-primary/30 hover:shadow-lg transition-all duration-300"
              >
                <CardContent className="p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div
                      className={`h-14 w-14 rounded-full bg-gradient-to-br ${investor.color} flex items-center justify-center text-white font-bold text-lg flex-shrink-0`}
                    >
                      {investor.initials}
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg leading-tight">{investor.name}</h3>
                      <Badge variant="secondary" className="text-xs mt-1">{investor.type}</Badge>
                    </div>
                  </div>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <p><span className="font-medium text-foreground">Portfolio:</span> {investor.portfolio}</p>
                    <p><span className="font-medium text-foreground">Focus:</span> {investor.focus}</p>
                    <p><span className="font-medium text-foreground">Stage:</span> {investor.stage}</p>
                  </div>
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
            <h2 className="text-3xl font-bold md:text-4xl">Ready to Invest Smarter?</h2>
            <p className="mt-4 mx-auto max-w-xl text-primary-foreground/80">
              Join India's most collaborative investor community and get access to curated startups, co-investment opportunities, and more.
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

export default InvestorsPublic;
