import { FiltersBar } from '../components/filters/FiltersBar';
import { DashboardGrid } from '../components/layout/DashboardGrid';

function DashboardPage() {
  // TODO: page-level orchestration: fetch data, wire filters, render grid.
  return (
    <div className="space-y-4">
      <FiltersBar />
      <DashboardGrid />
    </div>
  );
}

export default function App() {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <h1 className="text-xl font-semibold tracking-tight">Dashboard</h1>
          <button
            type="button"
            className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            Save Layout
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-6">
        <DashboardPage />
      </main>
    </div>
  );
}


