import { useState, type ChangeEvent, type FormEvent } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Zap, Target, TrendingUp, Link as LinkIcon, Copy, CheckCircle, MessageCircle } from "lucide-react";
import EmailVerificationBox from "@/components/EmailVerificationBox";
import { Button } from "@/components/ui/button";
import { submitJoinRequestApi } from "@/lib/api";

const WHATSAPP_GROUP_URL = "https://chat.whatsapp.com/Hm4ZKUpvxsy9u2L7SqcfV3";

const initialFormData = {
  name: "",
  email: "",
  phone: "",
  occupation: "",
  companyName: "",
  linkedinProfile: "",
  website: "",
  city: "",
  whyJoin: "",
  referralSource: "",
};

const benefits = [
  {
    icon: Users,
    title: "Network with Top Founders",
    description: "Connect with India's most ambitious founders, investors, and builders. Build relationships that drive growth.",
  },
  {
    icon: Zap,
    title: "Access Exclusive Events",
    description: "Attend curated founder meetups, investor networking nights, and exclusive sessions tailored for growth.",
  },
  {
    icon: Target,
    title: "Find Opportunities",
    description: "Discover partnerships, fundraising connections, talent, and strategic growth opportunities.",
  },
  {
    icon: TrendingUp,
    title: "Accelerate Your Growth",
    description: "Learn from experienced founders, get mentorship, and accelerate your startup's journey to success.",
  },
];

const JoinUs = () => {
  const [formData, setFormData] = useState(initialFormData);
  const [submitting, setSubmitting] = useState(false);
  const [copyMessage, setCopyMessage] = useState("");
  const [emailVerificationToken, setEmailVerificationToken] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (e.target.name === "email") {
      setEmailVerificationToken("");
    }

    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleCopyLink = async () => {
    const shareUrl = `${window.location.origin}/join-us`;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopyMessage("Form link copied");
    } catch {
      setCopyMessage("Copy failed");
    }

    window.setTimeout(() => setCopyMessage(""), 2500);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!emailVerificationToken) {
      window.alert("Please verify your email before submitting.");
      return;
    }

    setSubmitting(true);

    try {
      const data = await submitJoinRequestApi({ ...formData, emailVerificationToken });

      if (data?.ok) {
        setFormData(initialFormData);
        setEmailVerificationToken("");
        setSubmitSuccess(true);
        window.alert("Join request submitted successfully.");
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to submit join request.";
      window.alert(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <section className="relative pt-24 pb-16">
        <div className="pointer-events-none absolute -left-20 top-12 h-64 w-64 rounded-full bg-blob" />
        <div className="pointer-events-none absolute right-0 top-32 h-80 w-80 rounded-full bg-blob" />

        <div className="container mx-auto px-4">
          <div className="mx-auto mb-12 max-w-4xl text-center">
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-primary">Join Our Community</p>
            <h1 className="font-heading text-4xl font-extrabold leading-tight md:text-6xl">Become Part of Founders Connect</h1>
            <p className="mt-5 text-lg text-muted-foreground">
              Join India's most vibrant founder community where entrepreneurs, builders, and innovators connect with purpose and drive meaningful impact.
            </p>
          </div>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <Button type="button" variant="outline" onClick={handleCopyLink} className="gap-2">
              <Copy size={16} />
              Copy Form Link
            </Button>
            <Button type="button" variant="outline" onClick={() => window.open(WHATSAPP_GROUP_URL, "_blank", "noopener,noreferrer")} className="gap-2">
              <LinkIcon size={16} />
              WhatsApp Group Link
            </Button>
          </div>

          {copyMessage && <p className="mt-3 text-center text-sm text-muted-foreground">{copyMessage}</p>}

          <div className="my-16 grid gap-6 md:grid-cols-2">
            {benefits.map(({ icon: Icon, title, description }) => (
              <Card key={title} className="card-gradient border-dashed border-border shadow-lg transition-shadow hover:shadow-xl">
                <CardHeader>
                  <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-primary text-primary-foreground">
                    <Icon size={20} />
                  </div>
                  <CardTitle className="text-lg">{title}</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">{description}</CardContent>
              </Card>
            ))}
          </div>

          <div className="mx-auto max-w-4xl">
            <Card className="border-2 border-dashed border-muted-foreground/30 bg-muted/5 shadow-xl">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl md:text-3xl">Detailed Join Form</CardTitle>
                <p className="mt-2 text-muted-foreground">All fields are required. Share this link with anyone who wants to join the community.</p>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-foreground">Full Name *</label>
                    <input required name="name" value={formData.name} onChange={handleChange} placeholder="Your full name" className="w-full rounded border border-border bg-background px-4 py-2 text-foreground placeholder:text-muted-foreground" />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-foreground">Email *</label>
                    <input required type="email" name="email" value={formData.email} onChange={handleChange} placeholder="your@email.com" className="w-full rounded border border-border bg-background px-4 py-2 text-foreground placeholder:text-muted-foreground" />
                    <div className="mt-2">
                      <EmailVerificationBox
                        email={formData.email}
                        purpose="join-us"
                        token={emailVerificationToken}
                        onVerified={setEmailVerificationToken}
                        onReset={() => setEmailVerificationToken("")}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-foreground">Phone Number *</label>
                    <input required type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="+91 XXXXX XXXXX" className="w-full rounded border border-border bg-background px-4 py-2 text-foreground placeholder:text-muted-foreground" />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-foreground">Occupation *</label>
                    <input required name="occupation" value={formData.occupation} onChange={handleChange} placeholder="Founder, Designer, Investor, etc." className="w-full rounded border border-border bg-background px-4 py-2 text-foreground placeholder:text-muted-foreground" />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-foreground">Company / Startup Name *</label>
                    <input required name="companyName" value={formData.companyName} onChange={handleChange} placeholder="Your company or startup name" className="w-full rounded border border-border bg-background px-4 py-2 text-foreground placeholder:text-muted-foreground" />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-foreground">City / Location *</label>
                    <input required name="city" value={formData.city} onChange={handleChange} placeholder="City, State" className="w-full rounded border border-border bg-background px-4 py-2 text-foreground placeholder:text-muted-foreground" />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-foreground">LinkedIn Profile *</label>
                    <input required type="url" name="linkedinProfile" value={formData.linkedinProfile} onChange={handleChange} placeholder="https://linkedin.com/in/yourprofile" className="w-full rounded border border-border bg-background px-4 py-2 text-foreground placeholder:text-muted-foreground" />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-foreground">Website / Portfolio *</label>
                    <input required type="url" name="website" value={formData.website} onChange={handleChange} placeholder="https://yourwebsite.com" className="w-full rounded border border-border bg-background px-4 py-2 text-foreground placeholder:text-muted-foreground" />
                  </div>

                  <div className="md:col-span-2">
                    <label className="mb-2 block text-sm font-semibold text-foreground">Why do you want to join? *</label>
                    <textarea required name="whyJoin" value={formData.whyJoin} onChange={handleChange} placeholder="Tell us what you hope to get from Founders Connect" rows={4} className="w-full rounded border border-border bg-background px-4 py-2 text-foreground placeholder:text-muted-foreground" />
                  </div>

                  <div className="md:col-span-2">
                    <label className="mb-2 block text-sm font-semibold text-foreground">How did you hear about us? *</label>
                    <input required name="referralSource" value={formData.referralSource} onChange={handleChange} placeholder="Instagram, friend, event, LinkedIn, etc." className="w-full rounded border border-border bg-background px-4 py-2 text-foreground placeholder:text-muted-foreground" />
                  </div>

                  <div className="md:col-span-2 mt-2 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <button type="submit" disabled={submitting} className="inline-flex items-center justify-center gap-2 rounded-md border border-border bg-primary px-5 py-3 text-sm font-semibold text-foreground transition-all hover:brightness-95 disabled:opacity-60">
                      {submitting ? "Submitting..." : "Submit Join Request"}
                    </button>
                    <p className="text-sm text-muted-foreground">Your form data is saved in our database and visible in admin panel.</p>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          {submitSuccess && (
            <div className="mx-auto mt-8 max-w-4xl">
              <Card className="border-2 border-green-500 bg-gradient-to-br from-green-50 to-blue-50 shadow-xl">
                <CardHeader className="text-center">
                  <div className="mb-4 flex justify-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                      <CheckCircle size={32} className="text-green-600" />
                    </div>
                  </div>
                  <CardTitle className="text-2xl text-green-700 md:text-3xl">Thank You! Welcome to Founders Connect</CardTitle>
                  <p className="mt-3 text-base text-muted-foreground">
                    Your join request has been submitted successfully. Join our WhatsApp community now.
                  </p>
                </CardHeader>
                <CardContent className="text-center">
                  <Button onClick={() => window.open(WHATSAPP_GROUP_URL, "_blank", "noopener,noreferrer")} className="gap-2 bg-green-600 px-6 py-3 text-base text-white hover:bg-green-700">
                    <MessageCircle size={20} />
                    Join WhatsApp Group
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}

          <div className="mt-16 text-center">
            <h2 className="mb-4 text-2xl font-bold text-foreground">Ready to Join?</h2>
            <p className="mx-auto mb-8 max-w-2xl text-muted-foreground">
              Fill out the detailed form above. Once submitted, your request is stored in database and reviewed by our team.
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default JoinUs;
