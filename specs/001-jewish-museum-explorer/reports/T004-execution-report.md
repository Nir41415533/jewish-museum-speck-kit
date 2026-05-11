# T004 — Technical Execution Report
## Initialize React Frontend Project

**Branch**: `task/T004-frontend-npm-init`
**Date**: 2026-05-11
**Status**: Complete

---

### 1. Task Understanding

T004 creates `frontend/package.json` — the manifest that declares every dependency and script needed to build, run, and test the React frontend. Without it, no developer can install packages, and no subsequent frontend task (T024 onward) can import React, MapLibre GL JS, or React Router. This is the frontend equivalent of T003 for the backend.

---

### 2. Why These Dependencies

| Package | Role | Spec/Plan Reference |
|---------|------|---------------------|
| `react` + `react-dom` | UI framework | `plan.md` → Tech Stack: React 18 |
| `react-router-dom` | Client-side routing for `/`, `/map`, `/soldier/:id`, `/event/:id`, `/timeline`, `/search` | `plan.md` → Frontend Architecture; T026 registers all routes |
| `maplibre-gl` | Interactive world map — country highlighting, click events, data-driven styling | `plan.md` → Map System Design; spec.md FR-001 through FR-004 |
| `vite` + `@vitejs/plugin-react` | Build tool and dev server; default port 5173 matches `VITE_API_BASE_URL` in T005 | `quickstart.md` — `npm run dev` on port 5173 |
| `jest` + `jest-environment-jsdom` | Test runner with DOM simulation | `plan.md` → Testing: React Testing Library + Jest |
| `@testing-library/react` + `@testing-library/jest-dom` | Component tests with DOM assertions | `plan.md` → Testing stack |
| `babel-jest` + `@babel/preset-react` | Transpiles JSX for Jest (Jest cannot consume ES modules natively) | Required because Jest does not understand `.jsx` or ES module syntax without Babel |

**Vite over CRA**: Create React App is deprecated upstream; Vite is the current standard for new React projects and produces smaller, faster dev-server start times. Port 5173 is Vite's default — already referenced in the README and T005's `VITE_API_BASE_URL`.

**`type: "module"`**: Required for Vite projects. The `jest` transform section handles the Node/CommonJS–ESModule boundary for test files via `babel-jest`.

**`moduleNameMapper`**: MapLibre GL JS requires a WebGL context which is unavailable in jsdom. The `maplibreMock.js` stub (created in T030 when `MapContainer` is implemented) prevents test-runner crashes. CSS/asset imports are similarly stubbed.

---

### 3. Implementation Plan

1. Confirm `frontend/` directory structure exists (T002 output) — verified
2. Write `frontend/package.json` with all runtime and dev dependencies
3. Write this execution report
4. Mark T004 done in `tasks.md`
5. Stage, commit with WHY-focused message, push
6. Open PR

---

### 4. Execution Steps

1. Confirmed `frontend/src/` and `frontend/tests/` directories exist from T002
2. Created `frontend/package.json` with 4 runtime deps and 11 dev deps
3. Wrote `specs/001-jewish-museum-explorer/reports/T004-execution-report.md`
4. Updated T004 checkbox in `tasks.md` to `[x]`
5. Staged all three files
6. Committed with WHY-focused message
7. Pushed to `origin/task/T004-frontend-npm-init`

---

### 5. File Created

**`frontend/package.json`** — key sections:

```json
{
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "test": "jest --runInBand"
  },
  "dependencies": {
    "maplibre-gl": "^4.5.0",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-router-dom": "^6.26.1"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.3.1",
    "vite": "^5.4.2",
    "jest": "^29.7.0",
    "jest-environment-jsdom": "^29.7.0",
    "@testing-library/react": "^16.0.1",
    "@testing-library/jest-dom": "^6.5.0",
    "babel-jest": "^29.7.0",
    "@babel/core": "^7.25.2",
    "@babel/preset-env": "^7.25.3",
    "@babel/preset-react": "^7.24.7"
  }
}
```

---

### 6. Git Operations

| Action | Value |
|--------|-------|
| Base branch | `main` |
| Branch created | `task/T004-frontend-npm-init` |
| Files added | `frontend/package.json`, `T004-execution-report.md`, `tasks.md` |
| Pushed to | `origin/task/T004-frontend-npm-init` |

---

### 7. Validation

- `frontend/package.json` is valid JSON
- All 4 runtime dependencies present: `react`, `react-dom`, `react-router-dom`, `maplibre-gl`
- All 11 dev dependencies present: Vite, Jest, jsdom, Testing Library, Babel
- 5 scripts defined: `dev`, `build`, `preview`, `test`, `test:watch`
- `jest.testEnvironment` is `jsdom` — required for React component tests
- `jest.moduleNameMapper` stubs out MapLibre GL JS and CSS — prevents jsdom crashes
- `engines.node` set to `>=20.0.0` per `plan.md` Node.js 20 LTS requirement

---

### 8. Edge Cases

- **MapLibre GL JS in jsdom**: MapLibre requires a real WebGL context; jsdom has none. `moduleNameMapper` maps `maplibre-gl` to a mock so tests that import `MapContainer` don't crash. The actual mock file is created in T030.
- **`type: "module"` + Jest**: Jest runs in CommonJS by default. `babel-jest` with `@babel/preset-env` (targeting `commonjs`) bridges the gap so test files can use `import` syntax.
- **No `vite.config.js`**: Vite works with zero config for a plain React project. A `vite.config.js` adding `@vitejs/plugin-react` is created in T026 (frontend root setup), keeping T004 to pure dependency declaration.
