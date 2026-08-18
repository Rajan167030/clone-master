import { useEffect, useState } from "react";
import { Loader2, ShieldAlert, TrendingUp } from "lucide-react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import BackButton from "@/components/BackButton";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { submitInvestorLeadApi, validateInvestorInviteApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import InvestorDetailsFormCard, { type InvestorFormValues } from "@/components/InvestorDetailsForm";

const RegisterInvestor = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const inviteToken = (searchParams.get("token") || "").trim();
  const [inviteStatus, setInviteStatus] = useState<"checking" | "valid" | "invalid">("checking");
  const [inviteError, setInviteError] = useState("");
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 3000);
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

  const handleInvestorSubmit = async (values: InvestorFormValues) => {
    if (inviteStatus !== "valid" || !inviteToken) {
      toast({ title: "Invite Required", description: "A valid invite link is required to submit this form.", variant: "destructive" });
      throw new Error("Invite required");
    }

    try {
      await submitInvestorLeadApi({
        fullName: values.fullName,
        email: values.email,
        phone: values.phone,
        vcName: values.vcName,
        investmentInterest: values.investmentInterest,
        inviteToken,
      });
      toast({
        title: "Details Received",
        description: "Your investor application has been successfully submitted.",
      });
    } catch (error) {
      toast({
        title: "Submission Failed",
        description: error instanceof Error ? error.message : "Something went wrong. Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  };

  if (showSplash) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#FBFAF5]">
        <img
          src="/founders_connect_global_logo.jpg"
          alt="Founders Connect"
          className="h-24 w-24 animate-pulse rounded-2xl object-cover shadow-xl border-2 border-[#0B0B09]"
        />
        <p className="font-mono text-sm font-bold tracking-[0.2em] text-[#4C1D95] uppercase">Founders Connect</p>
        <Loader2 className="h-6 w-6 animate-spin text-[#4C1D95]" />
      </div>
    );
  }

  if (inviteStatus === "checking") {
    return (
      <div className="min-h-screen bg-[#FBFAF5]">
        <Navbar />
        <main className="flex min-h-[70vh] flex-col items-center justify-center gap-3 px-4 text-center">
          <Loader2 className="h-8 w-8 animate-spin text-[#4C1D95]" />
          <p className="font-mono text-sm text-[#6B6558]">Checking your invite link...</p>
        </main>
        <Footer />
      </div>
    );
  }

  if (inviteStatus === "invalid") {
    return (
      <div className="min-h-screen bg-[#FBFAF5]">
        <Navbar />
        <main className="flex min-h-[70vh] flex-col items-center justify-center gap-4 px-4 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-none bg-purple-50 border-2 border-[#0B0B09] text-[#4C1D95] shadow-[3px_3px_0px_#0B0B09]">
            <ShieldAlert className="h-8 w-8" />
          </div>
          <h1 className="font-heading text-2xl font-bold uppercase tracking-tight text-[#0B0B09] sm:text-3xl">
            Investor registration is invite-only
          </h1>
          <p className="max-w-md text-sm text-[#6B6558] font-sans">
            {inviteError || "This registration link is invalid or has expired."} Please contact the Founders Connect team to request an invite link, or reach out via the Join Us form.
          </p>
          <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
            <Button asChild variant="outline" className="border-2 border-[#0B0B09] rounded-none font-mono text-xs uppercase tracking-wider">
              <Link to="/join-us">Go to Join Us</Link>
            </Button>
            <Button asChild className="border-2 border-[#0B0B09] rounded-none bg-[#0B0B09] text-white font-mono text-xs uppercase tracking-wider">
              <Link to="/">Back to Home</Link>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FBFAF5] flex flex-col justify-between font-sans">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-12">
        <BackButton className="mb-6 px-0 max-w-xl animate-reveal-left" />
        <div className="mx-auto max-w-xl flex flex-col items-center">
          <div className="mb-6 inline-flex items-center gap-2 border-2 border-[#0B0B09] bg-white px-4 py-2 shadow-[3px_3px_0px_#0B0B09] rounded-none">
            <TrendingUp size={18} className="text-[#4C1D95]" />
            <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#0B0B09]">
              Investor Registration
            </span>
          </div>

          <InvestorDetailsFormCard
            onSubmit={handleInvestorSubmit}
            onOpenOnDevice={() => navigate("/dashboard")}
            formNumber="FC/INV-2026"
          />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default RegisterInvestor;

