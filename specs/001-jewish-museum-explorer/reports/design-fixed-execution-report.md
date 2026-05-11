# Execution Report — Design Fixes (design-fixed branch)

**Branch:** `design-fixed`
**Base:** `modal-fix`
**Date:** 2026-05-11
**Status:** Complete

---

## Task Understanding

Two user-reported visual problems fixed outside the numbered task list:

1. **Homepage video** — YouTube iframe shows its loading spinner and briefly flashes player chrome (thumbnail, play button) before autoplay kicks in.
2. **Map world repetition** — the map allowed horizontal scrolling far enough to see the same country duplicated side-by-side. A `maxBounds` attempt to fix it locked the camera entirely at low zoom levels, requiring a corrective follow-up commit.

---

## Files Modified

### `frontend/src/pages/HomePage.jsx`

- Added `useState` + `useEffect` imports (previously only `React` was imported).
- Added `curtainGone` boolean state, set to `false` on mount and flipped to `true` after 2800 ms via `setTimeout` inside `useEffect`.
- Added `<div className={`home-video-curtain${curtainGone ? ' gone' : ''}`} />` inside `.home-video-bg`, directly after the `<iframe>`. The curtain sits above the iframe but below the dark gradient overlay.

### `frontend/src/pages/HomePage.css`

Added `.home-video-curtain` and `.home-video-curtain.gone`:

```css
.home-video-curtain {
  position: absolute; inset: 0;
  background: #080400;   /* matches the dark overlay palette */
  z-index: 1;
  opacity: 1;
  transition: opacity 0.9s ease;
  pointer-events: none;
}
.home-video-curtain.gone { opacity: 0; }
```

The curtain is solid black while YouTube loads and fades out over 0.9 s once the video is playing. `pointer-events: none` ensures it never intercepts clicks on the page content above it.

### `frontend/src/components/Map/MapContainer.jsx`

- Added `renderWorldCopies: false` to the `maplibregl.Map` constructor options.
- Attempted (then removed) `maxBounds: [[-180, -85.051129], [180, 85.051129]]` — see decision log below.

---

## Key Decisions

| Decision | Reason |
|---|---|
| 2800 ms curtain delay | YouTube autoplay takes ~1–2 s on a normal connection; 2800 ms gives comfortable headroom before the fade starts |
| 0.9 s fade-out | Slow enough to feel intentional, fast enough to not feel like a loading bar |
| `renderWorldCopies: false` only (no `maxBounds`) | `maxBounds` set to world extents locked the camera at zoom levels where the whole world fits in the viewport — panning became impossible. `renderWorldCopies: false` alone stops tile repetition without constraining the camera. |

---

## What Was NOT Changed

- All YouTube embed parameters (`controls=0`, `mute=1`, `autoplay=1`, etc.) — unchanged.
- Map layers, hover logic, country click handlers — unchanged.
- All other pages and components — untouched.
