const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const {
  DynamoDBDocumentClient,
  PutCommand,
  GetCommand,
  QueryCommand,
  ScanCommand,
  DeleteCommand,
  BatchGetCommand,
} = require("@aws-sdk/lib-dynamodb");

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

const POSTS_TABLE = "uoft-connect-posts";
const USERS_TABLE = "uoft-connect-users";
const MESSAGES_TABLE = "uoft-connect-messages";

const ALLOWED_POST_FIELDS = ["content", "tags", "type", "visibility"];

function buildReply(authorId, authorDetails, content) {
  return {
    replyId: `reply_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    authorId,
    author: authorDetails,
    content: content.trim(),
    createdAt: new Date().toISOString(),
  };
}

const ALLOWED_USER_FIELDS = [
  "name",
  "role",
  "department",
  "year",
  "bio",
  "interests",
  "lookingFor",
  "linkedin",
  "github",
];

const sanitizeUserUpdates = (updates) => {
  if (!updates || typeof updates !== "object") {
    return {};
  }

  const sanitized = {};
  for (const [key, value] of Object.entries(updates)) {
    if (!ALLOWED_USER_FIELDS.includes(key) || value === undefined) continue;
    if (Array.isArray(value)) {
      sanitized[key] = value.filter(Boolean);
    } else if (typeof value === "string") {
      sanitized[key] = value.trim();
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
};

const headers = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type,Authorization,X-Client-User-Id",
  "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
};

const sanitizePostUpdates = (updates) => {
  if (!updates || typeof updates !== "object") {
    return {};
  }

  const sanitized = {};
  for (const [key, value] of Object.entries(updates)) {
    if (!ALLOWED_POST_FIELDS.includes(key) || value === undefined) continue;
    if (key === "tags") {
      if (Array.isArray(value)) {
        sanitized.tags = value
          .map((tag) => (typeof tag === "string" ? tag.trim() : ""))
          .filter(Boolean);
      }
      continue;
    }
    if (typeof value === "string") {
      sanitized[key] = value.trim();
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
};

function decodeJwtPayload(token) {
  try {
    const [, payload] = token.split(".");
    const padded = payload.padEnd(payload.length + (4 - (payload.length % 4)) % 4, "=");
    const json = Buffer.from(padded, "base64").toString("utf8");
    return JSON.parse(json);
  } catch (err) {
    console.error("Failed to decode JWT payload", err);
    return {};
  }
}

function getUserIdentity(event) {
  const claims =
    event.requestContext?.authorizer?.claims ||
    event.requestContext?.authorizer?.jwt?.claims;

  if (claims) {
    return {
      userId: claims.sub || claims["cognito:username"] || "anonymous",
      email: claims.email || "",
      name: claims.name || claims.email?.split("@")[0] || "",
    };
  }

  const authHeader = event.headers?.Authorization || event.headers?.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.slice(7);
    const payload = decodeJwtPayload(token);
    if (payload?.sub || payload?.["cognito:username"]) {
      return {
        userId: payload.sub || payload["cognito:username"],
        email: payload.email || "",
        name: payload.name || payload.email?.split("@")[0] || "",
      };
    }
  }

  return { userId: "anonymous", email: "", name: "" };
}

function ensureAuthenticated(userId) {
  if (!userId || userId === "anonymous") {
    return {
      statusCode: 401,
      headers,
      body: JSON.stringify({ error: "Authentication required" }),
    };
  }
  return null;
}

exports.handler = async (event) => {
  console.log("Event:", JSON.stringify(event, null, 2));

  const method = event.httpMethod || event.requestContext?.http?.method;
  const path = event.path || event.rawPath;

  // Handle CORS preflight
  if (method === "OPTIONS") {
    return { statusCode: 200, headers, body: "" };
  }

  try {
    const identity = getUserIdentity(event);
    const userId = identity.userId;
    const userEmail = identity.email;
    const userName = identity.name;

    // Route handling
    if (path === "/posts" && method === "GET") {
      return await listPosts();
    }

    if (path === "/posts" && method === "POST") {
      const authError = ensureAuthenticated(userId);
      if (authError) return authError;
      const body = JSON.parse(event.body || "{}");
      const effectiveUserId = userId === "anonymous" ? (body.clientUserId || userId) : userId;
      const effectiveEmail = userEmail || body.authorEmail || "";
      const effectiveName = userName || body.authorName || effectiveEmail.split("@")[0] || "Unknown";
      return await createPost(body, effectiveUserId, effectiveEmail, effectiveName);
    }

    if (path.startsWith("/posts/") && method === "GET") {
      const postId = path.split("/")[2];
      return await getPost(postId);
    }

    if (path.startsWith("/posts/") && method === "DELETE") {
      const authError = ensureAuthenticated(userId);
      if (authError) return authError;
      const postId = path.split("/")[2];
      const body = JSON.parse(event.body || "{}");
      const effectiveUserId = userId === "anonymous" ? (body.clientUserId || userId) : userId;
      return await deletePost(postId, effectiveUserId);
    }

    if (path.startsWith("/posts/") && method === "PUT") {
      const authError = ensureAuthenticated(userId);
      if (authError) return authError;
      const postId = path.split("/")[2];
      const body = JSON.parse(event.body || "{}");
      const effectiveUserId = userId === "anonymous" ? (body.clientUserId || userId) : userId;
      return await updatePost(postId, effectiveUserId, body);
    }

    if (path === "/users/me" && method === "GET") {
      return await getOrCreateUser(userId, userEmail, userName);
    }

    if (path === "/users/me" && method === "PUT") {
      const body = JSON.parse(event.body || "{}");
      return await updateUser(userId, body);
    }

    if (path === "/users" && method === "GET") {
      return await listUsers();
    }

    if (path.startsWith("/users/") && method === "GET") {
      const targetUserId = path.split("/")[2];
      if (targetUserId === "me") {
        return await getOrCreateUser(userId, userEmail, userName);
      }
      return await getUserById(targetUserId);
    }

    if (path.match(/^\/posts\/[^/]+\/like$/) && method === "POST") {
      const authError = ensureAuthenticated(userId);
      if (authError) return authError;
      const postId = path.split("/")[2];
      const effectiveUserId = userId === "anonymous" ? (JSON.parse(event.body || "{}").clientUserId || userId) : userId;
      return await likePost(postId, effectiveUserId);
    }

    if (path.match(/^\/posts\/[^/]+\/unlike$/) && method === "POST") {
      const authError = ensureAuthenticated(userId);
      if (authError) return authError;
      const postId = path.split("/")[2];
      const effectiveUserId = userId === "anonymous" ? (JSON.parse(event.body || "{}").clientUserId || userId) : userId;
      return await unlikePost(postId, effectiveUserId);
    }

    if (path === "/conversations" && method === "GET") {
      const authError = ensureAuthenticated(userId);
      if (authError) return authError;
      return await listConversations(userId);
    }

    if (path.match(/^\/conversations\/[^/]+$/) && method === "GET") {
      const authError = ensureAuthenticated(userId);
      if (authError) return authError;
      const conversationId = path.split("/")[2];
      return await getConversation(conversationId, userId);
    }

    if (path === "/messages" && method === "POST") {
      const authError = ensureAuthenticated(userId);
      if (authError) return authError;
      const body = JSON.parse(event.body || "{}");
      return await sendMessage(body, userId, userEmail, userName);
    }

    if (path.match(/^\/conversations\/[^/]+\/read$/) && method === "POST") {
      const authError = ensureAuthenticated(userId);
      if (authError) return authError;
      const conversationId = path.split("/")[2];
      return await markAsRead(conversationId, userId);
    }

    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({ error: "Not found" }),
    };
  } catch (error) {
    console.error("Error:", error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message }),
    };
  }
};

async function listPosts() {
  const result = await docClient.send(
    new ScanCommand({
      TableName: POSTS_TABLE,
      Limit: 50,
    })
  );

  let posts = (result.Items || []).sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );

  const missingAuthorIds = posts
    .filter((post) => !post.author || !post.author.name || post.author.name === "Unknown")
    .map((post) => post.authorId)
    .filter(Boolean);

  console.log('Posts needing author enrichment:', missingAuthorIds.length);

  if (missingAuthorIds.length > 0) {
    const uniqueIds = [...new Set(missingAuthorIds)];
    console.log('Fetching users for IDs:', uniqueIds);
    
    const usersResult = await docClient.send(
      new BatchGetCommand({
        RequestItems: {
          [USERS_TABLE]: {
            Keys: uniqueIds.map((id) => ({ userId: id })),
          },
        },
      })
    );

    const users = (usersResult.Responses?.[USERS_TABLE] || []).reduce(
      (acc, user) => {
        acc[user.userId] = user;
        return acc;
      },
      {}
    );

    console.log('Found users:', Object.keys(users).length);

    posts = posts.map((post) => {
      if (!post.author || !post.author.name || post.author.name === "Unknown") {
        const user = users[post.authorId];
        console.log(`Enriching post ${post.postId} for author ${post.authorId}:`, user ? 'found' : 'not found');
        post.author = {
          id: post.authorId,
          name: user?.name || user?.email?.split("@")[0] || "Unknown",
          email: user?.email || "",
          role: user?.role || "student",
          department: user?.department || "Unknown",
        };
      }
      return post;
    });
  }

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({ posts }),
  };
}

async function createPost(body, userId, userEmail, userName) {
  const postId = `post_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const now = new Date().toISOString().replace("T", " ").replace("Z", "");

  const authorDetails = await ensureUserProfile(userId, userEmail, userName);

  const post = {
    postId,
    authorId: userId,
    author: {
      id: userId,
      name: authorDetails.name,
      email: authorDetails.email,
      role: authorDetails.role,
      department: authorDetails.department,
    },
    content: body.content || "",
    tags: body.tags || [],
    type: body.type || "discussion",
    visibility: body.visibility || "everyone",
    likes: 0,
    replies: 0,
    createdAt: now,
    updatedAt: now,
  };

  await docClient.send(
    new PutCommand({
      TableName: POSTS_TABLE,
      Item: post,
    })
  );

  return {
    statusCode: 201,
    headers,
    body: JSON.stringify({ post }),
  };
}

async function ensureUserProfile(userId, userEmail, userName) {
  const existing = await docClient.send(
    new GetCommand({
      TableName: USERS_TABLE,
      Key: { userId },
    })
  );

  if (existing.Item) {
    return {
      name: existing.Item.name || existing.Item.email?.split("@")[0] || userName || "Unknown",
      email: existing.Item.email || userEmail || `${userId}@unknown.local`,
      role: existing.Item.role || "student",
      department: existing.Item.department || existing.Item.faculty || "Unknown",
    };
  }

  const finalEmail = userEmail && userEmail.trim() ? userEmail : `${userId}@unknown.local`;
  const finalName = userName && userName.trim() ? userName : (userEmail ? userEmail.split("@")[0] : userId);

  const newUser = {
    userId,
    email: finalEmail,
    name: finalName,
    role: "student",
    department: "Unknown",
    interests: [],
    lookingFor: [],
    createdAt: new Date().toISOString().replace("T", " ").replace("Z", ""),
    updatedAt: new Date().toISOString().replace("T", " ").replace("Z", ""),
  };

  await docClient.send(
    new PutCommand({
      TableName: USERS_TABLE,
      Item: newUser,
    })
  );

  return {
    name: newUser.name,
    email: newUser.email,
    role: newUser.role,
    department: newUser.department,
  };
}

async function getPost(postId) {
  const result = await docClient.send(
    new GetCommand({
      TableName: POSTS_TABLE,
      Key: { postId },
    })
  );

  if (!result.Item) {
    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({ error: "Post not found" }),
    };
  }

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({ post: result.Item }),
  };
}

async function deletePost(postId, userId) {
  // First check if user owns the post
  const existing = await docClient.send(
    new GetCommand({
      TableName: POSTS_TABLE,
      Key: { postId },
    })
  );

  if (!existing.Item) {
    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({ error: "Post not found" }),
    };
  }

  if (existing.Item.authorId !== userId) {
    return {
      statusCode: 403,
      headers,
      body: JSON.stringify({ error: "Not authorized to delete this post" }),
    };
  }

  await docClient.send(
    new DeleteCommand({
      TableName: POSTS_TABLE,
      Key: { postId },
    })
  );

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({ success: true }),
  };
}

async function getOrCreateUser(userId, email, name) {
  const result = await docClient.send(
    new GetCommand({
      TableName: USERS_TABLE,
      Key: { userId },
    })
  );

  if (result.Item) {
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ user: result.Item }),
    };
  }

  // Create new user profile
  const now = new Date().toISOString();
  const user = {
    userId,
    email,
    name,
    role: "student",
    department: "",
    year: "",
    bio: "",
    interests: [],
    lookingFor: [],
    linkedin: "",
    github: "",
    createdAt: now,
    updatedAt: now,
  };

  await docClient.send(
    new PutCommand({
      TableName: USERS_TABLE,
      Item: user,
    })
  );

  return {
    statusCode: 201,
    headers,
    body: JSON.stringify({ user }),
  };
}

async function updatePost(postId, userId, updates) {
  const existing = await docClient.send(
    new GetCommand({
      TableName: POSTS_TABLE,
      Key: { postId },
    })
  );

  if (!existing.Item) {
    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({ error: "Post not found" }),
    };
  }

  if (existing.Item.authorId !== userId) {
    return {
      statusCode: 403,
      headers,
      body: JSON.stringify({ error: "Not authorized to edit this post" }),
    };
  }

  const sanitized = sanitizePostUpdates(updates);
  if (Object.keys(sanitized).length === 0) {
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ post: existing.Item }),
    };
  }

  const updatedPost = {
    ...existing.Item,
    ...sanitized,
    tags: sanitized.tags ?? existing.Item.tags,
    updatedAt: new Date().toISOString().replace("T", " ").replace("Z", ""),
  };

  await docClient.send(
    new PutCommand({
      TableName: POSTS_TABLE,
      Item: updatedPost,
    })
  );

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({ post: updatedPost }),
  };
}

async function updateUser(userId, updates) {
  const result = await docClient.send(
    new GetCommand({
      TableName: USERS_TABLE,
      Key: { userId },
    })
  );

  if (!result.Item) {
    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({ error: "User not found" }),
    };
  }

  const sanitizedUpdates = sanitizeUserUpdates(updates);

  if (Object.keys(sanitizedUpdates).length === 0) {
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ user: result.Item }),
    };
  }

  const updatedUser = {
    ...result.Item,
    ...sanitizedUpdates,
    userId, // Ensure userId can't be changed
    updatedAt: new Date().toISOString().replace("T", " ").replace("Z", ""),
  };

  await docClient.send(
    new PutCommand({
      TableName: USERS_TABLE,
      Item: updatedUser,
    })
  );

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({ user: updatedUser }),
  };
}

async function listUsers() {
  const result = await docClient.send(
    new ScanCommand({
      TableName: USERS_TABLE,
      Limit: 100,
    })
  );

  const users = (result.Items || []).sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({ users }),
  };
}

async function likePost(postId, userId) {
  const existing = await docClient.send(
    new GetCommand({
      TableName: POSTS_TABLE,
      Key: { postId },
    })
  );

  if (!existing.Item) {
    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({ error: "Post not found" }),
    };
  }

  const post = existing.Item;
  const likedBy = post.likedBy || [];
  
  if (likedBy.includes(userId)) {
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ post }),
    };
  }

  const updatedPost = {
    ...post,
    likes: (post.likes || 0) + 1,
    likedBy: [...likedBy, userId],
    updatedAt: new Date().toISOString(),
  };

  await docClient.send(
    new PutCommand({
      TableName: POSTS_TABLE,
      Item: updatedPost,
    })
  );

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({ post: updatedPost }),
  };
}

async function unlikePost(postId, userId) {
  const existing = await docClient.send(
    new GetCommand({
      TableName: POSTS_TABLE,
      Key: { postId },
    })
  );

  if (!existing.Item) {
    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({ error: "Post not found" }),
    };
  }

  const post = existing.Item;
  const likedBy = post.likedBy || [];
  
  if (!likedBy.includes(userId)) {
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ post }),
    };
  }

  const updatedPost = {
    ...post,
    likes: Math.max((post.likes || 0) - 1, 0),
    likedBy: likedBy.filter(id => id !== userId),
    updatedAt: new Date().toISOString(),
  };

  await docClient.send(
    new PutCommand({
      TableName: POSTS_TABLE,
      Item: updatedPost,
    })
  );

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({ post: updatedPost }),
  };
}

async function listConversations(userId) {
  const result = await docClient.send(
    new QueryCommand({
      TableName: MESSAGES_TABLE,
      IndexName: "byParticipant",
      KeyConditionExpression: "participantId = :userId",
      ExpressionAttributeValues: {
        ":userId": userId,
      },
      ScanIndexForward: false,
      Limit: 50,
    })
  );

  const conversations = result.Items || [];
  
  const userIds = [...new Set(conversations.flatMap(c => c.participants || []))].filter(id => id !== userId);
  
  let users = {};
  if (userIds.length > 0) {
    const usersResult = await docClient.send(
      new BatchGetCommand({
        RequestItems: {
          [USERS_TABLE]: {
            Keys: userIds.map(id => ({ userId: id })),
          },
        },
      })
    );
    users = (usersResult.Responses?.[USERS_TABLE] || []).reduce((acc, user) => {
      acc[user.userId] = user;
      return acc;
    }, {});
  }

  const enrichedConversations = conversations.map(conv => {
    const otherParticipantId = conv.participants?.find(p => p !== userId);
    const otherUser = users[otherParticipantId];
    return {
      ...conv,
      otherParticipant: otherUser ? {
        userId: otherUser.userId,
        name: otherUser.name,
        email: otherUser.email,
        role: otherUser.role,
      } : null,
    };
  });

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({ conversations: enrichedConversations }),
  };
}

async function getConversation(conversationId, userId) {
  const result = await docClient.send(
    new GetCommand({
      TableName: MESSAGES_TABLE,
      Key: { conversationId },
    })
  );

  if (!result.Item) {
    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({ error: "Conversation not found" }),
    };
  }

  const conversation = result.Item;
  
  if (!conversation.participants?.includes(userId)) {
    return {
      statusCode: 403,
      headers,
      body: JSON.stringify({ error: "Not authorized" }),
    };
  }

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({ conversation }),
  };
}

async function sendMessage(body, userId, userEmail, userName) {
  const { recipientId, content, conversationId: existingConvId } = body;
  
  if (!content || !content.trim()) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: "Message content is required" }),
    };
  }

  const conversationId = existingConvId || `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const messageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const now = new Date().toISOString();

  const existing = existingConvId ? await docClient.send(
    new GetCommand({
      TableName: MESSAGES_TABLE,
      Key: { conversationId: existingConvId },
    })
  ) : null;

  const participants = existing?.Item?.participants || [userId, recipientId].filter(Boolean);
  const messages = existing?.Item?.messages || [];

  const newMessage = {
    messageId,
    senderId: userId,
    senderName: userName || userEmail?.split("@")[0] || "Unknown",
    content: content.trim(),
    timestamp: now,
    read: false,
  };

  const updatedConversation = {
    conversationId,
    participants,
    participantId: userId,
    messages: [...messages, newMessage],
    lastMessage: content.trim(),
    lastMessageTime: now,
    unreadCount: (existing?.Item?.unreadCount || 0) + 1,
    createdAt: existing?.Item?.createdAt || now,
    updatedAt: now,
  };

  await docClient.send(
    new PutCommand({
      TableName: MESSAGES_TABLE,
      Item: updatedConversation,
    })
  );

  for (const participantId of participants) {
    if (participantId !== userId) {
      await docClient.send(
        new PutCommand({
          TableName: MESSAGES_TABLE,
          Item: {
            ...updatedConversation,
            participantId,
          },
        })
      );
    }
  }

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({ conversation: updatedConversation, message: newMessage }),
  };
}

async function markAsRead(conversationId, userId) {
  const result = await docClient.send(
    new GetCommand({
      TableName: MESSAGES_TABLE,
      Key: { conversationId },
    })
  );

  if (!result.Item) {
    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({ error: "Conversation not found" }),
    };
  }

  const conversation = result.Item;
  
  if (!conversation.participants?.includes(userId)) {
    return {
      statusCode: 403,
      headers,
      body: JSON.stringify({ error: "Not authorized" }),
    };
  }

  const updatedMessages = (conversation.messages || []).map(msg => 
    msg.senderId !== userId ? { ...msg, read: true } : msg
  );

  const updatedConversation = {
    ...conversation,
    messages: updatedMessages,
    unreadCount: 0,
    updatedAt: new Date().toISOString(),
  };

  await docClient.send(
    new PutCommand({
      TableName: MESSAGES_TABLE,
      Item: updatedConversation,
    })
  );

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({ conversation: updatedConversation }),
  };
}

async function getUserById(targetUserId) {
  const result = await docClient.send(
    new GetCommand({
      TableName: USERS_TABLE,
      Key: { userId: targetUserId },
    })
  );

  if (!result.Item) {
    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({ error: "User not found" }),
    };
  }

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({ user: result.Item }),
  };
}
