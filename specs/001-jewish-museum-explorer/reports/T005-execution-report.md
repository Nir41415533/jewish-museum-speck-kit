# T005 — Technical Execution Report
## Create .env.example Files

**Branch**: `task/T005-env-examples`
**Date**: 2026-05-11
**Status**: Complete

---

### 1. Task Understanding

T005 creates `backend/.env.example` and `frontend/.env.example` — committed, safe-to-share templates that document every required environment variable without containing real secrets. These files are the developer's setup checklist: `cp backend/.env.example backend/.env`, fill in real values, and the app is ready to run. Without them, new developers must guess which environment variables exist and what format they take — a common source of misconfigured local environments.

This satisfies spec.md FR-019: "All sensitive configuration data must be stored securely in environment variables."

---

### 2. Why These Variables

**`backend/.env.example`**

| Variable | Purpose | Required by |
|----------|---------|-------------|
| `PORT` | Express server listen port; React dev server proxies to this | `plan.md` — backend runs on port 3001; README references `http://localhost:3001` |
| `DATABASE_URL` | Full PostgreSQL connection string for `pg` pool | T007 (`backend/src/config/db.js`) reads this via `dotenv` |
| `GEMINI_API_KEY` | Authenticates calls to the Gemini API | spec.md FR-016 — AI context endpoint; `plan.md` AI Layer Design |

**`frontend/.env.example`**

| Variable | Purpose | Required by |
|----------|---------|-------------|
| `VITE_API_BASE_URL` | Base URL prepended to all `fetch()` calls to the backend | `plan.md` — services layer; all API client functions use this prefix |

**Why `VITE_` prefix**: Vite's security model only exposes environment variables prefixed with `VITE_` to the browser bundle via `import.meta.env`. Variables without this prefix remain server-side-only and are invisible to client code — this prevents accidentally exposing secrets.

**Why `.env.example` not `.env`**: `.env` is gitignored (it contains real secrets). `.env.example` is committed — it documents the interface without the values. Every developer copies it and fills in their own credentials.

---

### 3. Implementation Plan

1. Create `backend/.env.example` with `PORT`, `DATABASE_URL`, `GEMINI_API_KEY`
2. Create `frontend/.env.example` with `VITE_API_BASE_URL`
3. Write this execution report
4. Mark T005 done in `tasks.md`
5. Stage, commit with WHY-focused message, push
6. Open PR

---

### 4. Execution Steps

1. Confirmed `.gitignore` covers `.env` and `.env.*` (from earlier T001 audit) — `.env.example` files are not covered and will be committed correctly
2. Created `backend/.env.example` with 3 variables and inline comments
3. Created `frontend/.env.example` with 1 variable and inline comment explaining the `VITE_` prefix
4. Wrote `specs/001-jewish-museum-explorer/reports/T005-execution-report.md`
5. Updated T005 checkbox in `tasks.md` to `[x]`
6. Staged all four files
7. Committed with WHY-focused message
8. Pushed to `origin/task/T005-env-examples`

---

### 5. Files Created

**`backend/.env.example`**
```
PORT=3001
DATABASE_URL=postgresql://postgres:password@localhost:5432/jewish_museum
GEMINI_API_KEY=your_gemini_api_key_here
```

**`frontend/.env.example`**
```
VITE_API_BASE_URL=http://localhost:3001
```

---

### 6. Git Operations

| Action | Value |
|--------|-------|
| Base branch | `main` |
| Branch created | `task/T005-env-examples` |
| Files added | `backend/.env.example`, `frontend/.env.example`, `T005-execution-report.md`, `tasks.md` |
| Pushed to | `origin/task/T005-env-examples` |

---

### 7. Validation

- Both files committed (not gitignored) — confirmed `.gitignore` only excludes `.env` and `.env.*`, not `.env.example`
- `backend/.env.example` contains all 3 variables referenced in `quickstart.md`: `DATABASE_URL`, `GEMINI_API_KEY`, `PORT`
- `frontend/.env.example` contains `VITE_API_BASE_URL` with correct `VITE_` prefix required by Vite
- Default values are plausible for local dev (localhost URLs, placeholder API key string)
- Inline comments explain each variable's purpose and source

---

### 8. Edge Cases

- **`.env.example` vs `.env.sample`**: Using `.env.example` — the more common convention (used by Rails, Laravel, many open-source projects). The README references this name explicitly.
- **`DATABASE_URL` format**: Using the `postgresql://` scheme (not `postgres://`) — the `pg` npm package accepts both, but `postgresql://` is the canonical PostgreSQL URI format per RFC.
- **No `.env.example` for root**: The project has no root-level environment variables (all secrets are scoped to backend or frontend). A root `.env.example` would be confusing and empty.
- **`.gitignore` required a fix**: The existing `.env.*` glob pattern also matched `.env.example`, blocking `git add`. Added `!.env.example` and `!**/.env.example` negation rules directly below the `.env.*` line so the templates are committable while real `.env` files remain ignored. Also staged `.gitignore` as part of this commit.
