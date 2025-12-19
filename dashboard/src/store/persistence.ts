import type { DashboardState, FiltersState } from './types';

const STORAGE_KEY = 'anchorzup.dashboard.v1';
const SCHEMA_VERSION = 1;

export type PersistedPayload = {
  dashboard?: Pick<DashboardState, 'schemaVersion' | 'layouts' | 'widgetsById'>;
  filters?: FiltersState;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isString(value: unknown): value is string {
  return typeof value === 'string';
}

function isNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

export function loadPersisted(): PersistedPayload | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    const parsed: unknown = JSON.parse(raw);
    if (!isRecord(parsed)) return null;

    const result: PersistedPayload = {};

    const filters = parsed.filters;
    if (isRecord(filters)) {
      const dateRange = filters.dateRange;
      const region = filters.region;
      const dataset = filters.dataset;
      if (isString(dateRange) && isString(region) && isString(dataset)) {
        result.filters = { dateRange, region, dataset } as FiltersState;
      }
    }

    const dashboard = parsed.dashboard;
    if (isRecord(dashboard)) {
      const schemaVersion = dashboard.schemaVersion;
      const layouts = dashboard.layouts;
      const widgetsById = dashboard.widgetsById;

      const layoutsOk = layouts === undefined || isRecord(layouts);
      const widgetsOk = widgetsById === undefined || isRecord(widgetsById);

      if (isNumber(schemaVersion) && layoutsOk && widgetsOk) {
        if (schemaVersion === SCHEMA_VERSION) {
          result.dashboard = {
            schemaVersion,
            layouts: (layouts ?? undefined) as DashboardState['layouts'],
            widgetsById: (widgetsById ?? undefined) as DashboardState['widgetsById'],
          };
        } else {
          result.dashboard = undefined;
        }
      } else {
        return null;
      }
    }

    if (!result.dashboard && !result.filters) return null;
    return result;
  } catch {
    return null;
  }
}

export function savePersisted(input: {
  dashboard: Pick<DashboardState, 'schemaVersion' | 'layouts' | 'widgetsById'>;
  filters: FiltersState;
}): void {
  try {
    const payload: PersistedPayload = {
      dashboard: input.dashboard,
      filters: input.filters,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch {
    // ignore
  }
}


