"use client";

import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/lib/auth-context";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { fetchConversations, fetchConversation, sendMessage as sendMessageApi, markConversationAsRead, type Conversation } from "@/lib/api";
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
  Loader2,
} from "lucide-react";

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

export default function MessagesPage() {
  const { isAuthenticated, user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [messageInput, setMessageInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileShowChat, setMobileShowChat] = useState(false);

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  const loadConversations = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      setIsLoading(true);
      const data = await fetchConversations();
      setConversations(data);
    } catch (error) {
      console.error('Failed to load conversations', error);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  const loadConversation = useCallback(async (conversationId: string) => {
    try {
      const data = await fetchConversation(conversationId);
      setSelectedConversation(data);
      await markConversationAsRead(conversationId);
      await loadConversations();
    } catch (error) {
      console.error('Failed to load conversation', error);
    }
  }, [loadConversations]);

  const handleSendMessage = useCallback(async () => {
    if (!messageInput.trim() || !selectedConversation) return;
    
    try {
      setIsSending(true);
      const { conversation } = await sendMessageApi({
        conversationId: selectedConversation.conversationId,
        content: messageInput,
      });
      setSelectedConversation(conversation);
      setMessageInput('');
      await loadConversations();
    } catch (error) {
      console.error('Failed to send message', error);
    } finally {
      setIsSending(false);
    }
  }, [messageInput, selectedConversation, loadConversations]);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (isAuthenticated && selectedConversation) {
        loadConversation(selectedConversation.conversationId);
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [isAuthenticated, selectedConversation, loadConversation]);

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
              <Button className="w-full bg-[#002A5C] hover:bg-[#002A5C]/90">
                Sign In
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const filteredConversations = conversations.filter(conv =>
    conv.otherParticipant?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.lastMessage?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-[#002A5C]">Messages</h1>
          <p className="text-gray-500 mt-1">Connect with your UofT community</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-[calc(100vh-200px)]">
          <Card className={`lg:col-span-1 ${mobileShowChat ? 'hidden lg:block' : ''}`}>
            <CardContent className="p-0 h-full flex flex-col">
              <div className="p-4 border-b">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search conversations..."
                    className="pl-9"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              <ScrollArea className="flex-1">
                {isLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-[#002A5C]" />
                  </div>
                ) : filteredConversations.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">
                    <p>No conversations yet</p>
                    <p className="text-sm mt-2">Start connecting with others!</p>
                  </div>
                ) : (
                  filteredConversations.map((conv) => (
                    <div
                      key={conv.conversationId}
                      onClick={() => {
                        loadConversation(conv.conversationId);
                        setMobileShowChat(true);
                      }}
                      className={`p-4 border-b cursor-pointer hover:bg-gray-50 transition-colors ${
                        selectedConversation?.conversationId === conv.conversationId ? 'bg-blue-50' : ''
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <Avatar className="h-12 w-12">
                          <AvatarFallback className="bg-[#002A5C]/10 text-[#002A5C]">
                            {getInitials(conv.otherParticipant?.name || 'Unknown')}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-sm truncate">
                              {conv.otherParticipant?.name || 'Unknown'}
                            </span>
                            <span className="text-xs text-gray-500 ml-2">
                              {formatTime(conv.lastMessageTime)}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 truncate mt-1">
                            {conv.lastMessage}
                          </p>
                          {conv.unreadCount > 0 && (
                            <Badge className="mt-1 bg-[#002A5C] text-white text-xs">
                              {conv.unreadCount} new
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </ScrollArea>
            </CardContent>
          </Card>

          <Card className={`lg:col-span-2 ${!mobileShowChat ? 'hidden lg:block' : ''}`}>
            <CardContent className="p-0 h-full flex flex-col">
              {selectedConversation ? (
                <>
                  <div className="p-4 border-b flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="lg:hidden"
                        onClick={() => setMobileShowChat(false)}
                      >
                        <ArrowLeft className="h-4 w-4" />
                      </Button>
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-[#002A5C]/10 text-[#002A5C]">
                          {getInitials(selectedConversation.otherParticipant?.name || 'Unknown')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold text-sm">
                          {selectedConversation.otherParticipant?.name || 'Unknown'}
                        </h3>
                        <p className="text-xs text-gray-500">
                          {selectedConversation.otherParticipant?.role || 'Student'}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm">
                        <Phone className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Video className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <ScrollArea className="flex-1 p-4">
                    <div className="space-y-4">
                      {selectedConversation.messages.map((msg) => (
                        <div
                          key={msg.messageId}
                          className={`flex ${msg.senderId === user?.userId ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[70%] rounded-lg p-3 ${
                              msg.senderId === user?.userId
                                ? 'bg-[#002A5C] text-white'
                                : 'bg-gray-100 text-gray-900'
                            }`}
                          >
                            <p className="text-sm">{msg.content}</p>
                            <p className={`text-xs mt-1 ${
                              msg.senderId === user?.userId ? 'text-blue-100' : 'text-gray-500'
                            }`}>
                              {formatTime(msg.timestamp)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>

                  <div className="p-4 border-t">
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm">
                        <Smile className="h-5 w-5 text-gray-500" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Paperclip className="h-5 w-5 text-gray-500" />
                      </Button>
                      <Input
                        placeholder="Type a message..."
                        value={messageInput}
                        onChange={(e) => setMessageInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                        className="flex-1"
                      />
                      <Button 
                        onClick={handleSendMessage}
                        disabled={isSending || !messageInput.trim()}
                        className="bg-[#002A5C] hover:bg-[#002A5C]/90"
                      >
                        {isSending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Send className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center text-center p-8">
                  <div>
                    <Sparkles className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Select a conversation
                    </h3>
                    <p className="text-sm text-gray-500">
                      Choose a conversation from the list to start messaging
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
