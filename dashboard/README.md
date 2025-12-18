# Dashboard (AnchorzUp)

A small, configurable analytics dashboard built with React + Vite.

## Setup / run

```bash
npm install
npm run dev
```

Production build:

```bash
npm run build
npm run preview
```

## Libraries used

- **Tailwind CSS**: UI styling
- **Zustand**: UI/config state (filters, widget settings, layouts/visibility)
- **React Query**: data fetching/caching (mock API)
- **react-grid-layout**: draggable/resizable grid
- **Recharts**: charts (line/bar/pie)
- **TanStack Table**: table sorting/pagination + rendering

## Architecture decisions

- **Zustand for UI config** (filters, draft/saved layouts, widget settings/visibility)
- **React Query** for mock data fetching in `useDashboardData(filters)`
- **Persistence strategy**
  - Filters persist (debounced)
  - Dashboard saves **only** on “Save Layout” (layouts + widget settings/visibility)
  - Draft changes stay in-memory until saved; “Discard” reverts draft → last saved

## Performance notes

- **Granular selectors + memoization**: components subscribe only to what they need + `React.memo` on widget shells
- **Drag/resize dispatch**: state updates only on `dragStop` / `resizeStop` (not every mouse move)

## Known tradeoffs

- Draft changes are lost on refresh unless saved (intentional UX)
