import { useRef, useState, type FormEvent } from "react";
import { Rocket, CheckCircle2, ArrowRight, ChevronLeft } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { registerApi } from "@/lib/api";
import { setSession } from "@/lib/session";
import { useToast } from "@/hooks/use-toast";
import EmailVerificationBox from "@/components/EmailVerificationBox";
import { countryCodes, getPhoneValidationError, isValidWebsite } from "@/lib/formValidation";

const RegisterFounder = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedStage, setSelectedStage] = useState<string>("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [emailForVerification, setEmailForVerification] = useState("");
  const [emailVerificationToken, setEmailVerificationToken] = useState("");
  const [currentStep, setCurrentStep] = useState(1);
  const formRef = useRef<HTMLFormElement | null>(null);

  const benefits = [
    "Premium founder profile with QR business card",
    "Weekly closed-door founder sessions",
    "10 investor introductions per month",
    "Expert pitch feedback and guidance",
    "Startup playbooks and resources",
    "Co-founder matching service",
    "Monthly 1-on-1 mentor calls",
    "Private founder community access",
  ];

  const validateCurrentStep = (step: number) => {
    if (!formRef.current) return false;
    const formData = new FormData(formRef.current);

    const fullName = String(formData.get("fullName") || "").trim();
    const email = String(formData.get("email") || "").trim();
    const phoneCountryCode = String(formData.get("phoneCountryCode") || "").trim();
    const phoneNumber = String(formData.get("phoneNumber") || "").trim();
    const city = String(formData.get("city") || "").trim();
    const startupName = String(formData.get("startupName") || "").trim();
    const teamSize = Number(formData.get("teamSize"));
    const startupWebsite = String(formData.get("startupWebsite") || "").trim();

    if (step === 1) {
      if (!fullName || !email || !city || getPhoneValidationError(phoneCountryCode, phoneNumber)) {
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
      if (!startupName || !selectedStage || !startupWebsite) {
        toast({
          title: "Incomplete Startup Details",
          description: "Please fill startup name, stage, and website.",
          variant: "destructive",
        });
        return false;
      }
      if (!isValidWebsite(startupWebsite)) {
        toast({
          title: "Invalid Website",
          description: "Please enter a valid startup website URL.",
          variant: "destructive",
        });
        return false;
      }
      if (!Number.isFinite(teamSize) || teamSize < 1) {
        toast({
          title: "Invalid Team Size",
          description: "Please enter a valid team size (minimum 1).",
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
    const phoneCountryCode = String(formData.get("phoneCountryCode") || "").trim();
    const phoneNumber = String(formData.get("phoneNumber") || "").trim();
    const city = String(formData.get("city") || "").trim();
    const startupName = String(formData.get("startupName") || "").trim();
    const startupStage = selectedStage;
    const teamSize = Number(formData.get("teamSize"));
    const startupWebsite = String(formData.get("startupWebsite") || "").trim();

    const phoneError = getPhoneValidationError(phoneCountryCode, phoneNumber);

    if (!fullName || !email || !password || !city || phoneError) {
      toast({
        title: "Missing Required Fields",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    if (!startupName) {
      toast({
        title: "Missing Startup Name",
        description: "Please enter your startup name.",
        variant: "destructive",
      });
      return;
    }

    if (!startupStage) {
      toast({
        title: "Missing Startup Stage",
        description: "Please specify your startup stage.",
        variant: "destructive",
      });
      return;
    }

    if (!Number.isFinite(teamSize) || teamSize < 1) {
      toast({
        title: "Invalid Team Size",
        description: "Please enter a valid team size (minimum 1).",
        variant: "destructive",
      });
      return;
    }

    if (!startupWebsite) {
      toast({
        title: "Missing Website",
        description: "Please provide your startup website.",
        variant: "destructive",
      });
      return;
    }

    if (!isValidWebsite(startupWebsite)) {
      toast({
        title: "Invalid Website",
        description: "Please enter a valid startup website URL.",
        variant: "destructive",
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: "Weak Password",
        description: "Password must be at least 6 characters long.",
        variant: "destructive",
      });
      return;
    }

    if (password !== confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "Passwords do not match. Please try again.",
        variant: "destructive",
      });
      return;
    }

    if (!agreedToTerms) {
      toast({
        title: "Terms Required",
        description: "Please agree to the Founder Terms of Service before registering.",
        variant: "destructive",
      });
      return;
    }

    if (!emailVerificationToken) {
      toast({
        title: "Email Verification Required",
        description: "Please verify your email address before registering.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    registerApi({
      fullName,
      email,
      password,
      phone: `${phoneCountryCode} ${phoneNumber}`,
      city,
      role: "founder",
      roleDetails: {
        startupName,
        startupStage: startupStage.toLowerCase().replace(/\s+/g, "-"),
        teamSize,
        startupWebsite,
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
    <main className="min-h-screen bg-gradient-to-b from-purple-50 via-white to-gray-50">
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-12 lg:grid-cols-2 items-center max-w-6xl mx-auto">
          <section className="space-y-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-purple-200 bg-purple-50 px-4 py-2">
              <Rocket size={18} className="text-purple-600" />
              <span className="text-sm font-semibold text-purple-700">Join as a Founder</span>
            </div>

            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight mb-4">
                Accelerate your startup with <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-purple-800">investor access and mentorship</span>
              </h1>
              <p className="text-lg text-gray-600">
                Get funding introductions, expert guidance, and connect with co-founders in a supportive ecosystem.
              </p>
            </div>

            <div className="space-y-4">
              <p className="text-sm font-semibold text-gray-900 uppercase tracking-widest">As a founder you'll get:</p>
              {benefits.map((benefit, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <CheckCircle2 size={20} className="text-purple-600 flex-shrink-0 mt-1" />
                  <span className="text-gray-700">{benefit}</span>
                </div>
              ))}
            </div>

            <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
              <CardContent className="pt-6">
                <p className="text-sm text-gray-700">
                  <span className="font-semibold">Already registered?</span>{" "}
                  <Link to="/login" className="text-purple-600 font-semibold hover:underline">Login to your account</Link>
                </p>
              </CardContent>
            </Card>
          </section>

          <section className="rounded-2xl border border-gray-200 bg-white p-8 shadow-lg">
            <div className="mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Founder Registration</h2>
              <p className="text-gray-600">Join our community of innovative founders</p>
            </div>

            <form ref={formRef} className="space-y-6" onSubmit={handleRegister}>
              <div className="relative">
                <div className="absolute left-[12%] right-[12%] top-5 h-1 rounded-full bg-purple-100" />
                <div
                  className="absolute left-[12%] top-5 h-1 rounded-full bg-gradient-to-r from-purple-600 to-fuchsia-500 transition-all duration-500"
                  style={{ width: `${((currentStep - 1) / 2) * 76}%` }}
                />
                <div className="relative grid grid-cols-3 gap-2">
                  {[{ id: 1, label: "Basic" }, { id: 2, label: "Startup" }, { id: 3, label: "Security" }].map((step) => (
                    <button key={step.id} type="button" onClick={() => setCurrentStep(step.id)} className="flex flex-col items-center">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-full border text-sm font-bold transition-all ${currentStep >= step.id ? "border-purple-600 bg-purple-600 text-white" : "border-gray-300 bg-white text-gray-500"}`}>
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
                  <Input id="fullName" name="fullName" placeholder="John Smith" className="h-12 border-gray-300 focus:ring-purple-500" required />
                </div>

                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-semibold text-gray-700">Email Address <span className="text-red-500">*</span></label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="founder@startup.com"
                    className="h-12 border-gray-300 focus:ring-purple-500"
                    onChange={(event) => {
                      setEmailForVerification(event.target.value);
                      setEmailVerificationToken("");
                    }}
                    required
                  />
                  <EmailVerificationBox
                    email={emailForVerification}
                    purpose="register:founder"
                    token={emailVerificationToken}
                    onVerified={setEmailVerificationToken}
                    onReset={() => setEmailVerificationToken("")}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="phoneNumber" className="text-sm font-semibold text-gray-700">Phone Number <span className="text-red-500">*</span></label>
                    <div className="flex gap-2">
                      <select id="phoneCountryCode" name="phoneCountryCode" defaultValue="+91" className="h-12 w-32 rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-700 focus:ring-purple-500">
                        {countryCodes.map((country) => (
                          <option key={country.code} value={country.code}>{country.code}</option>
                        ))}
                      </select>
                      <Input id="phoneNumber" name="phoneNumber" type="tel" placeholder="9876543210" className="h-12 border-gray-300 focus:ring-purple-500" required />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="city" className="text-sm font-semibold text-gray-700">City <span className="text-red-500">*</span></label>
                    <Input id="city" name="city" placeholder="Mumbai" className="h-12 border-gray-300 focus:ring-purple-500" required />
                  </div>
                </div>
              </div>

              <div className={currentStep === 2 ? "space-y-6" : "hidden"}>
                <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                  <p className="text-sm font-semibold text-gray-900 mb-4">About Your Startup</p>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label htmlFor="startupName" className="text-sm font-medium text-gray-700">Startup Name <span className="text-red-500">*</span></label>
                      <Input id="startupName" name="startupName" placeholder="Your startup" className="h-12 border-gray-300 focus:ring-purple-500" required />
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="startupStage" className="text-sm font-medium text-gray-700">Current Stage <span className="text-red-500">*</span></label>
                      <Select value={selectedStage} onValueChange={setSelectedStage}>
                        <SelectTrigger className="h-12 border-gray-300 focus:ring-purple-500">
                          <SelectValue placeholder="Select startup stage" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="idea">Idea</SelectItem>
                          <SelectItem value="mvp">MVP</SelectItem>
                          <SelectItem value="early-revenue">Early Revenue</SelectItem>
                          <SelectItem value="seed">Seed Stage</SelectItem>
                          <SelectItem value="series-a">Series A</SelectItem>
                          <SelectItem value="series-b">Series B</SelectItem>
                          <SelectItem value="series-c">Series C</SelectItem>
                          <SelectItem value="growth">Growth</SelectItem>
                          <SelectItem value="scale">Scale</SelectItem>
                          <SelectItem value="exit">Exit</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label htmlFor="teamSize" className="text-sm font-medium text-gray-700">Team Size <span className="text-red-500">*</span></label>
                        <Input id="teamSize" name="teamSize" type="number" placeholder="e.g. 5" className="h-12 border-gray-300 focus:ring-purple-500" required />
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="startupWebsite" className="text-sm font-medium text-gray-700">Website <span className="text-red-500">*</span></label>
                        <Input id="startupWebsite" name="startupWebsite" type="url" placeholder="https://yourstartup.com" className="h-12 border-gray-300 focus:ring-purple-500" required />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="bio" className="text-sm font-semibold text-gray-700">Pitch Your Startup (Optional)</label>
                      <Textarea id="bio" name="bio" placeholder="Tell us about your startup idea and mission..." className="min-h-24 border-gray-300 focus:ring-purple-500" />
                    </div>
                  </div>
                </div>
              </div>

              <div className={currentStep === 3 ? "space-y-6" : "hidden"}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="password" className="text-sm font-semibold text-gray-700">Password <span className="text-red-500">*</span></label>
                    <Input id="password" name="password" type="password" placeholder="Create a strong password" className="h-12 border-gray-300 focus:ring-purple-500" required />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="confirmPassword" className="text-sm font-semibold text-gray-700">Confirm Password <span className="text-red-500">*</span></label>
                    <Input id="confirmPassword" name="confirmPassword" type="password" placeholder="Confirm your password" className="h-12 border-gray-300 focus:ring-purple-500" required />
                  </div>
                </div>

                <label className="flex items-start gap-3 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
                  <Checkbox checked={agreedToTerms} onCheckedChange={(checked) => setAgreedToTerms(checked === true)} className="mt-0.5" />
                  <span>
                    I agree to the <Link to="/terms" className="font-semibold text-purple-600 hover:underline">Founder Terms of Service</Link>{" "}
                    covering startup participation, community conduct, and founder resources.
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
                  <Button type="button" onClick={handleNextStep} className="gap-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white hover:from-purple-700 hover:to-purple-800">
                    Next Step
                    <ArrowRight size={18} />
                  </Button>
                ) : (
                  <Button type="submit" disabled={isLoading} size="lg" className="h-12 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-semibold text-base gap-2">
                    {isLoading ? "Creating Account..." : "Create Founder Account"}
                    <ArrowRight size={18} />
                  </Button>
                )}
              </div>
            </form>

            <div className="mt-8 pt-6 border-t border-gray-200">
              <p className="text-center text-sm text-gray-600">
                Want to register as a different role? <Link to="/membership" className="text-purple-600 font-semibold hover:underline">View all options</Link>
              </p>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
};

export default RegisterFounder;
