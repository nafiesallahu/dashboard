import type { ChartSettings } from '../../store/types';

import { memo, useCallback, useMemo } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { useDashboardData } from '../../hooks/useDashboardData';
import { useElementSize } from '../../hooks/useElementSize';
import { useDashboardStore } from '../../store/dashboardStore';
import { downloadCsv, toCsv } from '../../utils/csv';
import { ErrorState } from '../shared/ErrorState';
import { Skeleton } from '../shared/Skeleton';

export type ChartWidgetProps = {
  id: string;
  settings: ChartSettings;
};

type TimePoint = { date: string; value: number };

const PRIMARY_COLOR = '#5101a7';
const PIE_COLORS = [
  '#06b6d4', // cyan
  '#22c55e', // green
  '#f59e0b', // amber
  '#ef4444', // red
  '#8b5cf6', // purple
  '#ec4899', // pink
];

type PieSlice = { name: string; value: number };

function buildPieSlices(series: TimePoint[], topN = 6): PieSlice[] {
  const sorted = [...series].sort((a, b) => b.value - a.value);
  const top: PieSlice[] = sorted.slice(0, topN).map((p) => ({ name: p.date, value: p.value }));
  const rest = sorted.slice(topN);
  const otherValue = rest.reduce((sum, p) => sum + p.value, 0);
  if (otherValue > 0) top.push({ name: 'Other', value: otherValue });
  return top.sort((a, b) => b.value - a.value);
}

function sanitizeFilenamePart(value: string): string {
  return value
    .trim()
    .replace(/\s+/g, '_')
    .replace(/[^a-zA-Z0-9._-]/g, '_');
}

function ChartWidgetImpl({ id, settings }: ChartWidgetProps) {
  const filters = useDashboardStore((s) => s.filters);
  const updateWidgetSettings = useDashboardStore((s) => s.updateWidgetSettings);
  const { data, isLoading, isError } = useDashboardData(filters);
  const { ref: containerRef, width, height } = useElementSize<HTMLDivElement>();

  const series = useMemo<TimePoint[]>(() => {
    if (!data) return [];
    if (settings.metric === 'sales') return data.series.sales;
    if (settings.metric === 'users') return data.series.users;
    return data.series.engagement;
  }, [data, settings.metric]);

  const onMetricChange = useCallback(
    (value: ChartSettings['metric']) => {
      updateWidgetSettings({ id, type: 'chart', patch: { metric: value } });
    },
    [id, updateWidgetSettings],
  );

  const onChartTypeChange = useCallback(
    (value: ChartSettings['chartType']) => {
      updateWidgetSettings({ id, type: 'chart', patch: { chartType: value } });
    },
    [id, updateWidgetSettings],
  );

  const pieSlices = useMemo<PieSlice[]>(() => {
    if (settings.chartType !== 'pie') return [];
    return buildPieSlices(series, 6);
  }, [series, settings.chartType]);

  const exportPayload = useMemo(() => {
    const filename = `chart_${sanitizeFilenamePart(settings.metric)}_${sanitizeFilenamePart(settings.chartType)}_${sanitizeFilenamePart(filters.dateRange)}_${sanitizeFilenamePart(filters.region)}_${sanitizeFilenamePart(filters.dataset)}.csv`;

    if (settings.chartType === 'pie') {
      const rows = pieSlices.map((p) => ({ name: p.name, value: p.value }));
      return {
        filename,
        csvText: toCsv(rows, [
          { key: 'name', header: 'name' },
          { key: 'value', header: 'value' },
        ]),
        disabled: rows.length === 0,
      };
    }

    const rows = series.map((p) => ({ label: p.date, value: p.value }));
    return {
      filename,
      csvText: toCsv(rows, [
        { key: 'label', header: 'label' },
        { key: 'value', header: 'value' },
      ]),
      disabled: rows.length === 0,
    };
  }, [
    filters.dataset,
    filters.dateRange,
    filters.region,
    pieSlices,
    series,
    settings.chartType,
    settings.metric,
  ]);

  const onExportCsv = useCallback(() => {
    if (exportPayload.disabled) return;
    downloadCsv(exportPayload.filename, exportPayload.csvText);
  }, [exportPayload.csvText, exportPayload.disabled, exportPayload.filename]);

  const isCompact = useMemo(() => {
  
    return width < 420 || height < 260;
  }, [height, width]);

  const isTiny = useMemo(() => {
    return width < 340 || height < 220;
  }, [height, width]);

  const axisFontSize = isCompact ? 10 : 12;

  const pieLegendMode = useMemo<'right' | 'bottom' | 'none'>(() => {
    if (settings.chartType !== 'pie') return 'none';
    if (isTiny) return 'none';
    // Prefer a vertical legend on the right when there's room; otherwise use a bottom legend.
    if (width >= 680 && height >= 280) return 'right';
    return 'bottom';
  }, [height, isTiny, settings.chartType, width]);

  const pieOuterRadius = useMemo(() => {
    const legendBottomH = pieLegendMode === 'bottom' ? Math.min(92, Math.round(height * 0.36)) : 0;
    const legendRightW = pieLegendMode === 'right' ? Math.min(240, Math.round(width * 0.34)) : 0;

    const availableW = Math.max(0, width - legendRightW);
    const availableH = Math.max(0, height - legendBottomH);
    const base = Math.min(availableW, availableH);

    const mult = isCompact ? 0.28 : 0.34;
    return Math.max(24, Math.min(160, Math.round(base * mult)));
  }, [height, isCompact, pieLegendMode, width]);

  const pieInnerRadius = Math.max(16, Math.round(pieOuterRadius * 0.55));

  const chartNode = useMemo(() => {
    if (series.length === 0) return null;

    if (settings.chartType === 'line') {
      return (
        <LineChart data={series}>
          <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" />
          <XAxis dataKey="date" tick={{ fontSize: axisFontSize }} />
          <YAxis tick={{ fontSize: axisFontSize }} />
          <Tooltip />
          <Line type="monotone" dataKey="value" stroke={PRIMARY_COLOR} strokeWidth={2} dot={false} />
        </LineChart>
      );
    }

    if (settings.chartType === 'bar') {
      return (
        <BarChart data={series}>
          <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" />
          <XAxis dataKey="date" tick={{ fontSize: axisFontSize }} />
          <YAxis tick={{ fontSize: axisFontSize }} />
          <Tooltip />
          <Bar dataKey="value" fill={PRIMARY_COLOR} radius={[4, 4, 0, 0]} />
        </BarChart>
      );
    }

    return (
      <PieChart>
        <Tooltip />
        {pieLegendMode === 'right' ? (
          <Legend
            layout="vertical"
            align="right"
            verticalAlign="middle"
            wrapperStyle={{ fontSize: isCompact ? 10 : 12, maxHeight: height - 8, overflowY: 'auto' }}
          />
        ) : pieLegendMode === 'bottom' ? (
          <Legend
            layout="horizontal"
            align="center"
            verticalAlign="bottom"
            wrapperStyle={{ fontSize: isCompact ? 10 : 12, width: '100%', maxHeight: 88, overflowY: 'auto' }}
          />
        ) : null}
        <Pie
          data={pieSlices}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy={pieLegendMode === 'bottom' ? '46%' : '50%'}
          innerRadius={pieInnerRadius}
          outerRadius={pieOuterRadius}
        >
          {pieSlices.map((_, idx) => (
            <Cell key={idx} fill={idx === 0 ? PRIMARY_COLOR : PIE_COLORS[(idx - 1) % PIE_COLORS.length]} />
          ))}
        </Pie>
      </PieChart>
    );
  }, [axisFontSize, height, isCompact, pieInnerRadius, pieLegendMode, pieOuterRadius, pieSlices, series, settings.chartType]);

  if (isLoading) return <Skeleton />;
  if (isError || !data) return <ErrorState />;
  if (series.length === 0)
    return <div className="rounded-md border bg-slate-50 px-3 py-2 text-sm text-slate-600">No data</div>;

  return (
    <div className="flex h-full min-w-0 flex-col">
      <div className="shrink-0 flex items-center gap-2 pb-2">
        <select
          className="rounded-md border bg-white px-2 py-1.5 text-sm text-gray-900"
          value={settings.metric}
          onChange={(e) => onMetricChange(e.target.value as ChartSettings['metric'])}
        >
          <option value="sales">Sales</option>
          <option value="users">Users</option>
          <option value="engagement">Engagement</option>
        </select>

        <select
          className="rounded-md border bg-white px-2 py-1.5 text-sm text-gray-900"
          value={settings.chartType}
          onChange={(e) => onChartTypeChange(e.target.value as ChartSettings['chartType'])}
        >
          <option value="line">Line</option>
          <option value="bar">Bar</option>
          <option value="pie">Pie</option>
        </select>

        <button
          type="button"
          className="rounded-md border px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
          onClick={onExportCsv}
          disabled={exportPayload.disabled}
          title="Export the currently displayed series as CSV"
        >
          Export CSV
        </button>
      </div>

      <div ref={containerRef} className="flex-1 min-h-0 min-w-0 w-full">
        <ResponsiveContainer width="100%" height="100%">
          {chartNode ?? <div />}
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export const ChartWidget = memo(ChartWidgetImpl);


