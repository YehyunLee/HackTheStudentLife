"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { PostCard } from "@/components/post-card";
import { mockPosts } from "@/lib/mock-data";
import { fetchPosts, createPost, Post } from "@/lib/api";
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
} from "lucide-react";

const visibilityOptions: { value: "everyone" | "students" | "faculty" | "alumni"; label: string; icon: typeof Eye }[] = [
  { value: "everyone", label: "Everyone", icon: Eye },
  { value: "students", label: "Students Only", icon: GraduationCap },
  { value: "faculty", label: "Faculty Only", icon: Users },
  { value: "alumni", label: "Alumni Only", icon: Lock },
];

const postTypes: { value: "looking-for" | "offering" | "discussion"; label: string; color: string }[] = [
  { value: "looking-for", label: "Looking For", color: "bg-blue-500" },
  { value: "offering", label: "Offering", color: "bg-green-500" },
  { value: "discussion", label: "Discussion", color: "bg-purple-500" },
];

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

function SwipeView({
  posts,
  onClose,
}: {
  posts: typeof mockPosts;
  onClose: () => void;
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const currentPost = posts[currentIndex];

  const goNext = () => {
    if (currentIndex < posts.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const goPrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (touchStart - touchEnd > 75) {
      goNext();
    }
    if (touchStart - touchEnd < -75) {
      goPrev();
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") goNext();
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentIndex]);

  return (
    <div className="fixed inset-0 z-50 bg-black">
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-50 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
      >
        <X className="h-6 w-6 text-white" />
      </button>

      {/* Progress bar */}
      <div className="absolute top-4 left-4 right-16 flex gap-1 z-40">
        {posts.map((_, idx) => (
          <div
            key={idx}
            className={`h-1 flex-1 rounded-full transition-colors ${
              idx === currentIndex
                ? "bg-white"
                : idx < currentIndex
                ? "bg-white/60"
                : "bg-white/20"
            }`}
          />
        ))}
      </div>

      {/* Main content */}
      <div
        ref={containerRef}
        className="h-full flex items-center justify-center px-4"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
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

        {/* Story card */}
        <div className="w-full max-w-md mx-auto">
          <div className="bg-gradient-to-br from-[#002A5C] to-[#1a5fb4] rounded-2xl p-6 min-h-[70vh] flex flex-col">
            {/* Author header */}
            <div className="flex items-center gap-3 mb-6">
              <Avatar className="h-12 w-12 border-2 border-white/30">
                <AvatarFallback className="bg-white/20 text-white font-semibold">
                  {getInitials(currentPost.author.name)}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-white font-semibold">
                  {currentPost.author.name}
                </p>
                <p className="text-white/60 text-sm">
                  {currentPost.author.department} · {currentPost.createdAt}
                </p>
              </div>
            </div>

            {/* Post type badge */}
            <Badge
              className={`self-start mb-4 ${
                currentPost.type === "looking-for"
                  ? "bg-blue-500/80"
                  : currentPost.type === "offering"
                  ? "bg-green-500/80"
                  : "bg-purple-500/80"
              } text-white border-0`}
            >
              {currentPost.type === "looking-for"
                ? "Looking For"
                : currentPost.type === "offering"
                ? "Offering"
                : "Discussion"}
            </Badge>

            {/* Content */}
            <div className="flex-1 flex items-center">
              <p className="text-white text-xl leading-relaxed">
                {currentPost.content}
              </p>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mt-4">
              {currentPost.tags.map((tag) => (
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
            <div className="flex items-center justify-around mt-6 pt-4 border-t border-white/10">
              <button className="flex flex-col items-center gap-1 text-white/80 hover:text-white transition-colors">
                <Heart className="h-6 w-6" />
                <span className="text-xs">{currentPost.likes}</span>
              </button>
              <button className="flex flex-col items-center gap-1 text-white/80 hover:text-white transition-colors">
                <MessageCircle className="h-6 w-6" />
                <span className="text-xs">{currentPost.replies}</span>
              </button>
              <button className="flex flex-col items-center gap-1 text-white/80 hover:text-white transition-colors">
                <Share2 className="h-6 w-6" />
                <span className="text-xs">Share</span>
              </button>
            </div>
          </div>

          {/* Post counter */}
          <p className="text-center text-white/50 text-sm mt-4">
            {currentIndex + 1} of {posts.length}
          </p>
        </div>

        {/* Right arrow */}
        <button
          onClick={goNext}
          className={`absolute right-4 p-3 rounded-full bg-white/10 hover:bg-white/20 transition-all ${
            currentIndex === posts.length - 1
              ? "opacity-30 cursor-not-allowed"
              : ""
          }`}
          disabled={currentIndex === posts.length - 1}
        >
          <ChevronRight className="h-6 w-6 text-white" />
        </button>
      </div>

      {/* Swipe hint */}
      <p className="absolute bottom-4 left-0 right-0 text-center text-white/40 text-xs">
        Swipe or use arrow keys to navigate · ESC to close
      </p>
    </div>
  );
}

export default function FeedPage() {
  const { isAuthenticated } = useAuth();
  const [newPost, setNewPost] = useState("");
  const [selectedVisibility, setSelectedVisibility] = useState<"everyone" | "students" | "faculty" | "alumni">("everyone");
  const [selectedType, setSelectedType] = useState<"looking-for" | "offering" | "discussion">("looking-for");
  const [showComposer, setShowComposer] = useState(false);
  const [viewMode, setViewMode] = useState<"feed" | "swipe">("feed");
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPosting, setIsPosting] = useState(false);
  const [error, setError] = useState("");
  const isSwipeView = viewMode === "swipe";

  const loadPosts = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await fetchPosts();
      setPosts(data);
    } catch (err) {
      console.error("Failed to load posts:", err);
      // Fall back to mock data if API fails
      setPosts([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  const handleCreatePost = async () => {
    if (!newPost.trim() || !isAuthenticated) return;
    
    setIsPosting(true);
    setError("");
    try {
      const created = await createPost({
        content: newPost,
        tags: [],
        type: selectedType,
        visibility: selectedVisibility,
      });
      setPosts([created, ...posts]);
      setNewPost("");
      setShowComposer(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create post");
    } finally {
      setIsPosting(false);
    }
  };

  // Combine API posts with mock posts for display
  const displayPosts = posts.length > 0 ? posts : mockPosts;

  return (
    <>
      {isSwipeView && (
        <SwipeView posts={mockPosts} onClose={() => setViewMode("feed")} />
      )}
      <div className="min-h-screen bg-gray-50">
        <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        {/* Page Header */}
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#002A5C]">Feed</h1>
            <p className="mt-1 text-sm text-gray-500">
              See what the UofT community is looking for and offering
            </p>
          </div>
          {/* View Mode Toggle */}
          <div className="flex items-center gap-1 bg-white rounded-lg shadow-sm p-1">
            <Button
              variant={!isSwipeView ? "default" : "ghost"}
              size="sm"
              className={`h-8 px-3 ${
                !isSwipeView
                  ? "bg-[#002A5C] text-white"
                  : "text-gray-500"
              }`}
              onClick={() => setViewMode("feed")}
            >
              <LayoutGrid className="h-4 w-4 mr-1.5" />
              Feed
            </Button>
            <Button
              variant={isSwipeView ? "default" : "ghost"}
              size="sm"
              className={`h-8 px-3 ${
                isSwipeView
                  ? "bg-[#002A5C] text-white"
                  : "text-gray-500"
              }`}
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
                className="min-h-[100px] resize-none border-0 focus-visible:ring-0 text-sm"
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
                    return (
                      <Badge
                        key={opt.value}
                        variant={
                          selectedVisibility === opt.value
                            ? "default"
                            : "outline"
                        }
                        className={`cursor-pointer text-xs gap-1 ${
                          selectedVisibility === opt.value
                            ? "bg-[#002A5C] text-white"
                            : "hover:bg-gray-100"
                        }`}
                        onClick={() => setSelectedVisibility(opt.value)}
                      >
                        <Icon className="h-3 w-3" />
                        {opt.label}
                      </Badge>
                    );
                  })}
                </div>
              </div>

              {error && (
                <p className="text-sm text-red-500">{error}</p>
              )}

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
                  className="bg-[#002A5C] hover:bg-[#002A5C]/90 text-white"
                  disabled={!newPost.trim() || isPosting || !isAuthenticated}
                  onClick={handleCreatePost}
                >
                  {isPosting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Post"}
                </Button>
              </div>
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
            ) : posts.length > 0 ? (
              posts.map((post) => (
                <PostCard key={post.postId} post={post as never} />
              ))
            ) : (
              mockPosts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))
            )}
          </TabsContent>

          <TabsContent value="trending" className="space-y-4">
            {[...mockPosts]
              .sort((a, b) => b.likes - a.likes)
              .map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
          </TabsContent>

          <TabsContent value="for-you" className="space-y-4">
            <div className="rounded-lg bg-gradient-to-r from-[#002A5C]/5 to-blue-50 p-4 text-center">
              <Sparkles className="mx-auto h-8 w-8 text-[#002A5C]/40 mb-2" />
              <p className="text-sm font-medium text-[#002A5C]">
                Personalized feed powered by Amazon Personalize
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Posts ranked by relevance to your interests and connections
              </p>
            </div>
            {mockPosts.slice(0, 3).map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </TabsContent>
        </Tabs>
        </div>
      </div>
    </>
  );
}
