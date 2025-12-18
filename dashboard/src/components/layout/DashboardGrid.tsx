import { useMemo, useRef } from 'react';
import { Responsive, WidthProvider } from 'react-grid-layout';

import { useDashboardStore } from '../../store/dashboardStore';
import type { Breakpoint, DashboardLayouts, GridLayoutItem } from '../../store/types';
import { WidgetRenderer } from './WidgetRenderer';

const ResponsiveGridLayout = WidthProvider(Responsive);

const BREAKPOINTS: Record<Breakpoint, number> = { lg: 1200, md: 996, sm: 768 };
const COLS: Record<Breakpoint, number> = { lg: 12, md: 10, sm: 6 };

function isBreakpoint(value: string): value is Breakpoint {
  return value === 'lg' || value === 'md' || value === 'sm';
}

export function DashboardGrid() {
  /**
   * React 19 + Zustand stability fix:
   * - Select stable object reference (widgetsById) instead of deriving arrays inline.
   * - Derive visibleIds in useMemo to avoid selector instability ("getSnapshot should be cached").
   */
  const widgetsById = useDashboardStore((s) => s.dashboard.widgetsById);
  const draftLayouts = useDashboardStore((s) => s.dashboard.draftLayouts);
  const setDraftLayouts = useDashboardStore((s) => s.setDraftLayouts);

  const activeBreakpointRef = useRef<Breakpoint>('lg');

  // Derive visibleIds from stable widgetsById reference
  const visibleIds = useMemo(
    () =>
      Object.values(widgetsById)
        .filter((w) => w.visible)
        .map((w) => w.id)
        .sort(),
    [widgetsById],
  );

  const visibleSet = useMemo(() => new Set(visibleIds), [visibleIds]);

  const visibleLayouts = useMemo((): DashboardLayouts => {
    const filterItems = (items: GridLayoutItem[] | undefined) =>
      // Clone items so RGL can mutate without mutating Zustand state by reference.
      (items ?? [])
        .filter((item) => visibleSet.has(item.i))
        .map((item) => ({ ...item }));

    return {
      lg: filterItems(draftLayouts.lg),
      md: filterItems(draftLayouts.md),
      sm: filterItems(draftLayouts.sm),
    };
  }, [draftLayouts.lg, draftLayouts.md, draftLayouts.sm, visibleSet]);

  return (
    <div className="min-h-0">
      <ResponsiveGridLayout
        className="layout"
        layouts={visibleLayouts}
        breakpoints={BREAKPOINTS}
        cols={COLS}
        rowHeight={48}
        margin={[16, 16]}
        containerPadding={[0, 0]}
        draggableHandle=".drag-handle"
        onBreakpointChange={(bp) => {
          if (!isBreakpoint(bp)) return;
          activeBreakpointRef.current = bp;
        }}
        onDragStop={(layout) => {
          // Important: only commit on stop events (avoid dispatching on every mouse move)
          setDraftLayouts(activeBreakpointRef.current, layout);
        }}
        onResizeStop={(layout) => {
          setDraftLayouts(activeBreakpointRef.current, layout);
        }}
      >
        {visibleIds.map((id) => (
          <div key={id} className="h-full min-h-0">
            <WidgetRenderer id={id} />
          </div>
        ))}
      </ResponsiveGridLayout>
    </div>
  );
}


