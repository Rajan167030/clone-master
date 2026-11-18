import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Bot, FlaskConical, Landmark, MessageSquareText, Presentation, Sparkles } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { useSEO } from "@/hooks/useSEO";
import { getAiUsageApi, listAiArtifactsApi, type AiArtifactKind, type AiArtifactRow } from "@/lib/api";
import { getToken } from "@/lib/session";

const TOOLS = [
  {
    to: "/tools/pitch-deck",
    icon: Presentation,
    title: "AI Pitch Builder",
    text: "Turn your startup story into a 10–13 slide investor deck. Edit every slide and download it as PowerPoint.",
  },
  {
    to: "/tools/pitch-review",
    icon: MessageSquareText,
    title: "Pitch Review & Feedback",
    text: "An investor-style scorecard with red flags, sharper wording and the tough questions you'll be asked.",
  },
  {
    to: "/tools/validation",
    icon: FlaskConical,
    title: "Validation & Business Model",
    text: "Lean canvas, riskiest assumptions, cheap experiments to run next and business model options.",
  },
  {
    to: "/tools/investor-readiness",
    icon: Landmark,
    title: "Investor Readiness",
    text: "Find out if you're ready to raise, how much and from whom, plus a 90-day plan to close the gaps.",
  },
  {
    to: "/tools/assistant",
    icon: Bot,
    title: "AI Learning Assistant",
    text: "An always-on tutor for founder questions, grounded in Founder Academy courses.",
  },
];

const KIND_PATH: Record<AiArtifactKind, string> = {
  pitch_deck: "/tools/pitch-deck",
  pitch_review: "/tools/pitch-review",
  validation: "/tools/validation",
  investor_readiness: "/tools/investor-readiness",
};
const KIND_LABEL: Record<AiArtifactKind, string> = {
  pitch_deck: "Pitch deck",
  pitch_review: "Pitch review",
  validation: "Validation",
  investor_readiness: "Readiness",
};

const AiTools = () => {
  useSEO({ title: "AI Founder Tools | Founders Connect", description: "AI pitch builder, pitch review, validation, investor readiness and a learning assistant for founders." });
  const token = getToken();
  const [recent, setRecent] = useState<AiArtifactRow[]>([]);
  const [usage, setUsage] = useState<{ used: number; limit: number | null } | null>(null);

  useEffect(() => {
    if (!token) return;
    listAiArtifactsApi(token).then((r) => setRecent(r.artifacts.slice(0, 6))).catch(() => {});
    getAiUsageApi(token).then(setUsage).catch(() => {});
  }, [token]);

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <section className="border-b border-slate-200 bg-[#FAF7F0] py-12 md:py-16">
        <div className="container mx-auto max-w-6xl px-4">
          <p className="mb-2 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-violet-600">
            <Sparkles size={14} /> AI Founder Tools
          </p>
          <h1 className="max-w-3xl font-heading text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
            Your AI co-pilot from <span className="text-violet-600">idea to term sheet</span>
          </h1>
          <p className="mt-3 max-w-2xl text-base text-slate-600">
            Build your deck, pressure-test your idea and get investor-grade feedback in minutes, then refine it with mentors and the community.
          </p>
          {usage && usage.limit !== null && (
            <p className="mt-4 text-sm text-slate-500">{Math.max(0, usage.limit - usage.used)} of {usage.limit} AI requests left today</p>
          )}
        </div>
      </section>

      <main className="container mx-auto max-w-6xl space-y-12 px-4 py-10">
        {!token && (
          <div className="flex flex-col items-start gap-3 rounded-2xl border border-violet-200 bg-violet-50 p-5 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-violet-900">Log in with your Founders Connect account to use the AI tools. Your work is saved to your account.</p>
            <Button asChild className="bg-violet-600 hover:bg-violet-700"><Link to="/login">Log in</Link></Button>
          </div>
        )}

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {TOOLS.map((t) => (
            <Link key={t.to} to={t.to} className="group flex flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:border-violet-300 hover:shadow-md">
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-violet-100 text-violet-700">
                <t.icon size={22} />
              </div>
              <h2 className="font-heading text-lg font-bold text-slate-900">{t.title}</h2>
              <p className="mt-1 flex-1 text-sm text-slate-600">{t.text}</p>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-violet-700">
                Open <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
              </span>
            </Link>
          ))}
        </div>

        {recent.length > 0 && (
          <section>
            <h2 className="mb-4 font-heading text-xl font-bold text-slate-900">Recent work</h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {recent.map((r) => (
                <Link key={r._id} to={`${KIND_PATH[r.kind]}?id=${r._id}`} className="rounded-xl border border-slate-200 bg-white p-4 hover:border-violet-300">
                  <p className="text-[11px] font-bold uppercase tracking-wide text-violet-600">{KIND_LABEL[r.kind]}</p>
                  <p className="mt-0.5 truncate font-semibold text-slate-900">{r.title}</p>
                  <p className="text-xs text-slate-500">
                    {new Date(r.updatedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                    {r.score !== null ? ` · score ${r.score}` : ""}
                    {r.slideCount !== null ? ` · ${r.slideCount} slides` : ""}
                  </p>
                </Link>
              ))}
            </div>
          </section>
        )}

        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-sm text-slate-600">
          AI suggestions are a starting point, not professional legal, tax or investment advice. For a human second opinion,{" "}
          <Link to="/mentors" className="font-semibold text-violet-700 hover:underline">request time with a mentor</Link>.
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AiTools;
