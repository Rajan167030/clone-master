import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Loader2, ShieldAlert, Sparkles, Star, TrendingUp } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import Sais26Room from "@/components/Sais26Room";
import { getFounderAccessDashboardApi, type ActivityStartupItem } from "@/lib/api";

const FounderRoomEntry = () => {
  const { accessToken } = useParams<{ accessToken: string }>();
  const [status, setStatus] = useState<"loading" | "valid" | "invalid">("loading");
  const [startup, setStartup] = useState<ActivityStartupItem | null>(null);
  const [rank, setRank] = useState<number | null>(null);

  useEffect(() => {
    if (!accessToken) {
      setStatus("invalid");
      return;
    }

    let mounted = true;
    getFounderAccessDashboardApi(accessToken)
      .then((res) => {
        if (!mounted) return;
        setStartup({ ...res.startup, id: (res.startup as any)._id || (res.startup as any).id });
        setRank(res.rank);
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

  if (status === "invalid" || !startup) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Navbar />
        <main className="flex-1 flex flex-col items-center justify-center gap-4 px-4 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-red-600">
            <ShieldAlert className="h-8 w-8" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard link is invalid</h1>
          <p className="max-w-md text-sm text-slate-600">
            This link doesn't match any registered startup. If you registered for the Bangalore event, check the email we sent you for the correct link.
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
            <img src={startup.logoUrl} alt={startup.startupName} className="w-16 h-16 rounded-xl object-cover border-2 border-white shadow" />
            <div className="flex-1">
              <h2 className="text-xl font-bold text-slate-900">{startup.startupName}</h2>
              <p className="text-sm text-slate-600">{startup.tagline}</p>
              <p className="text-xs text-slate-500 mt-1">Founder: {startup.founderName}</p>
            </div>
            <div className="flex gap-6">
              <div className="text-center">
                <div className="flex items-center gap-1 text-amber-500 font-extrabold text-xl">
                  <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
                  {startup.averageScore > 0 ? startup.averageScore : "N/A"}
                </div>
                <p className="text-[11px] text-slate-500">{startup.totalRatingsCount} ratings</p>
              </div>
              <div className="text-center">
                <div className="flex items-center gap-1 text-purple-700 font-extrabold text-xl">
                  <TrendingUp className="w-5 h-5" />
                  {rank ? `#${rank}` : "—"}
                </div>
                <p className="text-[11px] text-slate-500">live rank</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <h2 className="text-lg font-bold text-slate-900 mb-4">SAIS'26 Room</h2>
        <p className="text-sm text-slate-600 mb-4 max-w-2xl">
          See which investors have joined the Bangalore event and view their profiles.
        </p>
        <Sais26Room viewerRole="founder" highlightStartupId={startup.id} />
      </main>
      <Footer />
    </div>
  );
};

export default FounderRoomEntry;
