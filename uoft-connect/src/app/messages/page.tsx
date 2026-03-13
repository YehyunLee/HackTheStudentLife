"use client";

import Link from "next/link";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/lib/auth-context";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { mockMessages, mockUsers } from "@/lib/mock-data";
import {
  Search,
  Send,
  Sparkles,
  Phone,
  Video,
  MoreVertical,
  Smile,
  Paperclip,
  ArrowLeft,
} from "lucide-react";

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

const sampleChat = [
  {
    id: "c1",
    sender: "them",
    text: "Hey! I saw your post about looking for an NLP research mentor. I actually work on transformer architectures in my lab.",
    time: "2:30 PM",
  },
  {
    id: "c2",
    sender: "me",
    text: "Oh wow, that's exactly what I'm interested in! Could you tell me more about your current research?",
    time: "2:32 PM",
  },
  {
    id: "c3",
    sender: "them",
    text: "Sure! We're working on efficient fine-tuning methods for large language models. We use AWS SageMaker for training and have a few positions open for the summer.",
    time: "2:35 PM",
  },
  {
    id: "c4",
    sender: "me",
    text: "That sounds amazing! I've been learning about LoRA and parameter-efficient approaches. Would love to chat more about this.",
    time: "2:37 PM",
  },
  {
    id: "c5",
    sender: "them",
    text: "Great enthusiasm! Why don't we schedule a 30-min coffee chat this week? I'm free Thursday or Friday afternoon.",
    time: "2:40 PM",
  },
];

export default function MessagesPage() {
  const { isAuthenticated } = useAuth();
  const [selectedMessage, setSelectedMessage] = useState(mockMessages[0]);
  const [messageInput, setMessageInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileShowChat, setMobileShowChat] = useState(false);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <Card className="max-w-md w-full text-center p-8">
          <CardContent className="space-y-4">
            <h2 className="text-xl font-semibold text-[#002A5C]">Sign in to view messages</h2>
            <p className="text-sm text-gray-500">
              Chat with your connections once you log in with your UofT email.
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
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-[#002A5C]">Messages</h1>
          <p className="mt-1 text-sm text-gray-500">
            Chat with your connections
          </p>
        </div>

        <Card className="overflow-hidden shadow-sm" style={{ height: "calc(100vh - 220px)" }}>
          <div className="flex h-full">
            {/* Conversation List */}
            <div
              className={`w-full border-r md:w-80 md:block ${
                mobileShowChat ? "hidden" : "block"
              }`}
            >
              <div className="p-3 border-b">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    placeholder="Search conversations..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 h-9 text-sm"
                  />
                </div>
              </div>
              <ScrollArea className="h-[calc(100%-57px)]">
                {mockMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex cursor-pointer items-start gap-3 px-4 py-3 transition-colors hover:bg-gray-50 ${
                      selectedMessage?.id === msg.id ? "bg-[#002A5C]/5" : ""
                    }`}
                    onClick={() => {
                      setSelectedMessage(msg);
                      setMobileShowChat(true);
                    }}
                  >
                    <Avatar className="h-10 w-10 shrink-0">
                      <AvatarFallback className="bg-[#002A5C] text-white text-xs">
                        {getInitials(msg.from.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold truncate">
                          {msg.from.name}
                        </span>
                        <span className="text-[10px] text-gray-400 shrink-0 ml-2">
                          {msg.timestamp}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 truncate mt-0.5">
                        {msg.preview}
                      </p>
                    </div>
                    {msg.unread && (
                      <div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-blue-500" />
                    )}
                  </div>
                ))}

                <Separator className="my-2" />
                <div className="px-4 py-3 text-center">
                  <div className="flex items-center justify-center gap-1.5 text-xs text-gray-400">
                    <Sparkles className="h-3 w-3" />
                    <span>Suggested conversation starters from AI</span>
                  </div>
                  <div className="mt-2 space-y-2">
                    {mockUsers.slice(4, 6).map((user) => (
                      <div
                        key={user.id}
                        className="flex items-center gap-2 rounded-lg border border-dashed p-2 cursor-pointer hover:bg-gray-50 transition-colors"
                      >
                        <Avatar className="h-7 w-7">
                          <AvatarFallback className="bg-violet-100 text-violet-700 text-[10px]">
                            {getInitials(user.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="text-left flex-1 min-w-0">
                          <span className="text-xs font-medium block truncate">
                            {user.name}
                          </span>
                          <span className="text-[10px] text-gray-400">
                            {user.interests[0]} match
                          </span>
                        </div>
                        <Badge className="bg-[#002A5C] text-white text-[9px] px-1.5">
                          Say hi
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </ScrollArea>
            </div>

            {/* Chat Area */}
            <div
              className={`flex flex-1 flex-col md:flex ${
                mobileShowChat ? "flex" : "hidden md:flex"
              }`}
            >
              {selectedMessage ? (
                <>
                  {/* Chat Header */}
                  <div className="flex items-center justify-between border-b px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="md:hidden h-8 w-8"
                        onClick={() => setMobileShowChat(false)}
                      >
                        <ArrowLeft className="h-4 w-4" />
                      </Button>
                      <Avatar className="h-9 w-9">
                        <AvatarFallback className="bg-[#002A5C] text-white text-xs">
                          {getInitials(selectedMessage.from.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <span className="text-sm font-semibold">
                          {selectedMessage.from.name}
                        </span>
                        <div className="flex items-center gap-1">
                          <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
                          <span className="text-[10px] text-gray-400">
                            Online
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Phone className="h-4 w-4 text-gray-400" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Video className="h-4 w-4 text-gray-400" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4 text-gray-400" />
                      </Button>
                    </div>
                  </div>

                  {/* Chat Messages */}
                  <ScrollArea className="flex-1 p-4">
                    <div className="space-y-4">
                      <div className="text-center">
                        <Badge
                          variant="secondary"
                          className="text-[10px] text-gray-400"
                        >
                          Matched via shared interest in NLP
                        </Badge>
                      </div>
                      {sampleChat.map((msg) => (
                        <div
                          key={msg.id}
                          className={`flex ${
                            msg.sender === "me" ? "justify-end" : "justify-start"
                          }`}
                        >
                          <div
                            className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${
                              msg.sender === "me"
                                ? "bg-[#002A5C] text-white rounded-br-md"
                                : "bg-gray-100 text-gray-800 rounded-bl-md"
                            }`}
                          >
                            <p className="text-sm leading-relaxed">{msg.text}</p>
                            <span
                              className={`mt-1 block text-[10px] ${
                                msg.sender === "me"
                                  ? "text-blue-200"
                                  : "text-gray-400"
                              }`}
                            >
                              {msg.time}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>

                  {/* Message Input */}
                  <div className="border-t p-3">
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                        <Paperclip className="h-4 w-4 text-gray-400" />
                      </Button>
                      <Input
                        placeholder="Type a message..."
                        value={messageInput}
                        onChange={(e) => setMessageInput(e.target.value)}
                        className="h-9 text-sm"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            setMessageInput("");
                          }
                        }}
                      />
                      <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                        <Smile className="h-4 w-4 text-gray-400" />
                      </Button>
                      <Button
                        size="icon"
                        className="h-8 w-8 shrink-0 bg-[#002A5C] hover:bg-[#002A5C]/90"
                      >
                        <Send className="h-3.5 w-3.5 text-white" />
                      </Button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex flex-1 items-center justify-center text-center">
                  <div>
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                      <Send className="h-7 w-7 text-gray-300" />
                    </div>
                    <p className="text-sm text-gray-500">
                      Select a conversation to start chatting
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
