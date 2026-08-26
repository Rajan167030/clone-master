import { Award, Building2, Mail, MapPin, MessagesSquare, Phone, Sparkles, Star, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { ActivityStartupItem } from "@/lib/api";
import { RATING_CRITERIA as CRITERIA, RATING_CRITERIA_COUNT, RATING_SCALE_MAX, sumRatingScores } from "@/lib/rating-criteria";

type StartupProfileModalProps = {
  startup: ActivityStartupItem | null;
  onClose: () => void;
};

const StartupProfileModal = ({ startup, onClose }: StartupProfileModalProps) => {
  if (!startup) return null;

  const ratings = startup.ratings || [];
  const criteriaAverages = CRITERIA.map((criteria) => {
    if (ratings.length === 0) return { ...criteria, average: 0 };
    const sum = ratings.reduce((acc, r) => acc + (r.scores?.[criteria.key] || 0), 0);
    return { ...criteria, average: Number((sum / ratings.length).toFixed(1)) };
  });
  // Derived live from each rating's raw `scores`, never from the stored `averageScore` /
  // `totalScore` fields — those were computed against whichever criteria list existed at
  // submission time, so they drift out of sync whenever the rubric (RATING_CRITERIA) changes.
  const liveAverageScore =
    ratings.length > 0
      ? Number(
          (ratings.reduce((acc, r) => acc + sumRatingScores(r.scores) / RATING_CRITERIA_COUNT, 0) / ratings.length).toFixed(2),
        )
      : 0;

  return (
    <Dialog open={!!startup} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto bg-white p-0 rounded-2xl shadow-2xl border-0 gap-0">
        {/* Light header card with a solid violet accent — matches the SAIS'26 room's own
            branding (border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-white)
            instead of a saturated dark gradient. */}
        <div className="relative overflow-hidden bg-gradient-to-br from-purple-50 to-white border-b-2 border-purple-200 px-5 sm:px-6 pt-6 pb-6">
          <DialogHeader className="relative">
            <div className="flex items-start gap-4">
              <img
                src={startup.logoUrl}
                alt={startup.startupName}
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-white shadow-md shrink-0 bg-white"
              />
              <div className="min-w-0 pt-0.5">
                <DialogTitle className="text-xl sm:text-2xl font-bold text-slate-900">{startup.startupName}</DialogTitle>
                <DialogDescription className="text-sm text-slate-600 mt-1">{startup.tagline}</DialogDescription>
                <div className="flex flex-wrap gap-1.5 mt-2.5">
                  <Badge variant="outline" className="bg-white text-xs border-purple-200 text-purple-700">
                    {startup.category}
                  </Badge>
                  <Badge variant="outline" className="bg-white text-xs border-purple-200 text-purple-700">
                    {startup.stage}
                  </Badge>
                  {startup.location && (
                    <Badge variant="outline" className="bg-white text-xs border-purple-200 text-purple-700 flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> {startup.location}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </DialogHeader>
        </div>

        <div className="p-5 sm:p-6 space-y-5">
          <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-purple-500" /> About
            </h4>
            <p className="text-sm text-slate-700 leading-relaxed">{startup.description || "No description provided."}</p>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2.5 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-purple-500" /> Founder
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-sm text-slate-700">
              <p className="font-semibold text-slate-900">{startup.founderName}</p>
              <p className="flex items-center gap-1.5 text-slate-600">
                <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" /> <span className="truncate">{startup.founderEmail}</span>
              </p>
              {startup.founderPhone && (
                <p className="flex items-center gap-1.5 text-slate-600">
                  <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" /> {startup.founderPhone}
                </p>
              )}
            </div>
          </div>

          <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-purple-500" /> Evaluation Breakdown
              </h4>
              <span className="flex items-center gap-1.5 rounded-full bg-amber-50 border border-amber-200 px-2.5 py-1 text-amber-700 font-bold text-xs">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                {liveAverageScore > 0 ? liveAverageScore : "N/A"} / {RATING_SCALE_MAX}
                <span className="font-medium text-amber-600/80">({ratings.length} {ratings.length === 1 ? "rating" : "ratings"})</span>
              </span>
            </div>
            <div className="space-y-2.5">
              {criteriaAverages.map((c) => {
                const isRated = c.average > 0;
                return (
                  <div key={c.key} className={`flex items-center gap-3 transition-opacity ${isRated ? "" : "opacity-50"}`}>
                    <span className="text-xs text-slate-600 w-44 sm:w-52 shrink-0 leading-tight">{c.label}</span>
                    <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                      {isRated && (
                        <div
                          className="h-full bg-gradient-to-r from-amber-400 to-purple-500 rounded-full"
                          style={{ width: `${(c.average / RATING_SCALE_MAX) * 100}%` }}
                        />
                      )}
                    </div>
                    <span className="text-xs font-semibold text-slate-700 w-16 text-right shrink-0">
                      {isRated ? c.average : "Not rated"}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2.5 flex items-center gap-1.5">
              <MessagesSquare className="w-3.5 h-3.5 text-purple-500" /> Investor Reviews ({ratings.length})
            </h4>
            {ratings.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-1.5 rounded-xl border border-dashed border-slate-200 bg-slate-50/60 py-8 text-center">
                <MessagesSquare className="w-6 h-6 text-slate-300" />
                <p className="text-sm text-slate-500">No reviews yet — be the first investor to rate this startup.</p>
              </div>
            ) : (
              <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
                {[...ratings]
                  .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
                  .map((r, i) => (
                    <div
                      key={i}
                      className="p-3 bg-white rounded-lg border border-slate-200 shadow-sm hover:shadow-md hover:border-purple-200 transition-all"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <img
                            src={r.investorPhoto || "https://ui-avatars.com/api/?name=Investor"}
                            alt={r.investorName}
                            className="w-8 h-8 rounded-full object-cover border border-slate-200 shrink-0"
                          />
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-slate-800 truncate">{r.investorName}</p>
                            {r.investorFirm && (
                              <p className="text-[11px] text-slate-500 flex items-center gap-1 truncate">
                                <Building2 className="w-3 h-3 shrink-0" /> {r.investorFirm}
                              </p>
                            )}
                          </div>
                        </div>
                        <Badge className="bg-amber-100 text-amber-800 border-amber-200 shrink-0 flex items-center gap-1">
                          <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                          {(sumRatingScores(r.scores) / RATING_CRITERIA_COUNT).toFixed(1)} / {RATING_SCALE_MAX}
                        </Badge>
                      </div>
                      {r.comment && <p className="text-xs text-slate-600 italic mt-2">"{r.comment}"</p>}
                      {(r.feedbackImageUrl || r.voiceNoteUrl) && (
                        <div className="mt-2 flex flex-wrap items-center gap-2">
                          {r.feedbackImageUrl && (
                            <a href={r.feedbackImageUrl} target="_blank" rel="noreferrer">
                              <img
                                src={r.feedbackImageUrl}
                                alt="Feedback notes"
                                className="h-14 w-14 rounded-md border border-slate-200 object-cover hover:opacity-80"
                              />
                            </a>
                          )}
                          {r.voiceNoteUrl && <audio src={r.voiceNoteUrl} controls className="h-8" />}
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default StartupProfileModal;
