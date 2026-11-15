# 🚀 CP Aggregator (Competitive Programming Aggregator)

[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?logo=typescript)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19.x-61dafb?logo=react)](https://react.dev/)
[![Express](https://img.shields.io/badge/Express-5.x-green?logo=express)](https://expressjs.com/)
[![Redis](https://img.shields.io/badge/Redis-7.x-red?logo=redis)](https://redis.io/)
[![MongoDB](https://img.shields.io/badge/MongoDB-7.x-darkgreen?logo=mongodb)](https://www.mongodb.com/)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ed?logo=docker)](https://www.docker.com/)

**CP Aggregator** is a modern, distributed full-stack platform built for competitive programming enthusiasts. It consolidates competitive programmer performance metrics across **Codeforces** and **LeetCode**, delivers an interactive rating progression history, manages a cross-platform problem bookmark repository, and features a real-time global leaderboard powered by Redis Sorted Sets.

---

## ⚡ Live Demo

- **Public URL:** [https://coaching-jersey-facial-hospitals.trycloudflare.com](https://coaching-jersey-facial-hospitals.trycloudflare.com)
- **Demo Credentials:**
  - **Email:** `demo@cpaggregator.com`
  - **Password:** `password123`
  - *Pre-linked Handles:* Codeforces (`tourist`), LeetCode (`neal_wu`)

---

## 🏗️ System Architecture

The application has been upgraded from a monolith into a resilient **API Gateway + 5 Microservices** architecture with Redis caching and Docker Compose orchestration:

```
                            [ User Browser / Client ]
                                        │
                                        │ HTTPS (Vite Reverse-Proxy)
                                        ▼
                           ┌─────────────────────────┐
                           │    API Gateway (5000)   │
                           │ Stateless JWT Auth Guard │
                           └────────────┬────────────┘
                                        │ x-user-id Header
       ┌──────────────────┬─────────────┼─────────────┬──────────────────┐
       ▼                  ▼             ▼             ▼                  ▼
┌──────────────┐   ┌────────────┐ ┌───────────┐ ┌────────────┐ ┌───────────────────┐
│ User Service │   │ Codeforces │ │ LeetCode  │ │  Bookmark  │ │Leaderboard Service│
│ (Port 5001)  │   │  Service   │ │  Service  │ │  Service   │ │    (Port 5005)    │
│              │   │ (Port 5002)│ │(Port 5003)│ │ (Port 5004)│ │                   │
└──────┬───────┘   └─────┬──────┘ └─────┬─────┘ └─────┬──────┘ └─────────┬─────────┘
       │                 │              │             │                  │
       ▼                 └───────┬──────┴─────────────┼──────────────────┘
 [MongoDB Atlas / Mongo:7]       ▼                    ▼
                           [Redis Cache (TTL 300s) & Leaderboard ZSETs]
```

### Trust & Isolation Model
- **Public Entry:** Only the **API Gateway (port 5000)** is mapped to the host or reachable from outside.
- **Stateless Authentication:** The Gateway verifies the JWT, sets `req.userId`, and passes a trusted `x-user-id` header to internal services.
- **Internal Network Isolation:** The 5 microservices, MongoDB, and Redis communicate exclusively over a private Docker bridge network (`cp-network`).

---

## 🧩 Microservice Ecosystem

| Service | Port | Database / Cache | Responsibility |
|---|---|---|---|
| **API Gateway** | `5000` | Stateless (No DB) | Public API, JWT auth validation, route proxies, and parallel dashboard aggregator (`Promise.allSettled`). |
| **`user-service`** | `5001` | MongoDB (`User` collection) | Registration, login, profile updates, and internal profile lookups (`GET /internal/users/:id`). |
| **`codeforces-service`** | `5002` | Redis (`cf:stats:{handle}`, 300s TTL) | Fetches Codeforces user info & rating history. Dispatches score updates to Leaderboard Service on cache miss. |
| **`leetcode-service`** | `5003` | Redis (`lc:stats:{handle}`, 300s TTL) | Queries LeetCode GraphQL API for problem counts & contest ratings. Dispatches score updates on cache miss. |
| **`bookmark-service`** | `5004` | MongoDB (`Bookmark` collection) | Full CRUD problem bookmarking scoped strictly by `x-user-id` header. Supports Codeforces, LeetCode, and Other. |
| **`leaderboard-service`** | `5005` | Redis Sorted Sets (`leaderboard:*`) | Sole manager of `leaderboard:codeforces` (rating) and `leaderboard:leetcode` (solved count). Exposes top-N rankings. |

---

## ✨ Key Features

- **Unified Performance Tracking:** Codeforces rating, max rating, global rank, contest history line charts (last 15 contests), plus LeetCode total solved and difficulty breakdowns (Easy, Medium, Hard).
- **Redis High-Speed Caching:** Third-party platform lookups are cached with a **300-second (5-minute) TTL**, dramatically reducing API latency and preventing external rate limits.
- **Global Leaderboard:** Backed by Redis Sorted Sets (`ZADD`, `ZREVRANGE WITHSCORES`), featuring ranked podium medals (`🥇`, `🥈`, `🥉`) and platform filtering.
- **Parallel Fetching Engine:** Dashboard and problem bookmarks load concurrently via `Promise.all`, providing instant responsiveness.
- **Cross-Platform Problem Repository:** Bookmark questions from LeetCode, Codeforces, CSES, AtCoder, or any other platform with custom difficulty and status tags.
- **Resilient Fallback Storage:** Includes hybrid storage with an automatic in-memory fallback and pre-seeded demo accounts if cloud database connectivity is disrupted.

---

## 🛠️ Tech Stack

- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS, Recharts, React Router v7, Axios.
- **Backend Services:** Node.js, Express 5, TypeScript, Mongoose 9, ioredis 6, JSON Web Tokens (JWT), bcryptjs.
- **Infrastructure:** Docker, Docker Compose, Redis 7 (Alpine), MongoDB 7.

---

## 📂 Repository Layout

```text
CP_Aggregator/
├── gateway/                        # API Gateway (Port 5000)
│   ├── src/
│   │   ├── middleware/protect.ts   # Stateless JWT token verifier
│   │   ├── types/index.ts          # Gateway typings
│   │   └── index.ts                # Route proxies & dashboard orchestrator
│   ├── Dockerfile                  # Multi-stage container build
│   ├── tsconfig.json               # Standalone TypeScript config
│   └── package.json
│
├── services/
│   ├── user-service/               # Port 5001 (User Model & Auth)
│   ├── codeforces-service/         # Port 5002 (Codeforces API + Redis Cache)
│   ├── leetcode-service/           # Port 5003 (LeetCode GraphQL + Redis Cache)
│   ├── bookmark-service/           # Port 5004 (Bookmark CRUD, scoped by x-user-id)
│   └── leaderboard-service/        # Port 5005 (Redis Sorted Sets)
│
├── Client/                         # React 19 + TypeScript SPA
│   ├── src/
│   │   ├── components/             # StatCard, BookmarkForm, BookmarkList, LeaderboardWidget
│   │   ├── pages/                  # Dashboard, Leaderboard, Login, Register
│   │   ├── types/                  # Domain interfaces & API responses
│   │   ├── api.ts                  # Axios client with Bearer interceptor
│   │   └── App.tsx                 # Client routing
│   ├── vite.config.ts              # Vite proxy configuration
│   └── tsconfig.json
│
├── docker-compose.yml              # Multi-container orchestration (Mongo, Redis, 6 Services)
├── package.json                    # Root workspace runner (concurrently)
├── ARCHITECTURE.md                 # Detailed technical specifications
└── MIGRATION_LOG.md                # Complete phase-by-phase migration history
```

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) v20+ and `npm`
- [Redis](https://redis.io/) (for local caching & leaderboards)
- [MongoDB](https://www.mongodb.com/) (local instance or MongoDB Atlas)

---

### Option A: Local Development (Concurrently)

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Anant-Ranjan/CP_Aggregator.git
   cd CP_Aggregator
   ```

2. **Install root dependencies:**
   ```bash
   npm install
   ```

3. **Start all 6 backend services concurrently:**
   ```bash
   npm run dev
   ```
   *This starts the Gateway (`:5000`), User Service (`:5001`), Codeforces Service (`:5002`), LeetCode Service (`:5003`), Bookmark Service (`:5004`), and Leaderboard Service (`:5005`).*

4. **Start the Frontend client:**
   ```bash
   cd Client
   npm install
   npm run dev
   ```
   Open **`http://localhost:5173`** in your browser.

---

### Option B: Docker Compose (Full Stack Containerization)

Launch the entire stack (Mongo, Redis, and all 6 services) with a single command:

```bash
docker compose up --build
```

- **Gateway / API:** `http://localhost:5000`
- **Internal Services:** Fully protected inside the private Docker network `cp-network`.

To run in background mode:
```bash
docker compose up -d
```

To stop all containers:
```bash
docker compose down
```

---

## 🔐 Environment Variables

| Variable | Used By | Default / Description |
|---|---|---|
| `PORT` | Every service | `5000` through `5005` |
| `JWT_SECRET` | Gateway, `user-service` | Secret string for signing and verifying JWTs |
| `MONGO_URI` | `user-service`, `bookmark-service` | `mongodb://mongo:27017/cp_users` (or Atlas connection string) |
| `REDIS_HOST` | `cf-service`, `lc-service`, `leaderboard-service` | `127.0.0.1` (local) or `redis` (Docker) |
| `REDIS_PORT` | `cf-service`, `lc-service`, `leaderboard-service` | `6379` |
| `CLIENT_URL` | Gateway | `http://localhost:5173` (CORS origin) |
| `USER_SERVICE_URL` | Gateway | `http://user-service:5001` |
| `CF_SERVICE_URL` | Gateway | `http://codeforces-service:5002` |
| `LC_SERVICE_URL` | Gateway | `http://leetcode-service:5003` |
| `BOOKMARK_SERVICE_URL` | Gateway | `http://bookmark-service:5004` |
| `LEADERBOARD_SERVICE_URL` | Gateway | `http://leaderboard-service:5005` |

---

## 📡 API Reference

### Public Authentication (`Gateway` → `user-service`)
- `POST /api/users/register` — Create new account `{ username, email, password }`
- `POST /api/users/login` — Sign in and receive JWT `{ email, password }`

### User Profile (`Gateway` → `user-service`, Protected)
- `GET /api/users/profile` — Fetch current user profile
- `PUT /api/users/profile` — Update linked handles `{ codeforcesHandle, leetcodeHandle }`

### Dashboard Orchestration (`Gateway`, Protected)
- `GET /api/dashboard` — Aggregates user profile, Codeforces rating progression, LeetCode stats, and recent bookmarks concurrently.

### Problem Bookmarks (`Gateway` → `bookmark-service`, Protected)
- `GET /api/bookmarks` — List user bookmarks sorted by newest
- `POST /api/bookmarks` — Add problem bookmark `{ platform, problemName, problemLink, difficulty, status }`
- `DELETE /api/bookmarks/:id` — Delete a problem bookmark

### Global Leaderboard (`Gateway` → `leaderboard-service`, Protected)
- `GET /api/leaderboard?platform=codeforces|leetcode&limit=10` — Fetch top-ranked competitive programmers
- `GET /api/leaderboard/rank?platform=codeforces|leetcode` — Get current user's rank

---

## 📜 Documentation & Specifications

- Detailed architectural blueprint & diagrams: [ARCHITECTURE.md](./ARCHITECTURE.md)
- Complete phase-by-phase execution & verification logs: [MIGRATION_LOG.md](./MIGRATION_LOG.md)

---

## 📄 License
This project is licensed under the ISC License.
