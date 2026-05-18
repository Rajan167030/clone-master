import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { BarChart3, Rocket, User, ArrowLeft, KeyRound, Mail, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { loginApi, forgotPasswordApi, verifyForgotPasswordOtpApi, resetPasswordApi } from "@/lib/api";
import { setSession } from "@/lib/session";
import { useToast } from "@/hooks/use-toast";

import { useState } from "react";
import BackButton from "@/components/BackButton";

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
    <main className="relative min-h-screen flex items-center justify-center bg-slate-50/50 px-4 py-12 sm:px-6 sm:py-8 lg:px-10 lg:py-8 overflow-hidden font-body">
      {/* Ambient glowing blobs */}
      <div className="pointer-events-none absolute -left-20 top-12 h-96 w-96 rounded-full bg-violet-500/10 blur-[100px] animate-pulse" />
      <div className="pointer-events-none absolute right-0 bottom-12 h-[450px] w-[450px] rounded-full bg-indigo-500/5 blur-[120px] animate-pulse" style={{ animationDuration: "8s" }} />
      <div className="pointer-events-none absolute left-1/3 top-1/3 h-[300px] w-[300px] rounded-full bg-purple-500/5 blur-[80px]" />

      {/* Floating Back Button */}
      <BackButton className="absolute left-4 sm:left-8 top-6 z-50 px-0" />

      <div className="relative z-10 mx-auto grid min-h-[calc(100vh-6rem)] w-full max-w-6xl items-center gap-10 lg:grid-cols-2 pt-12 sm:pt-6">
        {/* Left Hero Brand Panel */}
        <section className="flex min-h-[30vh] flex-col justify-center space-y-6 pb-6 sm:min-h-0 sm:pb-0 animate-reveal-left">
          <div className="flex items-center">
            <div className="bg-white p-3 rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.06)] border border-slate-100 flex items-center justify-center max-w-[220px]">
              <img
                src="/founders_connect_global_logo.jpg"
                alt="Founders Connect Logo"
                className="h-14 w-auto object-contain bg-transparent mix-blend-multiply"
              />
            </div>
          </div>

          <p className="text-lg font-bold uppercase tracking-[0.24em] text-violet-600">Welcome back</p>
          <h1 className="text-balance text-5xl font-heading font-extrabold leading-tight text-slate-900 sm:text-6xl">
            Ecosystem built for{" "}
            <span className="block bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
              growth and impact.
            </span>
          </h1>
          <p className="max-w-xl text-lg text-slate-500 leading-relaxed">
            Empowering India's most ambitious founders, investors, and builders to meet, collaborate, and scale together.
          </p>
        </section>

        {/* Right Glassmorphic Form Panel */}
        <section className="rounded-3xl border border-violet-100 bg-white/80 p-6 shadow-[0_30px_80px_-30px_rgba(139,92,246,0.18)] backdrop-blur-xl sm:p-8 animate-reveal-right">
          
          {view === "login" && (
            <>
              <h2 className="mb-2 text-center text-3xl font-heading font-extrabold text-slate-900">Secure Access</h2>
              <p className="mb-6 text-center text-sm text-slate-500">Choose your registration role or sign in below</p>

              <div className="mb-6 grid grid-cols-3 gap-3">
                <Link
                  to="/register/user"
                  className="flex flex-col items-center justify-center gap-2 rounded-xl border border-violet-200 bg-violet-50 px-3 py-3 text-violet-700 hover:bg-violet-100/70 transition-all shadow-sm"
                >
                  <User className="h-4 w-4 text-violet-600" />
                  <span className="text-xs font-semibold uppercase tracking-wider">User</span>
                </Link>
                <Link
                  to="/register/investor"
                  className="flex flex-col items-center justify-center gap-2 rounded-xl border border-violet-200 bg-violet-50 px-3 py-3 text-violet-700 hover:bg-violet-100/70 transition-all shadow-sm"
                >
                  <BarChart3 className="h-4 w-4 text-violet-600" />
                  <span className="text-xs font-semibold uppercase tracking-wider">Investor</span>
                </Link>
                <Link
                  to="/register/founder"
                  className="flex flex-col items-center justify-center gap-2 rounded-xl border border-violet-200 bg-violet-50 px-3 py-3 text-violet-700 hover:bg-violet-100/70 transition-all shadow-sm"
                >
                  <Rocket className="h-4 w-4 text-violet-600" />
                  <span className="text-xs font-semibold uppercase tracking-wider">Founder</span>
                </Link>
              </div>

              <form className="space-y-4" onSubmit={handleLogin}>
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-semibold text-slate-700">
                    Email Address
                  </label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="name@email.com"
                    className="h-12 border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:border-violet-500/60 focus:ring-violet-500/30"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label htmlFor="password" className="text-sm font-semibold text-slate-700">
                      Password
                    </label>
                    <button 
                      type="button" 
                      onClick={() => setView("forgot")}
                      className="text-sm font-semibold text-violet-600 hover:text-violet-500 transition-colors"
                    >
                      Forgot Password?
                    </button>
                  </div>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="········"
                    className="h-12 border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:border-violet-500/60 focus:ring-violet-500/30"
                    required
                  />
                </div>

                <div className="flex items-center justify-start gap-4 pt-1 text-sm text-slate-600">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <Checkbox className="border-slate-300 data-[state=checked]:bg-violet-600 data-[state=checked]:border-violet-500" />
                    Remember Me
                  </label>
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  size="lg"
                  className="mt-2 h-12 w-full rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-base font-bold text-white hover:from-violet-500 hover:to-indigo-500 shadow-lg shadow-violet-500/20 active:scale-[0.98] transition-all disabled:opacity-50"
                >
                  {isLoading ? "Logging in..." : "LOGIN TO ACCOUNT"}
                </Button>
              </form>

              <p className="mt-6 text-center text-sm text-slate-500">
                Don&apos;t have an account?{" "}
                <Link to="/register" className="font-bold text-violet-600 hover:text-violet-500 underline-offset-4 hover:underline">
                  Register Now
                </Link>
              </p>
            </>
          )}

          {view === "forgot" && (
            <>
              <button 
                onClick={() => setView("login")} 
                className="mb-6 flex flex-row items-center gap-2 text-slate-500 hover:text-violet-600 text-sm font-semibold transition-colors group"
              >
                <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" /> Back to Login
              </button>
              <div className="mb-6 flex flex-col items-center text-center">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-50 border border-violet-100 text-violet-600">
                  <Mail className="h-6 w-6" />
                </div>
                <h2 className="text-3xl font-heading font-extrabold text-slate-900">Forgot Password</h2>
                <p className="text-slate-500 mt-2 text-sm leading-relaxed max-w-xs">
                  Enter your email address and we'll send you a 6-digit OTP to reset your password.
                </p>
              </div>

              <form className="space-y-4" onSubmit={handleForgotPassword}>
                <div className="space-y-2">
                  <label htmlFor="reset-email" className="text-sm font-semibold text-slate-700">
                    Email Address
                  </label>
                  <Input
                    id="reset-email"
                    name="email"
                    type="email"
                    placeholder="name@email.com"
                    defaultValue={resetEmail}
                    className="h-12 border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:border-violet-500/60 focus:ring-violet-500/30"
                    required
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  size="lg"
                  className="mt-4 h-12 w-full rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-base font-bold text-white hover:from-violet-500 hover:to-indigo-500 shadow-lg shadow-violet-500/20 active:scale-[0.98] transition-all disabled:opacity-50"
                >
                  {isLoading ? "Sending..." : "SEND OTP"}
                </Button>
              </form>
            </>
          )}

          {view === "verify" && (
            <>
              <button 
                onClick={() => setView("forgot")} 
                className="mb-6 flex flex-row items-center gap-2 text-slate-500 hover:text-violet-600 text-sm font-semibold transition-colors group"
              >
                <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" /> Back
              </button>
              <div className="mb-6 flex flex-col items-center text-center">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <h2 className="text-3xl font-heading font-extrabold text-slate-900">Verify OTP</h2>
                <p className="text-slate-500 mt-2 text-sm leading-relaxed">
                  Enter the 6-digit verification code sent to <span className="font-semibold text-slate-800">{resetEmail}</span>.
                </p>
              </div>

              <form className="space-y-4" onSubmit={handleVerifyOtp}>
                <div className="space-y-2">
                  <label htmlFor="otp" className="text-sm font-semibold text-slate-700">
                    One-Time Password
                  </label>
                  <Input
                    id="otp"
                    name="otp"
                    type="text"
                    maxLength={6}
                    placeholder="000000"
                    className="h-12 border-slate-200 bg-white text-center tracking-[0.5em] text-lg font-bold text-slate-900 placeholder:text-slate-300 placeholder:font-normal placeholder:tracking-normal focus:border-violet-500/60 focus:ring-violet-500/30"
                    required
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  size="lg"
                  className="mt-4 h-12 w-full rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-base font-bold text-white hover:from-violet-500 hover:to-indigo-500 shadow-lg shadow-violet-500/20 active:scale-[0.98] transition-all disabled:opacity-50"
                >
                  {isLoading ? "Verifying..." : "VERIFY CODE"}
                </Button>
              </form>
            </>
          )}

          {view === "reset" && (
            <>
              <div className="mb-6 flex flex-col items-center text-center pt-4">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-600">
                  <KeyRound className="h-6 w-6" />
                </div>
                <h2 className="text-3xl font-heading font-extrabold text-slate-900">Set New Password</h2>
                <p className="text-slate-500 mt-2 text-sm leading-relaxed">
                  Create a new, strong password for your account.
                </p>
              </div>

              <form className="space-y-4" onSubmit={handleResetPassword}>
                <div className="space-y-2">
                  <label htmlFor="newPassword" className="text-sm font-semibold text-slate-700">
                    New Password
                  </label>
                  <Input
                    id="newPassword"
                    name="newPassword"
                    type="password"
                    placeholder="········"
                    className="h-12 border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:border-violet-500/60 focus:ring-violet-500/30"
                    minLength={6}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="confirmPassword" className="text-sm font-semibold text-slate-700">
                    Confirm Password
                  </label>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    placeholder="········"
                    className="h-12 border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:border-violet-500/60 focus:ring-violet-500/30"
                    required
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  size="lg"
                  className="mt-4 h-12 w-full rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-base font-bold text-white hover:from-emerald-500 hover:to-teal-500 shadow-lg shadow-emerald-500/20 active:scale-[0.98] transition-all disabled:opacity-50"
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
