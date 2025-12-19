import { DashboardGrid } from '../components/layout/DashboardGrid';
import { ManageWidgetsMenu } from '../components/layout/ManageWidgetsMenu';
import { useDashboardStore } from '../store/dashboardStore';
import logoIcon from '../assets/picsvg_download.svg'

function DashboardPage() {
  // TODO: page-level orchestration: fetch data, wire filters, render grid.
  return (
    <div className="space-y-4">
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
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6">
          {/* Desktop: All in one row with space-between */}
          <div className="hidden min-w-0 items-center justify-between gap-2 sm:flex">
            <img
              src={logoIcon}
              alt="Dashboard"
              className="h-10 w-auto"
            />
            <div className="flex items-center gap-2">
              {isDirty ? (
                <>
                  <span className="rounded-full border border-amber-200 bg-amber-50 px-2 py-1 text-xs font-medium text-amber-800">
                    Unsaved changes
                  </span>
                  <button
                    type="button"
                    className="whitespace-nowrap rounded-md border px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                    onClick={discardDraft}
                  >
                    Discard
                  </button>
                  <button
                    type="button"
                    className="whitespace-nowrap rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
                    onClick={saveNow}
                  >
                    Save Layout
                  </button>
                </>
              ) : null}
              <ManageWidgetsMenu />
            </div>
          </div>

          {/* Mobile: Icon + Manage Widgets on row 1, Save/Discard/Unsaved on row 2 */}
          <div className="flex min-w-0 flex-col gap-3 sm:hidden">
            {/* Row 1: Icon and Manage Widgets - inline with space-between */}
            <div className="flex min-w-0 items-center justify-between gap-2">
              <img
                src={logoIcon}
                alt="Dashboard"
                className="h-8 w-auto"
              />
              <ManageWidgetsMenu />
            </div>

            {/* Row 2: Unsaved changes, Discard, Save Layout - only when isDirty, inline, aligned right */}
            {isDirty ? (
              <div className="flex items-center justify-end gap-2">
                <span className="rounded-full border border-amber-200 bg-amber-50 px-2 py-1 text-xs font-medium text-amber-800">
                  Unsaved changes
                </span>
                <button
                  type="button"
                  className="whitespace-nowrap rounded-md border px-2 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                  onClick={discardDraft}
                >
                  Discard
                </button>
                <button
                  type="button"
                  className="whitespace-nowrap rounded-md bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-700"
                  onClick={saveNow}
                >
                  Save Layout
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-4 sm:px-6 sm:py-6">
        <DashboardPage />
      </main>
    </div>
  );
}


