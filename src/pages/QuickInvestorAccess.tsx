import { type FormEvent, useState } from "react";
import { Building2, CheckCircle2, Loader2, Mail, Sparkles, Star, User, Users } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { quickAccessInvestorInviteApi } from "@/lib/api";
import { setSession } from "@/lib/session";
import { useToast } from "@/hooks/use-toast";

const PERKS = [
  { icon: Users, text: "See every founder & investor attending SAIS'26" },
  { icon: Star, text: "Preview pitch decks and rate top startups" },
  { icon: Sparkles, text: "No password to remember — just your name gets you in" },
];

const FieldLabel = ({ children }: { children: React.ReactNode }) => (
  <label className="text-xs font-semibold text-slate-600 mb-1.5 block">{children}</label>
);

const QuickInvestorAccess = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { code } = useParams<{ code: string }>();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [firmName, setFirmName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!code || !fullName.trim() || !email.trim()) return;

    setIsSubmitting(true);
    try {
      const response = await quickAccessInvestorInviteApi(code, {
        fullName: fullName.trim(),
        email: email.trim(),
        firmName: firmName.trim() || undefined,
      });
      setSession(response.token, response.account);
      toast({ title: "You're in!", description: "Welcome to the SAIS'26 Room. We've also emailed you a login for next time." });
      navigate("/sais26/room");
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Couldn't get you in",
        description: error instanceof Error ? error.message : "This access link may be invalid or revoked.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

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
                <Sparkles className="w-3.5 h-3.5" /> Quick Access
              </div>
              <h1 className="mt-5 text-3xl font-extrabold leading-tight">
                Step into <span className="text-amber-300">SAIS'26</span>
              </h1>
              <p className="mt-3 text-sm text-violet-100 leading-relaxed">
                Shared by the Founders Connect team — enter your name and you're straight into the SAIS'26 investor room.
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
              This link is reusable — anyone the team shares it with can use it the same way.
            </p>
          </div>

          {/* Right form panel */}
          <div className="bg-white p-6 sm:p-10 flex flex-col justify-center">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-slate-900">Enter the SAIS'26 Room</h2>
              <p className="text-sm text-slate-500 mt-1">Just your name — takes a few seconds.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <FieldLabel>Your Name *</FieldLabel>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input className="pl-9" placeholder="Jane Doe" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
                </div>
              </div>

              <div>
                <FieldLabel>Email *</FieldLabel>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input className="pl-9" type="email" placeholder="jane@fund.vc" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
              </div>

              <div>
                <FieldLabel>Firm / Fund (optional)</FieldLabel>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input className="pl-9" placeholder="Apex Ventures" value={firmName} onChange={(e) => setFirmName(e.target.value)} />
                </div>
              </div>

              <Button
                type="submit"
                disabled={isSubmitting || !fullName.trim() || !email.trim()}
                className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white font-semibold py-6 text-sm shadow-lg shadow-violet-500/20"
              >
                {isSubmitting ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Getting you in…</>
                ) : (
                  <><CheckCircle2 className="w-4 h-4 mr-2" /> Enter SAIS'26 Room</>
                )}
              </Button>

              <p className="text-[11px] text-slate-400 text-center pt-1">
                We'll also email you a login so you can get back in from any device.
              </p>
            </form>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default QuickInvestorAccess;
