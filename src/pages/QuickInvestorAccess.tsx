import { type FormEvent, useState } from "react";
import { Building2, CheckCircle2, Loader2, Sparkles, User } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { quickAccessInvestorInviteApi } from "@/lib/api";
import { setSession } from "@/lib/session";
import { useToast } from "@/hooks/use-toast";

const FieldLabel = ({ children }: { children: React.ReactNode }) => (
  <label className="text-xs font-semibold text-slate-600 mb-1.5 block">{children}</label>
);

const QuickInvestorAccess = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { code } = useParams<{ code: string }>();
  const [fullName, setFullName] = useState("");
  const [firmName, setFirmName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!code || !fullName.trim()) return;

    setIsSubmitting(true);
    try {
      const response = await quickAccessInvestorInviteApi(code, {
        fullName: fullName.trim(),
        firmName: firmName.trim() || undefined,
      });
      setSession(response.token, response.account);
      toast({ title: "You're in!", description: "Welcome to the SAIS'26 Room." });
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
        <div className="w-full max-w-sm rounded-3xl border border-slate-100 bg-white p-6 sm:p-8 shadow-[0_20px_60px_-15px_rgba(76,29,149,0.25)]">
          <div className="mb-6 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-50 text-violet-600 border border-violet-100">
              <Sparkles className="h-5 w-5" />
            </div>
            <h1 className="text-xl font-bold text-slate-900">Enter the SAIS'26 Room</h1>
            <p className="mt-1.5 text-sm text-slate-500">
              Just your name — you'll be browsing and rating startups in a few seconds.
            </p>
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
              <FieldLabel>Firm / Fund (optional)</FieldLabel>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input className="pl-9" placeholder="Apex Ventures" value={firmName} onChange={(e) => setFirmName(e.target.value)} />
              </div>
            </div>

            <Button
              type="submit"
              disabled={isSubmitting || !fullName.trim()}
              className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white font-semibold py-6 text-sm shadow-lg shadow-violet-500/20"
            >
              {isSubmitting ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Getting you in…</>
              ) : (
                <><CheckCircle2 className="w-4 h-4 mr-2" /> Enter SAIS'26 Room</>
              )}
            </Button>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default QuickInvestorAccess;
