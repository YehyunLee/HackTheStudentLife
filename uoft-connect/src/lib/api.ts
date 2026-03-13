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
  replies: number;
  createdAt: string;
  updatedAt: string;
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
    throw new Error(`Failed to fetch posts: ${response.statusText}`);
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
}): Promise<Post> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_BASE_URL}/posts`, {
    method: "POST",
    headers,
    body: JSON.stringify(post),
  });
  
  if (!response.ok) {
    throw new Error(`Failed to create post: ${response.statusText}`);
  }
  
  const data = await response.json();
  return data.post;
}

export async function deletePost(postId: string): Promise<void> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_BASE_URL}/posts/${postId}`, {
    method: "DELETE",
    headers,
  });
  
  if (!response.ok) {
    throw new Error(`Failed to delete post: ${response.statusText}`);
  }
}

export async function updatePost(
  postId: string,
  updates: {
    content?: string;
    tags?: string[];
    type?: "looking-for" | "offering" | "discussion";
    visibility?: "everyone" | "students" | "faculty" | "alumni";
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
