  "use client";

import Link from "next/link";
import { useState, useRef, useEffect, useCallback, type Dispatch, type SetStateAction } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { PostCard } from "@/components/post-card";
import { mockPosts } from "@/lib/mock-data";
import { fetchPosts, createPost, updatePost, deletePost, likePost, unlikePost, replyToPost, type Post as ApiPost, type User as ApiUser } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import {
  PenSquare,
  Eye,
  GraduationCap,
  Users,
  Lock,
  Filter,
  TrendingUp,
  Clock,
  Sparkles,
  LayoutGrid,
  Layers,
  ChevronLeft,
  ChevronRight,
  Heart,
  MessageCircle,
  Share2,
  X,
  Loader2,
  AlertCircle,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";

const visibilityOptions: { value: "everyone" | "students" | "faculty" | "alumni"; label: string; icon: typeof Eye }[] = [
  { value: "everyone", label: "Everyone", icon: Eye },
  { value: "students", label: "Students", icon: GraduationCap },
  { value: "faculty", label: "Faculty", icon: Users },
  { value: "alumni", label: "Alumni", icon: Lock },
];

type VisibilityAudience = (typeof visibilityOptions)[number]["value"];

const postTypes: { value: "looking-for" | "offering" | "discussion"; label: string; color: string }[] = [
  { value: "looking-for", label: "Looking For", color: "bg-blue-500" },
  { value: "offering", label: "Offering", color: "bg-green-500" },
  { value: "discussion", label: "Discussion", color: "bg-purple-500" },
];

const typeColors = {
  "looking-for": "bg-blue-100 text-blue-700",
  offering: "bg-green-100 text-green-700",
  discussion: "bg-purple-100 text-purple-700",
};

type FeedPost = (ApiPost & {
  repliesList?: ApiPost["repliesList"];
  visibilityGroups?: ApiPost["visibilityGroups"];
}) | (typeof mockPosts)[number];

const ensureAudiences = (groups?: VisibilityAudience[]): VisibilityAudience[] => {
  if (!groups || groups.length === 0) {
    return ["everyone"];
  }

  const allowed = new Set(visibilityOptions.map((opt) => opt.value));
  const cleaned = groups
    .map((aud) => (allowed.has(aud) ? aud : null))
    .filter((aud): aud is VisibilityAudience => Boolean(aud));

  if (cleaned.length === 0) {
    return ["everyone"];
  }

  return Array.from(new Set(cleaned)) as VisibilityAudience[];
};

const toggleAudience = (
  value: VisibilityAudience,
  setter: Dispatch<SetStateAction<VisibilityAudience[]>>
) => {
  setter((prev) => {
    const exists = prev.includes(value);
    if (exists) {
      if (prev.length === 1) return prev; // must keep at least one audience
      return prev.filter((aud) => aud !== value);
    }
    return [...prev, value];
  });
};

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

const getPostKey = (post: FeedPost) => ("postId" in post ? post.postId : post.id);

function SwipeView({
  posts,
  onClose,
  onLikePost,
  onUnlikePost,
  onViewProfile,
  isPostLiked,
}: {
  posts: FeedPost[];
  onClose: () => void;
  onLikePost?: (post: FeedPost) => void;
  onUnlikePost?: (post: FeedPost) => void;
  onViewProfile?: (author: FeedPost["author"]) => void;
  isPostLiked?: (post: FeedPost) => boolean;
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [dragStartX, setDragStartX] = useState<number | null>(null);
  const [dragDelta, setDragDelta] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [slideWidth, setSlideWidth] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const goNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % posts.length);
  }, [posts.length]);

  const goPrev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + posts.length) % posts.length);
  }, [posts.length]);

  const handlePointerDown = (e: React.PointerEvent) => {
    if (isTransitioning) return;
    // Only start drag for primary pointer (left mouse / touch)
    if (e.pointerType === "mouse" && e.button !== 0) return;
    setDragStartX(e.clientX);
    setDragDelta(0);
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (dragStartX === null) return;

    const raw = e.clientX;
    const delta = raw - dragStartX;
    const clamp = slideWidth ? Math.max(Math.min(delta, slideWidth), -slideWidth) : delta;

    setDragDelta(clamp);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (dragStartX === null) return;

    const threshold = slideWidth ? Math.min(slideWidth * 0.22, 140) : 60;
    const shouldNext = dragDelta < -threshold;
    const shouldPrev = dragDelta > threshold;

    if (!shouldNext && !shouldPrev) {
      setIsTransitioning(true);
      setDragDelta(0);
      window.setTimeout(() => {
        setIsTransitioning(false);
      }, 220);
      setDragStartX(null);
      e.currentTarget.releasePointerCapture(e.pointerId);
      return;
    }

    setIsTransitioning(true);
    const targetDelta = shouldNext ? -slideWidth : slideWidth;
    setDragDelta(targetDelta);
    setDragStartX(null);

    window.setTimeout(() => {
      if (shouldNext) goNext();
      if (shouldPrev) goPrev();
      setIsTransitioning(false);
      setDragDelta(0);
    }, 220);

    e.currentTarget.releasePointerCapture(e.pointerId);
  };

  const isDragging = dragStartX !== null;

  const prevIndex = (currentIndex - 1 + posts.length) % posts.length;
  const nextIndex = (currentIndex + 1) % posts.length;
  const swipeProgress = slideWidth ? dragDelta / slideWidth : 0;

  useEffect(() => {
    const updateSizes = () => {
      const width = window.innerWidth;
      // Keep the active slide roughly screen width while leaving a small peek on each side
      setSlideWidth(Math.max(width - 64, 1));
    };

    updateSizes();

    const handleResize = () => updateSizes();
    window.addEventListener("resize", handleResize);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") goNext();
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [goNext, goPrev, onClose]);

  return (
    <div className="fixed inset-0 z-50 bg-[#030712]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(59,130,246,0.35),transparent_55%),radial-gradient(circle_at_80%_0%,rgba(236,72,153,0.25),transparent_45%)] blur-3xl opacity-70" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/80" />
      <div className="relative h-full">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-50 p-2 rounded-full bg-white/10 backdrop-blur-md hover:bg-white/20 transition-colors"
        >
          <X className="h-6 w-6 text-white" />
        </button>

        {/* Progress bar */}
        <div className="absolute top-4 left-4 right-16 flex gap-1 z-40">
          {posts.map((_, idx) => (
            <div
              key={idx}
              className={`h-1 flex-1 rounded-full overflow-hidden bg-white/10`}
            >
              <span
                className={`block h-full transition-all ${
                  idx === currentIndex
                    ? "bg-gradient-to-r from-sky-200 to-white"
                    : idx < currentIndex
                    ? "bg-white/60"
                    : "bg-white/5"
                }`}
              />
            </div>
          ))}
        </div>

        {/* Main content */}
        <div
          ref={containerRef}
          className="h-full flex items-center justify-center px-4 cursor-grab active:cursor-grabbing"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
        >
          {/* Left arrow */}
          <button
            onClick={goPrev}
            className={`absolute left-4 p-3 rounded-full bg-white/10 hover:bg-white/20 transition-all ${
              currentIndex === 0 ? "opacity-30 cursor-not-allowed" : ""
            }`}
            disabled={currentIndex === 0}
          >
            <ChevronLeft className="h-6 w-6 text-white" />
          </button>

          {/* Story carousel (shows adjacent stories while dragging) */}
          <div className="w-full max-w-2xl mx-auto overflow-visible" style={{ perspective: "1400px" }}>
            <div
              className="flex w-full"
              style={{
                transform:
                  isDragging || isTransitioning
                    ? `translateX(calc(-100% + ${dragDelta}px))`
                    : "translateX(-100%)",
                transition: isDragging
                  ? "none"
                  : isTransitioning
                  ? "transform 200ms ease"
                  : "none",
                touchAction: "pan-y",
                transformStyle: "preserve-3d",
              }}
            >
              {[prevIndex, currentIndex, nextIndex].map((index) => {
                const post = posts[index];
                const isCurrent = index === currentIndex;
                const position = index === currentIndex ? "current" : index === nextIndex ? "next" : "prev";
                const tilt = isCurrent ? swipeProgress * 12 : position === "next" ? -8 : 8;
                const scale = isCurrent ? 1 : 0.94;
                const translateY = isCurrent ? 0 : 12;
                const depth = isCurrent ? 0 : -60;
                const liked = isPostLiked?.(post) ?? false;
                const handleStoryLike = () => {
                  if (liked) {
                    onUnlikePost?.(post);
                  } else {
                    onLikePost?.(post);
                  }
                };
                return (
                  <div key={index} className="w-full flex-none min-w-0">
                    <div
                      className={`rounded-[32px] p-6 min-h-[72vh] flex flex-col select-none border border-white/15 backdrop-blur-sm ${
                        isCurrent ? "bg-gradient-to-br from-[#143874]/90 via-[#1d4ed8]/80 to-[#38bdf8]/70 shadow-[0_35px_80px_rgba(3,7,18,0.55)]" : "bg-gradient-to-br from-white/10 to-white/5 shadow-[0_25px_60px_rgba(3,7,18,0.35)] opacity-80"
                      }`}
                      style={{
                        transform: `perspective(1400px) translateZ(${depth}px) rotateY(${tilt}deg) scale(${scale}) translateY(${translateY}px)`,
                        transition: isDragging
                          ? "transform 0.12s ease-out"
                          : "transform 320ms cubic-bezier(.22,.61,.36,1)",
                      }}
                    >
                    {/* Author header */}
                    <button
                      type="button"
                      className="flex items-center gap-3 mb-6 text-left"
                      onClick={() => onViewProfile?.(post.author)}
                    >
                      <Avatar className="h-12 w-12 border-2 border-white/30">
                        <AvatarFallback className="bg-white/20 text-white font-semibold">
                          {getInitials(post.author.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-white font-semibold">
                          {post.author.name}
                        </p>
                        <p className="text-white/60 text-sm">
                          {post.author.department} · {post.createdAt}
                        </p>
                      </div>
                    </button>

                    {/* Post type badge */}
                    <Badge
                      className={`self-start mb-4 ${
                        post.type === "looking-for"
                          ? "bg-blue-500/80"
                          : post.type === "offering"
                          ? "bg-green-500/80"
                          : "bg-purple-500/80"
                      } text-white border-0`}
                    >
                      {post.type === "looking-for"
                        ? "Looking For"
                        : post.type === "offering"
                        ? "Offering"
                        : "Discussion"}
                    </Badge>

                    {/* Content */}
                    <div className="flex-1 flex items-center screen">
                      <p className="text-white text-xl leading-relaxed wrap-break-word whitespace-normal">
                        {post.content}
                      </p>
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 mt-4">
                      {post.tags.map((tag) => (
                        <Badge
                          key={tag}
                          variant="outline"
                          className="border-white/30 text-white/80 text-xs"
                        >
                          #{tag}
                        </Badge>
                      ))}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-around mt-6 pt-4 border-t border-white/15">
                      <button
                        className={`flex flex-col items-center gap-1 transition-colors ${liked ? "text-rose-300" : "text-white/80 hover:text-white"}`}
                        onClick={handleStoryLike}
                        disabled={!('postId' in post)}
                      >
                        <Heart className={`h-6 w-6 ${liked ? "fill-current" : ""}`} />
                        <span className="text-xs">{post.likes}</span>
                      </button>
                      <button className="flex flex-col items-center gap-1 text-white/80 hover:text-white transition-colors">
                        <MessageCircle className="h-6 w-6" />
                        <span className="text-xs">{post.replies}</span>
                      </button>
                      <button className="flex flex-col items-center gap-1 text-white/80 hover:text-white transition-colors">
                        <Share2 className="h-6 w-6" />
                        <span className="text-xs">Share</span>
                      </button>
                    </div>
                  </div>

                  {/* Post counter */}
                  {isCurrent && (
                    <p className="text-center text-white/50 text-sm mt-4">
                      {currentIndex + 1} of {posts.length}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>

          {/* Right arrow */}
          <button
            onClick={goNext}
            className="absolute right-4 p-3 rounded-full bg-white/10 hover:bg-white/20 transition-all"
          >
            <ChevronRight className="h-6 w-6 text-white" />
          </button>
        </div>

        {/* Swipe hint */}
        <p className="absolute bottom-4 left-0 right-0 text-center text-white/50 text-[11px] tracking-wide">
          Swipe or use arrow keys to navigate · ESC to close
        </p>
      </div>
    </div>
  );
}

export default function FeedPage() {
  const { isAuthenticated, user } = useAuth();
  const [newPost, setNewPost] = useState("");
  const [selectedVisibilityGroups, setSelectedVisibilityGroups] = useState<VisibilityAudience[]>(["everyone"]);
  const [selectedType, setSelectedType] = useState<"looking-for" | "offering" | "discussion">("looking-for");
  const [showComposer, setShowComposer] = useState(false);
  const [viewMode, setViewMode] = useState<"feed" | "swipe">("feed");
  const [posts, setPosts] = useState<ApiPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshingPosts, setIsRefreshingPosts] = useState(false);
  const [isPosting, setIsPosting] = useState(false);
  const [error, setError] = useState("");
  const [selectedPost, setSelectedPost] = useState<FeedPost | null>(null);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editContent, setEditContent] = useState("");
  const [editType, setEditType] = useState<"looking-for" | "offering" | "discussion">("looking-for");
  const [editVisibilityGroups, setEditVisibilityGroups] = useState<VisibilityAudience[]>(["everyone"]);
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const [isReplying, setIsReplying] = useState(false);
  const [profileSheetOpen, setProfileSheetOpen] = useState(false);
  const [profileAuthor, setProfileAuthor] = useState<ApiUser | FeedPost["author"] | null>(null);

  const loadPosts = useCallback(async (options?: { silent?: boolean }) => {
    if (!isAuthenticated) {
      setIsLoading(false);
      return;
    }
    const silent = options?.silent;
    try {
      if (silent) {
        setIsRefreshingPosts(true);
      } else {
        setIsLoading(true);
      }
      const data = await fetchPosts();
      setPosts((prev) => {
        const prevJson = JSON.stringify(prev);
        const nextJson = JSON.stringify(data);
        return prevJson === nextJson ? prev : data;
      });
    } catch (err) {
      console.error("Failed to load posts", err);
    } finally {
      if (silent) {
        setIsRefreshingPosts(false);
      } else {
        setIsLoading(false);
      }
    }
  }, [isAuthenticated]);

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  useEffect(() => {
    if (!isAuthenticated) return;
    const interval = setInterval(() => {
      loadPosts({ silent: true });
    }, 7000);
    return () => clearInterval(interval);
  }, [isAuthenticated, loadPosts]);

  const handleCreatePost = async () => {
    if (!newPost.trim() || !isAuthenticated) return;

    setIsPosting(true);
    setError("");
    try {
      const audiences = ensureAudiences(selectedVisibilityGroups);
      const derivedRole = "student" as const;
      const derivedDepartment = "Unknown";
      const payload = {
        content: newPost.trim(),
        tags: [],
        type: selectedType,
        visibility: audiences[0],
        visibilityGroups: audiences,
        authorRole: derivedRole,
        authorDepartment: derivedDepartment,
        authorEmail: user?.email,
        authorName: user?.name,
        clientUserId: user?.userId,
      };
      const created = await createPost(payload);
      setPosts((prev) => [created, ...prev]);
      setNewPost("");
      setShowComposer(false);
    } catch (err) {
      console.error("Failed to create post", err);
      setError("Unable to post right now. Please try again.");
    } finally {
      setIsPosting(false);
    }
  };

  const handleSubmitReply = async () => {
    if (!isAuthenticated || !replyContent.trim() || !selectedPost || !('postId' in selectedPost)) {
      return;
    }
    setIsReplying(true);
    try {
      const updatedPost = await replyToPost(selectedPost.postId, replyContent.trim());
      setPosts((prev) => prev.map((p) => (getPostKey(p) === getPostKey(selectedPost) ? updatedPost : p)));
      setSelectedPost(updatedPost);
      setReplyContent("");
    } catch (err) {
      console.error('Failed to submit reply', err);
      alert('Unable to add reply. Please try again.');
    } finally {
      setIsReplying(false);
    }
  };

  const handleViewPost = (post: FeedPost) => {
    setSelectedPost(post);
    setShowViewDialog(true);
    setReplyContent("");
  };

  const handleEditPost = (post: FeedPost) => {
    if (!('postId' in post)) return;
    setSelectedPost(post);
    setEditContent(post.content);
    setEditType(post.type);
    const apiPost = post as ApiPost;
    const incomingGroups = apiPost.visibilityGroups as VisibilityAudience[] | undefined;
    const audiences = ensureAudiences(incomingGroups);
    setEditVisibilityGroups(audiences);
    setShowEditDialog(true);
  };

  const handleDeletePost = async (post: FeedPost) => {
    if (!isAuthenticated || !('postId' in post)) return;
    
    if (!confirm('Are you sure you want to delete this post?')) return;
    
    setIsDeleting(true);
    try {
      await deletePost(post.postId, user?.userId);
      setPosts((prev) => prev.filter((p) => getPostKey(p) !== getPostKey(post)));
    } catch (err) {
      console.error('Failed to delete post', err);
      alert('Failed to delete post. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSaveEdit = async () => {
    if (!selectedPost || !('postId' in selectedPost) || !editContent.trim()) return;
    
    setIsEditing(true);
    setError('');
    try {
      const audiences = ensureAudiences(editVisibilityGroups);
      const updated = await updatePost(selectedPost.postId, {
        content: editContent,
        type: editType,
        visibility: audiences[0],
        visibilityGroups: audiences,
        clientEmail: user?.email,
        clientUserId: user?.userId,
      });
      setPosts((prev) =>
        prev.map((p) => (getPostKey(p) === getPostKey(selectedPost) ? updated : p))
      );
      setShowEditDialog(false);
      setSelectedPost(null);
    } catch (err) {
      console.error('Failed to update post', err);
      setError('Failed to update post. Please try again.');
    } finally {
      setIsEditing(false);
    }
  };

  const handleLikePost = async (post: FeedPost) => {
    if (!isAuthenticated || !('postId' in post)) return;
    
    try {
      const updated = await likePost(post.postId, user?.userId);
      setPosts((prev) =>
        prev.map((p) => (getPostKey(p) === getPostKey(post) ? updated : p))
      );
    } catch (err) {
      console.error('Failed to like post', err);
    }
  };

  const handleUnlikePost = async (post: FeedPost) => {
    if (!isAuthenticated || !('postId' in post)) return;
    
    try {
      const updated = await unlikePost(post.postId, user?.userId);
      setPosts((prev) =>
        prev.map((p) => (getPostKey(p) === getPostKey(post) ? updated : p))
      );
    } catch (err) {
      console.error('Failed to unlike post', err);
    }
  };

  const isOwnPost = (post: FeedPost) => {
    if (!user || !('postId' in post)) return false;
    if (post.authorId && user.userId && post.authorId === user.userId) {
      return true;
    }
    if (post.author?.email && user.email) {
      return post.author.email.toLowerCase() === user.email.toLowerCase();
    }
    return false;
  };

  const isPostLiked = (post: FeedPost) => {
    if (!user || !('postId' in post)) return false;
    const apiPost = post as ApiPost;
    return apiPost.likedBy?.includes(user.userId || '') || false;
  };

  const displayPosts: FeedPost[] = isAuthenticated && posts.length > 0 ? posts : mockPosts;
  const trendingPosts = [...displayPosts].sort((a, b) => (b.likes || 0) - (a.likes || 0));

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <Card className="max-w-md w-full text-center p-8">
          <CardContent className="space-y-4">
            <h2 className="text-xl font-semibold text-[#002A5C]">Sign in to view the feed</h2>
            <p className="text-sm text-gray-500">
              Posts, Discover, and other community features are available once you log in with your UofT email.
            </p>
            <Link href="/login" className="block">
              <Button className="w-full bg-[#002A5C] text-white hover:bg-[#002A5C]/90">
                Go to Login
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleViewProfile = (author: FeedPost["author"]) => {
    setProfileAuthor(author);
    setProfileSheetOpen(true);
  };

  if (viewMode === "swipe") {
    return (
      <SwipeView
        posts={displayPosts}
        onClose={() => setViewMode("feed")}
        onLikePost={handleLikePost}
        onUnlikePost={handleUnlikePost}
        onViewProfile={handleViewProfile}
        isPostLiked={isPostLiked}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        {/* Page Header */}
        <div className="mb-8 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-bold text-[#002A5C]">Messages</h1>
              {isRefreshingPosts && (
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <span className="inline-flex h-2 w-2 rounded-full bg-[#002A5C] animate-pulse" />
                  Updating
                </div>
              )}
            </div>
            <p className="text-gray-500 mt-1">Connect with your UofT community</p>
          </div>
          {/* View Mode Toggle */}
          <div className="flex items-center gap-1 bg-white rounded-lg shadow-sm p-1">
            <Button
              variant="default"
              size="sm"
              className="h-8 px-3 bg-[#002A5C] text-white"
              onClick={() => setViewMode("feed")}
            >
              <LayoutGrid className="h-4 w-4 mr-1.5" />
              Feed
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-3 text-gray-500"
              onClick={() => setViewMode("swipe")}
            >
              <Layers className="h-4 w-4 mr-1.5" />
              Stories
            </Button>
          </div>
        </div>

        {/* Compose Button / Area */}
        {!showComposer ? (
          <Card
            className="mb-6 cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => setShowComposer(true)}
          >
            <CardContent className="flex items-center gap-3 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#002A5C]/5">
                <PenSquare className="h-4 w-4 text-[#002A5C]" />
              </div>
              <span className="text-sm text-gray-400">
                What are you looking for or offering?
              </span>
            </CardContent>
          </Card>
        ) : (
          <Card className="mb-6 shadow-md">
            <CardContent className="p-4 space-y-4">
              <Textarea
                placeholder="Share what you're looking for, offering, or want to discuss..."
                value={newPost}
                onChange={(e) => setNewPost(e.target.value)}
                className="min-h-25 resize-none border-0 focus-visible:ring-0 text-sm"
                autoFocus
              />

              {/* Post Type Selection */}
              <div className="space-y-2">
                <span className="text-xs font-medium text-gray-500">
                  Post Type
                </span>
                <div className="flex gap-2">
                  {postTypes.map((type) => (
                    <Badge
                      key={type.value}
                      variant={
                        selectedType === type.value ? "default" : "outline"
                      }
                      className={`cursor-pointer text-xs ${
                        selectedType === type.value
                          ? "bg-[#002A5C] text-white"
                          : "hover:bg-gray-100"
                      }`}
                      onClick={() => setSelectedType(type.value)}
                    >
                      {type.label}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Visibility Selection */}
              <div className="space-y-2">
                <span className="text-xs font-medium text-gray-500">
                  Who can see this?
                </span>
                <div className="flex flex-wrap gap-2">
                  {visibilityOptions.map((opt) => {
                    const Icon = opt.icon;
                    const isSelected = selectedVisibilityGroups.includes(opt.value);
                    return (
                      <Badge
                        key={opt.value}
                        variant={isSelected ? "default" : "outline"}
                        className={`cursor-pointer text-xs gap-1 ${
                          isSelected
                            ? "bg-[#002A5C] text-white"
                            : "hover:bg-gray-100"
                        }`}
                        onClick={() => toggleAudience(opt.value, setSelectedVisibilityGroups)}
                      >
                        <Icon className="h-3 w-3" />
                        {opt.label}
                      </Badge>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowComposer(false)}
                  disabled={isPosting}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  className="bg-[#002A5C] text-white"
                  disabled={!newPost.trim() || !isAuthenticated || isPosting}
                  onClick={handleCreatePost}
                >
                  {isPosting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Post"}
                </Button>
              </div>
              {error && <p className="text-sm text-red-500">{error}</p>}
            </CardContent>
          </Card>
        )}

        {/* Feed Tabs */}
        <Tabs defaultValue="latest" className="space-y-4">
          <div className="flex items-center justify-between">
            <TabsList className="bg-white shadow-sm">
              <TabsTrigger value="latest" className="text-xs gap-1.5">
                <Clock className="h-3.5 w-3.5" />
                Latest
              </TabsTrigger>
              <TabsTrigger value="trending" className="text-xs gap-1.5">
                <TrendingUp className="h-3.5 w-3.5" />
                Trending
              </TabsTrigger>
              <TabsTrigger value="for-you" className="text-xs gap-1.5">
                <Sparkles className="h-3.5 w-3.5" />
                For You
              </TabsTrigger>
            </TabsList>
            <Button variant="outline" size="sm" className="text-xs gap-1.5 h-8">
              <Filter className="h-3.5 w-3.5" />
              Filter
            </Button>
          </div>

          <TabsContent value="latest" className="space-y-4">
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-[#002A5C]" />
              </div>
            ) : (
              displayPosts.map((post) => (
                <PostCard
                  key={getPostKey(post)}
                  post={post}
                  isOwnPost={isOwnPost(post)}
                  isLiked={isPostLiked(post)}
                  onView={handleViewPost}
                  onViewProfile={handleViewProfile}
                  onReply={handleViewPost}
                  onEdit={handleEditPost}
                  onDelete={handleDeletePost}
                  onLike={handleLikePost}
                  onUnlike={handleUnlikePost}
                />
              ))
            )}
          </TabsContent>

          <TabsContent value="trending" className="space-y-4">
            {trendingPosts.map((post) => (
              <PostCard
                key={`${getPostKey(post)}-trending`}
                post={post}
                isOwnPost={isOwnPost(post)}
                isLiked={isPostLiked(post)}
                onView={handleViewPost}
                onReply={handleViewPost}
                onEdit={handleEditPost}
                onDelete={handleDeletePost}
                onLike={handleLikePost}
                onUnlike={handleUnlikePost}
              />
            ))}
          </TabsContent>

          <TabsContent value="for-you" className="space-y-4">
            <div className="rounded-lg bg-linear-to-r from-[#002A5C]/5 to-blue-50 p-4 text-center">
              <Sparkles className="mx-auto h-8 w-8 text-[#002A5C]/40 mb-2" />
              <p className="text-sm font-medium text-[#002A5C]">
                Personalized feed powered by Amazon Personalize
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Posts ranked by relevance to your interests and connections
              </p>
            </div>
            {displayPosts.slice(0, 3).map((post, idx) => (
              <PostCard
                key={`${getPostKey(post)}-for-you-${idx}`}
                post={post}
                isOwnPost={isOwnPost(post)}
                isLiked={isPostLiked(post)}
                onView={handleViewPost}
                onReply={handleViewPost}
                onEdit={handleEditPost}
                onDelete={handleDeletePost}
                onLike={handleLikePost}
                onUnlike={handleUnlikePost}
              />
            ))}
          </TabsContent>
        </Tabs>

        {/* View Post Dialog */}
        <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
          <DialogContent className="max-w-2xl">
            {selectedPost && (
              <>
                <DialogHeader>
                  <DialogTitle>Post Details</DialogTitle>
                  <DialogDescription>
                    Posted by {selectedPost.author.name} · {selectedPost.createdAt}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-2">
                  <div className="rounded-lg border p-4">
                    <p className="text-sm text-gray-700 whitespace-pre-line">{selectedPost.content}</p>
                  </div>
                  <div className="rounded-lg border p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-sm text-gray-900">
                        Replies ({selectedPost.replies || selectedPost.repliesList?.length || 0})
                      </h4>
                      <span className="text-xs text-gray-500">Newest first</span>
                    </div>
                    {Array.isArray(selectedPost.repliesList) && selectedPost.repliesList.length > 0 ? (
                      <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                        {[...selectedPost.repliesList]
                          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                          .map((reply) => (
                            <div key={reply.replyId} className="rounded-md border border-gray-100 p-3 bg-gray-50">
                              <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                                <span className="font-medium text-gray-700">{reply.author.name}</span>
                                <span>{new Date(reply.createdAt).toLocaleString()}</span>
                              </div>
                              <p className="text-sm text-gray-800 whitespace-pre-line">{reply.content}</p>
                            </div>
                          ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">No replies yet. Be the first to respond.</p>
                    )}
                    <div className="mt-3 flex flex-col gap-2">
                      <textarea
                        className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#002A5C]"
                        rows={3}
                        placeholder="Share your thoughts or offer help..."
                        value={replyContent}
                        onChange={(e) => setReplyContent(e.target.value)}
                      />
                      <div className="flex justify-end">
                        <Button
                          size="sm"
                          className="bg-[#002A5C] text-white"
                          onClick={handleSubmitReply}
                          disabled={isReplying || !replyContent.trim()}
                        >
                          {isReplying ? 'Sending…' : 'Reply'}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>

        {/* Edit Post Dialog */}
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Post</DialogTitle>
              <DialogDescription>
                Update your post content, type, or visibility
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <Textarea
                placeholder="Post content..."
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="min-h-32 resize-none"
              />
              <div className="space-y-2">
                <span className="text-xs font-medium text-gray-500">Post Type</span>
                <div className="flex gap-2">
                  {postTypes.map((type) => (
                    <Badge
                      key={type.value}
                      variant={editType === type.value ? "default" : "outline"}
                      className={`cursor-pointer text-xs ${
                        editType === type.value
                          ? "bg-[#002A5C] text-white"
                          : "hover:bg-gray-100"
                      }`}
                      onClick={() => setEditType(type.value)}
                    >
                      {type.label}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <span className="text-xs font-medium text-gray-500">Visibility</span>
                <div className="flex flex-wrap gap-2">
                  {visibilityOptions.map((opt) => {
                    const Icon = opt.icon;
                    const isSelected = editVisibilityGroups.includes(opt.value);
                    return (
                      <Badge
                        key={opt.value}
                        variant={isSelected ? "default" : "outline"}
                        className={`cursor-pointer text-xs gap-1 ${
                          isSelected
                            ? "bg-[#002A5C] text-white"
                            : "hover:bg-gray-100"
                        }`}
                        onClick={() => toggleAudience(opt.value, setEditVisibilityGroups)}
                      >
                        <Icon className="h-3 w-3" />
                        {opt.label}
                      </Badge>
                    );
                  })}
                </div>
              </div>
              {error && (
                <div className="flex items-center gap-2 text-sm text-red-600">
                  <AlertCircle className="h-4 w-4" />
                  {error}
                </div>
              )}
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowEditDialog(false)}
                disabled={isEditing}
              >
                Cancel
              </Button>
              <Button
                className="bg-[#002A5C] text-white hover:bg-[#002A5C]/90"
                onClick={handleSaveEdit}
                disabled={!editContent.trim() || isEditing}
              >
                {isEditing ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Changes"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
