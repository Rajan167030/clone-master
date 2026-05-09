import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useSEO } from "@/hooks/useSEO";
import { 
  Users, 
  ShieldCheck, 
  Zap, 
  ArrowRight,
  TrendingUp,
  Target,
  BarChart3,
  CheckCircle2
} from "lucide-react";
import { Link } from "react-router-dom";

export default function GetFunding() {
  useSEO({
    title: "Get Funding | Founders Connect",
    description: "Scale your startup vision with strategic funding from our exclusive VC network.",
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="relative h-[80vh] min-h-[600px] w-full overflow-hidden">
        <img 
          src="/funding_hero_1778315464133.png" 
          alt="Funding Hero" 
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent" />
        <div className="container relative mx-auto flex h-full flex-col justify-center px-4">
          <Badge className="mb-4 w-fit bg-primary/10 text-primary hover:bg-primary/20 backdrop-blur-sm">
            For Growth-Stage Startups
          </Badge>
          <h1 className="max-w-2xl font-heading text-5xl font-extrabold leading-tight tracking-tight md:text-7xl">
            Scale Your <span className="text-primary italic">Vision</span> With Strategic Funding
          </h1>
          <p className="mt-8 max-w-xl text-lg text-muted-foreground md:text-2xl leading-relaxed">
            We bridge the gap between high-growth startups and top-tier investors. Get the capital you need to dominate your market.
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <Button asChild size="lg" className="h-14 px-8 text-lg font-bold gap-2 shadow-xl shadow-primary/25">
              <Link to="/funding-application">
                Apply Now <ArrowRight size={20} />
              </Link>
            </Button>
            <Button variant="outline" size="lg" className="h-14 px-8 text-lg font-bold backdrop-blur-sm">
              View Portfolio
            </Button>
          </div>
        </div>
      </section>

      {/* Stats / Proof Section */}
      <section className="py-12 border-y bg-secondary/10">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {[
              { label: "Partner VCs", value: "100+", icon: Target },
              { label: "Capital Raised", value: "₹50Cr+", icon: TrendingUp },
              { label: "Approved Sectors", value: "15+", icon: BarChart3 },
              { label: "Founder Satisfaction", value: "99%", icon: CheckCircle2 },
            ].map((stat, i) => (
              <div key={i} className="flex flex-col items-center text-center space-y-2">
                <stat.icon className="text-primary mb-2" size={24} />
                <p className="text-3xl md:text-4xl font-bold font-heading">{stat.value}</p>
                <p className="text-sm text-muted-foreground uppercase tracking-wider">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Us Section */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="mb-16 text-center max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold md:text-5xl font-heading mb-6">Why Raise with <span className="text-primary">Founders Connect?</span></h2>
            <p className="text-lg text-muted-foreground">We are more than just a bridge; we are your strategic partners in the fundraising journey.</p>
          </div>
          
          <div className="grid gap-8 md:grid-cols-3">
            {[
              {
                icon: Users,
                title: "Tier-1 Investor Network",
                desc: "Direct access to the same VCs and Angels who backed India's biggest unicorns."
              },
              {
                icon: ShieldCheck,
                title: "Confidentiality First",
                desc: "Your data is strictly shared with selected investors who match your industry and stage."
              },
              {
                icon: Zap,
                title: "Express Review",
                desc: "Selected startups get introduced to investors within 120 hours of application approval."
              }
            ].map((benefit, i) => (
              <Card key={i} className="border-slate-100 bg-white shadow-lg shadow-slate-100/50 transition-all hover:shadow-2xl hover:-translate-y-2 group">
                <CardContent className="pt-10 pb-8 px-8">
                  <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                    <benefit.icon size={28} />
                  </div>
                  <h3 className="mb-4 text-2xl font-bold font-heading">{benefit.title}</h3>
                  <p className="text-muted-foreground text-lg leading-relaxed">{benefit.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Image Showcase Section */}
      <section className="py-20 relative overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <h2 className="text-3xl md:text-5xl font-bold font-heading">Empowering Founders, One <span className="text-primary">Deal</span> at a Time.</h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Founders Connect fundraising module is designed for the modern entrepreneur. No more cold pitches or unanswered emails. We curate the interest so you can focus on building your product.
              </p>
              <div className="flex flex-col gap-4">
                 {[
                   "Access to Institutional VCs & Family Offices",
                   "Pitch Deck Design & Refinement Support",
                   "Compliance & Term Sheet Advisory",
                   "Post-Funding Ecosystem Support"
                 ].map((item, i) => (
                   <div key={i} className="flex items-center gap-3">
                     <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/20 text-primary">
                       <CheckCircle2 size={14} />
                     </div>
                     <span className="font-semibold text-slate-700">{item}</span>
                   </div>
                 ))}
              </div>
              <Button asChild size="lg" className="h-14 px-10 text-lg font-bold group">
                <Link to="/funding-application">
                   Start Your Application <ArrowRight className="ml-2 transition-transform group-hover:translate-x-2" size={20} />
                </Link>
              </Button>
            </div>
            
            <div className="relative">
              <div className="absolute -top-10 -right-10 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
              <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
              <Card className="overflow-hidden border-8 border-white shadow-2xl relative z-10 rounded-3xl">
                <img 
                  src="/investor_handshake_1778315491253.png" 
                  alt="Investments" 
                  className="w-full h-auto object-cover"
                />
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="container mx-auto px-4 text-center">
          <Card className="bg-slate-900 text-white border-none py-16 px-6 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-3xl -mr-32 -mt-32" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-violet-600/20 rounded-full blur-3xl -ml-32 -mb-32" />
            
            <div className="relative z-10 max-w-3xl mx-auto">
              <h2 className="text-4xl md:text-6xl font-bold font-heading mb-8 uppercase tracking-tight">Ready to fuel your growth?</h2>
              <p className="text-xl text-slate-300 mb-12">Applications for the Summer 2026 Funding Cohort are now open. Don't miss out on strategic capital.</p>
              <Button asChild size="lg" className="h-16 px-12 text-xl font-black rounded-2xl bg-white text-slate-900 hover:bg-slate-100 transition-transform active:scale-95 shadow-2xl shadow-white/10">
                <Link to="/funding-application">
                  SUBMIT YOUR PITCH NOW
                </Link>
              </Button>
            </div>
          </Card>
        </div>
      </section>

      <Footer />
    </div>
  );
}
