# Analytics Dashboard

Analytics Dashboard

This project is a small analytics dashboard built with React and TypeScript.
It demonstrates a grid-based layout with draggable and resizable widgets, global filters, and persistent user customization.

---

## Project Structure

The application source code and configuration are located in the `dashboard/` directory.
This root README is the main entry point for reviewers. All commands below should be executed from `dashboard/`.

---

## How to Run the Project (Step by Step)

### Requirements

- Node.js 18+ (or newer)
- npm (included with Node.js)

To check your Node version:

```bash
node -v
```

---

### Step 1: Go to the application directory

```bash
cd dashboard
```

---

### Step 2: Install dependencies

```bash
npm install
```

This installs all required libraries.

---

### Step 3: Start the development server

```bash
npm run dev
```

Dev URL:

```
http://localhost:5173
```

You should see the dashboard running.

---

### Build for production (optional)

```bash
npm run build
```

To preview the production build locally:

```bash
npm run preview
```

---

## What This Project Demonstrates

### Dashboard Layout

- Responsive grid
- Draggable widgets
- Resizable widgets
- Show/hide widgets
- Responsive across screen sizes

### Widgets

- KPI stat cards (total sales, active users, engagement)
- Charts with switchable types:
  - Line
  - Bar
  - Pie
- Table widget with:
  - Sorting
  - Pagination
  - Text filtering
  - CSV / PDF export

### Global Filters

- Dataset / date range / region filters
- Filters update all widgets instantly without reload

---

## State Management & Persistence

- Zustand manages global UI state.
- React Query handles mock data fetching and caching.
- Dashboard customization uses an explicit save model (intentional UX):
  - Changes are applied to a draft state.
  - **Save Layout** persists the configuration.
  - **Discard** reverts to the last saved state.
  - Refresh restores the last saved layout.
  - A default layout is used if nothing is saved.