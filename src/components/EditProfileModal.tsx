import { useState } from "react";
import { Loader, User, X } from "lucide-react";
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
import { setSession } from "@/lib/session";

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  initialData?: {
    headline?: string;
    profilePhoto?: string;
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
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
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

      const response = await updateMyProfileApi(token, {
        headline: formData.headline,
        profilePhoto: formData.profilePhoto,
      });

      // Update local storage so the dashboard and other components reflect changes
      if (response.account) {
        setSession(token, response.account);
      }

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
          <div className="space-y-3">
            <Label>Profile Photo</Label>
            <div className="flex items-center gap-4">
              {formData.profilePhoto ? (
                <div className="relative group">
                  <img
                    src={formData.profilePhoto}
                    alt="Profile"
                    className="h-20 w-20 rounded-full border-2 border-purple-100 object-cover shadow-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, profilePhoto: "" }))}
                    className="absolute -top-1 -right-1 hidden h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white group-hover:flex"
                  >
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <div className="flex h-20 w-20 items-center justify-center rounded-full border-2 border-dashed border-slate-200 bg-slate-50 text-slate-400">
                  <User className="h-10 w-10 text-slate-300" />
                </div>
              )}
              
              <div className="flex-1 space-y-2">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        setFormData(prev => ({ ...prev, profilePhoto: reader.result as string }));
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                  className="cursor-pointer file:mr-2 file:rounded-md file:border-0 file:bg-violet-50 file:px-2 file:py-1 file:text-xs file:font-semibold file:text-violet-700 hover:file:bg-violet-100"
                />
                <p className="text-[11px] text-slate-500">JPG, PNG or GIF. Max 1MB Recommended.</p>
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="profilePhoto" className="text-xs text-slate-500">Or use Photo URL</Label>
              <Input
                id="profilePhoto"
                name="profilePhoto"
                value={formData.profilePhoto.startsWith("data:") ? "" : formData.profilePhoto}
                onChange={handleChange}
                placeholder="https://example.com/photo.jpg"
                className="h-9 text-xs"
              />
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
