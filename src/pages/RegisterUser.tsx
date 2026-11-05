import { useRef, useState, type FormEvent } from "react";
import {
  User,
  CheckCircle2,
  ArrowRight,
  ChevronLeft,
  Mail,
  Phone,
  MapPin,
  Sparkles,
  Briefcase,
  Lock,
  Eye,
  EyeOff,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import BackButton from "@/components/BackButton";
import { registerApi } from "@/lib/api";
import { setSession } from "@/lib/session";
import { useToast } from "@/hooks/use-toast";
import EmailVerificationBox from "@/components/EmailVerificationBox";
import { countryCodes, getPhoneValidationError } from "@/lib/formValidation";

const RegisterUser = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [selectedExperienceLevel, setSelectedExperienceLevel] = useState<string>("");
  const [emailForVerification, setEmailForVerification] = useState("");
  const [emailVerificationToken, setEmailVerificationToken] = useState("");
  const [currentStep, setCurrentStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const formRef = useRef<HTMLFormElement | null>(null);

  const steps = [
    { id: 1, label: "Basic", title: "Basic details", subtitle: "Tell us who you are and how to reach you.", icon: UserRound },
    { id: 2, label: "Profile", title: "Your profile", subtitle: "Help us match you with the right people.", icon: Briefcase },
    { id: 3, label: "Security", title: "Secure your account", subtitle: "Set a password to finish signing up.", icon: ShieldCheck },
  ];
  const activeStep = steps[currentStep - 1];

  const experienceLevels = [
    { value: "beginner", label: "Beginner" },
    { value: "intermediate", label: "Intermediate" },
    { value: "advanced", label: "Advanced" },
    { value: "expert", label: "Expert" },
  ];

  const inputClass =
    "h-12 rounded-xl border-slate-200 bg-white pl-11 text-slate-900 placeholder:text-slate-400 transition-colors focus-visible:border-violet-500 focus-visible:ring-2 focus-visible:ring-violet-500/20 focus-visible:ring-offset-0";
  const labelClass = "text-sm font-semibold text-slate-700";
  const iconClass = "pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400";

  const benefits = [
    "Access to exclusive member events",
    "Network with founders and investors",
    "Job opportunities and collaborations",
    "Startup resources and mentorship",
    "Member directory and profiles",
  ];

  const validateCurrentStep = (step: number) => {
    if (!formRef.current) return false;
    const formData = new FormData(formRef.current);

    const fullName = String(formData.get("fullName") || "").trim();
    const email = String(formData.get("email") || "").trim();
    const phoneCountryCode = String(formData.get("phoneCountryCode") || "").trim();
    const phoneNumber = String(formData.get("phoneNumber") || "").trim();
    const city = String(formData.get("city") || "").trim();
    const interest = String(formData.get("interest") || "").trim();
    const occupation = String(formData.get("occupation") || "").trim();

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
      if (!interest || !occupation || !selectedExperienceLevel) {
        toast({
          title: "Incomplete Profile",
          description: "Please fill interest, occupation and experience level.",
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
    const interest = String(formData.get("interest") || "").trim();
    const occupation = String(formData.get("occupation") || "").trim();
    const experienceLevel = selectedExperienceLevel;

    if (!fullName || !email || !password || !city || getPhoneValidationError(phoneCountryCode, phoneNumber)) {
      toast({
        title: "Missing Required Fields",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    if (!interest || !occupation || !experienceLevel) {
      toast({
        title: "Incomplete Profile",
        description: "Please fill in Interests, Occupation, and Experience Level.",
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
        description: "Please agree to the User Terms of Service before registering.",
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
      role: "user",
      roleDetails: {
        interest,
        occupation,
        experienceLevel: experienceLevel.toLowerCase(),
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
    <main className="relative min-h-screen overflow-hidden bg-slate-50">
      {/* Soft violet wash behind the card */}
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-[420px] bg-gradient-to-b from-violet-100/70 to-transparent" />
      <div aria-hidden className="pointer-events-none absolute -top-32 right-[-10%] h-[420px] w-[420px] rounded-full bg-violet-200/40 blur-3xl" />

      <div className="relative pt-6">
        <BackButton className="animate-reveal-left" />
      </div>

      <div className="relative mx-auto max-w-6xl px-4 py-8 sm:py-12">
        <div className="grid overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl shadow-violet-900/5 lg:grid-cols-[0.9fr_1.1fr]">
          {/* Left: pitch */}
          <section className="relative flex flex-col justify-between gap-10 border-b border-purple-200 bg-gradient-to-br from-purple-50 to-white p-6 sm:p-10 lg:border-b-0 lg:border-r">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 rounded-full border border-purple-200 bg-white px-4 py-1.5 shadow-sm">
                <User size={16} className="text-violet-600" />
                <span className="text-xs font-bold uppercase tracking-wider text-violet-700">Join as a Professional</span>
              </div>

              <div className="space-y-4">
                <h1 className="text-3xl font-bold leading-tight tracking-tight text-slate-900 sm:text-4xl lg:text-[2.75rem]">
                  Connect with <span className="text-violet-600">founders and investors</span>
                </h1>
                <p className="text-base leading-relaxed text-slate-600 sm:text-lg">
                  Explore opportunities, network with innovators, and grow your career in the startup ecosystem.
                </p>
              </div>

              <ul className="space-y-3">
                {benefits.map((benefit) => (
                  <li key={benefit} className="flex items-center gap-3 rounded-xl border border-purple-100 bg-white/80 px-4 py-3 text-sm font-medium text-slate-700 shadow-sm">
                    <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-violet-100">
                      <CheckCircle2 size={16} className="text-violet-600" />
                    </span>
                    {benefit}
                  </li>
                ))}
              </ul>
            </div>

            <p className="text-sm text-slate-600">
              Already a member?{" "}
              <Link to="/login" className="font-semibold text-violet-700 underline-offset-4 hover:underline">
                Login to your account
              </Link>
            </p>
          </section>

          {/* Right: form */}
          <section className="p-6 sm:p-10">
            <div className="mb-8 space-y-1">
              <p className="text-xs font-bold uppercase tracking-wider text-violet-600">
                Step {currentStep} of {steps.length}
              </p>
              <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Create your account</h2>
              <p className="text-sm text-slate-500">Join our community of innovators and professionals.</p>
            </div>

            <form ref={formRef} className="space-y-8" onSubmit={handleRegister}>
              {/* Stepper */}
              <ol className="grid grid-cols-3 gap-2 sm:gap-3">
                {steps.map((step) => {
                  const isDone = currentStep > step.id;
                  const isActive = currentStep === step.id;
                  const StepIcon = step.icon;
                  return (
                    <li key={step.id}>
                      <button
                        type="button"
                        onClick={() => setCurrentStep(step.id)}
                        aria-current={isActive ? "step" : undefined}
                        className="group w-full text-left"
                      >
                        <span
                          className={`block h-1.5 rounded-full transition-colors duration-300 ${
                            currentStep >= step.id ? "bg-violet-600" : "bg-slate-200 group-hover:bg-slate-300"
                          }`}
                        />
                        <span className="mt-3 flex items-center gap-2">
                          <span
                            className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold transition-colors ${
                              isActive
                                ? "bg-violet-600 text-white"
                                : isDone
                                  ? "bg-violet-100 text-violet-700"
                                  : "bg-slate-100 text-slate-500"
                            }`}
                          >
                            {isDone ? <CheckCircle2 size={14} /> : <StepIcon size={14} />}
                          </span>
                          <span className={`text-xs font-semibold sm:text-sm ${isActive ? "text-slate-900" : "text-slate-500"}`}>
                            {step.label}
                          </span>
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ol>

              <div className="rounded-2xl border border-slate-100 bg-slate-50/60 px-4 py-3">
                <p className="text-sm font-semibold text-slate-900">{activeStep.title}</p>
                <p className="text-xs text-slate-500">{activeStep.subtitle}</p>
              </div>

              {/* Step 1 */}
              <div className={currentStep === 1 ? "space-y-5 animate-curtain-reveal" : "hidden"}>
                <div className="space-y-2">
                  <label htmlFor="fullName" className={labelClass}>Full Name <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <UserRound className={iconClass} />
                    <Input id="fullName" name="fullName" placeholder="John Doe" autoComplete="name" className={inputClass} required />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="email" className={labelClass}>Email Address <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <Mail className={iconClass} />
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="you@example.com"
                      autoComplete="email"
                      className={inputClass}
                      onChange={(event) => {
                        setEmailForVerification(event.target.value);
                        setEmailVerificationToken("");
                      }}
                      required
                    />
                  </div>
                  <EmailVerificationBox
                    email={emailForVerification}
                    purpose="register:user"
                    token={emailVerificationToken}
                    onVerified={setEmailVerificationToken}
                    onReset={() => setEmailVerificationToken("")}
                  />
                </div>

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label htmlFor="phoneNumber" className={labelClass}>Phone Number <span className="text-red-500">*</span></label>
                    <div className="flex gap-2">
                      <select
                        id="phoneCountryCode"
                        name="phoneCountryCode"
                        defaultValue="+91"
                        aria-label="Country code"
                        className="h-12 w-24 flex-shrink-0 rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 outline-none transition-colors focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
                      >
                        {countryCodes.map((country) => (
                          <option key={country.code} value={country.code}>{country.code}</option>
                        ))}
                      </select>
                      <div className="relative flex-1">
                        <Phone className={iconClass} />
                        <Input id="phoneNumber" name="phoneNumber" type="tel" placeholder="9876543210" autoComplete="tel-national" className={inputClass} required />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="city" className={labelClass}>City <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <MapPin className={iconClass} />
                      <Input id="city" name="city" placeholder="Mumbai" autoComplete="address-level2" className={inputClass} required />
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 2 */}
              <div className={currentStep === 2 ? "space-y-5 animate-curtain-reveal" : "hidden"}>
                <div className="space-y-2">
                  <label htmlFor="interest" className={labelClass}>Areas of Interest <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <Sparkles className={iconClass} />
                    <Input id="interest" name="interest" placeholder="e.g., Startups, Technology, Marketing" className={inputClass} required />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="occupation" className={labelClass}>Occupation <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <Briefcase className={iconClass} />
                    <Input id="occupation" name="occupation" placeholder="e.g., Developer, Manager" autoComplete="organization-title" className={inputClass} required />
                  </div>
                </div>

                <fieldset className="space-y-2">
                  <legend className={labelClass}>Experience Level <span className="text-red-500">*</span></legend>
                  <div role="radiogroup" aria-label="Experience level" className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                    {experienceLevels.map((level) => {
                      const isSelected = selectedExperienceLevel === level.value;
                      return (
                        <button
                          key={level.value}
                          type="button"
                          role="radio"
                          aria-checked={isSelected}
                          onClick={() => setSelectedExperienceLevel(level.value)}
                          className={`h-11 rounded-xl border text-sm font-semibold transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/30 ${
                            isSelected
                              ? "border-violet-600 bg-violet-600 text-white shadow-sm"
                              : "border-slate-200 bg-white text-slate-600 hover:border-violet-300 hover:text-violet-700"
                          }`}
                        >
                          {level.label}
                        </button>
                      );
                    })}
                  </div>
                </fieldset>

                <div className="space-y-2">
                  <label htmlFor="bio" className={labelClass}>
                    About You <span className="font-normal text-slate-400">(Optional)</span>
                  </label>
                  <Textarea
                    id="bio"
                    name="bio"
                    placeholder="Tell us about yourself, your interests, and what you're looking for..."
                    className="min-h-28 rounded-xl border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus-visible:border-violet-500 focus-visible:ring-2 focus-visible:ring-violet-500/20 focus-visible:ring-offset-0"
                  />
                </div>
              </div>

              {/* Step 3 */}
              <div className={currentStep === 3 ? "space-y-5 animate-curtain-reveal" : "hidden"}>
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label htmlFor="password" className={labelClass}>Password <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <Lock className={iconClass} />
                      <Input
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Min. 6 characters"
                        autoComplete="new-password"
                        className={`${inputClass} pr-11`}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((prev) => !prev)}
                        aria-label={showPassword ? "Hide password" : "Show password"}
                        className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-400 transition-colors hover:text-violet-600"
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="confirmPassword" className={labelClass}>Confirm Password <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <Lock className={iconClass} />
                      <Input
                        id="confirmPassword"
                        name="confirmPassword"
                        type={showPassword ? "text" : "password"}
                        placeholder="Re-enter password"
                        autoComplete="new-password"
                        className={inputClass}
                        required
                      />
                    </div>
                  </div>
                </div>

                <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-purple-200 bg-purple-50/60 p-4 text-sm text-slate-700 transition-colors hover:bg-purple-50">
                  <Checkbox
                    checked={agreedToTerms}
                    onCheckedChange={(checked) => setAgreedToTerms(checked === true)}
                    className="mt-0.5 border-violet-400 data-[state=checked]:border-violet-600 data-[state=checked]:bg-violet-600"
                  />
                  <span>
                    I agree to the <Link to="/terms" className="font-semibold text-violet-700 hover:underline">User Terms of Service</Link>{" "}
                    and understand that user-specific community rules apply.
                  </span>
                </label>
              </div>

              <div className="flex items-center justify-between gap-3 border-t border-slate-100 pt-6">
                {currentStep > 1 ? (
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setCurrentStep((prev) => Math.max(prev - 1, 1))}
                    className="h-12 gap-2 rounded-xl px-4 text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  >
                    <ChevronLeft size={16} />
                    Back
                  </Button>
                ) : (
                  <div />
                )}

                {currentStep < 3 ? (
                  <Button
                    type="button"
                    onClick={handleNextStep}
                    className="h-12 gap-2 rounded-xl bg-violet-600 px-6 font-semibold text-white shadow-sm shadow-violet-600/20 hover:bg-violet-700"
                  >
                    Continue
                    <ArrowRight size={18} />
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="h-12 gap-2 rounded-xl bg-violet-600 px-6 text-base font-semibold text-white shadow-sm shadow-violet-600/20 hover:bg-violet-700 disabled:opacity-70"
                  >
                    {isLoading ? "Creating Account..." : "Create Account"}
                    <ArrowRight size={18} />
                  </Button>
                )}
              </div>
            </form>

            <p className="mt-6 text-center text-sm text-slate-500">
              Want to register as a different role?{" "}
              <Link to="/register" className="font-semibold text-violet-700 hover:underline">View all options</Link>
            </p>
          </section>
        </div>
      </div>
    </main>
  );
};

export default RegisterUser;
