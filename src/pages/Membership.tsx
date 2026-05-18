import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle2, Crown, Diamond, ShieldCheck } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BackButton from "@/components/BackButton";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useSEO } from "@/hooks/useSEO";
type MembershipTier = {
  name: string;
  icon: React.ReactNode;
  description: string;
  price: string;
  badge?: string;
  features: string[];
  registerLink: string;
  highlighted?: boolean;
};

const membershipTiers: MembershipTier[] = [
  {
    name: "Silver",
    icon: <ShieldCheck className="h-6 w-6 text-slate-500" />,
    description: "Dynamic membership for active founders",
    price: "₹14,999",
    features: [
      "Access to FC member-only resources",
      "Monthly advisor roundtables",
      "Basic event priority registration",
    ],
    registerLink: "/register/user",
  },
  {
    name: "Gold",
    icon: <Crown className="h-6 w-6 text-violet-500" />,
    description: "Payment gateway ready for fast growth",
    price: "₹29,999",
    badge: "Recommended",
    features: [
      "Premium access to all FC workshops",
      "Dedicated onboarding support",
      "Higher referral earnings and credits",
    ],
    registerLink: "/register/founder",
    highlighted: true,
  },
  {
    name: "Diamond",
    icon: <Diamond className="h-6 w-6 text-slate-700" />,
    description: "Full VIP access for founders who want scale",
    price: "₹59,999",
    features: [
      "Exclusive founder investor sessions",
      "Personal mentorship and strategy reviews",
      "Priority product launch support",
    ],
    registerLink: "/register/investor",
  },
];

const Membership = () => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // SEO Hook
  useSEO({
    title: "Membership Plans | Founders Connect",
    description: "Choose your Founders Connect membership tier: Silver, Gold, or Diamond.",
    keywords: "founders connect membership, silver gold diamond membership, founder membership pricing",
    ogType: "website",
    canonicalUrl: "https://founders.connect/membership",
  });

  return (
    <div className="min-h-screen bg-[#f7f7fb]">
      <Navbar />

      <main className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <BackButton className="mb-6 px-0 max-w-[1400px] animate-reveal-left" />
        <section className="mx-auto max-w-[1400px] rounded-[28px] border border-slate-200 bg-white p-4 shadow-[0_20px_80px_-35px_rgba(15,23,42,0.18)] sm:p-6 lg:p-8">
          <div className="mx-auto max-w-4xl text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-violet-500">
              Founders Connect Membership
            </p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
              Pick the plan that matches your growth stage
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-slate-500 sm:text-lg">
              Three clean membership paths built for active founders, high-growth teams, and premium network access.
            </p>
          </div>

          {/* Shimmer sweep effect styles */}
          <style>{`
            .card-shimmer {
              position: relative;
            }
            .card-shimmer::after {
              content: '';
              position: absolute;
              top: 0;
              left: 0;
              width: 200%;
              height: 200%;
              background: linear-gradient(
                135deg,
                rgba(255, 255, 255, 0) 30%,
                rgba(255, 255, 255, 0.25) 50%,
                rgba(255, 255, 255, 0) 70%
              );
              transform: translate(-100%, -100%) rotate(45deg);
              transition: all 0.6s ease;
              pointer-events: none;
            }
            .group:hover .card-shimmer::after {
              animation: shimmerSweep 1s cubic-bezier(0.16, 1, 0.3, 1);
            }
            @keyframes shimmerSweep {
              0% {
                transform: translate(-100%, -100%) rotate(45deg);
              }
              100% {
                transform: translate(100%, 100%) rotate(45deg);
              }
            }
          `}</style>

          <div className="mt-8 grid gap-5 lg:grid-cols-3" style={{ perspective: "1500px" }}>
            {membershipTiers.map((tier, index) => (
              <Card
                key={tier.name}
                style={{
                  transitionDelay: `${index * 150}ms`,
                  opacity: isMounted ? 1 : 0,
                  transform: isMounted 
                    ? "translateY(0) scale(1) rotateX(0) rotateY(0)" 
                    : "translateY(120px) scale(0.88) rotateX(15deg) rotateY(-5deg)",
                }}
                className={`card-shimmer relative flex flex-col overflow-hidden rounded-[32px] border border-slate-200 bg-white transition-all duration-[1200ms] ease-out ${
                  tier.highlighted
                    ? "border-violet-200 bg-violet-50/35 shadow-[0_25px_60px_-35px_rgba(168,85,247,0.55)] animate-float"
                    : "shadow-[0_18px_50px_-35px_rgba(15,23,42,0.14)]"
                } hover:-translate-y-3 hover:scale-[1.02] hover:border-violet-400 hover:shadow-[0_30px_70px_-15px_rgba(168,85,247,0.45)] group`}
              >
                <CardHeader className="items-center px-6 pt-10 text-center transition-transform duration-300 group-hover:-translate-y-0.5">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-[28px] font-medium tracking-tight text-slate-950">
                      {tier.name}
                    </CardTitle>
                    {tier.badge && (
                      <Badge className="rounded-full bg-violet-100 px-3 py-1 text-xs font-semibold text-violet-600 hover:bg-violet-100">
                        {tier.badge}
                      </Badge>
                    )}
                  </div>
                  <p className="mt-4 max-w-[230px] text-sm leading-6 text-slate-500 sm:text-[15px]">
                    {tier.description}
                  </p>
                </CardHeader>

                <CardContent className="flex flex-1 flex-col px-6 pb-8 pt-4 transition-transform duration-300 group-hover:-translate-y-0.5">
                  <div className="mx-auto mb-8 w-full max-w-[270px] rounded-[28px] border border-slate-200 bg-[#f7f9fd] px-6 py-8 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.8)] transition-all duration-300 group-hover:border-violet-200 group-hover:bg-white group-hover:shadow-[0_18px_40px_-28px_rgba(168,85,247,0.28)]">
                    <div className="flex justify-center">
                      {tier.icon}
                    </div>
                    <div className="mt-4 text-5xl font-semibold tracking-tight text-slate-950 sm:text-[64px]">
                      {tier.price}
                    </div>
                    <p className="mt-1 text-sm text-slate-500">one-time</p>
                  </div>

                  <div className="space-y-4">
                    {tier.features.map((feature) => (
                      <div key={feature} className="flex items-start gap-3 text-sm leading-6 text-slate-600 sm:text-[15px]">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-violet-500" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>

                  <Button
                    asChild
                    className={`mt-8 w-full rounded-full border px-6 py-6 text-base font-semibold transition-all duration-300 group-hover:scale-[1.01] ${
                      tier.highlighted
                        ? "border-violet-500 bg-violet-500 text-white hover:bg-violet-600"
                        : "border-slate-200 bg-white text-slate-900 hover:border-slate-300 hover:bg-slate-50"
                    }`}
                  >
                    <Link to={tier.registerLink}>
                      Choose {tier.name}
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-8 grid gap-5 lg:grid-cols-2">
            <Card className="rounded-[28px] border border-violet-100 bg-white shadow-[0_18px_50px_-35px_rgba(168,85,247,0.35)]">
              <CardHeader className="px-6 pt-8 pb-2">
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-violet-400">
                  Referral Reward
                </p>
                <CardTitle className="mt-3 text-[32px] font-semibold tracking-tight text-slate-950">
                  Earn 10% commission
                </CardTitle>
              </CardHeader>
              <CardContent className="px-6 pb-8 text-base leading-7 text-slate-500">
                FC members can refer other founders and earn a 10% commission on their membership payment. This is valid for Founders Connect membership only.
              </CardContent>
            </Card>

            <Card className="rounded-[28px] border border-slate-200 bg-white shadow-[0_18px_50px_-35px_rgba(15,23,42,0.18)]">
              <CardHeader className="px-6 pt-8 pb-2">
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-violet-400">
                  Membership Benefits
                </p>
                <CardTitle className="mt-3 text-[32px] font-semibold tracking-tight text-slate-950">
                  Structured plan access
                </CardTitle>
              </CardHeader>
              <CardContent className="px-6 pb-8 text-base leading-7 text-slate-500">
                Choose Silver for a lean start, Gold for fast growth with payment gateway support, or Diamond for VIP founder-level access and hands-on mentorship.
              </CardContent>
            </Card>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Membership;
