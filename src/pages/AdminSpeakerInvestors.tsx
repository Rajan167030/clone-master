import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, CheckCircle2, Edit, ImageUp, Plus, Trash2, UsersRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  createAdminSpeakerInvestorProfileApi,
  deleteAdminSpeakerInvestorProfileApi,
  getAdminSpeakerInvestorProfilesApi,
  getCloudinaryUploadSignatureApi,
  updateAdminSpeakerInvestorProfileApi,
  type SpeakerInvestorProfile,
} from "@/lib/api";
import { getToken } from "@/lib/session";

type SpeakerForm = {
  slug: string;
  category: SpeakerInvestorProfile["category"];
  name: string;
  designation: string;
  company: string;
  photoUrl: string;
  photoAlt: string;
  summary: string;
  linkedinUrl: string;
  websiteUrl: string;
  order: string;
  isActive: boolean;
};

type CloudinaryUploadResponse = {
  secure_url?: string;
  error?: { message?: string };
};

const emptyForm: SpeakerForm = {
  slug: "",
  category: "speaker",
  name: "",
  designation: "",
  company: "",
  photoUrl: "",
  photoAlt: "",
  summary: "",
  linkedinUrl: "",
  websiteUrl: "",
  order: "0",
  isActive: true,
};

const emptyPhoto =
  "data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='420' viewBox='0 0 600 420'%3E%3Crect width='600' height='420' rx='32' fill='%230f172a'/%3E%3Ccircle cx='300' cy='150' r='74' fill='%231e293b'/%3E%3Cpath d='M174 352c24-64 76-96 126-96s102 32 126 96' fill='%231e293b'/%3E%3C/svg%3E";

const AdminSpeakerInvestors = () => {
  const token = useMemo(() => getToken() || "", []);
  const [profiles, setProfiles] = useState<SpeakerInvestorProfile[]>([]);
  const [form, setForm] = useState<SpeakerForm>(emptyForm);
  const [selectedSlug, setSelectedSlug] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const loadProfiles = () => {
    if (!token) return;

    setLoading(true);
    getAdminSpeakerInvestorProfilesApi(token)
      .then((response) => setProfiles(response.profiles || []))
      .catch((error) => {
        window.alert(error instanceof Error ? error.message : "Unable to load profiles.");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadProfiles();
  }, []);

  const handlePhotoUpload = async (file?: File | null) => {
    if (!file || !token) return;

    setUploading(true);
    try {
      const signaturePayload = await getCloudinaryUploadSignatureApi(token, {
        folder: "founders-connect/speaker-investors",
      });

      const formData = new FormData();
      formData.append("file", file);
      formData.append("api_key", signaturePayload.apiKey);
      formData.append("timestamp", String(signaturePayload.timestamp));
      formData.append("signature", signaturePayload.signature);
      formData.append("folder", signaturePayload.folder);
      if (signaturePayload.publicId) {
        formData.append("public_id", signaturePayload.publicId);
      }

      const uploadResponse = await fetch(signaturePayload.uploadUrl, {
        method: "POST",
        body: formData,
      });

      const uploadData = (await uploadResponse.json().catch(() => ({}))) as CloudinaryUploadResponse;
      if (!uploadResponse.ok || !uploadData.secure_url) {
        throw new Error(uploadData.error?.message || "Cloudinary upload failed.");
      }

      setForm((current) => ({
        ...current,
        photoUrl: uploadData.secure_url || "",
        photoAlt: current.photoAlt || current.name || file.name.replace(/\.[^.]+$/, ""),
      }));
    } catch (error) {
      window.alert(error instanceof Error ? error.message : "Unable to upload photo.");
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!token) {
      window.alert("Please sign in again before saving.");
      return;
    }

    const missing = [];
    if (!form.name.trim()) missing.push("Name");
    if (!form.photoUrl.trim()) missing.push("Photo");

    if (missing.length > 0) {
      window.alert(`Please provide ${missing.join(" and ")} before saving.`);
      return;
    }

    const payload = {
      slug: form.slug.trim(),
      category: form.category,
      name: form.name.trim(),
      designation: form.designation.trim(),
      company: form.company.trim(),
      photoUrl: form.photoUrl.trim(),
      photoAlt: form.photoAlt.trim(),
      summary: form.summary.trim(),
      linkedinUrl: form.linkedinUrl.trim(),
      websiteUrl: form.websiteUrl.trim(),
      order: Number(form.order || 0),
      isActive: form.isActive,
    };

    setSaving(true);
    try {
      const response = selectedSlug
        ? await updateAdminSpeakerInvestorProfileApi(token, selectedSlug, payload)
        : await createAdminSpeakerInvestorProfileApi(token, payload);

      window.alert(response.message);
      setForm(emptyForm);
      setSelectedSlug("");
      loadProfiles();
    } catch (error) {
      window.alert(error instanceof Error ? error.message : "Unable to save profile.");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (profile: SpeakerInvestorProfile) => {
    setSelectedSlug(profile.slug);
    setForm({
      slug: profile.slug,
      category: profile.category,
      name: profile.name,
      designation: profile.designation,
      company: profile.company || "",
      photoUrl: profile.photoUrl || "",
      photoAlt: profile.photoAlt || "",
      summary: profile.summary || "",
      linkedinUrl: profile.linkedinUrl || "",
      websiteUrl: profile.websiteUrl || "",
      order: String(profile.order ?? 0),
      isActive: Boolean(profile.isActive),
    });
  };

  const handleDelete = async (profile: SpeakerInvestorProfile) => {
    if (!token) return;
    if (!window.confirm(`Delete ${profile.name}?`)) return;

    try {
      const response = await deleteAdminSpeakerInvestorProfileApi(token, profile.slug);
      window.alert(response.message);
      if (selectedSlug === profile.slug) {
        setSelectedSlug("");
        setForm(emptyForm);
      }
      loadProfiles();
    } catch (error) {
      window.alert(error instanceof Error ? error.message : "Unable to delete profile.");
    }
  };

  const speakerProfiles = profiles.filter((profile) => profile.category === "speaker");
  const investorProfiles = profiles.filter((profile) => profile.category === "investor");

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-700">Admin</p>
            <h1 className="text-2xl font-bold text-slate-900">Speakers & Investors</h1>
          </div>
          <Link to="/admin" className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium hover:bg-slate-50">
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>
        </div>
      </div>

      <main className="container mx-auto px-4 py-8">
        <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>{selectedSlug ? "Edit Profile" : "Add Profile"}</CardTitle>
              <CardDescription>Upload a photo, designation, and summary for the public page.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block text-sm font-medium text-slate-700">
                  Type
                  <select
                    className="mt-1 w-full rounded-md border border-slate-200 bg-white px-3 py-2"
                    value={form.category}
                    onChange={(e) => setForm((current) => ({ ...current, category: e.target.value as SpeakerInvestorProfile["category"] }))}
                  >
                    <option value="speaker">Speaker</option>
                    <option value="investor">Investor</option>
                  </select>
                </label>
                <label className="block text-sm font-medium text-slate-700">
                  Order
                  <Input className="mt-1" type="number" value={form.order} onChange={(e) => setForm((current) => ({ ...current, order: e.target.value }))} />
                </label>
              </div>

              <Input placeholder="Slug (optional)" value={form.slug} onChange={(e) => setForm((current) => ({ ...current, slug: e.target.value }))} />
              <Input placeholder="Name *" value={form.name} onChange={(e) => setForm((current) => ({ ...current, name: e.target.value }))} />
              <Input placeholder="Designation" value={form.designation} onChange={(e) => setForm((current) => ({ ...current, designation: e.target.value }))} />
              <Input placeholder="Company" value={form.company} onChange={(e) => setForm((current) => ({ ...current, company: e.target.value }))} />

              <div className="space-y-2 rounded-xl border border-dashed border-slate-200 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">Photo</p>
                    <p className="text-xs text-slate-500">Use a URL or upload an image directly.</p>
                  </div>
                  <Button type="button" variant="outline" className="gap-2" disabled={uploading} onClick={() => document.getElementById("speaker-photo-input")?.click()}>
                    <ImageUp className="h-4 w-4" />
                    {uploading ? "Uploading..." : "Upload"}
                  </Button>
                </div>
                <input id="speaker-photo-input" type="file" accept="image/*" className="hidden" onChange={(e) => void handlePhotoUpload(e.target.files?.[0])} />
                <Input placeholder="Photo URL *" value={form.photoUrl} onChange={(e) => setForm((current) => ({ ...current, photoUrl: e.target.value }))} />
                <Input placeholder="Photo alt text" value={form.photoAlt} onChange={(e) => setForm((current) => ({ ...current, photoAlt: e.target.value }))} />
                <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
                  <img src={form.photoUrl || emptyPhoto} alt={form.photoAlt || form.name || "Profile preview"} className="h-56 w-full object-cover" />
                </div>
              </div>

              <Textarea placeholder="Short summary" value={form.summary} onChange={(e) => setForm((current) => ({ ...current, summary: e.target.value }))} className="min-h-28" />
              <Input placeholder="LinkedIn URL" value={form.linkedinUrl} onChange={(e) => setForm((current) => ({ ...current, linkedinUrl: e.target.value }))} />
              <Input placeholder="Website URL" value={form.websiteUrl} onChange={(e) => setForm((current) => ({ ...current, websiteUrl: e.target.value }))} />

              <label className="flex items-center gap-3 text-sm text-slate-700">
                <input type="checkbox" checked={form.isActive} onChange={(e) => setForm((current) => ({ ...current, isActive: e.target.checked }))} />
                Active on public page
              </label>

              <div className="flex flex-wrap gap-3">
                <Button onClick={() => void handleSave()} className="gap-2" disabled={saving}>
                  <CheckCircle2 className="h-4 w-4" />
                  {saving ? "Saving..." : selectedSlug ? "Update Profile" : "Create Profile"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setSelectedSlug("");
                    setForm(emptyForm);
                  }}
                >
                  Reset
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle>Speakers</CardTitle>
                <CardDescription>Public speaker profiles shown on the site.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {loading ? (
                  <p className="py-8 text-center text-slate-500">Loading profiles...</p>
                ) : speakerProfiles.length === 0 ? (
                  <p className="py-8 text-center text-slate-500">No speakers yet.</p>
                ) : (
                  speakerProfiles.map((profile) => (
                    <ProfileCard key={profile._id} profile={profile} onEdit={handleEdit} onDelete={handleDelete} />
                  ))
                )}
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle>Investors</CardTitle>
                <CardDescription>Public investor profiles shown on the site.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {loading ? (
                  <p className="py-8 text-center text-slate-500">Loading profiles...</p>
                ) : investorProfiles.length === 0 ? (
                  <p className="py-8 text-center text-slate-500">No investors yet.</p>
                ) : (
                  investorProfiles.map((profile) => (
                    <ProfileCard key={profile._id} profile={profile} onEdit={handleEdit} onDelete={handleDelete} />
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

const ProfileCard = ({
  profile,
  onEdit,
  onDelete,
}: {
  profile: SpeakerInvestorProfile;
  onEdit: (profile: SpeakerInvestorProfile) => void;
  onDelete: (profile: SpeakerInvestorProfile) => void;
}) => (
  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
    <div className="flex items-start gap-4">
      <img
        src={profile.photoUrl || emptyPhoto}
        alt={profile.photoAlt || profile.name}
        className="h-20 w-20 rounded-xl object-cover"
      />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="font-semibold text-slate-900">{profile.name}</h3>
          <Badge variant={profile.isActive ? "default" : "secondary"}>{profile.isActive ? "Active" : "Inactive"}</Badge>
          <Badge variant="outline">{profile.category}</Badge>
        </div>
        <p className="text-sm text-slate-600">{profile.designation}</p>
        {profile.company && <p className="text-xs text-slate-500">{profile.company}</p>}
        {profile.summary && <p className="mt-2 text-sm text-slate-700">{profile.summary}</p>}
      </div>
    </div>
    <div className="mt-4 flex flex-wrap gap-2">
      <Button size="sm" variant="outline" className="gap-2" onClick={() => onEdit(profile)}>
        <Edit className="h-4 w-4" />
        Edit
      </Button>
      <Button size="sm" variant="destructive" className="gap-2" onClick={() => onDelete(profile)}>
        <Trash2 className="h-4 w-4" />
        Delete
      </Button>
    </div>
  </div>
);

export default AdminSpeakerInvestors;