import { useState, type FormEvent } from "react";
import { User, CheckCircle2, ArrowRight } from "lucide-react";
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

const RegisterUser = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [selectedExperienceLevel, setSelectedExperienceLevel] = useState<string>("");
  const [emailForVerification, setEmailForVerification] = useState("");
  const [emailVerificationToken, setEmailVerificationToken] = useState("");

  const benefits = [
    "Access to exclusive member events",
    "Network with founders and investors",
    "Job opportunities and collaborations",
    "Startup resources and mentorship",
    "Member directory and profiles",
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
    const interest = String(formData.get("interest") || "").trim();
    const occupation = String(formData.get("occupation") || "").trim();
    const experienceLevel = selectedExperienceLevel;

    // Validation
    if (!fullName || !email || !password || !phone || !city) {
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
      phone,
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
          title: "Welcome! 🎉",
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
    <main className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-gray-50">
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-12 lg:grid-cols-2 items-center max-w-6xl mx-auto">
          {/* Left Side - Benefits */}
          <section className="space-y-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-2">
              <User size={18} className="text-blue-600" />
              <span className="text-sm font-semibold text-blue-700">Join as a Professional</span>
            </div>

            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight mb-4">
                Connect with <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-800">founders and investors</span>
              </h1>
              <p className="text-lg text-gray-600">
                Explore opportunities, network with innovators, and grow your career in the startup ecosystem.
              </p>
            </div>

            <div className="space-y-4">
              <p className="text-sm font-semibold text-gray-900 uppercase tracking-widest">
                As a member you'll get:
              </p>
              {benefits.map((benefit, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <CheckCircle2 size={20} className="text-blue-600 flex-shrink-0 mt-1" />
                  <span className="text-gray-700">{benefit}</span>
                </div>
              ))}
            </div>

            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
              <CardContent className="pt-6">
                <p className="text-sm text-gray-700">
                  <span className="font-semibold">Already a member?</span>{" "}
                  <Link to="/login" className="text-blue-600 font-semibold hover:underline">
                    Login to your account
                  </Link>
                </p>
              </CardContent>
            </Card>
          </section>

          {/* Right Side - Registration Form */}
          <section className="rounded-2xl border border-gray-200 bg-white p-8 shadow-lg">
            <div className="mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Create Your Account</h2>
              <p className="text-gray-600">Join our community of innovators and professionals</p>
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
                  placeholder="John Doe"
                  className="h-12 border-gray-300 focus:ring-blue-500"
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
                  placeholder="you@example.com"
                  className="h-12 border-gray-300 focus:ring-blue-500"
                  onChange={(event) => {
                    setEmailForVerification(event.target.value);
                    setEmailVerificationToken("");
                  }}
                  required
                />
                <EmailVerificationBox
                  email={emailForVerification}
                  purpose="register:user"
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
                    className="h-12 border-gray-300 focus:ring-blue-500"
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
                    className="h-12 border-gray-300 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              {/* Interests & Occupation */}
              <div className="space-y-2">
                <label htmlFor="interest" className="text-sm font-semibold text-gray-700">
                  Areas of Interest <span className="text-red-500">*</span>
                </label>
                <Input
                  id="interest"
                  name="interest"
                  placeholder="e.g., Startups, Technology, Marketing"
                  className="h-12 border-gray-300 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="occupation" className="text-sm font-semibold text-gray-700">
                    Occupation <span className="text-red-500">*</span>
                  </label>
                  <Input
                    id="occupation"
                    name="occupation"
                    placeholder="e.g., Developer, Manager"
                    className="h-12 border-gray-300 focus:ring-blue-500"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="experienceLevel" className="text-sm font-semibold text-gray-700">
                    Experience Level <span className="text-red-500">*</span>
                  </label>
                  <Select
                    value={selectedExperienceLevel}
                    onValueChange={setSelectedExperienceLevel}
                  >
                    <SelectTrigger
                      id="experienceLevel"
                      className="h-12 border-gray-300 focus:ring-blue-500"
                    >
                      <SelectValue placeholder="Select experience level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                      <SelectItem value="expert">Expert</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Bio */}
              <div className="space-y-2">
                <label htmlFor="bio" className="text-sm font-semibold text-gray-700">
                  About You (Optional)
                </label>
                <Textarea
                  id="bio"
                  name="bio"
                  placeholder="Tell us about yourself, your interests, and what you're looking for..."
                  className="min-h-24 border-gray-300 focus:ring-blue-500"
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
                    className="h-12 border-gray-300 focus:ring-blue-500"
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
                    className="h-12 border-gray-300 focus:ring-blue-500"
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
                  <Link to="/terms" className="font-semibold text-blue-600 hover:underline">
                    User Terms of Service
                  </Link>
                  {" "}and understand that user-specific community rules apply.
                </span>
              </label>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isLoading}
                size="lg"
                className="w-full h-12 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold text-base gap-2"
              >
                {isLoading ? "Creating Account..." : "Create Account"}
                <ArrowRight size={18} />
              </Button>

            </form>

            <div className="mt-8 pt-6 border-t border-gray-200">
              <p className="text-center text-sm text-gray-600">
                Want to register as a different role?{" "}
                <Link to="/membership" className="text-blue-600 font-semibold hover:underline">
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

export default RegisterUser;
