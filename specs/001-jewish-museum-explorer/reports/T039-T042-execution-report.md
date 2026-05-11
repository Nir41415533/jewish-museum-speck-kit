# Execution Report — T039–T042: Historical Event Detail View (Phase 5)

**Branch:** `task/T039-T042-phase5-event-detail`
**Date:** 2026-05-11
**Status:** Complete

---

## Task Understanding

Phase 5 delivers User Story 3: clicking an event title in the country modal opens a full event detail page at `/event/:id`. Covers backend model + route, the EventPage, registering the router, and wiring the event link in CountryPanel.

---

## Files Created / Modified

### `backend/src/models/event.model.js` (T039 — new)
`findById(id)` runs two queries:
1. `events LEFT JOIN countries` — gets all event fields plus the full country object in one round-trip (country is always a single row so a JOIN is correct here, unlike soldiers where countries is a many-to-many array).
2. `media WHERE entity_type='event'` — fetched separately, ordered by `display_order`.

Country fields are destructured from the flat JOIN row and reassembled into a nested `country` object matching the API contract shape. Returns `null` when the event row is not found.

### `backend/src/routes/events.route.js` (T040 — new)
Single route `GET /:id`. Non-numeric ids and missing events both return 404 via the shared `errors.notFound` helper. Pattern mirrors `soldiers.route.js`.

### `backend/src/index.js` (T042 — modified)
Added: `app.use('/api/events', require('./routes/events.route'));`
Removed the `// T044` placeholder comment (T044 adds `GET /api/events` list endpoint in Phase 6 — same file, same router).

### `frontend/src/pages/EventPage.jsx` (T041 — new)
Fetches `GET /api/events/:id` on mount. Three states: loading, `not_found` (404), generic error — all with back-to-map link.

Page layout (consistent dossier style, distinct amber-brown palette):
- **Header**: warm brown gradient (`#3d1a00 → #8a4018`) with amber bottom rule — differentiated from SoldierPage's navy to give events their own visual identity.
- **Date badge**: prominent gold stamp showing `start_date` alone or `start_date – end_date` when both present.
- **Country**: `📍 country name` in gold — single linked country from the JOIN.
- **Description**: Georgia serif, generous line-height.
- **MediaViewer**: reuses the shared component from Phase 4.
- **AI placeholder**: same disabled dashed-border button pattern as SoldierPage.

### `frontend/src/pages/EventPage.css` (T041 — new)
Brown-amber header gradient to visually distinguish event pages from soldier pages (navy). Otherwise consistent museum palette: `#c8871e` amber accents, `#f0ebe0` warm background, Georgia for body text. Responsive at 600px.

### `frontend/src/services/api.js` (T041 — modified)
Added `eventsApi` export: `{ getById: (id) => request('/events/' + id) }`.

### `frontend/src/main.jsx` (T041 — modified)
Added `<Route path="/event/:id" element={<EventPage />} />`.
Updated placeholder comment to reflect Phase 6+ routes still pending.

### `frontend/src/components/CountryPanel/CountryPanel.jsx` (T042 — modified)
Replaced static `<span className="item-name">` for event titles with `<Link to={'/event/' + e.id} className="item-name item-link">`. The existing `.item-link` CSS (amber on hover) applies automatically.

### `specs/001-jewish-museum-explorer/tasks.md`
Marked T039–T042 as `[x]` complete.

---

## Key Decisions

| Decision | Reason |
|---|---|
| JOIN for country (not separate query) | Events have exactly one country; a JOIN avoids a second round-trip and keeps the model simple |
| Brown-amber header vs navy (SoldierPage) | Gives the two detail page types distinct visual identities while sharing the same overall museum palette |
| Reuse `MediaViewer` from Phase 4 | Spec says both soldier and event pages share the same media rendering logic — no duplication |
| `end_date` renders only when non-null | Spec requirement: show single date when `end_date` is null; show range when both present |
| Same router file for T040 + T044 | T044 (Phase 6) adds `GET /api/events` list to the same router — registered once in index.js |

---

## Checkpoint Validation

- `GET /api/events/1` returns full event JSON with nested `country` object and `media` array.
- `GET /api/events/999` returns `404 { error: { code: "NOT_FOUND" } }`.
- Navigating to `/event/1` renders the event detail page with date badge, title, country, description.
- Navigating to `/event/999` renders "Event not found" with back link.
- Event titles in the country modal are now clickable links (amber on hover).
- Page renders correctly when `end_date` is null (single date shown).
- Page renders correctly when `media` array is empty (MediaViewer renders nothing).
- Bilingual: title, description, country name all switch correctly between English and Hebrew.
