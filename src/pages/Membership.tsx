import { useState } from "react";
import { Link } from "react-router-dom";
import {
  CheckCircle2,
  ArrowRight,
  Users,
  TrendingUp,
  Briefcase,
  ChevronDown,
  HelpCircle,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useSEO } from "@/hooks/useSEO";

type PricingPeriod = "monthly" | "yearly";

interface MembershipTier {
  name: string;
  icon: React.ReactNode;
  description: string;
  monthlyPrice: number;
  yearlyPrice: number;
  savings?: string;
  benefits: string[];
  registerLink: string;
  highlighted?: boolean;
}

const membershipTiers: MembershipTier[] = [
  {
    name: "Regular User",
    icon: <Users size={32} className="text-blue-500" />,
    description: "Perfect for professionals exploring opportunities",
    monthlyPrice: 499,
    yearlyPrice: 4990,
    savings: "Save ₹1990 (33%)",
    benefits: [
      "Access to members-only job board",
      "Monthly founder meetup invitations",
      "Curated startup insights & resources",
      "Members' directory access",
      "Monthly newsletter with opportunities",
      "Event attendee networking badge",
      "Basic profile analytics",
      "Email support (48-hour response)",
    ],
    registerLink: "/register/user",
  },
  {
    name: "Investor",
    icon: <TrendingUp size={32} className="text-green-500" />,
    description: "For investors looking to discover promising startups",
    monthlyPrice: 0,
    yearlyPrice: 0,
    savings: undefined,
    benefits: [
      "Founders' directory with detailed profiles",
      "Advanced search & filtering by sector",
      "Monthly founder briefing sessions",
      "Exclusive pitch event access (priority seating)",
      "Deal flow updates & startup analytics",
      "Direct messaging with verified founders",
      "Investment portfolio tracking tools",
      "Co-investor network directory",
      "Custom reports & market intelligence",
      "Dedicated investor support",
      "Speaking opportunity invitations",
      "Private founder introductions (20/month)",
    ],
    registerLink: "/register/investor",
    highlighted: true,
  },
  {
    name: "Founder",
    icon: <Briefcase size={32} className="text-purple-500" />,
    description: "For founders building the next big thing",
    monthlyPrice: 2999,
    yearlyPrice: 29990,
    savings: "Save ₹11970 (33%)",
    benefits: [
      "Premium founder profile with QR card",
      "Weekly closed-door founder sessions",
      "Investor matchmaking (10 intros/month)",
      "Pitch feedback from experts",
      "Startup playbooks & templates",
      "Co-founder matching service",
      "Early access to all events",
      "Monthly 1-on-1 mentor calls",
      "Capital raising resources & guides",
      "Team building resources",
      "Market research tools access",
      "Exclusive founder community (Slack/WhatsApp)",
    ],
    registerLink: "/register/founder",
  },
];

const Membership = () => {
  const [billingPeriod, setBillingPeriod] = useState<PricingPeriod>("yearly");
  const [openFaqId, setOpenFaqId] = useState<number | null>(0);

  // SEO Hook
  useSEO({
    title: "Membership Plans | Founders Connect",
    description: "Join Founders Connect membership to access exclusive founder and investor networks. Choose from investor, founder, or community tiers with premium benefits.",
    keywords: "founders connect membership, founder membership, investor membership, membership pricing",
    ogType: "website",
    canonicalUrl: "https://founders.connect/membership",
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-24 pb-16">
        <div className="pointer-events-none absolute -left-16 top-10 h-72 w-72 rounded-full bg-blob" />
        <div className="pointer-events-none absolute right-0 top-24 h-80 w-80 rounded-full bg-blob" />

        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl text-center">
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-primary">
              Founders Connect Membership
            </p>
            <h1 className="font-heading text-4xl font-extrabold leading-tight md:text-6xl">
              Accelerate your journey with the right network
            </h1>
            <p className="mt-5 text-lg text-muted-foreground">
              Choose your membership tier and unlock exclusive access to founders, investors,
              and opportunities that matter. Cancel anytime.
            </p>
          </div>

          {/* Billing Toggle */}
          {/* Removed - Yearly only */}
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="relative py-16 px-4">
        <div className="container mx-auto">
          <div className="grid gap-8 md:grid-cols-1 lg:grid-cols-3 max-w-6xl mx-auto">
            {membershipTiers.map((tier) => (
              <Card
                key={tier.name}
                className={`relative flex flex-col overflow-hidden transition-all duration-300 hover:shadow-2xl ${
                  tier.highlighted
                    ? "lg:scale-105 border-2 border-purple-500 shadow-xl"
                    : "border"
                }`}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="mb-3">{tier.icon}</div>
                      <CardTitle className="text-2xl">{tier.name}</CardTitle>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    {tier.description}
                  </p>
                </CardHeader>

                <CardContent className="flex-1 flex flex-col">
                  {/* Pricing */}
                  <div className="mb-6">
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-bold">
                        ₹{tier.yearlyPrice}
                      </span>
                      <span className="text-muted-foreground">
                        /year
                      </span>
                    </div>
                    {tier.savings && (
                      <p className="text-sm text-green-600 font-semibold mt-2">
                        {tier.savings}
                      </p>
                    )}
                  </div>

                  {/* CTA Button */}
                  <Button
                    asChild
                    className={`w-full mb-6 gap-2 ${
                      tier.highlighted
                        ? "bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800"
                        : ""
                    }`}
                  >
                    <Link to={tier.registerLink}>
                      Join Now <ArrowRight size={16} />
                    </Link>
                  </Button>

                  {/* Benefits List */}
                  <div className="space-y-3">
                    <p className="text-xs font-semibold uppercase text-muted-foreground">
                      Includes
                    </p>
                    {tier.benefits.map((benefit) => (
                      <div
                        key={benefit}
                        className="flex items-start gap-3 text-sm"
                      >
                        <CheckCircle2
                          size={16}
                          className="mt-0.5 flex-shrink-0 text-green-600"
                        />
                        <span className="text-muted-foreground">{benefit}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>



      {/* FAQ Section */}
      <section className="relative py-20 px-4 bg-gradient-to-b from-background via-purple-50/5 to-background">
        <div className="container mx-auto max-w-3xl">
          <div className="text-center mb-16">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-purple-100 mb-4">
              <HelpCircle size={24} className="text-purple-600" />
            </div>
            <h2 className="text-4xl font-bold mb-3 text-gradient">Frequently Asked Questions</h2>
            <p className="text-muted-foreground text-lg">
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
                className="group border border-border rounded-xl overflow-hidden bg-background transition-all duration-300 hover:border-purple-300 hover:shadow-lg"
              >
                <button
                  onClick={() => setOpenFaqId(openFaqId === idx ? null : idx)}
                  className="w-full px-6 py-4 flex items-center justify-between hover:bg-purple-50/5 transition-colors duration-200"
                >
                  <span className="text-left font-semibold text-foreground text-base">
                    {faq.q}
                  </span>
                  <ChevronDown
                    size={20}
                    className={`text-purple-600 flex-shrink-0 transition-transform duration-300 ${
                      openFaqId === idx ? "rotate-180" : ""
                    }`}
                  />
                </button>
                
                {openFaqId === idx && (
                  <div className="border-t border-border bg-gradient-to-r from-purple-50/5 to-transparent px-6 py-4 animate-in fade-in-50 slide-in-from-top-2 duration-200">
                    <p className="text-muted-foreground leading-relaxed">
                      {faq.a}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Additional Help */}
          <div className="mt-12 p-6 rounded-xl border border-purple-200 bg-gradient-to-r from-purple-50 to-blue-50 text-center">
            <p className="text-muted-foreground mb-4">
              Didn't find your answer?
            </p>
            <Button asChild className="gap-2">
              <Link to="/contact">
                Contact Our Support Team <ArrowRight size={16} />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-16 px-4 bg-gradient-to-r from-purple-600 to-purple-800 text-white">
        <div className="container mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to join Founders Connect?</h2>
          <p className="text-purple-100 mb-8">
            Choose your membership tier and start connecting with the right people today.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Button
              asChild
              className="bg-white text-purple-700 hover:bg-gray-100 gap-2"
            >
              <Link to="/register">
                Join Now <ArrowRight size={16} />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="border-white text-white hover:bg-purple-700"
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
