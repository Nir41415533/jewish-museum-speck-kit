# T003 — Technical Execution Report
## Initialize Node.js Backend Project

**Branch**: `task/T003-backend-npm-init`
**Date**: 2026-05-11
**Status**: Complete

---

### 1. Task Understanding

T003 initializes the Node.js backend project by creating `backend/package.json` with all runtime and development dependencies defined in `plan.md`. Without this file, no subsequent backend task can install packages or run scripts — it is the prerequisite that unlocks T006 (Express entry point) and every database, model, and route task that follows.

This task establishes:
- The canonical dependency versions for the backend
- All five npm scripts (`start`, `dev`, `db:migrate`, `db:seed`, `test`) that `plan.md` and `quickstart.md` reference
- The Jest configuration so the `tests/` directories created in T001 are discoverable by the test runner

---

### 2. Why These Dependencies

| Package | Role | Spec/Plan Reference |
|---------|------|---------------------|
| `express` | HTTP server and routing | `plan.md` → Primary Dependencies |
| `pg` | PostgreSQL client | `plan.md` → Primary Dependencies; connects to the 6-table schema in `data-model.md` |
| `dotenv` | Environment variable loading from `.env` | `spec.md` FR-019 — all sensitive config must be stored in environment variables |
| `cors` | Allows the React frontend (port 5173) to call the API (port 3001) during development | `plan.md` → Project Structure — separate frontend/backend dev servers |
| `nodemon` (dev) | Restarts the server on file change during development | `quickstart.md` — `npm run dev` requirement |
| `jest` + `supertest` (dev) | Unit and integration test runner | `plan.md` → Testing: Jest + Supertest |

`express@4.x` is used rather than `5.x` because Express 5 was still in RC during planning and the project's test tooling (`supertest`) has broadest compatibility with v4.

---

### 3. Implementation Plan

1. Confirm backend directory exists (T001 output) — verified `src/` and `tests/` are present
2. Write `backend/package.json` with correct `engines`, `scripts`, `dependencies`, `devDependencies`, and `jest` config
3. Write this execution report
4. Stage `backend/package.json` and report, commit with WHY-focused message
5. Push branch, open PR
6. Mark T003 done in `tasks.md`

---

### 4. Execution Steps

1. Confirmed `backend/src/` and `backend/tests/` exist from T001
2. Created `backend/package.json` with all four runtime dependencies and three dev dependencies
3. Wrote `specs/001-jewish-museum-explorer/reports/T003-execution-report.md`
4. Updated T003 checkbox in `tasks.md` to `[x]`
5. Staged `backend/package.json`, report file, and `tasks.md`
6. Committed with WHY-focused message body (see Section 6)
7. Pushed to `origin/task/T003-backend-npm-init`

---

### 5. File Created

**`backend/package.json`**

```json
{
  "name": "jewish-museum-backend",
  "version": "1.0.0",
  "main": "src/index.js",
  "engines": { "node": ">=20.0.0" },
  "scripts": {
    "start": "node src/index.js",
    "dev": "nodemon src/index.js",
    "db:migrate": "node src/db/migrate.js",
    "db:seed": "node src/db/seed.js",
    "test": "jest --runInBand"
  },
  "dependencies": {
    "cors": "^2.8.5",
    "dotenv": "^16.4.5",
    "express": "^4.19.2",
    "pg": "^8.12.0"
  },
  "devDependencies": {
    "jest": "^29.7.0",
    "nodemon": "^3.1.4",
    "supertest": "^7.0.0"
  },
  "jest": {
    "testEnvironment": "node",
    "testMatch": ["**/tests/**/*.test.js"]
  }
}
```

---

### 6. Git Operations

| Action | Value |
|--------|-------|
| Base branch | `main` |
| Branch created | `task/T003-backend-npm-init` |
| Files added | `backend/package.json`, `T003-execution-report.md`, `tasks.md` |
| Commit subject | `T003: Initialize Node.js backend project with Express, pg, dotenv, cors` |
| Pushed to | `origin/task/T003-backend-npm-init` |

**Commit body (WHY)**: Express is the HTTP server defined in `plan.md`; `pg` is the PostgreSQL client for the 6-table schema in `data-model.md`; `dotenv` satisfies FR-019's requirement that all secrets be loaded from environment variables; `cors` allows the React dev server (port 5173) to reach the API (port 3001). Without this `package.json`, no subsequent backend task can install packages or define npm scripts.

---

### 7. Validation

- `backend/package.json` is valid JSON (confirmed by inspection)
- All four runtime dependencies are present: `cors`, `dotenv`, `express`, `pg`
- All three dev dependencies are present: `jest`, `nodemon`, `supertest`
- All five npm scripts are defined: `start`, `dev`, `db:migrate`, `db:seed`, `test`
- `jest.testMatch` points to `**/tests/**/*.test.js` — matches the `backend/tests/` structure from T001
- `engines.node` set to `>=20.0.0` per `plan.md` Node.js 20 LTS requirement

---

### 8. Edge Cases

- **`express@4` vs `5`**: Pinned to `4.x` — Express 5 was RC during planning and `supertest` compatibility with v5 is not guaranteed.
- **`--runInBand` flag on Jest**: Forces serial test execution to prevent parallel database access conflicts in future integration tests.
- **No `package-lock.json`**: Not committed — `npm install` will generate it when a developer sets up locally. Committing a lock file without running `npm install` first would produce a stale artifact.
