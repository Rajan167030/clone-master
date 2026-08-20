import { Briefcase, ExternalLink, Mail, Phone } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { ActivityInvestorProfile } from "@/lib/api";

type InvestorProfileModalProps = {
  investor: ActivityInvestorProfile | null;
  onClose: () => void;
};

const InvestorProfileModal = ({ investor, onClose }: InvestorProfileModalProps) => {
  if (!investor) return null;

  return (
    <Dialog open={!!investor} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] sm:max-w-md max-h-[90vh] overflow-y-auto bg-white p-4 sm:p-6 rounded-2xl shadow-2xl">
        <DialogHeader>
          <div className="flex items-start gap-4">
            <img
              src={investor.photoUrl}
              alt={investor.fullName}
              className="w-16 h-16 rounded-full object-cover border-2 border-slate-200 shrink-0"
            />
            <div>
              <DialogTitle className="text-xl font-bold text-slate-900">{investor.fullName}</DialogTitle>
              <DialogDescription className="text-sm text-slate-600 flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5" /> {investor.designation} · {investor.firmName}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-5 pt-2">
          {investor.sectors && investor.sectors.length > 0 && (
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Sectors of Interest</h4>
              <div className="flex flex-wrap gap-1.5">
                {investor.sectors.map((sec) => (
                  <Badge key={sec} variant="outline" className="text-xs bg-indigo-50 text-indigo-700 border-indigo-200">{sec}</Badge>
                ))}
              </div>
            </div>
          )}

          {investor.ticketSize && (
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Ticket Size</h4>
              <p className="text-sm text-slate-700">{investor.ticketSize}</p>
            </div>
          )}

          {investor.bio && (
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">About</h4>
              <p className="text-sm text-slate-700 leading-relaxed">{investor.bio}</p>
            </div>
          )}

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Contact</h4>
            <p className="text-xs text-slate-600 flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 text-slate-400" /> {investor.email}</p>
            {investor.phone && (
              <p className="text-xs text-slate-600 flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-slate-400" /> {investor.phone}</p>
            )}
            {investor.linkedin && (
              <a
                href={investor.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-indigo-600 hover:underline flex items-center gap-1.5"
              >
                <ExternalLink className="w-3.5 h-3.5" /> LinkedIn Profile
              </a>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default InvestorProfileModal;
