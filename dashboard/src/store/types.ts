import type { Layout } from 'react-grid-layout';

// Breakpoints + RGL types
export type Breakpoint = 'lg' | 'md' | 'sm';

export type GridLayoutItem = Layout;

// Filters
export type DateRange = '30d' | '90d' | '365d';
export type Region = 'all' | 'us' | 'eu' | 'apac';
export type Dataset = 'default' | 'alt';

export type FiltersState = {
  dateRange: DateRange;
  region: Region;
  dataset: Dataset;
};

// Widgets
export type WidgetType = 'kpi' | 'chart' | 'table' | 'filters';

export type KpiMetric = 'totalSales' | 'activeUsers' | 'engagementRate';
export type KpiSettings = { metric: KpiMetric };

export type ChartType = 'line' | 'bar' | 'pie';
export type ChartMetric = 'sales' | 'users' | 'engagement';
export type ChartSettings = { chartType: ChartType; metric: ChartMetric };

export type TableSettings = { pageSize: number; textFilter: string };

export type FiltersWidgetSettings = Record<never, never>;

export type WidgetBase = {
  id: string;
  title: string;
  type: WidgetType;
  visible: boolean;
};

export type KpiWidgetConfig = WidgetBase & { type: 'kpi'; settings: KpiSettings };
export type ChartWidgetConfig = WidgetBase & { type: 'chart'; settings: ChartSettings };
export type TableWidgetConfig = WidgetBase & { type: 'table'; settings: TableSettings };
export type FiltersWidgetConfig = WidgetBase & { type: 'filters'; settings: FiltersWidgetSettings };

export type WidgetConfig = KpiWidgetConfig | ChartWidgetConfig | TableWidgetConfig | FiltersWidgetConfig;

// Dashboard layouts + state
export type DashboardLayouts = Partial<Record<Breakpoint, GridLayoutItem[]>>;

export type DashboardState = {
  schemaVersion: number;
  layouts: DashboardLayouts;
  draftLayouts: DashboardLayouts;
  widgetsById: Record<string, WidgetConfig>;
};

// Strongly-typed helper for settings updates
export type WidgetSettingsByType = {
  kpi: KpiSettings;
  chart: ChartSettings;
  table: TableSettings;
  filters: FiltersWidgetSettings;
};

export type UpdateWidgetSettingsPayload =
  | { id: string; type: 'kpi'; patch: Partial<KpiSettings> }
  | { id: string; type: 'chart'; patch: Partial<ChartSettings> }
  | { id: string; type: 'table'; patch: Partial<TableSettings> }
  | { id: string; type: 'filters'; patch: Partial<FiltersWidgetSettings> };


