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
