import type { ChartSettings } from '../../store/types';

import { memo, useCallback, useMemo } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
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
import { useDashboardStore } from '../../store/dashboardStore';
import { ErrorState } from '../shared/ErrorState';
import { Skeleton } from '../shared/Skeleton';

export type ChartWidgetProps = {
  id: string;
  settings: ChartSettings;
};

type TimePoint = { date: string; value: number };

const COLORS = ['#4f46e5', '#06b6d4', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6'];

function ChartWidgetImpl({ id, settings }: ChartWidgetProps) {
  const filters = useDashboardStore((s) => s.filters);
  const updateWidgetSettings = useDashboardStore((s) => s.updateWidgetSettings);
  const { data, isLoading, isError } = useDashboardData(filters);

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

  const chartNode = useMemo(() => {
    if (series.length === 0) return null;

    if (settings.chartType === 'line') {
      return (
        <LineChart data={series}>
          <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" />
          <XAxis dataKey="date" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip />
          <Line type="monotone" dataKey="value" stroke={COLORS[0]} strokeWidth={2} dot={false} />
        </LineChart>
      );
    }

    if (settings.chartType === 'bar') {
      return (
        <BarChart data={series}>
          <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" />
          <XAxis dataKey="date" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip />
          <Bar dataKey="value" fill={COLORS[1]} radius={[4, 4, 0, 0]} />
        </BarChart>
      );
    }

    // pie
    const pieData = series.map((p, idx) => ({ name: p.date, value: p.value, fill: COLORS[idx % COLORS.length] }));
    return (
      <PieChart>
        <Tooltip />
        <Legend />
        <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={40} outerRadius={80} />
      </PieChart>
    );
  }, [series, settings.chartType]);

  if (isLoading) return <Skeleton />;
  if (isError || !data) return <ErrorState />;
  if (series.length === 0) return <div className="text-sm text-gray-500">No data</div>;

  return (
    <div className="flex h-full flex-col">
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
      </div>

      <div className="flex-1 min-h-[220px]">
        <ResponsiveContainer width="100%" height="100%">
          {chartNode ?? <div />}
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export const ChartWidget = memo(ChartWidgetImpl);


