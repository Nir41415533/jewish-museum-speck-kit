# Execution Report — Design UI Polish

**Branch:** `task/design-ui-polish`
**Date:** 2026-05-11
**Status:** Complete — validated in live browser session

---

## Task Understanding

User request (outside the numbered task list): improve the visual design of the app.
Four explicit requirements gathered across the session:
1. Country detail opens as a **centered modal** over the map (not a side panel).
2. Inside the modal: **Events on the left**, **Soldiers on the right** (two-column layout).
3. Modal background must use the provided old-paper Unsplash texture.
4. Map must use a **modern map style** instead of the outdated demotiles base.

---

## Files Modified

### `frontend/src/components/CountryPanel/CountryPanel.jsx`
- Wrapped the entire component in a `.country-modal-backdrop` div that covers the map with a dark overlay (`rgba(10,5,0,0.6)`). Clicking the backdrop closes the modal.
- `.country-panel` is now a centered modal box that scales in from `0.88 → 1.0` with a spring easing (`cubic-bezier(0.34, 1.2, 0.64, 1)`).
- Body restructured into `.panel-columns` grid: **Events (left)** and **Soldiers (right)** as independent scrollable columns.
- Dates promoted above the event title so the timeline feel is immediate.
- Header uses Georgia serif for the country name to reinforce the historical document aesthetic.

### `frontend/src/components/CountryPanel/CountryPanel.css`
**Modal structure:**
- `.country-panel`: `background-image` set to the Unsplash old-paper URL, `background-size: cover`. No solid background color — paper texture is fully visible everywhere.
- `.panel-columns`: `display: grid; grid-template-columns: 1fr 1fr`. Each column is `background: transparent` so nothing blocks the texture.

**Ink-on-parchment color palette:**

| Element | Color | Rationale |
|---|---|---|
| Header background | `rgba(28, 16, 6, 0.88)` | Near-black warm brown — like a book cover |
| Header rule | `rgba(180, 130, 40, 0.7)` | Muted gold separator |
| Country name | `#f0e6cc` + Georgia serif | Aged cream type |
| Body text (names) | `#1e1008` + Georgia | Dark ink on paper |
| Meta text | `#5c3d20` | Mid-sepia |
| Date badges | `#7a4e10` | Warm sienna |
| Event cards | `rgba(255,248,225,0.45)` + amber left-border | Barely-there amber tint |
| Soldier cards | `rgba(235,245,255,0.35)` + navy left-border | Cool contrast from events |
| Section titles | `#6b3e10`, 0.6rem uppercase | Deep sienna ink |

**Cards** use 35–45% opacity backgrounds so the paper texture bleeds through each list item. Hover darkens the overlay and nudges the card 2px right.

**Scrollbars** styled to match: thin, sepia-colored, transparent track.

### `frontend/src/components/Map/MapContainer.jsx`
- Map style changed from `https://demotiles.maplibre.org/style.json` (outdated, basic) to `https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json` (CARTO Dark Matter).
- Dark Matter is a modern, sleek dark basemap (free, no API key) where the amber-gold interactive countries (`#c8871e`) glow against the near-black land mass.
- Added `country-fill-base` layer: faint warm tint on all countries at 10% opacity so geography is legible even for non-interactive nations.
- Added `country-border-interactive` line layer: `#8a5a08` 1.5px border drawn only around interactive countries.
- Hover color updated to bright gold `#f0d060` — crisp contrast against the amber resting state.

---

## Key Design Decisions

| Decision | Reason |
|---|---|
| Centered modal over side panel | User explicit request; keeps the full map visible and gives the detail a "document opening" feel |
| Paper texture as the only background | Fully transparent columns so the historical paper is the dominant visual — covering it with solid fills defeats the purpose |
| CARTO Dark Matter | Free, no API key, modern look; dark base makes amber countries glow; pairs well with the dark modal backdrop |
| Georgia serif for name + item text | Reinforces the aged-document metaphor; serif feels more archival than sans-serif |
| Spring easing on open (`cubic-bezier(0.34, 1.2, 0.64, 1)`) | Slight overshoot feels like a physical document being placed on the table |
| Events left / Soldiers right | Events = historical context (background); Soldiers = personal stories (foreground) — natural left-to-right reading hierarchy |

---

## What Was NOT Changed

- All API calls, data fetching, and pagination logic (`useCountryData.js`) — no behavioral changes.
- Language context / bilingual strings — all Hebrew/English labels preserved.
- All Phase 3 backend code — untouched.
- MapLibre layer IDs (`country-fill`, `country-fill-hover`) — kept stable so click/hover handlers still work without changes.
