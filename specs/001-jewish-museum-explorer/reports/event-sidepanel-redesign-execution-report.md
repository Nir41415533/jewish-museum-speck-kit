# Execution Report — EventSidePanel Redesign (design/timeline-sidebar branch)

**Branch:** `design/timeline-sidebar`
**Date:** 2026-05-12
**Status:** Complete

---

## Task Understanding

The EventSidePanel is a 300px right-side panel that slides in when a timeline event is clicked. The original implementation delegated rendering to the shared `EventDetail.jsx` component, giving it a generic look that didn't match the dossier aesthetic of the rest of the app.

**Requested fix:** Make it feel like a proper historical document card — a bespoke "Declassified Field Report" — with more visual hierarchy, better spacing, and archival document feel.

**Aesthetic direction:** *Classified Field Record* — the panel is a physical document being placed on the desk. It slides and rotates into view (`espDrop` animation), has a typewriter reference code in the header, a perforated left binding edge, a DECLASSIFIED watermark behind the content, and typewritten form labels above each data zone.

---

## Files Modified

### `frontend/src/components/Timeline/EventSidePanel.jsx`

Fully rewritten to render content directly (previously delegated to `EventDetail.jsx`). New structure:

**Header bar** — dark ink band (`#1a0e06`) with hatch overlay via `::after`:
```jsx
<div className="esp-header">
  <div className="esp-header-left">
    <span className="esp-ref">EVT-{String(eventId).padStart(4, '0')}</span>
    <span className="esp-badge">FIELD RECORD</span>
  </div>
  <button className="esp-close" onClick={onClose}>✕</button>
</div>
```

**Date band** — gold-tinted band with "DATE OF RECORD" label (typewritten style):
```jsx
<div className="esp-date-band">
  <span className="esp-date-field-label">DATE OF RECORD</span>
  <span className="esp-date-value">{startDate}{ endDate && <> &ndash; {endDate}</> }</span>
</div>
```

**Title section** — "SUBJECT" label injected via CSS `::before`, Crimson Text title, 📍 location:
```jsx
<div className="esp-title-section">
  <h2 className="esp-title">{title}</h2>
  {country && <p className="esp-location"><span className="esp-pin">📍</span>{country}</p>}
</div>
```

**Content sections** — each section gets a Courier Prime all-caps label:
- `ACCOUNT` → description paragraph with `text-indent: 1.2em` for archival document feel
- `DOCUMENTATION` → MediaViewer
- AI placeholder button (disabled, dashed border)

**No logic changes** — fetching (`eventsApi.getById`), language switching, and loading/error states are unchanged. Only the rendered JSX structure changed.

---

### `frontend/src/components/Timeline/EventSidePanel.css`

Completely rewritten. Key design decisions:

**Panel shell:**
- Aged parchment background: `linear-gradient(175deg, #ede8d4, #ddd0b2, #d0c09a)` with inline SVG `feTurbulence` noise overlay (same technique used in `CountryPanel`)
- `border-left: 4px solid #7a5820` (folder edge brown)
- `box-shadow: -6px 0 28px rgba(0,0,0,0.28)` — separates from map

**`espDrop` entrance animation:**
```css
@keyframes espDrop {
  from { transform: translateX(40px) rotate(0.6deg); opacity: 0; }
  to   { transform: translateX(0)    rotate(0deg);   opacity: 1; }
}
```
The 0.6° rotation gives the feel of placing a physical document.

**Punch-hole left binding edge (`esp-panel::before`):**
```css
background: repeating-linear-gradient(
  to bottom,
  #7a5820 0px, #7a5820 12px,
  #4a3010 12px, #4a3010 14px,
  ...
);
```
Simulates the binding edge of a physical dossier folder.

**DECLASSIFIED watermark (`esp-body::before`):**
```css
content: 'DECLASSIFIED';
position: sticky;
top: 38%;
font-family: 'Special Elite', monospace;
color: rgba(140, 21, 21, 0.07);
border: 3px solid rgba(140, 21, 21, 0.06);
transform: rotate(-12deg);
```
Uses `position: sticky` so it stays visible while scrolling but never overlaps content (z-index 0, content at z-index 1).

**`SUBJECT` form label via CSS `::before`:**
```css
.esp-title-section::before {
  content: 'SUBJECT';
  font-family: 'Courier Prime', monospace;
  font-size: 0.44rem;
  letter-spacing: 0.3em;
  color: #3a472c; /* military olive */
}
```
No extra DOM node needed.

**Description typography:**
```css
.esp-description {
  font-family: 'Crimson Text', serif;
  font-size: 0.9rem;
  line-height: 1.85;
  text-indent: 1.2em; /* archival paragraph indent */
}
```

**Staggered content reveal (`espFadeUp`):**
```css
.esp-date-band    { animation: espFadeUp 0.2s 0.05s ease both; }
.esp-title-section{ animation: espFadeUp 0.2s 0.1s  ease both; }
.esp-perf-rule    { animation: espFadeUp 0.2s 0.14s ease both; }
.esp-section      { animation: espFadeUp 0.2s 0.18s ease both; }
.esp-section + .esp-section { animation-delay: 0.22s; }
```

---

## Key Decisions

| Decision | Reason |
|---|---|
| `translateX + rotate` drop animation | Feels like placing a physical document rather than a UI panel sliding in |
| Punch-hole left edge via `::before` | Reinforces the "folder in a binder" metaphor without any extra DOM nodes |
| `DECLASSIFIED` via `position: sticky` | Watermark stays centred in view as user scrolls — adds intrigue without obscuring text (z-index lower than content) |
| `SUBJECT` label via `::before` | No extra DOM node; matches typewritten form-field aesthetic used on real classified documents |
| `text-indent: 1.2em` on description | Traditional archival paragraph formatting; makes reading feel more like a physical document |
| All three app fonts used in one panel | Each carries a distinct semantic role: Special Elite = watermark/stamps, Courier Prime = codes/labels, Crimson Text = human prose |
| Perforated rule between title and content | Divides "identifying info" zone from "content" zone — mirrors physical document layout |

---

## What Was NOT Changed

- Fetching logic, error handling, loading states — untouched.
- Language switching (Hebrew/English) — untouched.
- `MapPage.jsx` and `MapPage.css` — untouched.
- `TimelineSidebar.jsx` — untouched.
- All other components — untouched.
