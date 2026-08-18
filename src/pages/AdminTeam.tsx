import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, CheckCircle2, Edit, ImageUp, Plus, Trash2, UsersRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  createAdminTeamMemberApi,
  deleteAdminTeamMemberApi,
  getAdminTeamMembersApi,
  getCloudinaryUploadSignatureApi,
  updateAdminTeamMemberApi,
  type TeamMember,
} from "@/lib/api";
import { getToken } from "@/lib/session";

type TeamForm = {
  id?: string;
  name: string;
  role: string;
  imageUrl: string;
  linkedinUrl: string;
  order: string;
  isActive: boolean;
};

type CloudinaryUploadResponse = {
  secure_url?: string;
  error?: { message?: string };
};

const emptyForm: TeamForm = {
  name: "",
  role: "",
  imageUrl: "",
  linkedinUrl: "",
  order: "0",
  isActive: true,
};

const emptyPhoto =
  "data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='420' viewBox='0 0 600 420'%3E%3Crect width='600' height='420' rx='32' fill='%230f172a'/%3E%3Ccircle cx='300' cy='150' r='74' fill='%231e293b'/%3E%3Cpath d='M174 352c24-64 76-96 126-96s102 32 126 96' fill='%231e293b'/%3E%3C/svg%3E";

const AdminTeam = () => {
  const token = useMemo(() => getToken() || "", []);
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [form, setForm] = useState<TeamForm>(emptyForm);
  const [selectedId, setSelectedId] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const loadMembers = () => {
    if (!token) return;

    setLoading(true);
    getAdminTeamMembersApi(token)
      .then((response) => setMembers(response.members || []))
      .catch((error) => {
        window.alert(error instanceof Error ? error.message : "Unable to load team members.");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadMembers();
  }, []);

  const handlePhotoUpload = async (file?: File | null) => {
    if (!file || !token) return;

    setUploading(true);
    try {
      const signaturePayload = await getCloudinaryUploadSignatureApi(token, {
        folder: "founders-connect/team",
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
    if (!form.role.trim()) missing.push("Role");
    if (!form.imageUrl.trim()) missing.push("Photo");

    if (missing.length > 0) {
      window.alert(`Please provide ${missing.join(", ")} before saving.`);
      return;
    }

    const payload = {
      name: form.name.trim(),
      role: form.role.trim(),
      imageUrl: form.imageUrl.trim(),
      linkedinUrl: form.linkedinUrl.trim(),
      order: Number(form.order || 0),
      isActive: form.isActive,
    };

    setSaving(true);
    try {
      const response = selectedId
        ? await updateAdminTeamMemberApi(token, selectedId, payload)
        : await createAdminTeamMemberApi(token, payload);

      window.alert(response.message);
      setForm(emptyForm);
      setSelectedId("");
      loadMembers();
    } catch (error) {
      window.alert(error instanceof Error ? error.message : "Unable to save team member.");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (member: TeamMember) => {
    setSelectedId(member._id);
    setForm({
      id: member._id,
      name: member.name,
      role: member.role,
      imageUrl: member.imageUrl || "",
      linkedinUrl: member.linkedinUrl || "",
      order: String(member.order ?? 0),
      isActive: Boolean(member.isActive),
    });
  };

  const handleDelete = async (member: TeamMember) => {
    if (!token) return;
    if (!window.confirm(`Delete team member "${member.name}"?`)) return;

    try {
      const response = await deleteAdminTeamMemberApi(token, member._id);
      window.alert(response.message);
      if (selectedId === member._id) {
        setSelectedId("");
        setForm(emptyForm);
      }
      loadMembers();
    } catch (error) {
      window.alert(error instanceof Error ? error.message : "Unable to delete team member.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-700">Admin</p>
            <h1 className="text-2xl font-bold text-slate-900">Manage Team Members</h1>
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
              <CardTitle>{selectedId ? "Edit Team Member" : "Add Team Member"}</CardTitle>
              <CardDescription>Upload photo, add name, role, and LinkedIn URL for the Our Team page.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input placeholder="Name *" value={form.name} onChange={(e) => setForm((current) => ({ ...current, name: e.target.value }))} />
              <Input placeholder="Role (e.g. Visionary Leader) *" value={form.role} onChange={(e) => setForm((current) => ({ ...current, role: e.target.value }))} />
              
              <label className="block text-sm font-medium text-slate-700">
                Display Order
                <Input className="mt-1" type="number" value={form.order} onChange={(e) => setForm((current) => ({ ...current, order: e.target.value }))} />
              </label>

              <div className="space-y-2 rounded-xl border border-dashed border-slate-200 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">Photo</p>
                    <p className="text-xs text-slate-500">Upload a photo directly or paste an image URL.</p>
                  </div>
                  <Button type="button" variant="outline" className="gap-2" disabled={uploading} onClick={() => document.getElementById("team-photo-input")?.click()}>
                    <ImageUp className="h-4 w-4" />
                    {uploading ? "Uploading..." : "Upload"}
                  </Button>
                </div>
                <input id="team-photo-input" type="file" accept="image/*" className="hidden" onChange={(e) => void handlePhotoUpload(e.target.files?.[0])} />
                <Input placeholder="Photo URL *" value={form.imageUrl} onChange={(e) => setForm((current) => ({ ...current, imageUrl: e.target.value }))} />
                
                <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
                  <img src={form.imageUrl || emptyPhoto} alt={form.name || "Team preview"} className="h-56 w-full object-cover" />
                </div>
              </div>

              <Input placeholder="LinkedIn URL (optional)" value={form.linkedinUrl} onChange={(e) => setForm((current) => ({ ...current, linkedinUrl: e.target.value }))} />

              <label className="flex items-center gap-3 text-sm text-slate-700">
                <input type="checkbox" checked={form.isActive} onChange={(e) => setForm((current) => ({ ...current, isActive: e.target.checked }))} />
                Active on public page
              </label>

              <div className="flex flex-wrap gap-3">
                <Button onClick={() => void handleSave()} className="gap-2" disabled={saving}>
                  <CheckCircle2 className="h-4 w-4" />
                  {saving ? "Saving..." : selectedId ? "Update Member" : "Create Member"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setSelectedId("");
                    setForm(emptyForm);
                  }}
                >
                  Reset
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Team Members ({members.length})</CardTitle>
              <CardDescription>All team members displayed on the site.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {loading ? (
                <p className="py-8 text-center text-slate-500">Loading team members...</p>
              ) : members.length === 0 ? (
                <p className="py-8 text-center text-slate-500">No team members added yet.</p>
              ) : (
                members.map((member) => (
                  <div key={member._id} className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <div className="flex items-center gap-4">
                      <img
                        src={member.imageUrl || emptyPhoto}
                        alt={member.name}
                        className="h-16 w-16 rounded-xl object-cover"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-slate-900">{member.name}</h3>
                          <Badge variant={member.isActive ? "default" : "secondary"}>{member.isActive ? "Active" : "Inactive"}</Badge>
                        </div>
                        <p className="text-sm text-slate-600">{member.role}</p>
                        {member.linkedinUrl && (
                          <a href={member.linkedinUrl} target="_blank" rel="noreferrer" className="text-xs text-blue-600 hover:underline">
                            LinkedIn Profile
                          </a>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="outline" className="gap-1" onClick={() => handleEdit(member)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="destructive" className="gap-1" onClick={() => handleDelete(member)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default AdminTeam;
