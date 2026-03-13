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

const ALLOWED_POST_FIELDS = ["content", "tags", "type", "visibility"];

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
  "Access-Control-Allow-Headers": "Content-Type,Authorization",
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

exports.handler = async (event) => {
  console.log("Event:", JSON.stringify(event, null, 2));

  const method = event.httpMethod || event.requestContext?.http?.method;
  const path = event.path || event.rawPath;

  // Handle CORS preflight
  if (method === "OPTIONS") {
    return { statusCode: 200, headers, body: "" };
  }

  try {
    // Get user info from Cognito authorizer
    const claims = event.requestContext?.authorizer?.claims || 
                   event.requestContext?.authorizer?.jwt?.claims || {};
    const userId = claims.sub || claims["cognito:username"] || "anonymous";
    const userEmail = claims.email || "";
    const userName = claims.name || userEmail.split("@")[0];

    // Route handling
    if (path === "/posts" && method === "GET") {
      return await listPosts();
    }

    if (path === "/posts" && method === "POST") {
      const body = JSON.parse(event.body || "{}");
      return await createPost(body, userId, userEmail, userName);
    }

    if (path.startsWith("/posts/") && method === "GET") {
      const postId = path.split("/")[2];
      return await getPost(postId);
    }

    if (path.startsWith("/posts/") && method === "DELETE") {
      const postId = path.split("/")[2];
      return await deletePost(postId, userId);
    }

    if (path.startsWith("/posts/") && method === "PUT") {
      const postId = path.split("/")[2];
      const body = JSON.parse(event.body || "{}");
      return await updatePost(postId, userId, body);
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
  const now = new Date().toISOString();

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
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
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
    updatedAt: new Date().toISOString(),
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
