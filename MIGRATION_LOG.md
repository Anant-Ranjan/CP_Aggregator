# CP Aggregator — Service-Oriented Upgrade: Migration Log

> **Started:** 2026-11-15 18:25 IST  
> **Last Updated:** 2026-11-16 02:08 IST  
> **Git Branch:** `main`  
> **Executor:** Antigravity AI (Gemini 3.8 Flash High / Claude Sonnet 4.6 Thinking swarm)

---

## ✅ Phase 1 — Bug Fixes (Completed 2026-11-15 ~18:45 IST)

**Commit:** `1dd6f06` *(bundled with Phases 2-4)*

**Files changed:**

| File | Change Made |
|------|-------------|
| `Server/models/bookmark.js` | Widened platform `enum` from `['Codeforces', 'LeetCode']` to `['Codeforces', 'LeetCode', 'Other']` |
| `Server/controllers/dashboardController.js` | Replaced fragile fixed-index `stats[0].count` / `stats[1].count` etc. with `stats.find(s => s.difficulty === level)?.count || 0` helper |
| `Server/middleware/authMiddleware.js` | Added `return` before `res.status(401).json(...)` in catch block to prevent double-response crash |
| `Server/index.js` | Changed `const PORT = 5000` → `const PORT = process.env.PORT || 5000` |
| `Server/index.js` | Changed `app.use(cors())` → `app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173' }))` |
| `Server/package.json` | Removed dead `"recharts": "^3.10.0"` from server dependencies |

**Verification:** All 6 fixes independently verified by `verify1` agent reading files and confirming each change.

---

## ✅ Phase 2 — TypeScript Migration (Server) (Completed 2026-11-15 ~18:50 IST)

**New files created under `Server/src/`:**

```
Server/
├── tsconfig.json              (target: ES2020, module: commonjs, strict: true)
└── src/
    ├── types/
    │   └── index.ts           (IUser extends Document; AuthRequest extends Request with user?: IUser)
    ├── config/
    │   └── db.ts              (Mongoose connect with IPv4 family:4)
    ├── models/
    │   ├── User.ts            (IUser schema with TypeScript generics)
    │   └── Bookmark.ts        (IBookmark schema, includes 'Other' in enum)
    ├── middleware/
    │   └── authMiddleware.ts  (JWT verify, attaches req.user, return guards on all 401s)
    ├── controllers/
    │   ├── userController.ts
    │   ├── codeforcesController.ts
    │   ├── leetcodeController.ts
    │   ├── bookmarkController.ts
    │   └── dashboardController.ts
    ├── routes/
    │   ├── userRoutes.ts
    │   ├── codeforcesRoutes.ts
    │   ├── leetcodeRoutes.ts
    │   ├── bookmarkRoutes.ts
    │   └── dashboardRoutes.ts
    └── index.ts               (entry point; uses import 'dotenv/config')
```

**Deviations from spec (intentional, correct):**
- Used `tsx` instead of `ts-node` — TypeScript 7.x ships a redesigned compiler API that `ts-node@10` cannot parse; `tsx` is compatible with all TS versions.
- Dev script: `nodemon --watch src -e ts --exec tsx src/index.ts`

**Package.json scripts:**
```json
"scripts": {
  "start": "node dist/index.js",
  "dev": "nodemon --watch src -e ts --exec tsx src/index.ts",
  "build": "tsc"
}
```

**Verification:** `npx tsc --noEmit` exited with code 0 (zero errors). Independently verified by `verify2` agent.

---

## ✅ Phase 3 — Redis Cache Layer (Completed 2026-11-15 ~18:57 IST)

**New files:**

| File | Purpose |
|------|---------|
| `Server/src/config/redisClient.ts` | ioredis instance; uses `REDIS_HOST` / `REDIS_PORT` env vars (defaults `127.0.0.1:6379`); bounded retry (5 attempts max); `lazyConnect: true` so server does not crash if Redis is offline at startup |
| `Server/src/utils/cache.ts` | Generic `getOrSetCache<T>(key, ttlSeconds, fetcher)` — tries Redis GET, on miss calls fetcher, saves result with EX TTL; graceful fallback to fetcher if Redis errors |

**Cache keys:**
- Codeforces stats: `cf:stats:{handle}` — TTL **300 seconds (5 minutes)**
- LeetCode stats: `lc:stats:{handle}` — TTL **300 seconds (5 minutes)**

**Updated controllers:**
- `codeforcesController.ts` — full CF stats (rating, rank, maxRating, ratingHistory last 15) wrapped in cache; exports `fetchCodeforcesStats` for dashboard reuse
- `leetcodeController.ts` — full LC stats (solved counts + contest history) wrapped in cache; exports `fetchLeetCodeStats`

**Dependency added:** `ioredis` (ships its own TypeScript types)

---

## ✅ Phase 4 — Redis Leaderboard (Sorted Sets) (Completed 2026-11-15 ~18:57 IST)

**New files:**

| File | Purpose |
|------|---------|
| `Server/src/utils/leaderboard.ts` | `updateLeaderboardScore(platform, member, score)` — ZADD absolute score; `getTopN(platform, n)` — ZREVRANGE WITHSCORES; `getUserRank(platform, member)` — ZREVRANK + ZSCORE 1-based |
| `Server/src/controllers/leaderboardController.ts` | `getLeaderboard`: reads `platform` query (default `codeforces`), `limit` (default 10, capped at 50); `getUserLeaderboardRank` returns current user's rank |
| `Server/src/routes/leaderboardRoutes.ts` | `GET /` and `GET /rank`, both behind `protect` middleware |

**Redis ZSET keys:**
- `leaderboard:codeforces` — member = username, score = current CF rating
- `leaderboard:leetcode` — member = username, score = total problems solved

**Key design decision:** `updateLeaderboardScore` called **only inside the cache-miss fetcher** — scores update when real data is freshly fetched (~every 5 min), not on every request.

**Route mounted:** `GET /api/leaderboard?platform=codeforces|leetcode&limit=10`

**Git commit:** `1dd6f06` — `feat: complete Phase 1-4` — 50 files changed, 3035 insertions.

---

## 🔄 Phase 5 — Microservice Split (In Progress as of 2026-11-16 02:08 IST)

**Target structure:**
```
CP_Aggregator/
├── gateway/           # Port 5000 — only public entrypoint, JWT verification
│   └── src/
├── services/
│   ├── user-service/        # Port 5001 — User model + Mongo + GET /internal/users/:id
│   ├── codeforces-service/  # Port 5002 — Redis-cached CF stats
│   ├── leetcode-service/    # Port 5003 — Redis-cached LC stats
│   ├── bookmark-service/    # Port 5004 — Bookmark model + Mongo, scoped by x-user-id
│   └── leaderboard-service/ # Port 5005 — Redis Sorted Sets
├── package.json       # Root concurrently dev runner
└── Client/            # Frontend (unchanged until Phase 6)
```

---

## 🔄 Phase 6 — Frontend TypeScript + Leaderboard UI (In Progress)

**Changes planned:**
- `.jsx` → `.tsx`, `.js` → `.ts` throughout `Client/src/`
- Replace sequential `await` calls in Dashboard with `Promise.all([...])` (parallel fetching)
- New TypeScript interfaces: `PlatformStats`, `DashboardResponse`, `LeaderboardEntry`
- Split `Dashboard.jsx` → `StatCard.tsx`, `BookmarkForm.tsx`, `BookmarkList.tsx`, `LeaderboardWidget.tsx`, `pages/Dashboard.tsx`
- New `pages/Leaderboard.tsx` at route `/leaderboard`
- Nav link in Dashboard header to Leaderboard page

---

## ⏳ Phase 7 — Docker Compose (Pending — plan review required before execution)

Multi-stage Dockerfiles per service + `docker-compose.yml` at repo root. Only gateway port 5000 exposed to host.

---

## Environment Variables Reference

| Variable | Used By | Default / Example |
|---|---|---|
| `PORT` | every service | 5000–5005 |
| `MONGO_URI` | user-service, bookmark-service | MongoDB Atlas connection string |
| `JWT_SECRET` | gateway, user-service | long random string |
| `REDIS_HOST` | cf-service, lc-service, leaderboard-service | `127.0.0.1` (dev) / `redis` (Docker) |
| `REDIS_PORT` | same | `6379` |
| `CLIENT_URL` | gateway (CORS) | `http://localhost:5173` |
| `USER_SERVICE_URL` | gateway | `http://localhost:5001` (dev) |
| `CF_SERVICE_URL` | gateway | `http://localhost:5002` (dev) |
| `LC_SERVICE_URL` | gateway | `http://localhost:5003` (dev) |
| `BOOKMARK_SERVICE_URL` | gateway | `http://localhost:5004` (dev) |
| `LEADERBOARD_SERVICE_URL` | gateway | `http://localhost:5005` (dev) |
