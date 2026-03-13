"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProfileCard } from "@/components/profile-card";
import { mockUsers } from "@/lib/mock-data";
import {
  Search,
  SlidersHorizontal,
  Sparkles,
  GraduationCap,
  Briefcase,
  BookOpen,
  Users,
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
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);

  const toggleInterest = (interest: string) => {
    setSelectedInterests((prev) =>
      prev.includes(interest)
        ? prev.filter((i) => i !== interest)
        : [...prev, interest]
    );
  };

  const filteredUsers = mockUsers.filter((user) => {
    const matchesSearch =
      !searchQuery ||
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.interests.some((i) =>
        i.toLowerCase().includes(searchQuery.toLowerCase())
      );
    const matchesInterests =
      selectedInterests.length === 0 ||
      user.interests.some((i) => selectedInterests.includes(i));
    return matchesSearch && matchesInterests;
  });

  const getMatchScore = () => Math.floor(Math.random() * 30) + 70;

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
                      key={user.id}
                      user={user}
                      matchScore={getMatchScore()}
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
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
}
