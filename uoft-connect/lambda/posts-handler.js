const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const {
  DynamoDBDocumentClient,
  PutCommand,
  GetCommand,
  QueryCommand,
  ScanCommand,
  DeleteCommand,
} = require("@aws-sdk/lib-dynamodb");

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

const POSTS_TABLE = "uoft-connect-posts";
const USERS_TABLE = "uoft-connect-users";

const headers = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type,Authorization",
  "Access-Control-Allow-Methods": "GET,POST,DELETE,OPTIONS",
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

    if (path === "/users/me" && method === "GET") {
      return await getOrCreateUser(userId, userEmail, userName);
    }

    if (path === "/users/me" && method === "PUT") {
      const body = JSON.parse(event.body || "{}");
      return await updateUser(userId, body);
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

  // Sort by createdAt descending
  const posts = (result.Items || []).sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({ posts }),
  };
}

async function createPost(body, userId, userEmail, userName) {
  const postId = `post_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const now = new Date().toISOString();

  const post = {
    postId,
    authorId: userId,
    author: {
      id: userId,
      name: userName,
      email: userEmail,
      role: body.authorRole || "student",
      department: body.authorDepartment || "Unknown",
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
    bio: "",
    interests: [],
    lookingFor: [],
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

  const updatedUser = {
    ...result.Item,
    ...updates,
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
