import { useRef, useState, type FormEvent } from "react";
import { TrendingUp, CheckCircle2, ArrowRight, ChevronLeft } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { registerApi } from "@/lib/api";
import { setSession } from "@/lib/session";
import { useToast } from "@/hooks/use-toast";
import EmailVerificationBox from "@/components/EmailVerificationBox";

const RegisterInvestor = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [emailForVerification, setEmailForVerification] = useState("");
  const [emailVerificationToken, setEmailVerificationToken] = useState("");
  const [currentStep, setCurrentStep] = useState(1);
  const formRef = useRef<HTMLFormElement | null>(null);

  const benefits = [
    "Curated founders directory with detailed profiles",
    "Advanced filtering by sector and stage",
    "Priority access to pitch events",
    "Deal flow alerts and market intelligence",
    "Direct founder connections (20 intros/month)",
    "Investment portfolio tracking tools",
  ];

  const validateCurrentStep = (step: number) => {
    if (!formRef.current) return false;
    const formData = new FormData(formRef.current);

    const fullName = String(formData.get("fullName") || "").trim();
    const email = String(formData.get("email") || "").trim();
    const phone = String(formData.get("phone") || "").trim();
    const city = String(formData.get("city") || "").trim();
    const investmentMin = Number(formData.get("investmentMin"));
    const investmentMax = Number(formData.get("investmentMax"));
    const focusSector = String(formData.get("focusSector") || "").trim();
    const portfolioSize = Number(formData.get("portfolioSize"));
    const investorId = String(formData.get("investorId") || "").trim();

    if (step === 1) {
      if (!fullName || !email || !phone || !city) {
        toast({
          title: "Missing Required Fields",
          description: "Please fill full name, email, phone, and city.",
          variant: "destructive",
        });
        return false;
      }
      if (!emailVerificationToken) {
        toast({
          title: "Email Verification Required",
          description: "Please verify your email before moving to next step.",
          variant: "destructive",
        });
        return false;
      }
    }

    if (step === 2) {
      if (!Number.isFinite(investmentMin) || investmentMin < 0) {
        toast({
          title: "Invalid Minimum Investment",
          description: "Please enter a valid minimum investment amount.",
          variant: "destructive",
        });
        return false;
      }
      if (!Number.isFinite(investmentMax) || investmentMax < investmentMin) {
        toast({
          title: "Invalid Maximum Investment",
          description: "Maximum investment must be greater than minimum investment.",
          variant: "destructive",
        });
        return false;
      }
      if (!focusSector || !Number.isFinite(portfolioSize) || portfolioSize < 0 || !investorId) {
        toast({
          title: "Incomplete Investment Profile",
          description: "Please fill focus sectors, portfolio size, and investor ID.",
          variant: "destructive",
        });
        return false;
      }
    }

    return true;
  };

  const handleNextStep = () => {
    if (!validateCurrentStep(currentStep)) return;
    setCurrentStep((prev) => Math.min(prev + 1, 3));
  };

  const handleRegister = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const fullName = String(formData.get("fullName") || "").trim();
    const email = String(formData.get("email") || "").trim().toLowerCase();
    const password = String(formData.get("password") || "").trim();
    const confirmPassword = String(formData.get("confirmPassword") || "").trim();
    const phone = String(formData.get("phone") || "").trim();
    const city = String(formData.get("city") || "").trim();
    const investmentMin = Number(formData.get("investmentMin"));
    const investmentMax = Number(formData.get("investmentMax"));
    const investmentCurrency = String(formData.get("investmentCurrency") || "INR").trim().toUpperCase();
    const focusSector = String(formData.get("focusSector") || "").trim();
    const portfolioSize = Number(formData.get("portfolioSize"));
    const investorId = String(formData.get("investorId") || "").trim();

    if (!fullName || !email || !password || !phone || !city) {
      toast({ title: "Missing Required Fields", description: "Please fill in all required fields.", variant: "destructive" });
      return;
    }

    if (!Number.isFinite(investmentMin) || investmentMin < 0) {
      toast({ title: "Invalid Minimum Investment", description: "Please enter a valid minimum investment amount.", variant: "destructive" });
      return;
    }

    if (!Number.isFinite(investmentMax) || investmentMax < investmentMin) {
      toast({ title: "Invalid Maximum Investment", description: "Maximum investment must be greater than minimum investment.", variant: "destructive" });
      return;
    }

    if (!focusSector) {
      toast({ title: "Missing Focus Sectors", description: "Please specify your investment focus sectors.", variant: "destructive" });
      return;
    }

    if (!Number.isFinite(portfolioSize) || portfolioSize < 0) {
      toast({ title: "Invalid Portfolio Size", description: "Please enter a valid portfolio size.", variant: "destructive" });
      return;
    }

    if (!investorId) {
      toast({ title: "Missing Investor ID", description: "Please provide your investor/profile ID.", variant: "destructive" });
      return;
    }

    if (password.length < 6) {
      toast({ title: "Weak Password", description: "Password must be at least 6 characters long.", variant: "destructive" });
      return;
    }

    if (password !== confirmPassword) {
      toast({ title: "Password Mismatch", description: "Passwords do not match. Please try again.", variant: "destructive" });
      return;
    }

    if (!agreedToTerms) {
      toast({ title: "Terms Required", description: "Please agree to the Investor Terms of Service before registering.", variant: "destructive" });
      return;
    }

    if (!emailVerificationToken) {
      toast({ title: "Email Verification Required", description: "Please verify your email address before registering.", variant: "destructive" });
      return;
    }

    setIsLoading(true);

    registerApi({
      fullName,
      email,
      password,
      phone,
      city,
      role: "investor",
      roleDetails: {
        investmentRange: {
          min: investmentMin,
          max: investmentMax,
          currency: investmentCurrency,
        },
        focusSector: focusSector
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        portfolioSize,
        investorId,
      },
      emailVerificationToken,
    })
      .then((response) => {
        toast({
          title: "Welcome!",
          description: "Account created successfully. Redirecting to your dashboard...",
        });
        setSession(response.token, response.account);
        setTimeout(() => navigate("/dashboard"), 1500);
      })
      .catch((error) => {
        toast({
          title: "Registration Failed",
          description: error instanceof Error ? error.message : "Something went wrong. Please try again.",
          variant: "destructive",
        });
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-green-50 via-white to-gray-50">
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-12 lg:grid-cols-2 items-center max-w-6xl mx-auto">
          <section className="space-y-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-green-200 bg-green-50 px-4 py-2">
              <TrendingUp size={18} className="text-green-600" />
              <span className="text-sm font-semibold text-green-700">Join as an Investor</span>
            </div>

            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight mb-4">
                Discover promising <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-green-800">founders building the future</span>
              </h1>
              <p className="text-lg text-gray-600">
                Get access to curated startups, expert founders, and investment opportunities in one platform.
              </p>
            </div>

            <div className="space-y-4">
              <p className="text-sm font-semibold text-gray-900 uppercase tracking-widest">As an investor you'll get:</p>
              {benefits.map((benefit, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <CheckCircle2 size={20} className="text-green-600 flex-shrink-0 mt-1" />
                  <span className="text-gray-700">{benefit}</span>
                </div>
              ))}
            </div>

            <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
              <CardContent className="pt-6">
                <p className="text-sm text-gray-700">
                  <span className="font-semibold">Already registered?</span>{" "}
                  <Link to="/login" className="text-green-600 font-semibold hover:underline">Login to your account</Link>
                </p>
              </CardContent>
            </Card>
          </section>

          <section className="rounded-2xl border border-gray-200 bg-white p-8 shadow-lg">
            <div className="mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Investor Registration</h2>
              <p className="text-gray-600">Start discovering and investing in promising startups</p>
            </div>

            <form ref={formRef} className="space-y-6" onSubmit={handleRegister}>
              <div className="relative">
                <div className="absolute left-[12%] right-[12%] top-5 h-1 rounded-full bg-green-100" />
                <div
                  className="absolute left-[12%] top-5 h-1 rounded-full bg-gradient-to-r from-green-600 to-emerald-500 transition-all duration-500"
                  style={{ width: `${((currentStep - 1) / 2) * 76}%` }}
                />
                <div className="relative grid grid-cols-3 gap-2">
                  {[{ id: 1, label: "Basic" }, { id: 2, label: "Investment" }, { id: 3, label: "Security" }].map((step) => (
                    <button key={step.id} type="button" onClick={() => setCurrentStep(step.id)} className="flex flex-col items-center">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-full border text-sm font-bold transition-all ${currentStep >= step.id ? "border-green-600 bg-green-600 text-white" : "border-gray-300 bg-white text-gray-500"}`}>
                        {currentStep > step.id ? <CheckCircle2 size={16} /> : step.id}
                      </div>
                      <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-gray-600">{step.label}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div className={currentStep === 1 ? "space-y-6" : "hidden"}>
                <div className="space-y-2">
                  <label htmlFor="fullName" className="text-sm font-semibold text-gray-700">Full Name <span className="text-red-500">*</span></label>
                  <Input id="fullName" name="fullName" placeholder="Jane Investor" className="h-12 border-gray-300 focus:ring-green-500" required />
                </div>

                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-semibold text-gray-700">Email Address <span className="text-red-500">*</span></label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="investor@example.com"
                    className="h-12 border-gray-300 focus:ring-green-500"
                    onChange={(event) => {
                      setEmailForVerification(event.target.value);
                      setEmailVerificationToken("");
                    }}
                    required
                  />
                  <EmailVerificationBox
                    email={emailForVerification}
                    purpose="register:investor"
                    token={emailVerificationToken}
                    onVerified={setEmailVerificationToken}
                    onReset={() => setEmailVerificationToken("")}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="phone" className="text-sm font-semibold text-gray-700">Phone Number <span className="text-red-500">*</span></label>
                    <Input id="phone" name="phone" type="tel" placeholder="+91 9876543210" className="h-12 border-gray-300 focus:ring-green-500" required />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="city" className="text-sm font-semibold text-gray-700">City <span className="text-red-500">*</span></label>
                    <Input id="city" name="city" placeholder="Mumbai" className="h-12 border-gray-300 focus:ring-green-500" required />
                  </div>
                </div>
              </div>

              <div className={currentStep === 2 ? "space-y-6" : "hidden"}>
                <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                  <p className="text-sm font-semibold text-gray-900 mb-4">Investment Range (in INR)</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label htmlFor="investmentMin" className="text-sm font-medium text-gray-700">Minimum <span className="text-red-500">*</span></label>
                      <Input id="investmentMin" name="investmentMin" type="number" placeholder="500000" className="h-12 border-gray-300 focus:ring-green-500" required />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="investmentMax" className="text-sm font-medium text-gray-700">Maximum <span className="text-red-500">*</span></label>
                      <Input id="investmentMax" name="investmentMax" type="number" placeholder="5000000" className="h-12 border-gray-300 focus:ring-green-500" required />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="focusSector" className="text-sm font-semibold text-gray-700">Investment Focus Sectors <span className="text-red-500">*</span></label>
                  <Input id="focusSector" name="focusSector" placeholder="e.g., Fintech, Healthtech, AI, SaaS (comma separated)" className="h-12 border-gray-300 focus:ring-green-500" required />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="portfolioSize" className="text-sm font-semibold text-gray-700">Portfolio Size (INR) <span className="text-red-500">*</span></label>
                    <Input id="portfolioSize" name="portfolioSize" type="number" placeholder="50000000" className="h-12 border-gray-300 focus:ring-green-500" required />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="investorId" className="text-sm font-semibold text-gray-700">Investor ID <span className="text-red-500">*</span></label>
                    <Input id="investorId" name="investorId" placeholder="AngelList ID / Profile" className="h-12 border-gray-300 focus:ring-green-500" required />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="bio" className="text-sm font-semibold text-gray-700">About Your Investment Journey (Optional)</label>
                  <Textarea id="bio" name="bio" placeholder="Tell us about your investment experience and what you're looking for..." className="min-h-24 border-gray-300 focus:ring-green-500" />
                </div>
              </div>

              <div className={currentStep === 3 ? "space-y-6" : "hidden"}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="password" className="text-sm font-semibold text-gray-700">Password <span className="text-red-500">*</span></label>
                    <Input id="password" name="password" type="password" placeholder="Create a strong password" className="h-12 border-gray-300 focus:ring-green-500" required />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="confirmPassword" className="text-sm font-semibold text-gray-700">Confirm Password <span className="text-red-500">*</span></label>
                    <Input id="confirmPassword" name="confirmPassword" type="password" placeholder="Confirm your password" className="h-12 border-gray-300 focus:ring-green-500" required />
                  </div>
                </div>

                <label className="flex items-start gap-3 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
                  <Checkbox checked={agreedToTerms} onCheckedChange={(checked) => setAgreedToTerms(checked === true)} className="mt-0.5" />
                  <span>
                    I agree to the <Link to="/terms" className="font-semibold text-green-600 hover:underline">Investor Terms of Service</Link>{" "}
                    including investment-related compliance and platform rules.
                  </span>
                </label>
              </div>

              <div className="flex items-center justify-between gap-3 pt-2">
                {currentStep > 1 ? (
                  <Button type="button" variant="outline" onClick={() => setCurrentStep((prev) => Math.max(prev - 1, 1))} className="gap-2">
                    <ChevronLeft size={16} />
                    Back
                  </Button>
                ) : (
                  <div />
                )}

                {currentStep < 3 ? (
                  <Button type="button" onClick={handleNextStep} className="gap-2 bg-gradient-to-r from-green-600 to-green-700 text-white hover:from-green-700 hover:to-green-800">
                    Next Step
                    <ArrowRight size={18} />
                  </Button>
                ) : (
                  <Button type="submit" disabled={isLoading} size="lg" className="h-12 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold text-base gap-2">
                    {isLoading ? "Creating Account..." : "Create Investor Account"}
                    <ArrowRight size={18} />
                  </Button>
                )}
              </div>
            </form>

            <div className="mt-8 pt-6 border-t border-gray-200">
              <p className="text-center text-sm text-gray-600">
                Want to register as a different role? <Link to="/membership" className="text-green-600 font-semibold hover:underline">View all options</Link>
              </p>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
};

export default RegisterInvestor;
