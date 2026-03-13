"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/lib/auth-context";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProfileCard } from "@/components/profile-card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { fetchUsers, sendMessage, type User } from "@/lib/api";
import {
  Search,
  SlidersHorizontal,
  Sparkles,
  GraduationCap,
  Briefcase,
  BookOpen,
  Users,
  Loader2,
} from "lucide-react";

const interestFilters = [
  "Machine Learning",
  "Cloud Computing",
  "Web Development",
  "Data Science",
  "HCI",
  "Product Management",
  "DevOps",
  "Research",
  "Career Mentoring",
  "AWS",
];

export default function DiscoverPage() {
  const { isAuthenticated, user: currentUser } = useAuth();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [connectTarget, setConnectTarget] = useState<User | null>(null);
  const [connectMessage, setConnectMessage] = useState("Hi! I'd love to connect and learn more about what you're working on.");
  const [isSending, setIsSending] = useState(false);
  const [connectError, setConnectError] = useState<string | null>(null);
  const [profileUser, setProfileUser] = useState<User | null>(null);

  const loadUsers = useCallback(async () => {
    if (!isAuthenticated) {
      setIsLoading(false);
      return;
    }
    try {
      setIsLoading(true);
      const data = await fetchUsers();
      setUsers(data);
    } catch (err) {
      console.error("Failed to load users", err);
      setError("Unable to load users. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const toggleInterest = (interest: string) => {
    setSelectedInterests((prev) =>
      prev.includes(interest)
        ? prev.filter((i) => i !== interest)
        : [...prev, interest]
    );
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      !searchQuery ||
      user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.department?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (user.interests || []).some((i) =>
        i.toLowerCase().includes(searchQuery.toLowerCase())
      );
    const matchesInterests =
      selectedInterests.length === 0 ||
      (user.interests || []).some((i) => selectedInterests.includes(i));
    return matchesSearch && matchesInterests;
  });

  const mapUserToProfileCard = (user: User) => ({
    id: user.userId,
    name: user.name || "Unknown User",
    role: user.role as "student" | "alumni" | "professor" | "mentor",
    avatar: "",
    department: user.department || "Unknown",
    year: user.year,
    bio: user.bio || "",
    interests: user.interests || [],
    lookingFor: user.lookingFor || [],
  });

  const getMatchScore = () => Math.floor(Math.random() * 30) + 70;

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <Card className="max-w-md w-full text-center p-8">
          <CardContent className="space-y-4">
            <h2 className="text-xl font-semibold text-[#002A5C]">Sign in to discover connections</h2>
            <p className="text-sm text-gray-500">
              Discover people who align with your interests once you log in with your UofT email.
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
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-[#002A5C]">Discover</h1>
          <p className="mt-1 text-sm text-gray-500">
            Find people who align with your interests and goals
          </p>
        </div>

        {/* Search + Filters */}
        <div className="mb-6 space-y-4">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search by name, department, or interest..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-white"
              />
            </div>
            <Button
              variant="outline"
              size="icon"
              className="shrink-0"
            >
              <SlidersHorizontal className="h-4 w-4" />
            </Button>
          </div>

          {/* Interest Tags */}
          <div className="flex flex-wrap gap-2">
            {interestFilters.map((interest) => (
              <Badge
                key={interest}
                variant={
                  selectedInterests.includes(interest) ? "default" : "outline"
                }
                className={`cursor-pointer text-xs transition-colors ${
                  selectedInterests.includes(interest)
                    ? "bg-[#002A5C] text-white hover:bg-[#002A5C]/90"
                    : "hover:bg-[#002A5C]/5 hover:text-[#002A5C]"
                }`}
                onClick={() => toggleInterest(interest)}
              >
                {interest}
              </Badge>
            ))}
            {selectedInterests.length > 0 && (
              <Badge
                variant="outline"
                className="cursor-pointer text-xs text-red-500 hover:bg-red-50"
                onClick={() => setSelectedInterests([])}
              >
                Clear all
              </Badge>
            )}
          </div>
        </div>

        {/* AI Match Banner */}
        <div className="mb-6 rounded-xl bg-gradient-to-r from-[#002A5C] to-blue-600 p-5 text-white">
          <div className="flex items-start gap-3">
            <Sparkles className="h-6 w-6 shrink-0 text-yellow-300 mt-0.5" />
            <div>
              <h3 className="font-semibold">AI-Powered Matching</h3>
              <p className="mt-1 text-sm text-blue-100">
                Amazon Personalize analyzes your interests, goals, and activity
                to surface the most relevant connections. Match scores show how
                well someone aligns with your profile.
              </p>
            </div>
          </div>
        </div>

        {/* Tabs by Role */}
        <Tabs defaultValue="all" className="space-y-6">
          <TabsList className="bg-white shadow-sm">
            <TabsTrigger value="all" className="text-xs gap-1.5">
              <Users className="h-3.5 w-3.5" />
              All
            </TabsTrigger>
            <TabsTrigger value="students" className="text-xs gap-1.5">
              <GraduationCap className="h-3.5 w-3.5" />
              Students
            </TabsTrigger>
            <TabsTrigger value="alumni" className="text-xs gap-1.5">
              <Briefcase className="h-3.5 w-3.5" />
              Alumni
            </TabsTrigger>
            <TabsTrigger value="faculty" className="text-xs gap-1.5">
              <BookOpen className="h-3.5 w-3.5" />
              Faculty & Mentors
            </TabsTrigger>
          </TabsList>

          {["all", "students", "alumni", "faculty"].map((tab) => (
            <TabsContent key={tab} value={tab}>
              {isLoading ? (
                <div className="flex justify-center py-16">
                  <Loader2 className="h-8 w-8 animate-spin text-[#002A5C]" />
                </div>
              ) : error ? (
                <div className="py-16 text-center">
                  <p className="text-sm text-red-500">{error}</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-4"
                    onClick={loadUsers}
                  >
                    Retry
                  </Button>
                </div>
              ) : (
                <>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {filteredUsers
                      .filter((user) => {
                        if (tab === "all") return true;
                        if (tab === "students") return user.role === "student";
                        if (tab === "alumni") return user.role === "alumni";
                        if (tab === "faculty")
                          return (
                            user.role === "professor" || user.role === "mentor"
                          );
                        return true;
                      })
                      .map((user) => (
                        <ProfileCard
                          key={user.userId}
                          user={mapUserToProfileCard(user)}
                          matchScore={getMatchScore()}
                          onConnect={() => setConnectTarget(user)}
                          onViewProfile={() => setProfileUser(user)}
                        />
                      ))}
                  </div>
                  {filteredUsers.length === 0 && (
                    <div className="py-16 text-center">
                      <Search className="mx-auto h-10 w-10 text-gray-300 mb-3" />
                      <p className="text-sm text-gray-500">
                        No matches found. Try adjusting your filters.
                      </p>
                    </div>
                  )}
                </>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </div>

      <Dialog open={!!connectTarget} onOpenChange={(open) => {
        if (!open) {
          setConnectTarget(null);
          setConnectMessage("Hi! I'd love to connect and learn more about what you're working on.");
          setConnectError(null);
        }
      }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Send a message</DialogTitle>
            <DialogDescription>
              Start a conversation with {connectTarget?.name}
            </DialogDescription>
          </DialogHeader>
          {connectTarget && (
            <div className="space-y-4">
              <div className="rounded-md border p-3 bg-gray-50">
                <p className="text-sm font-semibold text-gray-900">{connectTarget.name}</p>
                <p className="text-xs text-gray-500">{connectTarget.role} · {connectTarget.department}</p>
                {connectTarget.interests?.length ? (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {connectTarget.interests.slice(0, 4).map((interest) => (
                      <Badge key={interest} variant="secondary" className="text-[10px]">
                        {interest}
                      </Badge>
                    ))}
                  </div>
                ) : null}
              </div>
              <Textarea
                value={connectMessage}
                onChange={(e) => setConnectMessage(e.target.value)}
                rows={4}
                placeholder="Introduce yourself and mention why you'd like to connect"
              />
              {connectError && (
                <p className="text-sm text-red-500">{connectError}</p>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="ghost" onClick={() => setConnectTarget(null)} disabled={isSending}>
              Cancel
            </Button>
            <Button
              className="bg-[#002A5C]"
              onClick={async () => {
                if (!connectTarget || !connectMessage.trim()) {
                  setConnectError("Message cannot be empty");
                  return;
                }
                if (currentUser?.userId === connectTarget.userId) {
                  setConnectError("You cannot message yourself.");
                  return;
                }
                try {
                  setIsSending(true);
                  setConnectError(null);
                  await sendMessage({ recipientId: connectTarget.userId, content: connectMessage.trim() });
                  setConnectTarget(null);
                  setConnectMessage("Hi! I'd love to connect and learn more about what you're working on.");
                  router.push("/messages");
                } catch (err) {
                  console.error('Connect message failed', err);
                  setConnectError("Failed to send message. Please try again.");
                } finally {
                  setIsSending(false);
                }
              }}
              disabled={isSending || !connectMessage.trim()}
            >
              {isSending ? "Sending..." : "Send Message"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Sheet open={!!profileUser} onOpenChange={(open) => {
        if (!open) setProfileUser(null);
      }}>
        <SheetContent className="w-full sm:max-w-md overflow-y-auto">
          <SheetHeader className="mb-4">
            <SheetTitle>Profile preview</SheetTitle>
            <SheetDescription>Learn more before reaching out</SheetDescription>
          </SheetHeader>
          {profileUser && (
            <div className="space-y-4 text-sm text-gray-700">
              <div>
                <p className="text-xl font-semibold text-[#002A5C]">{profileUser.name}</p>
                <p className="text-xs text-gray-500">{profileUser.role} · {profileUser.department}</p>
              </div>
              {profileUser.bio && (
                <div>
                  <p className="text-xs uppercase tracking-wide text-gray-400">Bio</p>
                  <p className="mt-1 text-sm text-gray-700 whitespace-pre-line">{profileUser.bio}</p>
                </div>
              )}
              {profileUser.interests?.length ? (
                <div>
                  <p className="text-xs uppercase tracking-wide text-gray-400">Interests</p>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {profileUser.interests.map((interest) => (
                      <Badge key={interest} variant="secondary" className="text-[10px]">
                        {interest}
                      </Badge>
                    ))}
                  </div>
                </div>
              ) : null}
              {profileUser.lookingFor?.length ? (
                <div>
                  <p className="text-xs uppercase tracking-wide text-gray-400">Looking for</p>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {profileUser.lookingFor.map((item) => (
                      <Badge key={item} variant="outline" className="text-[10px] text-gray-600">
                        {item}
                      </Badge>
                    ))}
                  </div>
                </div>
              ) : null}
              {profileUser.linkedin && (
                <div>
                  <p className="text-xs uppercase tracking-wide text-gray-400">Links</p>
                  <a
                    href={profileUser.linkedin}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[#002A5C] underline break-words"
                  >
                    {profileUser.linkedin}
                  </a>
                </div>
              )}
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
