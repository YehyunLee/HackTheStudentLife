"use client";

import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/lib/auth-context";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { fetchPosts, fetchUsers, type Post, type User } from "@/lib/api";
import {
  Users,
  MessageCircle,
  TrendingUp,
  Eye,
  Calendar,
  Clock,
  ChevronRight,
  BarChart3,
  Target,
  Bell,
  Star,
  Sparkles,
  Loader2,
} from "lucide-react";

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}


const upcomingEvents = [
  {
    title: "Coffee Chat with Sarah Chen",
    time: "Thu, Mar 13 · 2:00 PM",
    type: "meeting",
  },
  {
    title: "Accessible Cloud Apps Workshop",
    time: "Tue, Mar 18 · 4:00 PM",
    type: "event",
  },
  {
    title: "AWS Study Group Session",
    time: "Wed, Mar 19 · 6:00 PM",
    type: "group",
  },
];



export default function DashboardPage() {
  const { isAuthenticated, user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const loadData = useCallback(async () => {
    if (!isAuthenticated) {
      setIsLoading(false);
      return;
    }
    try {
      setIsLoading(true);
      const [postsData, usersData] = await Promise.all([
        fetchPosts(),
        fetchUsers(),
      ]);
      setPosts(postsData);
      setUsers(usersData);
    } catch (err) {
      console.error("Failed to load dashboard data", err);
      setError("Unable to load dashboard. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const myPosts = posts.filter((p) => p.authorId === user?.userId);
  const totalLikes = myPosts.reduce((sum, p) => sum + (p.likes || 0), 0);
  const totalReplies = myPosts.reduce((sum, p) => sum + (p.replies || 0), 0);
  const studentUsers = users.filter((u) => u.role === "student");
  
  const interestCounts = users.reduce((acc, user) => {
    (user.interests || []).forEach((interest) => {
      acc[interest] = (acc[interest] || 0) + 1;
    });
    return acc;
  }, {} as Record<string, number>);
  
  const topInterests = Object.entries(interestCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([tag, count]) => ({ tag, count }));

  const stats = [
    {
      label: "Total Posts",
      value: myPosts.length.toString(),
      change: `${posts.length} total`,
      icon: MessageCircle,
      color: "text-blue-600 bg-blue-50",
    },
    {
      label: "Total Users",
      value: users.length.toString(),
      change: `${studentUsers.length} students`,
      icon: Users,
      color: "text-emerald-600 bg-emerald-50",
    },
    {
      label: "Post Likes",
      value: totalLikes.toString(),
      change: `${myPosts.length} posts`,
      icon: Star,
      color: "text-violet-600 bg-violet-50",
    },
    {
      label: "Post Replies",
      value: totalReplies.toString(),
      change: `${myPosts.length} posts`,
      icon: TrendingUp,
      color: "text-amber-600 bg-amber-50",
    },
  ];

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <Card className="max-w-md w-full text-center p-8">
          <CardContent className="space-y-4">
            <h2 className="text-xl font-semibold text-[#002A5C]">Sign in to view your dashboard</h2>
            <p className="text-sm text-gray-500">
              Access your professional overview once you log in with your UofT email.
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#002A5C]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
            <Button
              variant="outline"
              size="sm"
              className="ml-4"
              onClick={loadData}
            >
              Retry
            </Button>
          </div>
        )}
        {/* Header */}
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#002A5C]">Dashboard</h1>
            <p className="mt-1 text-sm text-gray-500">
              Community overview and analytics
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 text-xs"
          >
            <Bell className="h-3.5 w-3.5" />
            Notifications
            <Badge className="bg-red-500 text-white text-[10px] px-1.5 py-0 ml-1">
              3
            </Badge>
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.label} className="hover:shadow-md transition-shadow">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-lg ${stat.color}`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <Badge
                      variant="secondary"
                      className="text-[10px] text-emerald-600 bg-emerald-50"
                    >
                      {stat.change}
                    </Badge>
                  </div>
                  <div className="mt-3">
                    <span className="text-2xl font-bold text-gray-900">
                      {stat.value}
                    </span>
                    <p className="text-xs text-gray-500 mt-0.5">{stat.label}</p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Recent Community Activity */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-semibold flex items-center gap-2">
                    <Target className="h-4 w-4 text-[#002A5C]" />
                    Recent Community Activity
                  </CardTitle>
                  <Badge variant="secondary" className="text-xs">
                    {posts.length} posts
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-1 pt-0">
                {posts.slice(0, 3).map((post, idx) => (
                  <div key={post.postId}>
                    <div className="flex items-start gap-3 py-3">
                      <Avatar className="h-9 w-9 shrink-0">
                        <AvatarFallback className="bg-[#002A5C] text-white text-xs">
                          {getInitials(post.author.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">
                            {post.author.name}
                          </span>
                          <span className="text-[10px] text-gray-400 shrink-0 ml-2">
                            {post.createdAt}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">
                          {post.content}
                        </p>
                        <div className="flex gap-3 mt-2 text-xs text-gray-400">
                          <span className="flex items-center gap-1">
                            <Star className="h-3 w-3" />
                            {post.likes}
                          </span>
                          <span className="flex items-center gap-1">
                            <MessageCircle className="h-3 w-3" />
                            {post.replies}
                          </span>
                        </div>
                      </div>
                    </div>
                    {idx < 2 && <Separator />}
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Your Post Performance */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-[#002A5C]" />
                  Your Post Performance
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0 space-y-3">
                {myPosts.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-4">
                    You haven't created any posts yet.
                  </p>
                ) : (
                  myPosts.slice(0, 3).map((post) => (
                    <div
                      key={post.postId}
                      className="flex items-start gap-3 rounded-lg border p-3 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-700 line-clamp-2">
                          {post.content}
                        </p>
                        <div className="flex items-center gap-4 mt-2">
                          <span className="flex items-center gap-1 text-xs text-gray-400">
                            <Star className="h-3 w-3" />
                            {post.likes} likes
                          </span>
                          <span className="flex items-center gap-1 text-xs text-gray-400">
                            <MessageCircle className="h-3 w-3" />
                            {post.replies} replies
                          </span>
                        </div>
                      </div>
                      <ChevronRight className="h-4 w-4 text-gray-300 shrink-0 mt-1" />
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Upcoming Events */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-[#002A5C]" />
                  Upcoming
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0 space-y-3">
                {upcomingEvents.map((event, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-3 rounded-lg border p-3"
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#002A5C]/5">
                      <Clock className="h-4 w-4 text-[#002A5C]" />
                    </div>
                    <div>
                      <span className="text-sm font-medium">{event.title}</span>
                      <p className="text-[11px] text-gray-400 mt-0.5">
                        {event.time}
                      </p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Trending Student Interests */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-[#002A5C]" />
                  Trending Interests
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0 space-y-2.5">
                {topInterests.map((interest, idx) => (
                  <div
                    key={interest.tag}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-gray-400 w-4">
                        {idx + 1}
                      </span>
                      <Badge
                        variant="secondary"
                        className="bg-[#002A5C]/5 text-[#002A5C] text-xs font-normal"
                      >
                        {interest.tag}
                      </Badge>
                    </div>
                    <span className="text-xs text-gray-400">
                      {interest.count} students
                    </span>
                  </div>
                ))}
                <Separator className="my-2" />
                <p className="text-[11px] text-gray-400 text-center">
                  Powered by Amazon QuickSight analytics
                </p>
              </CardContent>
            </Card>

            {/* Recommended Mentees */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <Users className="h-4 w-4 text-[#002A5C]" />
                  Recommended Mentees
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0 space-y-3">
                {studentUsers.slice(0, 3).map((user) => (
                  <div
                    key={user.userId}
                    className="flex items-center gap-3 rounded-lg border p-3 hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-sky-100 text-sky-700 text-xs">
                        {getInitials(user.name || "U")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <span className="text-sm font-medium block truncate">
                        {user.name || "Unknown User"}
                      </span>
                      <span className="text-[11px] text-gray-400">
                        {user.department || "Unknown"}
                      </span>
                    </div>
                    <Badge className="bg-gradient-to-r from-[#002A5C] to-blue-500 text-white text-[10px] px-1.5">
                      {Math.floor(Math.random() * 20 + 80)}%
                    </Badge>
                  </div>
                ))}
                <p className="text-[11px] text-gray-400 text-center pt-1">
                  Matched via Amazon Personalize
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
