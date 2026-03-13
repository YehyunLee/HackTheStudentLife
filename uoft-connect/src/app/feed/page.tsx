"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PostCard } from "@/components/post-card";
import { mockPosts } from "@/lib/mock-data";
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
} from "lucide-react";

const visibilityOptions = [
  { value: "everyone", label: "Everyone", icon: Eye },
  { value: "students", label: "Students Only", icon: GraduationCap },
  { value: "faculty", label: "Faculty Only", icon: Users },
  { value: "alumni", label: "Alumni Only", icon: Lock },
];

const postTypes = [
  { value: "looking-for", label: "Looking For", color: "bg-blue-500" },
  { value: "offering", label: "Offering", color: "bg-green-500" },
  { value: "discussion", label: "Discussion", color: "bg-purple-500" },
];

export default function FeedPage() {
  const [newPost, setNewPost] = useState("");
  const [selectedVisibility, setSelectedVisibility] = useState("everyone");
  const [selectedType, setSelectedType] = useState("looking-for");
  const [showComposer, setShowComposer] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-[#002A5C]">Feed</h1>
          <p className="mt-1 text-sm text-gray-500">
            See what the UofT community is looking for and offering
          </p>
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

              <div className="flex justify-end gap-2 pt-2 border-t">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowComposer(false)}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  className="bg-[#002A5C] hover:bg-[#002A5C]/90 text-white"
                  disabled={!newPost.trim()}
                >
                  Post
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
            {mockPosts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
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
  );
}
