import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';

import { useDashboardStore } from '../../store/dashboardStore';

export function ManageWidgetsMenu() {
  const widgetsById = useDashboardStore((s) => s.dashboard.widgetsById);
  const setWidgetVisibility = useDashboardStore((s) => s.setWidgetVisibility);

  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const [menuStyle, setMenuStyle] = useState<React.CSSProperties | undefined>(undefined);

  const rows = useMemo(() => {
    return Object.values(widgetsById).slice().sort((a, b) => a.title.localeCompare(b.title));
  }, [widgetsById]);

  useLayoutEffect(() => {
    if (!open) return;

    const btn = buttonRef.current;
    const menu = menuRef.current;
    if (!btn || !menu) return;
    // Copy into narrowed variables so TS understands they're non-null inside nested functions.
    const btnEl = btn;
    const menuEl = menu;

    const PADDING = 12; // keep a little breathing room from viewport edges
    const GAP = 8; // space between button and dropdown
    const IDEAL_W = 256; // matches w-64

    function layout() {
      const rect = btnEl.getBoundingClientRect();
      const vw = window.innerWidth;
      const vh = window.innerHeight;

      // Width should never exceed the viewport minus padding.
      const width = Math.min(IDEAL_W, Math.max(180, vw - PADDING * 2));

      // Align dropdown right edge with button right edge by default.
      const left = Math.min(vw - width - PADDING, Math.max(PADDING, rect.right - width));

      // Default placement: below the button.
      let top = rect.bottom + GAP;
      let maxHeight = vh - top - PADDING;

      // If it doesn't fit well below, place it above instead (when there's more room).
      const menuH = menuEl.offsetHeight || 0;
      const spaceBelow = vh - rect.bottom - PADDING - GAP;
      const spaceAbove = rect.top - PADDING - GAP;
      const shouldPlaceAbove = menuH > spaceBelow && spaceAbove > spaceBelow;

      if (shouldPlaceAbove) {
        top = Math.max(PADDING, rect.top - GAP - menuH);
        maxHeight = rect.top - PADDING - GAP;
      }

      setMenuStyle({
        position: 'fixed',
        left,
        top,
        width,
        maxHeight: Math.max(160, Math.floor(maxHeight)),
      });
    }

    layout();

    // Re-layout on viewport changes.
    window.addEventListener('resize', layout);
    window.addEventListener('scroll', layout, true);
    return () => {
      window.removeEventListener('resize', layout);
      window.removeEventListener('scroll', layout, true);
    };
  }, [open]);

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
        className="whitespace-nowrap rounded-md border px-2 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 sm:px-3"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        ref={buttonRef}
      >
        Manage Widgets
      </button>

      {open ? (
        <div
          ref={menuRef}
          role="menu"
          className="z-50 overflow-auto rounded-lg border bg-white p-2 shadow-lg"
          style={menuStyle}
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


