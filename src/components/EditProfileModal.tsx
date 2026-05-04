import { useState } from "react";
import { Loader, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { updateMyProfileApi } from "@/lib/api";

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  initialData?: {
    headline?: string;
    profilePhoto?: string;
    cardColors?: {
      primary?: string;
      secondary?: string;
      accent?: string;
      backgroundColor?: string;
    };
  };
}

export const EditProfileModal = ({
  isOpen,
  onClose,
  onSuccess,
  initialData = {},
}: EditProfileModalProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    headline: initialData.headline || "",
    profilePhoto: initialData.profilePhoto || "",
    cardColors: {
      primary: initialData.cardColors?.primary || "#667eea",
      secondary: initialData.cardColors?.secondary || "#764ba2",
      accent: initialData.cardColors?.accent || "#ffffff",
      backgroundColor: initialData.cardColors?.backgroundColor || "#ffffff",
    },
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleColorChange = (
    colorKey: keyof typeof formData.cardColors,
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      cardColors: {
        ...prev.cardColors,
        [colorKey]: value,
      },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const token = localStorage.getItem("sl_auth_token");
      if (!token) {
        toast.error("Authentication required");
        return;
      }

      await updateMyProfileApi(token, {
        headline: formData.headline,
        profilePhoto: formData.profilePhoto,
        cardColors: formData.cardColors,
      });

      toast.success("Profile updated successfully!");
      onSuccess?.();
      onClose();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to update profile";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Your Profile</DialogTitle>
          <DialogDescription>
            Customize your profile card appearance and information
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Headline Section */}
          <div className="space-y-2">
            <Label htmlFor="headline">Professional Headline</Label>
            <Input
              id="headline"
              name="headline"
              value={formData.headline}
              onChange={handleChange}
              placeholder="e.g., Building the future with Founders Connect"
              maxLength={100}
            />
            <p className="text-xs text-gray-500">
              {formData.headline.length}/100 characters
            </p>
          </div>

          {/* Profile Photo Section */}
          <div className="space-y-2">
            <Label htmlFor="profilePhoto">Profile Photo URL</Label>
            <Input
              id="profilePhoto"
              name="profilePhoto"
              value={formData.profilePhoto}
              onChange={handleChange}
              placeholder="https://example.com/photo.jpg"
              type="url"
            />
            {formData.profilePhoto && (
              <img
                src={formData.profilePhoto}
                alt="Preview"
                className="h-20 w-20 rounded-full object-cover"
              />
            )}
          </div>

          {/* Card Colors Section */}
          <div className="space-y-3 border-t border-gray-200 pt-4">
            <h3 className="font-semibold text-sm">Card Colors</h3>

            {/* Primary Color */}
            <div className="space-y-2">
              <Label htmlFor="primary" className="flex items-center gap-2">
                Primary (Gradient Start)
                <input
                  type="color"
                  value={formData.cardColors.primary}
                  onChange={(e) => handleColorChange("primary", e.target.value)}
                  className="h-6 w-6 cursor-pointer rounded border border-gray-300"
                />
              </Label>
              <Input
                id="primary"
                value={formData.cardColors.primary}
                onChange={(e) => handleColorChange("primary", e.target.value)}
                placeholder="#667eea"
              />
            </div>

            {/* Secondary Color */}
            <div className="space-y-2">
              <Label htmlFor="secondary" className="flex items-center gap-2">
                Secondary (Gradient End)
                <input
                  type="color"
                  value={formData.cardColors.secondary}
                  onChange={(e) => handleColorChange("secondary", e.target.value)}
                  className="h-6 w-6 cursor-pointer rounded border border-gray-300"
                />
              </Label>
              <Input
                id="secondary"
                value={formData.cardColors.secondary}
                onChange={(e) => handleColorChange("secondary", e.target.value)}
                placeholder="#764ba2"
              />
            </div>

            {/* Accent Color */}
            <div className="space-y-2">
              <Label htmlFor="accent" className="flex items-center gap-2">
                Accent (Text)
                <input
                  type="color"
                  value={formData.cardColors.accent}
                  onChange={(e) => handleColorChange("accent", e.target.value)}
                  className="h-6 w-6 cursor-pointer rounded border border-gray-300"
                />
              </Label>
              <Input
                id="accent"
                value={formData.cardColors.accent}
                onChange={(e) => handleColorChange("accent", e.target.value)}
                placeholder="#ffffff"
              />
            </div>

            {/* Background Color */}
            <div className="space-y-2">
              <Label htmlFor="backgroundColor" className="flex items-center gap-2">
                Card Background
                <input
                  type="color"
                  value={formData.cardColors.backgroundColor}
                  onChange={(e) => handleColorChange("backgroundColor", e.target.value)}
                  className="h-6 w-6 cursor-pointer rounded border border-gray-300"
                />
              </Label>
              <Input
                id="backgroundColor"
                value={formData.cardColors.backgroundColor}
                onChange={(e) => handleColorChange("backgroundColor", e.target.value)}
                placeholder="#ffffff"
              />
            </div>

            {/* Color Preview */}
            <div
              className="h-32 rounded-lg border-2 border-gray-200 p-4 flex items-center justify-center text-center"
              style={{
                backgroundImage: `linear-gradient(135deg, ${formData.cardColors.primary} 0%, ${formData.cardColors.secondary} 100%)`,
              }}
            >
              <span style={{ color: formData.cardColors.accent }} className="font-semibold">
                Card Preview
              </span>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-purple-600 hover:bg-purple-700"
            >
              {isLoading && <Loader className="mr-2 h-4 w-4 animate-spin" />}
              {isLoading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditProfileModal;
