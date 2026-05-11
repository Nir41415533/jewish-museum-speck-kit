# Implementation Plan: Jewish Soldier Museum — WWII Interactive Explorer

**Branch**: `001-jewish-museum-explorer` | **Date**: 2026-05-10 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `specs/001-jewish-museum-explorer/spec.md`

---

## Summary

A full-stack bilingual web application for the Jewish Soldier Museum. Users navigate WWII history through a MapLibre GL JS interactive world map (primary entry point). Selecting a country opens a side panel listing all associated soldiers and events (many-to-many for soldiers, single-country for events). Users access full soldier biographies, historical event detail pages, a chronological timeline, and keyword search. All content is stored in PostgreSQL with parallel Hebrew and English fields. A Gemini API integration delivers AI-generated contextual summaries, triggered only by explicit user action and generated in the currently active UI language (Hebrew or English). The React frontend manages a global language toggle with full RTL/LTR layout switching.

---

## Technical Context

**Language/Version**: Node.js 20 LTS (backend) · React 18 (frontend)
**Primary Dependencies**: Express.js (REST API) · MapLibre GL JS (map) · Gemini API (AI) · pg (PostgreSQL client) · React Router (client-side routing)
**Storage**: PostgreSQL 15+
**Testing**: Jest + Supertest (backend) · React Testing Library + Jest (frontend)
**Target Platform**: Web — last 2 major versions of Chrome, Firefox, Safari, Edge; responsive desktop and mobile
**Project Type**: Full-stack web application (SPA frontend + REST API backend)
**Performance Goals**: Search results < 2s · AI generation < 10s · Soldier list first-page load < 3s · Country panel open < 200ms
**Constraints**: AI strictly user-triggered · All secrets in environment variables · Bilingual Hebrew/English with RTL · Large soldier datasets paginated · Museum-grade respectful tone
**Scale/Scope**: Museum-scale dataset (hundreds to low thousands of soldiers and events) · Read-heavy · No user authentication

---

## Constitution Check

No project constitution has been defined — `constitution.md` is an unfilled template with no active gates. All architectural decisions are governed by the fixed tech stack and product decisions provided in the planning input. No violations to track.

---

## Project Structure

### Documentation (this feature)

```
specs/001-jewish-museum-explorer/
├── plan.md              # This file
├── research.md          # Phase 0 — tech decisions and resolved unknowns
├── data-model.md        # Phase 1 — PostgreSQL schema
├── quickstart.md        # Phase 1 — dev environment setup
├── contracts/
│   └── api.md           # Phase 1 — REST API contracts
└── tasks.md             # Phase 2 — /speckit-tasks output (not yet created)
```

### Source Code

```
backend/
├── src/
│   ├── config/          # environment variable loading, database pool setup
│   ├── db/              # schema migrations, seed scripts
│   ├── models/          # data access layer: country, soldier, event, media
│   ├── services/        # business logic: search service, AI service
│   ├── routes/          # Express route handlers: countries, soldiers, events, search, ai
│   └── index.js         # application entry point, middleware setup
└── tests/
    ├── integration/     # API endpoint tests (Supertest)
    └── unit/            # service and model unit tests (Jest)

frontend/
├── src/
│   ├── components/
│   │   ├── Map/         # MapLibre container, country layer, click handler
│   │   ├── CountryPanel/ # side panel, soldier list, event list, AI button
│   │   ├── Soldier/     # biography card, biography detail, media viewer
│   │   ├── Event/       # event card, event detail, media viewer
│   │   ├── Timeline/    # timeline list, timeline entry, map sync trigger
│   │   ├── Search/      # search bar, results list, results grouping
│   │   ├── AI/          # AI context button, AI context display
│   │   └── Layout/      # header, navigation, language toggle, RTL wrapper
│   ├── pages/
│   │   ├── HomePage.jsx
│   │   ├── MapPage.jsx
│   │   ├── SoldierPage.jsx
│   │   ├── EventPage.jsx
│   │   ├── TimelinePage.jsx
│   │   └── SearchPage.jsx
│   ├── context/
│   │   ├── LanguageContext.jsx   # active language state and setter
│   │   └── MapContext.jsx        # selected country, panel open state
│   ├── hooks/           # useLanguage, useCountryData, useSearch, useAI
│   ├── services/        # API client: typed fetch wrappers per resource
│   └── main.jsx         # app entry, router setup, context providers
└── tests/
    └── components/
```

**Structure Decision**: Separate `backend/` and `frontend/` directories. Backend is a standalone Express REST API. Frontend is a React SPA with client-side routing via React Router. No monorepo tooling required at this scale.

---

## Complexity Tracking

No constitution violations. No complexity justification required.

---

## System Architecture

### Component Overview

```
Browser (React SPA)
  │
  ├── MapLibre GL JS          renders world map, country layers, click events
  ├── React Pages/Components  all UI views
  ├── LanguageContext          global language state (en | he), RTL control
  ├── MapContext               selected country ID, panel open/closed state
  └── API Service Layer        typed fetch calls to backend

        │  HTTP REST
        ▼

Node.js / Express (backend)
  ├── Route Handlers           validate input, delegate to models/services
  ├── Models                   direct SQL queries via pg pool
  ├── Search Service           full-text query assembly (PostgreSQL tsvector)
  └── AI Service               prompt assembly, Gemini API call, response relay

        │  SQL
        ▼

PostgreSQL
  └── Tables: countries, soldiers, events, soldier_countries,
              soldier_participations, media

        │  HTTPS
        ▼

Gemini API (external)
  └── Receives assembled prompt in target language
      Returns plain-text contextual summary
```

### Data Flow — Country Selection

1. On app load: frontend fetches `GET /api/countries` → receives list of interactive country codes and IDs
2. MapLibre applies a data-driven style: countries in the list are styled as interactive (distinct fill color, pointer cursor)
3. User clicks a country on the map → MapLibre fires click event with GeoJSON feature (contains ISO country code)
4. Frontend looks up country ID from the loaded list by code
5. Frontend dispatches to MapContext: `{ selectedCountryId, isPanelOpen: true }`
6. CountryPanel mounts, fetches `GET /api/countries/:id` (detail) and `GET /api/countries/:id/soldiers?page=1` and `GET /api/countries/:id/events`
7. Panel renders with soldier list (paginated) and event list; AI button renders in idle state
8. User clicks "Get AI Context" → frontend POSTs `{ language }` to `POST /api/ai/country/:id`
9. Backend assembles prompt from country data in target language → calls Gemini API → returns `{ content, language }`
10. Panel renders AI content inline below the country name

### Data Flow — Language Switch

1. User clicks language toggle → LanguageContext updates `language` to `'he'` or `'en'`
2. Root wrapper element gets `dir="rtl"` or `dir="ltr"` attribute updated
3. All components read `language` from context and render the matching text field (`name_he` vs `name_en`)
4. Any AI content already displayed is cleared and the "Get AI Context" button resets to idle (AI content was generated in the previous language and is now stale)
5. If user clicks "Get AI Context" again, new request is sent with the updated `language` value

---

## Design Decisions (Phase 0 Resolutions)

See `research.md` for full rationale. Summary of resolved decisions:

| Decision | Choice |
|----------|--------|
| Bilingual storage | Parallel columns per language (`name_en`, `name_he`) — not a translation join table |
| Full-text search | PostgreSQL `tsvector` generated columns; separate vectors for English and Hebrew |
| RTL strategy | `dir` attribute on root `<html>` element; CSS logical properties where possible |
| AI prompt language | Prompt body written in target language; single call per request; no session caching |
| Map–country linking | GeoJSON features carry ISO 3166-1 alpha-3 country code; matched against `countries.code` column |
| State management | React Context only (LanguageContext + MapContext); no external state library |
| Soldier pagination | Cursor-based pagination by soldier ID for stable ordering with large datasets |
| Event–Country | Single country per event (`events.country_id`); consistent with original spec |
| Soldier–Country | Many-to-many via `soldier_countries` join table with `relationship_type` |
| Media storage | Media referenced by URL in `media` table; files hosted externally (not served by this API) |
