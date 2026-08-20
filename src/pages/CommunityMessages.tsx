import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Loader2, Send } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { useToast } from "@/hooks/use-toast";
import {
  type CommunityConversation,
  type CommunityDirectMessage,
  getCommunityThreadApi,
  listCommunityConversationsApi,
  sendCommunityMessageApi,
} from "@/lib/api";
import { getAccount, getToken } from "@/lib/session";

const timeAgo = (iso: string) => {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "now";
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  return `${Math.floor(hours / 24)}d`;
};

const ConversationList = ({
  conversations,
  activeUserId,
  isLoading,
}: {
  conversations: CommunityConversation[];
  activeUserId?: string;
  isLoading: boolean;
}) => (
  <div className="divide-y divide-slate-100">
    {isLoading ? (
      <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 animate-spin text-violet-600" /></div>
    ) : conversations.length === 0 ? (
      <p className="text-sm text-slate-500 text-center py-10 px-4">No conversations yet. Message someone from their profile.</p>
    ) : (
      conversations.map((c) => (
        <Link
          key={c.userId}
          to={`/community/messages/${c.userId}`}
          className={`flex items-center gap-3 px-4 py-3 hover:bg-slate-50 ${activeUserId === c.userId ? "bg-violet-50" : ""}`}
        >
          {c.profilePhoto ? (
            <img src={c.profilePhoto} alt={c.fullName} className="w-10 h-10 rounded-full object-cover shrink-0" />
          ) : (
            <div className="w-10 h-10 rounded-full bg-violet-100 text-violet-700 flex items-center justify-center font-bold shrink-0">
              {c.fullName.charAt(0).toUpperCase()}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-bold text-slate-900 truncate">{c.fullName}</p>
              <span className="text-[10px] text-slate-400 shrink-0">{timeAgo(c.lastMessageAt)}</span>
            </div>
            <p className="text-xs text-slate-500 truncate">{c.lastMessage}</p>
          </div>
          {c.unreadCount > 0 && (
            <span className="shrink-0 bg-violet-600 text-white text-[10px] font-bold rounded-full h-5 w-5 flex items-center justify-center">
              {c.unreadCount}
            </span>
          )}
        </Link>
      ))
    )}
  </div>
);

const ThreadView = ({ userId }: { userId: string }) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const token = getToken();
  const account = getAccount();
  const [participant, setParticipant] = useState<{ fullName: string; role: string; profilePhoto?: string } | null>(null);
  const [messages, setMessages] = useState<CommunityDirectMessage[]>([]);
  const [text, setText] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const seenIds = useRef<Set<string>>(new Set());

  const load = async (silent = false) => {
    if (!token) return;
    try {
      const res = await getCommunityThreadApi(token, userId);
      setParticipant(res.participant);
      const fresh = res.messages.filter((m) => !seenIds.current.has(m._id));
      if (fresh.length > 0 || !silent) {
        res.messages.forEach((m) => seenIds.current.add(m._id));
        setMessages(res.messages);
      }
    } catch (error) {
      if (!silent) toast({ variant: "destructive", title: "Couldn't load conversation." });
    } finally {
      if (!silent) setIsLoading(false);
    }
  };

  useEffect(() => {
    seenIds.current = new Set();
    setIsLoading(true);
    void load(false);
    const interval = setInterval(() => void load(true), 4000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  const handleSend = async () => {
    if (!token || !text.trim()) return;
    setIsSending(true);
    try {
      const res = await sendCommunityMessageApi(token, userId, text.trim());
      seenIds.current.add(res.message._id);
      setMessages((prev) => [...prev, res.message]);
      setText("");
    } catch (error) {
      toast({ variant: "destructive", title: "Couldn't send message", description: error instanceof Error ? error.message : "Try again." });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3 border-b border-slate-100 px-4 py-3">
        <button onClick={() => navigate("/community/messages")} className="lg:hidden text-slate-500">
          <ArrowLeft className="w-5 h-5" />
        </button>
        {participant?.profilePhoto ? (
          <img src={participant.profilePhoto} alt={participant.fullName} className="w-9 h-9 rounded-full object-cover" />
        ) : (
          <div className="w-9 h-9 rounded-full bg-violet-100 text-violet-700 flex items-center justify-center font-bold text-sm">
            {participant?.fullName?.charAt(0).toUpperCase() || "?"}
          </div>
        )}
        <div>
          <p className="text-sm font-bold text-slate-900">{participant?.fullName || "Loading…"}</p>
          <p className="text-xs text-slate-500 capitalize">{participant?.role}</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {isLoading ? (
          <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 animate-spin text-violet-600" /></div>
        ) : (
          messages.map((m) => {
            const isMine = m.senderId === account?.id;
            return (
              <div key={m._id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[75%] rounded-2xl px-3.5 py-2 text-sm ${isMine ? "bg-violet-600 text-white" : "bg-slate-100 text-slate-800"}`}>
                  <p className="whitespace-pre-wrap">{m.text}</p>
                  <p className={`text-[10px] mt-1 ${isMine ? "text-violet-200" : "text-slate-400"}`}>{timeAgo(m.createdAt)}</p>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      <div className="border-t border-slate-100 p-3 flex items-center gap-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") void handleSend(); }}
          placeholder="Type a message…"
          className="flex-1 text-sm border border-slate-200 rounded-full px-4 py-2.5 outline-none focus:border-violet-400"
        />
        <Button size="icon" onClick={handleSend} disabled={isSending || !text.trim()} className="bg-violet-600 hover:bg-violet-700 rounded-full shrink-0">
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

const CommunityMessages = () => {
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const { userId } = useParams<{ userId?: string }>();
  const token = getToken();
  const account = getAccount();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [conversations, setConversations] = useState<CommunityConversation[]>([]);
  const [isLoadingList, setIsLoadingList] = useState(true);

  const refreshConversations = () => {
    if (!token) return;
    listCommunityConversationsApi(token)
      .then((res) => setConversations(res.conversations))
      .catch(() => toast({ variant: "destructive", title: "Couldn't load conversations." }))
      .finally(() => setIsLoadingList(false));
  };

  useEffect(() => {
    refreshConversations();
    const interval = setInterval(refreshConversations, 6000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  if (!token) return null;

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar isMobile={isMobile} mobileOpen={mobileSidebarOpen} onMobileOpenChange={setMobileSidebarOpen} />

      <div className="lg:ml-64">
        <Topbar
          userRole={account?.role || "Member"}
          userName={account?.fullName || "Member"}
          referralCode={account?.referralCode || "N/A"}
          isMobile={isMobile}
          onMenuClick={() => setMobileSidebarOpen(true)}
        />

        <main className="px-4 py-6 sm:px-6 lg:px-8">
          <p className="text-sm font-medium uppercase tracking-[0.22em] text-violet-700 mb-1">Community</p>
          <h1 className="text-2xl font-bold text-slate-900 mb-4">Messages</h1>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden grid grid-cols-1 lg:grid-cols-[320px_1fr] h-[calc(100vh-220px)] min-h-[420px]">
            <div className={`border-r border-slate-100 overflow-y-auto ${isMobile && userId ? "hidden" : ""}`}>
              <ConversationList conversations={conversations} activeUserId={userId} isLoading={isLoadingList} />
            </div>
            <div className={isMobile && !userId ? "hidden" : "flex flex-col"}>
              {userId ? (
                <ThreadView userId={userId} key={userId} />
              ) : (
                <div className="flex-1 flex items-center justify-center text-sm text-slate-400">
                  Select a conversation to start messaging.
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default CommunityMessages;
