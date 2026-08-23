import { type FormEvent, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Building2, Eye, FileText, Lightbulb, Mic2, Rocket, ShieldCheck, Star, TrendingUp, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import PitchDeckViewerModal from "@/components/PitchDeckViewerModal";
import StartupProfileModal from "@/components/StartupProfileModal";
import InvestorProfileModal from "@/components/InvestorProfileModal";
import { getAccount } from "@/lib/session";
import {
  type ActivityInvestorProfile,
  type ActivityStartupItem,
  type RatingScores,
  getBangaloreInvestorsApi,
  getBangaloreStartupsApi,
  submitRoomRatingApi,
} from "@/lib/api";

const RANK_BADGES = ["🥇 #1 Rank", "🥈 #2 Rank", "🥉 #3 Rank"];

const RATING_CRITERIA = [
  { key: "innovation", label: "Innovation & Product Tech", icon: Lightbulb, color: "#7c3aed" },
  { key: "market", label: "Market Opportunity & Scalability", icon: TrendingUp, color: "#2563eb" },
  { key: "traction", label: "Business Model & Traction", icon: Rocket, color: "#059669" },
  { key: "team", label: "Team & Execution Capability", icon: Users, color: "#d97706" },
  { key: "pitch", label: "Pitch & Presentation Quality", icon: Mic2, color: "#e11d48" },
] as const;

const DEFAULT_SCORES: RatingScores = { innovation: 0, market: 0, traction: 0, team: 0, pitch: 0 };
const starLabels = ["Poor", "Average", "Good", "Very Good", "Excellent"];

// Score-meter color ramps from rose (low) through amber to emerald (high) as the total climbs.
const scoreMeterColor = (percent: number) => {
  if (percent < 40) return "#e11d48";
  if (percent < 70) return "#d97706";
  return "#059669";
};

type Sais26RoomProps = {
  viewerRole: "investor" | "founder" | "admin";
  authToken?: string;
  highlightStartupId?: string;
};

const Sais26Room = ({ viewerRole, authToken, highlightStartupId }: Sais26RoomProps) => {
  const { toast } = useToast();
  const currentAccount = useMemo(() => getAccount(), []);
  const [startups, setStartups] = useState<ActivityStartupItem[]>([]);
  const [investors, setInvestors] = useState<ActivityInvestorProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewDeckStartup, setViewDeckStartup] = useState<ActivityStartupItem | null>(null);
  const [profileStartup, setProfileStartup] = useState<ActivityStartupItem | null>(null);
  const [profileInvestor, setProfileInvestor] = useState<ActivityInvestorProfile | null>(null);
  const [ratingTargetStartup, setRatingTargetStartup] = useState<ActivityStartupItem | null>(null);
  const [ratingScores, setRatingScores] = useState<RatingScores>(DEFAULT_SCORES);
  const [ratingComment, setRatingComment] = useState("");
  const [isSubmittingRating, setIsSubmittingRating] = useState(false);
  const [isUpdatingExisting, setIsUpdatingExisting] = useState(false);
  const [hoverPreview, setHoverPreview] = useState<{ key: string; star: number } | null>(null);

  const load = async () => {
    const [freshStartups, freshInvestors] = await Promise.all([
      getBangaloreStartupsApi(),
      getBangaloreInvestorsApi(),
    ]);
    setStartups(
      [...freshStartups].sort((a, b) => b.averageScore - a.averageScore || b.totalRatingsCount - a.totalRatingsCount),
    );
    setInvestors(freshInvestors);
    setIsLoading(false);
  };

  useEffect(() => {
    void load();
    const interval = setInterval(() => void load(), 8000);
    return () => clearInterval(interval);
  }, []);

  const openRatingDialog = (startup: ActivityStartupItem) => {
    const myExisting = currentAccount?.fullName
      ? startup.ratings?.find((r) => r.investorName === currentAccount.fullName)
      : undefined;

    if (myExisting) {
      setRatingScores(myExisting.scores);
      setRatingComment(myExisting.comment || "");
      setIsUpdatingExisting(true);
    } else {
      setRatingScores(DEFAULT_SCORES);
      setRatingComment("");
      setIsUpdatingExisting(false);
    }
    setHoverPreview(null);
    setRatingTargetStartup(startup);
  };

  const handleRatingSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!ratingTargetStartup || !authToken) return;

    const hasUnratedCriteria = Object.values(ratingScores).some((score) => score < 1);
    if (hasUnratedCriteria) {
      toast({
        variant: "destructive",
        title: "Rate every criterion",
        description: "Please give at least 1 star on all 5 criteria before submitting.",
      });
      return;
    }

    setIsSubmittingRating(true);
    try {
      await submitRoomRatingApi(authToken, {
        startupId: (ratingTargetStartup as any)._id || ratingTargetStartup.id,
        scores: ratingScores,
        comment: ratingComment,
      });
      toast({
        title: isUpdatingExisting ? "Rating updated!" : "Rating submitted!",
        description: `Your evaluation for ${ratingTargetStartup.startupName} is saved.`,
      });
      setRatingTargetStartup(null);
      setRatingComment("");
      await load();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Could not submit rating",
        description: error instanceof Error ? error.message : "Something went wrong.",
      });
    } finally {
      setIsSubmittingRating(false);
    }
  };

  const totalScore =
    ratingScores.innovation + ratingScores.market + ratingScores.traction + ratingScores.team + ratingScores.pitch;

  return (
    <div className="space-y-6">
      {viewerRole === "admin" && (
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 bg-slate-100 border border-slate-200 rounded-lg px-3 py-2 w-fit">
          <ShieldCheck className="w-4 h-4 text-slate-500" />
          Admin oversight view — read-only, not visible to investors or founders.
        </div>
      )}

      <Tabs defaultValue="startups" className="w-full">
        <TabsList>
          <TabsTrigger value="startups">
            <Building2 className="w-4 h-4 mr-1.5" /> Startups ({startups.length})
          </TabsTrigger>
          <TabsTrigger value="investors">
            <Users className="w-4 h-4 mr-1.5" /> Investors ({investors.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="startups" className="space-y-4 pt-4">
          {isLoading && startups.length === 0 ? (
            <p className="text-sm text-slate-500 text-center py-10">Loading startups…</p>
          ) : startups.length === 0 ? (
            <p className="text-sm text-slate-500 text-center py-10">No startups registered yet.</p>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {startups.map((startup, index) => {
                const startupId = (startup as any)._id || startup.id;
                const isTopThree = index < 3;
                const isMine = highlightStartupId && startupId === highlightStartupId;
                const alreadyRated = Boolean(
                  currentAccount?.fullName && startup.ratings?.some((r) => r.investorName === currentAccount.fullName),
                );

                return (
                  <Card
                    key={startupId}
                    className={`border-2 ${isMine ? "border-emerald-400 shadow-lg" : "border-slate-200"}`}
                  >
                    <CardContent className="p-5">
                      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                        <div className="flex items-start gap-3">
                          <div className="relative flex-shrink-0">
                            <img
                              src={startup.logoUrl}
                              alt={startup.startupName}
                              className="w-14 h-14 rounded-xl object-cover border-2 border-slate-200"
                            />
                            <Badge className="absolute -top-3 -left-3 text-xs bg-slate-800 text-white">
                              {isTopThree ? RANK_BADGES[index] : `#${index + 1}`}
                            </Badge>
                          </div>
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="text-lg font-bold text-slate-900">{startup.startupName}</h3>
                              {isMine && <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 text-xs">Your Startup</Badge>}
                              {alreadyRated && viewerRole === "investor" && (
                                <Badge className="bg-indigo-100 text-indigo-700 border-indigo-200 text-xs">You Rated This</Badge>
                              )}
                              <Badge variant="outline" className="text-xs">{startup.category}</Badge>
                              <Badge variant="secondary" className="text-xs">{startup.stage}</Badge>
                            </div>
                            <p className="text-sm text-slate-600">{startup.tagline}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <div className="flex items-center gap-1 text-amber-500 font-bold">
                            <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                            {startup.averageScore > 0 ? startup.averageScore : "N/A"}
                          </div>
                          <span className="text-xs text-slate-500">({startup.totalRatingsCount})</span>
                        </div>

                        <div className="flex flex-wrap gap-2 w-full md:w-auto">
                          <Button variant="outline" size="sm" onClick={() => setProfileStartup(startup)} className="flex-1 md:flex-initial text-xs">
                            <Eye className="w-4 h-4 mr-1.5" /> View Profile
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => setViewDeckStartup(startup)} className="flex-1 md:flex-initial text-xs">
                            <FileText className="w-4 h-4 mr-1.5" /> Pitch Deck
                          </Button>
                          {viewerRole === "investor" && authToken && (
                            <Button
                              size="sm"
                              onClick={() => openRatingDialog(startup)}
                              className="flex-1 md:flex-initial text-xs bg-indigo-600 hover:bg-indigo-700 text-white"
                            >
                              <Star className="w-4 h-4 mr-1.5 fill-white" /> {alreadyRated ? "Update Rating" : "Rate"}
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="investors" className="space-y-4 pt-4">
          {investors.length === 0 ? (
            <p className="text-sm text-slate-500 text-center py-10">No investors have joined yet.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {investors.map((investor) => (
                <Card
                  key={(investor as any)._id || investor.id}
                  onClick={() => setProfileInvestor(investor)}
                  className="border border-slate-200 hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer"
                >
                  <CardContent className="p-5 flex items-start gap-3">
                    <img
                      src={investor.photoUrl}
                      alt={investor.fullName}
                      className="w-12 h-12 rounded-full object-cover border"
                    />
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">{investor.fullName}</h4>
                      <p className="text-xs text-slate-600">{investor.designation} · {investor.firmName}</p>
                      {investor.sectors?.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {investor.sectors.slice(0, 3).map((sector) => (
                            <Badge key={sector} variant="outline" className="text-[10px]">{sector}</Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <PitchDeckViewerModal startup={viewDeckStartup} onClose={() => setViewDeckStartup(null)} />
      <StartupProfileModal startup={profileStartup} onClose={() => setProfileStartup(null)} />
      <InvestorProfileModal investor={profileInvestor} onClose={() => setProfileInvestor(null)} />

      {ratingTargetStartup && (
        <Dialog open={!!ratingTargetStartup} onOpenChange={() => setRatingTargetStartup(null)}>
          <DialogContent className="w-[95vw] sm:max-w-md max-h-[90vh] overflow-y-auto bg-white p-4 sm:p-6 rounded-2xl">
            <DialogHeader>
              <DialogTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Star className="w-5 h-5 text-amber-500 fill-amber-400" />
                {isUpdatingExisting ? "Update Rating" : "Rate"}: {ratingTargetStartup.startupName}
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-600">
                {isUpdatingExisting
                  ? "You've already rated this startup — adjust and resubmit to update it."
                  : "Score across the 5 evaluation criteria."}
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleRatingSubmit} className="space-y-3 pt-2">
              <div className="flex items-center justify-between px-0.5">
                <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                  {Object.values(ratingScores).filter((v) => v > 0).length} / 5 criteria rated
                </span>
                <div className="flex gap-1">
                  {RATING_CRITERIA.map((c) => (
                    <span
                      key={c.key}
                      className="h-1.5 w-5 rounded-full transition-colors duration-300"
                      style={{ background: ratingScores[c.key] > 0 ? c.color : "#e2e8f0" }}
                    />
                  ))}
                </div>
              </div>

              {RATING_CRITERIA.map((criteria) => {
                const currentVal = ratingScores[criteria.key];
                const previewVal = hoverPreview?.key === criteria.key ? hoverPreview.star : currentVal;
                const Icon = criteria.icon;
                return (
                  <div
                    key={criteria.key}
                    className="relative overflow-hidden rounded-xl border border-slate-200 bg-slate-50 p-3 pl-4 space-y-2 transition-shadow hover:shadow-sm"
                  >
                    <span className="absolute left-0 top-0 h-full w-1" style={{ background: criteria.color }} />
                    <div className="flex items-center justify-between gap-2">
                      <span className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                        <Icon className="h-3.5 w-3.5 shrink-0" style={{ color: criteria.color }} />
                        {criteria.label}
                      </span>
                      <Badge
                        variant="outline"
                        className="shrink-0 text-[11px] font-bold"
                        style={
                          currentVal > 0
                            ? { borderColor: `${criteria.color}55`, background: `${criteria.color}15`, color: criteria.color }
                            : { borderColor: "#e2e8f0", color: "#94a3b8" }
                        }
                      >
                        {currentVal > 0 ? `${currentVal} / 5 · ${starLabels[currentVal - 1]}` : "Not rated yet"}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-1" onMouseLeave={() => setHoverPreview(null)}>
                      {[1, 2, 3, 4, 5].map((starVal) => (
                        <motion.button
                          key={starVal}
                          type="button"
                          whileHover={{ scale: 1.3, rotate: -8 }}
                          whileTap={{ scale: 0.85 }}
                          onMouseEnter={() => setHoverPreview({ key: criteria.key, star: starVal })}
                          onClick={() => setRatingScores({ ...ratingScores, [criteria.key]: starVal })}
                          className="p-1"
                        >
                          <Star
                            className="h-5 w-5 transition-colors duration-150"
                            style={
                              starVal <= previewVal
                                ? { fill: criteria.color, color: criteria.color }
                                : { color: "#cbd5e1" }
                            }
                          />
                        </motion.button>
                      ))}
                    </div>
                  </div>
                );
              })}

              <Textarea
                placeholder="Feedback for the founder (optional)"
                rows={2}
                value={ratingComment}
                onChange={(e) => setRatingComment(e.target.value)}
              />

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                  <span>Total Score</span>
                  <span className="text-base font-extrabold" style={{ color: scoreMeterColor((totalScore / 25) * 100) }}>
                    {totalScore} / 25 ({(totalScore / 5).toFixed(1)} ★)
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
                  <motion.div
                    className="h-full rounded-full"
                    initial={false}
                    animate={{ width: `${(totalScore / 25) * 100}%`, background: scoreMeterColor((totalScore / 25) * 100) }}
                    transition={{ type: "spring", stiffness: 220, damping: 26 }}
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={isSubmittingRating || Object.values(ratingScores).some((score) => score < 1)}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmittingRating ? "Submitting…" : isUpdatingExisting ? "Update Rating" : "Submit Rating"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default Sais26Room;
