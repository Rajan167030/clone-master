import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowLeft, Bot, Plus, Trash2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import AssistantChat from "@/components/ai/AssistantChat";
import { useSEO } from "@/hooks/useSEO";
import {
  deleteAssistantThreadApi,
  getAssistantThreadApi,
  listAssistantThreadsApi,
  type AssistantThread,
} from "@/lib/api";
import { getToken } from "@/lib/session";

const SUGGESTIONS = [
  "Explain a SAFE vs a priced round",
  "How do I calculate CAC and LTV?",
  "What should a seed-stage data room contain?",
  "How do I run a customer discovery interview?",
];

const LearningAssistant = () => {
  useSEO({ title: "AI Learning Assistant | Founders Connect", description: "Your always-on founder tutor." });
  const token = getToken() || "";
  const [params, setParams] = useSearchParams();
  const [threads, setThreads] = useState<AssistantThread[]>([]);
  const [thread, setThread] = useState<AssistantThread | null>(null);
  const threadId = params.get("thread");

  useEffect(() => {
    listAssistantThreadsApi(token).then((r) => setThreads(r.threads)).catch(() => {});
  }, [token]);

  useEffect(() => {
    if (!threadId) return setThread(null);
    if (thread?._id === threadId) return;
    getAssistantThreadApi(token, threadId).then((r) => setThread(r.thread)).catch(() => setParams({}));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [threadId, token]);

  const onThread = (t: AssistantThread) => {
    setThread(t);
    setThreads((prev) => [t, ...prev.filter((x) => x._id !== t._id)]);
    if (threadId !== t._id) setParams({ thread: t._id }, { replace: true });
  };

  const remove = async (t: AssistantThread) => {
    if (!window.confirm("Delete this conversation?")) return;
    await deleteAssistantThreadApi(token, t._id).catch(() => {});
    setThreads((prev) => prev.filter((x) => x._id !== t._id));
    if (thread?._id === t._id) setParams({});
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="container mx-auto grid max-w-6xl gap-6 px-4 py-6 lg:grid-cols-[260px_1fr]">
        <aside className="space-y-3">
          <Link to="/tools" className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-violet-700">
            <ArrowLeft size={12} /> AI tools
          </Link>
          <Button className="w-full bg-violet-600 hover:bg-violet-700" onClick={() => setParams({})}>
            <Plus size={14} className="mr-1" /> New conversation
          </Button>
          <ul className="max-h-[60vh] space-y-1 overflow-y-auto rounded-2xl border border-slate-200 bg-white p-2">
            {threads.length === 0 && <li className="p-2 text-sm text-slate-400">No conversations yet.</li>}
            {threads.map((t) => (
              <li key={t._id} className="group flex items-center">
                <button
                  type="button"
                  onClick={() => setParams({ thread: t._id })}
                  className={`min-w-0 flex-1 truncate rounded-lg px-2 py-1.5 text-left text-sm ${
                    t._id === thread?._id ? "bg-violet-100 text-violet-900" : "text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  {t.title}
                </button>
                <button type="button" onClick={() => remove(t)} className="p-1 text-slate-300 opacity-0 hover:text-red-600 group-hover:opacity-100" aria-label="Delete">
                  <Trash2 size={13} />
                </button>
              </li>
            ))}
          </ul>
        </aside>
        <main className="rounded-2xl border border-slate-200 bg-slate-50/50 p-4">
          <div className="mb-3 flex items-center gap-2">
            <Bot size={18} className="text-violet-600" />
            <h1 className="font-heading text-lg font-bold text-slate-900">{thread?.title || "AI Learning Assistant"}</h1>
          </div>
          <AssistantChat thread={thread} onThread={onThread} suggestions={SUGGESTIONS} />
        </main>
      </div>
    </div>
  );
};

export default LearningAssistant;
