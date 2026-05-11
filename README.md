# Jewish Soldier Museum — WWII Interactive Explorer

A full-stack bilingual web application for the Jewish Soldier Museum. Users explore WWII history through an interactive world map, soldier biographies, historical events, a chronological timeline, and keyword search — enhanced with AI-generated contextual summaries.

**Stack**: React 18 · Node.js 20 · PostgreSQL 15 · MapLibre GL JS · Gemini API  
**Languages**: Hebrew (RTL) + English (LTR)

---

## For Developers — Getting Started

### 1. Prerequisites

- [Node.js 20 LTS](https://nodejs.org/)
- [PostgreSQL 15+](https://www.postgresql.org/)
- [Claude Code](https://claude.ai/code) — required for the Spec Kit workflow
- A Gemini API key (Google AI Studio)

### 2. Clone and install

```bash
git clone https://github.com/Nir41415533/jewish-museum-speck-kit.git
cd jewish-museum-speck-kit

# Backend
cd backend && npm install

# Frontend
cd ../frontend && npm install
```

### 3. Configure environment

```bash
# Backend
cp backend/.env.example backend/.env
# Fill in: DATABASE_URL, GEMINI_API_KEY, PORT

# Frontend
cp frontend/.env.example frontend/.env
# Fill in: VITE_API_BASE_URL
```

### 4. Set up the database

```bash
cd backend
npm run db:migrate   # creates all tables
npm run db:seed      # loads sample data
```

### 5. Run the app

```bash
# In one terminal
cd backend && npm run dev

# In another terminal
cd frontend && npm run dev
```

Frontend: http://localhost:5173  
Backend API: http://localhost:3001

---

## Project Specification

All design decisions live in `specs/001-jewish-museum-explorer/`:

| File | Purpose |
|------|---------|
| `spec.md` | Product specification — user stories, requirements, success criteria |
| `plan.md` | System architecture — data flow, component structure |
| `data-model.md` | PostgreSQL schema — all 6 tables, indexes, validation rules |
| `contracts/api.md` | REST API contracts — all 12 endpoints with request/response shapes |
| `research.md` | Technical decisions and rationale |
| `tasks.md` | Implementation task list — current progress |
| `quickstart.md` | Detailed dev environment setup |

---

## Working with Spec Kit (AI Workflow)

This project uses **Spec Kit** — an AI-assisted specification and planning workflow that runs inside Claude Code.

### Available slash commands

| Command | Purpose |
|---------|---------|
| `/speckit-specify` | Create or update the feature specification |
| `/speckit-clarify` | Ask clarification questions against the spec |
| `/speckit-plan` | Generate the implementation plan and architecture |
| `/speckit-tasks` | Generate the implementation task list |
| `/speckit-analyze` | Run a consistency check across all spec artifacts |

### How to use

Open the project in Claude Code (CLI or IDE extension), then type any `/speckit-*` command directly in the prompt.

---

## Implementation Tasks

Tasks are tracked in `specs/001-jewish-museum-explorer/tasks.md`.

Each task:
- Has a unique ID (`T001`, `T002`, ...)
- Lives on its own git branch (`task/TXXX-<slug>`)
- Has a corresponding execution report in `specs/001-jewish-museum-explorer/reports/`

### Current progress

See `tasks.md` for the full list. Completed tasks are marked `[x]`.

---

## Branch Strategy

| Branch pattern | Purpose |
|---------------|---------|
| `main` | Stable base — spec, architecture, tooling |
| `001-jewish-museum-explorer` | Feature specification branch |
| `task/TXXX-<slug>` | One branch per implementation task |

Tasks are reviewed as PRs before merging. Do not merge task branches yourself — wait for review.
