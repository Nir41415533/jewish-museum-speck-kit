# Execution Report — Phase 8: Language Toggle (T054–T057)

**Branch:** `task/T054-T057-phase8-language`
**Base:** `main`
**Date:** 2026-05-12
**Status:** Complete

---

## T054 + T055 — LanguageToggle component + wire into Layout

### `frontend/src/components/Layout/LanguageToggle.jsx` (new)

EN | HE toggle rendered as two `<button>` elements sharing a container. Each button has `aria-pressed` and a `lang` attribute. Clicking calls `setLanguage()` from `LanguageContext`, which:
1. Updates `language` state (triggers re-render of every component using `useLanguage`)
2. Sets `document.documentElement.dir` to `'rtl'` or `'ltr'`
3. Sets `document.documentElement.lang`

Styled to match the dark header: semi-transparent background, Courier Prime font, tarnished-gold active highlight.

### `frontend/src/components/Layout/Layout.jsx` (modified)

Replaced the Phase 8 placeholder comment with `<LanguageToggle />`. The header now renders left-to-right: **site name → SearchBar → LanguageToggle**.

---

## T056 — Bilingual text audit

All components already use language-aware field selection. No changes required. Summary:

| Component | Method |
|---|---|
| `Layout.jsx` | `language === 'he' ? 'מוזיאון...' : 'Jewish Soldier Museum'` |
| `HomePage.jsx` | `copy[language]` object lookup |
| `SearchBar.jsx` | `he ? '...' : '...'` inline ternaries |
| `TimelineSidebar.jsx` | `language === 'he'` throughout |
| `CountryPanel.jsx` | `language === 'he'` throughout; bilingual `name_he`/`name_en` fields |
| `SoldierDetail.jsx` | `lang` prop, selects all `_he`/`_en` fields |
| `EventDetail.jsx` | `lang` prop, selects all `_he`/`_en` fields |
| `EventSidePanel.jsx` | `language === 'he'` for all labels |
| `SoldierSidePanel.jsx` | `language === 'he'` for all labels |
| `MediaViewer.jsx` | `useLanguage()` → picks `caption_he` or `caption_en` |

Both EN and HE fields are always fetched from the API — switching language triggers a React re-render only, no new API call.

---

## T057 — CSS logical properties

### `frontend/src/components/CountryPanel/CountryPanel.css`

The `.vital` vitals row (born / died) uses a separator border between items. Changed from physical to logical:

```css
/* before */
padding: 0.22rem 1.25rem 0.22rem 0;
border-right: 1px solid ...;
margin-right: 1.25rem;

/* after */
padding-block: 0.22rem;
padding-inline-end: 1.25rem;
border-inline-end: 1px solid ...;
margin-inline-end: 1.25rem;
```

In RTL (Hebrew), `border-inline-end` flips to the left side automatically — the vitals separator appears on the correct side without any additional CSS.

### `frontend/src/components/Search/SearchBar.css`

- `text-align: left` → `text-align: start`
- `border-left: 3px solid transparent` (accent bar on dropdown items) → `border-inline-start`
- All `border-left-color` hover rules → `border-inline-start-color`

### `frontend/src/index.css`

Added `.rtl` block:
```css
.rtl { direction: rtl; }

/* CountryPanel slides in from the correct side in RTL */
.rtl .country-panel {
  inset-inline-start: auto;
  inset-inline-end: 0;
}

/* Back chevron flips direction in RTL */
.rtl .panel-back-btn { transform: scaleX(-1); }
```

The `.rtl` class is applied by `Layout.jsx` when `language === 'he'`. Combined with `document.documentElement.dir = 'rtl'`, all logical CSS properties (`margin-inline-*`, `padding-inline-*`, `border-inline-*`, `text-align: start`) flip automatically.

### What was NOT changed

Decorative borders that are intentionally physical (panel binding edges, punch-hole effects, structural dividers) were left as `border-left`/`border-right` since they should not flip in RTL — they are part of the visual design, not text flow.
