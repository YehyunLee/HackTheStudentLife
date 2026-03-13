"use client";

import { useCallback, useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  User,
  Settings,
  Edit3,
  Plus,
  X,
  GraduationCap,
  MapPin,
  Calendar,
  Link as LinkIcon,
  Shield,
  Eye,
  Lock,
  Users,
  Save,
  Loader2,
} from "lucide-react";
import { fetchCurrentUser, updateCurrentUser } from "@/lib/api";
import type { User as ApiUser } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";

type ProfileRole = "student" | "alumni" | "professor" | "mentor";

type ProfileForm = {
  name: string;
  role: ProfileRole;
  department: string;
  year?: string;
  bio: string;
  interests: string[];
  lookingFor: string[];
  email: string;
  linkedin?: string;
  github?: string;
};

const emptyProfile: ProfileForm = {
  name: "",
  role: "student",
  department: "",
  year: "",
  bio: "",
  interests: [],
  lookingFor: [],
  email: "",
  linkedin: "",
  github: "",
};

const roleBadges: Record<ProfileRole, { label: string; badgeClass: string }> = {
  student: { label: "Student", badgeClass: "bg-sky-100 text-sky-700" },
  alumni: { label: "Alumni", badgeClass: "bg-amber-100 text-amber-700" },
  professor: { label: "Professor", badgeClass: "bg-emerald-100 text-emerald-700" },
  mentor: { label: "Mentor", badgeClass: "bg-violet-100 text-violet-700" },
};

const mapApiUserToProfile = (user: ApiUser): ProfileForm => ({
  name: user.name ?? "",
  role: (user.role as ProfileRole) ?? "student",
  department: user.department ?? "",
  year: user.year ?? "",
  bio: user.bio ?? "",
  interests: user.interests ?? [],
  lookingFor: user.lookingFor ?? [],
  email: user.email ?? "",
  linkedin: user.linkedin ?? "",
  github: user.github ?? "",
});

const getInitials = (name: string) =>
  name
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0])
    .join("")
    .toUpperCase() || "U";

export default function ProfilePage() {
  const { isAuthenticated } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState<ProfileForm>(emptyProfile);
  const [originalProfile, setOriginalProfile] = useState<ProfileForm | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [newInterest, setNewInterest] = useState("");
  const [newLookingFor, setNewLookingFor] = useState("");

  const loadProfile = useCallback(async () => {
    if (!isAuthenticated) {
      setIsLoading(false);
      return;
    }
    try {
      setIsLoading(true);
      setStatusMessage(null);
      const user = await fetchCurrentUser();
      const mapped = mapApiUserToProfile(user);
      setProfile(mapped);
      setOriginalProfile(mapped);
    } catch (error) {
      console.error("Failed to load profile", error);
      setStatusMessage({ 
        type: "error", 
        text: "Unable to load profile. Make sure you're logged in and the API is deployed." 
      });
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const handleSave = async () => {
    if (!isAuthenticated) return;
    setIsSaving(true);
    setStatusMessage(null);
    try {
      await updateCurrentUser({
        name: profile.name,
        role: profile.role,
        department: profile.department,
        year: profile.year,
        bio: profile.bio,
        interests: profile.interests,
        lookingFor: profile.lookingFor,
        linkedin: profile.linkedin,
        github: profile.github,
      });
      setOriginalProfile(profile);
      setIsEditing(false);
      setStatusMessage({ type: "success", text: "Profile updated" });
    } catch (error) {
      console.error("Failed to update profile", error);
      setStatusMessage({ type: "error", text: "Failed to update profile. Please try again." });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = () => {
    if (originalProfile) {
      setProfile(originalProfile);
    }
    setIsEditing(false);
    setStatusMessage(null);
  };

  const addInterest = () => {
    if (newInterest.trim()) {
      setProfile((p) => ({
        ...p,
        interests: [...p.interests, newInterest.trim()],
      }));
      setNewInterest("");
    }
  };

  const removeInterest = (tag: string) => {
    setProfile((p) => ({
      ...p,
      interests: p.interests.filter((i) => i !== tag),
    }));
  };

  const addLookingFor = () => {
    if (newLookingFor.trim()) {
      setProfile((p) => ({
        ...p,
        lookingFor: [...p.lookingFor, newLookingFor.trim()],
      }));
      setNewLookingFor("");
    }
  };

  const removeLookingFor = (tag: string) => {
    setProfile((p) => ({
      ...p,
      lookingFor: p.lookingFor.filter((i) => i !== tag),
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="h-8 w-8 animate-spin text-[#002A5C]" />
          </div>
        ) : !isAuthenticated ? (
          <Card className="p-8 text-center">
            <CardTitle className="text-lg font-semibold text-[#002A5C]">
              Sign in to view your profile
            </CardTitle>
            <p className="text-sm text-gray-500 mt-2">
              Use your UofT credentials to access and edit your profile.
            </p>
          </Card>
        ) : (
          <>
            {statusMessage && (
              <div
                className={`mb-4 rounded-lg border px-4 py-3 text-sm ${
                  statusMessage.type === "success"
                    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                    : "border-red-200 bg-red-50 text-red-700"
                }`}
              >
                {statusMessage.text}
              </div>
            )}
            {/* Profile Header Card */}
            <Card className="overflow-hidden mb-6">
          {/* Banner */}
          <div className="h-32 bg-gradient-to-r from-[#002A5C] via-[#003d82] to-[#1a5fb4] relative">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDE4YzEuNjU2IDAgMy0xLjM0NCAzLTNzLTEuMzQ0LTMtMy0zLTMgMS4zNDQtMyAzIDEuMzQ0IDMgMyAzem0wIDMwYzEuNjU2IDAgMy0xLjM0NCAzLTNzLTEuMzQ0LTMtMy0zLTMgMS4zNDQtMyAzIDEuMzQ0IDMgMyAzek0xOCAxOGMxLjY1NiAwIDMtMS4zNDQgMy0zcy0xLjM0NC0zLTMtMy0zIDEuMzQ0LTMgMyAxLjM0NCAzIDMgM3ptMCAzMGMxLjY1NiAwIDMtMS4zNDQgMy0zcy0xLjM0NC0zLTMtMy0zIDEuMzQ0LTMgMyAxLjM0NCAzIDMgM3oiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-50" />
          </div>

          <CardContent className="relative px-6 pb-6">
            <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-12">
              <Avatar className="h-24 w-24 border-4 border-white shadow-lg">
                <AvatarFallback className="bg-[#002A5C] text-white text-2xl font-bold">
                  {getInitials(profile.name || "UofT Student")}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 sm:pb-1">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    {isEditing ? (
                      <Input
                        value={profile.name}
                        onChange={(e) =>
                          setProfile((p) => ({ ...p, name: e.target.value }))
                        }
                        className="text-lg font-semibold"
                      />
                    ) : (
                      <h1 className="text-xl font-bold text-gray-900">
                        {profile.name}
                      </h1>
                    )}
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      <Badge className={`${roleBadges[profile.role].badgeClass} text-xs`}>
                        <GraduationCap className="mr-1 h-3 w-3" />
                        {roleBadges[profile.role].label}
                      </Badge>
                      <span className="text-sm text-gray-500 flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {isEditing ? (
                          <Input
                            value={profile.department}
                            onChange={(e) =>
                              setProfile((p) => ({ ...p, department: e.target.value }))
                            }
                            className="h-7 text-sm"
                          />
                        ) : (
                          profile.department || "Department"
                        )}
                      </span>
                      <span className="text-sm text-gray-500 flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {isEditing ? (
                          <Input
                            value={profile.year}
                            onChange={(e) =>
                              setProfile((p) => ({ ...p, year: e.target.value }))
                            }
                            className="h-7 text-sm"
                          />
                        ) : (
                          profile.year || "Year"
                        )}
                      </span>
                    </div>
                  </div>
                  <Button
                    variant={isEditing ? "default" : "outline"}
                    size="sm"
                    className={`gap-1.5 text-xs ${
                      isEditing
                        ? "bg-[#002A5C] hover:bg-[#002A5C]/90 text-white"
                        : ""
                    }`}
                    onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
                    disabled={isSaving}
                  >
                    {isEditing ? (
                      <>
                        <Save className="h-3.5 w-3.5" />
                        {isSaving ? "Saving..." : "Save"}
                      </>
                    ) : (
                      <>
                        <Edit3 className="h-3.5 w-3.5" />
                        Edit Profile
                      </>
                    )}
                  </Button>
                </div>
                {isEditing && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs text-gray-500"
                    onClick={handleCancelEdit}
                    disabled={isSaving}
                  >
                    Cancel
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="bg-white shadow-sm">
            <TabsTrigger value="profile" className="text-xs gap-1.5">
              <User className="h-3.5 w-3.5" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="privacy" className="text-xs gap-1.5">
              <Shield className="h-3.5 w-3.5" />
              Privacy
            </TabsTrigger>
            <TabsTrigger value="settings" className="text-xs gap-1.5">
              <Settings className="h-3.5 w-3.5" />
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-6">
            {/* Bio */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold">About</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                {isEditing ? (
                  <Textarea
                    value={profile.bio}
                    onChange={(e) =>
                      setProfile((p) => ({ ...p, bio: e.target.value }))
                    }
                    className="min-h-[80px] text-sm"
                  />
                ) : (
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {profile.bio}
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Interests */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold">
                  Interests & Expertise
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex flex-wrap gap-2">
                  {profile.interests.map((tag) => (
                    <Badge
                      key={tag}
                      variant="secondary"
                      className="bg-[#002A5C]/5 text-[#002A5C] text-xs gap-1"
                    >
                      {tag}
                      {isEditing && (
                        <X
                          className="h-3 w-3 cursor-pointer hover:text-red-500"
                          onClick={() => removeInterest(tag)}
                        />
                      )}
                    </Badge>
                  ))}
                </div>
                {isEditing && (
                  <div className="flex gap-2 mt-3">
                    <Input
                      placeholder="Add interest..."
                      value={newInterest}
                      onChange={(e) => setNewInterest(e.target.value)}
                      className="h-8 text-sm"
                      onKeyDown={(e) => e.key === "Enter" && addInterest()}
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8"
                      onClick={addInterest}
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Looking For */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold">
                  Looking For
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex flex-wrap gap-2">
                  {profile.lookingFor.map((tag) => (
                    <Badge
                      key={tag}
                      variant="outline"
                      className="text-xs gap-1"
                    >
                      {tag}
                      {isEditing && (
                        <X
                          className="h-3 w-3 cursor-pointer hover:text-red-500"
                          onClick={() => removeLookingFor(tag)}
                        />
                      )}
                    </Badge>
                  ))}
                </div>
                {isEditing && (
                  <div className="flex gap-2 mt-3">
                    <Input
                      placeholder="Add what you're looking for..."
                      value={newLookingFor}
                      onChange={(e) => setNewLookingFor(e.target.value)}
                      className="h-8 text-sm"
                      onKeyDown={(e) => e.key === "Enter" && addLookingFor()}
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8"
                      onClick={addLookingFor}
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Links */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold">Links</CardTitle>
              </CardHeader>
              <CardContent className="pt-0 space-y-3">
                {(
                  [
                    { label: "LinkedIn", key: "linkedin", placeholder: "https://linkedin.com/in/..." },
                    { label: "GitHub", key: "github", placeholder: "https://github.com/..." },
                    { label: "Email", key: "email", placeholder: "student@mail.utoronto.ca" },
                  ] as const
                ).map((link) => (
                  <div key={link.label} className="flex items-center gap-3">
                    <LinkIcon className="h-4 w-4 text-gray-400 shrink-0" />
                    <div className="flex-1">
                      <span className="text-xs font-medium text-gray-400 block">
                        {link.label}
                      </span>
                      {isEditing && link.key !== "email" ? (
                        <Input
                          value={profile[link.key] ?? ""}
                          placeholder={link.placeholder}
                          className="h-8 text-sm mt-1"
                          onChange={(e) =>
                            setProfile((p) => ({ ...p, [link.key]: e.target.value }))
                          }
                        />
                      ) : (
                        <span className="text-sm text-[#002A5C]">
                          {profile[link.key] || link.placeholder}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="privacy" className="space-y-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold">
                  Privacy Controls
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0 space-y-4">
                <p className="text-sm text-gray-500">
                  Control who can see your profile and posts. Powered by AWS
                  Cognito role-based access.
                </p>
                {[
                  {
                    label: "Profile Visibility",
                    desc: "Who can find you in Discover",
                    icon: Eye,
                    current: "Everyone",
                  },
                  {
                    label: "Post Default Visibility",
                    desc: "Default audience for new posts",
                    icon: Users,
                    current: "Everyone",
                  },
                  {
                    label: "Message Permissions",
                    desc: "Who can send you messages",
                    icon: Lock,
                    current: "Connections Only",
                  },
                ].map((setting) => {
                  const Icon = setting.icon;
                  return (
                    <div
                      key={setting.label}
                      className="flex items-center justify-between rounded-lg border p-4"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#002A5C]/5">
                          <Icon className="h-4 w-4 text-[#002A5C]" />
                        </div>
                        <div>
                          <span className="text-sm font-medium">
                            {setting.label}
                          </span>
                          <p className="text-xs text-gray-400">{setting.desc}</p>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {setting.current}
                      </Badge>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold">
                  Account Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-4">
                  <div className="rounded-lg border p-4">
                    <span className="text-sm font-medium">
                      Authentication
                    </span>
                    <p className="text-xs text-gray-400 mt-1">
                      Signed in via Amazon Cognito with UofT SSO
                    </p>
                    <Badge
                      variant="secondary"
                      className="mt-2 bg-emerald-50 text-emerald-600 text-xs"
                    >
                      Verified UofT Student
                    </Badge>
                  </div>
                  <Separator />
                  <div className="rounded-lg border p-4">
                    <span className="text-sm font-medium">
                      Email Notifications
                    </span>
                    <p className="text-xs text-gray-400 mt-1">
                      Digest emails powered by Amazon SES
                    </p>
                    <div className="flex gap-2 mt-2">
                      <Badge className="bg-[#002A5C] text-white text-xs">
                        Weekly Digest
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        New Matches
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        Messages
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
          </>
        )}
      </div>
    </div>
  );
}
