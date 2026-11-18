import { useEffect, useState } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  submitMentorConnectRequestApi,
  type MentorConnectMode,
  type MentorConnectPayload,
  type SpeakerInvestorProfile,
} from "@/lib/api";
import { getAccount, getToken } from "@/lib/session";

type Props = {
  mentor: SpeakerInvestorProfile | null;
  onOpenChange: (open: boolean) => void;
};

const STAGES = ["Idea", "Pre-seed / MVP", "Seed", "Series A+", "Bootstrapped & growing"];
const MODES: { value: MentorConnectMode; label: string }[] = [
  { value: "any", label: "No preference" },
  { value: "video", label: "Video call" },
  { value: "in-person", label: "In person" },
  { value: "chat", label: "Chat / email" },
];

const emptyForm = (): MentorConnectPayload => {
  const account = getAccount();
  return {
    fullName: account?.fullName || "",
    email: account?.email || "",
    phone: account?.phone || "",
    startupName: "",
    stage: "",
    topic: "",
    message: "",
    preferredMode: "any",
  };
};

const selectClass =
  "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

const MentorConnectDialog = ({ mentor, onOpenChange }: Props) => {
  const [form, setForm] = useState<MentorConnectPayload>(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState("");

  useEffect(() => {
    if (mentor) {
      setForm(emptyForm());
      setError("");
      setDone("");
    }
  }, [mentor]);

  const set = <K extends keyof MentorConnectPayload>(key: K, value: MentorConnectPayload[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const expertise = mentor?.metadata?.expertise || [];

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!mentor) return;
    if (form.message.trim().length < 20) {
      setError("Tell the mentor a little more (at least 20 characters).");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const res = await submitMentorConnectRequestApi(mentor.slug, form, getToken());
      setDone(res.message);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not send your request.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={Boolean(mentor)} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        {done ? (
          <div className="py-6 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-violet-100 text-violet-700">
              <CheckCircle2 size={26} />
            </div>
            <h3 className="font-heading text-lg font-bold text-slate-900">Request sent</h3>
            <p className="mt-2 text-sm text-slate-600">{done}</p>
            <Button className="mt-6 bg-violet-600 hover:bg-violet-700" onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Request to connect with {mentor?.name}</DialogTitle>
              <DialogDescription>
                Our team reviews every request and introduces you over email if it's a good fit.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="mc-name">Your name *</Label>
                  <Input id="mc-name" required value={form.fullName} onChange={(e) => set("fullName", e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="mc-email">Email *</Label>
                  <Input id="mc-email" type="email" required value={form.email} onChange={(e) => set("email", e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="mc-startup">Startup name</Label>
                  <Input id="mc-startup" value={form.startupName} onChange={(e) => set("startupName", e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="mc-stage">Stage</Label>
                  <select id="mc-stage" className={selectClass} value={form.stage} onChange={(e) => set("stage", e.target.value)}>
                    <option value="">Select stage</option>
                    {STAGES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="mc-topic">What do you need help with? *</Label>
                <Input
                  id="mc-topic"
                  required
                  list="mc-topic-options"
                  placeholder="e.g. Go-to-market for B2B SaaS"
                  value={form.topic}
                  onChange={(e) => set("topic", e.target.value)}
                />
                {expertise.length > 0 && (
                  <datalist id="mc-topic-options">
                    {expertise.map((t) => (
                      <option key={t} value={t} />
                    ))}
                  </datalist>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="mc-message">Message *</Label>
                <Textarea
                  id="mc-message"
                  required
                  rows={5}
                  placeholder="Share some context: what you're building, where you're stuck, and what a great outcome from this conversation looks like."
                  value={form.message}
                  onChange={(e) => set("message", e.target.value)}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="mc-mode">Preferred format</Label>
                  <select
                    id="mc-mode"
                    className={selectClass}
                    value={form.preferredMode}
                    onChange={(e) => set("preferredMode", e.target.value as MentorConnectMode)}
                  >
                    {MODES.map((m) => (
                      <option key={m.value} value={m.value}>{m.label}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="mc-phone">Phone (optional)</Label>
                  <Input id="mc-phone" value={form.phone} onChange={(e) => set("phone", e.target.value)} />
                </div>
              </div>

              {error && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

              <Button type="submit" disabled={submitting} className="w-full bg-violet-600 hover:bg-violet-700">
                {submitting && <Loader2 size={16} className="mr-2 animate-spin" />}
                Send request
              </Button>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default MentorConnectDialog;
