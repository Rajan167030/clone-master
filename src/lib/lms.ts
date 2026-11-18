import {
  BookOpen,
  ClipboardCheck,
  FileText,
  FolderDown,
  PlayCircle,
  Radio,
  type LucideIcon,
} from "lucide-react";
import type { LessonType, LmsAccess, LmsLockReason } from "@/lib/api";

export const LESSON_META: Record<LessonType, { label: string; icon: LucideIcon }> = {
  video: { label: "Video", icon: PlayCircle },
  reading: { label: "Reading", icon: BookOpen },
  live: { label: "Live session", icon: Radio },
  quiz: { label: "Quiz", icon: ClipboardCheck },
  assignment: { label: "Assignment", icon: FileText },
  resource: { label: "Resources", icon: FolderDown },
};

export const ACCESS_LABEL: Record<LmsAccess, string> = {
  public: "Free for everyone",
  members: "Members",
  cohort: "Cohort only",
};

export const lockMessage = (reason: LmsLockReason) =>
  reason === "login"
    ? "Log in to unlock this content."
    : reason === "cohort"
      ? "Available to accepted founders of this cohort."
      : "";

export const formatMinutes = (mins: number) => {
  if (!mins) return "";
  if (mins < 60) return `${mins} min`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m ? `${h}h ${m}m` : `${h}h`;
};

export const formatDateTime = (iso?: string | null) =>
  iso
    ? new Date(iso).toLocaleString("en-IN", {
        weekday: "short",
        day: "numeric",
        month: "short",
        hour: "numeric",
        minute: "2-digit",
      })
    : "";

/** Turns a YouTube / Vimeo / Loom / Google Drive share URL into an embeddable one. */
export const getEmbed = (url?: string): { kind: "iframe" | "video" | "none"; src: string } => {
  if (!url) return { kind: "none", src: "" };
  try {
    const u = new URL(url);
    const host = u.hostname.replace(/^www\./, "");
    if (host === "youtu.be") return { kind: "iframe", src: `https://www.youtube.com/embed/${u.pathname.slice(1)}` };
    if (host.endsWith("youtube.com")) {
      const id = u.searchParams.get("v") || u.pathname.match(/\/(embed|shorts|live)\/([^/?]+)/)?.[2];
      if (id) return { kind: "iframe", src: `https://www.youtube.com/embed/${id}` };
    }
    if (host === "vimeo.com") {
      const id = u.pathname.split("/").filter(Boolean)[0];
      if (id) return { kind: "iframe", src: `https://player.vimeo.com/video/${id}` };
    }
    if (host === "player.vimeo.com") return { kind: "iframe", src: url };
    if (host.endsWith("loom.com")) return { kind: "iframe", src: url.replace("/share/", "/embed/") };
    if (host === "drive.google.com") {
      const id = u.pathname.match(/\/file\/d\/([^/]+)/)?.[1];
      if (id) return { kind: "iframe", src: `https://drive.google.com/file/d/${id}/preview` };
    }
    if (/\.(mp4|webm|ogg|mov)$/i.test(u.pathname) || host.endsWith("res.cloudinary.com")) return { kind: "video", src: url };
    return { kind: "iframe", src: url };
  } catch {
    return { kind: "none", src: "" };
  }
};
