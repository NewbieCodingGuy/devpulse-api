# DevPulse API

A production-grade developer productivity tracking backend built with Node.js, Express, and TypeScript. DevPulse lets developers track coding sessions, receive AI-generated productivity summaries, and get real-time notifications — all backed by a scalable, security-aware architecture.

**Live API:** `http://shekhar-lb-1117458662.ap-south-2.elb.amazonaws.com`

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [API Reference](#api-reference)
- [WebSocket Events](#websocket-events)
- [Background Jobs](#background-jobs)
- [Caching Strategy](#caching-strategy)
- [Security](#security)
- [Docker](#docker)
- [Database Migrations](#database-migrations)

---

## Features

- **JWT Authentication** — Secure register, login, and protected routes
- **Session Tracking** — Create and manage coding sessions with start/end times and automatic duration calculation
- **AI Summaries** — OpenAI GPT-4o-mini generates productivity summaries when a session ends
- **Real-time Notifications** — Socket.IO pushes AI summary to the client the moment it's ready
- **Background Job Processing** — BullMQ queues handle async work without blocking HTTP responses
- **Redis Caching** — Cache-aside pattern with explicit invalidation on mutations
- **Pagination** — All list endpoints support page/limit query parameters
- **Rate Limiting** — Global and per-route limits protect against abuse and brute force
- **Input Validation** — Zod schemas validate all incoming request bodies
- **Production-ready** — Helmet headers, structured logging, multi-stage Docker build, AWS deployment

---

## Tech Stack

| Layer               | Technology                      |
| ------------------- | ------------------------------- |
| Runtime             | Node.js 20                      |
| Language            | TypeScript                      |
| Framework           | Express.js                      |
| Database            | MySQL 8 (TypeORM)               |
| Cache / Queue store | Redis 7                         |
| Job Queue           | BullMQ                          |
| Real-time           | Socket.IO                       |
| AI                  | OpenAI API (GPT-4o-mini)        |
| Payments            | Stripe (planned)                |
| Validation          | Zod                             |
| Auth                | JWT + bcryptjs                  |
| Containerization    | Docker + Docker Compose         |
| Deployment          | AWS (Application Load Balancer) |

---

## Architecture

```
Client
  │
  ├── HTTP Request
  │     └── Express
  │           ├── Helmet (security headers)
  │           ├── Morgan (request logging)
  │           ├── Rate Limiter
  │           ├── Zod Validation Middleware
  │           ├── JWT Auth Middleware
  │           ├── Controller
  │           │     └── Service (business logic)
  │           │           ├── Repository (TypeORM → MySQL)
  │           │           └── Cache (Redis)
  │           └── Global Error Handler
  │
  ├── WebSocket (Socket.IO)
  │     └── JWT Middleware on handshake
  │           └── Personal room per userId
  │
  └── Background Jobs (BullMQ → Redis)
        └── session.worker
              ├── OpenAI → generate summary
              ├── Repository → save summary to MySQL
              └── Socket.IO → push notification to user
```

**Request → Response flow:**

1. Request hits Express — Helmet sets security headers, Morgan logs it
2. Rate limiter checks request count per IP
3. Zod middleware validates request body shape
4. Auth middleware verifies JWT and attaches `req.user`
5. Controller extracts data, calls service
6. Service runs business logic, calls repository for DB operations, reads/writes Redis cache
7. Controller sends response
8. If a session ends — service pushes a job to BullMQ queue
9. Worker picks up the job, calls OpenAI, saves result to DB, emits socket event

---

## Project Structure

```
devpulse-api/
├── src/
│   ├── config/
│   │   ├── database.ts        # TypeORM DataSource configuration
│   │   ├── env.ts             # Environment variable validation (fail-fast)
│   │   ├── redis.ts           # ioredis client
│   │   └── socket.ts          # Socket.IO server + JWT middleware
│   ├── entities/
│   │   ├── User.ts            # User entity (UUID, enum plan, relations)
│   │   └── Session.ts         # Session entity (FK, cascade delete)
│   ├── middlewares/
│   │   ├── authenticate.ts    # JWT verification middleware
│   │   ├── errorHandler.ts    # Centralized error handling
│   │   ├── rateLimiter.ts     # Global + auth-specific rate limits
│   │   └── validate.ts        # Reusable Zod validation factory
│   ├── migrations/            # TypeORM migration files (version-controlled)
│   ├── modules/
│   │   ├── user/
│   │   │   ├── user.controller.ts
│   │   │   ├── user.repository.ts
│   │   │   ├── user.routes.ts
│   │   │   ├── user.schema.ts    # Zod schemas
│   │   │   └── user.service.ts
│   │   └── session/
│   │       ├── session.controller.ts
│   │       ├── session.repository.ts
│   │       ├── session.routes.ts
│   │       ├── session.schema.ts
│   │       └── session.service.ts  # Includes cache-aside logic
│   ├── queues/
│   │   └── session.queue.ts    # BullMQ Queue definition
│   ├── services/
│   │   └── openai.service.ts   # OpenAI GPT-4o-mini integration
│   ├── types/
│   │   ├── express.d.ts        # Extends Express Request with req.user
│   │   ├── session.types.ts
│   │   └── user.types.ts
│   ├── utils/
│   │   ├── AppError.ts         # Typed error class with statusCode
│   │   ├── cache.ts            # Redis cache wrapper (get/set/deletePattern)
│   │   └── jwt.ts              # JWT payload type definition
│   ├── workers/
│   │   └── session.worker.ts   # BullMQ Worker — processes session-ended jobs
│   ├── app.ts                  # Express app setup (no server.listen here)
│   └── server.ts               # HTTP server + Socket.IO startup sequence
├── docker-compose.yml
├── Dockerfile
├── tsconfig.json
└── package.json
```

---

## Getting Started

### Prerequisites

- Node.js 20+
- Docker and Docker Compose
- OpenAI API key

### Local Development

**1. Clone and install:**

```bash
git clone https://github.com/NewbieCodingGuy/devpulse-api.git
cd devpulse-api
npm install
```

**2. Create your `.env` file:**

```bash
cp .env.example .env
# Fill in your values — see Environment Variables section
```

**3. Start infrastructure (MySQL + Redis):**

```bash
docker compose up mysql redis -d
```

**4. Run migrations:**

```bash
npm run migration:run
```

**5. Start the dev server:**

```bash
npm run dev
```

Server starts on `http://localhost:3000`. Verify with:

```bash
curl http://localhost:3000/health
# {"status":"ok"}
```

### Running with Docker (full stack)

```bash
docker compose up -d
```

This starts MySQL, Redis, and the application container together.

---

## Environment Variables

Create a `.env` file in the project root. All variables marked **required** will cause the application to refuse to start if missing.

| Variable         | Required | Default       | Description                                          |
| ---------------- | -------- | ------------- | ---------------------------------------------------- |
| `PORT`           | No       | `3000`        | HTTP server port                                     |
| `NODE_ENV`       | No       | `development` | Environment (`development` / `production`)           |
| `JWT_SECRET`     | **Yes**  | —             | Secret key for signing JWTs                          |
| `DB_HOST`        | **Yes**  | —             | MySQL host                                           |
| `DB_PORT`        | No       | `3306`        | MySQL port                                           |
| `DB_USER`        | **Yes**  | —             | MySQL username                                       |
| `DB_PASSWORD`    | **Yes**  | —             | MySQL password                                       |
| `DB_NAME`        | **Yes**  | —             | MySQL database name                                  |
| `REDIS_URL`      | **Yes**  | —             | Redis connection URL (e.g. `redis://localhost:6379`) |
| `OPENAI_API_KEY` | **Yes**  | —             | OpenAI API key                                       |

**Example `.env`:**

```env
PORT=3000
NODE_ENV=development

JWT_SECRET=your-super-secret-jwt-key-change-this

DB_HOST=localhost
DB_PORT=3306
DB_USER=devpulse_user
DB_PASSWORD=devpulse_pass
DB_NAME=devpulse_db

REDIS_URL=redis://localhost:6379

OPENAI_API_KEY=sk-...
```

> ⚠️ Never commit `.env` to version control. It is listed in `.gitignore`.

---

## API Reference

All responses follow a consistent envelope:

```json
{
  "success": true,
  "data": { ... }
}
```

Errors:

```json
{
  "message": "Description of what went wrong"
}
```

### Authentication

#### `POST /api/auth/register`

Create a new account.

**Rate limit:** 5 requests per 15 minutes per IP

**Request body:**

```json
{
  "name": "Shekhar Ali",
  "email": "shekhar@example.com",
  "password": "securepass123"
}
```

**Validation:**

- `name` — min 1 character
- `email` — valid email format
- `password` — min 8 characters

**Response `201`:**

```json
{
  "success": true,
  "data": {
    "token": "eyJhbGci...",
    "user": {
      "id": "6749f59a-4d1b-41e1-b1ac-88f9cd249342",
      "email": "shekhar@example.com",
      "name": "Shekhar Ali",
      "plan": "free"
    }
  }
}
```

---

#### `POST /api/auth/login`

Authenticate and receive a JWT.

**Rate limit:** 5 requests per 15 minutes per IP

**Request body:**

```json
{
  "email": "shekhar@example.com",
  "password": "securepass123"
}
```

**Response `200`:**

```json
{
  "success": true,
  "data": {
    "token": "eyJhbGci..."
  }
}
```

> Both wrong email and wrong password return `"Invalid credentials"` — intentional to prevent user enumeration.

---

#### `GET /api/auth/me`

Get the currently authenticated user.

**Headers:** `Authorization: Bearer <token>`

**Response `200`:**

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "6749f59a-4d1b-41e1-b1ac-88f9cd249342",
      "email": "shekhar@example.com",
      "name": "Shekhar Ali",
      "plan": "free"
    }
  }
}
```

---

### Sessions

All session endpoints require `Authorization: Bearer <token>`.

#### `POST /api/sessions`

Start a new coding session. `startTime` is set server-side to the current timestamp.

**Request body:**

```json
{
  "title": "Building auth system",
  "language": "TypeScript",
  "notes": "Implemented JWT middleware and bcrypt hashing"
}
```

**Response `201`:**

```json
{
  "success": true,
  "data": {
    "userSession": {
      "id": "6576fd46-de28-444d-885e-248cf1ec7758",
      "userId": "6749f59a-...",
      "title": "Building auth system",
      "language": "TypeScript",
      "notes": "Implemented JWT middleware and bcrypt hashing",
      "startTime": "2026-05-18T12:04:55.055Z",
      "endTime": null,
      "durationMin": null
    }
  }
}
```

---

#### `GET /api/sessions`

Get paginated list of sessions for the authenticated user. Results ordered by most recent first.

**Query parameters:**

| Parameter | Default | Description                |
| --------- | ------- | -------------------------- |
| `page`    | `1`     | Page number                |
| `limit`   | `20`    | Results per page (max 100) |

**Response `200`:**

```json
{
  "success": true,
  "data": {
    "allSessions": [ ... ],
    "pagination": {
      "total": 42,
      "page": 1,
      "limit": 20,
      "totalPages": 3,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

> Results are cached in Redis for 5 minutes per user per page. Cache is invalidated on any create, update, or delete.

---

#### `GET /api/sessions/:id`

Get a single session by ID.

**Response `200`:**

```json
{
  "success": true,
  "data": {
    "sessionData": {
      "id": "6576fd46-...",
      "title": "Building auth system",
      "startTime": "2026-05-18T12:04:55.000Z",
      "endTime": "2026-05-18T12:34:55.000Z",
      "durationMin": 30,
      "language": "TypeScript",
      "notes": "...",
      "aiSummary": "## Session Summary\n\nKey work completed: ..."
    }
  }
}
```

---

#### `PATCH /api/sessions/:id`

Update a session. To end a session, provide `endTime` — `durationMin` is calculated automatically.

**Request body (all fields optional):**

```json
{
  "title": "Updated title",
  "language": "JavaScript",
  "notes": "Additional notes",
  "endTime": "2026-05-18T13:00:00.000Z"
}
```

> When `endTime` is provided, the BullMQ worker is triggered asynchronously to generate an AI summary via OpenAI. The summary is saved to the session and pushed to the client via Socket.IO.

**Response `200`:** Updated session data.

---

#### `DELETE /api/sessions/:id`

Delete a session.

**Response `200`:**

```json
{
  "success": true,
  "message": "Session Deleted Successfully"
}
```

---

### Error Responses

| Status | Meaning                                              |
| ------ | ---------------------------------------------------- |
| `400`  | Validation failed — check `errors` array in response |
| `401`  | Missing, invalid, or expired JWT token               |
| `403`  | Authenticated but not authorized for this resource   |
| `404`  | Resource not found                                   |
| `409`  | Conflict — e.g. email already registered             |
| `429`  | Rate limit exceeded                                  |
| `500`  | Internal server error                                |

---

## WebSocket Events

Connect with JWT authentication:

```javascript
import { io } from "socket.io-client";

const socket = io("http://localhost:3000", {
  auth: {
    token: `Bearer ${yourJwtToken}`,
  },
});
```

The server verifies the JWT on handshake. Invalid tokens are rejected before the connection is established. Authenticated users are automatically placed in a personal room keyed by their `userId`.

### Incoming Events (server → client)

#### `session:summary-ready`

Emitted when the AI summary for a session has been generated and saved.

```javascript
socket.on("session:summary-ready", (data) => {
  console.log(data.sessionId); // string
  console.log(data.aiSummary); // string — the generated summary
});
```

> If the client is offline when this event fires, the summary is still persisted to the database. Fetch `GET /api/sessions/:id` on reconnect to retrieve it.

---

## Background Jobs

DevPulse uses BullMQ backed by Redis for async job processing.

### `session-ended` job

**Triggered when:** A session's `endTime` is set via `PATCH /api/sessions/:id`

**What it does:**

1. Calls OpenAI GPT-4o-mini with session title, language, duration, and notes
2. Saves the generated summary to `sessions.aiSummary` in MySQL
3. Emits `session:summary-ready` via Socket.IO to the user's room

**Retry policy:** 5 attempts with exponential backoff starting at 2 seconds. Failed jobs after all attempts are moved to the BullMQ failed queue for inspection.

**Redis persistence:** Redis is configured with `--appendonly yes` so pending jobs survive a Redis restart.

---

## Caching Strategy

Redis cache-aside pattern is applied to session reads.

**Cache keys:**

```
sessions:{userId}:page:{page}:limit:{limit}   → paginated session list
sessions:{userId}:{sessionId}                  → individual session
```

**TTL:** 5 minutes on all cached values.

**Invalidation:** All `sessions:{userId}:*` keys are invalidated using Redis `SCAN` (not `KEYS`) on any create, update, or delete operation for that user.

**Graceful degradation:** If Redis is unavailable, all cache operations are caught silently and requests fall through to MySQL. The application never becomes unavailable due to a cache failure.

---

## Security

| Concern          | Implementation                                                            |
| ---------------- | ------------------------------------------------------------------------- |
| Password storage | bcrypt with cost factor 10                                                |
| Authentication   | JWT (HS256), 7-day expiry                                                 |
| Authorization    | Every session query scoped by `userId` (IDOR prevention)                  |
| User enumeration | Login returns identical message for wrong email and wrong password        |
| Brute force      | Auth endpoints limited to 5 requests per 15 minutes per IP                |
| HTTP headers     | Helmet sets `X-Content-Type-Options`, `X-Frame-Options`, HSTS, and others |
| Input validation | Zod validates all request bodies before reaching controllers              |
| CORS             | Configurable origin — restrict to your frontend domain in production      |
| Socket auth      | JWT verified on WebSocket handshake, not just on HTTP requests            |
| Database user    | Application connects as non-root MySQL user with minimal privileges       |

---

## Docker

### Development (infrastructure only)

Start MySQL and Redis, run the app locally with hot reload:

```bash
docker compose up mysql redis -d
npm run dev
```

### Full stack with Docker

```bash
docker compose up -d
```

### Multi-stage Dockerfile

The production image uses a two-stage build:

- **Stage 1 (builder):** Installs all dependencies, compiles TypeScript to `dist/`
- **Stage 2 (production):** Copies only compiled JS and production dependencies

Result: a ~150MB production image with no TypeScript source, no dev tools, and no unnecessary attack surface. The app runs as a non-root user inside the container.

---

## Database Migrations

Schema changes are managed through TypeORM migrations — never `synchronize: true`.

```bash
# Generate a migration from entity changes
npm run migration:generate -- src/migrations/MigrationName

# Apply pending migrations
npm run migration:run

# Revert the last migration
npm run migration:revert
```

> Always review generated migration files before running them. TypeORM may generate `DROP COLUMN` / `ADD COLUMN` pairs for type changes that would destroy data in production. Use `MODIFY COLUMN` for safe in-place type changes on tables with existing data.

---

## Scripts

```bash
npm run dev          # Start development server with hot reload (tsx watch)
npm run build        # Compile TypeScript to dist/
npm run start        # Run compiled production build

npm run migration:generate -- src/migrations/Name   # Generate migration
npm run migration:run                                # Apply migrations
npm run migration:revert                             # Revert last migration
```
