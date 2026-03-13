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
| **Amazon Cognito** | User authentication with UofT email domain restriction (`@utoronto.ca`, `@mail.utoronto.ca`) | ✅ Configured (user pool + hosted domain) |
| **AWS Lambda** | PreSignUp trigger for email validation, API handlers | ✅ Configured (domain guard + CRUD API) |
| **Amazon API Gateway** | HTTP API for posts/users CRUD | ✅ Configured (proxying to Lambda) |
| **Amazon DynamoDB** | Store user profiles, posts, connections, messages | ✅ Configured (separate tables for posts & users) |
| **Amazon Personalize** | AI-powered matching and recommendation engine | 🔜 Planned |
| **Amazon SES** | Email notifications and weekly digests | 🔜 Planned |
| **AWS Amplify** | Frontend hosting with CI/CD | 🔜 Planned |
| **Amazon CloudFront** | CDN for fast global delivery | 🔜 Planned |
| **Amazon QuickSight** | Analytics dashboard for organizers | 🔜 Planned |

**Live data flow overview:**

- **Authentication** — Cognito restricts signups to UofT domains and issues ID tokens that the frontend includes in `Authorization: Bearer <token>` headers.
- **API layer** — API Gateway forwards `/posts` and `/users/*` traffic to a Lambda function (`lambda/posts-handler.js`) that performs all CRUD logic.
- **Persistence** — DynamoDB keeps two collections: posts (with a GSI for `authorId`) and user profiles (with a GSI for `email`). Both tables run in on-demand mode, so no capacity planning is needed during the hackathon.

### Live API surface

| Endpoint | Methods | Description | Implementation |
|----------|---------|-------------|----------------|
| `/posts` | `GET`, `POST` | List posts or create a new post. Requires Cognito auth for creation. | `lambda/posts-handler.js` ↔ `src/lib/api.ts#fetchPosts/createPost` |
| `/posts/{postId}` | `GET`, `DELETE` | Fetch or delete a single post. Delete is auth-protected. | `lambda/posts-handler.js` ↔ `src/lib/api.ts#deletePost` |
| `/users/me` | `GET`, `PUT` | Load or update the caller’s profile (name, role, department, year, bio, interests, links). | `lambda/posts-handler.js` ↔ `src/lib/api.ts#fetchCurrentUser/updateCurrentUser` |

### Profile editing flow

1. On `/profile`, `ProfilePage` calls `fetchCurrentUser()` once the user is authenticated. The response is mapped into a local `ProfileForm` state shape (see `src/app/profile/page.tsx`).
2. Users can edit their name, role, department, year, bio, interests, "looking for" tags, LinkedIn, and GitHub links. Client-side helpers add/remove tags and validate empty input.
3. Clicking **Save** issues `updateCurrentUser()` with only the editable fields. The Lambda sanitizes payloads so unexpected keys are ignored before writing to DynamoDB.
4. Status banners indicate success or failure; cancelling reverts to the last saved snapshot.

### Environment configuration

All deploy- or region-specific values belong in `.env.local` (never committed). Required keys:

```
NEXT_PUBLIC_AWS_REGION=<region>
NEXT_PUBLIC_COGNITO_USER_POOL_ID=<user_pool_id>
NEXT_PUBLIC_COGNITO_CLIENT_ID=<client_id>
NEXT_PUBLIC_COGNITO_DOMAIN=<hosted_domain>
NEXT_PUBLIC_API_URL=<https://your-api-gateway.execute-api.region.amazonaws.com>
```

These values feed Amplify Auth (`src/lib/amplify-config.ts`) and the REST client (`src/lib/api.ts`).

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
