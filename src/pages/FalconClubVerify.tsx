import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { AlertCircle, CheckCircle2, FileText, Lock, ShieldCheck, Upload } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  addFalconClubVerificationDocumentApi,
  getFalconClubVerificationApi,
  signFalconClubVerificationUploadApi,
  submitFalconClubVerificationApi,
  type FalconClubVerificationRequest,
} from "@/lib/api";

const ACCEPTED = ".pdf,.jpg,.jpeg,.png,.webp,.doc,.docx,.xls,.xlsx,.csv";
const MAX_BYTES = 15 * 1024 * 1024;

export default function FalconClubVerify() {
  const { token = "" } = useParams();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [request, setRequest] = useState<FalconClubVerificationRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [label, setLabel] = useState("");
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [submittedMessage, setSubmittedMessage] = useState("");

  useEffect(() => {
    getFalconClubVerificationApi(token)
      .then((res) => setRequest(res.request))
      .catch((err: unknown) =>
        setLoadError(err instanceof Error ? err.message : "This verification link is invalid or has expired.")
      )
      .finally(() => setLoading(false));
  }, [token]);

  const handleUpload = async (file: File) => {
    setError("");
    if (file.size > MAX_BYTES) {
      setError("Each document must be 15 MB or smaller.");
      return;
    }

    setUploading(true);
    try {
      const signature = await signFalconClubVerificationUploadApi(token);
      const formData = new FormData();
      formData.append("file", file);
      formData.append("api_key", signature.apiKey);
      formData.append("timestamp", String(signature.timestamp));
      formData.append("signature", signature.signature);
      formData.append("folder", signature.folder);
      if (signature.type) formData.append("type", signature.type);

      const uploadResponse = await fetch(signature.uploadUrl, { method: "POST", body: formData });
      const uploaded = await uploadResponse.json();
      if (!uploadResponse.ok || !uploaded?.public_id) {
        throw new Error(uploaded?.error?.message || "Upload failed. Please try again.");
      }

      const res = await addFalconClubVerificationDocumentApi(token, {
        publicId: uploaded.public_id,
        resourceType: uploaded.resource_type,
        format: uploaded.format,
        bytes: uploaded.bytes,
        originalName: file.name,
        label: label.trim(),
      });
      setRequest(res.request);
      setLabel("");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Upload failed. Please try again.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async () => {
    setError("");
    setSubmitting(true);
    try {
      const res = await submitFalconClubVerificationApi(token);
      setRequest(res.request);
      setSubmittedMessage(res.message);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Submission failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Navbar />

      <main className="max-w-2xl mx-auto px-4 py-12 sm:py-16">
        <div className="rounded-2xl border border-purple-200 border-t-4 border-t-purple-600 bg-white shadow-sm p-6 sm:p-8">
          <p className="text-xs font-bold uppercase tracking-widest text-purple-700">FALCON Club · Verification</p>
          <h1 className="mt-2 text-2xl sm:text-3xl font-bold text-slate-900">Secure document upload</h1>

          {loading ? (
            <p className="mt-6 text-sm text-slate-500">Loading your verification request…</p>
          ) : loadError ? (
            <div className="mt-6 p-4 rounded-xl border border-red-200 bg-red-50 text-sm text-red-700 flex items-start gap-3">
              <AlertCircle size={18} className="shrink-0 mt-0.5" />
              <span>{loadError} If you still need to share documents, reply to the verification email and our team will send a new link.</span>
            </div>
          ) : request ? (
            <>
              <p className="mt-3 text-sm text-slate-600">
                Hi <strong className="text-slate-900">{request.fullName}</strong>, the admissions team has asked for supporting information
                for your application ({request.companyName}).
              </p>

              <div className="mt-5 p-4 rounded-xl border-l-4 border-purple-600 bg-purple-50/60 text-sm text-slate-700 whitespace-pre-wrap">
                <p className="text-xs font-semibold uppercase tracking-wider text-purple-800 mb-1">What we need</p>
                {request.note}
              </div>

              <div className="mt-4 flex items-start gap-2 text-xs text-slate-500">
                <Lock size={14} className="shrink-0 mt-0.5 text-purple-600" />
                <span>
                  Files are stored privately and are visible only to the FALCON Club admissions team. They are never shown on the member directory.
                  This link expires on {new Date(request.expiresAt).toLocaleDateString()}.
                </span>
              </div>

              {submittedMessage || request.submittedAt ? (
                <div className="mt-6 p-4 rounded-xl border border-emerald-200 bg-emerald-50 text-sm text-emerald-800 flex items-start gap-3">
                  <CheckCircle2 size={18} className="shrink-0 mt-0.5" />
                  <span>
                    {submittedMessage || "Your documents have been submitted for review."} You can still add more files below if needed.
                  </span>
                </div>
              ) : null}

              <div className="mt-6 space-y-3">
                <label className="block text-xs font-medium text-slate-700">
                  Document description <span className="text-slate-400">(optional)</span>
                </label>
                <Input
                  placeholder="e.g. FY24 audited financials / Term sheet / CA net-worth certificate"
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  maxLength={120}
                />
                <input
                  ref={fileInputRef}
                  type="file"
                  accept={ACCEPTED}
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleUpload(file);
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  disabled={uploading}
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full border-purple-300 text-purple-800 hover:bg-purple-50 gap-2"
                >
                  <Upload size={16} />
                  {uploading ? "Uploading…" : "Choose file to upload"}
                </Button>
                <p className="text-[11px] text-slate-500">PDF, images, Word, Excel or CSV · up to 15 MB each · max 10 files.</p>
              </div>

              {error && (
                <div className="mt-4 p-3 rounded-lg border border-red-200 bg-red-50 text-sm text-red-700 flex items-start gap-2">
                  <AlertCircle size={16} className="shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <div className="mt-6">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                  Uploaded ({request.documents.length})
                </p>
                {request.documents.length === 0 ? (
                  <p className="text-sm text-slate-400">No documents uploaded yet.</p>
                ) : (
                  <ul className="divide-y divide-slate-100 rounded-xl border border-slate-200">
                    {request.documents.map((doc) => (
                      <li key={doc._id} className="flex items-center gap-3 px-4 py-3 text-sm">
                        <FileText size={16} className="text-purple-600 shrink-0" />
                        <div className="min-w-0">
                          <p className="font-medium text-slate-800 truncate">{doc.label || doc.originalName}</p>
                          {doc.label && <p className="text-xs text-slate-500 truncate">{doc.originalName}</p>}
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <Button
                type="button"
                disabled={submitting || uploading || request.documents.length === 0}
                onClick={handleSubmit}
                className="mt-6 w-full bg-purple-700 hover:bg-purple-800 text-white gap-2"
              >
                <ShieldCheck size={16} />
                {submitting ? "Submitting…" : "Submit documents for review"}
              </Button>
            </>
          ) : null}
        </div>
      </main>

      <Footer />
    </div>
  );
}
