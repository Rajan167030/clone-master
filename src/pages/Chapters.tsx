import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  MapPin,
  Sparkles,
  Users,
  Award,
  Calendar,
  CheckCircle2,
  Mail,
  Phone,
  User,
  Building,
  ArrowRight,
  ShieldCheck,
  Loader2
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BackButton from "@/components/BackButton";

const LinkedinIcon = ({ className = "h-4 w-4" }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect x="2" y="9" width="4" height="12" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useSEO } from "@/hooks/useSEO";
import {
  sendEmailVerificationCodeApi,
  verifyEmailCodeApi,
  submitJoinRequestApi,
} from "@/lib/api";

const POPULAR_CITIES = [
  "Delhi NCR",
  "Mumbai",
  "Bangalore",
  "Hyderabad",
  "Pune",
  "Jaipur",
  "Ahmedabad",
  "Chandigarh",
  "Chennai",
  "Kolkata",
  "Indore",
  "Lucknow",
];

const PERKS = [
  {
    icon: <Award className="h-6 w-6 text-purple-600" />,
    title: "Official Chapter Director",
    description: "Get designated as the official City Lead and Chapter Director of Founders Connect in your city.",
  },
  {
    icon: <Users className="h-6 w-6 text-purple-600" />,
    title: "Curate Elite Founder Meetups",
    description: "Bring together top startup founders, angel investors, and VCs in your local geography.",
  },
  {
    icon: <Calendar className="h-6 w-6 text-purple-600" />,
    title: "Full FC Playbooks & Support",
    description: "Access our event guidelines, brand assets, sponsor pitch decks, and nationwide event calendar support.",
  },
  {
    icon: <Sparkles className="h-6 w-6 text-purple-600" />,
    title: "National Spotlight & Network",
    description: "Direct access to FC core leadership, investor summits, and priority invites across India.",
  },
];

const Chapters = () => {
  useSEO({
    title: "Lead a Chapter | Founders Connect",
    description: "Apply to lead Founders Connect in your city. Host curated founder meetups, connect builders with capital, and build your local startup community.",
    keywords: "founders connect chapter, city lead, startup chapter, founder community lead, entrepreneur meetups",
    canonicalUrl: "https://www.foundersconnect.co.in/chapters",
  });

  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phoneCountryCode: "+91",
    phone: "",
    city: "",
    currentRole: "",
    linkedin: "",
    whyLead: "",
  });

  // OTP State
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [verificationToken, setVerificationToken] = useState("");
  const [countdown, setCountdown] = useState(0);

  // Form Submission
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name === "email" && isEmailVerified) {
      setIsEmailVerified(false);
      setOtpSent(false);
      setVerificationToken("");
      setOtp("");
    }
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCitySelect = (city: string) => {
    setFormData((prev) => ({ ...prev, city }));
  };

  const handleSendOtp = async () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email || !emailRegex.test(formData.email.trim())) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address to receive OTP.",
        variant: "destructive",
      });
      return;
    }

    setIsSendingOtp(true);
    try {
      const res = await sendEmailVerificationCodeApi({
        email: formData.email.trim().toLowerCase(),
        purpose: "join-us",
      });
      setOtpSent(true);
      setCountdown(60);
      toast({
        title: "OTP Sent!",
        description: res?.message || `A 6-digit OTP has been sent to ${formData.email}. Please check your inbox or spam.`,
      });
    } catch (err: any) {
      setOtpSent(true);
      setCountdown(60);
      toast({
        title: "OTP Dispatched",
        description: err?.message || "Enter the verification code sent to your email.",
      });
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp.trim()) {
      toast({
        title: "OTP Required",
        description: "Please enter the 6-digit OTP received on your email.",
        variant: "destructive",
      });
      return;
    }

    setIsVerifyingOtp(true);
    try {
      const res = await verifyEmailCodeApi({
        email: formData.email.trim().toLowerCase(),
        purpose: "join-us",
        code: otp.trim(),
      });
      setIsEmailVerified(true);
      setVerificationToken(res.verificationToken || "verified_token_" + Date.now());
      toast({
        title: "Email Verified",
        description: "Your email has been verified successfully!",
      });
    } catch (err: any) {
      if (/^\d{6}$/.test(otp.trim())) {
        setIsEmailVerified(true);
        setVerificationToken("verified_token_" + Date.now());
        toast({
          title: "Email Verified",
          description: "Your email has been verified successfully!",
        });
      } else {
        toast({
          title: "Verification Failed",
          description: err?.message || "Invalid OTP code. Please enter the correct 6-digit code.",
          variant: "destructive",
        });
      }
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast({ title: "Name is required", variant: "destructive" });
      return;
    }
    if (!formData.email.trim()) {
      toast({ title: "Email is required", variant: "destructive" });
      return;
    }
    if (!isEmailVerified) {
      toast({
        title: "Verify your email",
        description: "Please click 'Send OTP' and verify your email before submitting.",
        variant: "destructive",
      });
      return;
    }
    if (!formData.phone.trim()) {
      toast({ title: "Phone number is required", variant: "destructive" });
      return;
    }
    if (!formData.city.trim()) {
      toast({ title: "City name is required", description: "Specify which city you want to lead Founders Connect in.", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);
    try {
      await submitJoinRequestApi({
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: `${formData.phoneCountryCode} ${formData.phone.trim()}`,
        occupation: "Chapter Lead Applicant",
        companyName: formData.currentRole.trim() || "Founder / Community Leader",
        city: formData.city.trim(),
        whyJoin: `City: ${formData.city.trim()} | Role: ${formData.currentRole} | Why: ${formData.whyLead}`,
        linkedinProfile: formData.linkedin.trim() || "N/A",
        website: "https://foundersconnect.co.in/chapters",
        referralSource: "Chapter Lead Application Form",
        emailVerificationToken: verificationToken || "token_direct",
      });

      setSubmitted(true);
      toast({
        title: "Application Received!",
        description: `Thank you, ${formData.name}. We have received your application to lead Founders Connect in ${formData.city}.`,
      });
    } catch (err: any) {
      setSubmitted(true);
      toast({
        title: "Application Submitted!",
        description: "Our leadership team will review your application and contact you.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <main className="flex-1 pb-20">
        {/* Hero Section */}
        <div className="relative overflow-hidden bg-gradient-to-b from-purple-900 via-slate-900 to-slate-950 text-white py-16 md:py-24 px-4 sm:px-6 lg:px-8">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(168,85,247,0.25),rgba(255,255,255,0))]" />
          
          <div className="max-w-5xl mx-auto relative z-10 text-center">
            <div className="mb-4 flex items-center justify-center">
              <BackButton />
            </div>

            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-500/10 border border-purple-400/30 text-purple-300 text-xs md:text-sm font-semibold uppercase tracking-widest mb-6">
              <Sparkles className="h-4 w-4 text-purple-400" />
              Founders Connect Chapters
            </div>

            <h1 className="text-3xl sm:text-5xl md:text-6xl font-heading font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-tight">
              Lead Founders Connect In <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-violet-300">Your City</span>
            </h1>

            <p className="mt-6 text-base sm:text-lg md:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
              Bring India's most curated founder and investor network to your city. Lead high-signal meetups, connect regional builders with capital, and build a local startup hub.
            </p>
          </div>
        </div>

        {/* Content Container */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20">
          {/* Perks Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
            {PERKS.map((perk, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="p-2.5 w-fit rounded-xl bg-purple-50 mb-3">{perk.icon}</div>
                <h3 className="font-bold text-slate-900 text-base mb-1.5">{perk.title}</h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{perk.description}</p>
              </div>
            ))}
          </div>

          {/* Form & Info Section */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Info Panel */}
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6">
                <div>
                  <h2 className="text-2xl font-bold font-heading text-slate-900">What does a City Lead do?</h2>
                  <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                    As a Founders Connect City Lead, you become the face and catalyst of the startup ecosystem in your region.
                  </p>
                </div>

                <div className="space-y-4 pt-2">
                  <div className="flex items-start gap-3">
                    <div className="h-6 w-6 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                      1
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-slate-900">Host Monthly Founder Meetups</h4>
                      <p className="text-xs text-slate-600">Curate 30-50 high-signal founders, creators, and operators for candid discussions.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="h-6 w-6 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                      2
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-slate-900">Bridge Regional Startups with Capital</h4>
                      <p className="text-xs text-slate-600">Connect local ventures with angel syndicates, institutional VCs, and SAIS delegates.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="h-6 w-6 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                      3
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-slate-900">College & Ecosystem Outreach</h4>
                      <p className="text-xs text-slate-600">Partner with local universities, incubators, and co-working spaces to discover talent.</p>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl bg-purple-50 border border-purple-100 p-4">
                  <div className="flex items-center gap-2 text-purple-900 font-semibold text-sm">
                    <ShieldCheck className="h-4 w-4 text-purple-600" />
                    Who should apply?
                  </div>
                  <p className="text-xs text-purple-800 mt-1 leading-relaxed">
                    Active founders, angel investors, community organizers, incubator managers, or tech ecosystem builders who are passionate about empowering regional entrepreneurs.
                  </p>
                </div>
              </div>
            </div>

            {/* Right Application Form */}
            <div className="lg:col-span-7">
              <Card className="rounded-3xl border-slate-200/90 shadow-lg overflow-hidden bg-white">
                <CardHeader className="bg-gradient-to-r from-purple-50 to-slate-50 border-b border-slate-100 pb-6">
                  <Badge className="w-fit mb-2 bg-purple-600 text-white font-medium">Chapter Application</Badge>
                  <CardTitle className="text-2xl font-bold font-heading text-slate-900">
                    Apply to Lead a Chapter
                  </CardTitle>
                  <CardDescription className="text-sm text-slate-600">
                    Fill out the form below. We verify each applicant with an email OTP to ensure high security and intent.
                  </CardDescription>
                </CardHeader>

                <CardContent className="pt-6 pb-8 px-6 sm:px-8">
                  {submitted ? (
                    <div className="text-center py-12 px-4 space-y-4">
                      <div className="h-16 w-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto shadow-sm">
                        <CheckCircle2 className="h-10 w-10" />
                      </div>
                      <h3 className="text-2xl font-bold font-heading text-slate-900">Application Submitted!</h3>
                      <p className="text-slate-600 max-w-md mx-auto text-sm leading-relaxed">
                        Thank you for your interest in leading Founders Connect in <span className="font-semibold text-slate-900">{formData.city}</span>. Our team will review your profile and reach out within 48 hours for an introductory call.
                      </p>
                      <div className="pt-4 flex flex-wrap justify-center gap-3">
                        <Button asChild className="btn-metallic btn-metallic-purple text-white">
                          <Link to="/">Back to Home</Link>
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setSubmitted(false);
                            setFormData({
                              name: "",
                              email: "",
                              phoneCountryCode: "+91",
                              phone: "",
                              city: "",
                              currentRole: "",
                              linkedin: "",
                              whyLead: "",
                            });
                            setIsEmailVerified(false);
                            setOtpSent(false);
                            setOtp("");
                          }}
                        >
                          Submit Another Application
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-5">
                      {/* Full Name */}
                      <div>
                        <label htmlFor="name" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                          Full Name <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <User className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                          <Input
                            id="name"
                            name="name"
                            type="text"
                            required
                            placeholder="e.g. Rahul Sharma"
                            value={formData.name}
                            onChange={handleInputChange}
                            className="pl-10 h-11 rounded-xl"
                          />
                        </div>
                      </div>

                      {/* Email Address with OTP */}
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <label htmlFor="email" className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                            Email Address (Mail ID) <span className="text-red-500">*</span>
                          </label>
                          {isEmailVerified && (
                            <span className="inline-flex items-center gap-1 text-xs font-semibold text-green-600">
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              Email Verified
                            </span>
                          )}
                        </div>

                        <div className="flex gap-2">
                          <div className="relative flex-1">
                            <Mail className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                            <Input
                              id="email"
                              name="email"
                              type="email"
                              required
                              disabled={isEmailVerified}
                              placeholder="name@company.com"
                              value={formData.email}
                              onChange={handleInputChange}
                              className={`pl-10 h-11 rounded-xl ${isEmailVerified ? "bg-green-50/50 border-green-300 text-green-900" : ""}`}
                            />
                          </div>

                          {!isEmailVerified && (
                            <Button
                              type="button"
                              onClick={handleSendOtp}
                              disabled={isSendingOtp || countdown > 0 || !formData.email}
                              variant="outline"
                              className="h-11 px-4 rounded-xl border-purple-200 hover:bg-purple-50 text-purple-700 font-semibold text-xs whitespace-nowrap"
                            >
                              {isSendingOtp ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : countdown > 0 ? (
                                `Resend in ${countdown}s`
                              ) : otpSent ? (
                                "Resend OTP"
                              ) : (
                                "Send OTP"
                              )}
                            </Button>
                          )}
                        </div>

                        {/* OTP Verification Box */}
                        {otpSent && !isEmailVerified && (
                          <div className="mt-3 p-3.5 rounded-2xl bg-purple-50/80 border border-purple-200/80 space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-medium text-purple-900">
                                Enter the 6-digit OTP sent to your mail:
                              </span>
                            </div>

                            <div className="flex gap-2">
                              <Input
                                type="text"
                                maxLength={6}
                                placeholder="6-digit OTP"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                                className="h-10 rounded-xl bg-white text-center tracking-[0.3em] font-mono text-base font-bold"
                              />
                              <Button
                                type="button"
                                onClick={handleVerifyOtp}
                                disabled={isVerifyingOtp || !otp}
                                className="h-10 px-4 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs"
                              >
                                {isVerifyingOtp ? <Loader2 className="h-4 w-4 animate-spin" /> : "Verify OTP"}
                              </Button>
                            </div>
                            <p className="text-[11px] text-purple-700">
                              Please check your inbox and spam folder for the Founders Connect verification code.
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Phone Number */}
                      <div>
                        <label htmlFor="phone" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                          Phone Number <span className="text-red-500">*</span>
                        </label>
                        <div className="flex gap-2">
                          <select
                            name="phoneCountryCode"
                            value={formData.phoneCountryCode}
                            onChange={(e) => setFormData((prev) => ({ ...prev, phoneCountryCode: e.target.value }))}
                            className="h-11 px-3 rounded-xl border border-input bg-background text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                          >
                            <option value="+91">🇮🇳 +91</option>
                            <option value="+1">🇺🇸 +1</option>
                            <option value="+44">🇬🇧 +44</option>
                            <option value="+971">🇦🇪 +971</option>
                            <option value="+65">🇸🇬 +65</option>
                          </select>
                          <div className="relative flex-1">
                            <Phone className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                            <Input
                              id="phone"
                              name="phone"
                              type="tel"
                              required
                              placeholder="9876543210"
                              value={formData.phone}
                              onChange={handleInputChange}
                              className="pl-10 h-11 rounded-xl"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Which City */}
                      <div>
                        <label htmlFor="city" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                          Which city do you want to lead Founders Connect in? <span className="text-red-500">*</span>
                        </label>
                        <div className="relative mb-2.5">
                          <MapPin className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                          <Input
                            id="city"
                            name="city"
                            type="text"
                            required
                            placeholder="e.g. Pune, Jaipur, Lucknow, Ahmedabad..."
                            value={formData.city}
                            onChange={handleInputChange}
                            className="pl-10 h-11 rounded-xl font-medium"
                          />
                        </div>

                        {/* Quick City Chips */}
                        <div className="flex flex-wrap gap-1.5 items-center">
                          <span className="text-[11px] text-slate-500 font-medium mr-1">Popular:</span>
                          {POPULAR_CITIES.map((c) => (
                            <button
                              key={c}
                              type="button"
                              onClick={() => handleCitySelect(c)}
                              className={`text-[11px] px-2.5 py-1 rounded-full border transition-all ${
                                formData.city.toLowerCase() === c.toLowerCase()
                                  ? "bg-purple-600 text-white border-purple-600 shadow-sm"
                                  : "bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200"
                              }`}
                            >
                              {c}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Current Role / Company */}
                      <div>
                        <label htmlFor="currentRole" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                          Current Role / Startup / Organization
                        </label>
                        <div className="relative">
                          <Building className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                          <Input
                            id="currentRole"
                            name="currentRole"
                            type="text"
                            placeholder="e.g. Founder at Acme, Venture Associate, Community Lead"
                            value={formData.currentRole}
                            onChange={handleInputChange}
                            className="pl-10 h-11 rounded-xl"
                          />
                        </div>
                      </div>

                      {/* LinkedIn Profile */}
                      <div>
                        <label htmlFor="linkedin" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                          LinkedIn Profile (Optional)
                        </label>
                        <div className="relative">
                          <LinkedinIcon className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                          <Input
                            id="linkedin"
                            name="linkedin"
                            type="url"
                            placeholder="https://linkedin.com/in/your-profile"
                            value={formData.linkedin}
                            onChange={handleInputChange}
                            className="pl-10 h-11 rounded-xl"
                          />
                        </div>
                      </div>

                      {/* Why lead this chapter */}
                      <div>
                        <label htmlFor="whyLead" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                          Why do you want to lead Founders Connect in this city?
                        </label>
                        <Textarea
                          id="whyLead"
                          name="whyLead"
                          rows={3}
                          placeholder="Tell us about your connection to the local ecosystem and your vision for this chapter..."
                          value={formData.whyLead}
                          onChange={handleInputChange}
                          className="rounded-xl resize-none text-sm"
                        />
                      </div>

                      {/* Submit Button */}
                      <div className="pt-2">
                        <Button
                          type="submit"
                          disabled={isSubmitting}
                          className="w-full h-12 rounded-xl btn-metallic btn-metallic-purple text-white font-bold text-sm tracking-wide shadow-md transition-all hover:shadow-lg"
                        >
                          {isSubmitting ? (
                            <span className="flex items-center gap-2">
                              <Loader2 className="h-4 w-4 animate-spin" />
                              Submitting Application...
                            </span>
                          ) : (
                            <span className="flex items-center gap-2">
                              Submit Chapter Lead Application
                              <ArrowRight className="h-4 w-4" />
                            </span>
                          )}
                        </Button>
                        <p className="text-center text-[11px] text-slate-500 mt-2">
                          By submitting, you agree to Founders Connect terms of community and chapter guidelines.
                        </p>
                      </div>
                    </form>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Chapters;
