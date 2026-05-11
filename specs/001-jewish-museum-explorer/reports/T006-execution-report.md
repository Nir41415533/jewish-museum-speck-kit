# T006 — Technical Execution Report
## Configure Express App Entry Point

**Branch**: `task/T006-express-entry-point`
**Date**: 2026-05-11
**Status**: Complete

---

### 1. Task Understanding

T006 creates the Express application shell — the HTTP server that all future API routes (T023 onward) will mount into. It also establishes the two cross-cutting middleware concerns that every request passes through: CORS (so the React frontend on port 5173 can call the API on port 3001) and JSON body parsing (so POST/PUT request bodies are readable as `req.body`). The centralized error handler ensures every route can `next(err)` without duplicating error formatting logic.

---

### 2. Files Created

**`backend/src/index.js`** — Application entry point
- Loads `.env` via `dotenv` before any other import (required so `process.env` is populated when modules initialize)
- Creates the Express app and applies middleware
- Exports `app` (used by Supertest in integration tests without starting a real server)
- Only calls `app.listen()` when run directly (`require.main === module`) — prevents port binding when imported in tests

**`backend/src/config/middleware.js`** — Middleware factory
- `applyMiddleware(app)`: mounts `cors` + `express.json()`
- `errorHandler(err, req, res, next)`: Express 4-argument error handler; formats all errors as `{ error: { code, message } }` matching the shape defined in `api.md` and implemented by T017

---

### 3. Key Decisions

**CORS origin**: Defaulting to `http://localhost:5173` (Vite default) with `process.env.FRONTEND_URL` override. The app is read-only (no auth, no mutations from the browser), so only `GET` methods are allowed — reduces the CORS attack surface.

**`require.main === module` guard**: Separates the app object from the process lifecycle. Tests import `app` directly and bind it to a random port via Supertest — no port conflicts, no leftover server handles.

**Error handler placement**: Mounted after route registration stubs so it catches errors from any route added in subsequent tasks. Express identifies error handlers by their 4-argument signature `(err, req, res, next)`.

---

### 4. Git Operations

| Action | Value |
|--------|-------|
| Branch | `task/T006-express-entry-point` |
| Files added | `backend/src/index.js`, `backend/src/config/middleware.js`, report, `tasks.md` |
