import { useMemo, useState, type FormEvent } from "react";
import { BarChart3, Rocket, User } from "lucide-react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { registerApi } from "@/lib/api";
import { setSession } from "@/lib/session";
import { useToast } from "@/hooks/use-toast";

type Role = "user" | "investor" | "founder";

const getFieldValue = (formData: FormData, field: string) => String(formData.get(field) || "").trim();

const Register = () => {
  const { role: routeRole } = useParams<{ role?: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const role: Role = useMemo(() => {
    if (routeRole === "investor") return "investor";
    if (routeRole === "founder") return "founder";
    return "user";
  }, [routeRole]);

  const handleRegister = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const fullName = getFieldValue(formData, "fullName");
    const email = getFieldValue(formData, "email").toLowerCase();
    const password = getFieldValue(formData, "password");
    const confirmPassword = getFieldValue(formData, "confirmPassword");

    if (!fullName || !email || !password) {
      toast({
        title: "Missing Fields",
        description: "Please fill all required fields.",
        variant: "destructive",
      });
      return;
    }

    if (password !== confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "Password and Confirm Password must match.",
        variant: "destructive",
      });
      return;
    }

    let roleDetails: Record<string, unknown> = {};

    if (role === "user") {
      const interest = getFieldValue(formData, "interest");
      const occupation = getFieldValue(formData, "occupation");
      const experienceLevel = getFieldValue(formData, "experienceLevel");

      if (!interest || !occupation || !experienceLevel) {
        toast({
          title: "Missing Details",
          description: "Please fill Interests, Occupation, and Experience Level.",
          variant: "destructive",
        });
        return;
      }

      roleDetails.interest = interest;
      roleDetails.occupation = occupation;
      roleDetails.experienceLevel = experienceLevel.toLowerCase();
    }

    if (role === "investor") {
      const investmentMin = Number(getFieldValue(formData, "investmentMin"));
      const investmentMax = Number(getFieldValue(formData, "investmentMax"));
      const investmentCurrency = getFieldValue(formData, "investmentCurrency") || "INR";
      const focusSector = getFieldValue(formData, "focusSector");
      const portfolioSize = Number(getFieldValue(formData, "portfolioSize"));
      const investorId = getFieldValue(formData, "investorId");

      if (
        !Number.isFinite(investmentMin) ||
        !Number.isFinite(investmentMax) ||
        investmentMin < 0 ||
        investmentMax < investmentMin ||
        !focusSector ||
        !Number.isFinite(portfolioSize) ||
        portfolioSize < 0 ||
        !investorId
      ) {
        toast({
          title: "Invalid Details",
          description: "Please fill all required investor details correctly.",
          variant: "destructive",
        });
        return;
      }

      roleDetails = {
        investmentRange: {
          min: investmentMin,
          max: investmentMax,
          currency: investmentCurrency.toUpperCase(),
        },
        focusSector: focusSector
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
        portfolioSize,
        investorId,
      };
    }

    if (role === "founder") {
      const startupName = getFieldValue(formData, "startupName");
      const startupStage = getFieldValue(formData, "startupStage").toLowerCase().replace(/\s+/g, "-");
      const teamSize = Number(getFieldValue(formData, "teamSize"));
      const startupWebsite = getFieldValue(formData, "startupWebsite");

      if (!startupName || !startupStage || !Number.isFinite(teamSize) || teamSize < 1 || !startupWebsite) {
        toast({
          title: "Invalid Details",
          description: "Please fill all required startup details correctly.",
          variant: "destructive",
        });
        return;
      }

      roleDetails = { startupName, startupStage, teamSize, startupWebsite };
    }

    setIsLoading(true);

    registerApi({
      fullName,
      email,
      password,
      phone: getFieldValue(formData, "phone"),
      city: getFieldValue(formData, "city"),
      role,
      roleDetails,
    })
      .then((response) => {
        toast({
          title: "Success!",
          description: "Account created successfully. Redirecting to dashboard...",
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

  const roleTitle = useMemo(() => {
    if (role === "investor") return "Investor";
    if (role === "founder") return "Founder";
    return "User";
  }, [role]);

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_#dff4ff_0%,_#f7fbff_45%,_#ffffff_75%)] px-4 py-8 sm:px-6 lg:px-10">
      <div className="mx-auto grid min-h-[calc(100vh-4rem)] w-full max-w-6xl items-center gap-10 lg:grid-cols-2">
        <section className="space-y-6">
          <div className="inline-flex items-center gap-3 rounded-xl border border-violet-100 bg-white/90 px-4 py-3 shadow-[0_20px_50px_-35px_rgba(139,92,246,0.5)] backdrop-blur">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-gradient-to-br from-violet-400 to-violet-600 text-lg font-bold text-white">
              SL
            </div>
            <span className="text-2xl font-heading font-bold text-slate-900">StartupLanes</span>
          </div>

          <h1 className="text-balance text-5xl font-heading font-bold leading-tight text-slate-900 sm:text-6xl">
            Create your account and
            <span className="block bg-gradient-to-r from-violet-500 to-violet-700 bg-clip-text text-transparent">join the ecosystem</span>
          </h1>
          <p className="max-w-xl text-lg text-slate-500">
            Register as a user, investor, or founder and personalize your onboarding in one step.
          </p>
        </section>

        <section className="rounded-3xl border border-violet-100/80 bg-white/90 p-6 shadow-[0_30px_80px_-40px_rgba(139,92,246,0.45)] backdrop-blur-xl sm:p-8">
          <h2 className="mb-2 text-center text-3xl font-heading font-semibold text-slate-900">Register Account</h2>
          <p className="mb-6 text-center text-sm text-slate-600">Select your role and fill in the details.</p>

          <div className="mb-6 grid grid-cols-3 gap-3">
            <Link
              to="/register/user"
              className={`flex flex-col items-center justify-center gap-2 rounded-xl border px-3 py-3 text-sm font-medium transition-colors ${
                role === "user"
                  ? "border-violet-200 bg-violet-50 text-slate-900"
                  : "border-slate-200 bg-white text-slate-600 hover:border-violet-200 hover:text-slate-900"
              }
            >
              <User className="h-4 w-4 text-violet-600" />
              User
            </Link>
            <Link
              to="/register/investor"
              className={`flex flex-col items-center justify-center gap-2 rounded-xl border px-3 py-3 text-sm font-medium transition-colors ${
                role === "investor"
                  ? "border-violet-200 bg-violet-50 text-slate-900"
                  : "border-slate-200 bg-white text-slate-600 hover:border-violet-200 hover:text-slate-900"
              }
            >
              <BarChart3 className="h-4 w-4 text-violet-600" />
              Investor
            </Link>
            <Link
              to="/register/founder"
              className={`flex flex-col items-center justify-center gap-2 rounded-xl border px-3 py-3 text-sm font-medium transition-colors ${
                role === "founder"
                  ? "border-violet-200 bg-violet-50 text-slate-900"
                  : "border-slate-200 bg-white text-slate-600 hover:border-violet-200 hover:text-slate-900"
              }
            >
              <Rocket className="h-4 w-4 text-violet-600" />
              Founder
            </Link>
          </div>

          <form className="space-y-4" onSubmit={handleRegister}>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label htmlFor="fullName" className="text-sm font-medium text-slate-700">
                  Full Name
                </label>
                <Input id="fullName" name="fullName" placeholder="Your full name" className="h-12 border-slate-200" required />
              </div>
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-slate-700">
                  Email Address
                </label>
                <Input id="email" name="email" type="email" placeholder="name@email.com" className="h-12 border-slate-200" required />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label htmlFor="phone" className="text-sm font-medium text-slate-700">
                  Phone Number
                </label>
                <Input id="phone" name="phone" type="tel" placeholder="+91 9876543210" className="h-12 border-slate-200" required />
              </div>
              <div className="space-y-2">
                <label htmlFor="city" className="text-sm font-medium text-slate-700">
                  City
                </label>
                <Input id="city" name="city" placeholder="Your city" className="h-12 border-slate-200" required />
              </div>
            </div>

            {role === "user" && (
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2 sm:col-span-2">
                  <label htmlFor="interest" className="text-sm font-medium text-slate-700">
                    Interests
                  </label>
                  <Input id="interest" name="interest" placeholder="Networking, mentorship, jobs..." className="h-12 border-slate-200" required />
                </div>
                <div className="space-y-2">
                  <label htmlFor="occupation" className="text-sm font-medium text-slate-700">
                    Occupation
                  </label>
                  <Input id="occupation" name="occupation" placeholder="Student, Developer..." className="h-12 border-slate-200" required />
                </div>
                <div className="space-y-2">
                  <label htmlFor="experienceLevel" className="text-sm font-medium text-slate-700">
                    Experience Level
                  </label>
                  <Input id="experienceLevel" name="experienceLevel" placeholder="Beginner, Intermediate..." className="h-12 border-slate-200" required />
                </div>
              </div>
            )}

            {role === "investor" && (
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label htmlFor="investmentMin" className="text-sm font-medium text-slate-700">
                    Minimum Investment
                  </label>
                  <Input id="investmentMin" name="investmentMin" type="number" placeholder="500000" className="h-12 border-slate-200" required />
                </div>
                <div className="space-y-2">
                  <label htmlFor="investmentMax" className="text-sm font-medium text-slate-700">
                    Maximum Investment
                  </label>
                  <Input id="investmentMax" name="investmentMax" type="number" placeholder="2500000" className="h-12 border-slate-200" required />
                </div>
                <div className="space-y-2">
                  <label htmlFor="focusSector" className="text-sm font-medium text-slate-700">
                    Focus Sector
                  </label>
                  <Input id="focusSector" name="focusSector" placeholder="Fintech, Healthtech" className="h-12 border-slate-200" required />
                </div>
                <div className="space-y-2">
                  <label htmlFor="investmentCurrency" className="text-sm font-medium text-slate-700">
                    Currency
                  </label>
                  <Input id="investmentCurrency" name="investmentCurrency" placeholder="INR" className="h-12 border-slate-200" required />
                </div>
                <div className="space-y-2">
                  <label htmlFor="portfolioSize" className="text-sm font-medium text-slate-700">
                    Portfolio Size
                  </label>
                  <Input id="portfolioSize" name="portfolioSize" type="number" placeholder="20000000" className="h-12 border-slate-200" required />
                </div>
                <div className="space-y-2">
                  <label htmlFor="investorId" className="text-sm font-medium text-slate-700">
                    Investor ID
                  </label>
                  <Input id="investorId" name="investorId" placeholder="AngelList/Profile ID" className="h-12 border-slate-200" required />
                </div>
              </div>
            )}

            {role === "founder" && (
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label htmlFor="startupName" className="text-sm font-medium text-slate-700">
                    Startup Name
                  </label>
                  <Input id="startupName" name="startupName" placeholder="Your startup" className="h-12 border-slate-200" required />
                </div>
                <div className="space-y-2">
                  <label htmlFor="startupStage" className="text-sm font-medium text-slate-700">
                    Startup Stage
                  </label>
                  <Input id="startupStage" name="startupStage" placeholder="Idea, MVP, Growth..." className="h-12 border-slate-200" required />
                </div>
                <div className="space-y-2">
                  <label htmlFor="teamSize" className="text-sm font-medium text-slate-700">
                    Team Size
                  </label>
                  <Input id="teamSize" name="teamSize" placeholder="e.g. 8" className="h-12 border-slate-200" required />
                </div>
                <div className="space-y-2">
                  <label htmlFor="startupWebsite" className="text-sm font-medium text-slate-700">
                    Startup Website
                  </label>
                  <Input id="startupWebsite" name="startupWebsite" placeholder="https://example.com" className="h-12 border-slate-200" required />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label htmlFor="bio" className="text-sm font-medium text-slate-700">
                {roleTitle} Bio
              </label>
              <Textarea
                id="bio"
                name="bio"
                placeholder="Tell us a little about yourself"
                className="min-h-24 border-slate-200"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium text-slate-700">
                  Password
                </label>
                <Input id="password" name="password" type="password" placeholder="Create password" className="h-12 border-slate-200" required />
              </div>
              <div className="space-y-2">
                <label htmlFor="confirmPassword" className="text-sm font-medium text-slate-700">
                  Confirm Password
                </label>
                <Input id="confirmPassword" name="confirmPassword" type="password" placeholder="Confirm password" className="h-12 border-slate-200" required />
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              size="lg"
              className="mt-2 h-12 w-full rounded-xl bg-gradient-to-r from-violet-500 to-violet-600 text-base font-semibold text-white hover:opacity-95 disabled:opacity-50"
            >
              {isLoading ? "Creating Account..." : `CREATE ${roleTitle.toUpperCase()} ACCOUNT`}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-600">
            Already have an account?{" "}
            <Link to="/login" className="font-semibold text-cyan-700 underline-offset-4 hover:underline">
              Login Now
            </Link>
          </p>
        </section>
      </div>
    </main>
  );
};

export default Register;
