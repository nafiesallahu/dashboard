import { useMemo, useState } from 'react';
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
  const draftLayouts = useDashboardStore((s) => s.dashboard.draftLayouts);
  const widgetsById = useDashboardStore((s) => s.dashboard.widgetsById);
  const setDraftLayouts = useDashboardStore((s) => s.setDraftLayouts);

  const [activeBreakpoint, setActiveBreakpoint] = useState<Breakpoint>('lg');

  const visibleLayouts = useMemo((): DashboardLayouts => {
    const filterItems = (items: GridLayoutItem[] | undefined) =>
      (items ?? []).filter((item) => {
        const widget = widgetsById[item.i];
        return Boolean(widget && widget.visible);
      });

    return {
      lg: filterItems(draftLayouts.lg),
      md: filterItems(draftLayouts.md),
      sm: filterItems(draftLayouts.sm),
    };
  }, [draftLayouts.lg, draftLayouts.md, draftLayouts.sm, widgetsById]);

  const renderedIds = useMemo(() => {
    return (visibleLayouts[activeBreakpoint] ?? []).map((l) => l.i);
  }, [activeBreakpoint, visibleLayouts]);

  return (
    <div className="rounded-xl bg-slate-50 p-4">
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
          if (isBreakpoint(bp)) setActiveBreakpoint(bp);
        }}
        onDragStop={(layout, _oldItem, _newItem) => {
          setDraftLayouts(activeBreakpoint, layout);
        }}
        onResizeStop={(layout, _oldItem, _newItem) => {
          setDraftLayouts(activeBreakpoint, layout);
        }}
      >
        {renderedIds.map((id) => (
          <div key={id} className="h-full">
            <WidgetRenderer id={id} />
          </div>
        ))}
      </ResponsiveGridLayout>
    </div>
  );
}


