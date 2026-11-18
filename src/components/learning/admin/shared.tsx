import { useState } from "react";
import { ImageUp, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getCloudinaryUploadSignatureApi, type Cohort, type LmsAccess } from "@/lib/api";
import { getToken } from "@/lib/session";

export const selectClass =
  "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

export const uploadImage = async (file: File, folder: string) => {
  const sig = await getCloudinaryUploadSignatureApi(getToken() || "", { folder });
  const fd = new FormData();
  fd.append("file", file);
  fd.append("api_key", sig.apiKey);
  fd.append("timestamp", String(sig.timestamp));
  fd.append("signature", sig.signature);
  fd.append("folder", sig.folder);
  if (sig.publicId) fd.append("public_id", sig.publicId);
  const res = await fetch(sig.uploadUrl, { method: "POST", body: fd });
  const data = (await res.json().catch(() => ({}))) as { secure_url?: string; error?: { message?: string } };
  if (!res.ok || !data.secure_url) throw new Error(data.error?.message || "Upload failed.");
  return data.secure_url;
};

export const ImageField = ({
  id,
  label,
  value,
  onChange,
  folder,
  onError,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  folder: string;
  onError: (msg: string) => void;
}) => {
  const [uploading, setUploading] = useState(false);
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      <div className="flex gap-2">
        {value && <img src={value} alt="" className="h-10 w-14 shrink-0 rounded object-cover" />}
        <Input id={id} placeholder="https://" value={value} onChange={(e) => onChange(e.target.value)} />
        <label className="inline-flex h-10 shrink-0 cursor-pointer items-center gap-1.5 rounded-md border border-input px-3 text-sm hover:bg-slate-50">
          {uploading ? <Loader2 size={14} className="animate-spin" /> : <ImageUp size={14} />}
          Upload
          <input
            type="file"
            accept="image/*"
            className="hidden"
            disabled={uploading}
            onChange={async (e) => {
              const file = e.target.files?.[0];
              e.target.value = "";
              if (!file) return;
              setUploading(true);
              try {
                onChange(await uploadImage(file, folder));
              } catch (err) {
                onError(err instanceof Error ? err.message : "Upload failed.");
              } finally {
                setUploading(false);
              }
            }}
          />
        </label>
      </div>
    </div>
  );
};

export const AccessField = ({
  access,
  cohortSlugs,
  cohorts,
  onChange,
}: {
  access: LmsAccess;
  cohortSlugs: string[];
  cohorts: Cohort[];
  onChange: (access: LmsAccess, cohortSlugs: string[]) => void;
}) => (
  <div className="space-y-2">
    <Label>Who can access</Label>
    <select className={selectClass} value={access} onChange={(e) => onChange(e.target.value as LmsAccess, cohortSlugs)}>
      <option value="public">Public: anyone, no login</option>
      <option value="members">Members: any logged-in account</option>
      <option value="cohort">Cohort only: accepted founders of selected cohorts</option>
    </select>
    {access === "cohort" && (
      <div className="rounded-lg border border-slate-200 p-3">
        {cohorts.length === 0 ? (
          <p className="text-xs text-slate-500">No cohorts found. Create one under Cohorts & Programs first.</p>
        ) : (
          <div className="grid gap-2 sm:grid-cols-2">
            {cohorts.map((c) => (
              <label key={c.slug} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  className="accent-violet-600"
                  checked={cohortSlugs.includes(c.slug)}
                  onChange={(e) =>
                    onChange(access, e.target.checked ? [...cohortSlugs, c.slug] : cohortSlugs.filter((s) => s !== c.slug))
                  }
                />
                {c.title}
              </label>
            ))}
          </div>
        )}
      </div>
    )}
  </div>
);

/** datetime-local <-> ISO helpers (local time). */
export const toLocalInput = (iso?: string | null) => {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};
export const fromLocalInput = (v: string) => (v ? new Date(v).toISOString() : null);
