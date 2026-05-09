import { useEffect, useState } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import {
  Users,
  Zap,
  Target,
  TrendingUp,
  MessageCircle,
  CheckCircle,
  ArrowRight,
  Star,
  Award,
  Globe,
  Heart,
  AlertCircle,
  Loader,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useSEO } from "@/hooks/useSEO";
import { checkJoinRequestStatusApi } from "@/lib/api";

const WHATSAPP_GROUP_URL = "https://chat.whatsapp.com/Hm4ZKUpvxsy9u2L7SqcfV3";

const benefits = [
  {
    icon: Users,
    title: "Exclusive Founder Network",
    description: "Connect with India's top founders, investors, and builders in a curated community.",
  },
  {
    icon: Zap,
    title: "Accelerated Growth",
    description: "Get mentorship, strategic advice, and opportunities to scale your startup faster.",
  },
  {
    icon: Target,
    title: "Funding Opportunities",
    description: "Access to investors, pitch events, and funding connections tailored for your stage.",
  },
  {
    icon: TrendingUp,
    title: "Market Insights",
    description: "Stay ahead with exclusive market research, trends, and industry intelligence.",
  },
];

const stats = [
  { number: "500+", label: "Active Founders" },
  { number: "100+", label: "Successful Exits" },
  { number: "50+", label: "Partner Companies" },
  { number: "25+", label: "Cities Covered" },
];

const testimonials = [
  {
    name: "Rahul Sharma",
    company: "TechFlow Solutions",
    text: "Founders Connect helped me raise my first round and connect with the right mentors. The community is incredibly supportive.",
    rating: 5,
  },
  {
    name: "Priya Patel",
    company: "EduTech Innovations",
    text: "The network opened doors I never knew existed. From co-founders to investors, FC has been instrumental in our growth.",
    rating: 5,
  },
  {
    name: "Amit Kumar",
    company: "FinServe",
    text: "Best decision for my startup journey. The quality of connections and opportunities here is unmatched.",
    rating: 5,
  },
];

const Welcome = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const email = searchParams.get("email");
  const [approvalStatus, setApprovalStatus] = useState<"checking" | "approved" | "not-approved" | "error">("checking");
  const [userData, setUserData] = useState<any>(null);

  useEffect(() => {
    // Scroll to top on mount
    window.scrollTo(0, 0);

    // Check if user is approved
    const verifyApproval = async () => {
      if (!email) {
        setApprovalStatus("checking"); // Show welcome anyway if no email in URL
        return;
      }

      try {
        const response = await checkJoinRequestStatusApi(email);
        if (response.ok && response.approved) {
          setApprovalStatus("approved");
          setUserData(response.data);
        } else {
          setApprovalStatus("not-approved");
        }
      } catch (err) {
        console.error("Failed to verify approval status:", err);
        setApprovalStatus("error");
      }
    };

    verifyApproval();
  }, [email]);

  // SEO Hook
  useSEO({
    title: "Welcome to Founders Connect | Join Our Community",
    description: "Congratulations! Your join request has been approved. Welcome to India's premier founder and investor network. Connect, grow, and scale with Founders Connect.",
    keywords: "founders connect welcome, founder community, startup network india, join founders connect",
    ogType: "website",
    canonicalUrl: "https://founders.connect/welcome",
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Verification Status Banner */}
      {email && approvalStatus !== "approved" && (
        <div className="bg-amber-50 border border-amber-200">
          <div className="container mx-auto px-4 py-4">
            {approvalStatus === "checking" && (
              <div className="flex items-center gap-3 text-amber-800">
                <Loader size={20} className="animate-spin" />
                <span>Verifying your approval status...</span>
              </div>
            )}
            {approvalStatus === "not-approved" && (
              <div className="flex items-center gap-3 text-amber-800">
                <AlertCircle size={20} />
                <span>Your join request is still pending admin review. You'll receive an email once approved.</span>
              </div>
            )}
            {approvalStatus === "error" && (
              <div className="flex items-center gap-3 text-amber-800">
                <AlertCircle size={20} />
                <span>Unable to verify status. Please try refreshing the page.</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Success Message with User Data */}
      {email && approvalStatus === "approved" && userData && (
        <div className="bg-green-50 border border-green-200">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center gap-3 text-green-800">
              <CheckCircle size={20} className="text-green-600" />
              <span>
                ✓ Welcome {userData.name}! Your profile ({userData.company} from {userData.city}) is verified and approved.
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-24 pb-16">
        <div className="pointer-events-none absolute -left-16 top-10 h-72 w-72 rounded-full bg-blob" />
        <div className="pointer-events-none absolute right-0 top-24 h-80 w-80 rounded-full bg-blob" />

        <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[520px] overflow-hidden">
          <div className="absolute inset-x-0 top-0 h-[420px] bg-gradient-to-b from-green-700/20 to-transparent" />
          <svg
            viewBox="0 0 1440 320"
            className="absolute bottom-0 left-0 right-0 h-[260px] w-full text-green-500/20"
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
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-6">
              <CheckCircle size={32} className="text-green-600" />
            </div>
            <h1 className="font-heading text-4xl font-extrabold leading-tight md:text-6xl text-green-700">
              Welcome to Founders Connect! 🎉
            </h1>
            <p className="mt-5 text-lg text-muted-foreground">
              Congratulations! Your join request has been approved. You're now part of India's most valuable founder community.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={() => window.open(WHATSAPP_GROUP_URL, "_blank", "noopener,noreferrer")}
                className="bg-green-600 hover:bg-green-700 text-white gap-2 px-8 py-3 text-lg"
              >
                <MessageCircle size={20} />
                Join WhatsApp Community
              </Button>
              <Button
                asChild
                variant="outline"
                className="border-green-200 text-green-700 hover:bg-green-50 gap-2 px-8 py-3 text-lg"
              >
                <Link to="/events">
                  Explore Events <ArrowRight size={16} />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* What is Founders Connect */}
      <section className="relative py-16 px-4 bg-gradient-to-b from-background to-slate-50/50">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-purple-100 text-purple-700 px-4 py-2">About Us</Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">What is Founders Connect?</h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Founders Connect is India's premier ecosystem for founders, builders, and investors.
              We create high-signal connections and opportunities that accelerate startup growth and success.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4 mb-12">
            {benefits.map(({ icon: Icon, title, description }) => (
              <Card key={title} className="group relative overflow-hidden rounded-2xl border border-border/60 bg-gradient-to-b from-white to-slate-50 shadow-lg transition-all duration-300 hover:-translate-y-2 hover:scale-[1.02] hover:border-purple/40 hover:shadow-2xl">
                <CardContent className="p-6 text-center">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-md mb-4">
                    <Icon size={24} />
                  </div>
                  <h3 className="text-lg font-semibold mb-3">{title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-purple-600 mb-2">{stat.number}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose FC */}
      <section className="relative py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-blue-100 text-blue-700 px-4 py-2">Why Choose FC</Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Founders Choose Founders Connect</h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Join thousands of founders who have accelerated their journey with our community-driven approach.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            <Card className="p-6 text-center border-2 border-purple-100 bg-gradient-to-b from-purple-50 to-white">
              <Award className="h-12 w-12 text-purple-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-3">Quality Over Quantity</h3>
              <p className="text-muted-foreground">
                We focus on creating meaningful connections rather than just numbers. Every member is vetted and committed to mutual growth.
              </p>
            </Card>

            <Card className="p-6 text-center border-2 border-blue-100 bg-gradient-to-b from-blue-50 to-white">
              <Globe className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-3">Pan-India Network</h3>
              <p className="text-muted-foreground">
                Connect with founders and investors across India. Our community spans major cities and emerging startup hubs.
              </p>
            </Card>

            <Card className="p-6 text-center border-2 border-green-100 bg-gradient-to-b from-green-50 to-white">
              <Heart className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-3">Community First</h3>
              <p className="text-muted-foreground">
                Built by founders, for founders. Our community culture emphasizes collaboration, support, and shared success.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="relative py-16 px-4 bg-gradient-to-b from-slate-50/50 to-background">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-yellow-100 text-yellow-700 px-4 py-2">Success Stories</Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">What Our Members Say</h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Real stories from founders who have transformed their journey with Founders Connect.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="p-6 bg-white border border-slate-200 shadow-sm">
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-slate-700 mb-4 italic">"{testimonial.text}"</p>
                <div>
                  <p className="font-semibold text-slate-900">{testimonial.name}</p>
                  <p className="text-sm text-slate-500">{testimonial.company}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Ad Space Placeholder */}
      <section className="relative py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-8">
            <Badge className="mb-4 bg-gray-100 text-gray-700 px-4 py-2">Advertisement</Badge>
          </div>

          {/* Ad Space - Replace with actual ad content */}
          <div className="min-h-[300px] border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50">
            <div className="text-center text-gray-500">
              <div className="text-4xl mb-4">📢</div>
              <p className="text-lg font-semibold">Ad Space Available</p>
              <p className="text-sm">Perfect spot for startup tools, services, or community partners</p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative py-16 px-4 bg-gradient-to-r from-purple-600 to-purple-800 text-white">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">Ready to Start Your Journey?</h2>
          <p className="text-purple-100 mb-8 text-base md:text-lg">
            Join our WhatsApp community and start connecting with fellow founders today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={() => window.open(WHATSAPP_GROUP_URL, "_blank", "noopener,noreferrer")}
              className="bg-white text-purple-700 hover:bg-gray-100 gap-2 px-8 py-3 text-lg"
            >
              <MessageCircle size={20} />
              Join WhatsApp Group
            </Button>
            <Button
              asChild
              variant="outline"
              className="border-white text-white hover:bg-purple-700 px-8 py-3 text-lg"
            >
              <Link to="/events">Explore Upcoming Events</Link>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Welcome;