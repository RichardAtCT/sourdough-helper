# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A React single-page app that combines three sourdough tools behind one tabbed interface:
1. **Sourdough Bread** - beginner's recipe with scaling, step checklist, timers and a timeline
2. **Focaccia** - recipe with hydration, yeast type and cold-fermentation controls
3. **Bulk Fermentation Calculator** - estimates fermentation time from dough temperature, starter percentage and rise target

It is deployed to GitHub Pages at https://richardatct.github.io/sourdough-helper/ and works offline as a PWA.

## Technology Stack

- **React 19** with **Vite 8** (`@vitejs/plugin-react`)
- **Tailwind CSS v4** via `@tailwindcss/postcss` (configured with `@import "tailwindcss"` in `src/styles.css`; there is no `tailwind.config.js`)
- **lucide-react** icons, re-exported from `src/shared/Icons.jsx`
- **vite-plugin-pwa** for the manifest and Workbox service worker
- **Vitest** for unit tests, **ESLint 10** with `eslint-plugin-react-hooks`
- **localStorage** for all persistence (no backend)

Node 22 (see `.nvmrc`); Vite 8 needs Node >= 20.19.

## Commands

```bash
npm install
npm run dev      # dev server at http://localhost:5173/sourdough-helper/
npm test         # vitest run
npm run lint     # eslint .
npm run build    # production build into dist/
npm run preview  # serve dist/ locally
```

CI (`.github/workflows/ci.yml`) runs lint, tests and build on every PR. `deploy.yml` tests, builds and publishes `dist/` to GitHub Pages on pushes to `main`.

## Architecture

```
src/
  main.jsx                     React root (StrictMode)
  App.jsx                      Header, export/import, tabs (TABS list), swipe navigation, shared preferences
  components/
    SourdoughBread.jsx         Bread tab: scale, start time, ingredients, timer clock and alarms
    sourdough/
      ActiveTimersBar.jsx      Sticky summary of running timers (+ timerLabels)
      Timeline.jsx             Suggested schedule from the start time
      ProcessSteps.jsx         Step checklist and progress (STEP_ORDER)
      Step.jsx                 StepCheckbox, NextBadge, stepRowClass
    TimerDisplay.jsx           Stateless per-step timer (formatTime)
    Focaccia.jsx               Focaccia tab
    FermentationCalculator.jsx Calculator tab
    FavoritesModal.jsx         Shared "save/load/delete favorites" dialog
  hooks/
    useFavorites.js            Favorites persisted under a storage key
    useRecentCalculations.js   Calculator history (last 10)
  utils/
    calculations.js            Fermentation data, interpolation, unit conversion, splitHours
    calculations.test.js       Vitest tests for the above
    storage.js                 readStoredJSON, preferences, settings export/import
    alarm.js                   Web Audio timer alarm (unlockAlarm/playAlarm)
public/                        favicon.svg (icon source) and PNG icons for the manifest
```

### Key behaviours

- **All tabs stay mounted.** `App` renders every tab and hides inactive ones with `hidden`, so running timers keep ticking and alarms fire on any tab. Don't switch back to conditional rendering.
- **Load saved state in lazy `useState` initializers** (`useState(() => readStoredJSON(key, fallback))`), not in mount effects. Under StrictMode an effect-based load is overwritten by the save effects with defaults.
- **Timers** are end timestamps in `activeTimers` (persisted). `SourdoughBread` owns a single `now` clock that ticks while any timer runs; `TimerDisplay` is stateless. Define components at module level, never inside another component (they would remount on every render).
- **Alarm audio** must be unlocked from a user gesture: `startTimer` calls `unlockAlarm()`.
- **Calculator temperature** is stored as unrounded °F (`temperatureF`) and converted to the user's unit only for the slider and display. Older saved values in either unit are migrated with `legacyTemperatureToF`.

### Fermentation model (`utils/calculations.js`)

`fermentationData` holds 40 empirical times: 4 starter percentages (5, 10, 15, 20%) × 5 temperatures (66-74°F) × 2 rise targets (75%, 100%). `bilinearInterpolate(tempF, starter, rise)` interpolates log(time) inside that grid, reproducing every data point exactly. Outside it (the sliders allow 60-80°F and up to 30% starter) it continues the grid's exponential trend per axis; the UI shows an "Outside Tested Range" warning. The tests assert exact data points, monotonicity across the slider ranges, and that a 100% rise always takes longer than 75%. Keep them passing.

### localStorage keys

`sourdoughPreferences` (tempUnit, showBakersPercent), `sourdoughCompletedSteps`, `sourdoughActiveTimers`, `sourdoughScale`, `sourdoughStartTime`, `focacciaState`, `calculatorState`, `recentCalculations`, and `sourdoughFavorites` / `focacciaFavorites` / `calculatorFavorites`. `exportSettings` / `importSettings` in `storage.js` must be updated when a key is added.

## Conventions

- Tailwind utility classes only; Tailwind v4 removed `bg-opacity-*` and similar, so use the slash syntax (`bg-black/50`). Responsive class names must appear in full in the source.
- Touch targets are at least 44px (`min-h-[44px]`), and interactive elements carry ARIA labels.
- Purple is the primary colour; amber/orange for warnings, green for success and tips.
- `SourdoughBread` and its `sourdough/` children use 4-space indentation; other files use 2 spaces.
- Run `npm run lint && npm test && npm run build` before pushing.

## Data Attribution

The bulk fermentation calculator uses empirical data based on research from The Sourdough Journey: controlled tests with 90% King Arthur Bread Flour and 10% whole wheat at various temperatures and starter percentages.
