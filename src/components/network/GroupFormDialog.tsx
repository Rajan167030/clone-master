import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { fromLocalInput, toLocalInput } from "@/components/learning/admin/shared";
import type { GroupData, GroupInput } from "@/lib/api";

const selectClass = "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm";

const blank: GroupInput = {
  name: "",
  description: "",
  kind: "group",
  category: "topic",
  tags: [],
  coverImageUrl: "",
  privacy: "open",
  maxMembers: 0,
  meetingCadence: "",
  nextMeetingAt: null,
  meetingUrl: "",
};

type Props = {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onSubmit: (g: GroupInput) => void;
  saving: boolean;
  title: string;
  initial?: GroupData;
};

const GroupFormDialog = ({ open, onOpenChange, onSubmit, saving, title, initial }: Props) => {
  const [g, setG] = useState<GroupInput>(blank);
  useEffect(() => {
    if (open) setG(initial ? { ...blank, ...initial } : blank);
  }, [open, initial]);
  const set = <K extends keyof GroupInput>(k: K, v: GroupInput[K]) => setG((p) => ({ ...p, [k]: v }));
  const circle = g.kind === "circle";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader><DialogTitle>{title}</DialogTitle></DialogHeader>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit({ ...g, tags: (g.tags || []).map((t) => t.trim()).filter(Boolean) });
          }}
          className="space-y-3"
        >
          {!initial && (
            <div className="grid grid-cols-2 gap-2">
              {(["group", "circle"] as const).map((k) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => setG((p) => ({ ...p, kind: k, privacy: k === "circle" ? "private" : p.privacy, maxMembers: k === "circle" ? 10 : 0 }))}
                  className={`rounded-xl border p-3 text-left text-sm ${g.kind === k ? "border-violet-500 bg-violet-50" : "border-slate-200 hover:border-violet-200"}`}
                >
                  <p className="font-semibold text-slate-900">{k === "circle" ? "Peer circle" : "Group"}</p>
                  <p className="text-xs text-slate-500">{k === "circle" ? "6–12 founders, regular meetings" : "Open discussion for any size"}</p>
                </button>
              ))}
            </div>
          )}
          <div className="space-y-1.5"><Label>Name *</Label><Input required maxLength={80} value={g.name} onChange={(e) => set("name", e.target.value)} /></div>
          <div className="space-y-1.5"><Label>Description</Label><Textarea rows={3} value={g.description} onChange={(e) => set("description", e.target.value)} /></div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Category</Label>
              <select className={selectClass} value={g.category} onChange={(e) => set("category", e.target.value as GroupData["category"])}>
                <option value="topic">Topic</option>
                <option value="sector">Sector</option>
                <option value="city">City</option>
                <option value="stage">Stage</option>
                <option value="cohort">Cohort</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <Label>Who can join</Label>
              <select className={selectClass} value={g.privacy} onChange={(e) => set("privacy", e.target.value as GroupData["privacy"])}>
                <option value="open">Anyone (instant)</option>
                <option value="private">By approval</option>
              </select>
            </div>
            <div className="space-y-1.5"><Label>Tags (comma separated)</Label><Input value={(g.tags || []).join(", ")} onChange={(e) => set("tags", e.target.value.split(",").map((t) => t.trimStart()))} /></div>
            <div className="space-y-1.5"><Label>Max members {circle ? "(max 20)" : "(0 = unlimited)"}</Label><Input type="number" min={0} max={circle ? 20 : 5000} value={g.maxMembers ?? 0} onChange={(e) => set("maxMembers", Number(e.target.value))} /></div>
          </div>
          {circle && (
            <>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5"><Label>Meeting cadence</Label><Input placeholder="Every other Thursday, 7pm IST" value={g.meetingCadence} onChange={(e) => set("meetingCadence", e.target.value)} /></div>
                <div className="space-y-1.5"><Label>Next meeting</Label><Input type="datetime-local" value={toLocalInput(g.nextMeetingAt)} onChange={(e) => set("nextMeetingAt", fromLocalInput(e.target.value))} /></div>
              </div>
              <div className="space-y-1.5"><Label>Meeting link (members only)</Label><Input placeholder="https://meet.google.com/…" value={g.meetingUrl} onChange={(e) => set("meetingUrl", e.target.value)} /></div>
            </>
          )}
          <div className="space-y-1.5"><Label>Cover image URL</Label><Input placeholder="https://" value={g.coverImageUrl} onChange={(e) => set("coverImageUrl", e.target.value)} /></div>
          <Button type="submit" disabled={saving} className="w-full bg-violet-600 hover:bg-violet-700">{saving && <Loader2 size={14} className="mr-1.5 animate-spin" />} Save</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default GroupFormDialog;
