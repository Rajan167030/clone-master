import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, MessageCircle, Search, UserPlus, UserCheck } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { useToast } from "@/hooks/use-toast";
import { type DirectoryMember, getCommunityDirectoryApi, toggleFollowApi } from "@/lib/api";
import { getAccount, getToken } from "@/lib/session";

const roleTabs: Array<{ label: string; value: "all" | "founder" | "investor" }> = [
  { label: "All", value: "all" },
  { label: "Founders", value: "founder" },
  { label: "Investors", value: "investor" },
];

const roleBadge: Record<string, string> = {
  founder: "bg-purple-100 text-purple-700 border-purple-200",
  investor: "bg-emerald-100 text-emerald-700 border-emerald-200",
};

const MemberCard = ({
  member,
  onFollowToggled,
}: {
  member: DirectoryMember;
  onFollowToggled: (id: string, next: DirectoryMember) => void;
}) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const token = getToken();
  const [isFollowLoading, setIsFollowLoading] = useState(false);

  const handleFollow = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!token || isFollowLoading) return;
    setIsFollowLoading(true);
    try {
      const res = await toggleFollowApi(token, member.id);
      onFollowToggled(member.id, {
        ...member,
        isFollowing: res.isFollowing,
        followersCount: res.followersCount,
      });
    } catch (error) {
      toast({ variant: "destructive", title: "Couldn't update follow", description: error instanceof Error ? error.message : "Try again." });
    } finally {
      setIsFollowLoading(false);
    }
  };

  const handleMessage = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/community/messages/${member.id}`);
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => navigate(`/profile/${member.profileId}`)}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && navigate(`/profile/${member.profileId}`)}
      className="group flex flex-col items-center rounded-2xl border border-slate-200 bg-white p-5 text-center shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg cursor-pointer"
    >
      <div className="relative">
        {member.profilePhoto ? (
          <img
            src={member.profilePhoto}
            alt={member.fullName}
            className="h-20 w-20 rounded-full object-cover border-2 border-white shadow-md ring-1 ring-slate-100"
          />
        ) : (
          <div className="h-20 w-20 rounded-full bg-gradient-to-br from-violet-500 to-indigo-500 text-white flex items-center justify-center text-2xl font-bold shadow-md">
            {member.fullName.charAt(0).toUpperCase()}
          </div>
        )}
      </div>

      <p className="mt-3 text-sm font-bold text-slate-900 truncate max-w-full">{member.fullName}</p>
      <span className={`mt-1 inline-block rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${roleBadge[member.role]}`}>
        {member.role}
      </span>

      {member.company ? (
        <p className="mt-1.5 text-xs font-medium text-slate-500 truncate max-w-full">{member.company}</p>
      ) : member.headline ? (
        <p className="mt-1.5 text-xs text-slate-500 line-clamp-2">{member.headline}</p>
      ) : null}

      {member.city && <p className="mt-0.5 text-[11px] text-slate-400">{member.city}</p>}

      <p className="mt-2 text-[11px] text-slate-400">
        <span className="font-semibold text-slate-600">{member.followersCount}</span> follower{member.followersCount === 1 ? "" : "s"}
      </p>

      <div className="mt-4 flex w-full items-center gap-2">
        <Button
          size="sm"
          onClick={handleFollow}
          disabled={isFollowLoading}
          variant={member.isFollowing ? "outline" : "default"}
          className={`flex-1 gap-1.5 ${member.isFollowing ? "" : "bg-violet-600 hover:bg-violet-700"}`}
        >
          {isFollowLoading ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : member.isFollowing ? (
            <UserCheck className="w-3.5 h-3.5" />
          ) : (
            <UserPlus className="w-3.5 h-3.5" />
          )}
          {member.isFollowing ? "Following" : "Follow"}
        </Button>
        <Button size="sm" variant="outline" onClick={handleMessage} className="px-2.5">
          <MessageCircle className="w-3.5 h-3.5" />
        </Button>
      </div>
    </div>
  );
};

const CommunityDirectory = () => {
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const token = useMemo(() => getToken(), []);
  const account = getAccount();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [role, setRole] = useState<"all" | "founder" | "investor">("all");
  const [search, setSearch] = useState("");
  const [members, setMembers] = useState<DirectoryMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const searchDebounce = useRef<ReturnType<typeof setTimeout>>();

  const fetchMembers = useCallback(
    (nextPage: number, nextRole: typeof role, nextSearch: string, append: boolean) => {
      if (!token) return;
      if (append) setIsLoadingMore(true);
      else setIsLoading(true);

      getCommunityDirectoryApi(token, { role: nextRole, search: nextSearch, page: nextPage })
        .then((res) => {
          setMembers((prev) => (append ? [...prev, ...res.members] : res.members));
          setHasMore(res.hasMore);
          setPage(res.page);
        })
        .catch(() => toast({ variant: "destructive", title: "Couldn't load the directory." }))
        .finally(() => {
          setIsLoading(false);
          setIsLoadingMore(false);
        });
    },
    [token, toast],
  );

  useEffect(() => {
    fetchMembers(1, role, search, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role]);

  useEffect(() => {
    clearTimeout(searchDebounce.current);
    searchDebounce.current = setTimeout(() => {
      fetchMembers(1, role, search, false);
    }, 350);
    return () => clearTimeout(searchDebounce.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const handleFollowToggled = (id: string, updated: DirectoryMember) => {
    setMembers((prev) => prev.map((m) => (m.id === id ? updated : m)));
  };

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

        <main className="px-4 py-6 sm:px-6 lg:px-8 max-w-6xl mx-auto">
          <div className="mb-6">
            <p className="text-sm font-medium uppercase tracking-[0.22em] text-violet-700">Community</p>
            <h1 className="mt-1 text-2xl font-bold text-slate-900">Founders & Investors Directory</h1>
            <p className="mt-1 text-sm text-slate-500">Browse every founder and investor in the community, follow them, and start a conversation.</p>
          </div>

          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="inline-flex rounded-xl border border-slate-200 bg-white p-1">
              {roleTabs.map((tab) => (
                <button
                  key={tab.value}
                  onClick={() => setRole(tab.value)}
                  className={`rounded-lg px-4 py-1.5 text-sm font-semibold transition-colors ${
                    role === tab.value ? "bg-violet-600 text-white" : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="relative sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, city, headline…"
                className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm outline-none focus:border-violet-400"
              />
            </div>
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center gap-3 py-16">
              <Loader2 className="w-8 h-8 animate-spin text-violet-600" />
            </div>
          ) : members.length === 0 ? (
            <p className="text-sm text-slate-500 text-center py-16">No members found.</p>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                {members.map((member) => (
                  <MemberCard key={member.id} member={member} onFollowToggled={handleFollowToggled} />
                ))}
              </div>

              {hasMore && (
                <div className="text-center pt-6">
                  <Button variant="outline" disabled={isLoadingMore} onClick={() => fetchMembers(page + 1, role, search, true)}>
                    {isLoadingMore ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                    Load More
                  </Button>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default CommunityDirectory;
