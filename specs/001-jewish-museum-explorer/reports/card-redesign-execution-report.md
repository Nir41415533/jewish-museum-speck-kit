# Execution Report — Modal Card Redesign (design/card-redesign branch)

**Branch:** `design/card-redesign`
**Base:** `design-fixed`
**Date:** 2026-05-12
**Status:** Complete

---

## Task Understanding

Two related problems fixed in the modal list view:

1. **Only the text was clickable** — each item had a narrow `<button>` wrapping only the name. Clicking anywhere else on the row did nothing.
2. **Cards had no visual weight** — items were thin rows with a left border, no clear affordance that they were interactive.

Requested fix: make each entire card clickable, and redesign the cards so they look and feel like real, tappable cards.

**Aesthetic direction:** *Dossier Index Card* — each card gets a coloured header band (like a colour-coded manila folder tab), an arrow indicator that slides right on hover, and a staggered entry animation when the list first renders.

---

## Files Modified

### `frontend/src/components/CountryPanel/CountryPanel.jsx`

**Event items** — old structure:
```jsx
<li className="panel-list-item event-item">
  <span className="item-dates">…</span>
  <button className="item-name item-link-btn" onClick={…}>title</button>
</li>
```

New structure — entire card is one `<button>`:
```jsx
<li>
  <button className="panel-card event-card" onClick={() => openEvent(e.id)}>
    <div className="card-band">
      <span className="card-band-text">{date range}</span>
      <span className="card-band-badge">EVENT</span>
    </div>
    <div className="card-body">
      <div className="card-title-row">
        <span className="card-title">{title}</span>
        <span className="card-arrow">›</span>
      </div>
    </div>
  </button>
</li>
```

**Soldier items** — same pattern with rank in the band header, plus army and date rows in the body:
```jsx
<li>
  <button className="panel-card soldier-card" onClick={() => openSoldier(s.id)}>
    <div className="card-band">
      <span className="card-band-text">{rank || 'SOLDIER'}</span>
      <span className="card-band-badge">PERSONNEL</span>
    </div>
    <div className="card-body">
      <div className="card-title-row">
        <span className="card-title">{name}</span>
        <span className="card-arrow">›</span>
      </div>
      {army && <span className="card-meta">{army}</span>}
      {dates && <span className="card-dates">{dates}</span>}
    </div>
  </button>
</li>
```

No logic or API changes — only the rendered JSX structure changed.

### `frontend/src/components/CountryPanel/CountryPanel.css`

Removed: `.panel-list-item`, `.event-item`, `.soldier-item`, `.item-name`, `.item-link-btn`, `.item-meta`, `.item-dates`.

Added: `.panel-card`, `.card-band`, `.card-band-badge`, `.card-body`, `.card-title-row`, `.card-title`, `.card-arrow`, `.card-meta`, `.card-dates`, `.event-card`, `.soldier-card`.

**Card anatomy:**

| Zone | Event | Soldier |
|---|---|---|
| Band background | `var(--cp-gold)` — tarnished gold | `var(--cp-navy)` — archive navy |
| Band text | Year range | Rank (falls back to `SOLDIER`) |
| Band badge | `EVENT` | `PERSONNEL` |
| Body background | `rgba(255,248,228,0.82)` | `rgba(230,240,255,0.78)` |
| Body border | Gold at 22% opacity | Navy at 18% opacity |

**Hover states:**
- `translateY(-3px)` lift on the whole card
- `box-shadow` gains a coloured glow ring matching the card type
- `card-arrow` slides 3px right and jumps from 28% → 90% opacity

**Staggered entry animation (`cardSlideIn`):**
- `opacity: 0; translateY(7px)` → `opacity: 1; translateY(0)` over 0.22 s
- Each `li:nth-child(n)` gets an increasing `animation-delay` (0.04 s steps up to child 8)
- Creates a cascading reveal effect when the country list loads

---

## Key Decisions

| Decision | Reason |
|---|---|
| Entire `<button>` wraps the card | Largest possible click target; semantically correct; keyboard-navigable without extra ARIA |
| Band at top (not left border) | Gives each card a distinct header zone — immediately shows the type and key metadata before reading the name |
| Rank in band for soldiers | The most dossier-specific field; puts the military context first, then the name |
| Arrow indicator (`›`) | Universal affordance for "tap to open"; slides on hover so the animation confirms clickability |
| `translateY` lift (not `translateX`) | Cards sit in a vertical list; upward lift feels more "picking up a card from a pile" |
| Staggered animation | Gives the list a sense of appearing freshly pulled from a file — one cascade, not a flat render |

---

## What Was NOT Changed

- All data fetching, view-state machine, back/close logic — untouched.
- Detail views (`SoldierDetail`, `EventDetail`) — untouched.
- All other modal sections (header, fileref bar, detail hero, vitals, sections) — untouched.
- Load-more button — untouched.
- Mobile breakpoints — inherit the card styles without additional changes needed.
