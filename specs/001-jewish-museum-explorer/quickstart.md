# Quickstart: Jewish Soldier Museum — WWII Interactive Explorer

**Date**: 2026-05-10 | **Branch**: `001-jewish-museum-explorer`

---

## Prerequisites

- Node.js 20 LTS
- PostgreSQL 15+
- A Gemini API key (Google AI Studio or Vertex AI)

---

## Repository Structure

```
/
├── backend/     Node.js + Express REST API
├── frontend/    React SPA
└── specs/       Specification and design artifacts (not deployed)
```

---

## Backend Setup

### 1. Install dependencies

```
cd backend
npm install
```

### 2. Configure environment

Copy `.env.example` to `.env` and fill in all values:

```
DATABASE_URL=postgresql://user:password@localhost:5432/jewish_museum
GEMINI_API_KEY=your_gemini_api_key_here
PORT=3001
NODE_ENV=development
```

**Never commit `.env` to version control.**

### 3. Set up the database

Create the database:
```
createdb jewish_museum
```

Run schema migrations (creates all tables and indexes):
```
npm run db:migrate
```

Optionally load seed data (sample countries, soldiers, events):
```
npm run db:seed
```

### 4. Start the backend

Development (with auto-reload):
```
npm run dev
```

Production:
```
npm start
```

The API listens on `http://localhost:3001` by default.

### 5. Run backend tests

```
npm test
```

---

## Frontend Setup

### 1. Install dependencies

```
cd frontend
npm install
```

### 2. Configure environment

Copy `.env.example` to `.env`:

```
VITE_API_BASE_URL=http://localhost:3001/api
```

### 3. Start the frontend

Development server (with HMR):
```
npm run dev
```

The app opens at `http://localhost:5173` by default.

### 4. Run frontend tests

```
npm test
```

### 5. Build for production

```
npm run build
```

Output goes to `frontend/dist/`.

---

## Key Environment Variables Reference

| Variable | Location | Description |
|----------|----------|-------------|
| `DATABASE_URL` | backend `.env` | PostgreSQL connection string |
| `GEMINI_API_KEY` | backend `.env` | Google Gemini API key |
| `PORT` | backend `.env` | Port for Express server (default: 3001) |
| `NODE_ENV` | backend `.env` | `development` or `production` |
| `VITE_API_BASE_URL` | frontend `.env` | Backend API base URL used by the React app |

---

## Verifying the Setup

1. Backend health check: `GET http://localhost:3001/api/countries` — should return `{ "data": [] }` on a fresh database or a list of countries after seeding.
2. Frontend: navigate to `http://localhost:5173` — homepage should load. Map view should render the world map (countries without data will not be interactive until seed data is loaded).
3. AI endpoint: `POST http://localhost:3001/api/ai/country/1` with body `{ "language": "en" }` — should return AI-generated content if a country with ID 1 exists and the Gemini API key is valid.

---

## GeoJSON World Map Data

The frontend's MapLibre GL JS layer requires a world GeoJSON file with `ISO_A3` properties on each feature.

Download Natural Earth 110m cultural vectors and place the file at:
```
frontend/src/assets/world-110m.geojson
```

Source: [naturalearthdata.com](https://www.naturalearthdata.com/downloads/110m-cultural-vectors/) — `ne_110m_admin_0_countries.shp` converted to GeoJSON.
