import type { ReactNode } from "react";
import { Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export const STAGES = ["Idea", "MVP / Pre-revenue", "Early revenue", "Growing revenue", "Scaling"];

export const selectClass =
  "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

type FieldProps = {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
  required?: boolean;
  hint?: string;
};

export const Field = ({ id, label, value, onChange, placeholder, rows, required, hint }: FieldProps) => (
  <div className="space-y-1.5">
    <Label htmlFor={id}>
      {label}
      {required && " *"}
    </Label>
    {rows ? (
      <Textarea id={id} rows={rows} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
    ) : (
      <Input id={id} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
    )}
    {hint && <p className="text-xs text-slate-400">{hint}</p>}
  </div>
);

export const StageSelect = ({ value, onChange }: { value: string; onChange: (v: string) => void }) => (
  <div className="space-y-1.5">
    <Label htmlFor="tf-stage">Stage</Label>
    <select id="tf-stage" className={selectClass} value={value} onChange={(e) => onChange(e.target.value)}>
      <option value="">Select stage</option>
      {STAGES.map((s) => <option key={s} value={s}>{s}</option>)}
    </select>
  </div>
);

export const GenerateBar = ({ loading, label, error, note }: { loading: boolean; label: string; error: string; note?: ReactNode }) => (
  <div className="space-y-3">
    {error && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
    <div className="flex flex-wrap items-center gap-3">
      <Button type="submit" disabled={loading} size="lg" className="bg-violet-600 hover:bg-violet-700">
        {loading ? <Loader2 size={16} className="mr-2 animate-spin" /> : <Sparkles size={16} className="mr-2" />}
        {loading ? "Working on it… (up to a minute)" : label}
      </Button>
      <p className="text-xs text-slate-400">{note || "AI output can be wrong. Check facts and numbers before using it."}</p>
    </div>
  </div>
);

export const FormCard = ({ children, onSubmit }: { children: ReactNode; onSubmit: (e: React.FormEvent) => void }) => (
  <form onSubmit={onSubmit} className="space-y-5 rounded-2xl border border-slate-200 bg-white p-5 sm:p-7">
    {children}
  </form>
);
