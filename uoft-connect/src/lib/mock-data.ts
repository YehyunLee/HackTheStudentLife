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
  email?: string;
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

export interface ResearchGroup {
  id: string;
  name: string;
  department: string;
  description: string;
  longDescription?: string;
  tags: string[];
  contact: string;
  contactPerson?: UserProfile;
  image?: string;
  url?: string;
  researchAreas?: ResearchArea[];
  members?: UserProfile[];
}

export interface ResearchArea {
  id: string;
  title: string;
  description: string;
  papers?: Paper[];
}

export interface Paper {
  id: string;
  title: string;
  authors: string[];
  journal: string;
  year: number;
  doi?: string;
  url?: string;
}

export interface ResearchProgram {
  id: string;
  title: string;
  department: string;
  description: string;
  tags: string[];
  contact: string;
  image?: string;
}

export interface ProfessorOpportunity {
  id: string;
  projectTitle: string;
  professor: UserProfile;
  description: string;
  tags: string[];
  requirements: string[];
  eligibility?: string;
  deadline?: string;
  contact: string;
  image?: string;
}

export interface SummerResearchAward {
  id: string;
  title: string;
  organization: string;
  description: string;
  tags: string[];
  deadline: string;
  stipend: string;
  contact: string;
  image?: string;
}

export interface TAshipOffering {
  id: string;
  course: string;
  professor: string;
  department: string;
  description: string;
  tags: string[];
  hours: string;
  pay: string;
  contact: string;
  image?: string;
}

export interface OtherOpportunity {
  id: string;
  title: string;
  organization: string;
  description: string;
  tags: string[];
  type: string;
  contact: string;
  image?: string;
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

export const mockResearchGroups: ResearchGroup[] = [
  {
    id: "rg1",
    name: "Centre for Quantum Information and Quantum Control (CQIQC)",
    department: "Physics",
    description: "Promoting research collaborations in quantum information and quantum control. Activities encompass quantum computing, quantum optics, quantum cryptography, and quantum algorithms across multiple departments.",
    longDescription: "The Centre for Quantum Information and Quantum Control (CQIQC) is an interdisciplinary research centre at the University of Toronto that brings together researchers from physics, computer science, mathematics, chemistry, and engineering. Our mission is to advance the frontiers of quantum information science and technology through collaborative research, education, and outreach. We focus on fundamental questions in quantum mechanics and their applications to quantum computing, quantum communication, and quantum sensing.",
    tags: ["Quantum Computing", "Quantum Information", "Physics", "Algorithms"],
    contact: "quantum@utoronto.ca",
    contactPerson: mockUsers[4], // Dr. Emily Zhang
    image: "https://cqiqc.physics.utoronto.ca/media/images/CQIQC-Connections_for_websiteSmall_Font.max-1280x450.png",
    url: "https://cqiqc.physics.utoronto.ca/",
    researchAreas: [
      {
        id: "ra1",
        title: "Quantum Computing and Algorithms",
        description: "Development of quantum algorithms for optimization, machine learning, and computational chemistry problems.",
        papers: [
          {
            id: "p1",
            title: "Quantum algorithms for portfolio optimization",
            authors: ["E. Zhang", "A. Kumar", "R. Sanders"],
            journal: "Quantum Information Processing",
            year: 2024,
            doi: "10.1007/s11128-024-04567-8"
          },
          {
            id: "p2",
            title: "Variational quantum algorithms for molecular simulation",
            authors: ["E. Zhang", "M. Troyer", "S. Lloyd"],
            journal: "Physical Review A",
            year: 2023,
            doi: "10.1103/PhysRevA.108.032418"
          }
        ]
      },
      {
        id: "ra2",
        title: "Quantum Optics and Control",
        description: "Quantum control of light-matter interactions, quantum optics experiments, and quantum measurement theory.",
        papers: [
          {
            id: "p3",
            title: "Optimal quantum control of superconducting qubits",
            authors: ["H. Wiseman", "A. Doherty", "K. Jacobs"],
            journal: "Physical Review Letters",
            year: 2024,
            doi: "10.1103/PhysRevLett.132.170601"
          }
        ]
      },
      {
        id: "ra3",
        title: "Quantum Cryptography",
        description: "Quantum key distribution protocols, device-independent quantum cryptography, and post-quantum cryptography.",
        papers: [
          {
            id: "p4",
            title: "Device-independent quantum key distribution with imperfect devices",
            authors: ["N. Lutkenhaus", "R. Renner", "J. Yard"],
            journal: "Physical Review A",
            year: 2023,
            doi: "10.1103/PhysRevA.107.042606"
          }
        ]
      }
    ],
    members: [
      mockUsers[4], // Dr. Emily Zhang
      mockUsers[1], // Dr. James Park
    ]
  },
  {
    id: "rg2",
    name: "Biological Physics",
    department: "Physics",
    description: "Research at the interface of Physics, Chemistry and Biology, focusing on problems in biophysics, molecular dynamics, and biological systems.",
    longDescription: "The Biological Physics group at the University of Toronto explores the fundamental physical principles underlying biological processes. Our research spans from single molecule biophysics to complex biological systems, using advanced experimental and computational techniques to understand how physics governs life at all scales.",
    tags: ["Biophysics", "Physics", "Biology", "Molecular Dynamics"],
    contact: "biophysics@physics.utoronto.ca",
    contactPerson: mockUsers[1], // Dr. James Park
    image: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=250&fit=crop",
    url: "https://www.physics.utoronto.ca/research/biological-physics/",
    researchAreas: [
      {
        id: "ra4",
        title: "Single Molecule Biophysics",
        description: "Studying individual biomolecules and their interactions using optical tweezers, fluorescence microscopy, and single-molecule tracking.",
        papers: [
          {
            id: "p5",
            title: "Mechanical unfolding of protein domains",
            authors: ["L. Wang", "J. Liphardt", "C. Bustamante"],
            journal: "Biophysical Journal",
            year: 2024,
            doi: "10.1016/j.bpj.2024.03.012"
          }
        ]
      },
      {
        id: "ra5",
        title: "Molecular Dynamics Simulations",
        description: "Computational modeling of biological systems at atomic resolution to understand protein folding, enzyme catalysis, and membrane dynamics.",
        papers: [
          {
            id: "p6",
            title: "All-atom simulations of membrane protein folding",
            authors: ["L. Wang", "D. Thirumalai", "K. Schulten"],
            journal: "Proceedings of the National Academy of Sciences",
            year: 2023,
            doi: "10.1073/pnas.2304567120"
          }
        ]
      }
    ],
    members: [
      mockUsers[1], // Dr. James Park
      mockUsers[2], // Priya Sharma
    ]
  },
  {
    id: "rg3",
    name: "Earth, Atmospheric, and Planetary Physics (EAPP)",
    department: "Physics",
    description: "Research focused on global-scale physical processes in the Earth and planets including the interiors, oceans and atmospheres.",
    longDescription: "The Earth, Atmospheric, and Planetary Physics group investigates the physical processes that shape our planet and other worlds in our solar system. Our research encompasses atmospheric dynamics, climate modeling, planetary interiors, ocean circulation, and geophysical fluid dynamics.",
    tags: ["Earth Science", "Atmospheric Physics", "Planetary Science", "Climate"],
    contact: "eapp@physics.utoronto.ca",
    contactPerson: mockUsers[4], // Dr. Emily Zhang
    image: "https://www.physics.utoronto.ca/media/images/EAPP_homepage_image_9Ewe8Nd.width-800_lexv3jE.jpg",
    url: "https://www.physics.utoronto.ca/research/eapp/",
    researchAreas: [
      {
        id: "ra6",
        title: "Atmospheric Dynamics",
        description: "Understanding large-scale atmospheric circulation patterns, weather systems, and climate variability.",
        papers: [
          {
            id: "p7",
            title: "Tropical cyclone intensification in a warming climate",
            authors: ["J. Martinez", "K. Emanuel", "R. Rotunno"],
            journal: "Journal of Climate",
            year: 2024,
            doi: "10.1175/JCLI-D-23-0567.1"
          }
        ]
      },
      {
        id: "ra7",
        title: "Planetary Interiors",
        description: "Modeling the structure and dynamics of planetary cores, mantles, and magnetic fields.",
        papers: [
          {
            id: "p8",
            title: "Dynamo action in planetary cores",
            authors: ["J. Martinez", "C. Jones", "P. Olson"],
            journal: "Geophysical Journal International",
            year: 2023,
            doi: "10.1093/gji/ggad245"
          }
        ]
      }
    ],
    members: [
      mockUsers[3], // Marcus Johnson
      mockUsers[0], // Sarah Chen
    ]
  },
  {
    id: "rg4",
    name: "Quantum Condensed Matter Physics",
    department: "Physics",
    description: "Studies the properties of large collections of atoms that compose both ordinary and exotic materials, including superconductors and nanomaterials.",
    longDescription: "The Quantum Condensed Matter Physics group explores the collective behavior of quantum many-body systems. Our research focuses on emergent phenomena in strongly correlated electron systems, topological materials, superconductors, and quantum phase transitions.",
    tags: ["Condensed Matter", "Quantum Physics", "Materials Science", "Superconductivity"],
    contact: "qcmp@physics.utoronto.ca",
    contactPerson: mockUsers[7], // Dr. Robert Williams
    image: "https://www.physics.utoronto.ca/media/images/condensed_matter_lab.c6cd7673.original.fill-1200x450_TnGW2e4.jpg",
    url: "https://www.physics.utoronto.ca/research/quantum-condensed-matter-physics/",
    researchAreas: [
      {
        id: "ra8",
        title: "Topological Materials",
        description: "Discovery and characterization of topological insulators, Weyl semimetals, and quantum anomalous Hall systems.",
        papers: [
          {
            id: "p9",
            title: "Topological phase transitions in 2D materials",
            authors: ["K. Brown", "M. Franz", "L. Fu"],
            journal: "Nature Physics",
            year: 2024,
            doi: "10.1038/s41567-024-02456-7"
          }
        ]
      },
      {
        id: "ra9",
        title: "Superconductivity",
        description: "High-temperature superconductivity, unconventional pairing mechanisms, and superconducting devices.",
        papers: [
          {
            id: "p10",
            title: "Pairing symmetry in iron-based superconductors",
            authors: ["K. Brown", "P. Hirschfeld", "D. Scalapino"],
            journal: "Reviews of Modern Physics",
            year: 2023,
            doi: "10.1103/RevModPhys.95.025003"
          }
        ]
      }
    ],
    members: [
      mockUsers[7], // Dr. Robert Williams
      mockUsers[1], // Dr. James Park
    ]
  },
  {
    id: "rg5",
    name: "Quantum Optics",
    department: "Physics",
    description: "Research in atomic, molecular, and optical physics, quantum information, laser science, plasma physics, and many-body physics.",
    tags: ["Quantum Optics", "AMO Physics", "Laser Science", "Plasma Physics"],
    contact: "quantumoptics@physics.utoronto.ca",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=250&fit=crop",
    url: "https://www.physics.utoronto.ca/research/quantum-optics/",
  },
  {
    id: "rg6",
    name: "Advanced Thermofluids Optimization, Modelling and Simulation (ATOMS) Laboratory",
    department: "Mechanical & Industrial Engineering",
    description: "Research in nanoscale transport phenomena, electric vehicle batteries, bioengineering, energy systems, and thermal management systems.",
    tags: ["Thermofluids", "Energy Systems", "Batteries", "Bioengineering"],
    contact: "atoms@mie.utoronto.ca",
    image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400&h=250&fit=crop",
    url: "https://atoms.mie.utoronto.ca/",
  },
  {
    id: "rg7",
    name: "Acceleration Consortium",
    department: "Chemistry & Computer Science",
    description: "Building self-driving labs that use AI and automation to accelerate the discovery of materials and molecules for sustainable technologies.",
    tags: ["AI", "Materials Discovery", "Automation", "Sustainable Technology"],
    contact: "info@acceleration.utoronto.ca",
    image: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=400&h=250&fit=crop",
    url: "https://acceleration.utoronto.ca/",
  },
];

export const mockResearchPrograms: ResearchProgram[] = [
  {
    id: "rp1",
    title: "NSERC Undergraduate Research Program",
    department: "Various",
    description: "Summer research opportunities funded by NSERC.",
    tags: ["NSERC", "Summer Research", "Undergraduate"],
    contact: "nserc@utoronto.ca",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=250&fit=crop",
  },
  {
    id: "rp2",
    title: "AI Research Initiative",
    department: "Computer Science",
    description: "Interdisciplinary AI research across departments.",
    tags: ["AI", "Research", "Interdisciplinary"],
    contact: "ai@cs.utoronto.ca",
    image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400&h=250&fit=crop",
  },
];

export const mockProfessorOpportunities: ProfessorOpportunity[] = [
  {
    id: "po1",
    projectTitle: "NLP for Social Media Analysis",
    professor: mockUsers[1], // Dr. James Park
    description:
      "Developing NLP models to analyze social media trends and sentiment.",
    tags: ["Machine Learning", "Social Media"],
    requirements: ["Python", "NLP experience"],
    eligibility:
      "Undergraduates with NLP/ML interest; must commit ~10 hrs/week.",
    deadline: "April 30, 2026",
    contact: "james.park@utoronto.ca",
    image:
      "https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=400&h=250&fit=crop",
  },
  {
    id: "po2",
    projectTitle: "Quantum Algorithm Design",
    professor: mockUsers[4], // Dr. Emily Zhang
    description: "Designing quantum algorithms for optimization problems.",
    tags: ["Quantum Computing", "Algorithms"],
    requirements: ["Linear Algebra", "Programming"],
    eligibility:
      "Students with strong math backgrounds; prior quantum coursework a plus.",
    deadline: "May 15, 2026",
    contact: "emily.zhang@utoronto.ca",
    image:
      "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=400&h=250&fit=crop",
  },
];

export const mockSummerResearchAwards: SummerResearchAward[] = [
  {
    id: "sra1",
    title: "Ontario Graduate Scholarship",
    organization: "Ontario Government",
    description: "Merit-based scholarship for graduate research.",
    tags: ["Scholarship", "Graduate", "Ontario"],
    deadline: "March 15, 2026",
    stipend: "$15,000",
    contact: "ogs@ontario.ca",
    image: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=250&fit=crop",
  },
  {
    id: "sra2",
    title: "UofT Summer Research Award",
    organization: "University of Toronto",
    description: "Summer research funding for undergraduate students.",
    tags: ["Summer", "Research", "Undergraduate"],
    deadline: "April 1, 2026",
    stipend: "$6,000",
    contact: "summer.research@utoronto.ca",
    image: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=400&h=250&fit=crop",
  },
];

export const mockTAshipOfferings: TAshipOffering[] = [
  {
    id: "ta1",
    course: "CSC108: Introduction to Computer Programming",
    professor: "Dr. David Liu",
    department: "Computer Science",
    description: "Teaching assistant for introductory programming course.",
    tags: ["CSC108", "Programming", "Teaching"],
    hours: "10 hours/week",
    pay: "$25/hour",
    contact: "david.liu@cs.utoronto.ca",
    image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=250&fit=crop",
  },
  {
    id: "ta2",
    course: "PHY100: Physics for Everyone",
    professor: "Dr. Sarah Johnson",
    department: "Physics",
    description: "Lab assistant for general physics course.",
    tags: ["PHY100", "Physics", "Lab"],
    hours: "12 hours/week",
    pay: "$22/hour",
    contact: "sarah.johnson@physics.utoronto.ca",
    image: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=400&h=250&fit=crop",
  },
];

export const mockOtherOpportunities: OtherOpportunity[] = [
  {
    id: "oo1",
    title: "Hackathon Judge",
    organization: "UofT Engineering",
    description: "Judge projects at the annual engineering hackathon.",
    tags: ["Hackathon", "Judging", "Engineering"],
    type: "Volunteering",
    contact: "hackathon@eng.utoronto.ca",
    image: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=400&h=250&fit=crop",
  },
  {
    id: "oo2",
    title: "Peer Tutoring Program",
    organization: "UofT Academic Success",
    description: "Provide tutoring for first-year students.",
    tags: ["Tutoring", "Peer Support", "Academic"],
    type: "Part-time",
    contact: "tutoring@utoronto.ca",
    image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400&h=250&fit=crop",
  },
];
