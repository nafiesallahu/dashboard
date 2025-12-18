import { useEffect, useMemo, useRef, useState } from 'react';

import { useDashboardStore } from '../../store/dashboardStore';

export function ManageWidgetsMenu() {
  const widgetsById = useDashboardStore((s) => s.dashboard.widgetsById);
  const setWidgetVisibility = useDashboardStore((s) => s.setWidgetVisibility);

  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);

  const rows = useMemo(() => {
    return Object.values(widgetsById).slice().sort((a, b) => a.title.localeCompare(b.title));
  }, [widgetsById]);

  useEffect(() => {
    if (!open) return;

    function onMouseDown(e: MouseEvent) {
      const target = e.target as Node | null;
      if (!target) return;
      if (rootRef.current && !rootRef.current.contains(target)) setOpen(false);
    }

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }

    document.addEventListener('mousedown', onMouseDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onMouseDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        className="rounded-md border px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
      >
        Manage Widgets
      </button>

      {open ? (
        <div
          role="menu"
          className="absolute right-0 z-20 mt-2 w-64 rounded-lg border bg-white p-2 shadow-lg"
        >
          <div className="px-2 py-2 text-xs font-medium uppercase tracking-wide text-gray-500">
            Visibility
          </div>
          <div className="max-h-72 overflow-auto">
            {rows.map((w) => (
              <label
                key={w.id}
                className="flex cursor-pointer items-center justify-between gap-3 rounded-md px-2 py-2 hover:bg-gray-50"
              >
                <div className="min-w-0">
                  <div className="truncate text-sm font-medium text-gray-900">{w.title}</div>
                  <div className="text-xs text-gray-500">{w.type}</div>
                </div>
                <input
                  type="checkbox"
                  className="h-4 w-4"
                  checked={w.visible}
                  onChange={(e) => setWidgetVisibility(w.id, e.target.checked)}
                />
              </label>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}


