# MediVerse 3D — Smart Hospital Digital Experience
Interactive React + TypeScript + React Three Fiber hospital simulation with a dashboard around it.
**All data is fictional demo data. No diagnoses or treatment advice.**
## Run
`npm install && npm run dev` · build: `npm run build` · preview: `npm run preview`
## Routes (HashRouter)
/dashboard /hospital /emergency /patients /departments /staff /analytics /settings
## Structure
`src/store.ts` (typed models, seed data, persisted Zustand store, simulation state) · `src/Scene.tsx` (3D) · `src/pages.tsx` (pages) · `src/App.tsx` (layout)
## Deploy to GitHub Pages
`vite.config.ts` uses `base: './'`; run `npm run build` and publish `dist/`.
## Limitations
Not browser-tested by the author of this scaffold. Simplified: no sorting/profile modal, no time-range selector, no notification/dashboard preference settings, single-file pages, no reduced-detail mobile mode beyond quality setting.
