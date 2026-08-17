import { useEffect, useState, type FormEvent } from "react";
import { CheckCircle2, Loader2, ShieldAlert, TrendingUp } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import BackButton from "@/components/BackButton";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { submitInvestorLeadApi, validateInvestorInviteApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

const RegisterInvestor = () => {
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const inviteToken = (searchParams.get("token") || "").trim();
  const [inviteStatus, setInviteStatus] = useState<"checking" | "valid" | "invalid">("checking");
  const [inviteError, setInviteError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!inviteToken) {
      setInviteStatus("invalid");
      setInviteError("This registration link is missing an invite code.");
      return;
    }

    let mounted = true;
    validateInvestorInviteApi(inviteToken)
      .then((response) => {
        if (!mounted) return;
        if (response.valid) {
          setInviteStatus("valid");
        } else {
          setInviteStatus("invalid");
          setInviteError(response.message || "This invite link is invalid or has expired.");
        }
      })
      .catch((error) => {
        if (!mounted) return;
        setInviteStatus("invalid");
        setInviteError(error instanceof Error ? error.message : "This invite link is invalid or has expired.");
      });

    return () => {
      mounted = false;
    };
  }, [inviteToken]);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (inviteStatus !== "valid" || !inviteToken) {
      toast({ title: "Invite Required", description: "A valid invite link is required to submit this form.", variant: "destructive" });
      return;
    }

    const formData = new FormData(e.currentTarget);
    const fullName = String(formData.get("fullName") || "").trim();
    const email = String(formData.get("email") || "").trim().toLowerCase();
    const phone = String(formData.get("phone") || "").trim();
    const vcName = String(formData.get("vcName") || "").trim();
    const investmentInterest = String(formData.get("investmentInterest") || "").trim();

    if (!fullName || !email || !vcName || !investmentInterest) {
      toast({ title: "Missing Required Fields", description: "Please fill in name, email, VC/firm name, and investment interest.", variant: "destructive" });
      return;
    }

    setIsLoading(true);

    submitInvestorLeadApi({ fullName, email, phone, vcName, investmentInterest, inviteToken })
      .then(() => {
        setSubmitted(true);
      })
      .catch((error) => {
        toast({
          title: "Submission Failed",
          description: error instanceof Error ? error.message : "Something went wrong. Please try again.",
          variant: "destructive",
        });
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  if (showSplash) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-gradient-to-b from-green-50 via-white to-gray-50">
        <img
          src="/founders_connect_global_logo.jpg"
          alt="Founders Connect"
          className="h-24 w-24 animate-pulse rounded-2xl object-cover shadow-xl"
        />
        <p className="text-sm font-semibold tracking-[0.2em] text-green-700 uppercase">Founders Connect</p>
        <Loader2 className="h-6 w-6 animate-spin text-green-600" />
      </div>
    );
  }

  if (inviteStatus === "checking") {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="flex min-h-[70vh] flex-col items-center justify-center gap-3 px-4 text-center">
          <Loader2 className="h-8 w-8 animate-spin text-green-600" />
          <p className="text-sm text-muted-foreground">Checking your invite link...</p>
        </main>
        <Footer />
      </div>
    );
  }

  if (inviteStatus === "invalid") {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="flex min-h-[70vh] flex-col items-center justify-center gap-4 px-4 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 border border-red-100 text-red-600">
            <ShieldAlert className="h-8 w-8" />
          </div>
          <h1 className="font-heading text-2xl font-bold text-foreground sm:text-3xl">
            Investor registration is invite-only
          </h1>
          <p className="max-w-md text-sm text-muted-foreground">
            {inviteError || "This registration link is invalid or has expired."} Please contact the Founders Connect team to request an invite link, or reach out via the Join Us form.
          </p>
          <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
            <Button asChild variant="outline">
              <Link to="/join-us">Go to Join Us</Link>
            </Button>
            <Button asChild>
              <Link to="/">Back to Home</Link>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-green-50 via-white to-gray-50">
      <BackButton className="mb-6 px-0 max-w-xl animate-reveal-left" />
      <div className="container mx-auto px-4 py-12">
        <div className="mx-auto max-w-xl">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-green-200 bg-green-50 px-4 py-2">
            <TrendingUp size={18} className="text-green-600" />
            <span className="text-sm font-semibold text-green-700">Investor Registration</span>
          </div>

          <section className="rounded-2xl border border-gray-200 bg-white p-8 shadow-lg">
            {submitted ? (
              <div className="flex flex-col items-center gap-3 py-8 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-green-50 border border-green-100 text-green-600">
                  <CheckCircle2 className="h-7 w-7" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Thank you!</h2>
                <p className="max-w-sm text-gray-600">
                  Your details have been submitted. Our team will get in touch with you shortly.
                </p>
                <Button asChild className="mt-4 bg-green-600 hover:bg-green-700 text-white">
                  <Link to="/">Back to Home</Link>
                </Button>
              </div>
            ) : (
              <>
                <div className="mb-8">
                  <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Investor Details</h2>
                  <p className="text-gray-600">Share a few details and our team will reach out to you.</p>
                </div>

                <form className="space-y-5" onSubmit={handleSubmit}>
                  <div className="space-y-2">
                    <label htmlFor="fullName" className="text-sm font-semibold text-gray-700">Name <span className="text-red-500">*</span></label>
                    <Input id="fullName" name="fullName" placeholder="Jane Investor" className="h-12 border-gray-300 focus:ring-green-500" required />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-semibold text-gray-700">Email <span className="text-red-500">*</span></label>
                    <Input id="email" name="email" type="email" placeholder="investor@example.com" className="h-12 border-gray-300 focus:ring-green-500" required />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="phone" className="text-sm font-semibold text-gray-700">Phone Number <span className="text-gray-400 font-normal">(optional)</span></label>
                    <Input id="phone" name="phone" type="tel" placeholder="9876543210" className="h-12 border-gray-300 focus:ring-green-500" />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="vcName" className="text-sm font-semibold text-gray-700">VC / Firm Name <span className="text-red-500">*</span></label>
                    <Input id="vcName" name="vcName" placeholder="e.g., Sequoia Capital" className="h-12 border-gray-300 focus:ring-green-500" required />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="investmentInterest" className="text-sm font-semibold text-gray-700">
                      What type of startups do you want to invest in? <span className="text-red-500">*</span>
                    </label>
                    <Input
                      id="investmentInterest"
                      name="investmentInterest"
                      placeholder="e.g., Fintech, HealthTech, SaaS, D2C"
                      className="h-12 border-gray-300 focus:ring-green-500"
                      required
                    />
                  </div>

                  <Button type="submit" disabled={isLoading} size="lg" className="h-12 w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold text-base">
                    {isLoading ? "Submitting..." : "Submit"}
                  </Button>
                </form>
              </>
            )}
          </section>
        </div>
      </div>
    </main>
  );
};

export default RegisterInvestor;
