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
  investor: "Investor",
  founder: "Founder",
  admin: "Admin",
};

const roleColors: Record<string, string> = {
  user: "bg-blue-600",
  investor: "bg-green-600",
  founder: "bg-purple-600",
  admin: "bg-red-600",
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
    primary: cardColors?.primary || "#667eea",
    secondary: cardColors?.secondary || "#764ba2",
    accent: cardColors?.accent || "#ffffff",
    backgroundColor: cardColors?.backgroundColor || "#ffffff",
  };

  const downloadCard = async () => {
    if (!cardRef.current) return;

    try {
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: "#ffffff",
        scale: 2,
        quality: 95,
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
      // Fallback: Copy to clipboard
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
    // Placeholder for physical card ordering
    // In production, this would integrate with a printing service like Printful or Vistaprint
    alert(
      "Physical card ordering coming soon! We'll help you print professional business cards with your profile."
    );
  };

  return (
    <div className="space-y-4">
      <div
        ref={cardRef}
        className="mx-auto w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl"
        style={{
          backgroundImage: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%)`,
        }}
      >
        {/* Card Header - Founders Connect Branding */}
        <div className="mb-6 text-center">
          <h3
            className="text-lg font-bold"
            style={{ color: colors.accent }}
          >
            Founders Connect
          </h3>
          <p
            className="text-sm"
            style={{ color: `${colors.accent}dd` }}
          >
            Professional Network Card
          </p>
        </div>

        {/* Profile Section */}
        <div
          className="mb-6 rounded-xl p-4 shadow-md"
          style={{ backgroundColor: colors.backgroundColor }}
        >
          {/* Profile Photo */}
          <div className="mb-4 flex justify-center">
            {profilePhoto ? (
              <img
                src={profilePhoto}
                alt={fullName}
                className="h-20 w-20 rounded-full object-cover border-4"
                style={{ borderColor: colors.primary }}
              />
            ) : (
              <div
                className="flex h-20 w-20 items-center justify-center rounded-full text-2xl font-bold text-white border-4"
                style={{
                  backgroundColor: colors.primary,
                  borderColor: colors.primary,
                }}
              >
                {fullName.charAt(0).toUpperCase()}
              </div>
            )}
          </div>

          {/* Name */}
          <h2 className="text-center text-xl font-bold text-gray-800 mb-1">
            {fullName}
          </h2>

          {/* Role Badge */}
          <div className="mb-3 flex justify-center">
            <span
              className={`${roleColors[role]} rounded-full px-3 py-1 text-xs font-semibold text-white`}
            >
              {roleLabels[role]}
            </span>
          </div>

          {/* Headline */}
          {headline && (
            <p className="text-center text-sm text-gray-600 italic mb-2">
              "{headline}"
            </p>
          )}

          {/* Location */}
          <div className="text-center text-sm text-gray-500 mb-4">
            📍 {city}
          </div>

          {/* QR Code Section */}
          <div className="flex justify-center mb-3">
            <div className="rounded-lg bg-gray-100 p-2">
              <QRCode
                value={profileUrl}
                size={120}
                level="H"
                includeMargin={true}
              />
            </div>
          </div>

          {/* Branding Footer */}
          <div className="border-t border-gray-200 pt-3 text-center">
            <p className="text-xs font-semibold text-gray-700">
              Scan to connect
            </p>
            <p className="text-xs text-gray-500 mt-1">
              www.foundersconnect.in
            </p>
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
