# Njia — Matatu Routes & Fares (working title)

Real matatu routes, stages and fares for Nairobi commuters — the stages by the
names people actually use, fares as honest ranges (off-peak / peak / rain), and
the paths mats really drive. Works offline once loaded.

## Live demo

Every push deploys the app to GitHub Pages:
**https://james-karanja.github.io/Matatu-app/**

## What's in the MVP

- **Find a trip** — stage-to-stage search with direct routes first, plus
  one-transfer suggestions (change at a shared stage, or ride into the CBD
  and walk a few minutes to the other terminus)
- **Browse routes** — 10 seeded Nairobi routes (46, 111, 125, 237, 45, 44,
  58, 23, 105, 33) with corridor, operator and fare band
- **Route detail** — map, ordered stage list, fare table, typical headway,
  first/last matatu
- **Offline PWA** — installable to the home screen; the app and all route
  data are cached by a service worker

> Route data is indicative sample data pending field verification — the app
> says so in the UI.

## Develop

```bash
cd app
npm install
npm run dev        # dev server
npm test           # trip-planner unit tests
npm run build && npm run preview   # production build (service worker active)
```

Stack: Vite + React + TypeScript + MapLibre GL. No backend — route data ships
as a versioned static bundle. Deployment is `.github/workflows/deploy-pages.yml`.
