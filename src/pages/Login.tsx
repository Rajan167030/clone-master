import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { BarChart3, Rocket, User, ArrowLeft, KeyRound, Mail, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { loginApi, forgotPasswordApi, verifyForgotPasswordOtpApi, resetPasswordApi } from "@/lib/api";
import { setSession } from "@/lib/session";
import { useToast } from "@/hooks/use-toast";

import { useState } from "react";

const Login = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const redirectTo = searchParams.get("redirect") || "/dashboard";

  // State for handling the view: login, forgot, verify, reset
  const [view, setView] = useState<"login" | "forgot" | "verify" | "reset">("login");
  const [resetEmail, setResetEmail] = useState("");
  const [resetOtp, setResetOtp] = useState("");

  const handleLogin = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const email = String(formData.get("email") || "").trim().toLowerCase();
    const password = String(formData.get("password") || "").trim();

    if (!email || !password) {
      toast({
        title: "Missing Credentials",
        description: "Please enter both email and password.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    loginApi({ email, password })
      .then((response) => {
        toast({
          title: "Welcome Back!",
          description: "Login successful. Redirecting...",
        });
        setSession(response.token, response.account);
        const destination = response.account.role === "admin" && redirectTo === "/dashboard"
          ? "/admin"
          : redirectTo;
        setTimeout(() => navigate(destination, { replace: true }), 1500);
      })
      .catch((error) => {
        toast({
          title: "Login Failed",
          description: error instanceof Error ? error.message : "Invalid credentials. Please try again.",
          variant: "destructive",
        });
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const handleForgotPassword = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = String(formData.get("email") || "").trim().toLowerCase();
    
    if (!email) {
      toast({ title: "Error", description: "Email is required.", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    forgotPasswordApi({ email })
      .then((res) => {
        toast({ title: "OTP Sent", description: res.message });
        setResetEmail(email);
        setView("verify");
      })
      .catch((err) => {
        toast({ title: "Error", description: err.message || "Failed to send OTP", variant: "destructive" });
      })
      .finally(() => setIsLoading(false));
  };

  const handleVerifyOtp = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const otp = String(formData.get("otp") || "").trim();
    
    if (!otp) {
      toast({ title: "Error", description: "OTP is required.", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    verifyForgotPasswordOtpApi({ email: resetEmail, otp })
      .then((res) => {
        toast({ title: "Verified", description: res.message });
        setResetOtp(otp);
        setView("reset");
      })
      .catch((err) => {
        toast({ title: "Error", description: err.message || "Invalid OTP", variant: "destructive" });
      })
      .finally(() => setIsLoading(false));
  };

  const handleResetPassword = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newPassword = String(formData.get("newPassword") || "").trim();
    const confirmPassword = String(formData.get("confirmPassword") || "").trim();
    
    if (!newPassword || newPassword !== confirmPassword) {
      toast({ title: "Error", description: "Passwords must match and cannot be empty.", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    resetPasswordApi({ email: resetEmail, otp: resetOtp, newPassword })
      .then((res) => {
        toast({ title: "Success", description: "Password reset successfully. Please log in." });
        setView("login");
        setResetEmail("");
        setResetOtp("");
      })
      .catch((err) => {
        toast({ title: "Error", description: err.message || "Failed to reset password", variant: "destructive" });
      })
      .finally(() => setIsLoading(false));
  };

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_#dff4ff_0%,_#f7fbff_45%,_#ffffff_75%)] px-4 py-12 sm:px-6 sm:py-8 lg:px-10 lg:py-8">
      <div className="mx-auto grid min-h-[calc(100vh-4rem)] w-full max-w-6xl items-center gap-10 lg:grid-cols-2">
        <section className="flex min-h-[34vh] flex-col justify-center space-y-6 pb-6 sm:min-h-0 sm:pb-0">
          <div className="flex items-center">
            <img
              src="/founders_connect_global_logo.jpg"
              alt="Founders Connect"
              className="h-55 w-auto object-contain bg-transparent mix-blend-multiply"
            />
          </div>

          <p className="text-xl text-slate-600">Welcome to the</p>
          <h1 className="text-balance text-5xl font-heading font-bold leading-tight text-slate-900 sm:text-6xl">
            Ecosystem built for
            <span className="block bg-gradient-to-r from-violet-500 to-violet-700 bg-clip-text text-transparent">growth and impact</span>
          </h1>
          <p className="max-w-xl text-lg text-slate-500">
            Empowering 1k+ users to build, invest, and scale together in a bright and secure platform.
          </p>
        </section>

        <section className="rounded-3xl border border-violet-100/80 bg-white/90 p-6 shadow-[0_30px_80px_-40px_rgba(139,92,246,0.45)] backdrop-blur-xl sm:p-8">
          
          {view === "login" && (
            <>
              <h2 className="mb-6 text-center text-3xl font-heading font-semibold text-slate-900">Secure Login</h2>

              <div className="mb-6 grid grid-cols-3 gap-3">
                <Link
                  to="/register/user"
                  className="flex flex-col items-center justify-center gap-2 rounded-xl border border-cyan-200 bg-cyan-50 px-3 py-3 text-slate-900 transition-colors"
                >
                  <User className="h-4 w-4 text-cyan-600" />
                  <span className="text-sm font-medium">User</span>
                </Link>
                <Link
                  to="/register/investor"
                  className="flex flex-col items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-3 text-slate-600 transition-colors hover:border-cyan-200 hover:text-slate-900"
                >
                  <BarChart3 className="h-4 w-4 text-cyan-600" />
                  <span className="text-sm font-medium">Investor</span>
                </Link>
                <Link
                  to="/register/founder"
                  className="flex flex-col items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-3 text-slate-600 transition-colors hover:border-cyan-200 hover:text-slate-900"
                >
                  <Rocket className="h-4 w-4 text-cyan-600" />
                  <span className="text-sm font-medium">Founder</span>
                </Link>
              </div>

              <form className="space-y-4" onSubmit={handleLogin}>
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium text-slate-700">
                    Email Address
                  </label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="name@email.com"
                    className="h-12 border-slate-200 bg-white text-slate-900 placeholder:text-slate-400"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label htmlFor="password" className="text-sm font-medium text-slate-700">
                      Password
                    </label>
                    <button 
                      type="button" 
                      onClick={() => setView("forgot")}
                      className="text-sm font-medium text-cyan-700 hover:text-cyan-800"
                    >
                      Forgot Password?
                    </button>
                  </div>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="········"
                    className="h-12 border-slate-200 bg-white text-slate-900 placeholder:text-slate-400"
                    required
                  />
                </div>

                <div className="flex items-center justify-start gap-4 pt-1 text-sm text-slate-600">
                  <label className="flex items-center gap-2">
                    <Checkbox />
                    Remember Me
                  </label>
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  size="lg"
                  className="mt-2 h-12 w-full rounded-xl bg-gradient-to-r from-cyan-500 to-sky-600 text-base font-semibold text-white hover:opacity-95 disabled:opacity-50"
                >
                  {isLoading ? "Logging in..." : "LOGIN TO ACCOUNT"}
                </Button>
              </form>

              <p className="mt-6 text-center text-sm text-slate-600">
                Don&apos;t have an account?{" "}
                <Link to="/register" className="font-semibold text-cyan-700 underline-offset-4 hover:underline">
                  Register Now
                </Link>
              </p>
            </>
          )}

          {view === "forgot" && (
            <>
              <button onClick={() => setView("login")} className="mb-6 flex flex-row items-center gap-2 text-slate-500 hover:text-cyan-700 text-sm font-medium transition-colors">
                <ArrowLeft className="w-4 h-4" /> Back to Login
              </button>
              <div className="mb-6 flex flex-col items-center text-center">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-cyan-100 text-cyan-600">
                  <Mail className="h-6 w-6" />
                </div>
                <h2 className="text-2xl font-heading font-semibold text-slate-900">Forgot Password</h2>
                <p className="text-slate-500 mt-2">Enter your email address and we'll send you a 6-digit OTP to reset your password.</p>
              </div>

              <form className="space-y-4" onSubmit={handleForgotPassword}>
                <div className="space-y-2">
                  <label htmlFor="reset-email" className="text-sm font-medium text-slate-700">
                    Email Address
                  </label>
                  <Input
                    id="reset-email"
                    name="email"
                    type="email"
                    placeholder="name@email.com"
                    defaultValue={resetEmail}
                    className="h-12 border-slate-200 bg-white text-slate-900 placeholder:text-slate-400"
                    required
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  size="lg"
                  className="mt-4 h-12 w-full rounded-xl bg-gradient-to-r from-cyan-500 to-sky-600 text-base font-semibold text-white hover:opacity-95 disabled:opacity-50"
                >
                  {isLoading ? "Sending..." : "SEND OTP"}
                </Button>
              </form>
            </>
          )}

          {view === "verify" && (
            <>
              <button onClick={() => setView("forgot")} className="mb-6 flex flex-row items-center gap-2 text-slate-500 hover:text-cyan-700 text-sm font-medium transition-colors">
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
              <div className="mb-6 flex flex-col items-center text-center">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <h2 className="text-2xl font-heading font-semibold text-slate-900">Verify OTP</h2>
                <p className="text-slate-500 mt-2">Enter the 6-digit verification code sent to <span className="font-medium text-slate-800">{resetEmail}</span>.</p>
              </div>

              <form className="space-y-4" onSubmit={handleVerifyOtp}>
                <div className="space-y-2">
                  <label htmlFor="otp" className="text-sm font-medium text-slate-700">
                    One-Time Password
                  </label>
                  <Input
                    id="otp"
                    name="otp"
                    type="text"
                    maxLength={6}
                    placeholder="000000"
                    className="h-12 border-slate-200 bg-white text-center tracking-[0.5em] text-lg font-semibold text-slate-900 placeholder:text-slate-300 placeholder:font-normal placeholder:tracking-normal"
                    required
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  size="lg"
                  className="mt-4 h-12 w-full rounded-xl bg-indigo-600 text-base font-semibold text-white hover:bg-indigo-700 hover:opacity-95 disabled:opacity-50"
                >
                  {isLoading ? "Verifying..." : "VERIFY CODE"}
                </Button>
              </form>
            </>
          )}

          {view === "reset" && (
            <>
              <div className="mb-6 flex flex-col items-center text-center pt-4">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                  <KeyRound className="h-6 w-6" />
                </div>
                <h2 className="text-2xl font-heading font-semibold text-slate-900">Set New Password</h2>
                <p className="text-slate-500 mt-2">Create a new, strong password for your account.</p>
              </div>

              <form className="space-y-4" onSubmit={handleResetPassword}>
                <div className="space-y-2">
                  <label htmlFor="newPassword" className="text-sm font-medium text-slate-700">
                    New Password
                  </label>
                  <Input
                    id="newPassword"
                    name="newPassword"
                    type="password"
                    placeholder="········"
                    className="h-12 border-slate-200 bg-white text-slate-900 placeholder:text-slate-400"
                    minLength={6}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="confirmPassword" className="text-sm font-medium text-slate-700">
                    Confirm Password
                  </label>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    placeholder="········"
                    className="h-12 border-slate-200 bg-white text-slate-900 placeholder:text-slate-400"
                    required
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  size="lg"
                  className="mt-4 h-12 w-full rounded-xl bg-emerald-600 text-base font-semibold text-white hover:bg-emerald-700 hover:opacity-95 disabled:opacity-50"
                >
                  {isLoading ? "Saving..." : "SAVE NEW PASSWORD"}
                </Button>
              </form>
            </>
          )}

        </section>
      </div>
    </main>
  );
};

export default Login;
