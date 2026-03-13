"use client";

import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Heart,
  MessageCircle,
  Share2,
  Eye,
  Lock,
  Users,
  GraduationCap,
  Pencil,
  Trash2,
} from "lucide-react";
import type { Post as MockPost } from "@/lib/mock-data";
import type { Post as ApiPost } from "@/lib/api";

type Post = MockPost | ApiPost;

type PostCardProps = {
  post: Post;
  isOwnPost?: boolean;
  onView?: (post: Post) => void;
  onEdit?: (post: Post) => void;
  onDelete?: (post: Post) => void;
};

const visibilityIcon = {
  everyone: <Eye className="h-3 w-3" />,
  students: <GraduationCap className="h-3 w-3" />,
  faculty: <Users className="h-3 w-3" />,
  alumni: <Lock className="h-3 w-3" />,
};

const typeColors = {
  "looking-for": "bg-blue-100 text-blue-700",
  offering: "bg-green-100 text-green-700",
  discussion: "bg-purple-100 text-purple-700",
};

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

const roleBadge = {
  student: "bg-sky-100 text-sky-700",
  alumni: "bg-amber-100 text-amber-700",
  professor: "bg-emerald-100 text-emerald-700",
  mentor: "bg-violet-100 text-violet-700",
} as const;

const FALLBACK_ROLE_CLASS = "bg-gray-100 text-gray-600";

export function PostCard({ post, isOwnPost, onView, onEdit, onDelete }: PostCardProps) {
  const authorRole = (post.author.role || "student") as keyof typeof roleBadge;
  const roleClass = roleBadge[authorRole] ?? FALLBACK_ROLE_CLASS;

  return (
    <Card className="bg-white border border-gray-200 rounded-xl transition-shadow hover:shadow-md hover:bg-gray-50">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 border-2 border-[#002A5C]/10">
              <AvatarFallback className="bg-[#002A5C]/5 text-[#002A5C] text-sm font-semibold">
                {getInitials(post.author.name)}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm">{post.author.name}</span>
                <Badge
                  variant="secondary"
                  className={`text-[10px] px-1.5 py-0 ${roleClass}`}
                >
                  {post.author.role}
                </Badge>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <span>{post.author.department}</span>
                <span>·</span>
                <span>{post.createdAt}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Badge variant="outline" className={`text-[10px] ${typeColors[post.type]}`}>
              {post.type === "looking-for" ? "Looking For" : post.type === "offering" ? "Offering" : "Discussion"}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pb-3">
        <p className="text-sm leading-relaxed text-gray-700">{post.content}</p>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {post.tags.map((tag) => (
            <Badge
              key={tag}
              variant="secondary"
              className="bg-[#002A5C]/5 text-[#002A5C] text-[11px] font-normal hover:bg-[#002A5C]/10"
            >
              {tag}
            </Badge>
          ))}
        </div>
      </CardContent>
      <CardFooter className="border-t pt-3">
        <div className="flex w-full flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-1">
            <Button variant="ghost" size="sm" className="text-gray-500 hover:text-red-500 h-8 px-2">
              <Heart className="mr-1 h-3.5 w-3.5" />
              <span className="text-xs">{post.likes}</span>
            </Button>
            <Button variant="ghost" size="sm" className="text-gray-500 hover:text-[#002A5C] h-8 px-2">
              <MessageCircle className="mr-1 h-3.5 w-3.5" />
              <span className="text-xs">{post.replies}</span>
            </Button>
            <Button variant="ghost" size="sm" className="text-gray-500 hover:text-[#002A5C] h-8 px-2">
              <Share2 className="h-3.5 w-3.5" />
            </Button>
          </div>
          <div className="flex gap-1">
            {onView && (
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-500 hover:text-[#002A5C] h-8 px-2"
                onClick={() => onView(post)}
              >
                <Eye className="mr-1 h-3.5 w-3.5" />
                <span className="text-xs">View</span>
              </Button>
            )}
            {isOwnPost && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-500 hover:text-[#002A5C] h-8 px-2"
                  onClick={() => onEdit?.(post)}
                >
                  <Pencil className="mr-1 h-3.5 w-3.5" />
                  <span className="text-xs">Edit</span>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-500 hover:text-red-500 h-8 px-2"
                  onClick={() => onDelete?.(post)}
                >
                  <Trash2 className="mr-1 h-3.5 w-3.5" />
                  <span className="text-xs">Delete</span>
                </Button>
              </>
            )}
          </div>
          <div className="flex items-center gap-1 text-xs text-gray-400">
            {visibilityIcon[post.visibility]}
            <span className="capitalize">{post.visibility}</span>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}
