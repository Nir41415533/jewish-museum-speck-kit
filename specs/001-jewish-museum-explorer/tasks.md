# Tasks: Jewish Soldier Museum — WWII Interactive Explorer

**Input**: Design documents from `specs/001-jewish-museum-explorer/`
**Branch**: `001-jewish-museum-explorer`
**Stack**: Node.js 20 + Express (backend) · React 18 (frontend) · PostgreSQL 15 · MapLibre GL JS · Gemini API

**Format**: `- [ ] [ID] [P?] [Story?] Description — file path`
- **[P]**: Parallelizable (no shared file conflicts)
- **[USn]**: Maps to User Story n from spec.md

---

## Phase 1: Setup — Project Structure

**Purpose**: Initialize both projects, directory layout, and shared tooling.

- [x] T001 Create backend directory structure per plan.md — `backend/src/{config,db,models,services,routes}/` + `backend/tests/{integration,unit}/`
- [x] T002 [P] Create frontend directory structure per plan.md — `frontend/src/{components/{Map,CountryPanel,Soldier,Event,Timeline,Search,AI,Layout},pages,context,hooks,services}/` + `frontend/tests/components/`
- [x] T003 Initialize Node.js backend project with Express, pg, dotenv, cors — `backend/package.json`
- [x] T004 [P] Initialize React frontend project with React Router, MapLibre GL JS — `frontend/package.json`
- [ ] T005 [P] Create `.env.example` for both projects documenting all required environment variables (`DATABASE_URL`, `GEMINI_API_KEY`, `PORT`, `VITE_API_BASE_URL`) — `backend/.env.example`, `frontend/.env.example`

**Checkpoint**: Repository scaffolding complete. Both `npm install` commands succeed.

---

## Phase 2: Foundational — Backend Core + Full Database Schema

**Purpose**: Core infrastructure that MUST be complete before ANY user story. Includes the full database schema (all 6 tables) since entities are deeply interconnected.

⚠️ **CRITICAL**: No user story work begins until this phase is complete.

- [ ] T006 Configure Express app entry point with JSON body parser, CORS, and centralized error-handling middleware — `backend/src/index.js`, `backend/src/config/middleware.js`
- [ ] T007 Configure PostgreSQL connection pool using `DATABASE_URL` from environment — `backend/src/config/db.js`
- [ ] T008 Create database migration: `countries` table (`id`, `code` UNIQUE, `name_en`, `name_he`, `lat`, `lng`, `flag_url`) with `idx_countries_code` unique index — `backend/src/db/migrations/001_create_countries.sql`
- [ ] T009 Create database migration: `soldiers` table with all columns including `reference_code` UNIQUE, bilingual name/biography/army/rank/role/location fields, `search_vector_en` and `search_vector_he` generated tsvector columns, GIN indexes — `backend/src/db/migrations/002_create_soldiers.sql`
- [ ] T010 Create database migration: `soldier_countries` join table (`soldier_id` FK, `country_id` FK, `relationship_type` CHECK IN ('birth','service','death','other'), PK on all three) with `idx_soldier_countries_country` index — `backend/src/db/migrations/003_create_soldier_countries.sql`
- [ ] T011 Create database migration: `soldier_participations` table (`id`, `soldier_id` FK CASCADE, `type` CHECK IN ('decoration','participation'), `name_en`, `name_he`, `display_order`) with `idx_participations_soldier` index — `backend/src/db/migrations/004_create_soldier_participations.sql`
- [ ] T012 Create database migration: `events` table (`id`, `title_en`, `title_he`, `start_date` NOT NULL, `end_date` NULL, `description_en`, `description_he`, `country_id` FK, `search_vector_en`, `search_vector_he` generated tsvector columns, GIN indexes, `idx_events_country`, `idx_events_date` on `start_date ASC`) — `backend/src/db/migrations/005_create_events.sql`
- [ ] T013 Create database migration: `media` table (`id`, `entity_type` CHECK IN ('soldier','event'), `entity_id`, `media_type` CHECK IN ('image','video'), `url`, `caption_en`, `caption_he`, `display_order`) with `idx_media_entity` on `(entity_type, entity_id, display_order)` — `backend/src/db/migrations/006_create_media.sql`
- [ ] T014 Create migration runner script that executes all `.sql` files in order — `backend/src/db/migrate.js`
- [ ] T015 Create seed script with sample data: 3 countries, 5 soldiers (with soldier_countries and soldier_participations), 4 events, 3 media records — `backend/src/db/seed.js`
- [ ] T016 [P] Configure `npm run db:migrate` and `npm run db:seed` scripts — `backend/package.json`
- [ ] T017 Create shared API error response helper returning `{ error: { code, message } }` — `backend/src/config/errors.js`

**Checkpoint**: `npm run db:migrate && npm run db:seed` succeeds. All 6 tables exist with correct schema.

---

## Phase 3: User Story 1 — Interactive Map Exploration (Priority: P1) 🎯 MVP

**Goal**: Users can view an interactive world map, see highlighted countries with WWII data, click a country, and see a side panel with associated soldiers and events.

**Independent Test**: Load the app → navigate to the map → click an interactive country → verify the side panel slides open showing soldiers and events lists.

### Backend — Countries API

- [ ] T018 [US1] Implement `CountryModel.listInteractive()` — queries countries that have at least one soldier or event, returns `{id, code, name_en, name_he, lat, lng, flag_url}` — `backend/src/models/country.model.js`
- [ ] T019 [US1] Implement `CountryModel.findById(id)` — returns single country or null — `backend/src/models/country.model.js`
- [ ] T020 [US1] Implement `CountryModel.getSoldiers(countryId, { limit, after })` — cursor-paginated query joining `soldier_countries` + `soldiers`, returns soldiers with `relationship_types` array, ordered by `soldiers.id ASC` — `backend/src/models/country.model.js`
- [ ] T021 [US1] Implement `CountryModel.getEvents(countryId)` — returns all events for country ordered by `start_date ASC`, includes `start_date` and `end_date` — `backend/src/models/country.model.js`
- [ ] T022 [US1] Implement Express routes: `GET /api/countries` → `listInteractive`, `GET /api/countries/:id` → `findById`, `GET /api/countries/:id/soldiers` → `getSoldiers` (with `?limit` and `?after` query params), `GET /api/countries/:id/events` → `getEvents`; wire 404 on missing country — `backend/src/routes/countries.route.js`
- [ ] T023 [US1] Register `/api/countries` router in Express app — `backend/src/index.js`

### Frontend — Map & Country Panel

- [ ] T024 [P] [US1] Implement `LanguageContext` — provides `{ language: 'en'|'he', setLanguage }`; sets `document.documentElement.dir` to `'rtl'`/`'ltr'` on change; defaults to `'en'` — `frontend/src/context/LanguageContext.jsx`
- [ ] T025 [P] [US1] Implement `MapContext` — provides `{ selectedCountryId, setSelectedCountryId, isPanelOpen, setIsPanelOpen }`; closing panel resets `selectedCountryId` to null — `frontend/src/context/MapContext.jsx`
- [ ] T026 [US1] Wrap React app root with `LanguageContext.Provider` and `MapContext.Provider`; configure `BrowserRouter` with routes for `/`, `/map`, `/soldier/:id`, `/event/:id`, `/timeline`, `/search` — `frontend/src/main.jsx`
- [ ] T027 [US1] Implement `Layout` component — renders header with site name and `LanguageToggle` placeholder; wraps `children`; applies RTL-aware CSS class based on `LanguageContext` — `frontend/src/components/Layout/Layout.jsx`
- [ ] T028 [US1] Implement `HomePage` — museum introduction copy (bilingual via `useLanguage` hook), prominent "Explore the Map" button navigating to `/map` — `frontend/src/pages/HomePage.jsx`
- [ ] T029 [US1] Implement `useCountryData` hook — fetches `GET /api/countries/:id`, `GET /api/countries/:id/soldiers`, `GET /api/countries/:id/events` in parallel when `countryId` changes; exposes `{ country, soldiers, events, loadMoreSoldiers, hasMoreSoldiers, loading, error }` — `frontend/src/hooks/useCountryData.js`
- [ ] T030 [US1] Implement `MapContainer` — initialises MapLibre GL JS instance via `useRef`; loads world GeoJSON from `frontend/src/assets/world-110m.geojson`; on app load fetches `GET /api/countries` and applies data-driven `fill-color` paint expression to highlight interactive countries; registers `click` event — on click of interactive country calls `setSelectedCountryId` and `setIsPanelOpen(true)` — `frontend/src/components/Map/MapContainer.jsx`
- [ ] T031 [US1] Implement `CountryPanel` — slide-in side panel (CSS transition); reads `selectedCountryId` from `MapContext`; uses `useCountryData` hook; renders country name (language-aware), "Get AI Context" button (disabled/placeholder for now), scrollable soldiers list, scrollable events list, "Load more" button when `hasMoreSoldiers`; close button sets `isPanelOpen(false)` — `frontend/src/components/CountryPanel/CountryPanel.jsx`
- [ ] T032 [US1] Implement `MapPage` — renders `MapContainer` + `CountryPanel` side-by-side on desktop (CSS flexbox); on mobile (`max-width: 768px`) panel covers full width (CSS media query) — `frontend/src/pages/MapPage.jsx`

**Checkpoint**: Homepage loads → "Explore the Map" works → map renders → clicking an interactive country opens the side panel showing soldier and event lists.

---

## Phase 4: User Story 2 — Soldier Biography View (Priority: P2)

**Goal**: Users can click a soldier's name and view their full biography including service details, participations, decorations, and media.

**Independent Test**: Navigate to `/soldier/:id` directly — verify all biography fields, participations list, and media render; verify "Get AI Context" button is present (inactive).

### Backend — Soldiers API

- [ ] T033 [US2] Implement `SoldierModel.findById(id)` — queries `soldiers` JOIN `soldier_participations` + `media` (entity_type='soldier') + `soldier_countries` JOIN `countries`; returns full biography object per `contracts/api.md` response shape including `reference_code`, bilingual fields, `countries[]` with `relationship_type`, `participations[]` ordered by `display_order`, `media[]` ordered by `display_order` — `backend/src/models/soldier.model.js`
- [ ] T034 [US2] Implement Express route `GET /api/soldiers/:id` → `SoldierModel.findById`; wire 404 on null — `backend/src/routes/soldiers.route.js`
- [ ] T035 [US2] Register `/api/soldiers` router in Express app — `backend/src/index.js`

### Frontend — Soldier Biography

- [ ] T036 [P] [US2] Implement `MediaViewer` component — renders images as `<img>` and video as `<video>` with caption (language-aware); gracefully omits section if media array is empty — `frontend/src/components/Soldier/MediaViewer.jsx`
- [ ] T037 [US2] Implement `SoldierPage` — fetches `GET /api/soldiers/:id`; renders: `reference_code` (small), name (language-aware, large heading), birth info, biography text (language-aware), army/rank/role, participations grouped by type ('decoration'/'participation'), death info if present, `MediaViewer`, linked countries list, "Get AI Context" button placeholder — `frontend/src/pages/SoldierPage.jsx`
- [ ] T038 [US2] Add soldier name as a clickable link in `CountryPanel` soldiers list → navigates to `/soldier/:id` — `frontend/src/components/CountryPanel/CountryPanel.jsx`

**Checkpoint**: Clicking a soldier name in the panel opens `/soldier/:id` with full biography. Page renders gracefully when media is absent.

---

## Phase 5: User Story 3 — Historical Event Detail View (Priority: P3)

**Goal**: Users can click an event title and view its full detail including date range, description, country, and media.

**Independent Test**: Navigate to `/event/:id` directly — verify all event fields render; `end_date` shows when present; media renders when available; "Get AI Context" button is present.

### Backend — Events Detail API

- [ ] T039 [US3] Implement `EventModel.findById(id)` — queries `events` JOIN `countries` + `media` (entity_type='event'); returns full event object per `contracts/api.md` shape including `start_date`, `end_date` (nullable), bilingual title/description, `country` object, `media[]` — `backend/src/models/event.model.js`
- [ ] T040 [US3] Implement Express route `GET /api/events/:id` → `EventModel.findById`; wire 404 on null — `backend/src/routes/events.route.js`

### Frontend — Event Detail

- [ ] T041 [P] [US3] Implement `EventPage` — fetches `GET /api/events/:id`; renders: title (language-aware), date display (shows `start_date` only if `end_date` is null; shows "start_date – end_date" if both present), description (language-aware), linked country name, `MediaViewer`, "Get AI Context" button placeholder — `frontend/src/pages/EventPage.jsx`
- [ ] T042 [US3] Register `/api/events` router in Express app and add event-detail link in `CountryPanel` events list → navigates to `/event/:id` — `backend/src/index.js`, `frontend/src/components/CountryPanel/CountryPanel.jsx`

**Checkpoint**: Clicking an event in the panel opens `/event/:id`. Date range displays correctly. Page renders without media when none exists.

---

## Phase 6: User Story 4 — Timeline Navigation (Priority: P4)

**Goal**: Users can view all events in chronological order and click any event to fly the map to the related country and open the event detail.

**Independent Test**: Navigate to `/timeline` → events appear in date order → clicking one event flies the map to the correct country and opens the event detail view.

### Backend — Timeline (Events List) API

- [ ] T043 [US4] Implement `EventModel.list({ limit, offset, sort })` — queries all events with `countries` joined, ordered by `start_date ASC` (or DESC), offset-paginated; returns `{id, title_en, title_he, start_date, end_date, country: {id, code, name_en, name_he, lat, lng}}` per `contracts/api.md` — `backend/src/models/event.model.js`
- [ ] T044 [US4] Implement Express route `GET /api/events` with `?limit`, `?offset`, `?sort` query params → `EventModel.list`; register in app — `backend/src/routes/events.route.js`, `backend/src/index.js`

### Frontend — Timeline

- [ ] T045 [US4] Implement `useTimeline` hook — fetches `GET /api/events?sort=date_asc&limit=50`; exposes `{ events, loading, error }` — `frontend/src/hooks/useTimeline.js`
- [ ] T046 [US4] Implement `TimelinePage` — renders chronological list of events; each entry shows `start_date` (and `end_date` if present as a span indicator), title (language-aware), country name (language-aware); on entry click: calls `map.flyTo({ center: [country.lng, country.lat], zoom: 4 })` via `MapContext` ref, sets `selectedCountryId` in `MapContext`, then navigates to `/event/:id` — `frontend/src/pages/TimelinePage.jsx`
- [ ] T047 [US4] Expose MapLibre `map` instance ref from `MapContext` so `TimelinePage` can call `map.flyTo()` without re-rendering the map component — `frontend/src/context/MapContext.jsx`, `frontend/src/components/Map/MapContainer.jsx`

**Checkpoint**: `/timeline` shows events in date order. Clicking an event animates the map to the correct country and opens the event detail.

---

## Phase 7: User Story 5 — Search (Priority: P5)

**Goal**: Users can search by keyword and receive grouped results for soldiers, events, and countries. Clicking a country result opens its map panel.

**Independent Test**: Enter "Warsaw" in the search bar → verify results appear in all three groups where applicable → clicking a country result opens the map with Poland's panel.

### Backend — Search API

- [ ] T048 [US5] Implement `SearchService.search({ q, type, limit, offset })` — builds tsvector full-text query for soldiers (`search_vector_en` OR `search_vector_he`), events (`search_vector_en` OR `search_vector_he`), and countries (`ILIKE` on `name_en` and `name_he`); runs all three queries (or only the requested type); returns grouped result object with pagination per group per `contracts/api.md` — `backend/src/services/search.service.js`
- [ ] T049 [US5] Implement Express route `GET /api/search?q=&type=&limit=&offset=` → `SearchService.search`; return 400 if `q` is missing or fewer than 2 characters; register in app — `backend/src/routes/search.route.js`, `backend/src/index.js`

### Frontend — Search UI

- [ ] T050 [P] [US5] Implement `useSearch` hook — accepts `{ query, type }`, fetches `GET /api/search` on submit, exposes `{ results, loading, error, search }` — `frontend/src/hooks/useSearch.js`
- [ ] T051 [US5] Implement `SearchBar` component — text input with submit; accessible; displayed in `Layout` header so it is available on all pages; on submit navigates to `/search?q=<query>` — `frontend/src/components/Search/SearchBar.jsx`, `frontend/src/components/Layout/Layout.jsx`
- [ ] T052 [US5] Implement `SearchPage` — reads `q` from URL params; uses `useSearch`; renders three grouped sections (Soldiers / Events / Countries); each soldier result links to `/soldier/:id`, each event result links to `/event/:id`, each country result sets `selectedCountryId` in `MapContext` and navigates to `/map`; shows clear "no results" message when all groups are empty — `frontend/src/pages/SearchPage.jsx`
- [ ] T053 [US5] Add pagination controls ("Load more" per group) when `has_more` is true in search response — `frontend/src/pages/SearchPage.jsx`

**Checkpoint**: Searching a keyword returns grouped soldiers/events/countries. Clicking a country result navigates to the map with the side panel open.

---

## Phase 8: User Story 6 — Language Toggle (Priority: P6)

**Goal**: A global toggle switches the entire interface between English (LTR) and Hebrew (RTL). All text fields update instantly with no page reload. Any loaded AI content is cleared on switch.

**Independent Test**: On any page, click the language toggle → verify all visible text switches language → verify layout direction flips → verify any AI content panel resets.

- [ ] T054 [US6] Implement `LanguageToggle` component — renders EN/HE toggle button; calls `setLanguage` from `LanguageContext`; clears any displayed AI content by dispatching a `languageChange` event or via shared AI state reset — `frontend/src/components/Layout/LanguageToggle.jsx`
- [ ] T055 [US6] Wire `LanguageToggle` into `Layout` header — `frontend/src/components/Layout/Layout.jsx`
- [ ] T056 [US6] Audit all components that display text and replace hardcoded strings with language-aware field selection: use `language === 'he' ? field_he : field_en` pattern via `useLanguage` hook throughout `CountryPanel`, `SoldierPage`, `EventPage`, `TimelinePage`, `SearchPage` — all `frontend/src/` display components
- [ ] T057 [US6] Apply CSS logical properties throughout frontend stylesheets (replace `margin-left`/`padding-right`/`text-align: left` with `margin-inline-start`/`padding-inline-end`/`text-align: start`); use `.rtl` CSS class on root for MapLibre panel anchor side swap — `frontend/src/index.css`, all component `.css` files

**Checkpoint**: Toggle switches all text on any page instantly. Hebrew renders RTL. English renders LTR. No page reload occurs.

---

## Phase 9: AI Integration (FR-014, FR-015)

**Goal**: Each country panel, soldier biography, and event detail page has a "Get AI Context" button. When clicked, it generates a contextual explanation in the active UI language via Gemini API. AI never triggers automatically.

**Independent Test**: Open a soldier biography → click "Get AI Context" → verify AI text appears in the active language within 10 seconds → switch language → verify the AI panel resets → click again → verify new AI text is in the new language.

### Backend — AI Service

- [ ] T058 [US1] [US2] [US3] Implement `AIService.generateForCountry(countryId, language)` — fetches country name + soldier names + event titles from DB; assembles structured Gemini prompt written entirely in target language with system instruction "Respond only in [Hebrew/English]"; calls Gemini API; returns plain-text content — `backend/src/services/ai.service.js`
- [ ] T059 [US2] Implement `AIService.generateForSoldier(soldierId, language)` — fetches full soldier record from DB; assembles Gemini prompt in target language including name, biography, army/rank/role, participations, dates; returns plain-text content — `backend/src/services/ai.service.js`
- [ ] T060 [US3] Implement `AIService.generateForEvent(eventId, language)` — fetches event + country from DB; assembles Gemini prompt in target language; returns plain-text content — `backend/src/services/ai.service.js`
- [ ] T061 Implement Express routes: `POST /api/ai/country/:id`, `POST /api/ai/soldier/:id`, `POST /api/ai/event/:id` — validate `language` body field is `'en'` or `'he'` (400 if invalid), return 404 if entity not found, call appropriate `AIService` method, return `{ content, language, entity_type, entity_id }`, return 503 with `{ error: { code: 'AI_UNAVAILABLE', message: '...' } }` on Gemini error or timeout — `backend/src/routes/ai.route.js`
- [ ] T062 Register `/api/ai` router in Express app; load `GEMINI_API_KEY` from environment in `AIService` constructor — `backend/src/index.js`, `backend/src/services/ai.service.js`

### Frontend — AI Context UI

- [ ] T063 Implement `AIContextPanel` component — manages states: `idle` (shows "Get AI Context" button) → `loading` (spinner, button disabled) → `result` (displays AI text) → `error` (shows "AI context unavailable at this time", retry button); resets to `idle` when `language` in `LanguageContext` changes (clears stale language content); POSTs `{ language }` to the appropriate AI endpoint on button click — `frontend/src/components/AI/AIContextPanel.jsx`
- [ ] T064 Replace AI button placeholders in `CountryPanel`, `SoldierPage`, `EventPage` with `<AIContextPanel entityType="country|soldier|event" entityId={id} />` — `frontend/src/components/CountryPanel/CountryPanel.jsx`, `frontend/src/pages/SoldierPage.jsx`, `frontend/src/pages/EventPage.jsx`

**Checkpoint**: Clicking "Get AI Context" on any entity triggers generation, shows spinner, displays result in active language. Language switch resets the panel. No AI content appears without a button click.

---

## Phase 10: Polish & Edge Cases

**Purpose**: Responsive layout, empty/error states, mobile map panel, and environment hardening.

- [ ] T065 Implement mobile-responsive `CountryPanel` — on screens ≤768px the panel renders as a full-width slide-up overlay over the map with a visible close/back chevron; on desktop it remains a side panel alongside the map — `frontend/src/components/CountryPanel/CountryPanel.jsx`, CSS
- [ ] T066 [P] Add empty-state messages throughout: "No soldiers recorded for this country" (CountryPanel), "No events recorded for this country" (CountryPanel), "No results found — try different keywords" (SearchPage), all language-aware — relevant component files
- [ ] T067 [P] Add error boundary and loading skeleton for `MapContainer` initial load; add loading spinner to `SoldierPage`, `EventPage`, `TimelinePage` while fetching — relevant page files
- [ ] T068 Add startup environment variable validation in backend — on missing `DATABASE_URL` or `GEMINI_API_KEY`, log a clear error and exit with code 1 — `backend/src/config/env.js`, `backend/src/index.js`
- [ ] T069 [P] Add "Load more" cursor-pagination button to `CountryPanel` soldier list — calls `loadMoreSoldiers` from `useCountryData` hook, appends results, hides button when `hasMoreSoldiers` is false — `frontend/src/components/CountryPanel/CountryPanel.jsx`
- [ ] T070 Run quickstart.md end-to-end validation: verify `GET /api/countries`, `GET /api/soldiers/1`, `GET /api/events`, `GET /api/search?q=test`, `POST /api/ai/country/1` all return expected shapes; fix any contract mismatches — `backend/src/routes/`

---

## Dependencies & Execution Order

### Phase Dependencies

| Phase | Depends On | Can Parallelize? |
|-------|-----------|-----------------|
| Phase 1 — Setup | Nothing | T001–T005 all parallel |
| Phase 2 — Foundational | Phase 1 complete | T008–T013 migrations parallel after T006+T007 |
| Phase 3 — US1 (Map) | Phase 2 complete | Backend T018–T022 parallel with Frontend T024–T032 |
| Phase 4 — US2 (Soldier) | Phase 3 complete | T033–T035 parallel with T036 |
| Phase 5 — US3 (Event) | Phase 3 complete (parallel with Phase 4) | T039–T040 parallel with T041 |
| Phase 6 — US4 (Timeline) | Phase 5 complete | T043–T044 parallel with T045–T047 |
| Phase 7 — US5 (Search) | Phase 2 complete (parallel with Phase 6) | T048–T049 parallel with T050–T053 |
| Phase 8 — US6 (Language) | Phase 3 complete | T054–T057 largely parallel |
| Phase 9 — AI | Phases 4+5 complete (detail pages exist) | T058–T062 parallel with T063 |
| Phase 10 — Polish | All phases complete | T065–T069 parallel |

### User Story Dependencies

- **US1 (Map)** — no story dependencies; requires Foundation
- **US2 (Soldier)** — requires US1 (soldier list in panel must exist to link from)
- **US3 (Event)** — requires US1 (event list in panel); parallel with US2
- **US4 (Timeline)** — requires US3 (event detail page must exist); requires MapContext map ref (from US1)
- **US5 (Search)** — requires US1 + US2 + US3 (all detail pages must exist for result navigation)
- **US6 (Language)** — requires US1–US3 (must have content to switch language on); parallel with US4/US5
- **AI** — requires US1 + US2 + US3 (all entity pages must have the button placeholder wired)

---

## Parallel Execution Examples

```
# Phase 2 — run all migrations in parallel (different files):
T008  Create countries migration
T009  Create soldiers migration
T010  Create soldier_countries migration
T011  Create soldier_participations migration
T012  Create events migration
T013  Create media migration

# Phase 3 — backend and frontend in parallel (different codebases):
Developer A: T018 → T019 → T020 → T021 → T022 → T023  (Countries API)
Developer B: T024 → T025 → T026 → T027 → T028          (React context + homepage)
Developer C: T029 → T030 → T031 → T032                  (Map + Panel)

# Phase 4 + Phase 5 — run simultaneously:
Developer A: T033 → T034 → T035 → T036 → T037 → T038   (Soldier biography)
Developer B: T039 → T040 → T041 → T042                  (Event detail)
```

---

## Implementation Strategy

### MVP (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (migrations + seed)
3. Complete Phase 3: US1 (Countries API + Map + Panel)
4. **STOP AND VALIDATE**: Map loads → interactive countries highlight → click opens panel → soldiers and events lists appear
5. Demo or deploy MVP

### Incremental Delivery

| Increment | Deliverable | Validates |
|-----------|-------------|-----------|
| 1 | Setup + Foundation | DB schema correct |
| 2 | + US1 | Map works, panel opens |
| 3 | + US2 | Soldier biographies readable |
| 4 | + US3 | Event detail readable |
| 5 | + US4 | Timeline connected to map |
| 6 | + US5 | Search works across all entities |
| 7 | + US6 | Full bilingual + RTL |
| 8 | + AI | On-demand AI context |
| 9 | + Polish | Production-ready |

---

## Task Summary

| Phase | Tasks | User Story |
|-------|-------|-----------|
| Phase 1 — Setup | T001–T005 | — |
| Phase 2 — Foundation | T006–T017 | — |
| Phase 3 — Map Exploration | T018–T032 | US1 (P1) 🎯 |
| Phase 4 — Soldier Biography | T033–T038 | US2 (P2) |
| Phase 5 — Event Detail | T039–T042 | US3 (P3) |
| Phase 6 — Timeline | T043–T047 | US4 (P4) |
| Phase 7 — Search | T048–T053 | US5 (P5) |
| Phase 8 — Language Toggle | T054–T057 | US6 (P6) |
| Phase 9 — AI Integration | T058–T064 | US1+US2+US3 |
| Phase 10 — Polish | T065–T070 | Cross-cutting |
| **Total** | **70 tasks** | **6 user stories** |

---

## Notes

- `[P]` tasks have no shared file conflicts and can run in parallel within their phase
- Each user story phase produces an independently testable increment — stop and validate at every checkpoint
- No task introduces architecture, technology, or features beyond what is defined in `plan.md`, `spec.md`, `data-model.md`, and `contracts/api.md`
- Bilingual: every content render must use `language === 'he' ? field_he : field_en` — never hardcode one language
- AI: never trigger Gemini without an explicit user button click (FR-014, FR-015)
- Soldier `reference_code` must be included in all soldier API responses and displayed on `SoldierPage`
- Event dates: always use `start_date` + nullable `end_date`; never `event_date`
- Soldier↔Country: always query via `soldier_countries` join table with `relationship_types` array in response
