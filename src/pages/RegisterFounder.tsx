import { useState, type FormEvent } from "react";
import { Rocket, CheckCircle2, ArrowRight } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

const RegisterFounder = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedStage, setSelectedStage] = useState<string>("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [emailForVerification, setEmailForVerification] = useState("");
  const [emailVerificationToken, setEmailVerificationToken] = useState("");

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

  const handleRegister = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const fullName = String(formData.get("fullName") || "").trim();
    const email = String(formData.get("email") || "").trim().toLowerCase();
    const password = String(formData.get("password") || "").trim();
    const confirmPassword = String(formData.get("confirmPassword") || "").trim();
    const phone = String(formData.get("phone") || "").trim();
    const city = String(formData.get("city") || "").trim();
    const startupName = String(formData.get("startupName") || "").trim();
    const startupStage = selectedStage;
    const teamSize = Number(formData.get("teamSize"));
    const startupWebsite = String(formData.get("startupWebsite") || "").trim();

    // Validation
    if (!fullName || !email || !password || !phone || !city) {
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
      phone,
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
          title: "Welcome! 🚀",
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
          {/* Left Side - Benefits */}
          <section className="space-y-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-purple-200 bg-purple-50 px-4 py-2">
              <Rocket size={18} className="text-purple-600" />
              <span className="text-sm font-semibold text-purple-700">Join as a Founder</span>
            </div>

            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight mb-4">
                Accelerate your startup with <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-purple-800">investor access & mentorship</span>
              </h1>
              <p className="text-lg text-gray-600">
                Get funding introductions, expert guidance, and connect with co-founders in a supportive ecosystem.
              </p>
            </div>

            <div className="space-y-4">
              <p className="text-sm font-semibold text-gray-900 uppercase tracking-widest">
                As a founder you'll get:
              </p>
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
                  <Link to="/login" className="text-purple-600 font-semibold hover:underline">
                    Login to your account
                  </Link>
                </p>
              </CardContent>
            </Card>
          </section>

          {/* Right Side - Registration Form */}
          <section className="rounded-2xl border border-gray-200 bg-white p-8 shadow-lg">
            <div className="mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Founder Registration</h2>
              <p className="text-gray-600">Join our community of innovative founders</p>
            </div>

            <form className="space-y-6" onSubmit={handleRegister}>
              {/* Full Name & Email */}
              <div className="space-y-2">
                <label htmlFor="fullName" className="text-sm font-semibold text-gray-700">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <Input
                  id="fullName"
                  name="fullName"
                  placeholder="John Smith"
                  className="h-12 border-gray-300 focus:ring-purple-500"
                  required
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-semibold text-gray-700">
                  Email Address <span className="text-red-500">*</span>
                </label>
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

              {/* Phone & City */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="phone" className="text-sm font-semibold text-gray-700">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    placeholder="+91 9876543210"
                    className="h-12 border-gray-300 focus:ring-purple-500"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="city" className="text-sm font-semibold text-gray-700">
                    City <span className="text-red-500">*</span>
                  </label>
                  <Input
                    id="city"
                    name="city"
                    placeholder="Mumbai"
                    className="h-12 border-gray-300 focus:ring-purple-500"
                    required
                  />
                </div>
              </div>

              {/* Startup Info */}
              <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                <p className="text-sm font-semibold text-gray-900 mb-4">About Your Startup</p>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="startupName" className="text-sm font-medium text-gray-700">
                      Startup Name <span className="text-red-500">*</span>
                    </label>
                    <Input
                      id="startupName"
                      name="startupName"
                      placeholder="Your awesome startup"
                      className="h-12 border-gray-300 focus:ring-purple-500"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="startupStage" className="text-sm font-medium text-gray-700">
                      Current Stage <span className="text-red-500">*</span>
                    </label>
                    <Select value={selectedStage} onValueChange={setSelectedStage} required>
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
                      <label htmlFor="teamSize" className="text-sm font-medium text-gray-700">
                        Team Size <span className="text-red-500">*</span>
                      </label>
                      <Input
                        id="teamSize"
                        name="teamSize"
                        type="number"
                        placeholder="e.g. 5"
                        className="h-12 border-gray-300 focus:ring-purple-500"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="startupWebsite" className="text-sm font-medium text-gray-700">
                        Website <span className="text-red-500">*</span>
                      </label>
                      <Input
                        id="startupWebsite"
                        name="startupWebsite"
                        placeholder="https://yourstartuip.com"
                        className="h-12 border-gray-300 focus:ring-purple-500"
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Bio */}
              <div className="space-y-2">
                <label htmlFor="bio" className="text-sm font-semibold text-gray-700">
                  Pitch Your Startup (Optional)
                </label>
                <Textarea
                  id="bio"
                  name="bio"
                  placeholder="Tell us about your startup idea, mission, and what you're building. What problem are you solving? What makes your solution unique?"
                  className="min-h-24 border-gray-300 focus:ring-purple-500"
                />
              </div>

              {/* Password Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="password" className="text-sm font-semibold text-gray-700">
                    Password <span className="text-red-500">*</span>
                  </label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="Create a strong password"
                    className="h-12 border-gray-300 focus:ring-purple-500"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="confirmPassword" className="text-sm font-semibold text-gray-700">
                    Confirm Password <span className="text-red-500">*</span>
                  </label>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    placeholder="Confirm your password"
                    className="h-12 border-gray-300 focus:ring-purple-500"
                    required
                  />
                </div>
              </div>

              <label className="flex items-start gap-3 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
                <Checkbox
                  checked={agreedToTerms}
                  onCheckedChange={(checked) => setAgreedToTerms(checked === true)}
                  className="mt-0.5"
                />
                <span>
                  I agree to the{" "}
                  <Link to="/terms" className="font-semibold text-purple-600 hover:underline">
                    Founder Terms of Service
                  </Link>
                  {" "}covering startup participation, community conduct, and founder resources.
                </span>
              </label>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isLoading}
                size="lg"
                className="w-full h-12 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-semibold text-base gap-2"
              >
                {isLoading ? "Creating Account..." : "Create Founder Account"}
                <ArrowRight size={18} />
              </Button>
            </form>

            <div className="mt-8 pt-6 border-t border-gray-200">
              <p className="text-center text-sm text-gray-600">
                Want to register as a different role?{" "}
                <Link to="/membership" className="text-purple-600 font-semibold hover:underline">
                  View all options
                </Link>
              </p>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
};

export default RegisterFounder;
