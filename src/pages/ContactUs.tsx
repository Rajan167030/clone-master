import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BackButton from "@/components/BackButton";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { useSEO } from "@/hooks/useSEO";
import {
  Mail,
  MapPin,
  Phone,
  MessageSquare,
  Send,
  Building,
  CheckCircle2,
  Clock,
  Sparkles,
} from "lucide-react";
import { Link } from "react-router-dom";

const ContactUs = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "founder",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useSEO({
    title: "Contact Us | Founders Connect Community Support",
    description: "Get in touch with the Founders Connect core team, chapter leaders, and partnership coordinators.",
    keywords: "contact founders connect, startup inquiry, partnership contact, founder support, investor inquiry",
    ogType: "website",
    canonicalUrl: "https://founders.connect/contact-us",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate async submission
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
      toast({
        title: "Message Sent Successfully!",
        description: "Thank you for reaching out. A community coordinator will respond within 24-48 hours.",
      });
      setFormData({
        name: "",
        email: "",
        role: "founder",
        subject: "",
        message: "",
      });
    }, 900);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Header */}
      <section className="relative overflow-hidden bg-[#FAF7F0] bg-[radial-gradient(circle,#EFE9D8_1px,transparent_1px)] bg-[length:22px_22px] pt-8 pb-16 md:pt-12 md:pb-20 border-b border-[#1B1B1F]/10">
        <div className="container mx-auto px-4">
          <BackButton className="px-0 mx-0 max-w-none mb-6 animate-reveal-left" />

          <div className="max-w-3xl mx-auto text-center">
            <p className="mb-3 inline-flex items-center gap-2 font-['IBM_Plex_Mono'] text-xs font-semibold uppercase tracking-[0.22em] text-[#6B8F71]">
              <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-[#6B8F71]" />
              Get In Touch
            </p>
            <h1 className="font-['Space_Grotesk'] text-4xl sm:text-5xl font-extrabold tracking-tight text-[#1B1B1F]">
              Let's Build Something <span className="text-[#E4572E]">Transformative</span> Together
            </h1>
            <p className="mt-4 text-base md:text-lg text-[#6B6558] max-w-2xl mx-auto leading-relaxed">
              Have questions about upcoming cohorts, partnership opportunities, city chapters, or press? We are here to help.
            </p>
          </div>
        </div>
      </section>

      {/* Main Content: Form + Office Locations */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* Left: Contact Form */}
            <div className="lg:col-span-7">
              <Card className="border-slate-200 rounded-2xl shadow-sm bg-white p-6 sm:p-8">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold font-['Space_Grotesk'] text-slate-900">
                    Send us a Message
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 mt-1">
                    Fill out the form below and the appropriate chapter or vertical lead will connect with you.
                  </p>
                </div>

                {submitted ? (
                  <div className="py-12 text-center bg-emerald-50/60 rounded-xl border border-emerald-100 p-6">
                    <CheckCircle2 size={48} className="text-emerald-600 mx-auto mb-3" />
                    <h3 className="text-xl font-bold text-slate-900 font-['Space_Grotesk']">
                      Thank you for contacting us!
                    </h3>
                    <p className="text-sm text-slate-600 mt-2 max-w-md mx-auto">
                      Your inquiry has been received. Our team typically replies within 1 business day.
                    </p>
                    <Button
                      onClick={() => setSubmitted(false)}
                      className="mt-6 bg-slate-900 text-white rounded-lg hover:bg-slate-800"
                    >
                      Send Another Message
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-700">Your Full Name</label>
                        <Input
                          required
                          placeholder="e.g. Alex Sharma"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="rounded-lg"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-700">Email Address</label>
                        <Input
                          required
                          type="email"
                          placeholder="you@company.com"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className="rounded-lg"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-700">I am a...</label>
                        <select
                          className="w-full h-10 px-3 text-sm rounded-lg border border-input bg-background text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
                          value={formData.role}
                          onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                        >
                          <option value="founder">Founder / Co-founder</option>
                          <option value="investor">Angel Investor / VC</option>
                          <option value="corporate">Corporate / Brand Partner</option>
                          <option value="college">College / University Representative</option>
                          <option value="mentor">Prospective Mentor</option>
                          <option value="other">Other Inquiry</option>
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-700">Subject</label>
                        <Input
                          required
                          placeholder="Brief topic or question"
                          value={formData.subject}
                          onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                          className="rounded-lg"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-700">Message</label>
                      <Textarea
                        required
                        rows={5}
                        placeholder="Tell us more about what you're working on, questions about memberships, or partnership proposals..."
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        className="rounded-lg"
                      />
                    </div>

                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full btn-metallic btn-metallic-purple text-white py-6 rounded-xl font-semibold flex items-center justify-center gap-2 mt-4"
                    >
                      {isSubmitting ? (
                        <span>Submitting...</span>
                      ) : (
                        <>
                          <Send size={16} /> Send Message
                        </>
                      )}
                    </Button>
                  </form>
                )}
              </Card>
            </div>

            {/* Right: Contact Information & Hubs */}
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-6 sm:p-8">
                <h3 className="font-['Space_Grotesk'] text-xl font-bold text-slate-900 mb-4">
                  Direct Communications
                </h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center text-purple-700 flex-shrink-0">
                      <Mail size={18} />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">General Inquiries</div>
                      <a href="mailto:hello@foundersconnect.org" className="text-sm font-semibold text-slate-900 hover:text-purple-600 transition-colors">
                        hello@foundersconnect.org
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center text-amber-700 flex-shrink-0">
                      <Sparkles size={18} />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Partnerships & Sponsors</div>
                      <a href="mailto:partners@foundersconnect.org" className="text-sm font-semibold text-slate-900 hover:text-purple-600 transition-colors">
                        partners@foundersconnect.org
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-700 flex-shrink-0">
                      <Clock size={18} />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Support Hours</div>
                      <p className="text-sm text-slate-700">Mon - Fri: 10:00 AM - 7:00 PM IST</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* City Chapters Hubs */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8">
                <h3 className="font-['Space_Grotesk'] text-xl font-bold text-slate-900 mb-4">
                  Key Regional Hubs
                </h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-3 text-xs sm:text-sm text-slate-700">
                    <MapPin size={16} className="text-[#E4572E] mt-0.5 flex-shrink-0" />
                    <div>
                      <strong className="text-slate-900 block font-['Space_Grotesk']">Bangalore Hub (HQ)</strong>
                      <span>Koramangala 4th Block & HSR Sector 2, Bengaluru, Karnataka 560034</span>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 text-xs sm:text-sm text-slate-700">
                    <MapPin size={16} className="text-purple-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <strong className="text-slate-900 block font-['Space_Grotesk']">Delhi NCR Chapter</strong>
                      <span>Cyber City Phase II, Gurugram, Haryana 122002</span>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 text-xs sm:text-sm text-slate-700">
                    <MapPin size={16} className="text-blue-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <strong className="text-slate-900 block font-['Space_Grotesk']">Mumbai Chapter</strong>
                      <span>Bandra Kurla Complex (BKC), Mumbai, Maharashtra 400051</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100">
                  <Link
                    to="/chapters"
                    className="text-xs font-bold text-purple-600 hover:text-purple-700 inline-flex items-center gap-1"
                  >
                    Explore all 12 city chapters & coordinators →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default ContactUs;
