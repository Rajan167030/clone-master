import { useRef } from "react";
import QRCode from "qrcode.react";
import html2canvas from "html2canvas";
import { BadgeCheck, Download, Edit, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";

type InvestorIdentityCardProps = {
  fullName: string;
  city?: string;
  headline?: string;
  profilePhoto?: string;
  profileId: string;
  investorId?: string;
  focusSector?: string[];
  cardColors?: {
    primary?: string;
    secondary?: string;
  };
  onEdit?: () => void;
  isEditable?: boolean;
};

const InvestorIdentityCard = ({
  fullName,
  city,
  headline,
  profilePhoto,
  profileId,
  investorId,
  focusSector = [],
  cardColors = {},
  onEdit,
  isEditable = false,
}: InvestorIdentityCardProps) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const profileUrl = `${import.meta.env.VITE_APP_URL || window.location.origin}/profile/${profileId}`;

  const primary = cardColors.primary || "#7C3AED";
  const secondary = cardColors.secondary || "#F59E0B";

  const downloadCard = async () => {
    if (!cardRef.current) return;
    try {
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: "#ffffff",
        scale: 2,
        useCORS: true,
        allowTaint: true,
      });
      const link = document.createElement("a");
      link.href = canvas.toDataURL("image/png");
      link.download = `${fullName.replace(/\s+/g, "-")}-investor-id-card.png`;
      link.click();
    } catch (error) {
      console.error("Failed to download card:", error);
    }
  };

  const shareCard = async () => {
    const shareText = `Connect with me on Founders Connect — SAIS'26 Verified Investor. ${profileUrl}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: "SAIS'26 Investor Profile", text: shareText, url: profileUrl });
      } catch {
        // user cancelled share — no action needed
      }
    } else {
      navigator.clipboard.writeText(profileUrl);
      alert("Profile link copied to clipboard!");
    }
  };

  return (
    <div className="space-y-4">
      <div
        ref={cardRef}
        className="mx-auto w-full max-w-sm rounded-3xl bg-white shadow-[0_20px_45px_-15px_rgba(15,23,42,0.25)] border border-slate-100 overflow-hidden relative"
      >
        {/* Decorative corner accent */}
        <div
          className="absolute -top-10 -right-10 h-32 w-32 rounded-full opacity-10"
          style={{ background: `radial-gradient(circle, ${secondary}, transparent 70%)` }}
        />

        {/* Colored header band */}
        <div
          className="px-6 pt-5 pb-10 relative"
          style={{ background: `linear-gradient(120deg, ${primary} 0%, ${secondary} 100%)` }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-[0.25em] text-white/80">
                Founders Connect
              </p>
              <p className="text-sm font-black uppercase tracking-wide text-white flex items-center gap-1.5 mt-0.5">
                <BadgeCheck className="w-4 h-4" /> SAIS'26 Verified Investor
              </p>
            </div>
          </div>
        </div>

        {/* Photo overlaps the band, like a physical ID badge */}
        <div className="flex justify-center -mt-9">
          {profilePhoto ? (
            <div className="h-20 w-20 shrink-0 overflow-hidden rounded-full border-4 border-white bg-white shadow-[0_2px_6px_rgba(15,23,42,0.18)] ring-1 ring-black/5">
              <img
                src={profilePhoto}
                alt={fullName}
                className="h-full w-full object-contain"
              />
            </div>
          ) : (
            <div
              className="h-20 w-20 rounded-full border-4 border-white shadow-[0_2px_6px_rgba(15,23,42,0.18)] ring-1 ring-black/5 flex items-center justify-center text-2xl font-black text-white"
              style={{ background: `linear-gradient(135deg, ${primary}, ${secondary})` }}
            >
              {fullName.charAt(0).toUpperCase()}
            </div>
          )}
        </div>

        <div className="px-6 pt-3 pb-6 text-center">
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">{fullName}</h2>
          {headline && <p className="text-xs text-slate-500 mt-0.5 italic">"{headline}"</p>}

          <div className="flex items-center justify-center gap-2 mt-3 flex-wrap">
            <span
              className="rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white"
              style={{ background: primary }}
            >
              Investor
            </span>
            {city && (
              <span className="rounded-full px-3 py-1 text-[10px] font-semibold bg-slate-100 text-slate-600">
                📍 {city}
              </span>
            )}
          </div>

          {investorId && (
            <p className="text-[10px] font-mono text-slate-400 mt-3 tracking-wider">ID: {investorId}</p>
          )}

          {focusSector.length > 0 && (
            <div className="flex flex-wrap justify-center gap-1.5 mt-3">
              {focusSector.slice(0, 4).map((sector) => (
                <span
                  key={sector}
                  className="rounded-full border px-2.5 py-0.5 text-[10px] font-semibold"
                  style={{ borderColor: `${primary}40`, color: primary, background: `${primary}0d` }}
                >
                  {sector}
                </span>
              ))}
            </div>
          )}

          {/* QR Code */}
          <div className="flex justify-center mt-5">
            <div className="rounded-2xl bg-white p-3 border-2 shadow-sm" style={{ borderColor: `${primary}30` }}>
              <QRCode value={profileUrl} size={116} level="H" includeMargin={false} fgColor="#0f172a" />
            </div>
          </div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] mt-2" style={{ color: primary }}>
            Scan to View Full Profile
          </p>

          <div className="border-t border-slate-100 mt-5 pt-3">
            <p className="text-[10px] font-medium text-slate-400">foundersconnect.co.in</p>
          </div>
        </div>
      </div>

      <div className="flex gap-2 justify-center flex-wrap">
        <Button onClick={downloadCard} variant="outline" className="flex items-center gap-2">
          <Download size={16} /> Download
        </Button>
        <Button onClick={shareCard} className="flex items-center gap-2 text-white" style={{ background: primary }}>
          <Share2 size={16} /> Share
        </Button>
        {isEditable && onEdit && (
          <Button onClick={onEdit} variant="outline" className="flex items-center gap-2">
            <Edit size={16} /> Edit
          </Button>
        )}
      </div>
    </div>
  );
};

export default InvestorIdentityCard;
