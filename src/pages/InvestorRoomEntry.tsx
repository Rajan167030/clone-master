import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Loader2, ShieldAlert, Sparkles } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import Sais26Room from "@/components/Sais26Room";
import { getInvestorAccessDashboardApi, type ActivityInvestorProfile } from "@/lib/api";

const InvestorRoomEntry = () => {
  const { accessToken } = useParams<{ accessToken: string }>();
  const [status, setStatus] = useState<"loading" | "valid" | "invalid">("loading");
  const [investor, setInvestor] = useState<ActivityInvestorProfile | null>(null);

  useEffect(() => {
    if (!accessToken) {
      setStatus("invalid");
      return;
    }

    let mounted = true;
    getInvestorAccessDashboardApi(accessToken)
      .then((res) => {
        if (!mounted) return;
        setInvestor({ ...res.investor, id: (res.investor as any)._id || (res.investor as any).id });
        setStatus("valid");
      })
      .catch(() => {
        if (!mounted) return;
        setStatus("invalid");
      });

    return () => {
      mounted = false;
    };
  }, [accessToken]);

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
        <p className="text-sm text-slate-500">Loading your dashboard…</p>
      </div>
    );
  }

  if (status === "invalid" || !investor) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Navbar />
        <main className="flex-1 flex flex-col items-center justify-center gap-4 px-4 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-red-600">
            <ShieldAlert className="h-8 w-8" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard link is invalid</h1>
          <p className="max-w-md text-sm text-slate-600">
            This link doesn't match any registered investor profile. If you registered for the Bangalore event, check the email we sent you for the correct link.
          </p>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-10 max-w-5xl">
        <div className="mb-6 flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-purple-600" />
          <h1 className="text-2xl font-bold text-slate-900">Your SAIS'26 Dashboard</h1>
        </div>

        <Card className="mb-8 border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-white">
          <CardContent className="p-6 flex flex-col sm:flex-row items-start sm:items-center gap-5">
            <img src={investor.photoUrl} alt={investor.fullName} className="w-16 h-16 rounded-full object-cover border-2 border-white shadow" />
            <div className="flex-1">
              <h2 className="text-xl font-bold text-slate-900">{investor.fullName}</h2>
              <p className="text-sm text-slate-600">{investor.designation} · {investor.firmName}</p>
              {investor.sectors?.length > 0 && (
                <p className="text-xs text-slate-500 mt-1">Focus: {investor.sectors.join(", ")}</p>
              )}
            </div>
          </CardContent>
        </Card>

        <h2 className="text-lg font-bold text-slate-900 mb-4">SAIS'26 Room</h2>
        <p className="text-sm text-slate-600 mb-4 max-w-2xl">
          Browse startups registered for the Bangalore event and view their pitch decks and profiles.
        </p>
        <Sais26Room viewerRole="investor" highlightStartupId={undefined} />
      </main>
      <Footer />
    </div>
  );
};

export default InvestorRoomEntry;
