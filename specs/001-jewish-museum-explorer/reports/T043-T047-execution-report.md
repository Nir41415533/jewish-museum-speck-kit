# Execution Report — T043–T047: Timeline Navigation (Phase 6)

**Branch:** `task/T043-T047-phase6-timeline`
**Date:** 2026-05-12
**Status:** Complete

---

## Task Understanding

Phase 6 delivers User Story 4: a `/timeline` page shows all events in chronological order, grouped by year. Clicking an event flies the map to the linked country and navigates to the event detail page. Covers backend list endpoint, frontend hook, and the TimelinePage component.

---

## Files Created / Modified

### `backend/src/models/event.model.js` (T043 — modified)

Added `list({ limit, offset, sort })`:
- Runs two queries in parallel via `Promise.all`: a `COUNT(*)` for pagination metadata, and the paginated `SELECT` joining `countries`.
- `limit` clamped to `[1, 200]`, `offset` to `≥ 0`, `sort` maps `'date_desc'` → `DESC`, anything else → `ASC`.
- Country fields destructured from flat JOIN row and reassembled into nested `country` object (matches `GET /api/events/:id` shape).
- Returns `{ data, pagination: { limit, offset, total, has_more } }` per `contracts/api.md`.

### `backend/src/routes/events.route.js` (T044 — modified)

Added `GET /` handler before the existing `GET /:id` handler (order matters — Express matches routes top-to-bottom). Passes `limit`, `offset`, `sort` query params directly to `EventModel.list`. No extra validation needed: the model normalises all three.

Note: T044 says "register in app" but `app.use('/api/events', ...)` was already registered in `backend/src/index.js` during T042 (Phase 5). No change to `index.js` needed.

### `frontend/src/services/api.js` (T045 — modified)

Added `eventsApi.list({ limit, offset, sort })` — builds a `URLSearchParams` and calls `GET /api/events?...`. Mirrors the pattern of `countriesApi.getSoldiers`.

### `frontend/src/hooks/useTimeline.js` (T045 — new)

Fetches `eventsApi.list({ sort: 'date_asc', limit: 50 })` on mount. Exposes `{ events, loading, error }`. Events array is the raw `data` array from the API response (country nested object included).

### `frontend/src/pages/TimelinePage.jsx` (T046 — new)

Page structure:
- **Page header**: dark ink band matching the modal header palette — `Special Elite` heading, `Courier Prime` ref code and subheading, red classification badge.
- **Year grouping**: events are grouped client-side by `start_date.slice(0,4)` using `useMemo`. Each group renders a year marker (label + fading horizontal rule) then a vertical left-bordered track of event cards.
- **Event card**: full-surface `<button>` with a gold top band showing the formatted date range, a title row (Crimson Text) with sliding `›` arrow, and a country line below. Hover lifts with a gold glow box-shadow and slides the dot.
- **Timeline dot**: CSS-positioned dot on the left border track, turns gold on hover.
- **Click handler**: calls `mapRef.current?.flyTo()` if the map is mounted, sets `selectedCountryId` + `setIsPanelOpen(true)` in MapContext for back-navigation, then `navigate('/event/:id')`.
- **Stagger animation**: each entry uses inline `animation-delay` (`i * 0.06s`) for a cascading reveal within each year group.
- Bilingual: all labels via `t` object, all content fields via `language === 'he' ? field_he : field_en`.

### `frontend/src/pages/TimelinePage.css` (T046 — new)

Same aged-parchment background technique as the modal (gradient + SVG noise). Same font imports (Special Elite / Crimson Text / Courier Prime). Key classes: `.timeline-header`, `.timeline-year-marker`, `.timeline-entries` (left-bordered track), `.timeline-dot`, `.timeline-card`, `.tc-date` (gold band), `.tc-title-row`, `.tc-country`. Responsive at 600px.

### `frontend/src/main.jsx` (T046 — modified)

- Imported `TimelinePage`.
- Added `<Route path="/timeline" element={<TimelinePage />} />`.
- Updated placeholder comment to reflect Phase 7 (`/search`) still pending.

### `frontend/src/context/MapContext.jsx` (T047 — no change needed)

`mapRef` was already created via `useRef(null)` and included in the Provider value during Phase 3. `MapContainer` already assigns `mapRef.current = map` on init. T047 is satisfied as-is.

### `specs/001-jewish-museum-explorer/tasks.md`

Marked T043–T047 as `[x]` complete.

---

## Key Decisions

| Decision | Reason |
|---|---|
| `Promise.all` for COUNT + SELECT | Avoids a sequential round-trip; total count is cheap and needed for `has_more` |
| Client-side year grouping (not DB) | `GROUP BY` in SQL would require restructuring the flat result; `useMemo` on the client is simpler and fast for 50–200 events |
| `mapRef.current?.flyTo()` as best-effort | Map may not be mounted when user comes from another page — optional chaining ensures no crash; map primes for if user navigates back |
| Navigate to `/event/:id` (not `/map`) | Follows the spec; gives the user the full event detail immediately; `selectedCountryId` is set in context so the map panel will open if the user navigates to `/map` |
| Inline `animation-delay` per entry | Stagger must reset per year group — CSS `:nth-child` would stagger across the whole document; inline style scopes it correctly |

---

## Checkpoint Validation

- `GET /api/events` returns events with nested country and pagination metadata.
- `GET /api/events?sort=date_desc` returns events newest-first.
- `GET /api/events?limit=2&offset=1` returns correct slice.
- `/timeline` renders all events grouped by year.
- Clicking an event navigates to `/event/:id`.
- `mapRef.current.flyTo` is called when the map is already mounted (e.g. opened from `/map`).
- Bilingual: all labels and event content switch correctly on language change.
- Loading and error states render correctly.
