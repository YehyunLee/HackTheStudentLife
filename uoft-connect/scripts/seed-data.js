const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, PutCommand, ScanCommand, DeleteCommand } = require("@aws-sdk/lib-dynamodb");

const client = new DynamoDBClient({ region: "us-west-2" });
const docClient = DynamoDBDocumentClient.from(client);

const POSTS_TABLE = "uoft-connect-posts";
const USERS_TABLE = "uoft-connect-users";
const MESSAGES_TABLE = "uoft-connect-messages";

// Mock users data
const mockUsers = [
  {
    userId: "prof-smith",
    email: "john.smith@utoronto.ca",
    name: "Dr. John Smith",
    role: "professor",
    department: "Computer Science",
    bio: "Associate Professor specializing in Machine Learning and AI. Looking for motivated students for research opportunities.",
    interests: ["machine-learning", "artificial-intelligence", "deep-learning"],
    lookingFor: ["research-assistants", "graduate-students"],
    location: "Toronto, ON",
    linkedin: "https://linkedin.com/in/johnsmith",
    createdAt: new Date().toISOString().replace("T", " ").replace("Z", ""),
    updatedAt: new Date().toISOString().replace("T", " ").replace("Z", ""),
  },
  {
    userId: "prof-chen",
    email: "lisa.chen@cs.toronto.edu",
    name: "Dr. Lisa Chen",
    role: "professor",
    department: "Computer Science",
    bio: "Professor in Human-Computer Interaction. Seeking students interested in UX research and accessibility.",
    interests: ["hci", "ux-research", "accessibility", "design"],
    lookingFor: ["research-collaborators", "undergraduate-researchers"],
    location: "Toronto, ON",
    github: "https://github.com/lisachen",
    createdAt: new Date().toISOString().replace("T", " ").replace("Z", ""),
    updatedAt: new Date().toISOString().replace("T", " ").replace("Z", ""),
  },
  {
    userId: "student-thomas",
    email: "thomas.lee@mail.utoronto.ca",
    name: "Thomas Lee",
    role: "student",
    department: "Computer Science",
    year: "3rd Year",
    bio: "CS student passionate about web development and AI. Looking for research opportunities and internships.",
    interests: ["web-development", "react", "machine-learning", "python"],
    lookingFor: ["research-opportunities", "internships", "study-groups"],
    location: "Toronto, ON",
    github: "https://github.com/thomaslee",
    createdAt: new Date().toISOString().replace("T", " ").replace("Z", ""),
    updatedAt: new Date().toISOString().replace("T", " ").replace("Z", ""),
  },
  {
    userId: "student-sarah",
    email: "sarah.kim@mail.utoronto.ca",
    name: "Sarah Kim",
    role: "student",
    department: "Computer Science",
    year: "4th Year",
    bio: "Final year CS student interested in data science and cloud computing. Open to collaboration!",
    interests: ["data-science", "cloud-computing", "aws", "python"],
    lookingFor: ["project-partners", "job-opportunities", "mentorship"],
    location: "Toronto, ON",
    linkedin: "https://linkedin.com/in/sarahkim",
    createdAt: new Date().toISOString().replace("T", " ").replace("Z", ""),
    updatedAt: new Date().toISOString().replace("T", " ").replace("Z", ""),
  },
  {
    userId: "student-alex",
    email: "alex.wong@mail.utoronto.ca",
    name: "Alex Wong",
    role: "student",
    department: "Computer Science",
    year: "2nd Year",
    bio: "Sophomore exploring different areas of CS. Interested in mobile development and game design.",
    interests: ["mobile-development", "game-design", "unity", "swift"],
    lookingFor: ["study-partners", "hackathons", "side-projects"],
    location: "Toronto, ON",
    createdAt: new Date().toISOString().replace("T", " ").replace("Z", ""),
    updatedAt: new Date().toISOString().replace("T", " ").replace("Z", ""),
  },
];

// Mock posts data
const mockPosts = [
  {
    postId: "post-1",
    authorId: "prof-smith",
    author: {
      id: "prof-smith",
      name: "Dr. John Smith",
      email: "john.smith@utoronto.ca",
      role: "professor",
      department: "Computer Science",
    },
    content: "🔬 Research Opportunity: Looking for 2-3 undergraduate students to join my ML research lab this summer. Focus on computer vision and deep learning. Paid positions available. DM me if interested!",
    tags: ["machine-learning", "research", "computer-vision", "paid", "summer"],
    type: "offering",
    visibility: "everyone",
    likes: 15,
    likedBy: ["student-thomas", "student-sarah"],
    replies: 3,
    repliesList: [
      {
        replyId: "reply-1",
        authorId: "student-thomas",
        author: {
          id: "student-thomas",
          name: "Thomas Lee",
          email: "thomas.lee@mail.utoronto.ca",
          role: "student",
          department: "Computer Science",
        },
        content: "This sounds amazing! I have experience with PyTorch and would love to learn more. Sending you a message!",
        createdAt: new Date(Date.now() - 3600000).toISOString(),
      },
      {
        replyId: "reply-2",
        authorId: "student-sarah",
        author: {
          id: "student-sarah",
          name: "Sarah Kim",
          email: "sarah.kim@mail.utoronto.ca",
          role: "student",
          department: "Computer Science",
        },
        content: "What are the prerequisites for this position?",
        createdAt: new Date(Date.now() - 1800000).toISOString(),
      },
      {
        replyId: "reply-3",
        authorId: "prof-smith",
        author: {
          id: "prof-smith",
          name: "Dr. John Smith",
          email: "john.smith@utoronto.ca",
          role: "professor",
          department: "Computer Science",
        },
        content: "CSC311 or equivalent ML course, and some Python/PyTorch experience. Reach out via email!",
        createdAt: new Date(Date.now() - 900000).toISOString(),
      },
    ],
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 900000).toISOString(),
  },
  {
    postId: "post-2",
    authorId: "prof-chen",
    author: {
      id: "prof-chen",
      name: "Dr. Lisa Chen",
      email: "lisa.chen@cs.toronto.edu",
      role: "professor",
      department: "Computer Science",
    },
    content: "📱 UX Research Study: We're conducting a study on mobile app accessibility. Looking for participants to test our prototype. $50 compensation for 1-hour session. No prior experience needed!",
    tags: ["ux-research", "accessibility", "study", "paid", "mobile"],
    type: "offering",
    visibility: "everyone",
    likes: 8,
    likedBy: ["student-alex"],
    replies: 0,
    repliesList: [],
    createdAt: new Date(Date.now() - 43200000).toISOString(),
    updatedAt: new Date(Date.now() - 43200000).toISOString(),
  },
  {
    postId: "post-3",
    authorId: "student-thomas",
    author: {
      id: "student-thomas",
      name: "Thomas Lee",
      email: "thomas.lee@mail.utoronto.ca",
      role: "student",
      department: "Computer Science",
    },
    content: "Looking for a study group for CSC373 (Algorithm Design). Anyone interested in meeting weekly to go over problem sets?",
    tags: ["csc373", "algorithms", "study-group"],
    type: "looking-for",
    visibility: "students",
    likes: 5,
    likedBy: ["student-sarah", "student-alex"],
    replies: 2,
    repliesList: [
      {
        replyId: "reply-4",
        authorId: "student-alex",
        author: {
          id: "student-alex",
          name: "Alex Wong",
          email: "alex.wong@mail.utoronto.ca",
          role: "student",
          department: "Computer Science",
        },
        content: "I'm in! When are you thinking?",
        createdAt: new Date(Date.now() - 7200000).toISOString(),
      },
      {
        replyId: "reply-5",
        authorId: "student-sarah",
        author: {
          id: "student-sarah",
          name: "Sarah Kim",
          email: "sarah.kim@mail.utoronto.ca",
          role: "student",
          department: "Computer Science",
        },
        content: "Count me in too! Maybe Wednesdays after 4pm?",
        createdAt: new Date(Date.now() - 3600000).toISOString(),
      },
    ],
    createdAt: new Date(Date.now() - 21600000).toISOString(),
    updatedAt: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    postId: "post-4",
    authorId: "student-sarah",
    author: {
      id: "student-sarah",
      name: "Sarah Kim",
      email: "sarah.kim@mail.utoronto.ca",
      role: "student",
      department: "Computer Science",
    },
    content: "Working on a side project using React and AWS. Looking for teammates interested in building a student marketplace app. DM if interested!",
    tags: ["react", "aws", "side-project", "web-development"],
    type: "looking-for",
    visibility: "everyone",
    likes: 12,
    likedBy: ["student-thomas", "student-alex"],
    replies: 0,
    repliesList: [],
    createdAt: new Date(Date.now() - 7200000).toISOString(),
    updatedAt: new Date(Date.now() - 7200000).toISOString(),
  },
];

async function clearAllData() {
  console.log("🗑️  Clearing all existing data...\n");

  const tables = [
    { name: POSTS_TABLE, key: "postId" },
    { name: USERS_TABLE, key: "userId" },
    { name: MESSAGES_TABLE, key: "conversationId" },
  ];

  for (const table of tables) {
    try {
      const result = await docClient.send(
        new ScanCommand({ TableName: table.name })
      );

      if (result.Items && result.Items.length > 0) {
        console.log(`   Deleting ${result.Items.length} items from ${table.name}...`);
        for (const item of result.Items) {
          await docClient.send(
            new DeleteCommand({
              TableName: table.name,
              Key: { [table.key]: item[table.key], ...(item.participantId && { participantId: item.participantId }) },
            })
          );
        }
        console.log(`   ✓ Cleared ${table.name}`);
      } else {
        console.log(`   ✓ ${table.name} already empty`);
      }
    } catch (error) {
      console.error(`   ✗ Error clearing ${table.name}:`, error.message);
    }
  }
  console.log("");
}

async function seedUsers() {
  console.log("👥 Seeding users...\n");
  for (const user of mockUsers) {
    try {
      await docClient.send(
        new PutCommand({
          TableName: USERS_TABLE,
          Item: user,
        })
      );
      console.log(`   ✓ Created user: ${user.name} (${user.role})`);
    } catch (error) {
      console.error(`   ✗ Error creating user ${user.name}:`, error.message);
    }
  }
  console.log("");
}

async function seedPosts() {
  console.log("📝 Seeding posts...\n");
  for (const post of mockPosts) {
    try {
      await docClient.send(
        new PutCommand({
          TableName: POSTS_TABLE,
          Item: post,
        })
      );
      console.log(`   ✓ Created post by ${post.author.name}: ${post.content.substring(0, 50)}...`);
    } catch (error) {
      console.error(`   ✗ Error creating post:`, error.message);
    }
  }
  console.log("");
}

async function main() {
  console.log("\n🌱 UofT Connect - Database Seeding Script\n");
  console.log("==========================================\n");

  try {
    await clearAllData();
    await seedUsers();
    await seedPosts();

    console.log("==========================================");
    console.log("✅ Database seeding completed successfully!\n");
    console.log("Summary:");
    console.log(`   - ${mockUsers.length} users created`);
    console.log(`   - ${mockPosts.length} posts created`);
    console.log("\n");
  } catch (error) {
    console.error("\n❌ Seeding failed:", error);
    process.exit(1);
  }
}

main();
