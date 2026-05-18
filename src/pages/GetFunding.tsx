import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BackButton from "@/components/BackButton";
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
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useSEO({
    title: "Get Funding | Founders Connect",
    description: "Scale your startup vision with strategic funding from our exclusive VC network.",
  });

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      <Navbar />

      {/* Hero Section */}
      <section className="relative h-[80vh] min-h-[600px] w-full overflow-hidden">
        <img 
          src="/funding_hero_1778315464133.png" 
          alt="Funding Hero" 
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent" />
        
        <BackButton className="absolute left-0 right-0 top-24 z-20 animate-reveal-left" />

        <div className="container relative mx-auto flex h-full flex-col justify-center px-4">
          <Badge 
            style={{
              opacity: isMounted ? 1 : 0,
              transform: isMounted ? "translateY(0)" : "translateY(20px)",
              transition: "all 0.8s cubic-bezier(0.16, 1, 0.3, 1) 100ms"
            }}
            className="mb-4 w-fit bg-primary/10 text-primary hover:bg-primary/20 backdrop-blur-sm"
          >
            For Growth-Stage Startups
          </Badge>
          <h1 
            style={{
              opacity: isMounted ? 1 : 0,
              transform: isMounted ? "translateY(0)" : "translateY(30px)",
              transition: "all 0.8s cubic-bezier(0.16, 1, 0.3, 1) 250ms"
            }}
            className="max-w-2xl font-heading text-5xl font-extrabold leading-tight tracking-tight md:text-7xl"
          >
            Scale Your <span className="text-primary italic">Vision</span> With Strategic Funding
          </h1>
          <p 
            style={{
              opacity: isMounted ? 1 : 0,
              transform: isMounted ? "translateY(0)" : "translateY(30px)",
              transition: "all 0.8s cubic-bezier(0.16, 1, 0.3, 1) 400ms"
            }}
            className="mt-8 max-w-xl text-lg text-muted-foreground md:text-2xl leading-relaxed"
          >
            We bridge the gap between high-growth startups and top-tier investors. Get the capital you need to dominate your market.
          </p>
          <div 
            style={{
              opacity: isMounted ? 1 : 0,
              transform: isMounted ? "translateY(0)" : "translateY(30px)",
              transition: "all 0.8s cubic-bezier(0.16, 1, 0.3, 1) 550ms"
            }}
            className="mt-10 flex flex-wrap gap-4"
          >
            <Button asChild size="lg" className="h-14 px-8 text-lg font-bold gap-2 shadow-xl shadow-primary/25 hover:scale-[1.02] transition-transform">
              <Link to="/funding-application">
                Apply Now <ArrowRight size={20} />
              </Link>
            </Button>
            
          </div>
        </div>
      </section>


      {/* CTA Section */}
      <section className="py-24">
        <div className="container mx-auto px-4 text-center">
          <Card 
            style={{
              opacity: isMounted ? 1 : 0,
              transform: isMounted ? "translateY(0) scale(1)" : "translateY(50px) scale(0.97)",
              transition: "all 1s cubic-bezier(0.16, 1, 0.3, 1) 700ms"
            }}
            className="bg-slate-900 text-white border-none py-16 px-6 overflow-hidden relative shadow-[0_30px_70px_-10px_rgba(0,0,0,0.3)] rounded-[32px]"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-3xl -mr-32 -mt-32" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-violet-600/20 rounded-full blur-3xl -ml-32 -mb-32" />
            
            <div className="relative z-10 max-w-3xl mx-auto">
              <h2 className="text-4xl md:text-6xl font-bold font-heading mb-8 uppercase tracking-tight">Ready to fuel your growth?</h2>
              <p className="text-xl text-slate-300 mb-12">Applications for the Summer 2026 Funding Cohort are now open. Don't miss out on strategic capital.</p>
              <Button asChild size="lg" className="h-16 px-12 text-xl font-black rounded-2xl bg-white text-slate-900 hover:bg-slate-100 hover:scale-[1.02] active:scale-95 transition-all shadow-2xl shadow-white/10">
                <Link to="/funding-application">
                  SUBMIT PITCH
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
