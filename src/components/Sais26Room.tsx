import { type FormEvent, useEffect, useMemo, useState } from "react";
import { Building2, Eye, FileText, ShieldCheck, Star, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import PitchDeckViewerModal from "@/components/PitchDeckViewerModal";
import StartupProfileModal from "@/components/StartupProfileModal";
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
  { key: "innovation", label: "Innovation & Product Tech" },
  { key: "market", label: "Market Opportunity & Scalability" },
  { key: "traction", label: "Business Model & Traction" },
  { key: "team", label: "Team & Execution Capability" },
  { key: "pitch", label: "Pitch & Presentation Quality" },
] as const;

const DEFAULT_SCORES: RatingScores = { innovation: 4, market: 4, traction: 4, team: 4, pitch: 4 };

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
  const [ratingTargetStartup, setRatingTargetStartup] = useState<ActivityStartupItem | null>(null);
  const [ratingScores, setRatingScores] = useState<RatingScores>(DEFAULT_SCORES);
  const [ratingComment, setRatingComment] = useState("");
  const [isSubmittingRating, setIsSubmittingRating] = useState(false);
  const [isUpdatingExisting, setIsUpdatingExisting] = useState(false);

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
    setRatingTargetStartup(startup);
  };

  const handleRatingSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!ratingTargetStartup || !authToken) return;

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
                          {viewerRole === "investor" && (
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
                <Card key={(investor as any)._id || investor.id} className="border border-slate-200">
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

            <form onSubmit={handleRatingSubmit} className="space-y-4 pt-2">
              {RATING_CRITERIA.map((criteria) => {
                const currentVal = ratingScores[criteria.key];
                return (
                  <div key={criteria.key} className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                    <span className="text-xs font-bold text-slate-800">{criteria.label}</span>
                    <div className="flex items-center gap-1.5">
                      {[1, 2, 3, 4, 5].map((starVal) => (
                        <button
                          key={starVal}
                          type="button"
                          onClick={() => setRatingScores({ ...ratingScores, [criteria.key]: starVal })}
                          className="p-1 hover:scale-125 transition-transform"
                        >
                          <Star className={`w-5 h-5 ${starVal <= currentVal ? "fill-amber-400 text-amber-400" : "text-slate-300"}`} />
                        </button>
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

              <div className="bg-slate-100 p-3 rounded-lg flex items-center justify-between text-xs font-bold text-slate-800">
                <span>Total Score:</span>
                <span className="text-base text-amber-600 font-extrabold">
                  {totalScore} / 25 ({(totalScore / 5).toFixed(1)} ★)
                </span>
              </div>

              <Button type="submit" disabled={isSubmittingRating} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold">
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
