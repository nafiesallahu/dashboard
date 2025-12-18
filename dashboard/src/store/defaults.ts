import type { DashboardLayouts, DashboardState, FiltersState, WidgetConfig } from './types';

export const DEFAULT_FILTERS = {
  dateRange: '90d',
  region: 'all',
  dataset: 'default',
} as const satisfies FiltersState;

export const DEFAULT_WIDGETS_BY_ID: Record<string, WidgetConfig> = {
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
    { i: 'kpi_total_sales', x: 0, y: 0, w: 3, h: 2, minW: 2, minH: 2 },
    { i: 'kpi_active_users', x: 3, y: 0, w: 3, h: 2, minW: 2, minH: 2 },
    { i: 'chart_trend', x: 0, y: 2, w: 8, h: 6, minW: 4, minH: 4 },
    { i: 'table_users', x: 8, y: 2, w: 4, h: 6, minW: 3, minH: 4 },
  ],
  md: [
    { i: 'kpi_total_sales', x: 0, y: 0, w: 5, h: 2, minW: 3, minH: 2 },
    { i: 'kpi_active_users', x: 5, y: 0, w: 5, h: 2, minW: 3, minH: 2 },
    { i: 'chart_trend', x: 0, y: 2, w: 10, h: 6, minW: 6, minH: 4 },
    { i: 'table_users', x: 0, y: 8, w: 10, h: 6, minW: 6, minH: 4 },
  ],
  sm: [
    { i: 'kpi_total_sales', x: 0, y: 0, w: 6, h: 2, minW: 4, minH: 2 },
    { i: 'kpi_active_users', x: 0, y: 2, w: 6, h: 2, minW: 4, minH: 2 },
    { i: 'chart_trend', x: 0, y: 4, w: 6, h: 6, minW: 4, minH: 4 },
    { i: 'table_users', x: 0, y: 10, w: 6, h: 6, minW: 4, minH: 4 },
  ],
};

export const DEFAULT_DASHBOARD_STATE: DashboardState = {
  schemaVersion: 1,
  layouts: DEFAULT_LAYOUTS,
  widgetsById: DEFAULT_WIDGETS_BY_ID,
};


