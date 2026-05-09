import { useState } from "react";
import { Link } from "react-router-dom";
import { CheckCircle2, ArrowRight, ChevronDown, HelpCircle } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useSEO } from "@/hooks/useSEO";

interface MembershipTier {
  name: string;
  description: string;
  price: number;
  period: string;
  benefits: string[];
  registerLink: string;
  highlighted?: boolean;
  badge?: string;
}

const membershipTiers: MembershipTier[] = [
  {
    name: "Silver",
    description: "Dynamic membership for active founders",
    price: 14999,
    period: "one-time",
    benefits: [
      "Access to FC member-only resources",
      "Monthly advisor roundtables",
      "Basic event priority registration",
    ],
    registerLink: "/register/user",
  },
  {
    name: "Gold",
    description: "Payment gateway ready for fast growth",
    price: 29999,
    period: "one-time",
    benefits: [
      "Premium access to all FC workshops",
      "Dedicated onboarding support",
      "Higher referral earnings and credits",
    ],
    registerLink: "/register/user",
    highlighted: true,
    badge: "Recommended",
  },
  {
    name: "Diamond",
    description: "Full VIP access for founders who want scale",
    price: 59999,
    period: "one-time",
    benefits: [
      "Exclusive founder investor sessions",
      "Personal mentorship and strategy reviews",
      "Priority product launch support",
    ],
    registerLink: "/register/user",
  },
];

const Membership = () => {
  const [openFaqId, setOpenFaqId] = useState<number | null>(0);

  // SEO Hook
  useSEO({
    title: "Membership Plans | Founders Connect",
    description: "Explore Silver, Gold, and Diamond user memberships at Founders Connect. Unlock premium founder support, investor access, and referral rewards for FC members.",
    keywords: "founders connect membership, silver membership, gold membership, diamond membership, fc referral commission",
    ogType: "website",
    canonicalUrl: "https://founders.connect/membership",
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-8 md:pt-24 md:pb-16">
        <div className="pointer-events-none absolute -left-16 top-10 h-72 w-72 rounded-full bg-blob" />
        <div className="pointer-events-none absolute right-0 top-24 h-80 w-80 rounded-full bg-blob" />

        <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[320px] md:h-[520px] overflow-hidden">
          <div className="absolute inset-x-0 top-0 h-[220px] md:h-[420px] bg-gradient-to-b from-purple-700/20 to-transparent" />
          <svg
            viewBox="0 0 1440 320"
            className="absolute bottom-0 left-0 right-0 h-[160px] md:h-[260px] w-full text-purple-500/20"
            preserveAspectRatio="none"
          >
            <path
              fill="currentColor"
              d="M0,224L60,202.7C120,181,240,139,360,138.7C480,139,600,181,720,202.7C840,224,960,224,1080,224C1200,224,1320,224,1380,224L1440,224L1440,320L1380,320C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z"
            />
          </svg>
        </div>

        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl text-center">
            <h1 className="font-heading text-3xl font-extrabold leading-tight md:text-4xl lg:text-6xl">
              Join FC with the right membership tier
            </h1>
            <p className="mt-4 text-base md:text-lg text-muted-foreground">
              Choose a user-only membership plan and unlock founder-focused support.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="relative py-8 px-4 md:py-16">
        <div className="container mx-auto max-w-6xl">
          <div className="rounded-[24px] md:rounded-[32px] border border-slate-200 bg-white p-4 md:p-8 shadow-xl shadow-slate-200/30">
            <div className="grid gap-6 md:gap-10 grid-cols-1 md:grid-cols-3">
              {membershipTiers.map((tier) => (
                <Card
                  key={tier.name}
                  className={`rounded-[20px] md:rounded-[28px] border px-4 md:px-6 pb-6 md:pb-10 pt-6 md:pt-8 text-center transition-all duration-300 ${
                    tier.highlighted
                      ? "border-purple-200 bg-purple-50 shadow-2xl"
                      : "border-slate-200 bg-white shadow-sm"
                  }`}
                >
                  <CardContent className="flex h-full flex-col justify-between gap-4 md:gap-7">
                    <div>
                      <div className="flex items-center justify-center gap-2">
                        <h3 className="text-xl md:text-2xl font-semibold text-slate-950">{tier.name}</h3>
                        {tier.badge && (
                          <Badge className="rounded-full bg-purple-100 px-2 md:px-3 py-1 text-xs font-semibold text-purple-700">
                            {tier.badge}
                          </Badge>
                        )}
                      </div>
                      <p className="mt-3 md:mt-4 text-sm text-slate-600">{tier.description}</p>
                    </div>

                    <div className="rounded-[20px] md:rounded-[28px] border border-slate-200 bg-slate-50 p-6 md:p-8">
                      <div className="text-3xl md:text-5xl font-bold tracking-tight text-slate-950">₹{tier.price.toLocaleString()}</div>
                      <p className="mt-2 text-sm text-slate-500">{tier.period}</p>
                    </div>

                    <div className="space-y-2 md:space-y-3 text-left">
                      {tier.benefits.map((benefit) => (
                        <div key={benefit} className="flex items-start gap-2 md:gap-3 text-sm text-slate-600">
                          <CheckCircle2 size={16} className="mt-1 text-purple-600" />
                          <span>{benefit}</span>
                        </div>
                      ))}
                    </div>

                    <Button
                      asChild
                      className={`w-full rounded-full px-4 md:px-6 py-2 md:py-3 text-sm md:text-base font-semibold transition ${
                        tier.highlighted
                          ? "bg-purple-600 text-white hover:bg-purple-700"
                          : "border border-slate-300 bg-white text-slate-900 hover:bg-slate-100"
                      }`}
                    >
                      <Link to={tier.registerLink}>Choose {tier.name}</Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <div className="mt-8 md:mt-12 grid gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2">
            <div className="rounded-[20px] md:rounded-[28px] border border-slate-200 bg-gradient-to-r from-purple-50 to-white p-6 md:p-8 shadow-sm">
              <p className="text-xs md:text-sm uppercase tracking-[0.25em] text-purple-600">Referral reward</p>
              <h2 className="mt-3 md:mt-4 text-xl md:text-3xl font-semibold text-slate-950">Earn 10% commission</h2>
              <p className="mt-3 md:mt-4 text-sm md:text-base text-slate-600">
                FC members can refer other founders and earn a 10% commission on their membership payment. This is valid for Founders Connect membership only.
              </p>
            </div>
            <div className="rounded-[20px] md:rounded-[28px] border border-slate-200 bg-gradient-to-r from-slate-50 to-white p-6 md:p-8 shadow-sm">
              <p className="text-xs md:text-sm uppercase tracking-[0.25em] text-purple-600">Membership benefits</p>
              <h2 className="mt-3 md:mt-4 text-xl md:text-3xl font-semibold text-slate-950">Structured plan access</h2>
              <p className="mt-3 md:mt-4 text-sm md:text-base text-slate-600">
                Choose Silver for a lean start, Gold for fast growth with payment gateway support, or Diamond for VIP founder-level access and hands-on mentorship.
              </p>
            </div>
          </div>
        </div>
      </section>



      {/* FAQ Section */}
      <section className="relative py-12 md:py-20 px-4 bg-gradient-to-b from-background via-purple-50/5 to-background">
        <div className="container mx-auto max-w-3xl">
          <div className="text-center mb-8 md:mb-16">
            <div className="inline-flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-full bg-purple-100 mb-4">
              <HelpCircle size={20} className="text-purple-600" />
            </div>
            <h2 className="text-2xl md:text-4xl font-bold mb-3 text-gradient">Frequently Asked Questions</h2>
            <p className="text-muted-foreground text-base md:text-lg">
              Find answers to common questions about our membership plans
            </p>
          </div>

          <div className="space-y-3">
            {[
              {
                q: "Can I change my membership tier anytime?",
                a: "Yes! You can upgrade or downgrade your membership anytime. Changes take effect at the start of your next billing cycle.",
              },
              {
                q: "Is there a free trial?",
                a: "We offer a 7-day free trial for new members. No credit card required to start exploring.",
              },
              {
                q: "Do you offer refunds?",
                a: "We have a 30-day money-back guarantee. If you're not satisfied, we'll refund your membership fee.",
              },
              {
                q: "What payment methods do you accept?",
                a: "We accept all major credit/debit cards, UPI, and bank transfers. All payments are secured with industry-standard encryption.",
              },
              {
                q: "Can I cancel my membership?",
                a: "Yes, you can cancel anytime with no questions asked. Your access continues until the end of your billing period.",
              },
              {
                q: "What if I'm not sure which tier is right for me?",
                a: "Contact our support team at support@foundersconnect.in or schedule a free consultation call to find the perfect plan for you.",
              },
            ].map((faq, idx) => (
              <div
                key={idx}
                className="group border border-border rounded-lg md:rounded-xl overflow-hidden bg-background transition-all duration-300 hover:border-purple-300 hover:shadow-lg"
              >
                <button
                  onClick={() => setOpenFaqId(openFaqId === idx ? null : idx)}
                  className="w-full px-4 md:px-6 py-3 md:py-4 flex items-center justify-between hover:bg-purple-50/5 transition-colors duration-200"
                >
                  <span className="text-left font-semibold text-foreground text-sm md:text-base">
                    {faq.q}
                  </span>
                  <ChevronDown
                    size={18}
                    className={`text-purple-600 flex-shrink-0 transition-transform duration-300 ${
                      openFaqId === idx ? "rotate-180" : ""
                    }`}
                  />
                </button>
                
                {openFaqId === idx && (
                  <div className="border-t border-border bg-gradient-to-r from-purple-50/5 to-transparent px-4 md:px-6 py-3 md:py-4 animate-in fade-in-50 slide-in-from-top-2 duration-200">
                    <p className="text-muted-foreground leading-relaxed text-sm md:text-base">
                      {faq.a}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Additional Help */}
          <div className="mt-8 md:mt-12 p-4 md:p-6 rounded-lg md:rounded-xl border border-purple-200 bg-gradient-to-r from-purple-50 to-blue-50 text-center">
            <p className="text-muted-foreground mb-3 md:mb-4 text-sm md:text-base">
              Didn't find your answer?
            </p>
            <Button asChild className="gap-2 text-sm md:text-base">
              <Link to="/contact">
                Contact Our Support Team <ArrowRight size={14} />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-12 md:py-16 px-4 bg-gradient-to-r from-purple-600 to-purple-800 text-white">
        <div className="container mx-auto max-w-3xl text-center">
          <h2 className="text-xl md:text-3xl font-bold mb-3 md:mb-4">Ready to join Founders Connect?</h2>
          <p className="text-purple-100 mb-6 md:mb-8 text-sm md:text-base">
            Choose your membership tier and start connecting with the right people today.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center">
            <Button
              asChild
              className="bg-white text-purple-700 hover:bg-gray-100 gap-2 text-sm md:text-base"
            >
              <Link to="/register">
                Join Now <ArrowRight size={14} />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="border-white text-white hover:bg-purple-700 text-sm md:text-base"
            >
              <Link to="/contact">Contact Sales</Link>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Membership;
