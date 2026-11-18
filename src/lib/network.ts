import type { CofounderRole, CollabType, LookingFor, OpportunityType, StartupStage } from "@/lib/api";

export const STAGE_LABEL: Record<Exclude<StartupStage, "">, string> = {
  idea: "Idea",
  mvp: "MVP",
  early_revenue: "Early revenue",
  growth: "Growth",
  scaling: "Scaling",
};
export const stageLabel = (s?: string) => (s && s in STAGE_LABEL ? STAGE_LABEL[s as keyof typeof STAGE_LABEL] : "");

export const LOOKING_FOR_LABEL: Record<LookingFor, string> = {
  cofounder: "Co-founder",
  mentors: "Mentors",
  investors: "Investors",
  customers: "Customers",
  hires: "Hires",
  partners: "Partners",
  feedback: "Feedback",
};

export const COFOUNDER_ROLE_LABEL: Record<CofounderRole, string> = {
  tech: "Tech / CTO",
  product: "Product",
  business: "Business / CEO",
  sales: "Sales",
  marketing: "Marketing / Growth",
  design: "Design",
  operations: "Operations",
  finance: "Finance",
};

export const COMMITMENT_LABEL: Record<string, string> = {
  full_time: "Full-time",
  part_time: "Part-time",
  flexible: "Flexible",
  one_off: "One-off",
};

export const COLLAB_LABEL: Record<CollabType, string> = {
  cofounder: "Co-founder wanted",
  collaboration: "Collaboration",
  hiring: "Hiring",
  partnership: "Partnership",
  feedback: "Feedback wanted",
  freelance: "Freelance / gig",
};

export const OPPORTUNITY_LABEL: Record<OpportunityType, string> = {
  grant: "Grant",
  competition: "Competition",
  accelerator: "Accelerator",
  fellowship: "Fellowship",
  credits: "Credits & perks",
  pitch_event: "Pitch event",
  program: "Program",
  other: "Other",
};

export const timeAgo = (iso: string) => {
  const s = Math.max(1, Math.round((Date.now() - new Date(iso).getTime()) / 1000));
  if (s < 60) return "just now";
  const m = Math.round(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.round(h / 24);
  if (d < 30) return `${d}d ago`;
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
};

export const formatDeadline = (iso: string | null) => {
  if (!iso) return "Rolling";
  const d = new Date(iso);
  const days = Math.ceil((d.getTime() - Date.now()) / 86400000);
  const date = d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  if (days < 0) return `Closed ${date}`;
  if (days === 0) return "Closes today";
  if (days <= 14) return `${days} day${days === 1 ? "" : "s"} left · ${date}`;
  return `Deadline ${date}`;
};
