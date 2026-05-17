import React, { useRef, useState, useEffect } from "react";
import QRCode from "qrcode.react";
import { Download, Share2, Edit, Smartphone, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import html2canvas from "html2canvas";

interface ProfileCardProps {
  fullName: string;
  role: "user" | "investor" | "founder" | "admin";
  city: string;
  headline?: string;
  profilePhoto?: string;
  profileId: string;
  cardColors?: {
    primary?: string;
    secondary?: string;
    accent?: string;
    backgroundColor?: string;
  };
  onEdit?: () => void;
  isEditable?: boolean;
}

const roleLabels: Record<string, string> = {
  user: "Community Member",
  investor: "Premium Investor",
  founder: "Elite Founder",
  admin: "FC Admin",
};

const roleColors: Record<string, string> = {
  user: "bg-blue-500/10 border border-blue-500/30 text-blue-300",
  investor: "bg-emerald-500/10 border border-emerald-500/30 text-emerald-300",
  founder: "bg-purple-500/10 border border-purple-500/30 text-purple-300",
  admin: "bg-rose-500/10 border border-rose-500/30 text-rose-300",
};

export const ProfileCard = ({
  fullName,
  role,
  city,
  headline = "Building the future",
  profilePhoto,
  profileId,
  cardColors = {},
  onEdit,
  isEditable = false,
}: ProfileCardProps) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [hasNFC, setHasNFC] = useState(false);
  const profileUrl = `${import.meta.env.VITE_APP_URL || window.location.origin}/profile/${profileId}`;

  // Check for NFC capability
  useEffect(() => {
    if ("NDEFReader" in window) {
      setHasNFC(true);
    }
  }, []);

  const colors = {
    primary: cardColors?.primary || "#a855f7",
    secondary: cardColors?.secondary || "#6366f1",
    accent: cardColors?.accent || "#ffffff",
    backgroundColor: cardColors?.backgroundColor || "rgba(255,255,255,0.03)",
  };

  const downloadCard = async () => {
    if (!cardRef.current) return;

    try {
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: "#0b071e",
        scale: 2,
        useCORS: true,
        allowTaint: true,
      });

      const link = document.createElement("a");
      link.href = canvas.toDataURL("image/png");
      link.download = `${fullName.replace(/\s+/g, "-")}-profile-card.png`;
      link.click();
    } catch (error) {
      console.error("Failed to download card:", error);
    }
  };

  const shareCard = async () => {
    const shareText = `Check out my Founders Connect profile! ${profileUrl}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: "Founders Connect Profile",
          text: shareText,
          url: profileUrl,
        });
      } catch (error) {
        console.error("Share failed:", error);
      }
    } else {
      navigator.clipboard.writeText(profileUrl);
      alert("Profile link copied to clipboard!");
    }
  };

  const writeNFC = async () => {
    if (!("NDEFWriter" in window)) {
      alert("NFC is not supported on this device");
      return;
    }

    try {
      const writer = new (window as any).NDEFWriter();
      await writer.push({
        records: [
          {
            recordType: "url",
            data: profileUrl,
          },
        ],
      });
      alert("NFC tag written successfully! Tap the tag to your device.");
    } catch (error) {
      console.error("NFC write failed:", error);
      alert("Failed to write NFC tag. Please try again.");
    }
  };

  const orderPhysicalCard = () => {
    alert(
      "Physical card ordering coming soon! We'll help you print professional business cards with your profile."
    );
  };

  return (
    <div className="space-y-4">
      <div
        ref={cardRef}
        className="mx-auto w-full max-w-sm rounded-3xl p-[1px] shadow-[0_20px_50px_rgba(168,85,247,0.25)] relative overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%)`,
        }}
      >
        {/* Luxury radial glow overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.15),transparent_70%)] pointer-events-none" />

        <div className="rounded-[23px] bg-slate-950/90 backdrop-blur-xl p-6 relative overflow-hidden">
          
          {/* Card Header - Founders Connect Premium Branding */}
          <div className="mb-6 text-center">
            <h3
              className="text-lg font-black uppercase tracking-[0.25em] bg-clip-text text-transparent bg-gradient-to-r from-white via-purple-200 to-white"
            >
              Founders Connect
            </h3>
            <p
              className="text-[9px] uppercase tracking-[0.3em] text-slate-400 mt-1"
            >
              Digital Identity Pass
            </p>
          </div>

          {/* Premium Glassmorphic Card Container */}
          <div
            className="mb-2 rounded-2xl p-5 border border-white/5 bg-white/[0.03] backdrop-blur-md shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] relative overflow-hidden"
          >
            {/* Glossy overlay sheen */}
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.02] to-transparent pointer-events-none" />

            {/* Profile Photo */}
            <div className="mb-4 flex justify-center">
              {profilePhoto ? (
                <div className="relative rounded-full p-[2px] bg-gradient-to-tr from-purple-500 to-indigo-500 shadow-[0_0_15px_rgba(168,85,247,0.4)]">
                  <img
                    src={profilePhoto}
                    alt={fullName}
                    className="h-20 w-20 rounded-full object-cover"
                  />
                </div>
              ) : (
                <div
                  className="flex h-20 w-20 items-center justify-center rounded-full text-2xl font-black text-white shadow-[0_0_20px_rgba(168,85,247,0.4)] border border-purple-500/30"
                  style={{
                    background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%)`,
                  }}
                >
                  {fullName.charAt(0).toUpperCase()}
                </div>
              )}
            </div>

            {/* Full Name */}
            <h2 className="text-center text-xl font-extrabold tracking-tight text-white mb-2 bg-clip-text text-transparent bg-gradient-to-b from-white to-purple-100">
              {fullName}
            </h2>

            {/* Role Badge */}
            <div className="mb-4 flex justify-center">
              <span
                className={`${roleColors[role]} rounded-full px-3 py-1 text-[9px] font-extrabold uppercase tracking-widest`}
              >
                {roleLabels[role]}
              </span>
            </div>

            {/* Headline */}
            {headline && (
              <p className="text-center text-xs text-slate-300 italic mb-4 leading-relaxed font-light px-2">
                "{headline}"
              </p>
            )}

            {/* Location */}
            <div className="text-center text-xs font-semibold text-slate-400 mb-5 flex items-center justify-center gap-1">
              <span className="text-purple-400 text-sm">📍</span> {city}
            </div>

            {/* QR Code Section */}
            <div className="flex justify-center mb-4">
              <div className="rounded-2xl bg-white p-3 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.5)] border border-white/10 hover:scale-[1.03] transition-transform duration-300">
                <QRCode
                  value={profileUrl}
                  size={120}
                  level="H"
                  includeMargin={false}
                  fgColor="#090514"
                />
              </div>
            </div>

            {/* Branding Footer */}
            <div className="border-t border-white/5 pt-4 text-center">
              <p className="text-[9px] uppercase tracking-[0.2em] font-semibold text-purple-300">
                Scan to Connect
              </p>
              <p className="text-[10px] font-medium text-slate-500 mt-1 hover:text-purple-400 transition-colors duration-300">
                foundersconnect.co.in
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-3 pt-4">
        <div className="flex gap-2 justify-center flex-wrap">
          <Button
            onClick={downloadCard}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Download size={16} />
            Download
          </Button>
          <Button
            onClick={shareCard}
            className="bg-purple-600 hover:bg-purple-700 flex items-center gap-2"
          >
            <Share2 size={16} />
            Share
          </Button>
          {isEditable && onEdit && (
            <Button
              onClick={onEdit}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Edit size={16} />
              Edit
            </Button>
          )}
        </div>

        {/* Advanced Options */}
        <div className="flex gap-2 justify-center flex-wrap pt-2 border-t border-gray-200">
          {hasNFC && (
            <Button
              onClick={writeNFC}
              variant="outline"
              className="flex items-center gap-2 text-xs"
            >
              <Smartphone size={14} />
              Write NFC
            </Button>
          )}
          <Button
            onClick={orderPhysicalCard}
            variant="outline"
            className="flex items-center gap-2 text-xs"
          >
            <Printer size={14} />
            Order Card
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProfileCard;
