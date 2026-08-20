import { Building2, Mail, MapPin, Phone, Star, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { ActivityStartupItem } from "@/lib/api";

type StartupProfileModalProps = {
  startup: ActivityStartupItem | null;
  onClose: () => void;
};

const CRITERIA = [
  { key: "innovation", label: "Innovation & Product Tech" },
  { key: "market", label: "Market Opportunity" },
  { key: "traction", label: "Traction" },
  { key: "team", label: "Team & Execution" },
  { key: "pitch", label: "Pitch Quality" },
] as const;

const StartupProfileModal = ({ startup, onClose }: StartupProfileModalProps) => {
  if (!startup) return null;

  const ratings = startup.ratings || [];
  const criteriaAverages = CRITERIA.map((criteria) => {
    if (ratings.length === 0) return { ...criteria, average: 0 };
    const sum = ratings.reduce((acc, r) => acc + (r.scores?.[criteria.key] || 0), 0);
    return { ...criteria, average: Number((sum / ratings.length).toFixed(1)) };
  });

  return (
    <Dialog open={!!startup} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto bg-white p-4 sm:p-6 rounded-2xl shadow-2xl">
        <DialogHeader>
          <div className="flex items-start gap-4">
            <img
              src={startup.logoUrl}
              alt={startup.startupName}
              className="w-16 h-16 rounded-xl object-cover border-2 border-slate-200 shrink-0"
            />
            <div>
              <DialogTitle className="text-xl font-bold text-slate-900">{startup.startupName}</DialogTitle>
              <DialogDescription className="text-sm text-slate-600">{startup.tagline}</DialogDescription>
              <div className="flex flex-wrap gap-2 mt-2">
                <Badge variant="outline" className="text-xs">{startup.category}</Badge>
                <Badge variant="secondary" className="text-xs">{startup.stage}</Badge>
                {startup.location && (
                  <Badge variant="outline" className="text-xs flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> {startup.location}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-5 pt-2">
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">About</h4>
            <p className="text-sm text-slate-700 leading-relaxed">{startup.description || "No description provided."}</p>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5" /> Founder
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-slate-700">
              <p className="font-semibold">{startup.founderName}</p>
              <p className="flex items-center gap-1.5 text-slate-600">
                <Mail className="w-3.5 h-3.5" /> {startup.founderEmail}
              </p>
              {startup.founderPhone && (
                <p className="flex items-center gap-1.5 text-slate-600">
                  <Phone className="w-3.5 h-3.5" /> {startup.founderPhone}
                </p>
              )}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Evaluation Breakdown</h4>
              <span className="flex items-center gap-1 text-amber-500 font-bold text-sm">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                {startup.averageScore > 0 ? startup.averageScore : "N/A"} ({startup.totalRatingsCount} ratings)
              </span>
            </div>
            <div className="space-y-2">
              {criteriaAverages.map((c) => (
                <div key={c.key} className="flex items-center gap-3">
                  <span className="text-xs text-slate-600 w-40 shrink-0">{c.label}</span>
                  <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-amber-400 to-purple-500 rounded-full"
                      style={{ width: `${(c.average / 5) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs font-semibold text-slate-700 w-8 text-right">{c.average || "—"}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Investor Reviews ({ratings.length})
            </h4>
            {ratings.length === 0 ? (
              <p className="text-sm text-slate-500">No reviews yet — be the first investor to rate this startup.</p>
            ) : (
              <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
                {[...ratings]
                  .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
                  .map((r, i) => (
                    <div key={i} className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <img
                            src={r.investorPhoto || "https://ui-avatars.com/api/?name=Investor"}
                            alt={r.investorName}
                            className="w-7 h-7 rounded-full object-cover"
                          />
                          <div>
                            <p className="text-xs font-bold text-slate-800">{r.investorName}</p>
                            {r.investorFirm && (
                              <p className="text-[11px] text-slate-500 flex items-center gap-1">
                                <Building2 className="w-3 h-3" /> {r.investorFirm}
                              </p>
                            )}
                          </div>
                        </div>
                        <Badge className="bg-amber-100 text-amber-800 border-amber-200 shrink-0">
                          {(r.totalScore / 5).toFixed(1)} ★
                        </Badge>
                      </div>
                      {r.comment && <p className="text-xs text-slate-600 italic mt-2">"{r.comment}"</p>}
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
