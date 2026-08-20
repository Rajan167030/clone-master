import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Heart, ImageIcon, Loader2, MessageCircle, Send, Trash2, Users, X } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useIsMobile } from "@/hooks/use-mobile";
import { useToast } from "@/hooks/use-toast";
import {
  type CommunityPost,
  addCommunityCommentApi,
  createCommunityPostApi,
  deleteCommunityCommentApi,
  deleteCommunityPostApi,
  getCommunityFeedApi,
  getPublicCloudinaryUploadSignatureApi,
  toggleCommunityLikeApi,
} from "@/lib/api";
import { getAccount, getToken } from "@/lib/session";

const roleBadgeColor: Record<string, string> = {
  investor: "bg-emerald-100 text-emerald-700 border-emerald-200",
  founder: "bg-purple-100 text-purple-700 border-purple-200",
  user: "bg-blue-100 text-blue-700 border-blue-200",
  admin: "bg-rose-100 text-rose-700 border-rose-200",
  superadmin: "bg-rose-100 text-rose-700 border-rose-200",
};

const timeAgo = (iso: string) => {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString();
};

const PostComposer = ({ onPosted }: { onPosted: (post: CommunityPost) => void }) => {
  const { toast } = useToast();
  const token = getToken();
  const account = getAccount();
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [isPosting, setIsPosting] = useState(false);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const signature = await getPublicCloudinaryUploadSignatureApi({ folder: "founders-connect/community", resourceType: "image" });
      const formData = new FormData();
      formData.append("file", file);
      formData.append("api_key", signature.apiKey);
      formData.append("timestamp", String(signature.timestamp));
      formData.append("signature", signature.signature);
      formData.append("folder", signature.folder);
      formData.append("resource_type", "image");
      const uploadRes = await fetch(signature.uploadUrl, { method: "POST", body: formData });
      const data = (await uploadRes.json().catch(() => ({}))) as { secure_url?: string };
      if (!uploadRes.ok || !data.secure_url) throw new Error("Upload failed.");
      setImageUrl(data.secure_url);
    } catch (error) {
      toast({ variant: "destructive", title: "Image upload failed", description: error instanceof Error ? error.message : "Try again." });
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async () => {
    if (!token || !content.trim()) return;
    setIsPosting(true);
    try {
      const res = await createCommunityPostApi(token, { content: content.trim(), imageUrl: imageUrl || undefined });
      onPosted(res.post);
      setContent("");
      setImageUrl("");
    } catch (error) {
      toast({ variant: "destructive", title: "Couldn't post", description: error instanceof Error ? error.message : "Try again." });
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4 mb-6 shadow-sm">
      <div className="flex gap-3">
        <div className="w-10 h-10 rounded-full bg-violet-100 text-violet-700 flex items-center justify-center font-bold shrink-0">
          {account?.fullName?.charAt(0).toUpperCase() || "U"}
        </div>
        <div className="flex-1 space-y-2">
          <Textarea
            placeholder="Share an update, ask for intros, or post an opportunity with the community…"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={3}
            maxLength={3000}
          />
          {imageUrl && (
            <div className="relative inline-block">
              <img src={imageUrl} alt="attachment" className="max-h-40 rounded-lg border" />
              <button onClick={() => setImageUrl("")} className="absolute -top-2 -right-2 bg-slate-900 text-white rounded-full p-1">
                <X className="w-3 h-3" />
              </button>
            </div>
          )}
          <div className="flex items-center justify-between">
            <label className={`inline-flex items-center gap-1.5 text-xs cursor-pointer px-3 py-1.5 rounded-lg border ${isUploading ? "text-slate-400 border-slate-200" : "text-slate-600 border-slate-200 hover:bg-slate-50"}`}>
              {isUploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ImageIcon className="w-3.5 h-3.5" />}
              Add Photo
              <input type="file" accept="image/*" className="hidden" disabled={isUploading} onChange={handleImageChange} />
            </label>
            <Button onClick={handleSubmit} disabled={isPosting || !content.trim()} className="bg-violet-600 hover:bg-violet-700">
              {isPosting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
              Post
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

const PostCard = ({ post, onChange }: { post: CommunityPost; onChange: (post: CommunityPost) => void }) => {
  const { toast } = useToast();
  const token = getToken();
  const account = getAccount();
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [isCommenting, setIsCommenting] = useState(false);
  const [isLiking, setIsLiking] = useState(false);

  const handleLike = async () => {
    if (!token || isLiking) return;
    setIsLiking(true);
    try {
      const res = await toggleCommunityLikeApi(token, post._id);
      onChange(res.post);
    } catch {
      toast({ variant: "destructive", title: "Couldn't update like." });
    } finally {
      setIsLiking(false);
    }
  };

  const handleComment = async () => {
    if (!token || !commentText.trim()) return;
    setIsCommenting(true);
    try {
      const res = await addCommunityCommentApi(token, post._id, commentText.trim());
      onChange(res.post);
      setCommentText("");
    } catch (error) {
      toast({ variant: "destructive", title: "Couldn't add comment", description: error instanceof Error ? error.message : "Try again." });
    } finally {
      setIsCommenting(false);
    }
  };

  const handleDeletePost = async () => {
    if (!token) return;
    try {
      await deleteCommunityPostApi(token, post._id);
      onChange({ ...post, content: "[deleted]" });
    } catch {
      toast({ variant: "destructive", title: "Couldn't delete post." });
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!token) return;
    try {
      const res = await deleteCommunityCommentApi(token, post._id, commentId);
      onChange(res.post);
    } catch {
      toast({ variant: "destructive", title: "Couldn't delete comment." });
    }
  };

  const isMyPost = account?.id === post.authorId;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-3">
          {post.authorPhoto ? (
            <img src={post.authorPhoto} alt={post.authorName} className="w-10 h-10 rounded-full object-cover" />
          ) : (
            <div className="w-10 h-10 rounded-full bg-violet-100 text-violet-700 flex items-center justify-center font-bold">
              {post.authorName.charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <div className="flex items-center gap-2">
              <p className="text-sm font-bold text-slate-900">{post.authorName}</p>
              <Badge variant="outline" className={`text-[10px] ${roleBadgeColor[post.authorRole] || ""}`}>{post.authorRole}</Badge>
            </div>
            <p className="text-xs text-slate-500">{post.authorHeadline || ""} {post.authorHeadline ? "·" : ""} {timeAgo(post.createdAt)}</p>
          </div>
        </div>
        {isMyPost && (
          <button onClick={handleDeletePost} className="text-slate-400 hover:text-red-600">
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>

      <p className="text-sm text-slate-800 mt-3 whitespace-pre-wrap">{post.content}</p>
      {post.imageUrl && <img src={post.imageUrl} alt="post attachment" className="mt-3 rounded-xl border max-h-96 w-full object-cover" />}

      <div className="flex items-center gap-4 mt-3 pt-3 border-t border-slate-100">
        <button onClick={handleLike} disabled={isLiking} className={`flex items-center gap-1.5 text-xs font-semibold ${post.likedByMe ? "text-rose-600" : "text-slate-500 hover:text-rose-600"}`}>
          <Heart className={`w-4 h-4 ${post.likedByMe ? "fill-rose-600" : ""}`} /> {post.likeCount}
        </button>
        <button onClick={() => setShowComments((v) => !v)} className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-violet-600">
          <MessageCircle className="w-4 h-4" /> {post.comments.length}
        </button>
      </div>

      {showComments && (
        <div className="mt-3 pt-3 border-t border-slate-100 space-y-2.5">
          {post.comments.map((c) => (
            <div key={c._id} className="flex items-start justify-between gap-2 bg-slate-50 rounded-lg p-2.5">
              <div className="flex items-start gap-2">
                {c.authorPhoto ? (
                  <img src={c.authorPhoto} alt={c.authorName} className="w-6 h-6 rounded-full object-cover mt-0.5" />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-violet-100 text-violet-700 flex items-center justify-center text-[10px] font-bold mt-0.5">
                    {c.authorName.charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <p className="text-xs font-bold text-slate-800">{c.authorName} <span className="text-slate-400 font-normal">· {timeAgo(c.createdAt)}</span></p>
                  <p className="text-xs text-slate-600">{c.content}</p>
                </div>
              </div>
              {(account?.id === c.authorId) && (
                <button onClick={() => handleDeleteComment(c._id)} className="text-slate-300 hover:text-red-500 shrink-0">
                  <Trash2 className="w-3 h-3" />
                </button>
              )}
            </div>
          ))}
          <div className="flex items-center gap-2 pt-1">
            <input
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") void handleComment(); }}
              placeholder="Write a comment…"
              className="flex-1 text-xs border border-slate-200 rounded-full px-3 py-2 outline-none focus:border-violet-400"
            />
            <Button size="sm" onClick={handleComment} disabled={isCommenting || !commentText.trim()} className="bg-violet-600 hover:bg-violet-700">
              Send
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

const Community = () => {
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const token = useMemo(() => getToken(), []);
  const account = getAccount();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const loadedOnce = useRef(false);

  useEffect(() => {
    if (!token || loadedOnce.current) return;
    loadedOnce.current = true;
    getCommunityFeedApi(token)
      .then((res) => {
        setPosts(res.posts);
        setHasMore(res.posts.length >= 20);
      })
      .catch(() => toast({ variant: "destructive", title: "Couldn't load the feed." }))
      .finally(() => setIsLoading(false));
  }, [token, toast]);

  const loadMore = async () => {
    if (!token || posts.length === 0) return;
    setIsLoadingMore(true);
    try {
      const oldest = posts[posts.length - 1];
      const res = await getCommunityFeedApi(token, oldest.createdAt);
      setPosts((prev) => [...prev, ...res.posts]);
      setHasMore(res.posts.length >= 20);
    } finally {
      setIsLoadingMore(false);
    }
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

        <main className="px-4 py-6 sm:px-6 lg:px-8 max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.22em] text-violet-700">Community</p>
              <h1 className="mt-1 text-2xl font-bold text-slate-900">Founders & Investors Feed</h1>
            </div>
            <Link to="/community/messages" className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
              <Users className="w-4 h-4" /> Messages
            </Link>
          </div>

          <PostComposer onPosted={(post) => setPosts((prev) => [post, ...prev])} />

          {isLoading ? (
            <div className="flex flex-col items-center gap-3 py-16">
              <Loader2 className="w-8 h-8 animate-spin text-violet-600" />
            </div>
          ) : posts.length === 0 ? (
            <p className="text-sm text-slate-500 text-center py-16">No posts yet — be the first to share something with the community.</p>
          ) : (
            <div className="space-y-4">
              {posts.map((post) => (
                <PostCard key={post._id} post={post} onChange={(updated) => setPosts((prev) => prev.map((p) => (p._id === updated._id ? updated : p)))} />
              ))}
              {hasMore && (
                <div className="text-center pt-2">
                  <Button variant="outline" onClick={loadMore} disabled={isLoadingMore}>
                    {isLoadingMore ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                    Load More
                  </Button>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Community;
