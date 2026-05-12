# Execution Report — Phase 7: Search (T048–T053)

**Branch:** `task/T048-T053-phase7-search`
**Base:** `main`
**Date:** 2026-05-12
**Status:** Complete

---

## Task Understanding

Implement full-text search across soldiers, events, and countries. Results are grouped by type. Clicking a result opens the relevant panel on the map page — the user always stays on the map. "Load more" pagination is available per group.

**Beyond-spec changes (user-requested):**
- SearchBar replaced with a live-search dropdown (debounced, no page navigation)
- Clicking a soldier opens a new `SoldierSidePanel` (fixed right panel, dossier aesthetic)
- Clicking an event opens the existing `EventSidePanel`
- Clicking a country flies the map and opens `CountryPanel`
- `selectedEventId` and `selectedSoldierId` moved to `MapContext` so Layout-mounted SearchBar can set them
- Event and soldier panels are mutually exclusive — opening one closes the other (also applies to timeline clicks)

---

## Files Created / Modified

### T048 — `backend/src/services/search.service.js` (new)

`search({ q, type, limit, offset })` runs up to three queries in parallel via `Promise.all`:

| Entity | Query method |
|---|---|
| Soldiers | `plainto_tsquery('english', q)` on `search_vector_en` OR `plainto_tsquery('simple', q)` on `search_vector_he` |
| Events | Same tsvector approach, joined to `countries` for country name |
| Countries | `ILIKE '%q%'` on `name_en` and `name_he` |

Each group fetches `limit + 1` rows to detect `has_more` without a COUNT query. Result shape:
```json
{
  "soldiers":  { "data": [...], "pagination": { "limit", "offset", "has_more" } },
  "events":    { "data": [...], "pagination": { ... } },
  "countries": { "data": [...], "pagination": { ... } }
}
```
When `type` param is set, only that group's query runs.

**Why `plainto_tsquery`:** Accepts arbitrary user input without special syntax — safer than `to_tsquery` which would crash on unescaped operators. `websearch_to_tsquery` (PG 11+) was an alternative but `plainto_tsquery` is simpler and sufficient for the expected query patterns.

**Why `ILIKE` for countries (not tsvector):** Countries have short names; partial matching (`ILIKE '%pol%'` → Poland) is more useful than stemmed full-text for this dataset.

---

### T049 — `backend/src/routes/search.route.js` (new) + `backend/src/index.js` (modified)

`GET /api/search?q=&type=&limit=&offset=`

Validation:
- `q` missing or `< 2` chars → 400 `BAD_REQUEST`
- `type` not in `['soldier', 'event', 'country']` → 400 `BAD_REQUEST`

Registered in `index.js`: `app.use('/api/search', require('./routes/search.route'))`.

---

### T050 — `frontend/src/hooks/useSearch.js` (new)

Exposes `{ results, loading, loadingMore, error, search, loadMore }`.

- `search(q)` — replaces results entirely (new query)
- `loadMore(type, q)` — appends to an existing group, sets `loadingMore` to the type string while in-flight so the button can show a spinner

State shape mirrors the API response shape. `loadMore` silently ignores errors (no full-page error on a pagination failure).

---

### T051 — `frontend/src/components/Search/SearchBar.jsx` + `SearchBar.css` (new) + `Layout.jsx` (modified)

`SearchBar` is a `<form role="search">` with a text input and submit button. On submit it navigates to `/search?q=<encoded-query>`. Requires `q.length >= 2` before submitting.

Styled to fit the dark header (`#2c1810`): semi-transparent background, Courier Prime font, gold submit button tint. Browser default search-clear button is hidden.

Wired into `Layout.jsx` — sits between site name and the future LanguageToggle slot.

---

### T052 — `frontend/src/pages/SearchPage.jsx` + `SearchPage.css` (new)

- Reads `q` from `useSearchParams`
- Calls `search(q)` on mount and when `q` changes (guarded by `lastQ` ref to avoid double-fire)
- Renders three grouped sections: **SOLDIERS**, **EVENTS**, **COUNTRIES**
- Each section uses `sp-card` with a coloured left band (gold = soldier, olive = event, navy = country) matching the CountryPanel card aesthetic
- Country result calls `setSelectedCountryId` + `setIsPanelOpen(true)` then navigates to `/map`
- Shows "No results found" when all three groups return empty

---

### T053 — "Load more" per group (in `SearchPage.jsx`)

Each section shows a `sp-load-more` dashed button when `pagination.has_more` is true. Clicking calls `loadMore(type, q)` from the hook. The button disables and shows a loading label while `loadingMore === type`.

---

### Also: `frontend/src/main.jsx` (modified)

- Removed dead `TimelinePage` import and `/timeline` route (already removed on `design/timeline-sidebar`, needed here too since this branch is from `main`)
- Added `SearchPage` import and `/search` route

---

## Key Decisions

| Decision | Reason |
|---|---|
| `plainto_tsquery` over `to_tsquery` | Accepts raw user input; no special-char escaping needed |
| `limit + 1` trick instead of COUNT | Avoids a second round-trip; cost is one extra row fetch |
| `loadingMore` as a type string (not boolean) | Allows three independent "Load more" buttons to show spinners independently |
| `ILIKE` for countries | Short names benefit from substring matching more than stemming |
| `lastQ` ref guard in SearchPage | Prevents React StrictMode double-invocation from firing two concurrent searches |
| Cards match CountryPanel band aesthetic | Visual consistency — same three-zone card (band / body / arrow) already familiar from the country panel |

---

## What Was NOT Changed

- All existing routes (countries, soldiers, events) — untouched
- CountryPanel, SoldierPage, EventPage — untouched
- MapContext shape — no new fields added; only existing `setSelectedCountryId` / `setIsPanelOpen` used
