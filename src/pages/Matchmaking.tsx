import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, useAnimation, type PanInfo } from "framer-motion";
import { Heart, Loader2, MapPin, MessageCircle, RotateCcw, Sparkles, Users, X } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { useToast } from "@/hooks/use-toast";
import {
  type MatchCandidate,
  type MatchmakingMatch,
  getMatchmakingDeckApi,
  listMatchmakingMatchesApi,
  swipeMatchmakingApi,
} from "@/lib/api";
import { getAccount, getToken } from "@/lib/session";

const formatCurrency = (value?: number, currency = "INR") => {
  if (value === undefined || value === null) return "";
  if (value >= 10000000) return `${currency} ${(value / 10000000).toFixed(1)}Cr`;
  if (value >= 100000) return `${currency} ${(value / 100000).toFixed(1)}L`;
  return `${currency} ${value.toLocaleString()}`;
};

const CandidateDetails = ({ candidate }: { candidate: MatchCandidate }) => {
  const rd = candidate.roleDetails || {};
  if (candidate.role === "founder") {
    return (
      <div className="space-y-1.5">
        {rd.startupName && <p className="text-sm font-semibold text-slate-800">{rd.startupName}</p>}
        <div className="flex flex-wrap gap-1.5">
          {rd.startupStage && (
            <span className="rounded-full bg-purple-50 border border-purple-200 px-2.5 py-0.5 text-[11px] font-medium text-purple-700 capitalize">
              {String(rd.startupStage).replace("-", " ")}
            </span>
          )}
          {rd.teamSize && (
            <span className="rounded-full bg-slate-50 border border-slate-200 px-2.5 py-0.5 text-[11px] font-medium text-slate-600">
              {rd.teamSize} team
            </span>
          )}
          {(rd.industry || []).slice(0, 3).map((tag: string) => (
            <span key={tag} className="rounded-full bg-violet-50 border border-violet-200 px-2.5 py-0.5 text-[11px] font-medium text-violet-700">
              {tag}
            </span>
          ))}
        </div>
      </div>
    );
  }
  return (
    <div className="space-y-1.5">
      {rd.investmentRange && (
        <p className="text-sm font-semibold text-slate-800">
          Cheque size: {formatCurrency(rd.investmentRange.min, rd.investmentRange.currency)} – {formatCurrency(rd.investmentRange.max, rd.investmentRange.currency)}
        </p>
      )}
      <div className="flex flex-wrap gap-1.5">
        {(rd.focusSector || []).slice(0, 4).map((tag: string) => (
          <span key={tag} className="rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-[11px] font-medium text-emerald-700">
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
};

const SwipeCard = ({
  candidate,
  isTop,
  onSwiped,
}: {
  candidate: MatchCandidate;
  isTop: boolean;
  onSwiped: (action: "like" | "pass") => void;
}) => {
  const controls = useAnimation();

  const handleDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.x > 120) {
      controls.start({ x: 500, opacity: 0, rotate: 20, transition: { duration: 0.3 } }).then(() => onSwiped("like"));
    } else if (info.offset.x < -120) {
      controls.start({ x: -500, opacity: 0, rotate: -20, transition: { duration: 0.3 } }).then(() => onSwiped("pass"));
    } else {
      controls.start({ x: 0, rotate: 0, transition: { type: "spring", stiffness: 300, damping: 24 } });
    }
  };

  return (
    <motion.div
      className="absolute inset-0"
      style={{ zIndex: isTop ? 10 : 5 }}
      drag={isTop ? "x" : false}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.7}
      animate={controls}
      onDragEnd={handleDragEnd}
      initial={false}
    >
      <div className="flex h-full w-full flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl">
        <div className="relative h-56 shrink-0 bg-gradient-to-br from-violet-100 to-indigo-100">
          {candidate.profilePhoto ? (
            <img src={candidate.profilePhoto} alt={candidate.fullName} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-6xl font-bold text-violet-300">
              {candidate.fullName.charAt(0).toUpperCase()}
            </div>
          )}
          <div className="absolute top-3 right-3 inline-flex items-center gap-1 rounded-full bg-white/95 px-3 py-1 text-xs font-bold text-violet-700 shadow-sm">
            <Sparkles className="w-3.5 h-3.5" /> {candidate.matchScore}% Match
          </div>
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
            <p className="text-lg font-bold text-white">{candidate.fullName}</p>
            {candidate.city && (
              <p className="flex items-center gap-1 text-xs text-white/90">
                <MapPin className="w-3 h-3" /> {candidate.city}
              </p>
            )}
          </div>
        </div>

        <div className="flex-1 space-y-3 p-4">
          {candidate.headline && <p className="text-sm italic text-slate-500 line-clamp-2">"{candidate.headline}"</p>}
          <CandidateDetails candidate={candidate} />
        </div>
      </div>
    </motion.div>
  );
};

const MatchModal = ({ match, onClose }: { match: { user: MatchmakingMatch["user"] }; onClose: () => void }) => {
  const navigate = useNavigate();
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={onClose}>
      <div
        className="relative w-full max-w-sm rounded-3xl bg-white p-8 text-center shadow-2xl animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-pink-500 text-white shadow-lg">
          <Heart className="w-8 h-8 fill-white" />
        </div>
        <h2 className="text-2xl font-extrabold text-slate-900">It's a Match!</h2>
        <p className="mt-1 text-sm text-slate-500">You and {match.user.fullName} are both interested. Start the conversation.</p>

        <div className="mt-5 flex items-center justify-center gap-3">
          {match.user.profilePhoto ? (
            <img src={match.user.profilePhoto} alt={match.user.fullName} className="h-16 w-16 rounded-full object-cover border-4 border-violet-100" />
          ) : (
            <div className="h-16 w-16 rounded-full bg-violet-100 text-violet-700 flex items-center justify-center text-xl font-bold">
              {match.user.fullName.charAt(0).toUpperCase()}
            </div>
          )}
        </div>

        <div className="mt-6 flex flex-col gap-2">
          <Button onClick={() => navigate(`/community/messages/${match.user.id}`)} className="w-full gap-2 bg-violet-600 hover:bg-violet-700">
            <MessageCircle className="w-4 h-4" /> Send a Message
          </Button>
          <Button variant="outline" onClick={onClose} className="w-full">
            Keep Swiping
          </Button>
        </div>
      </div>
    </div>
  );
};

const MatchesList = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const token = getToken();
  const [matches, setMatches] = useState<MatchmakingMatch[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    listMatchmakingMatchesApi(token)
      .then((res) => setMatches(res.matches))
      .catch(() => toast({ variant: "destructive", title: "Couldn't load your matches." }))
      .finally(() => setIsLoading(false));
  }, [token, toast]);

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="w-8 h-8 animate-spin text-violet-600" />
      </div>
    );
  }

  if (matches.length === 0) {
    return <p className="text-sm text-slate-500 text-center py-16">No matches yet — keep swiping in Discover to find your fit.</p>;
  }

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {matches.map((m) => (
        <div key={m.id} className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          {m.user.profilePhoto ? (
            <img src={m.user.profilePhoto} alt={m.user.fullName} className="h-12 w-12 rounded-full object-cover shrink-0" />
          ) : (
            <div className="h-12 w-12 rounded-full bg-violet-100 text-violet-700 flex items-center justify-center font-bold shrink-0">
              {m.user.fullName.charAt(0).toUpperCase()}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold text-slate-900 truncate">{m.user.fullName}</p>
            <p className="text-xs capitalize text-slate-500">{m.user.role}</p>
          </div>
          <Button size="icon" variant="outline" onClick={() => navigate(`/community/messages/${m.user.id}`)} className="shrink-0">
            <MessageCircle className="w-4 h-4" />
          </Button>
        </div>
      ))}
    </div>
  );
};

const Matchmaking = () => {
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const token = useMemo(() => getToken(), []);
  const account = getAccount();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [tab, setTab] = useState<"discover" | "matches">("discover");
  const [deck, setDeck] = useState<MatchCandidate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeMatch, setActiveMatch] = useState<{ user: MatchmakingMatch["user"] } | null>(null);

  const targetLabel = account?.role === "founder" ? "investors" : "founders";

  const loadDeck = useCallback(() => {
    if (!token) return;
    setIsLoading(true);
    getMatchmakingDeckApi(token, 15)
      .then((res) => setDeck(res.deck))
      .catch(() => toast({ variant: "destructive", title: "Couldn't load matches." }))
      .finally(() => setIsLoading(false));
  }, [token, toast]);

  useEffect(() => {
    loadDeck();
  }, [loadDeck]);

  const handleSwiped = async (candidateId: string, action: "like" | "pass") => {
    setDeck((prev) => prev.filter((c) => c.id !== candidateId));
    if (!token) return;
    try {
      const res = await swipeMatchmakingApi(token, candidateId, action);
      if (res.matched && res.match) {
        setActiveMatch({ user: res.match.user });
      }
    } catch (error) {
      toast({ variant: "destructive", title: "Couldn't record your swipe", description: error instanceof Error ? error.message : "Try again." });
    }
  };

  if (!token) return null;

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar isMobile={isMobile} mobileOpen={mobileSidebarOpen} onMobileOpenChange={setMobileSidebarOpen} />

      <div className="lg:ml-64">
        <Topbar
          userRole={account?.role || "Member"}
          userName={account?.fullName || "Member"}
          referralCode={account?.referralCode || "N/A"}
          isMobile={isMobile}
          onMenuClick={() => setMobileSidebarOpen(true)}
        />

        <main className="px-4 py-6 sm:px-6 lg:px-8 max-w-2xl mx-auto">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.22em] text-violet-700">Premium</p>
              <h1 className="mt-1 text-2xl font-bold text-slate-900">Matchmaking</h1>
              <p className="mt-1 text-sm text-slate-500">Swipe through {targetLabel} ranked by fit. Mutual interest unlocks a chat.</p>
            </div>
            <Users className="w-8 h-8 text-violet-200 shrink-0" />
          </div>

          <div className="mb-6 inline-flex rounded-xl border border-slate-200 bg-white p-1">
            <button
              onClick={() => setTab("discover")}
              className={`rounded-lg px-4 py-1.5 text-sm font-semibold transition-colors ${tab === "discover" ? "bg-violet-600 text-white" : "text-slate-600 hover:bg-slate-100"}`}
            >
              Discover
            </button>
            <button
              onClick={() => setTab("matches")}
              className={`rounded-lg px-4 py-1.5 text-sm font-semibold transition-colors ${tab === "matches" ? "bg-violet-600 text-white" : "text-slate-600 hover:bg-slate-100"}`}
            >
              Matches
            </button>
          </div>

          {tab === "matches" ? (
            <MatchesList />
          ) : isLoading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-violet-600" />
            </div>
          ) : deck.length === 0 ? (
            <div className="flex flex-col items-center gap-4 rounded-3xl border border-dashed border-slate-300 bg-white py-16 text-center">
              <p className="text-sm text-slate-500">No more {targetLabel} to show right now.</p>
              <Button variant="outline" onClick={loadDeck} className="gap-2">
                <RotateCcw className="w-4 h-4" /> Refresh
              </Button>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <div className="relative h-[480px] w-full max-w-sm">
                {deck.slice(0, 3).map((candidate, i) => (
                  <SwipeCard
                    key={candidate.id}
                    candidate={candidate}
                    isTop={i === 0}
                    onSwiped={(action) => handleSwiped(candidate.id, action)}
                  />
                ))}
              </div>

              <div className="mt-6 flex items-center gap-6">
                <button
                  onClick={() => deck[0] && handleSwiped(deck[0].id, "pass")}
                  className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-slate-200 bg-white text-slate-400 shadow-md transition-transform hover:scale-105 hover:border-red-300 hover:text-red-500"
                  aria-label="Pass"
                >
                  <X className="w-6 h-6" />
                </button>
                <button
                  onClick={() => deck[0] && handleSwiped(deck[0].id, "like")}
                  className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-pink-500 text-white shadow-lg transition-transform hover:scale-105"
                  aria-label="Like"
                >
                  <Heart className="w-7 h-7 fill-white" />
                </button>
              </div>
            </div>
          )}
        </main>
      </div>

      {activeMatch && <MatchModal match={activeMatch} onClose={() => setActiveMatch(null)} />}
    </div>
  );
};

export default Matchmaking;
