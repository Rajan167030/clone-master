import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BackButton from "@/components/BackButton";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useSEO } from "@/hooks/useSEO";
import { Lightbulb, Users, Star, ArrowRight, Briefcase, Globe, Award } from "lucide-react";
import { Link } from "react-router-dom";

const mentorData = [
  {
    name: "Priya Sharma",
    role: "Serial Entrepreneur & Mentor",
    expertise: ["Product Strategy", "GTM", "Fundraising"],
    company: "Ex-Flipkart, 3× Founder",
    bio: "15+ years building consumer internet products. Mentored 50+ early-stage startups across Southeast Asia.",
    avatar: null,
    initials: "PS",
    color: "from-purple-500 to-pink-500",
  },
  {
    name: "Rahul Mehta",
    role: "Venture Builder",
    expertise: ["B2B SaaS", "Sales", "Scaling"],
    company: "Managing Director, Surge Labs",
    bio: "Helped 30+ B2B startups find product-market fit and scale their first $1M ARR.",
    avatar: null,
    initials: "RM",
    color: "from-blue-500 to-cyan-500",
  },
  {
    name: "Anjali Gupta",
    role: "Deep Tech Specialist",
    expertise: ["AI/ML", "Hardware", "R&D Commercialisation"],
    company: "IIT Alumni | CTO turned Investor",
    bio: "Bridges the gap between cutting-edge research and scalable product development.",
    avatar: null,
    initials: "AG",
    color: "from-emerald-500 to-teal-500",
  },
  {
    name: "Vikram Nair",
    role: "D2C & Brand Expert",
    expertise: ["Brand Building", "D2C", "Performance Marketing"],
    company: "Founder, BrandCraft Studio",
    bio: "Built and scaled multiple D2C brands from ₹0 to ₹100Cr. Expert in digital-first brand growth.",
    avatar: null,
    initials: "VN",
    color: "from-orange-500 to-amber-500",
  },
  {
    name: "Deepika Rao",
    role: "Legal & Compliance Advisor",
    expertise: ["Startup Law", "IP", "Compliance"],
    company: "Partner, Rao & Associates",
    bio: "Specialises in startup structuring, term-sheet negotiation and IP protection for early-stage ventures.",
    avatar: null,
    initials: "DR",
    color: "from-rose-500 to-red-500",
  },
  {
    name: "Aditya Patel",
    role: "FinTech Growth Mentor",
    expertise: ["FinTech", "Regulatory", "Partnerships"],
    company: "Ex-RBI | FinTech Advisor",
    bio: "Navigated complex regulatory landscapes for 20+ fintech startups across lending and payments.",
    avatar: null,
    initials: "AP",
    color: "from-violet-500 to-purple-500",
  },
];

const Mentors = () => {
  useSEO({
    title: "Mentors | Founders Connect",
    description:
      "Meet our world-class mentors — seasoned founders, operators, and domain experts who guide early-stage startups to success.",
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden pt-8 md:pt-12 pb-20">
        <div className="pointer-events-none absolute -left-24 top-0 h-72 w-72 rounded-full bg-primary/5 blur-3xl" />
        <div className="pointer-events-none absolute right-0 top-20 h-80 w-80 rounded-full bg-purple-400/5 blur-3xl" />

        <div className="container mx-auto px-4">
          <BackButton className="mb-6" />
          <div className="text-center max-w-3xl mx-auto">
            <Badge variant="outline" className="mb-4 gap-1.5 px-4 py-1 text-primary border-primary/20 bg-primary/5">
              <Lightbulb size={14} /> World-Class Mentorship
            </Badge>
            <h1 className="font-heading text-4xl font-extrabold tracking-tight md:text-6xl">
              Learn from Those Who've{" "}
              <span className="text-primary italic">Done It</span>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground md:text-xl">
              Our mentors are battle-tested founders, operators, and investors who bring
              hands-on expertise to help you navigate your startup journey.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Button asChild size="lg" className="btn-metallic btn-metallic-purple text-white">
                <Link to="/join-us">
                  <span className="relative z-[2] flex items-center gap-2">
                    Apply for Mentorship <ArrowRight size={16} />
                  </span>
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to="/become-a-member">Become a Member</Link>
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
              { icon: Users, value: "100+", label: "Active Mentors" },
              { icon: Briefcase, value: "500+", label: "Startups Mentored" },
              { icon: Globe, value: "20+", label: "Cities Covered" },
              { icon: Award, value: "12+", label: "Domains of Expertise" },
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

      {/* Mentor Grid */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold">Featured Mentors</h2>
            <p className="mt-2 text-muted-foreground">
              A curated selection from our growing mentor community
            </p>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {mentorData.map((mentor) => (
              <Card
                key={mentor.name}
                className="group relative overflow-hidden border border-border hover:border-primary/30 hover:shadow-lg transition-all duration-300"
              >
                <CardContent className="p-6">
                  <div className="flex items-start gap-4 mb-4">
                    <div
                      className={`h-14 w-14 rounded-full bg-gradient-to-br ${mentor.color} flex items-center justify-center text-white font-bold text-lg flex-shrink-0`}
                    >
                      {mentor.initials}
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg leading-tight">{mentor.name}</h3>
                      <p className="text-sm text-primary">{mentor.role}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{mentor.company}</p>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{mentor.bio}</p>
                  <div className="flex flex-wrap gap-2">
                    {mentor.expertise.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
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
            <h2 className="text-3xl font-bold md:text-4xl">Become a Mentor</h2>
            <p className="mt-4 mx-auto max-w-xl text-primary-foreground/80">
              Share your expertise and give back to the startup ecosystem. Join our community of
              mentors shaping India's next generation of founders.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Button asChild variant="secondary" size="lg" className="px-8">
                <Link to="/partner-with-us">Apply as Mentor</Link>
              </Button>
            </div>
          </div>
        </Card>
      </section>

      <Footer />
    </div>
  );
};

export default Mentors;
