# Facial Analyzer - Technical Documentation

## Table of Contents
1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [Database Selection](#database-selection)
4. [Authentication System](#authentication-system)
5. [Deployment Guide](#deployment-guide)
6. [API Reference](#api-reference)
7. [Environment Variables](#environment-variables)

---

## Project Overview

Facial Analyzer is an AI-powered web application that analyzes facial features and provides personalized peptide recommendations for skincare. The application uses Azure Face API for facial analysis and Claude AI for generating recommendations.

### Tech Stack
| Layer | Technology |
|-------|------------|
| Frontend | React 18, Vite, TypeScript, Tailwind CSS |
| Backend | Node.js, Express, TypeScript |
| Database | MongoDB (recommended) |
| Authentication | JWT + bcrypt |
| Facial Analysis | Azure Face API |
| AI Recommendations | Anthropic Claude API |

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT (React)                          │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────────────┐   │
│  │  Auth   │  │ Upload  │  │ Results │  │  User Dashboard │   │
│  │  Pages  │  │  Page   │  │  Page   │  │                 │   │
│  └─────────┘  └─────────┘  └─────────┘  └─────────────────┘   │
└─────────────────────────┬───────────────────────────────────────┘
                          │ HTTPS
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                       SERVER (Express)                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │ Auth Routes  │  │ Analysis API │  │ User Management API  │  │
│  │ /api/auth/*  │  │ /api/analyze │  │ /api/users/*         │  │
│  └──────────────┘  └──────────────┘  └──────────────────────┘  │
│                          │                                      │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                    Middleware                             │  │
│  │  JWT Auth │ Rate Limit │ Validation │ Error Handler      │  │
│  └──────────────────────────────────────────────────────────┘  │
└───────┬─────────────────────┬─────────────────────┬─────────────┘
        │                     │                     │
        ▼                     ▼                     ▼
┌───────────────┐    ┌───────────────┐    ┌───────────────────┐
│   MongoDB     │    │  Azure Face   │    │   Claude API      │
│   Database    │    │     API       │    │                   │
└───────────────┘    └───────────────┘    └───────────────────┘
```

---

## Database Selection

### Recommended: MongoDB

**Why MongoDB?**

| Advantage | Description |
|-----------|-------------|
| **Flexible Schema** | Facial analysis results vary in structure; MongoDB handles this well |
| **JSON-Native** | Perfect match for Node.js/Express backend |
| **Scalability** | Horizontal scaling for growing user base |
| **Atlas Free Tier** | Free cloud hosting for development/small production |
| **Image Metadata** | Easy to store analysis results with nested objects |

### Database Schema Design

```javascript
// Users Collection
{
  _id: ObjectId,
  email: String,           // unique, indexed
  password: String,        // bcrypt hashed
  name: String,
  createdAt: Date,
  updatedAt: Date,
  profile: {
    age: Number,
    gender: String,
    skinType: String       // user-provided preference
  },
  settings: {
    notifications: Boolean,
    newsletter: Boolean
  }
}

// Analysis Results Collection
{
  _id: ObjectId,
  userId: ObjectId,        // reference to Users, indexed
  createdAt: Date,
  imageUrl: String,        // optional, if storing image references
  facialAnalysis: {
    estimatedAge: Number,
    gender: String,
    skinMetrics: {
      hydration: Number,
      elasticity: Number,
      sunDamage: Number,
      agingSigns: Number,
      texture: Number,
      pigmentation: Number
    },
    conditions: [String]
  },
  recommendations: [{
    name: String,
    description: String,
    benefits: [String],
    usage: String,
    targetConditions: [String],
    priority: String
  }],
  aiInsights: String
}

// Sessions Collection (optional, for refresh tokens)
{
  _id: ObjectId,
  userId: ObjectId,
  refreshToken: String,
  expiresAt: Date,
  createdAt: Date
}
```

### Alternative Database Options

| Database | Pros | Cons | Best For |
|----------|------|------|----------|
| **PostgreSQL** | ACID compliance, relational integrity | Requires schema migrations | Strict data requirements |
| **MySQL** | Widely supported, reliable | Less flexible for JSON data | Traditional applications |
| **Firebase Firestore** | Real-time sync, easy auth integration | Vendor lock-in, costs at scale | Rapid prototyping |
| **Supabase** | PostgreSQL + Auth + Storage | Newer platform | Full-stack simplicity |

---

## Authentication System

### Recommended Approach: JWT (JSON Web Tokens)

```
┌──────────┐         ┌──────────┐         ┌──────────┐
│  Client  │         │  Server  │         │ Database │
└────┬─────┘         └────┬─────┘         └────┬─────┘
     │                    │                    │
     │  POST /auth/register                    │
     │  {email, password, name}                │
     │───────────────────>│                    │
     │                    │  Hash password     │
     │                    │  Store user        │
     │                    │───────────────────>│
     │                    │<───────────────────│
     │  {user, token}     │                    │
     │<───────────────────│                    │
     │                    │                    │
     │  POST /auth/login                       │
     │  {email, password} │                    │
     │───────────────────>│                    │
     │                    │  Verify password   │
     │                    │───────────────────>│
     │                    │<───────────────────│
     │  {user, accessToken, refreshToken}      │
     │<───────────────────│                    │
     │                    │                    │
     │  GET /api/analyze  │                    │
     │  Authorization: Bearer <token>          │
     │───────────────────>│                    │
     │                    │  Verify JWT        │
     │                    │  Process request   │
     │  {analysis data}   │                    │
     │<───────────────────│                    │
```

### Required Packages

```bash
# Server dependencies for auth
npm install bcryptjs jsonwebtoken mongoose
npm install -D @types/bcryptjs @types/jsonwebtoken
```

### Token Strategy

| Token Type | Expiry | Storage | Purpose |
|------------|--------|---------|---------|
| **Access Token** | 15 minutes | Memory/State | API authentication |
| **Refresh Token** | 7 days | HttpOnly Cookie | Get new access tokens |

### Security Best Practices

1. **Password Hashing**: Use bcrypt with salt rounds (12+)
2. **HTTPS Only**: Always use HTTPS in production
3. **HttpOnly Cookies**: Store refresh tokens in HttpOnly cookies
4. **Rate Limiting**: Limit login attempts (5 per 15 minutes)
5. **Input Validation**: Validate all inputs with Zod
6. **CORS Configuration**: Restrict origins in production

---

## Deployment Guide

### Deployment Architecture

```
                    ┌─────────────────────────────────────┐
                    │           CLOUDFLARE CDN            │
                    │         (Optional: DDoS, SSL)       │
                    └──────────────────┬──────────────────┘
                                       │
           ┌───────────────────────────┼───────────────────────────┐
           │                           │                           │
           ▼                           ▼                           ▼
┌─────────────────────┐    ┌─────────────────────┐    ┌─────────────────────┐
│      VERCEL         │    │    RAILWAY/RENDER   │    │   MONGODB ATLAS     │
│                     │    │                     │    │                     │
│   React Frontend    │    │   Express Backend   │    │     Database        │
│   - Static files    │    │   - API server      │    │   - Free tier       │
│   - Edge network    │    │   - Auto-scaling    │    │   - 512MB storage   │
│   - Auto SSL        │    │   - Docker support  │    │   - Backups         │
│                     │    │                     │    │                     │
│   FREE TIER         │    │   FREE TIER         │    │   FREE TIER         │
│   - 100GB bandwidth │    │   - 500 hrs/month   │    │   - Shared cluster  │
└─────────────────────┘    └─────────────────────┘    └─────────────────────┘
```

---

### Option 1: Vercel (Frontend) + Railway (Backend) - RECOMMENDED

#### Frontend Deployment (Vercel)

**Step 1: Prepare for Vercel**

Create `client/vercel.json`:
```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/" }
  ]
}
```

**Step 2: Deploy**
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy frontend
cd client
vercel

# Follow prompts:
# - Link to existing project? No
# - Project name: facial-analyzer
# - Directory: ./
# - Override settings? No
```

**Step 3: Set Environment Variables**
```
VITE_API_URL=https://your-backend.railway.app/api
```

#### Backend Deployment (Railway)

**Step 1: Prepare for Railway**

Create `server/Dockerfile`:
```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3001

CMD ["node", "dist/index.js"]
```

Create `server/railway.json`:
```json
{
  "build": {
    "builder": "DOCKERFILE",
    "dockerfilePath": "Dockerfile"
  },
  "deploy": {
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

**Step 2: Deploy**
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
cd server
railway init
railway up
```

**Step 3: Set Environment Variables in Railway Dashboard**
```
NODE_ENV=production
PORT=3001
CLIENT_URL=https://your-app.vercel.app
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your-super-secret-key-min-32-chars
JWT_REFRESH_SECRET=another-super-secret-key
AZURE_FACE_ENDPOINT=https://...
AZURE_FACE_KEY=...
ANTHROPIC_API_KEY=...
```

---

### Option 2: Render (Full Stack)

#### Backend on Render

**Step 1: Create `server/render.yaml`**
```yaml
services:
  - type: web
    name: facial-analyzer-api
    env: node
    buildCommand: npm install && npm run build
    startCommand: node dist/index.js
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: 3001
```

**Step 2: Deploy**
1. Go to [render.com](https://render.com)
2. Connect GitHub repository
3. Select `server` directory
4. Add environment variables
5. Deploy

#### Frontend on Render

1. Create new "Static Site"
2. Build command: `cd client && npm install && npm run build`
3. Publish directory: `client/dist`
4. Add rewrite rule: `/* -> /index.html`

---

### Option 3: DigitalOcean App Platform

```yaml
# .do/app.yaml
name: facial-analyzer
services:
  - name: api
    source:
      repo: https://github.com/Blockeeer/facial-analyzer
      branch: main
      source_dir: server
    envs:
      - key: NODE_ENV
        value: production
    http_port: 3001
    instance_count: 1
    instance_size_slug: basic-xxs
    routes:
      - path: /api

  - name: web
    source:
      repo: https://github.com/Blockeeer/facial-analyzer
      branch: main
      source_dir: client
    build_command: npm run build
    output_dir: dist
    routes:
      - path: /

databases:
  - name: db
    engine: MONGODB
    production: false
```

---

### Database Deployment (MongoDB Atlas)

**Step 1: Create Free Cluster**
1. Go to [mongodb.com/atlas](https://www.mongodb.com/atlas)
2. Create free account
3. Create new cluster (M0 Free Tier)
4. Choose cloud provider & region (closest to your backend)

**Step 2: Configure Access**
```
Network Access:
- Add IP: 0.0.0.0/0 (allow all - for development)
- Or add specific IPs from Railway/Render

Database Access:
- Create user with readWrite permissions
- Save username and password
```

**Step 3: Get Connection String**
```
mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/facial-analyzer?retryWrites=true&w=majority
```

---

### Deployment Comparison

| Platform | Frontend | Backend | Database | Free Tier | Best For |
|----------|----------|---------|----------|-----------|----------|
| **Vercel + Railway** | ✅ Excellent | ✅ Good | ❌ External | Generous | Production |
| **Render** | ✅ Good | ✅ Good | ✅ Built-in | Good | All-in-one |
| **DigitalOcean** | ✅ Good | ✅ Good | ✅ Built-in | $200 credit | Scaling |
| **Netlify + Fly.io** | ✅ Excellent | ✅ Good | ❌ External | Generous | Jamstack |
| **AWS (ECS/Amplify)** | ✅ Good | ✅ Excellent | ✅ Built-in | 12 months | Enterprise |

---

## API Reference

### Authentication Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/register` | Create new account | No |
| POST | `/api/auth/login` | Login user | No |
| POST | `/api/auth/logout` | Logout user | Yes |
| POST | `/api/auth/refresh` | Refresh access token | No (uses cookie) |
| GET | `/api/auth/me` | Get current user | Yes |

### Analysis Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/analyze` | Analyze facial image | Yes |
| GET | `/api/results/:id` | Get specific result | Yes |
| GET | `/api/results` | Get user's history | Yes |
| DELETE | `/api/results/:id` | Delete a result | Yes |

### User Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/users/profile` | Get user profile | Yes |
| PUT | `/api/users/profile` | Update profile | Yes |
| PUT | `/api/users/password` | Change password | Yes |
| DELETE | `/api/users/account` | Delete account | Yes |

---

## Environment Variables

### Frontend (.env)
```bash
VITE_API_URL=http://localhost:3001/api    # Backend API URL
```

### Backend (.env)
```bash
# Server
NODE_ENV=development
PORT=3001
CLIENT_URL=http://localhost:5173

# Database
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/facial-analyzer

# Authentication
JWT_SECRET=your-jwt-secret-key-minimum-32-characters-long
JWT_REFRESH_SECRET=your-refresh-token-secret-key-32-chars
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Azure Face API
AZURE_FACE_ENDPOINT=https://your-region.api.cognitive.microsoft.com
AZURE_FACE_KEY=your-azure-face-api-key

# Anthropic Claude API
ANTHROPIC_API_KEY=your-anthropic-api-key

# Optional: Image Storage (if storing uploaded images)
CLOUDINARY_URL=cloudinary://api_key:api_secret@cloud_name
# OR
AWS_S3_BUCKET=your-bucket-name
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
```

---

## Development Timeline (5 Days)

| Day | Tasks |
|-----|-------|
| **Day 1** | Project setup, database connection, basic auth endpoints |
| **Day 2** | Complete auth (register/login/logout), protected routes |
| **Day 3** | Azure Face API integration, analysis endpoints |
| **Day 4** | Claude AI integration, results storage, user history |
| **Day 5** | Frontend auth pages, testing, deployment |

---

## Next Steps

1. **Install MongoDB dependencies**
   ```bash
   cd server
   npm install mongoose bcryptjs jsonwebtoken
   npm install -D @types/bcryptjs @types/jsonwebtoken
   ```

2. **Create MongoDB Atlas account** and get connection string

3. **Implement auth routes** following the patterns above

4. **Set up deployment** on chosen platforms

5. **Configure environment variables** for production

---

## Security Checklist

- [ ] Environment variables secured (not in git)
- [ ] HTTPS enabled in production
- [ ] CORS properly configured
- [ ] Rate limiting on auth endpoints
- [ ] Password hashing with bcrypt
- [ ] JWT tokens with short expiry
- [ ] Refresh tokens in HttpOnly cookies
- [ ] Input validation on all endpoints
- [ ] SQL/NoSQL injection prevention
- [ ] File upload validation (type, size)
