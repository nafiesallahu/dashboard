import type { DashboardLayouts, DashboardState, FiltersState, WidgetConfig } from './types';

export const DEFAULT_FILTERS = {
  dateRange: '90d',
  region: 'all',
  dataset: 'default',
} as const satisfies FiltersState;

export const DEFAULT_WIDGETS_BY_ID: Record<string, WidgetConfig> = {
  filters_global: {
    id: 'filters_global',
    title: 'Filters',
    type: 'filters',
    visible: true,
    settings: {},
  },
  kpi_total_sales: {
    id: 'kpi_total_sales',
    title: 'Total Sales',
    type: 'kpi',
    visible: true,
    settings: { metric: 'totalSales' },
  },
  kpi_active_users: {
    id: 'kpi_active_users',
    title: 'Active Users',
    type: 'kpi',
    visible: true,
    settings: { metric: 'activeUsers' },
  },
  chart_trend: {
    id: 'chart_trend',
    title: 'Trend',
    type: 'chart',
    visible: true,
    settings: { chartType: 'line', metric: 'sales' },
  },
  table_users: {
    id: 'table_users',
    title: 'Users',
    type: 'table',
    visible: true,
    settings: { pageSize: 6, textFilter: '' },
  },
};

export const DEFAULT_LAYOUTS: DashboardLayouts = {
  lg: [
    { i: 'filters_global', x: 0, y: 0, w: 12, h: 3, minW: 6, minH: 3 },
    // KPIs: 50/50 split on the same row
    { i: 'kpi_total_sales', x: 0, y: 3, w: 6, h: 3, minW: 3, minH: 2 },
    { i: 'kpi_active_users', x: 6, y: 3, w: 6, h: 3, minW: 3, minH: 2 },
    // Full-width widgets stacked
    { i: 'chart_trend', x: 0, y: 6, w: 12, h: 7, minW: 6, minH: 4 },
    { i: 'table_users', x: 0, y: 13, w: 12, h: 6, minW: 6, minH: 4 },
  ],
  md: [
    { i: 'filters_global', x: 0, y: 0, w: 10, h: 3, minW: 6, minH: 3 },
    // KPIs: 50/50 split on the same row (10 columns)
    { i: 'kpi_total_sales', x: 0, y: 3, w: 5, h: 3, minW: 3, minH: 2 },
    { i: 'kpi_active_users', x: 5, y: 3, w: 5, h: 3, minW: 3, minH: 2 },
    // Full-width widgets stacked
    { i: 'chart_trend', x: 0, y: 6, w: 10, h: 7, minW: 6, minH: 4 },
    { i: 'table_users', x: 0, y: 13, w: 10, h: 6, minW: 6, minH: 4 },
  ],
  sm: [
    { i: 'filters_global', x: 0, y: 0, w: 6, h: 4, minW: 4, minH: 4 },
    // KPIs: 50/50 split on the same row (6 columns)
    { i: 'kpi_total_sales', x: 0, y: 4, w: 3, h: 3, minW: 3, minH: 2 },
    { i: 'kpi_active_users', x: 3, y: 4, w: 3, h: 3, minW: 3, minH: 2 },
    // Full-width widgets stacked
    { i: 'chart_trend', x: 0, y: 7, w: 6, h: 7, minW: 4, minH: 4 },
    { i: 'table_users', x: 0, y: 14, w: 6, h: 6, minW: 4, minH: 4 },
  ],
};

export const DEFAULT_DASHBOARD_STATE: DashboardState = {
  schemaVersion: 1,
  layouts: DEFAULT_LAYOUTS,
  draftLayouts: DEFAULT_LAYOUTS,
  widgetsById: DEFAULT_WIDGETS_BY_ID,
};


