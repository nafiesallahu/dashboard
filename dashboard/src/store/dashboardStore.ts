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

function initState(): Pick<StoreState, 'filters' | 'dashboard'> {
  const persisted = loadPersisted();

  const filters: FiltersState = persisted?.filters ? { ...DEFAULT_FILTERS, ...persisted.filters } : DEFAULT_FILTERS;

  const savedLayouts = persisted?.dashboard?.layouts ?? DEFAULT_DASHBOARD_STATE.layouts;
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
          return {
            isDirty: true,
            dashboard: {
              ...s.dashboard,
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


