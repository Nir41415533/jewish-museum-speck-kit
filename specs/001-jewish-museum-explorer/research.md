# Research: Jewish Soldier Museum — WWII Interactive Explorer

**Phase**: 0 | **Date**: 2026-05-10 | **Branch**: `001-jewish-museum-explorer`

All technology choices are fixed by the planning input. This document resolves integration patterns and implementation unknowns for each fixed technology.

---

## 1. Bilingual Content Storage Strategy

**Decision**: Parallel language columns per table (`name_en`, `name_he`, `biography_en`, `biography_he`, etc.)

**Rationale**: The application has exactly two languages with no plans to add more. A parallel-column model keeps queries simple (no joins for language resolution), avoids a translation join table that would add query complexity across every content fetch, and maps directly to the bilingual field structure defined in the spec. The frontend simply reads the `_en` or `_he` variant based on active language.

**Alternatives considered**:
- JSONB `translations` column: flexible for N languages but over-engineered for a fixed two-language requirement; loses column-level indexing and type safety.
- Separate `translations` join table: correct for internationalisation systems but adds a join to every query in a museum app that only needs two languages.

---

## 2. PostgreSQL Full-Text Search

**Decision**: PostgreSQL native `tsvector` generated columns with a GIN index; separate vectors for English (`english` dictionary) and Hebrew (`simple` dictionary — no Hebrew-specific stemmer in stock PostgreSQL).

**Rationale**: The spec requires search across soldiers (name, biography) and events (title, description) with results returned in under 2 seconds. PostgreSQL `tsvector` with GIN indexes satisfies this for museum-scale datasets without an external search service. Hebrew lacks a built-in stemmer in PostgreSQL; using the `simple` dictionary (exact token matching) is appropriate — Hebrew text search by exact word or root is sufficient for name lookups and keyword queries.

**Implementation pattern**:
- `soldiers` table: generated column `search_vector_en tsvector GENERATED ALWAYS AS (to_tsvector('english', coalesce(name_en,'') || ' ' || coalesce(biography_en,''))) STORED`
- `soldiers` table: generated column `search_vector_he tsvector GENERATED ALWAYS AS (to_tsvector('simple', coalesce(name_he,'') || ' ' || coalesce(biography_he,''))) STORED`
- Same pattern for `events` on `title` + `description` fields
- Search query selects from both vectors (OR logic): a result matches if it appears in either language's vector for the search term

**Alternatives considered**:
- Elasticsearch / OpenSearch: unnecessary operational complexity for museum-scale data.
- `ILIKE` pattern matching: does not scale to thousands of records and cannot leverage GIN indexes.

---

## 3. MapLibre GL JS Integration with React

**Decision**: Wrap MapLibre GL JS instance in a `useRef` inside a `MapContainer` React component; manage map lifecycle with `useEffect` (initialise on mount, destroy on unmount). Map state (selected country, panel open) lives in `MapContext`, not inside MapLibre itself.

**Rationale**: MapLibre GL JS is an imperative library with its own DOM canvas. React's reconciler must not touch the map canvas. The ref-based pattern isolates the MapLibre instance from React's render cycle while still allowing React state changes (country selection, language switch) to drive imperative map API calls (e.g., `map.setFilter()`, `map.flyTo()`).

**Country layer strategy**:
- On app load, fetch `GET /api/countries` to get the list of interactive country codes.
- Load a world GeoJSON tileset as a `fill` layer.
- Apply a MapLibre `match` expression to the `fill-color` paint property: countries whose ISO code appears in the interactive list get the highlight colour; all others get the inactive colour.
- Apply a separate `fill-opacity` expression for hover state using MapLibre's `feature-state`.
- Map `click` event: check if the clicked feature's code is in the interactive list; if yes, update `MapContext` with the country ID.

**Timeline→Map sync**: When user selects a timeline event, call `map.flyTo({ center: [country.lng, country.lat], zoom: 4 })` and set the country as selected in `MapContext`. This triggers the side panel to open.

**Alternatives considered**:
- React-Map-GL wrapper library: adds an abstraction layer that conflicts with direct MapLibre GL JS API access needed for data-driven styling and event handling at this level of control.

---

## 4. Gemini API Integration

**Decision**: Backend-only integration. Frontend sends `POST /api/ai/[entity]/[id]` with `{ language: 'en' | 'he' }`. Backend fetches the entity's full data from PostgreSQL, assembles a structured prompt in the target language, calls the Gemini API, and returns `{ content: string, language: string }`.

**Prompt structure per entity type**:

- **Country prompt** (in target language): System instruction establishes museum context and tone. User turn provides: country name, list of associated soldiers (names only), list of associated events (title and date). Instructs Gemini to produce a 2–3 paragraph contextual summary of the country's WWII role relevant to Jewish soldiers. Language of prompt = language of expected response.

- **Soldier prompt** (in target language): System instruction establishes museum context. User turn provides: soldier's full name, birth/death dates and locations, army/rank/role, participations and decorations, biography text (in target language). Instructs Gemini to produce a 1–2 paragraph contextual narrative that situates the soldier's service within the broader WWII context.

- **Event prompt** (in target language): System instruction establishes museum context. User turn provides: event title, date, country, description (in target language). Instructs Gemini to produce a 1–2 paragraph contextual explanation of the event's historical significance.

**Language enforcement**: The prompt is written entirely in the target language. A system instruction explicitly states: "Respond only in [Hebrew/English]. Do not mix languages."

**Error handling**: If Gemini returns an error or times out (> 15s), the backend returns HTTP 503 with a structured error body. The frontend displays a fallback message ("AI context unavailable at this time") and resets the button to allow retry.

**No caching**: Per spec constraint (FR-015), AI content is not cached across sessions. Each button click produces a fresh Gemini call.

**Alternatives considered**:
- Frontend-direct Gemini call: exposes API key in browser. Rejected — all secrets must be in backend environment variables.
- Response caching per session: would violate FR-015 (not precomputed). Rejected.

---

## 5. RTL Layout Strategy

**Decision**: Set `dir` attribute on the root `<html>` element when language changes (`dir="rtl"` for Hebrew, `dir="ltr"` for English). Use CSS logical properties (`margin-inline-start`, `padding-inline-end`, `text-align: start`) throughout instead of directional properties (`margin-left`, `text-align: left`). Use a single global CSS class `.rtl` on the root for any cases that cannot use logical properties (e.g., absolute positioning, MapLibre panel anchor side).

**Rationale**: Setting `dir` on `<html>` is the W3C-recommended approach and propagates direction context to all child elements automatically, including browser-native elements (form inputs, scrollbars). CSS logical properties make the stylesheet direction-agnostic without duplicates. The language toggle updates `document.documentElement.dir` imperatively (not via React DOM, since it is outside the React root).

**Side panel direction**: On Hebrew, the country side panel anchors to the left edge of the map (RTL convention); on English, it anchors to the right. This is controlled by a CSS variable or class swap driven by the language context.

**Alternatives considered**:
- Separate RTL stylesheet: doubles maintenance burden. Rejected.
- CSS `transform: scaleX(-1)` mirroring: breaks text rendering and icons. Rejected.

---

## 6. Pagination Strategy for Soldiers

**Decision**: Cursor-based pagination using soldier `id` as the cursor. API accepts `?limit=20&after=<last_id>`. First page uses no cursor. Next-page cursor is the ID of the last returned soldier.

**Rationale**: The soldier dataset can grow to 1000+ records. Offset-based pagination (`LIMIT x OFFSET y`) degrades at high offsets because PostgreSQL must scan and discard rows. Cursor-based pagination using a sequential PK is O(log n) via the primary key index regardless of page depth. The spec requires initial list load < 3s; cursor pagination guarantees this.

**Frontend behaviour**: CountryPanel fetches page 1 on open. A "Load more" button at the bottom fetches the next cursor page and appends results. No full page reload.

**Alternatives considered**:
- Offset pagination: simpler but performance degrades for deep pages. Acceptable for small datasets but inconsistent with the spec's "large datasets" requirement.
- Infinite scroll: viable UX but adds complexity (IntersectionObserver + scroll state). Deferred — "Load more" button is simpler and equally valid per spec.

---

## 7. GeoJSON World Map Data

**Decision**: Use a standard world GeoJSON dataset (Natural Earth 110m or 50m resolution) bundled as a static file served from the backend or a CDN. Each GeoJSON feature must carry an `ISO_A3` property (ISO 3166-1 alpha-3 code) matching the `countries.code` column in PostgreSQL.

**Rationale**: MapLibre GL JS requires a GeoJSON source to render country polygons. Natural Earth is a public domain dataset with appropriate detail for a world map at zoom levels 2–6 (continent to country view). The `ISO_A3` code is the stable identifier linking map features to database records.

**Country filtering**: MapLibre's data-driven styling (paint `match` expression) is used to visually differentiate interactive countries — no client-side GeoJSON filtering needed. The full world GeoJSON loads once; only the paint style changes.
