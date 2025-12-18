import { FiltersBar } from '../components/filters/FiltersBar';
import { DashboardGrid } from '../components/layout/DashboardGrid';
import { ManageWidgetsMenu } from '../components/layout/ManageWidgetsMenu';
import { useDashboardStore } from '../store/dashboardStore';

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
  const isDirty = useDashboardStore((s) => s.isDirty);
  const saveNow = useDashboardStore((s) => s.saveNow);
  const discardDraft = useDashboardStore((s) => s.discardDraft);

  return (
    <div className="min-h-screen bg-slate-50 text-gray-900">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
          <h1 className="text-lg font-semibold tracking-tight text-gray-900 sm:text-xl">Dashboard</h1>

          <div className="flex items-center gap-2">
            {isDirty ? (
              <span className="mr-1 rounded-full border border-amber-200 bg-amber-50 px-2 py-1 text-xs font-medium text-amber-800">
                Unsaved changes
              </span>
            ) : null}

            <ManageWidgetsMenu />

            <button
              type="button"
              className="rounded-md border px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
              onClick={discardDraft}
              disabled={!isDirty}
            >
              Discard
            </button>

            <button
              type="button"
              className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
              onClick={saveNow}
              disabled={!isDirty}
            >
              Save Layout
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-4 sm:px-6 sm:py-6">
        <DashboardPage />
      </main>
    </div>
  );
}


