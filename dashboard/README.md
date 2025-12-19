# Analytics Dashboard

This project is a small analytics dashboard built with React and TypeScript.
It demonstrates a grid-based layout with draggable and resizable widgets, global filters, and persistent user customization.

⸻

## How to Run the Project (Step by Step)

### Requirements
- Node.js 18 or newer
- npm (included with Node.js)

To check your Node version:

```bash
node -v
```

⸻

### 1. Install dependencies

From the project root folder, run:

```bash
npm install
```

This installs all required libraries.

⸻

### 2. Start the development server

```bash
npm run dev
```

Then open your browser at:

```
http://localhost:5173
```

You should see the dashboard running.

⸻

### 3. Build for production (optional)

```bash
npm run build
```

To preview the production build locally:

```bash
npm run preview
```

⸻

## What This Project Demonstrates

### Dashboard Layout
- Widgets are placed in a responsive grid
- Widgets can be:
  - Dragged
  - Resized
  - Shown or hidden
- Layout adapts smoothly to different screen sizes

### Widgets
- **KPI stat cards** (e.g. total sales, active users, engagement)
- **Charts** with switchable types:
  - Line
  - Bar
  - Pie
- **Table widget** with:
  - Sorting
  - Pagination
  - Text filtering
  - Data export (CSV / PDF)

### Global Filters
- Filters (dataset, date range, region) apply to all widgets
- Widgets update instantly without page reloads

⸻

## State Management & Persistence
- Global UI state is managed with Zustand
- Data fetching and caching use React Query with mock data
- Dashboard customization follows an explicit save model:
  - Dragging, resizing, and widget setting changes update a draft state
  - Clicking **Save Layout** persists the configuration
  - Clicking **Discard** reverts changes back to the last saved state
  - On page refresh, the last saved layout and settings are restored
  - A default layout is applied if no saved configuration exists
