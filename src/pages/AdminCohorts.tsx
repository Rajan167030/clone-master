import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle2,
  Edit,
  ImageUp,
  Plus,
  Trash2,
  Rocket,
  Calendar,
  Clock,
  Sparkles,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  getAdminCohortsApi,
  createAdminCohortApi,
  updateAdminCohortApi,
  deleteAdminCohortApi,
  getCloudinaryUploadSignatureApi,
  type Cohort,
} from "@/lib/api";
import { getToken } from "@/lib/session";
import { useToast } from "@/hooks/use-toast";

type CohortForm = {
  title: string;
  slug: string;
  category: Cohort["category"];
  tagline: string;
  description: string;
  imageUrl: string;
  duration: string;
  mode: string;
  startDate: string;
  status: string;
  applicationUrl: string;
  highlightsText: string;
  order: string;
  isActive: boolean;
};

type CloudinaryUploadResponse = {
  secure_url?: string;
  error?: { message?: string };
};

const emptyForm: CohortForm = {
  title: "",
  slug: "",
  category: "startup",
  tagline: "",
  description: "",
  imageUrl: "",
  duration: "8 Weeks",
  mode: "Hybrid (Bengaluru & Remote)",
  startDate: "",
  status: "Applications Open",
  applicationUrl: "/join-us",
  highlightsText: "1-on-1 Operator Mentorship\nDirect Pitch to 40+ Top VCs\n$100K+ in Cloud & SaaS Credits",
  order: "0",
  isActive: true,
};

const AdminCohorts = () => {
  const token = useMemo(() => getToken() || "", []);
  const { toast } = useToast();
  const [cohorts, setCohorts] = useState<Cohort[]>([]);
  const [form, setForm] = useState<CohortForm>(emptyForm);
  const [selectedSlug, setSelectedSlug] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const loadCohorts = () => {
    if (!token) return;

    setLoading(true);
    getAdminCohortsApi(token)
      .then((response) => setCohorts(response.cohorts || []))
      .catch((error) => {
        toast({
          title: "Failed to load cohorts",
          description: error instanceof Error ? error.message : "Unable to load cohorts.",
          variant: "destructive",
        });
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadCohorts();
  }, []);

  const handleImageUpload = async (file?: File | null) => {
    if (!file || !token) return;

    setUploading(true);
    try {
      const signaturePayload = await getCloudinaryUploadSignatureApi(token, {
        folder: "founders-connect/cohorts",
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
        imageUrl: uploadData.secure_url || "",
      }));

      toast({
        title: "Image Uploaded! 🖼️",
        description: "Cohort banner image uploaded successfully.",
      });
    } catch (error) {
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Unable to upload image.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleEdit = (cohort: Cohort) => {
    setSelectedSlug(cohort.slug);
    setForm({
      title: cohort.title || "",
      slug: cohort.slug || "",
      category: cohort.category || "startup",
      tagline: cohort.tagline || "",
      description: cohort.description || "",
      imageUrl: cohort.imageUrl || "",
      duration: cohort.duration || "8 Weeks",
      mode: cohort.mode || "Hybrid",
      startDate: cohort.startDate || "",
      status: cohort.status || "Waitlist Open",
      applicationUrl: cohort.applicationUrl || "/join-us",
      highlightsText: (cohort.highlights || []).join("\n"),
      order: String(cohort.order ?? 0),
      isActive: cohort.isActive ?? true,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleReset = () => {
    setSelectedSlug("");
    setForm(emptyForm);
  };

  const handleSave = async () => {
    if (!token) {
      toast({ title: "Auth required", description: "Please sign in again.", variant: "destructive" });
      return;
    }

    if (!form.title.trim()) {
      toast({ title: "Title required", description: "Cohort title cannot be empty.", variant: "destructive" });
      return;
    }

    setSaving(true);
    const highlights = form.highlightsText
      .split("\n")
      .map((h) => h.trim())
      .filter(Boolean);

    const payload: Partial<Cohort> = {
      title: form.title.trim(),
      slug: form.slug.trim(),
      category: form.category,
      tagline: form.tagline.trim(),
      description: form.description.trim(),
      imageUrl: form.imageUrl.trim(),
      duration: form.duration.trim(),
      mode: form.mode.trim(),
      startDate: form.startDate.trim(),
      status: form.status.trim(),
      applicationUrl: form.applicationUrl.trim(),
      highlights,
      order: Number(form.order) || 0,
      isActive: form.isActive,
    };

    try {
      if (selectedSlug) {
        await updateAdminCohortApi(token, selectedSlug, payload);
        toast({ title: "Cohort Updated! ✅", description: `"${form.title}" was saved successfully.` });
      } else {
        await createAdminCohortApi(token, payload);
        toast({ title: "Cohort Created! 🎉", description: `"${form.title}" was added to database.` });
      }
      handleReset();
      loadCohorts();
    } catch (error) {
      toast({
        title: "Save failed",
        description: error instanceof Error ? error.message : "Unable to save cohort.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (cohort: Cohort) => {
    if (!token) return;
    const confirmed = window.confirm(`Are you sure you want to delete "${cohort.title}"?`);
    if (!confirmed) return;

    try {
      await deleteAdminCohortApi(token, cohort.slug);
      toast({ title: "Cohort deleted", description: `"${cohort.title}" removed.` });
      if (selectedSlug === cohort.slug) {
        handleReset();
      }
      loadCohorts();
    } catch (error) {
      toast({
        title: "Delete failed",
        description: error instanceof Error ? error.message : "Unable to delete cohort.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top Header */}
      <div className="border-b bg-white">
        <div className="container mx-auto flex flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <Button asChild variant="ghost" size="icon">
              <Link to="/admin">
                <ArrowLeft size={18} />
              </Link>
            </Button>
            <div>
              <div className="flex items-center gap-2">
                <Rocket className="h-5 w-5 text-purple-600" />
                <h1 className="font-heading text-xl font-bold text-slate-900">Cohort Programs Management</h1>
              </div>
              <p className="text-xs text-slate-500">
                Create and manage dynamic accelerator cohorts shown on public pages.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button asChild variant="outline" size="sm">
              <Link to="/cohorts" target="_blank" className="gap-1.5">
                <ExternalLink size={14} /> View Public Cohorts Page
              </Link>
            </Button>
            <Button onClick={handleReset} variant="outline" size="sm" className="gap-1.5">
              <Plus size={14} /> New Cohort
            </Button>
          </div>
        </div>
      </div>

      <main className="container mx-auto px-4 py-8">
        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          {/* Form Card */}
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>{selectedSlug ? "Edit Cohort Program" : "Add New Cohort Program"}</CardTitle>
              <CardDescription>
                Provide cohort details, upload an image or banner, and set the application status.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Program Title *</label>
                  <Input
                    placeholder="e.g. Tech & SaaS Startup Cohort"
                    value={form.title}
                    onChange={(e) => setForm((c) => ({ ...c, title: e.target.value }))}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Category</label>
                  <select
                    className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm"
                    value={form.category}
                    onChange={(e) => setForm((c) => ({ ...c, category: e.target.value as Cohort["category"] }))}
                  >
                    <option value="startup">Startup Cohort</option>
                    <option value="d2c">D2C Cohort</option>
                    <option value="upcoming">Upcoming Track</option>
                    <option value="general">General Accelerator</option>
                  </select>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Custom Slug (optional)</label>
                  <Input
                    placeholder="e.g. saas-cohort-2026"
                    value={form.slug}
                    onChange={(e) => setForm((c) => ({ ...c, slug: e.target.value }))}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Tagline / Subtitle</label>
                  <Input
                    placeholder="e.g. For early-stage tech & B2B founders"
                    value={form.tagline}
                    onChange={(e) => setForm((c) => ({ ...c, tagline: e.target.value }))}
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Duration</label>
                  <Input
                    placeholder="e.g. 8 Weeks"
                    value={form.duration}
                    onChange={(e) => setForm((c) => ({ ...c, duration: e.target.value }))}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Mode</label>
                  <Input
                    placeholder="e.g. Hybrid / Bengaluru"
                    value={form.mode}
                    onChange={(e) => setForm((c) => ({ ...c, mode: e.target.value }))}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Status Badge</label>
                  <Input
                    placeholder="e.g. Applications Open / Waitlist Open"
                    value={form.status}
                    onChange={(e) => setForm((c) => ({ ...c, status: e.target.value }))}
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Batch / Start Date</label>
                  <Input
                    placeholder="e.g. September 2026"
                    value={form.startDate}
                    onChange={(e) => setForm((c) => ({ ...c, startDate: e.target.value }))}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Application Link</label>
                  <Input
                    placeholder="e.g. /join-us or https://..."
                    value={form.applicationUrl}
                    onChange={(e) => setForm((c) => ({ ...c, applicationUrl: e.target.value }))}
                  />
                </div>
              </div>

              {/* Image Upload & Preview Box */}
              <div className="space-y-2 rounded-xl border border-dashed border-slate-200 bg-slate-50/50 p-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-800">Cohort Image / Banner</p>
                    <p className="text-xs text-slate-500">Upload to Cloudinary or paste an image URL below.</p>
                  </div>
                  <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-slate-900 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-slate-800 transition-colors">
                    <ImageUp size={14} />
                    {uploading ? "Uploading..." : "Upload Image"}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      disabled={uploading}
                      onChange={(e) => handleImageUpload(e.target.files?.[0])}
                    />
                  </label>
                </div>

                <Input
                  placeholder="https://res.cloudinary.com/... or paste image URL"
                  value={form.imageUrl}
                  onChange={(e) => setForm((c) => ({ ...c, imageUrl: e.target.value }))}
                />

                {form.imageUrl && (
                  <div className="relative mt-2 h-40 w-full overflow-hidden rounded-xl border border-slate-200 bg-slate-900">
                    <img src={form.imageUrl} alt={form.title} className="h-full w-full object-cover" />
                  </div>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Program Description</label>
                <Textarea
                  rows={4}
                  placeholder="Detail the curriculum, mentorship focus, funding partner access, and perks..."
                  value={form.description}
                  onChange={(e) => setForm((c) => ({ ...c, description: e.target.value }))}
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Highlights (One per line)</label>
                <Textarea
                  rows={3}
                  placeholder="1-on-1 Operator Mentorship&#10;Seed Grant Access&#10;Demo Day to 40+ VCs"
                  value={form.highlightsText}
                  onChange={(e) => setForm((c) => ({ ...c, highlightsText: e.target.value }))}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2 pt-2 border-t">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Display Order</label>
                  <Input
                    type="number"
                    value={form.order}
                    onChange={(e) => setForm((c) => ({ ...c, order: e.target.value }))}
                  />
                </div>

                <div className="flex items-center gap-2 pt-6">
                  <input
                    id="isActive"
                    type="checkbox"
                    checked={form.isActive}
                    onChange={(e) => setForm((c) => ({ ...c, isActive: e.target.checked }))}
                    className="h-4 w-4 rounded border-slate-300 text-purple-600 focus:ring-purple-500"
                  />
                  <label htmlFor="isActive" className="text-sm font-medium text-slate-700 cursor-pointer">
                    Publish Live (Active)
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                {selectedSlug && (
                  <Button type="button" variant="outline" onClick={handleReset}>
                    Cancel
                  </Button>
                )}
                <Button onClick={handleSave} disabled={saving} className="bg-purple-600 hover:bg-purple-700 text-white gap-2">
                  <CheckCircle2 size={16} />
                  {saving ? "Saving..." : selectedSlug ? "Update Cohort" : "Create Cohort"}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* List Card */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-heading text-lg font-bold text-slate-900">Existing Cohorts ({cohorts.length})</h2>
                <p className="text-xs text-slate-500">Live programs displayed on public site</p>
              </div>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-20 bg-white rounded-2xl border">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-purple-600 border-t-transparent" />
              </div>
            ) : cohorts.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center text-slate-500 space-y-2">
                  <Rocket className="mx-auto h-8 w-8 text-slate-400" />
                  <p className="font-medium text-sm">No cohorts in database yet.</p>
                  <p className="text-xs text-slate-400">Fill the form to add the first real cohort program!</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3.5">
                {cohorts.map((cohort) => (
                  <Card
                    key={cohort.slug}
                    className={`overflow-hidden transition-all ${
                      selectedSlug === cohort.slug ? "border-purple-500 ring-2 ring-purple-500/20" : "hover:border-slate-300"
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row gap-4 p-4">
                      {cohort.imageUrl ? (
                        <div className="relative h-28 sm:h-24 w-full sm:w-28 shrink-0 overflow-hidden rounded-xl bg-slate-900">
                          <img src={cohort.imageUrl} alt={cohort.title} className="h-full w-full object-cover" />
                        </div>
                      ) : (
                        <div className="flex h-28 sm:h-24 w-full sm:w-28 shrink-0 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
                          <Rocket size={28} />
                        </div>
                      )}

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <Badge variant="outline" className="text-[10px] uppercase font-bold text-purple-700 bg-purple-50">
                            {cohort.category}
                          </Badge>
                          <Badge variant="secondary" className="text-[10px]">
                            {cohort.status || "Open"}
                          </Badge>
                          {!cohort.isActive && (
                            <Badge variant="destructive" className="text-[10px]">
                              Draft (Hidden)
                            </Badge>
                          )}
                        </div>

                        <h3 className="font-heading font-bold text-base text-slate-900 truncate">{cohort.title}</h3>
                        {cohort.tagline && <p className="text-xs text-slate-500 truncate">{cohort.tagline}</p>}

                        <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-2">
                          {cohort.duration && <span>⏱️ {cohort.duration}</span>}
                          {cohort.mode && <span>📍 {cohort.mode}</span>}
                          {cohort.startDate && <span>🗓️ {cohort.startDate}</span>}
                        </div>
                      </div>

                      <div className="flex sm:flex-col items-center justify-end gap-2 shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(cohort)}
                          className="h-8 gap-1.5 text-xs flex-1 sm:flex-initial"
                        >
                          <Edit size={12} /> Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(cohort)}
                          className="h-8 text-rose-600 hover:text-rose-700 hover:bg-rose-50 text-xs flex-1 sm:flex-initial"
                        >
                          <Trash2 size={12} /> Delete
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminCohorts;
