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

  // actions
  setFilter: (patch: Partial<FiltersState>) => void;
  setLayouts: (bp: Breakpoint, layout: GridLayoutItem[]) => void;
  toggleWidgetVisibility: (id: string) => void;
  updateWidgetSettings: (payload: UpdateWidgetSettingsPayload) => void;
  resetToDefaults: () => void;
  saveNow: () => void;
};

function initState(): Pick<StoreState, 'filters' | 'dashboard'> {
  const persisted = loadPersisted();

  const filters: FiltersState = persisted?.filters ? { ...DEFAULT_FILTERS, ...persisted.filters } : DEFAULT_FILTERS;

  let dashboard: DashboardState = DEFAULT_DASHBOARD_STATE;
  if (persisted?.dashboard) {
    dashboard = {
      schemaVersion: 1,
      layouts: persisted.dashboard.layouts ?? DEFAULT_DASHBOARD_STATE.layouts,
      widgetsById: {
        ...DEFAULT_DASHBOARD_STATE.widgetsById,
        ...(persisted.dashboard.widgetsById ?? {}),
      },
    };
  }

  return { filters, dashboard };
}

export const useDashboardStore = create<StoreState>()(
  subscribeWithSelector((set, get) => {
  const initial = initState();

  return {
    ...initial,

    setFilter: (patch) => set((s) => ({ filters: { ...s.filters, ...patch } })),

    setLayouts: (bp, layout) =>
      set((s) => ({
        dashboard: {
          ...s.dashboard,
          layouts: {
            ...s.dashboard.layouts,
            [bp]: layout,
          },
        },
      })),

    toggleWidgetVisibility: (id) =>
      set((s) => {
        const current = s.dashboard.widgetsById[id];
        if (!current) return s;
        return {
          dashboard: {
            ...s.dashboard,
            widgetsById: {
              ...s.dashboard.widgetsById,
              [id]: { ...current, visible: !current.visible },
            },
          },
        };
      }),

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
      set({ filters: DEFAULT_FILTERS, dashboard: DEFAULT_DASHBOARD_STATE });
      get().saveNow();
    },

    saveNow: () => {
      const { filters, dashboard } = get();
      savePersisted({ filters, dashboard });
    },
  };
  }),
);

// Persistence wiring (debounced)
let saveTimer: ReturnType<typeof setTimeout> | null = null;
function scheduleSave() {
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    saveTimer = null;
    const { filters, dashboard } = useDashboardStore.getState();
    savePersisted({ filters, dashboard });
  }, 400);
}

useDashboardStore.subscribe(
  (s) => ({ filters: s.filters, dashboard: s.dashboard }),
  () => {
    scheduleSave();
  },
);

// Small selector helpers (for component performance)
export const useFilters = () => useDashboardStore((s) => s.filters);
export const useFilterActions = () => useDashboardStore((s) => s.setFilter);
export const useWidgetById = (id: string) => useDashboardStore((s) => s.dashboard.widgetsById[id]);
export const useLayouts = () => useDashboardStore((s) => s.dashboard.layouts);


