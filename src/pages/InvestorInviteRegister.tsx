import { type FormEvent, useEffect, useState } from "react";
import {
  Building2,
  CheckCircle2,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  MapPin,
  Phone,
  ShieldAlert,
  Sparkles,
  Star,
  Tag,
  User,
  Users,
} from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { registerInvestorViaInviteApi, validateInviteByCodeApi } from "@/lib/api";
import { setSession } from "@/lib/session";
import { useToast } from "@/hooks/use-toast";

const SECTORS = [
  "AI & DeepTech",
  "FinTech",
  "HealthTech & AI",
  "CleanTech & EV",
  "SaaS & B2B",
  "EdTech",
  "Consumer & E-Commerce",
  "Other",
];

const PERKS = [
  { icon: Users, text: "See every founder & investor attending SAIS'26" },
  { icon: Star, text: "Preview pitch decks and rate top startups" },
  { icon: Sparkles, text: "Get your own professional investor ID card & QR" },
];

const FieldLabel = ({ children }: { children: React.ReactNode }) => (
  <label className="text-xs font-semibold text-slate-600 mb-1.5 block">{children}</label>
);

const InvestorInviteRegister = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { code } = useParams<{ code: string }>();
  const [inviteStatus, setInviteStatus] = useState<"checking" | "valid" | "invalid">("checking");
  const [inviteError, setInviteError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [firmName, setFirmName] = useState("");
  const [sector, setSector] = useState("");

  useEffect(() => {
    if (!code) {
      setInviteStatus("invalid");
      setInviteError("This registration link is missing an invite code.");
      return;
    }

    let mounted = true;
    validateInviteByCodeApi(code)
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
  }, [code]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!code) return;

    if (!fullName || !email || !password || !firmName || !sector) {
      toast({ variant: "destructive", title: "Missing details", description: "Please fill in all required fields." });
      return;
    }
    if (password.length < 8) {
      toast({ variant: "destructive", title: "Weak password", description: "Password must be at least 8 characters." });
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await registerInvestorViaInviteApi(code, {
        fullName,
        email,
        password,
        phone,
        city,
        firmName,
        sector,
      });
      setSession(response.token, response.account);
      toast({ title: "Welcome to SAIS'26!", description: "Your investor account is ready." });
      navigate("/dashboard");
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Registration failed",
        description: error instanceof Error ? error.message : "Something went wrong. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (inviteStatus === "checking") {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <main className="flex min-h-[70vh] flex-col items-center justify-center gap-3 px-4 text-center">
          <Loader2 className="h-8 w-8 animate-spin text-violet-600" />
          <p className="text-sm text-slate-500">Checking your invite link…</p>
        </main>
        <Footer />
      </div>
    );
  }

  if (inviteStatus === "invalid") {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <main className="flex min-h-[70vh] flex-col items-center justify-center gap-4 px-4 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-red-600">
            <ShieldAlert className="h-8 w-8" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">This invite link isn't valid</h1>
          <p className="max-w-md text-sm text-slate-600">
            {inviteError || "This registration link is invalid, expired, or has already been used."} Each SAIS'26 investor invite works once — please contact the Founders Connect team for a fresh link.
          </p>
          <Button asChild className="bg-violet-600 hover:bg-violet-700">
            <Link to="/">Back to Home</Link>
          </Button>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />
      <main className="flex-1 flex items-center justify-center px-4 py-10 sm:py-14">
        <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-[1fr_1.3fr] rounded-3xl overflow-hidden shadow-[0_20px_60px_-15px_rgba(76,29,149,0.35)] border border-slate-100">
          {/* Left branded panel */}
          <div className="hidden lg:flex flex-col justify-between bg-gradient-to-br from-violet-700 via-purple-800 to-indigo-900 text-white p-10 relative overflow-hidden">
            <div className="absolute -top-16 -right-16 h-56 w-56 rounded-full bg-white/10 blur-2xl" />
            <div className="absolute -bottom-20 -left-10 h-56 w-56 rounded-full bg-fuchsia-400/10 blur-2xl" />

            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/20 px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" /> Private Invite
              </div>
              <h1 className="mt-5 text-3xl font-extrabold leading-tight">
                You're invited to <span className="text-amber-300">SAIS'26</span>
              </h1>
              <p className="mt-3 text-sm text-violet-100 leading-relaxed">
                Complete your investor profile to unlock your personal dashboard, ID card, and the SAIS'26 room.
              </p>
            </div>

            <div className="relative z-10 space-y-4 mt-8">
              {PERKS.map((perk) => (
                <div key={perk.text} className="flex items-start gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/10 border border-white/20">
                    <perk.icon className="w-4 h-4 text-amber-300" />
                  </div>
                  <p className="text-sm text-violet-50 pt-1">{perk.text}</p>
                </div>
              ))}
            </div>

            <p className="relative z-10 text-[11px] text-violet-200/80 mt-8">
              This link is unique to you and can only be used once.
            </p>
          </div>

          {/* Right form panel */}
          <div className="bg-white p-6 sm:p-10">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-slate-900">Complete your investor profile</h2>
              <p className="text-sm text-slate-500 mt-1">Takes less than a minute.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <FieldLabel>Full Name *</FieldLabel>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input className="pl-9" placeholder="Jane Doe" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <FieldLabel>Email *</FieldLabel>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input className="pl-9" type="email" placeholder="jane@fund.vc" value={email} onChange={(e) => setEmail(e.target.value)} required />
                  </div>
                </div>
                <div>
                  <FieldLabel>Phone</FieldLabel>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input className="pl-9" placeholder="+91 98765 43210" value={phone} onChange={(e) => setPhone(e.target.value)} />
                  </div>
                </div>
              </div>

              <div>
                <FieldLabel>Password *</FieldLabel>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    className="pl-9 pr-9"
                    type={showPassword ? "text" : "password"}
                    placeholder="At least 8 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={8}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <FieldLabel>Firm / Fund Name *</FieldLabel>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input className="pl-9" placeholder="Apex Ventures" value={firmName} onChange={(e) => setFirmName(e.target.value)} required />
                  </div>
                </div>
                <div>
                  <FieldLabel>Primary Sector *</FieldLabel>
                  <Select value={sector} onValueChange={setSector} required>
                    <SelectTrigger className="[&>span]:flex [&>span]:items-center [&>span]:gap-2">
                      <Tag className="w-4 h-4 text-slate-400" />
                      <SelectValue placeholder="Select a sector" />
                    </SelectTrigger>
                    <SelectContent>
                      {SECTORS.map((s) => (
                        <SelectItem key={s} value={s}>{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <FieldLabel>City</FieldLabel>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input className="pl-9" placeholder="Bengaluru" value={city} onChange={(e) => setCity(e.target.value)} />
                </div>
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white font-semibold py-6 text-sm shadow-lg shadow-violet-500/20"
              >
                {isSubmitting ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Creating your account…</>
                ) : (
                  <><CheckCircle2 className="w-4 h-4 mr-2" /> Create Investor Account</>
                )}
              </Button>

              <p className="text-[11px] text-slate-400 text-center pt-1">
                Your details are confidential and used only for SAIS'26 event purposes.
              </p>
            </form>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default InvestorInviteRegister;
