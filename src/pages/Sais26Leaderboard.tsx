import { useEffect, useState } from "react";
import { Loader2, Sparkles, Star } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { getPublicTopStartupsApi, type PublicLeaderboardStartup } from "@/lib/api";

const RANK_BADGES = ["🥇", "🥈", "🥉"];

const Sais26Leaderboard = () => {
  const [startups, setStartups] = useState<PublicLeaderboardStartup[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    getPublicTopStartupsApi()
      .then((res) => {
        if (mounted) setStartups(res.startups || []);
      })
      .finally(() => {
        if (mounted) setIsLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-14 max-w-3xl text-center">
        <div className="inline-flex items-center gap-2 mb-4">
          <Sparkles className="w-6 h-6 text-purple-600" />
          <h1 className="text-3xl font-extrabold text-slate-900">SAIS'26 Top Startups</h1>
        </div>
        <p className="text-sm text-slate-600 mb-10 max-w-xl mx-auto">
          The highest-rated startups from the SAIS'26 Bangalore event, scored live by our investor panel.
        </p>

        {isLoading ? (
          <div className="flex flex-col items-center gap-3 py-16">
            <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
            <p className="text-sm text-slate-500">Loading leaderboard…</p>
          </div>
        ) : startups.length === 0 ? (
          <p className="text-sm text-slate-500 py-16">Ratings are still coming in — check back soon.</p>
        ) : (
          <div className="grid grid-cols-1 gap-4 text-left">
            {startups.map((startup) => {
              const isTopThree = startup.rank <= 3;
              return (
                <Card
                  key={startup.rank}
                  className={`border-2 ${
                    startup.rank === 1
                      ? "border-amber-400 bg-gradient-to-r from-amber-50/50 to-white"
                      : startup.rank === 2
                      ? "border-slate-300"
                      : startup.rank === 3
                      ? "border-amber-700/30"
                      : "border-slate-200"
                  }`}
                >
                  <CardContent className="p-5 flex items-center gap-4">
                    <div className="flex flex-col items-center w-14 shrink-0">
                      {isTopThree ? (
                        <span className="text-3xl">{RANK_BADGES[startup.rank - 1]}</span>
                      ) : (
                        <span className="text-lg font-bold text-slate-400">#{startup.rank}</span>
                      )}
                    </div>
                    {startup.logoUrl && (
                      <img src={startup.logoUrl} alt={startup.startupName} className="w-14 h-14 rounded-xl object-cover border-2 border-white shadow" />
                    )}
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-lg font-bold text-slate-900">{startup.startupName}</h3>
                        <Badge variant="outline" className="text-xs">{startup.category}</Badge>
                        <Badge variant="secondary" className="text-xs">{startup.stage}</Badge>
                      </div>
                      <p className="text-sm text-slate-600">{startup.tagline}</p>
                    </div>
                    <div className="flex items-center gap-1 text-amber-500 font-extrabold text-xl shrink-0">
                      <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
                      {startup.averageScore}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Sais26Leaderboard;
