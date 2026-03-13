"use client";

import { useState } from "react";
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
} from "lucide-react";

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({
    name: "Sarah Chen",
    role: "student" as const,
    department: "Computer Science",
    year: "3rd Year",
    bio: "Passionate about ML and NLP. Looking for research opportunities and mentorship in AI. Currently exploring transformer architectures and their applications in healthcare.",
    interests: ["Machine Learning", "NLP", "Python", "AWS SageMaker", "Healthcare AI"],
    lookingFor: ["Research Mentor", "Industry Connections", "Study Group"],
    email: "sarah.chen@mail.utoronto.ca",
    linkedin: "linkedin.com/in/sarahchen",
    github: "github.com/sarahchen",
  });

  const [newInterest, setNewInterest] = useState("");
  const [newLookingFor, setNewLookingFor] = useState("");

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
                  SC
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 sm:pb-1">
                <div className="flex items-start justify-between">
                  <div>
                    <h1 className="text-xl font-bold text-gray-900">
                      {profile.name}
                    </h1>
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      <Badge className="bg-sky-100 text-sky-700 text-xs">
                        <GraduationCap className="mr-1 h-3 w-3" />
                        Student
                      </Badge>
                      <span className="text-sm text-gray-500 flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {profile.department}
                      </span>
                      <span className="text-sm text-gray-500 flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {profile.year}
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
                    onClick={() => setIsEditing(!isEditing)}
                  >
                    {isEditing ? (
                      <>
                        <Save className="h-3.5 w-3.5" />
                        Save
                      </>
                    ) : (
                      <>
                        <Edit3 className="h-3.5 w-3.5" />
                        Edit Profile
                      </>
                    )}
                  </Button>
                </div>
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
                {[
                  { label: "LinkedIn", value: profile.linkedin },
                  { label: "GitHub", value: profile.github },
                  { label: "Email", value: profile.email },
                ].map((link) => (
                  <div key={link.label} className="flex items-center gap-3">
                    <LinkIcon className="h-4 w-4 text-gray-400 shrink-0" />
                    <div className="flex-1">
                      <span className="text-xs font-medium text-gray-400 block">
                        {link.label}
                      </span>
                      {isEditing ? (
                        <Input
                          value={link.value}
                          className="h-8 text-sm mt-1"
                          readOnly
                        />
                      ) : (
                        <span className="text-sm text-[#002A5C]">
                          {link.value}
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
      </div>
    </div>
  );
}
