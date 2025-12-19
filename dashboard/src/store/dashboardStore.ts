import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';

import { DEFAULT_DASHBOARD_STATE, DEFAULT_FILTERS } from './defaults';
import { loadPersisted, savePersisted } from './persistence';
import type {
  Breakpoint,
  DashboardState,
  FiltersState,
  GridLayoutItem,
  UpdateWidgetSettingsPayload,
} from './types';

export type StoreState = {
  filters: FiltersState;
  dashboard: DashboardState;
  isDirty: boolean;

  // actions
  setFilter: (patch: Partial<FiltersState>) => void;
  setDraftLayouts: (bp: Breakpoint, layout: GridLayoutItem[]) => void;
  discardDraft: () => void;
  toggleWidgetVisibility: (id: string) => void;
  setWidgetVisibility: (id: string, visible: boolean) => void;
  updateWidgetSettings: (payload: UpdateWidgetSettingsPayload) => void;
  resetToDefaults: () => void;
  saveNow: () => void;
};

type SavedDashboardSnapshot = Pick<DashboardState, 'schemaVersion' | 'layouts' | 'widgetsById'>;

let lastSavedDashboard: SavedDashboardSnapshot = {
  schemaVersion: DEFAULT_DASHBOARD_STATE.schemaVersion,
  layouts: DEFAULT_DASHBOARD_STATE.layouts,
  widgetsById: DEFAULT_DASHBOARD_STATE.widgetsById,
};

function ensureLayoutHasItem(layout: GridLayoutItem[] | undefined, item: GridLayoutItem): GridLayoutItem[] {
  const arr = (layout ?? []).slice();
  const exists = arr.some((x) => x.i === item.i);
  if (exists) return arr;
  // Put new widgets at the bottom for existing saved layouts to avoid overlapping user placements.
  return [...arr, { ...item, y: Number.POSITIVE_INFINITY }];
}

function getDefaultFiltersItem(bp: Breakpoint): GridLayoutItem {
  const fromDefaults = (DEFAULT_DASHBOARD_STATE.layouts[bp] ?? []).find((x) => x.i === 'filters_global');
  if (fromDefaults) return fromDefaults;
  // Safe fallback (shouldn't happen unless defaults are edited incorrectly)
  if (bp === 'lg') return { i: 'filters_global', x: 0, y: 0, w: 12, h: 3 } as GridLayoutItem;
  if (bp === 'md') return { i: 'filters_global', x: 0, y: 0, w: 10, h: 3 } as GridLayoutItem;
  return { i: 'filters_global', x: 0, y: 0, w: 6, h: 4 } as GridLayoutItem;
}

function mergeLayoutsWithDefaults(saved: DashboardState['layouts']): DashboardState['layouts'] {
  return {
    lg: ensureLayoutHasItem(saved.lg, getDefaultFiltersItem('lg')),
    md: ensureLayoutHasItem(saved.md, getDefaultFiltersItem('md')),
    sm: ensureLayoutHasItem(saved.sm, getDefaultFiltersItem('sm')),
  };
}

function getDefaultLayoutItem(bp: Breakpoint, id: string): GridLayoutItem | undefined {
  return (DEFAULT_DASHBOARD_STATE.layouts[bp] ?? []).find((x) => x.i === id);
}

function applyDefaultSizeToLayout(bp: Breakpoint, layout: GridLayoutItem[] | undefined, id: string): GridLayoutItem[] {
  const def = getDefaultLayoutItem(bp, id);
  if (!def) return (layout ?? []).slice();

  // Ensure the item exists; if it's new for this saved layout, append at bottom to avoid overlaps.
  const ensured = ensureLayoutHasItem(layout, { ...def, y: Number.POSITIVE_INFINITY });

  // Reset size constraints to defaults, but keep the user's last position (x/y) if it already existed.
  return ensured.map((item) => {
    if (item.i !== id) return item;
    return {
      ...item,
      w: def.w,
      h: def.h,
      minW: def.minW ?? item.minW,
      minH: def.minH ?? item.minH,
      maxW: def.maxW ?? item.maxW,
      maxH: def.maxH ?? item.maxH,
    };
  });
}

function initState(): Pick<StoreState, 'filters' | 'dashboard'> {
  const persisted = loadPersisted();

  const filters: FiltersState = persisted?.filters ? { ...DEFAULT_FILTERS, ...persisted.filters } : DEFAULT_FILTERS;

  const rawSavedLayouts = persisted?.dashboard?.layouts ?? DEFAULT_DASHBOARD_STATE.layouts;
  // Ensure new widgets introduced in later versions (e.g. filters widget) get a default size/placement.
  const savedLayouts = mergeLayoutsWithDefaults(rawSavedLayouts);
  const savedWidgetsById = {
    ...DEFAULT_DASHBOARD_STATE.widgetsById,
    ...(persisted?.dashboard?.widgetsById ?? {}),
  };

  lastSavedDashboard = {
    schemaVersion: 1,
    layouts: savedLayouts,
    widgetsById: savedWidgetsById,
  };

  const dashboard: DashboardState = {
    schemaVersion: 1,
    layouts: savedLayouts,
    draftLayouts: savedLayouts,
    widgetsById: savedWidgetsById,
  };

  return { filters, dashboard };
}

export const useDashboardStore = create<StoreState>()(
  subscribeWithSelector((set, get) => {
    const initial = initState();

    return {
      ...initial,
      isDirty: false,

      setFilter: (patch) => set((s) => ({ filters: { ...s.filters, ...patch } })),

      setDraftLayouts: (bp, layout) =>
        set((s) => ({
          isDirty: true,
          dashboard: {
            ...s.dashboard,
            draftLayouts: {
              ...s.dashboard.draftLayouts,
              [bp]: layout,
            },
          },
        })),

      discardDraft: () =>
        set((s) => ({
          isDirty: false,
          dashboard: {
            ...s.dashboard,
            draftLayouts: lastSavedDashboard.layouts,
            widgetsById: lastSavedDashboard.widgetsById,
          },
        })),

      setWidgetVisibility: (id, visible) =>
        set((s) => {
          const current = s.dashboard.widgetsById[id];
          if (!current) return s;
          if (current.visible === visible) return s;

          // When a widget is re-shown, reset it to the default size (per breakpoint).
          const nextDraftLayouts =
            !current.visible && visible
              ? {
                  lg: applyDefaultSizeToLayout('lg', s.dashboard.draftLayouts.lg, id),
                  md: applyDefaultSizeToLayout('md', s.dashboard.draftLayouts.md, id),
                  sm: applyDefaultSizeToLayout('sm', s.dashboard.draftLayouts.sm, id),
                }
              : s.dashboard.draftLayouts;

          return {
            isDirty: true,
            dashboard: {
              ...s.dashboard,
              draftLayouts: nextDraftLayouts,
              widgetsById: {
                ...s.dashboard.widgetsById,
                [id]: { ...current, visible },
              },
            },
          };
        }),

      toggleWidgetVisibility: (id) => {
        const current = get().dashboard.widgetsById[id];
        if (!current) return;
        get().setWidgetVisibility(id, !current.visible);
      },

      updateWidgetSettings: (payload) =>
        set((s) => {
          const widget = s.dashboard.widgetsById[payload.id];
          if (!widget) return s;

          if (widget.type !== payload.type) {
            if (import.meta.env.DEV) {
              // eslint-disable-next-line no-console
              console.warn('updateWidgetSettings ignored due to type mismatch', { widget, payload });
            }
            return s;
          }

          const nextWidget =
            payload.type === 'kpi' && widget.type === 'kpi'
              ? { ...widget, settings: { ...widget.settings, ...payload.patch } }
              : payload.type === 'chart' && widget.type === 'chart'
                ? { ...widget, settings: { ...widget.settings, ...payload.patch } }
                : payload.type === 'table' && widget.type === 'table'
                  ? { ...widget, settings: { ...widget.settings, ...payload.patch } }
                  : widget;

          return {
            isDirty: true,
            dashboard: {
              ...s.dashboard,
              widgetsById: {
                ...s.dashboard.widgetsById,
                [payload.id]: nextWidget,
              },
            },
          };
        }),

      resetToDefaults: () => {
        lastSavedDashboard = {
          schemaVersion: DEFAULT_DASHBOARD_STATE.schemaVersion,
          layouts: DEFAULT_DASHBOARD_STATE.layouts,
          widgetsById: DEFAULT_DASHBOARD_STATE.widgetsById,
        };
        set({ filters: DEFAULT_FILTERS, dashboard: DEFAULT_DASHBOARD_STATE, isDirty: false });
        get().saveNow();
      },

      saveNow: () => {
        const { filters, dashboard } = get();
        const committed: DashboardState = {
          ...dashboard,
          layouts: dashboard.draftLayouts,
        };

        lastSavedDashboard = {
          schemaVersion: committed.schemaVersion,
          layouts: committed.layouts,
          widgetsById: committed.widgetsById,
        };

        set({ dashboard: committed, isDirty: false });
        savePersisted({ filters, dashboard: lastSavedDashboard });
      },
    };
  }),
);

// Persistence wiring (debounced) — filters only (dashboard persists only on Save Layout)
let saveTimer: ReturnType<typeof setTimeout> | null = null;
function scheduleSaveFilters() {
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    saveTimer = null;
    const { filters } = useDashboardStore.getState();
    savePersisted({ filters, dashboard: lastSavedDashboard });
  }, 400);
}

useDashboardStore.subscribe(
  (s) => s.filters,
  () => {
    scheduleSaveFilters();
  },
);

// Small selector helpers (for component performance)
export const useFilters = () => useDashboardStore((s) => s.filters);
export const useFilterActions = () => useDashboardStore((s) => s.setFilter);
export const useWidgetById = (id: string) => useDashboardStore((s) => s.dashboard.widgetsById[id]);
export const useLayouts = () => useDashboardStore((s) => s.dashboard.draftLayouts);


