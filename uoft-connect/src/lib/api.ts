import { fetchAuthSession } from "aws-amplify/auth";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://qxlh02ni6a.execute-api.us-west-2.amazonaws.com";

async function getAuthHeaders(): Promise<HeadersInit> {
  try {
    const session = await fetchAuthSession();
    const token = session.tokens?.idToken?.toString();
    if (token) {
      return {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      };
    }
  } catch (error) {
    console.log("No auth session:", error);
  }
  return {
    "Content-Type": "application/json",
  };
}

export interface Post {
  postId: string;
  authorId: string;
  author: {
    id: string;
    name: string;
    email: string;
    role: string;
    department: string;
  };
  content: string;
  tags: string[];
  type: "looking-for" | "offering" | "discussion";
  visibility: "everyone" | "students" | "faculty" | "alumni";
  likes: number;
  likedBy?: string[];
  replies: number;
  repliesList?: Reply[];
  createdAt: string;
  updatedAt: string;
}

export interface Reply {
  replyId: string;
  authorId: string;
  author: {
    id: string;
    name: string;
    email: string;
    role: string;
    department: string;
  };
  content: string;
  createdAt: string;
}

export interface User {
  userId: string;
  email: string;
  name: string;
  role: string;
  department: string;
  year?: string;
  bio: string;
  interests: string[];
  lookingFor: string[];
  linkedin?: string;
  github?: string;
  createdAt: string;
  updatedAt: string;
}

export async function fetchPosts(): Promise<Post[]> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_BASE_URL}/posts`, { headers });
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error('fetchPosts error:', response.status, errorText);
    throw new Error(`Failed to fetch posts: ${response.status} ${response.statusText}`);
  }
  
  const data = await response.json();
  return data.posts || [];
}

export async function createPost(post: {
  content: string;
  tags: string[];
  type: "looking-for" | "offering" | "discussion";
  visibility: "everyone" | "students" | "faculty" | "alumni";
  authorRole?: string;
  authorDepartment?: string;
  authorEmail?: string;
  authorName?: string;
  clientUserId?: string;
}): Promise<Post> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_BASE_URL}/posts`, {
    method: "POST",
    headers,
    body: JSON.stringify(post),
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error('createPost error:', response.status, errorText);
    throw new Error(`Failed to create post: ${response.status} ${response.statusText}`);
  }
  
  const data = await response.json();
  return data.post;
}

export async function deletePost(postId: string, userId?: string): Promise<void> {
  const headers = await getAuthHeaders();
  
  const response = await fetch(`${API_BASE_URL}/posts/${postId}`, {
    method: "DELETE",
    headers,
    body: JSON.stringify({ clientUserId: userId }),
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error('deletePost error:', response.status, errorText);
    throw new Error(`Failed to delete post: ${response.status} ${response.statusText}`);
  }
}

export async function updatePost(
  postId: string,
  updates: {
    content?: string;
    tags?: string[];
    type?: "looking-for" | "offering" | "discussion";
    visibility?: "everyone" | "students" | "faculty" | "alumni";
    clientEmail?: string;
    clientUserId?: string;
  }
): Promise<Post> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_BASE_URL}/posts/${postId}`, {
    method: "PUT",
    headers,
    body: JSON.stringify(updates),
  });

  if (!response.ok) {
    throw new Error(`Failed to update post: ${response.statusText}`);
  }

  const data = await response.json();
  return data.post;
}

export async function fetchCurrentUser(): Promise<User> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_BASE_URL}/users/me`, { headers });
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error('fetchCurrentUser error:', response.status, errorText);
    throw new Error(`Failed to fetch user: ${response.status} ${response.statusText}`);
  }
  
  const data = await response.json();
  return data.user;
}

export async function updateCurrentUser(updates: Partial<User>): Promise<User> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_BASE_URL}/users/me`, {
    method: "PUT",
    headers,
    body: JSON.stringify(updates),
  });
  
  if (!response.ok) {
    throw new Error(`Failed to update user: ${response.statusText}`);
  }
  
  const data = await response.json();
  return data.user;
}

export async function fetchUsers(): Promise<User[]> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_BASE_URL}/users`, { headers });
  
  if (!response.ok) {
    throw new Error(`Failed to fetch users: ${response.statusText}`);
  }
  
  const data = await response.json();
  return data.users || [];
}

export async function fetchUserById(userId: string): Promise<User> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_BASE_URL}/users/${userId}`, { headers });
  
  if (!response.ok) {
    throw new Error(`Failed to fetch user: ${response.statusText}`);
  }
  
  const data = await response.json();
  return data.user;
}

export async function likePost(postId: string, userId?: string): Promise<Post> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_BASE_URL}/posts/${postId}/like`, {
    method: "POST",
    headers,
    body: JSON.stringify({ clientUserId: userId }),
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error('likePost error:', response.status, errorText);
    throw new Error(`Failed to like post: ${response.status}`);
  }
  
  const data = await response.json();
  return data.post;
}

export async function unlikePost(postId: string, userId?: string): Promise<Post> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_BASE_URL}/posts/${postId}/unlike`, {
    method: "POST",
    headers,
    body: JSON.stringify({ clientUserId: userId }),
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error('unlikePost error:', response.status, errorText);
    throw new Error(`Failed to unlike post: ${response.status}`);
  }
  
  const data = await response.json();
  return data.post;
}

export interface Message {
  messageId: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: string;
  read: boolean;
}

export interface Conversation {
  conversationId: string;
  participants: string[];
  participantId?: string;
  messages: Message[];
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  createdAt: string;
  updatedAt: string;
  otherParticipant?: {
    userId: string;
    name: string;
    email: string;
    role: string;
  };
}

export async function fetchConversations(): Promise<Conversation[]> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_BASE_URL}/conversations`, { headers });
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error('fetchConversations error:', response.status, errorText);
    throw new Error(`Failed to fetch conversations: ${response.status}`);
  }
  
  const data = await response.json();
  return data.conversations || [];
}

export async function fetchConversation(conversationId: string): Promise<Conversation> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_BASE_URL}/conversations/${conversationId}`, { headers });
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error('fetchConversation error:', response.status, errorText);
    throw new Error(`Failed to fetch conversation: ${response.status}`);
  }
  
  const data = await response.json();
  return data.conversation;
}

export async function replyToPost(postId: string, content: string): Promise<Post> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_BASE_URL}/posts/${postId}/replies`, {
    method: "POST",
    headers,
    body: JSON.stringify({ content }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('replyToPost error:', response.status, errorText);
    throw new Error(`Failed to reply: ${response.status}`);
  }

  const data = await response.json();
  return data.post;
}

export async function sendMessage(params: {
  recipientId?: string;
  conversationId?: string;
  content: string;
}): Promise<{ conversation: Conversation; message: Message }> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_BASE_URL}/messages`, {
    method: "POST",
    headers,
    body: JSON.stringify(params),
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error('sendMessage error:', response.status, errorText);
    throw new Error(`Failed to send message: ${response.status}`);
  }
  
  const data = await response.json();
  return data;
}

export async function markConversationAsRead(conversationId: string): Promise<Conversation> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_BASE_URL}/conversations/${conversationId}/read`, {
    method: "POST",
    headers,
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error('markAsRead error:', response.status, errorText);
    throw new Error(`Failed to mark as read: ${response.status}`);
  }
  
  const data = await response.json();
  return data.conversation;
}
