"use client";

import Link from "next/link";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  mockResearchGroups,
  mockResearchPrograms,
  mockProfessorOpportunities,
  mockSummerResearchAwards,
  mockTAshipOfferings,
  mockOtherOpportunities,
} from "@/lib/mock-data";
import {
  Search,
  SlidersHorizontal,
  Sparkles,
  GraduationCap,
  Briefcase,
  BookOpen,
  Users,
  Users2,
  Award,
  FileText,
  DollarSign,
  MoreHorizontal,
} from "lucide-react";

export default function DiscoverPage() {
  const { isAuthenticated } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredResearchGroups = mockResearchGroups.filter((group) =>
    !searchQuery ||
    group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    group.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    group.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const filteredResearchPrograms = mockResearchPrograms.filter((program) =>
    !searchQuery ||
    program.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    program.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    program.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const filteredProfessorOpportunities = mockProfessorOpportunities.filter((opp) =>
    !searchQuery ||
    opp.projectTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
    opp.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    opp.professor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    opp.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const filteredSummerResearchAwards = mockSummerResearchAwards.filter((award) =>
    !searchQuery ||
    award.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    award.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    award.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const filteredTAshipOfferings = mockTAshipOfferings.filter((ta) =>
    !searchQuery ||
    ta.course.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ta.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ta.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const filteredOtherOpportunities = mockOtherOpportunities.filter((opp) =>
    !searchQuery ||
    opp.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    opp.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    opp.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

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
                placeholder="Search opportunities, research, TAships..."
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

        {/* Results Sections */}
        <div className="space-y-8">
          {/* Research Groups */}
          {filteredResearchGroups.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-[#002A5C] mb-4 flex items-center gap-2">
                <Users2 className="h-5 w-5" />
                Research Groups
              </h2>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {filteredResearchGroups.map((group) => (
                  <Link
                    key={group.id}
                    href={group.url || "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block"
                  >
                    <Card className="overflow-hidden border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                      {group.image && (
                        <div className="aspect-video bg-gradient-to-br from-blue-50 to-blue-100 relative">
                          <img
                            src={group.image}
                            alt={group.name}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-blue-500/10" />
                        </div>
                      )}
                      <div className="p-4">
                        <h3 className="font-semibold text-sm text-[#002A5C] mb-1">{group.name}</h3>
                        <p className="text-xs text-gray-500 mb-2">{group.department}</p>
                        <p className="text-xs text-gray-600 leading-relaxed line-clamp-2 mb-3">
                          {group.description}
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {group.tags.slice(0, 3).map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-[10px] bg-blue-50 text-blue-700">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Research Programs */}
          {filteredResearchPrograms.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-[#002A5C] mb-4 flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Research Programs
              </h2>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {filteredResearchPrograms.map((program) => (
                  <Card key={program.id} className="overflow-hidden border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow">
                    {program.image && (
                      <div className="aspect-video bg-gradient-to-br from-green-50 to-green-100 relative">
                        <img
                          src={program.image}
                          alt={program.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-green-500/10" />
                      </div>
                    )}
                    <div className="p-4">
                      <h3 className="font-semibold text-sm text-[#002A5C] mb-1">{program.title}</h3>
                      <p className="text-xs text-gray-500 mb-2">{program.department}</p>
                      <p className="text-xs text-gray-600 leading-relaxed line-clamp-2 mb-3">
                        {program.description}
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {program.tags.slice(0, 3).map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-[10px] bg-green-50 text-green-700">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Professors / Projects Actively Searching For Students */}
          {filteredProfessorOpportunities.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-[#002A5C] mb-4 flex items-center gap-2">
                <GraduationCap className="h-5 w-5" />
                Professors / Projects Actively Searching For Students
              </h2>
              <div className="space-y-4">
                {filteredProfessorOpportunities.map((opp) => (
                  <Link
                    key={opp.id}
                    href={`/projects/${opp.id}`}
                    className="block rounded-xl border border-gray-200 bg-white shadow-sm hover:shadow-lg transition-shadow"
                  >
                    <div className="flex flex-col lg:flex-row">
                      <div className="flex-1 p-4">
                        <div className="flex items-start gap-4">
                          {opp.image ? (
                            <img
                              src={opp.image}
                              alt={opp.projectTitle}
                              className="h-20 w-20 rounded-lg object-cover"
                            />
                          ) : (
                            <div className="h-20 w-20 rounded-lg bg-gray-100" />
                          )}
                          <div>
                            <h3 className="text-base font-semibold text-[#002A5C]">
                              {opp.projectTitle}
                            </h3>
                            <p className="text-xs text-gray-500">
                              {opp.professor.name} — {opp.professor.department}
                            </p>
                          </div>
                        </div>
                        <p className="mt-3 text-sm text-gray-600 line-clamp-3">
                          {opp.description}
                        </p>
                      </div>

                      <div className="flex flex-col justify-between gap-3 border-t border-gray-100 px-4 py-3 lg:border-t-0 lg:border-l lg:w-56">
                        <div className="flex flex-wrap gap-2">
                          {opp.tags.slice(0, 2).map((tag) => (
                            <Badge key={tag} variant="outline" className="text-[10px]">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                        <div className="text-xs text-gray-500">
                          {opp.eligibility && (
                            <div>
                              <span className="font-semibold">Eligibility:</span>{" "}
                              {opp.eligibility}
                            </div>
                          )}
                          {opp.deadline && (
                            <div>
                              <span className="font-semibold">Deadline:</span>{" "}
                              {opp.deadline}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Summer Research/Awards */}
          {filteredSummerResearchAwards.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-[#002A5C] mb-4 flex items-center gap-2">
                <Award className="h-5 w-5" />
                Summer Research/Awards
              </h2>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {filteredSummerResearchAwards.map((award) => (
                  <Card key={award.id} className="overflow-hidden border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow">
                    {award.image && (
                      <div className="aspect-video bg-gradient-to-br from-orange-50 to-orange-100 relative">
                        <img
                          src={award.image}
                          alt={award.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-orange-500/10" />
                      </div>
                    )}
                    <div className="p-4">
                      <h3 className="font-semibold text-sm text-[#002A5C] mb-1">{award.title}</h3>
                      <p className="text-xs text-gray-500 mb-2">{award.organization}</p>
                      <p className="text-xs text-gray-600 leading-relaxed line-clamp-2 mb-2">
                        {award.description}
                      </p>
                      <p className="text-xs text-green-600 mb-1">Stipend: {award.stipend}</p>
                      <p className="text-xs text-red-600 mb-3">Deadline: {award.deadline}</p>
                      <div className="flex flex-wrap gap-1">
                        {award.tags.slice(0, 3).map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-[10px] bg-orange-50 text-orange-700">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* TAship Offerings */}
          {filteredTAshipOfferings.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-[#002A5C] mb-4 flex items-center gap-2">
                <FileText className="h-5 w-5" />
                TAship Offerings
              </h2>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {filteredTAshipOfferings.map((ta) => (
                  <Card key={ta.id} className="overflow-hidden border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow">
                    {ta.image && (
                      <div className="aspect-video bg-gradient-to-br from-red-50 to-red-100 relative">
                        <img
                          src={ta.image}
                          alt={ta.course}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-red-500/10" />
                      </div>
                    )}
                    <div className="p-4">
                      <h3 className="font-semibold text-sm text-[#002A5C] mb-1">{ta.course}</h3>
                      <p className="text-xs text-gray-500 mb-2">{ta.professor} - {ta.department}</p>
                      <p className="text-xs text-gray-600 leading-relaxed line-clamp-2 mb-2">
                        {ta.description}
                      </p>
                      <p className="text-xs text-blue-600 mb-1">Hours: {ta.hours}</p>
                      <p className="text-xs text-green-600 mb-3">Pay: {ta.pay}</p>
                      <div className="flex flex-wrap gap-1">
                        {ta.tags.slice(0, 3).map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-[10px] bg-red-50 text-red-700">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Other Opportunities */}
          {filteredOtherOpportunities.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-[#002A5C] mb-4 flex items-center gap-2">
                <MoreHorizontal className="h-5 w-5" />
                Other Opportunities
              </h2>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {filteredOtherOpportunities.map((opp) => (
                  <Card key={opp.id} className="overflow-hidden border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow">
                    {opp.image && (
                      <div className="aspect-video bg-gradient-to-br from-gray-50 to-gray-100 relative">
                        <img
                          src={opp.image}
                          alt={opp.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gray-500/10" />
                      </div>
                    )}
                    <div className="p-4">
                      <h3 className="font-semibold text-sm text-[#002A5C] mb-1">{opp.title}</h3>
                      <p className="text-xs text-gray-500 mb-2">{opp.organization} - {opp.type}</p>
                      <p className="text-xs text-gray-600 leading-relaxed line-clamp-2 mb-3">
                        {opp.description}
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {opp.tags.slice(0, 3).map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-[10px] bg-gray-50 text-gray-700">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* No Results */}
          {filteredResearchGroups.length === 0 &&
           filteredResearchPrograms.length === 0 &&
           filteredProfessorOpportunities.length === 0 &&
           filteredSummerResearchAwards.length === 0 &&
           filteredTAshipOfferings.length === 0 &&
           filteredOtherOpportunities.length === 0 && (
            <div className="py-16 text-center">
              <Search className="mx-auto h-10 w-10 text-gray-300 mb-3" />
              <p className="text-sm text-gray-500">
                No matches found. Try adjusting your search.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
