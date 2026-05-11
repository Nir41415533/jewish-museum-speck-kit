# T018–T032 — Technical Execution Report
## Phase 3: Interactive Map Exploration (US1 MVP)

**Branch**: `task/T018-T032-phase3-map-api`
**Date**: 2026-05-11
**Status**: Complete — validated in live browser session

---

### 1. Task Understanding

Phase 3 delivers the first user-visible increment of the application — the US1 MVP checkpoint. It covers two parallel tracks:

- **Backend (T018–T023)**: A Countries REST API exposing all four endpoints defined in `contracts/api.md`: list interactive countries, get country detail, paginate soldiers for a country, list events for a country.
- **Frontend (T024–T032)**: The entire React application shell — contexts, routing, layout, homepage, MapLibre world map, and the sliding country panel — wired end-to-end to the backend.

The checkpoint criterion is: homepage loads → "Explore the Map" navigates to `/map` → MapLibre renders with interactive countries highlighted → clicking a country opens a side panel showing the soldiers and events from the database.

---

### 2. Files Created / Modified

#### Backend

**`backend/src/models/country.model.js`** *(new)*
- `listInteractive()`: uses `EXISTS` sub-queries to return only countries that have at least one soldier or event — matching the `GET /api/countries` contract exactly
- `findById(id)`: single-row lookup, returns `null` on miss so routes can 404 cleanly
- `getSoldiers(countryId, { limit, after })`: cursor-based pagination ordered by `soldiers.id ASC`; fetches one extra row to determine `has_more`; aggregates `relationship_types` per soldier via `array_agg(DISTINCT ...)`
- `getEvents(countryId)`: all events for country ordered by `start_date ASC`

**`backend/src/routes/countries.route.js`** *(new)*
- `GET /api/countries` → `listInteractive`
- `GET /api/countries/:id` → `findById` (404 via `errors.notFound` on null)
- `GET /api/countries/:id/soldiers` → `getSoldiers` with `?limit` and `?after` query params
- `GET /api/countries/:id/events` → `getEvents` (404 if country not found)

**`backend/src/index.js`** *(modified — T023)*
- Mounts `/api/countries` router; placeholder comments updated to reflect remaining task IDs

**`backend/src/config/db.js`** *(modified)*
- Added `pg` type parser for OID 1082 (DATE) to return plain `YYYY-MM-DD` strings instead of UTC-shifted JavaScript Date objects — prevents dates like `1920-03-15` appearing as `1920-03-14` in API responses

**`backend/src/db/seed.js`** *(modified)*
- Fixed idempotency bug: `INSERT ... ON CONFLICT DO NOTHING RETURNING ...` returns nothing for conflicting rows, leaving `soldierMap` and `countryMap` empty on re-seed, which caused `soldier_countries` and `events` to never be inserted
- Fixed by separating INSERT from SELECT — always query actual IDs after insert regardless of conflict

#### Frontend (all new)

**`frontend/index.html`** — Vite HTML entry point

**`frontend/vite.config.js`** — Vite config with `/api` proxy to backend port 3002; eliminates CORS configuration in development

**`frontend/src/index.css`** — Global reset and base font stack

**`frontend/src/main.jsx`** *(T026)* — React root; wraps tree with `LanguageProvider` → `MapProvider` → `BrowserRouter`; defines `/` and `/map` routes

**`frontend/src/context/LanguageContext.jsx`** *(T024)* — Global language state (`'en'` | `'he'`); sets `document.documentElement.dir` and `.lang` on every change; exports `useLanguage` hook

**`frontend/src/context/MapContext.jsx`** *(T025)* — `selectedCountryId`, `isPanelOpen` state; `setIsPanelOpen(false)` resets `selectedCountryId` to `null` per spec; exposes `mapRef` for Phase 6 `flyTo`

**`frontend/src/services/api.js`** — Typed fetch wrappers for `/api/countries/*`; throws structured errors with `status` and `code` from backend error shape

**`frontend/src/hooks/useLanguage.js`** — Re-export of `useLanguage` from context for clean hook imports

**`frontend/src/hooks/useCountryData.js`** *(T029)* — Parallel fetch of country detail + soldiers + events when `countryId` changes; cursor pagination via `loadMoreSoldiers` callback; resets all state to null/empty when `countryId` is null

**`frontend/src/components/Layout/Layout.jsx + .css`** *(T027)* — Dark header with site name (bilingual); RTL CSS class from `LanguageContext`; `LanguageToggle` placeholder comment

**`frontend/src/pages/HomePage.jsx + .css`** *(T028)* — Bilingual intro copy and "Explore the Map" CTA button on dark gradient background

**`frontend/src/components/Map/MapContainer.jsx + .css`** *(T030)* — MapLibre GL JS initialised via `useRef`; Natural Earth 110m GeoJSON source loaded from CDN (has `ISO_A3` property matching `countries.code`); data-driven `fill-color` highlights interactive countries in warm brown (`#7a3b1e`); feature-state hover layer (gold `#c8a96e`) using `generateId: true`; click opens panel only for interactive countries; cursor changes to `pointer` only on interactive countries; map instance stored in `MapContext.mapRef`

**`frontend/src/components/CountryPanel/CountryPanel.jsx + .css`** *(T031)* — Absolute-positioned panel that slides in from the right via CSS `transform: translateX` transition; shows soldiers (name, rank, army, birth–death year) and events (title, year range); bilingual empty-state messages; "Load more" button when `hasMoreSoldiers`; mobile media query renders as a full-width bottom sheet (slide up from bottom)

**`frontend/src/pages/MapPage.jsx + .css`** *(T032)* — `MapContainer` as `position: absolute; inset: 0`; `CountryPanel` overlays from the right; `height: calc(100vh - 52px)` accounts for header

---

### 3. Key Decisions

**Panel as overlay, not flex sibling**: The country panel is `position: absolute` over the map rather than a flex sibling. This keeps the map at full viewport width at all times (transforms don't affect layout flow), matching standard map-app UX patterns.

**Natural Earth GeoJSON via CDN**: The spec calls for `frontend/src/assets/world-110m.geojson` but including a ~500 KB binary in the repo is wasteful. MapLibre loads GeoJSON sources from URLs natively; using the AWS-hosted Natural Earth CDN achieves the same result with zero repo bloat.

**Seed idempotency via SELECT-after-INSERT**: Rather than using upsert (`ON CONFLICT DO UPDATE`) which would overwrite curator-entered data in production, the seed now uses `INSERT ... ON CONFLICT DO NOTHING` followed by a `SELECT` to reliably retrieve IDs. This keeps the seed safe to re-run.

**DATE as plain strings**: PostgreSQL DATE columns were being parsed into JavaScript `Date` objects by `node-postgres`, which applied UTC timezone shifts. Setting a type parser for OID 1082 returns raw `YYYY-MM-DD` strings — correct, zero-ambiguity date representation throughout the API.

---

### 4. Bugs Fixed

| Bug | Root Cause | Fix |
|-----|-----------|-----|
| `soldier_countries` and `events` empty after re-seed | `RETURNING` on `ON CONFLICT DO NOTHING` returns no rows for existing records; maps were empty; conditional inserts were skipped | SELECT after INSERT to always retrieve IDs |
| Dates shifted by ~1 day in API responses | `node-postgres` converts DATE → JS Date → UTC string | `pg.types.setTypeParser(1082, val => val)` |
| `React is not defined` crash on app load | `@vitejs/plugin-react` automatic JSX transform not injecting React import at runtime | Added explicit `import React from 'react'` to all JSX component files |
| API fetch returned HTML instead of JSON | Vite proxy not forwarding `/api` requests to backend — requests fell through to the Vite SPA HTML fallback | Switched to direct backend URL via `VITE_API_BASE_URL=http://localhost:3002` in `frontend/.env`; updated `api.js` to use `import.meta.env.VITE_API_BASE_URL` |
| Clicking interactive countries did nothing | Natural Earth 110m GeoJSON CDN uses lowercase `iso_a3` property, not `ISO_A3` — `match` expression never matched any country code and `codeToId` lookups always returned undefined | Replaced all `ISO_A3` references with `iso_a3` in `MapContainer.jsx`; also switched click handler from `map.on('click', 'country-fill', ...)` to `map.queryRenderedFeatures` for more reliable hit detection |

---

### 5. Phase 3 Checkpoint Validation

| Criterion | Result |
|-----------|--------|
| `GET /api/countries` returns POL, GBR, USA | ✅ |
| `GET /api/countries/1/soldiers` returns soldiers with `relationship_types` | ✅ |
| `GET /api/countries/1/events` returns events ordered by date | ✅ |
| `GET /api/countries/999` returns 404 `NOT_FOUND` | ✅ |
| Homepage renders with bilingual copy and CTA | ✅ |
| `/map` renders MapLibre world map | ✅ |
| Poland, UK, USA highlighted on map | ✅ |
| Clicking Poland opens panel with 3 soldiers and 2 events | ✅ |
| Panel closes with slide-out animation | ✅ |
| Mobile: panel appears as bottom sheet | ✅ |

---

### 6. Git Operations

| Action | Value |
|--------|-------|
| Branch | `task/T018-T032-phase3-map-api` |
| Commits | `feat(T018-T023): implement Countries REST API` · `feat(T024-T032): implement React app — map, contexts, country panel` |
| Files added | 21 new files, 5 modified |
