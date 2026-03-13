"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/lib/auth-context";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { mockUsers, mockPosts } from "@/lib/mock-data";
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
} from "lucide-react";

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

const stats = [
  {
    label: "Profile Views",
    value: "142",
    change: "+12%",
    icon: Eye,
    color: "text-blue-600 bg-blue-50",
  },
  {
    label: "Connections",
    value: "28",
    change: "+5",
    icon: Users,
    color: "text-emerald-600 bg-emerald-50",
  },
  {
    label: "Messages",
    value: "16",
    change: "3 new",
    icon: MessageCircle,
    color: "text-violet-600 bg-violet-50",
  },
  {
    label: "Post Engagement",
    value: "89%",
    change: "+8%",
    icon: TrendingUp,
    color: "text-amber-600 bg-amber-50",
  },
];

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

const pendingRequests = [
  {
    user: mockUsers[0],
    message: "Interested in your NLP research opportunities",
    time: "2h ago",
  },
  {
    user: mockUsers[3],
    message: "Would love to discuss data pipeline collaboration",
    time: "5h ago",
  },
  {
    user: mockUsers[6],
    message: "Seeking beginner-friendly mentorship in cloud computing",
    time: "1d ago",
  },
];

const topInterests = [
  { tag: "Machine Learning", count: 45 },
  { tag: "Cloud Computing", count: 38 },
  { tag: "AWS", count: 32 },
  { tag: "Career Mentoring", count: 28 },
  { tag: "Research", count: 24 },
];

export default function DashboardPage() {
  const { isAuthenticated } = useAuth();

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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        {/* Header */}
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#002A5C]">Dashboard</h1>
            <p className="mt-1 text-sm text-gray-500">
              Professional overview for faculty and mentors
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
            {/* Pending Outreach Requests */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-semibold flex items-center gap-2">
                    <Target className="h-4 w-4 text-[#002A5C]" />
                    Pending Outreach
                  </CardTitle>
                  <Badge variant="secondary" className="text-xs">
                    {pendingRequests.length} new
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-1 pt-0">
                {pendingRequests.map((req, idx) => (
                  <div key={idx}>
                    <div className="flex items-start gap-3 py-3">
                      <Avatar className="h-9 w-9 shrink-0">
                        <AvatarFallback className="bg-[#002A5C] text-white text-xs">
                          {getInitials(req.user.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">
                            {req.user.name}
                          </span>
                          <span className="text-[10px] text-gray-400 shrink-0 ml-2">
                            {req.time}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {req.message}
                        </p>
                        <div className="flex gap-2 mt-2">
                          <Button
                            size="sm"
                            className="h-7 text-[11px] bg-[#002A5C] hover:bg-[#002A5C]/90"
                          >
                            Accept
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 text-[11px]"
                          >
                            View Profile
                          </Button>
                        </div>
                      </div>
                    </div>
                    {idx < pendingRequests.length - 1 && <Separator />}
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Recent Post Performance */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-[#002A5C]" />
                  Your Post Performance
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0 space-y-3">
                {mockPosts
                  .filter(
                    (p) =>
                      p.author.role === "professor" ||
                      p.author.role === "alumni"
                  )
                  .slice(0, 3)
                  .map((post) => (
                    <div
                      key={post.id}
                      className="flex items-start gap-3 rounded-lg border p-3 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-700 line-clamp-2">
                          {post.content}
                        </p>
                        <div className="flex items-center gap-4 mt-2">
                          <span className="flex items-center gap-1 text-xs text-gray-400">
                            <Eye className="h-3 w-3" />
                            {Math.floor(Math.random() * 200 + 50)} views
                          </span>
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
                  ))}
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
                {mockUsers
                  .filter((u) => u.role === "student")
                  .slice(0, 3)
                  .map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center gap-3 rounded-lg border p-3 hover:bg-gray-50 transition-colors cursor-pointer"
                    >
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-sky-100 text-sky-700 text-xs">
                          {getInitials(user.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <span className="text-sm font-medium block truncate">
                          {user.name}
                        </span>
                        <span className="text-[11px] text-gray-400">
                          {user.department}
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
