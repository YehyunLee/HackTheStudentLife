"use client";

import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MessageCircle, Sparkles, GraduationCap, Briefcase, BookOpen, Award, CheckCircle } from "lucide-react";
import type { UserProfile } from "@/lib/mock-data";

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

const roleConfig = {
  student: { color: "bg-sky-500", icon: GraduationCap, label: "Student" },
  alumni: { color: "bg-amber-500", icon: Briefcase, label: "Alumni" },
  professor: { color: "bg-emerald-500", icon: BookOpen, label: "Professor" },
  mentor: { color: "bg-violet-500", icon: Award, label: "Mentor" },
};

export function ProfileCard({
  user,
  matchScore,
  onConnect,
  onViewProfile,
}: {
  user: UserProfile;
  matchScore?: number;
  onConnect?: (user: UserProfile) => void;
  onViewProfile?: (user: UserProfile) => void;
}) {
  const config = roleConfig[user.role];
  const Icon = config.icon;
  
  // Check if user is verified instructor (based on email domain)
  const isInstructor = user.email?.endsWith('@utoronto.ca') || user.email?.endsWith('@cs.toronto.edu');

  return (
    <Card className="group relative overflow-hidden transition-all hover:shadow-lg hover:-translate-y-0.5">
      {/* Accent bar */}
      <div className={`absolute left-0 top-0 h-1 w-full ${config.color}`} />

      <CardHeader className="pb-3 pt-5">
        <div className="flex items-start gap-3">
          <Avatar className="h-12 w-12 border-2 border-gray-100">
            <AvatarFallback className="bg-[#002A5C] text-white text-sm font-semibold">
              {getInitials(user.name)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm truncate">{user.name}</span>
              {isInstructor && (
                <Badge className="bg-[#002A5C] text-white text-[10px] px-1.5 py-0 gap-1">
                  <CheckCircle className="h-2.5 w-2.5" />
                  Verified
                </Badge>
              )}
              {matchScore && (
                <Badge className="bg-gradient-to-r from-[#002A5C] to-blue-500 text-white text-[10px] px-1.5 py-0 gap-0.5">
                  <Sparkles className="h-2.5 w-2.5" />
                  {matchScore}%
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <Icon className="h-3 w-3 text-gray-400" />
              <span className="text-xs text-gray-500">{config.label}</span>
              <span className="text-xs text-gray-300">·</span>
              <span className="text-xs text-gray-500 truncate">{user.department}</span>
            </div>
            {user.year && (
              <span className="text-xs text-gray-400">{user.year}</span>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="pb-3">
        <p className="text-xs text-gray-600 leading-relaxed line-clamp-2">
          {user.bio}
        </p>

        <div className="mt-3 space-y-2">
          <div>
            <span className="text-[10px] font-medium uppercase tracking-wide text-gray-400">
              Interests
            </span>
            <div className="mt-1 flex flex-wrap gap-1">
              {user.interests.slice(0, 4).map((tag) => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className="bg-[#002A5C]/5 text-[#002A5C] text-[10px] font-normal"
                >
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
          <div>
            <span className="text-[10px] font-medium uppercase tracking-wide text-gray-400">
              Looking For
            </span>
            <div className="mt-1 flex flex-wrap gap-1">
              {user.lookingFor.slice(0, 3).map((tag) => (
                <Badge
                  key={tag}
                  variant="outline"
                  className="text-[10px] font-normal text-gray-600"
                >
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter className="border-t pt-3 gap-2">
        <Button
          size="sm"
          className="flex-1 bg-[#002A5C] hover:bg-[#002A5C]/90 text-white text-xs h-8"
          onClick={() => onConnect?.(user)}
        >
          <MessageCircle className="mr-1.5 h-3.5 w-3.5" />
          Connect
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="flex-1 text-xs h-8 border-[#002A5C]/20 text-[#002A5C] hover:bg-[#002A5C]/5"
          onClick={() => onViewProfile?.(user)}
        >
          View Profile
        </Button>
      </CardFooter>
    </Card>
  );
}
