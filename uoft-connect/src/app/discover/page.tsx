"use client";

import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/lib/auth-context";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProfileCard } from "@/components/profile-card";
import { fetchUsers, sendMessage, createPost, fetchPosts, type User, type Post } from "@/lib/api";
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
  Loader2,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  mockResearchGroups,
  mockResearchPrograms,
  mockProfessorOpportunities,
  mockSummerResearchAwards,
  mockTAshipOfferings,
  mockOtherOpportunities,
  type UserProfile,
} from "@/lib/mock-data";

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
  const [connectError, setConnectError] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [profileUser, setProfileUser] = useState<User | null>(null);
  
  // Post creation state
  const [showPostComposer, setShowPostComposer] = useState(false);
  const [postContent, setPostContent] = useState("");
  const [postType, setPostType] = useState<"offering" | "discussion">("offering");
  const [postTags, setPostTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [isPosting, setIsPosting] = useState(false);
  
  // Posts state for discover
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoadingPosts, setIsLoadingPosts] = useState(false);

  const loadUsers = useCallback(async () => {
    try {
      setIsLoading(true);
      setError("");
      const fetchedUsers = await fetchUsers();
      setUsers(fetchedUsers);
    } catch (err) {
      console.error("Failed to load users", err);
      setError("Unable to load users. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadPosts = useCallback(async () => {
    try {
      setIsLoadingPosts(true);
      const fetchedPosts = await fetchPosts();
      setPosts(fetchedPosts);
    } catch (err) {
      console.error("Failed to load posts", err);
    } finally {
      setIsLoadingPosts(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      loadUsers();
      loadPosts();
    }
  }, [isAuthenticated, loadUsers, loadPosts]);

  const mapUserToProfileCard = (user: User): UserProfile => ({
    id: user.userId,
    name: user.name,
    role: user.role as any,
    avatar: "",
    department: user.department,
    year: user.year,
    bio: user.bio,
    interests: user.interests,
    lookingFor: user.lookingFor,
    email: user.email,
  });

  const getMatchScore = () => Math.floor(Math.random() * 30) + 70;

  const handleCreatePost = async () => {
    if (!postContent.trim() || !currentUser?.isInstructor) return;
    
    setIsPosting(true);
    try {
      await createPost({
        content: postContent.trim(),
        type: postType,
        tags: postTags,
        visibility: "everyone",
      });
      setPostContent("");
      setPostTags([]);
      setTagInput("");
      setShowPostComposer(false);
      // Refresh posts after creation
      await loadPosts();
    } catch (err) {
      console.error('Failed to create post', err);
      alert('Unable to create post. Please try again.');
    } finally {
      setIsPosting(false);
    }
  };

  const addTag = () => {
    const tag = tagInput.trim();
    if (tag && !postTags.includes(tag)) {
      setPostTags([...postTags, tag]);
      setTagInput("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setPostTags(postTags.filter(tag => tag !== tagToRemove));
  };

  const filteredUsers = users.filter((user) =>
    !searchQuery ||
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.interests.some((interest) => interest.toLowerCase().includes(searchQuery.toLowerCase()))
  );

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
          
          {/* Instructor Post Composer */}
          {currentUser?.isInstructor && (
            <Card className="bg-gradient-to-r from-[#002A5C]/5 to-blue-50 border-[#002A5C]/20">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-[#002A5C] flex items-center justify-center">
                      <Award className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-[#002A5C]">Instructor Opportunity Board</p>
                      <p className="text-xs text-gray-600">Share opportunities with students</p>
                    </div>
                  </div>
                  <Badge className="bg-[#002A5C] text-white text-xs">Verified Instructor</Badge>
                </div>
                {!showPostComposer ? (
                  <Button
                    onClick={() => setShowPostComposer(true)}
                    className="w-full bg-[#002A5C] text-white hover:bg-[#002A5C]/90"
                  >
                    <Sparkles className="h-4 w-4 mr-2" />
                    Post Opportunity
                  </Button>
                ) : (
                  <div className="space-y-3">
                    <Textarea
                      placeholder="Describe the research opportunity, position, or resource you're offering..."
                      value={postContent}
                      onChange={(e) => setPostContent(e.target.value)}
                      className="min-h-[100px] resize-none"
                    />
                    
                    {/* Post Type Selection */}
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant={postType === "offering" ? "default" : "outline"}
                        onClick={() => setPostType("offering")}
                        className={postType === "offering" ? "bg-[#002A5C] text-white" : ""}
                      >
                        Offering
                      </Button>
                      <Button
                        size="sm"
                        variant={postType === "discussion" ? "default" : "outline"}
                        onClick={() => setPostType("discussion")}
                        className={postType === "discussion" ? "bg-[#002A5C] text-white" : ""}
                      >
                        Discussion
                      </Button>
                    </div>
                    
                    {/* Tags */}
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <Input
                          placeholder="Add tags (e.g., machine-learning, paid, undergraduate)"
                          value={tagInput}
                          onChange={(e) => setTagInput(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                          className="flex-1"
                        />
                        <Button size="sm" onClick={addTag} variant="outline">Add</Button>
                      </div>
                      {postTags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {postTags.map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                              <button
                                onClick={() => removeTag(tag)}
                                className="ml-1 text-gray-500 hover:text-gray-700"
                              >
                                ×
                              </button>
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    {/* Actions */}
                    <div className="flex gap-2">
                      <Button
                        onClick={handleCreatePost}
                        disabled={!postContent.trim() || isPosting}
                        className="flex-1 bg-[#002A5C] text-white hover:bg-[#002A5C]/90"
                      >
                        {isPosting ? "Posting..." : "Post Opportunity"}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setShowPostComposer(false);
                          setPostContent("");
                          setPostTags([]);
                          setTagInput("");
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Instructor Posts */}
        {posts.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-[#002A5C] mb-4 flex items-center gap-2">
              <Award className="h-5 w-5" />
              Latest Opportunities from Instructors
            </h2>
            <div className="space-y-4">
              {isLoadingPosts ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-[#002A5C]" />
                </div>
              ) : (
                posts
                  .filter(post => post.type === "offering" || post.type === "discussion")
                  .map((post) => (
                    <Card key={post.postId} className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3 mb-3">
                          <div className="h-10 w-10 rounded-full bg-[#002A5C]/10 flex items-center justify-center">
                            <Award className="h-5 w-5 text-[#002A5C]" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-semibold text-sm text-[#002A5C]">{post.author.name}</span>
                              <Badge className="bg-[#002A5C] text-white text-xs">Verified Instructor</Badge>
                              <Badge 
                                className={`text-xs ${
                                  post.type === "offering" 
                                    ? "bg-green-100 text-green-700" 
                                    : "bg-purple-100 text-purple-700"
                                }`}
                              >
                                {post.type === "offering" ? "Opportunity" : "Discussion"}
                              </Badge>
                            </div>
                            <p className="text-xs text-gray-500">
                              {post.author.department} · {new Date(post.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <p className="text-sm text-gray-700 leading-relaxed mb-3">
                          {post.content}
                        </p>
                        {post.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {post.tags.map((tag) => (
                              <Badge key={tag} variant="secondary" className="text-xs bg-[#002A5C]/5 text-[#002A5C]">
                                #{tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))
              )}
            </div>
          </div>
        )}

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
