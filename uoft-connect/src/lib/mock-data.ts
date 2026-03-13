export type UserRole = "student" | "alumni" | "professor" | "mentor";

export interface UserProfile {
  id: string;
  name: string;
  role: UserRole;
  avatar: string;
  department: string;
  year?: string;
  bio: string;
  interests: string[];
  lookingFor: string[];
  matchScore?: number;
}

export interface Post {
  id: string;
  author: UserProfile;
  content: string;
  tags: string[];
  visibility: "everyone" | "students" | "faculty" | "alumni";
  createdAt: string;
  likes: number;
  replies: number;
  type: "looking-for" | "offering" | "discussion";
}

export interface Message {
  id: string;
  from: UserProfile;
  preview: string;
  timestamp: string;
  unread: boolean;
}

export const mockUsers: UserProfile[] = [
  {
    id: "1",
    name: "Sarah Chen",
    role: "student",
    avatar: "",
    department: "Computer Science",
    year: "3rd Year",
    bio: "Passionate about ML and NLP. Looking for research opportunities and mentorship in AI.",
    interests: ["Machine Learning", "NLP", "Python", "AWS SageMaker"],
    lookingFor: ["Research Mentor", "Industry Connections", "Study Group"],
  },
  {
    id: "2",
    name: "Dr. James Park",
    role: "professor",
    avatar: "",
    department: "Electrical & Computer Engineering",
    bio: "Associate Professor specializing in distributed systems and cloud computing. Open to mentoring students interested in systems research.",
    interests: ["Distributed Systems", "Cloud Computing", "IoT", "AWS Lambda"],
    lookingFor: ["Research Assistants", "Thesis Students"],
  },
  {
    id: "3",
    name: "Priya Sharma",
    role: "alumni",
    avatar: "",
    department: "Computer Science (2022)",
    bio: "Software Engineer at AWS. Happy to chat about career paths in cloud engineering and give resume advice.",
    interests: ["Cloud Architecture", "DevOps", "Career Mentoring", "AWS"],
    lookingFor: ["Mentees", "Coffee Chats", "Speaking Opportunities"],
  },
  {
    id: "4",
    name: "Marcus Johnson",
    role: "student",
    avatar: "",
    department: "Data Science",
    year: "4th Year",
    bio: "Working on my capstone project using AWS services. Looking for teammates and mentors who know about data pipelines.",
    interests: ["Data Engineering", "AWS Glue", "Analytics", "Visualization"],
    lookingFor: ["Project Partners", "Industry Mentor", "Internship"],
  },
  {
    id: "5",
    name: "Dr. Emily Zhang",
    role: "professor",
    avatar: "",
    department: "Information Studies",
    bio: "Research focus on human-computer interaction and accessible design. Looking for student collaborators on UX research projects.",
    interests: ["HCI", "Accessibility", "UX Research", "Design Thinking"],
    lookingFor: ["Research Collaborators", "UX Study Participants"],
  },
  {
    id: "6",
    name: "Alex Rivera",
    role: "alumni",
    avatar: "",
    department: "Engineering Science (2020)",
    bio: "Product Manager at a fintech startup. Love helping students navigate the transition from university to industry.",
    interests: ["Product Management", "Fintech", "Startups", "Career Growth"],
    lookingFor: ["Mentees", "Speaking Engagements", "Networking"],
  },
  {
    id: "7",
    name: "Yuki Tanaka",
    role: "student",
    avatar: "",
    department: "Computer Engineering",
    year: "2nd Year",
    bio: "New to cloud computing and eager to learn! Looking for study buddies and anyone willing to help me get started with AWS.",
    interests: ["Cloud Computing", "Web Development", "React", "AWS Amplify"],
    lookingFor: ["Study Buddy", "Beginner Mentor", "Hackathon Team"],
  },
  {
    id: "8",
    name: "Dr. Robert Williams",
    role: "mentor",
    avatar: "",
    department: "Industry Partner — Softchoice",
    bio: "Cloud Solutions Architect at Softchoice. Passionate about helping the next generation of cloud engineers.",
    interests: ["AWS Architecture", "Cloud Migration", "Solution Design", "Mentoring"],
    lookingFor: ["Mentees", "Hackathon Judging", "Guest Lectures"],
  },
];

export const mockPosts: Post[] = [
  {
    id: "p1",
    author: mockUsers[0],
    content:
      "Hey everyone! I'm looking for a professor or grad student who works on NLP research. I want to explore transformer architectures for my summer project. Would love a casual chat over coffee! ☕",
    tags: ["NLP", "Research", "Coffee Chat"],
    visibility: "everyone",
    createdAt: "2 hours ago",
    likes: 12,
    replies: 3,
    type: "looking-for",
  },
  {
    id: "p2",
    author: mockUsers[2],
    content:
      "Just joined UofT Connect! I'm a UofT CS grad now working at AWS. Happy to review resumes, do mock interviews, or just chat about what it's like working in cloud engineering. DM me anytime 🚀",
    tags: ["Career Advice", "AWS", "Mentoring"],
    visibility: "students",
    createdAt: "5 hours ago",
    likes: 34,
    replies: 8,
    type: "offering",
  },
  {
    id: "p3",
    author: mockUsers[1],
    content:
      "I'm looking for 2 research assistants for a summer project on serverless computing patterns. Experience with AWS Lambda and DynamoDB is a plus but not required. Stipend available.",
    tags: ["Research Position", "Serverless", "Paid"],
    visibility: "students",
    createdAt: "1 day ago",
    likes: 45,
    replies: 12,
    type: "offering",
  },
  {
    id: "p4",
    author: mockUsers[3],
    content:
      "Working on a data pipeline project using AWS Glue and need help with the visualization layer. Anyone experienced with QuickSight want to team up? 📊",
    tags: ["Data Pipeline", "QuickSight", "Collaboration"],
    visibility: "everyone",
    createdAt: "3 hours ago",
    likes: 8,
    replies: 2,
    type: "looking-for",
  },
  {
    id: "p5",
    author: mockUsers[4],
    content:
      "Hosting a workshop next week on designing accessible cloud applications. Open to all students! We'll cover inclusive design principles + how to leverage AWS accessibility tools. Sign up link in replies.",
    tags: ["Workshop", "Accessibility", "Design"],
    visibility: "everyone",
    createdAt: "6 hours ago",
    likes: 28,
    replies: 15,
    type: "offering",
  },
  {
    id: "p6",
    author: mockUsers[6],
    content:
      "Total beginner here 🙋 Just started learning AWS and feeling a bit lost. Anyone want to form a study group? We could work through the Cloud Practitioner cert together!",
    tags: ["Study Group", "AWS Certification", "Beginner"],
    visibility: "students",
    createdAt: "30 minutes ago",
    likes: 19,
    replies: 7,
    type: "looking-for",
  },
];

export const mockMessages: Message[] = [
  {
    id: "m1",
    from: mockUsers[2],
    preview: "Hey! I'd love to chat about your interest in cloud engineering...",
    timestamp: "10 min ago",
    unread: true,
  },
  {
    id: "m2",
    from: mockUsers[1],
    preview: "Thanks for applying to the RA position. Let's schedule a quick...",
    timestamp: "1 hour ago",
    unread: true,
  },
  {
    id: "m3",
    from: mockUsers[6],
    preview: "Are you still looking for study group members? I'm in!",
    timestamp: "3 hours ago",
    unread: false,
  },
  {
    id: "m4",
    from: mockUsers[5],
    preview: "Great meeting you at the hackathon! Let me know if you want...",
    timestamp: "Yesterday",
    unread: false,
  },
];
