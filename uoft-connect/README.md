# UofT Connect

> **Hack the Student Life 2026** — AWS x Softchoice x IEEE UofT

Strengthening academic and career connections across the University of Toronto.

## Problem Statement

Students often struggle to identify and connect with professors, research groups, and alumni who align with their academic interests and career goals. Information about research expertise, industry experience, and professional networks is often fragmented across different platforms.

## Our Solution

**UofT Connect** is a web platform where students, alumni, and professors can:

- **Post** what they're looking for (mentors, research opportunities, study groups) or offering (mentorship, career advice, collaborations)
- **Discover** people matched to their interests via AI-powered recommendations
- **Connect** through casual messaging with privacy controls
- **Build** meaningful relationships across the UofT community

### Key Features

| Feature | Description |
|---------|-------------|
| **Intent-driven Posts** | Share what you're looking for or offering with customizable privacy (everyone, students only, faculty only) |
| **AI Matching** | Amazon Personalize surfaces relevant connections based on interests, goals, and activity |
| **Dual UX Modes** | Casual vibe for students/alumni, professional dashboard for faculty/mentors |
| **Privacy Controls** | Choose who can see your posts and who can message you |
| **Real-time Chat** | Lightweight messaging with conversation starters auto-generated from shared interests |

---

## AWS Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              UofT Connect                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   ┌──────────────┐     ┌──────────────┐     ┌──────────────┐                │
│   │   Frontend   │     │   Auth       │     │   Backend    │                │
│   │              │     │              │     │              │                │
│   │  Next.js     │────▶│  Cognito     │────▶│  API Gateway │                │
│   │  (Amplify)   │     │  User Pool   │     │  + Lambda    │                │
│   └──────────────┘     └──────────────┘     └──────────────┘                │
│          │                    │                    │                         │
│          │                    │                    ▼                         │
│          │                    │           ┌──────────────┐                   │
│          │                    │           │  DynamoDB    │                   │
│          │                    │           │  (Profiles,  │                   │
│          │                    │           │   Posts)     │                   │
│          │                    │           └──────────────┘                   │
│          │                    │                    │                         │
│          │                    │                    ▼                         │
│          │                    │           ┌──────────────┐                   │
│          │                    │           │  Personalize │                   │
│          │                    │           │  (Matching)  │                   │
│          │                    │           └──────────────┘                   │
│          │                    │                                              │
│          ▼                    ▼                                              │
│   ┌──────────────┐     ┌──────────────┐                                     │
│   │  CloudFront  │     │  SES/SNS     │                                     │
│   │  (CDN)       │     │  (Notifs)    │                                     │
│   └──────────────┘     └──────────────┘                                     │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### AWS Services Used

| Service | Purpose | Status |
|---------|---------|--------|
| **Amazon Cognito** | User authentication with UofT email domain restriction (`@utoronto.ca`, `@mail.utoronto.ca`) | ✅ Configured (User Pool, App Client, Hosted Domain, PreSignUp Lambda) |
| **AWS Lambda** | PreSignUp trigger for email validation, API handlers | ✅ Configured (PreSignUp + CRUD API) |
| **Amazon API Gateway** | HTTP API for posts/users CRUD | ✅ Configured |
| **Amazon DynamoDB** | Store user profiles, posts, connections, messages | ✅ Configured (`uoft-connect-posts`, `uoft-connect-users`) |
| **Amazon Personalize** | AI-powered matching and recommendation engine | 🔜 Planned |
| **Amazon SES** | Email notifications and weekly digests | 🔜 Planned |
| **AWS Amplify** | Frontend hosting with CI/CD | 🔜 Planned |
| **Amazon CloudFront** | CDN for fast global delivery | 🔜 Planned |
| **Amazon QuickSight** | Analytics dashboard for organizers | 🔜 Planned |

**Current AWS configuration details:**

- **Amazon Cognito** is powering the live auth flow right now. We provisioned a user pool (`us-west-2_I6KatsaHX`), web client (`3if01l2n8nhhj2tl01ogsa7nlk`), hosted domain (`uoft-connect-htsl2026`), and wired in the app’s Next.js login page to require @utoronto.ca / @mail.utoronto.ca addresses. The UI uses Amplify Auth SDK to sign up, confirm, and sign in.
- **AWS Lambda** hosts the `uoft-connect-presignup` function called by Cognito’s PreSignUp trigger. It inspects the email domain, auto-confirms UofT addresses, and rejects everything else so only campus members can get accounts.
- **Amazon DynamoDB** stores posts (`uoft-connect-posts` table with `byAuthor` GSI) and user profiles (`uoft-connect-users` table with `byEmail` GSI). Both use on-demand billing.
- **Amazon API Gateway** exposes an HTTP API (`https://qxlh02ni6a.execute-api.us-west-2.amazonaws.com`) with Lambda proxy integration for CRUD operations on posts and users.

---

## Getting Started

### Prerequisites

- Node.js 18+
- AWS CLI configured with credentials
- npm or yarn

### Local Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

### Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── page.tsx           # Landing page
│   ├── feed/              # Post feed (casual)
│   ├── discover/          # Find connections
│   ├── messages/          # Chat interface
│   ├── dashboard/         # Faculty/mentor dashboard
│   └── profile/           # User profile & settings
├── components/            # Reusable UI components
│   ├── ui/               # shadcn/ui components
│   ├── navbar.tsx        # Navigation bar
│   ├── post-card.tsx     # Post display card
│   └── profile-card.tsx  # User profile card
└── lib/                  # Utilities and data
    └── mock-data.ts      # Sample data for demo
```

---

## AWS Setup

See [docs/AWS_SETUP.md](docs/AWS_SETUP.md) for step-by-step CLI commands to provision AWS resources.

### Quick Start

```bash
# 1. Create Cognito User Pool with email domain restriction
aws cognito-idp create-user-pool \
  --pool-name "uoft-connect-users" \
  --auto-verified-attributes email \
  --username-attributes email

# 2. Create Lambda trigger for email validation
# 3. Configure App Client
# 4. Set up API Gateway with Cognito authorizer
```

---

## Team

Built at **Hack the Student Life 2026** by:
- Thomas (Yehyun) Lee, Albert, and Jenny

---

## License

MIT
