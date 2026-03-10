# TaskHub - Enterprise Project Management System

<div align="center">

![TaskHub Logo](https://img.shields.io/badge/TaskHub-Project_Management-blue?style=for-the-badge)

**A modern, full-stack project management platform for teams and organizations**

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-000000?style=flat&logo=next.js&logoColor=white)](https://nextjs.org/)
[![Express](https://img.shields.io/badge/Express-000000?style=flat&logo=express&logoColor=white)](https://expressjs.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=flat&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Redis](https://img.shields.io/badge/Redis-DC382D?style=flat&logo=redis&logoColor=white)](https://redis.io/)
[![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=flat&logo=prisma&logoColor=white)](https://www.prisma.io/)

[Features](#features) • [Tech Stack](#tech-stack) • [Installation](#installation) • [Documentation](#api-documentation) • [Architecture](#architecture-overview)

</div>

---

## 📋 Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Tech Stack](#tech-stack)
- [Architecture Overview](#architecture-overview)
- [Prerequisites](#prerequisites)
- [Installation & Setup](#installation--setup)
- [Environment Variables](#environment-variables)
- [Running the Application](#running-the-application)
- [Database Schema](#database-schema)
- [API Documentation](#api-documentation)
- [Project Structure](#project-structure)
- [Security Features](#security-features)
- [Performance Optimization](#performance-optimization)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

---

## 🎯 Overview

**TaskHub** is a comprehensive, enterprise-grade project management platform designed for teams to collaborate effectively on projects, tasks, and workflows. Built with modern technologies and best practices, it provides a robust solution for managing workspaces, projects, tasks, and team members with advanced features like real-time updates, subscription management, and granular access control.

### Why TaskHub?

- ✅ **Desktop-First Design**: Optimized for professional workflows on laptops and desktops
- ✅ **Type-Safe**: Full TypeScript implementation across frontend and backend
- ✅ **Scalable Architecture**: Redis caching, database indexing, and connection pooling
- ✅ **Enterprise-Ready**: RBAC, 2FA, rate limiting, and comprehensive security
- ✅ **Modern UI**: Built with Next.js 15, React 19, and Tailwind CSS
- ✅ **Production-Ready**: Docker support, graceful shutdowns, and error handling

---

## ✨ Key Features

### 🏢 Workspace Management
- Create and manage unlimited workspaces (based on subscription tier)
- Invite team members via email or shareable invite links
- Role-based access control (Owner, Member, Viewer)
- Workspace-level activity logging and audit trails

### 📊 Project Organization
- Create projects within workspaces
- Granular project-level access controls
- Project documentation with rich text editor (Lexical)
- Project-specific task management

### ✅ Task Management
- **Multiple Views**:
  - 📋 Kanban Board (drag-and-drop)
  - 📅 Calendar View
  - 📈 Timeline View
  - 📝 List View
- **Task Features**:
  - Priority levels (Low, Medium, High, Critical)
  - Status tracking (TODO, In Progress, Completed, In Review, Backlog)
  - Assignment to team members
  - Due dates and start dates
  - Rich text documentation per task
  - Comments and discussions
  - File attachments

### 👥 Team Collaboration
- Real-time comments on tasks
- Activity timeline for projects
- Member management and invitations
- Project-specific access controls

### 💳 Subscription Management
- **Multi-Tier Plans**:
  - Free: 1 workspace, 2 members, 5 projects, 20 tasks
  - Pro: 10 workspaces, unlimited members, unlimited projects
  - Enterprise: Custom limits
- Integrated Razorpay payment gateway
- Subscription lifecycle management
- Transaction history and receipts
- Auto-renewal and cancellation

### 🔐 Security & Authentication
- JWT-based authentication (access + refresh tokens)
- Two-Factor Authentication (2FA) via email OTP
- Email verification for new accounts
- Password reset with OTP
- Token blacklisting for logout
- Rate limiting on sensitive endpoints
- Helmet.js security headers
- CORS protection

### 📧 Email Notifications
- Email verification on registration
- 2FA OTP delivery
- Password reset emails
- Subscription confirmation emails
- Workspace invitation emails
- Brevo (Sendinblue) integration with fallback to Ethereal (dev)

### 🚀 Performance Features
- Redis caching for expensive queries (2-8ms response time)
- Database indexing on critical queries
- Cache invalidation on data mutations
- Graceful degradation (works without Redis)
- Connection pooling (Prisma)
- Optimized queries with proper indexes

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 15 (React framework with App Router)
- **React Version**: React 19
- **Language**: TypeScript
- **State Management**: Redux Toolkit + Redux Persist
- **Styling**: Tailwind CSS 4
- **Component Library**: Radix UI + shadcn/ui
- **Rich Text Editor**: Lexical
- **Drag & Drop**: @dnd-kit
- **Forms**: React Hook Form + Zod validation
- **Charts**: Recharts
- **HTTP Client**: Axios
- **Notifications**: Sonner (toast)
- **Animations**: Framer Motion

### Backend
- **Runtime**: Node.js 20+
- **Framework**: Express.js 5
- **Language**: TypeScript
- **Database**: PostgreSQL 15 (Neon DB - Serverless)
- **ORM**: Prisma
- **Cache**: Redis (Upstash/Self-hosted)
- **Authentication**: JWT (jsonwebtoken)
- **Validation**: Zod
- **Email**: Nodemailer + Brevo API
- **Payments**: Razorpay
- **Security**: Helmet, CORS, bcryptjs
- **Rate Limiting**: express-rate-limit

### DevOps & Tools
- **Containerization**: Docker (Multi-stage builds)
- **CI/CD**: GitHub Actions (Automated Docker builds)
- **Container Registry**: Docker Hub
- **Version Control**: Git
- **Package Manager**: npm
- **Development**: ts-node-dev (hot reload)
- **Database Migrations**: Prisma Migrate
- **Environment Management**: dotenv

---

## 🏗️ Architecture Overview

TaskHub follows a modern, layered architecture with clear separation of concerns:

```
┌─────────────────────────────────────────────────────────────┐
│                      Client (Browser)                        │
│                   Desktop/Laptop Only                        │
└────────────────────────────┬────────────────────────────────┘
                             │
                             │ HTTPS + JWT
                             │
┌────────────────────────────▼─────────────────────────────────┐
│                   Next.js Frontend (SSR)                      │
│  ┌────────────────────────────────────────────────────────┐  │
│  │              Redux Store (Global State)               │  │
│  │   Auth | Workspace | Project | Task | Subscription   │  │
│  └────────────────────────────────────────────────────────┘  │
└────────────────────────────┬─────────────────────────────────┘
                             │
                             │ REST API (axios)
                             │
┌────────────────────────────▼─────────────────────────────────┐
│              Express.js Backend (TypeScript)                  │
│  ┌────────────────────────────────────────────────────────┐  │
│  │  Middleware Chain:                                     │  │
│  │  Rate Limiter → Security → Auth → Validation          │  │
│  └────────────────────────────────────────────────────────┘  │
│  ┌────────────────────────────────────────────────────────┐  │
│  │  Controllers → Services → Prisma ORM                  │  │
│  └────────────────────────────────────────────────────────┘  │
└────────────┬───────────────────────┬───────────────────┬─────┘
             │                       │                   │
    ┌────────▼────────┐   ┌─────────▼─────────┐  ┌─────▼──────┐
    │  Redis Cache    │   │  PostgreSQL (Neon)│  │  External  │
    │  (Optional)     │   │   Prisma Schema   │  │  Services  │
    │  100K ops/sec   │   │   ACID + Indexed  │  │  Razorpay  │
    └─────────────────┘   └───────────────────┘  │  Brevo     │
                                                  └────────────┘
```

### Request Lifecycle
```
User Action → Redux Dispatch → API Call → Middleware Chain → 
Controller → Service Layer → Database/Cache → Response → 
Redux State Update → UI Re-render
```

### Key Architectural Decisions

1. **Type Safety**: TypeScript across the entire stack eliminates runtime type errors
2. **Caching Strategy**: Redis caching with graceful degradation if unavailable
3. **Database Optimization**: Strategic indexing on frequently queried fields
4. **Middleware Pipeline**: Security, authentication, and validation in layers
5. **RESTful API**: Standard HTTP methods and status codes
6. **Atomic Transactions**: Prisma transactions for data consistency
7. **Idempotency**: Payment processing with duplicate prevention

---

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js**: v20.0.0 or higher
- **npm**: v10.0.0 or higher
- **PostgreSQL**: v15+ (or Neon DB account)
- **Redis**: v7+ (optional, for caching)
- **Docker**: v24+ (optional, for containerization)
- **Git**: Latest version

---

## 💻 Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/taskhub.git
cd taskhub
```

### 2. Backend Setup

```bash
cd backend
npm install
```

### 3. Frontend Setup

```bash
cd ../frontend
npm install
```

### 4. Database Setup

```bash
cd ../backend

# Generate Prisma Client
npm run prisma:generate

# Run database migrations
npm run prisma:migrate

# (Optional) Seed database with sample data
npm run prisma:seed
```

---

## 🔐 Environment Variables

### Backend Configuration

1. Copy the example environment file:
   ```bash
   cd backend
   cp .env.example .env
   ```

2. Update the `.env` file with your actual values

3. See [`backend/.env.example`](backend/.env.example) for all available options and detailed comments

### Frontend Configuration

1. Copy the example environment file:
   ```bash
   cd frontend
   cp .env.example .env.local
   ```

2. Update the `.env.local` file

3. See [`frontend/.env.example`](frontend/.env.example) for all configuration options

### Quick Setup Helper

```bash
# Generate secure JWT secrets
openssl rand -base64 32

# Or using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

---

## 🚀 Running the Application

### Development Mode

#### Start Backend
```bash
cd backend
npm run dev
# Server runs on http://localhost:5000
```

#### Start Frontend
```bash
cd frontend
npm run dev
# App runs on http://localhost:3000
```

### Production Mode

#### Build Backend
```bash
cd backend
npm run build
npm start
```

#### Build Frontend
```bash
cd frontend
npm run build
npm start
```

### Using Docker

#### Backend
```bash
cd backend

# Build image
docker build -t taskhub-backend .

# Run container
docker run -p 5000:5000 --env-file .env taskhub-backend
```

#### Complete Stack with Docker Compose
```bash
# In root directory (create docker-compose.yml)
docker-compose up -d
```

---

### Key Relationships

- **User ↔ Workspace**: Many-to-Many (via WorkspaceMembers)
- **User ↔ Project**: Many-to-Many (via ProjectAccess)
- **Workspace → Projects**: One-to-Many
- **Project → Tasks**: One-to-Many
- **Task → Comments**: One-to-Many
- **User → Subscription**: One-to-One

---

## 📚 API Documentation

### Base URL
```
Development: http://localhost:5000/api/v1
Production: https://api.taskhub.com/api/v1
```

### Authentication

All authenticated endpoints require a Bearer token:
```
Authorization: Bearer <jwt_access_token>
```

---

## 📁 Project Structure

```
taskhub/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma              # Database schema
│   │   └── migrations/                # Migration history
│   ├── src/
│   │   ├── app.ts                     # Express app entry
│   │   ├── index.ts                   # Server setup
│   │   ├── config/
│   │   │   ├── prisma.ts              # Prisma client
│   │   │   ├── redis.ts               # Redis client
│   │   │   ├── cache.service.ts       # Caching utilities
│   │   │   ├── schema.ts              # Zod validation schemas
│   │   │   └── validate.ts            # Validation middleware
│   │   ├── controllers/
│   │   │   ├── user.controller.ts
│   │   │   ├── workspace.controller.ts
│   │   │   ├── project.controller.ts
│   │   │   ├── task.controller.ts
│   │   │   ├── comment.controller.ts
│   │   │   ├── documentation.controller.ts
│   │   │   ├── invite.controller.ts
│   │   │   ├── subscription.controller.ts
│   │   │   └── webhook.controller.ts
│   │   ├── middleware/
│   │   │   ├── auth.middleware.ts     # JWT verification
│   │   │   ├── roleCheck.middleware.ts # RBAC
│   │   │   ├── rateLimiter.ts         # Rate limiting
│   │   │   ├── security.ts            # Helmet, CORS
│   │   │   ├── subscriptionLimit.middleware.ts
│   │   │   └── errorHandler.ts        # Global error handler
│   │   ├── routes/
│   │   │   ├── user.routes.ts
│   │   │   ├── workspace.routes.ts
│   │   │   ├── project.routes.ts
│   │   │   ├── task.routes.ts
│   │   │   ├── comment.routes.ts
│   │   │   ├── documentation.routes.ts
│   │   │   ├── invite.routes.ts
│   │   │   ├── subscription.routes.ts
│   │   │   └── webhook.routes.ts
│   │   ├── services/
│   │   │   ├── email.service.ts       # Email abstraction
│   │   │   ├── email.brevo.ts         # Brevo integration
│   │   │   ├── razorpay.service.ts    # Payment processing
│   │   │   ├── verifyEmail.ts
│   │   │   ├── resetPass.ts
│   │   │   ├── TwoFA.ts
│   │   │   ├── inviteMember.ts
│   │   │   ├── subscriptionEmail.ts
│   │   │   └── activityLogger.ts
│   │   └── utils/
│   │       ├── apiError.ts            # Error class
│   │       ├── apiResponse.ts         # Response formatter
│   │       ├── asynchandler.ts        # Async wrapper
│   │       ├── auth.ts                # Password hashing
│   │       ├── tokens.ts              # JWT generation
│   │       ├── cacheKeys.ts           # Cache key patterns
│   │       └── cacheInvalidation.ts   # Cache cleanup
│   ├── .env.example
│   ├── Dockerfile
│   ├── EMAIL_SERVICE_FIX.md
│   ├── package.json
│   ├── test-query-plan.sql
│   └── tsconfig.json
│
├── frontend/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/
│   │   │   ├── register/
│   │   │   ├── verify-email/
│   │   │   └── forgot-password/
│   │   ├── (marketing)/
│   │   │   ├── page.tsx               # Landing page
│   │   │   ├── pricing/
│   │   │   └── contact/
│   │   ├── (workspace)/
│   │   │   └── workspace/             # Workspace routes
│   │   ├── (account)/
│   │   │   └── account/               # User settings
│   │   ├── workspace-invite/
│   │   │   └── [workspaceId]/         # Invite acceptance
│   │   ├── editor-00/                 # Editor playground
│   │   ├── layout.tsx                 # Root layout
│   │   ├── storeProvider.tsx          # Redux provider
│   │   └── globals.css
│   ├── components/
│   │   ├── workspace/                 # Workspace components
│   │   ├── profile/                   # User profile
│   │   ├── subscription/              # Payment UI
│   │   ├── account/                   # Account components
│   │   ├── editor/                    # Lexical rich text
│   │   ├── blocks/                    # Editor blocks
│   │   ├── ui/                        # shadcn/ui components
│   │   ├── Navbar.tsx
│   │   ├── AuthNavbar.tsx
│   │   ├── Footer.tsx
│   │   ├── AppInit.tsx                # Initialize app state
│   │   └── MobileWarningDialog.tsx
│   ├── redux/
│   │   ├── store.ts                   # Redux store config
│   │   ├── hooks.ts                   # Typed hooks
│   │   ├── actions/
│   │   │   └── appActions.ts          # Global actions
│   │   ├── slices/
│   │   │   ├── authSlice.ts
│   │   │   ├── workspaceSlice.ts
│   │   │   ├── projectSlice.ts
│   │   │   ├── taskSlice.ts
│   │   │   ├── commentSlice.ts
│   │   │   ├── documentationSlice.ts
│   │   │   ├── inviteMemberSlice.ts
│   │   │   └── subscriptionSlice.ts
│   │   └── api/                       # API integration
│   ├── lib/
│   │   ├── utils.ts                   # Helper functions
│   │   ├── constants.ts               # App constants
│   │   └── validation.ts              # Zod schemas
│   ├── hooks/
│   │   └── use-mobile.ts              # Responsive hooks
│   ├── types/
│   │   └── globals.d.ts               # TypeScript types
│   ├── .env.example
│   ├── package.json
│   ├── next.config.ts
│   └── tsconfig.json
│
├── ARCHITECTURE_DOCUMENTATION.md      # Detailed architecture docs
├── README.md                          # This file
├── data.txt                           # Project data
└── docker-compose.yml                 # (Optional) Multi-container setup
```

---

## 🔒 Security Features

### Authentication & Authorization
- **JWT Tokens**: Access tokens (15min) + Refresh tokens (7 days)
- **Token Blacklisting**: Logout invalidates tokens via Redis
- **Password Security**: bcrypt hashing with 10 salt rounds
- **Email Verification**: OTP-based verification on signup
- **2FA (Two-Factor Auth)**: Email-based OTP for additional security
- **Password Reset**: Secure OTP-based password recovery

### API Security
- **Helmet.js**: Security headers (CSP, HSTS, X-Frame-Options)
- **CORS**: Whitelist-based origin validation
- **Rate Limiting**: Tiered limits based on endpoint sensitivity
- **Input Validation**: Zod schema validation on all inputs
- **SQL Injection Prevention**: Prisma parameterized queries
- **XSS Protection**: Input sanitization and CSP headers

### Access Control
- **Role-Based Access Control (RBAC)**:
  - Workspace: Owner, Member, Viewer
  - Project: Granular access per project
- **Permission Middleware**: Validates user access before controller execution
- **Subscription Limits**: Enforces tier-based resource limits

### Payment Security
- **Razorpay Integration**: PCI-compliant payment processing
- **Signature Verification**: HMAC-SHA256 signature validation
- **Idempotency**: Duplicate payment prevention via unique payment IDs
- **Webhook Verification**: Validates incoming Razorpay webhooks

---

## ⚡ Performance Optimization

### Caching Strategy
- **Redis Caching**: Cache expensive queries (workspace overview, task lists)
- **Cache Keys**: Structured keys for easy invalidation (`project:{id}:tasks`, `user:{id}:workspaces`)
- **TTL**: 5-60 minutes based on data volatility
- **Cache Invalidation**: Automatic invalidation on mutations (create, update, delete)
- **Graceful Degradation**: App works without Redis (direct DB queries)

**Performance Impact**:
- Workspace overview: 320ms → 8ms (40x faster)
- Kanban board: 280ms → 45ms (6x faster)
- User profile: 150ms → 5ms (30x faster)

### Database Optimization
- **Strategic Indexing**: Indexes on frequently queried fields
- **Query Optimization**: Prisma select to fetch only needed fields
- **Connection Pooling**: Managed by Prisma
- **N+1 Prevention**: Use `include` and `select` wisely

### Frontend Optimization
- **Code Splitting**: Next.js automatic route-based splitting
- **Server-Side Rendering**: Fast initial page loads
- **Image Optimization**: Next.js Image component
- **Redux Persistence**: Selective state persistence (only critical data)
- **Lazy Loading**: Components loaded on-demand

---

### Environment Setup Checklist

- [ ] Database URL configured (Neon)
- [ ] Redis URL configured (Upstash or self-hosted)
- [ ] Brevo API key added
- [ ] Razorpay keys configured
- [ ] JWT secrets set (use strong random strings)
- [ ] Frontend URL configured in backend CORS
- [ ] Backend URL configured in frontend
- [ ] SMTP settings configured (if not using Brevo)

---

## 🚀 Deployment

### Docker Deployment

TaskHub backend is containerized and production-ready with multi-stage Docker builds.

#### Building Docker Image

```bash
cd backend
docker build -t taskhub-backend .
docker run -p 5000:5000 --env-file .env taskhub-backend
```

#### Push to Docker Hub

```bash
docker login
docker tag taskhub-backend yourusername/taskhub-backend
docker push yourusername/taskhub-backend
```

### CI/CD with GitHub Actions

TaskHub uses **GitHub Actions** for automated Docker image building and deployment.

#### What's Automated:
- ✅ Automatic Docker builds on push to `main`/`develop` branches
- ✅ Automatic push to Docker Hub
- ✅ Multi-tag support (branch name, commit SHA, `latest`)
- ✅ Semantic versioning support (v1.0.0, v1.0.1, v2.0.0)
- ✅ Docker layer caching for faster builds

#### Setup Steps:

1. **Create Docker Hub Account** (if not exists)
2. **Generate Docker Hub Access Token**
   - Go to Docker Hub → Account Settings → Security → New Access Token
   
3. **Add GitHub Secrets**
   - Navigate to: Repository → Settings → Secrets and variables → Actions
   - Add two secrets:
     - `DOCKER_USERNAME`: Your Docker Hub username
     - `DOCKER_TOKEN`: Docker Hub access token

4. **Update Workflow File**
   - Edit `.github/workflows/backend-docker.yml`
   - Update `DOCKER_IMAGE_NAME` with your Docker Hub username

5. **Push Changes**
   ```bash
   git add .github/workflows/backend-docker.yml
   git commit -m "Add CI/CD pipeline"
   git push origin main
   ```

#### Using Semantic Versioning:

```bash
# Create and push version tag
git tag v1.0.0 -m "Release version 1.0.0"
git push origin v1.0.0

# This creates Docker images with tags:
# - yourusername/taskhub-backend:1.0.0
# - yourusername/taskhub-backend:1.0
# - yourusername/taskhub-backend:1
```

### Deployment Platforms

#### Railway
1. Create new project on Railway
2. Deploy from Docker Hub
3. Set environment variables
4. Configure custom domain (optional)

#### Render
1. Create new Web Service
2. Select "Deploy from Docker Hub"
3. Image URL: `yourusername/taskhub-backend`
4. Add environment variables
5. Deploy

#### AWS/GCP/Azure
Use the Docker image with your preferred container orchestration (ECS, Cloud Run, AKS)

---

## 🤝 Contributing

Contributions are welcome! Please follow these guidelines:

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Commit your changes**
   ```bash
   git commit -m "Add amazing feature"
   ```
4. **Push to the branch**
   ```bash
   git push origin feature/amazing-feature
   ```
5. **Open a Pull Request**

### Development Guidelines

- Follow TypeScript best practices
- Write meaningful commit messages
- Add comments for complex logic
- Ensure all tests pass (when available)
- Update documentation for new features
- Follow the existing code style

---

## 📄 License

This project is licensed under the **ISC License**.

---

## 👨‍💻 Author

**Shivam Darekar**

- GitHub: [@shivamdarekar](https://github.com/shivamdarekar)

---

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - React framework
- [Express.js](https://expressjs.com/) - Backend framework
- [Prisma](https://www.prisma.io/) - Database ORM
- [Neon](https://neon.tech/) - Serverless PostgreSQL
- [Radix UI](https://www.radix-ui.com/) - Headless UI components
- [shadcn/ui](https://ui.shadcn.com/) - UI component library
- [Razorpay](https://razorpay.com/) - Payment gateway
- [Brevo](https://www.brevo.com/) - Email service

---

## 📞 Support

If you encounter any issues or have questions:

1. Check the [ARCHITECTURE_DOCUMENTATION.md](ARCHITECTURE_DOCUMENTATION.md) for detailed technical docs
2. Open an issue on GitHub

---

<div align="center">

**Built with ❤️ using TypeScript, Next.js, and Express.js**

⭐ Star this repo if you find it helpful!

</div>
