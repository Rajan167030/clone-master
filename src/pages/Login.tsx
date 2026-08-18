import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, CheckCircle2, Eye, EyeOff, KeyRound, Mail } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { loginApi, forgotPasswordApi, verifyForgotPasswordOtpApi, resetPasswordApi } from "@/lib/api";
import { setSession } from "@/lib/session";
import { useToast } from "@/hooks/use-toast";

import { useState } from "react";
import BackButton from "@/components/BackButton";

interface LoginProps {
  role?: "user" | "founder";
}

type QrLoginStatus = "waiting" | "scanned" | "approved" | "expired" | "denied";

type QrLoginBadgeProps = {
  qrValue: string;
  status: QrLoginStatus;
  onExpire?: () => void;
};

const statusCopy: Record<QrLoginStatus, string> = {
  waiting: "waiting for scan...",
  scanned: "phone detected",
  approved: "approved - logging in",
  expired: "expired - refresh needed",
  denied: "denied - try again",
};

const QrLoginBadge = ({ qrValue, status, onExpire }: QrLoginBadgeProps) => (
  <section className="flex flex-col items-center motion-safe:transition-transform motion-safe:duration-300">
    <div className="h-[70px] w-8 bg-[repeating-linear-gradient(115deg,#4C1D95_0_11px,#6D28D9_11px_22px)] shadow-[0_12px_28px_rgba(76,29,149,0.24)]" />
    <div className="relative z-10 -mt-1 mb-[-10px] h-8 w-16 rounded-md bg-gradient-to-b from-[#F4F1FA] to-[#CFC6DF] shadow-[inset_0_1px_1px_rgba(255,255,255,0.8),0_6px_14px_rgba(76,29,149,0.22)]">
      <span className="absolute left-1/2 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#9A8CB7] bg-[#F3EFFA] shadow-inner" />
    </div>

    <div className="login-paper-card w-full max-w-[360px] rotate-[-2.5deg] overflow-hidden rounded-2xl bg-white shadow-[0_24px_50px_rgba(76,29,149,0.22)] motion-safe:transition-all motion-safe:duration-250 hover:-translate-y-[3px] hover:rotate-[-0.5deg]">
      <div className="bg-gradient-to-r from-[#4C1D95] to-[#6D28D9] px-6 py-5 text-center text-white">
        <h2 className="font-['Caveat'] text-4xl font-bold leading-none">scan me!</h2>
        <p className="mt-1 font-['IBM_Plex_Mono'] text-[11px] uppercase tracking-[0.16em] text-white/80">
          - login in 2 seconds -
        </p>
      </div>

      <div className="px-6 py-6 text-center">
        <div className="mx-auto w-full max-w-[230px] border-[10px] border-white bg-white p-3 shadow-[0_0_0_1px_#E4DEF2,0_14px_30px_rgba(76,29,149,0.14)]">
          <QRCodeSVG
            value={qrValue}
            size={190}
            level="M"
            includeMargin
            aria-label="Scan with your phone to log in"
            role="img"
            className="h-full w-full"
          />
        </div>

        <p className="mx-auto mt-5 max-w-[240px] font-['Caveat'] text-2xl font-semibold leading-tight text-[#635C77]">
          open your camera & point it here
        </p>

        <div aria-live="polite" className="mt-4 flex flex-col items-center gap-2">
          <span className="border border-[#C4B5FD] bg-[#F3EFFA] px-3 py-1 font-['IBM_Plex_Mono'] text-[11px] font-semibold uppercase tracking-[0.14em] text-[#4C1D95]">
            {statusCopy[status]}
          </span>
          {status === "expired" && onExpire && (
            <button
              type="button"
              onClick={onExpire}
              className="font-['IBM_Plex_Mono'] text-[11px] font-semibold uppercase tracking-[0.12em] text-[#6D28D9] underline decoration-dashed underline-offset-4"
            >
              refresh qr
            </button>
          )}
        </div>
      </div>
    </div>
  </section>
);

const Login = ({ role = "user" }: LoginProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
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
        const destination = (response.account.role === "admin" || response.account.role === "superadmin") && redirectTo === "/dashboard"
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

  const qrValue = typeof window === "undefined" ? "https://foundersconnect.co.in/login" : window.location.href;

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#F3EFFA] bg-[radial-gradient(circle,#E9E1F7_1px,transparent_1px)] bg-[length:22px_22px] px-4 py-16 font-['Inter'] text-[#1B1B1F] sm:px-6 lg:px-10">
      <BackButton className="absolute left-4 top-6 z-50 px-0 sm:left-8" />

      <div className="relative z-10 mx-auto flex w-full max-w-5xl flex-col items-center justify-center gap-12 min-[700px]:flex-row min-[700px]:gap-14">
        {view === "login" && (
          <QrLoginBadge
            qrValue={qrValue}
            status="waiting"
            onExpire={() => {
              toast({
                title: "QR refresh",
                description: "QR refresh is handled by the login provider when connected.",
              });
            }}
          />
        )}

        <section className="login-paper-card relative w-full max-w-[430px] rotate-[2deg] rounded-[4px] border border-[#E4DEF2] bg-white p-6 shadow-[0_22px_45px_rgba(76,29,149,0.16)] motion-safe:transition-all motion-safe:duration-250 hover:-translate-y-[3px] hover:rotate-[0.5deg] sm:p-8">
          
          {view === "login" && (
            <>
              <span className="absolute -left-4 -top-3 rotate-[-6deg] bg-[rgba(109,40,217,0.85)] px-4 py-1 font-['Caveat'] text-xl font-bold text-white shadow-[0_8px_16px_rgba(76,29,149,0.2)]">
                member login
              </span>

              <p className="mb-2 mt-3 font-['IBM_Plex_Mono'] text-[11px] font-semibold uppercase tracking-[0.2em] text-[#635C77]">
                or the old-fashioned way
              </p>
              <h1 className="font-['Space_Grotesk'] text-4xl font-bold tracking-tight text-[#1B1B1F]">
                Welcome back
              </h1>
              <p className="mt-2 text-sm text-[#635C77]">
                New here?{" "}
                <Link
                  to={role === "founder" ? "/register/founder" : "/register/user"}
                  className="font-semibold text-[#6D28D9] underline-offset-4 hover:underline"
                >
                  Create an account
                </Link>
              </p>

              <form className="mt-7 space-y-5" onSubmit={handleLogin}>
                <div className="space-y-2">
                  <label htmlFor="email" className="font-['IBM_Plex_Mono'] text-xs font-semibold uppercase tracking-[0.14em] text-[#635C77]">
                    Email
                  </label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="name@email.com"
                    className="h-12 rounded-[4px] border-[#E4DEF2] bg-white font-['Inter'] text-[#1B1B1F] placeholder:text-[#635C77]/55 focus-visible:ring-2 focus-visible:ring-[#6D28D9] focus-visible:ring-offset-2"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label htmlFor="password" className="font-['IBM_Plex_Mono'] text-xs font-semibold uppercase tracking-[0.14em] text-[#635C77]">
                      Password
                    </label>
                    <button 
                      type="button" 
                      onClick={() => setView("forgot")}
                      className="font-['IBM_Plex_Mono'] text-[11px] font-semibold uppercase tracking-[0.12em] text-[#6D28D9] transition-colors hover:text-[#4C1D95] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6D28D9]"
                    >
                      Forgot?
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
                <Link
                  to={role === "founder" ? "/register/founder" : "/register/user"}
                  className="font-bold text-violet-600 hover:text-violet-500 underline-offset-4 hover:underline"
                >
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
