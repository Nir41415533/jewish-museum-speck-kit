# Execution Report — Fix: HomePage SearchBar + Timeline Years

**Branch:** `fix/homepage-search-timeline-data`
**Base:** `main`
**Date:** 2026-05-12
**Status:** Complete

---

## Fix 1 — Hide SearchBar on the Home Page

### Root cause
`SearchBar` was rendered unconditionally inside `Layout.jsx`, which wraps
every route. On the home page (`/`) the search bar has no useful context —
clicking a result navigates to `/map` but the user is already on the
homepage with no map in view.

### Change — `frontend/src/components/Layout/Layout.jsx`

Added `useLocation` from react-router-dom and conditionally render
`<SearchBar />` only when the current route is not `/`:

```jsx
const { pathname } = useLocation();
// In the header:
{pathname !== '/' && <SearchBar />}
```

No CSS changes required.

---

## Fix 2 — Timeline Showing Only 1939 and 1940

### Root cause
The live database (populated by the SQLite migration) contains **607 events**
spanning 1939–1945 (48 in 1939, 102 in 1940, 120 in 1941, …). The
`useTimeline` hook fetched with `limit: 50`, returning only events from 1939
and the first two from 1940. Every other year was invisible.

The previous seed.js only had 4 events, but the SQLite migration had
already populated the full 607-event dataset.

### Solution — lazy-loading timeline architecture

Rather than just bumping the limit (loading 607 events upfront), the
timeline now loads in two phases:

**Phase 1 — year index (on mount)**
- New endpoint: `GET /api/events/years`
- Returns `[{ year: 1939, count: 48 }, { year: 1940, count: 102 }, …]`
- Renders all 7 year buttons immediately with correct event counts
- No pagination issue: there are only 7 distinct years

**Phase 2 — events per year (on click)**
- New query param: `GET /api/events?year=YYYY`
- Fetched once per year when the user expands a year row
- Result cached in `eventsByYear` state — no re-fetch on collapse/re-open
- Limit raised to 500 for per-year queries (largest year has 120 events)

### Files changed

| File | Change |
|---|---|
| `backend/src/models/event.model.js` | Added `listYears()` query; added `year` filter param to `list()`; raised per-query limit cap from 200 → 500 |
| `backend/src/routes/events.route.js` | Added `GET /years` route (before `/:id`); pass `year` query param to `list()` |
| `frontend/src/services/api.js` | Added `eventsApi.listYears()` and `eventsApi.listByYear(year)` |
| `frontend/src/hooks/useTimeline.js` | Rewritten: fetches years on mount, exposes `loadYear(year)` callback |
| `frontend/src/components/Timeline/TimelineSidebar.jsx` | Uses new hook shape: shows year+count from index, fetches events on toggle |

### Migration 007 — expanded WWII data

`backend/src/db/migrations/007_expand_wwii_events.sql` was added to
handle the case where someone runs this on a DB that was **not** populated
by the SQLite migration (e.g., a fresh install from seed only):

- Adds 5 new countries: France, Soviet Union, Norway, Greece, Italy
- Adds 6 new events spanning 1940–1945 (Fall of France, Battle of Britain,
  Operation Barbarossa, Battle of Stalingrad, Liberation of Rome, VE Day)
- Both insertions are idempotent — countries use `ON CONFLICT (code) DO NOTHING`,
  events use `WHERE NOT EXISTS (SELECT 1 FROM events WHERE title_en = ?)`

`backend/src/db/seed.js` updated to match (8 countries, 10 events) for
fresh DB setups.

The migration was applied to the live database and verified:
```
1939: 48 events
1940: 102 events
1941: 120 events
1942: 102 events
1943: 90 events
1944: 95 events
1945: 50 events
```
