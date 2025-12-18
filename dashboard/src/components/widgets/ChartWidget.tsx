import type { ChartSettings } from '../../store/types';

import { memo, useCallback, useLayoutEffect, useMemo, useRef, useState } from 'react';
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
import { useDashboardStore } from '../../store/dashboardStore';
import { ErrorState } from '../shared/ErrorState';
import { Skeleton } from '../shared/Skeleton';

export type ChartWidgetProps = {
  id: string;
  settings: ChartSettings;
};

type TimePoint = { date: string; value: number };

const COLORS = ['#4f46e5', '#06b6d4', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6'];

type PieSlice = { name: string; value: number };

function buildPieSlices(series: TimePoint[], topN = 6): PieSlice[] {
  const sorted = [...series].sort((a, b) => b.value - a.value);
  const top: PieSlice[] = sorted.slice(0, topN).map((p) => ({ name: p.date, value: p.value }));
  const rest = sorted.slice(topN);
  const otherValue = rest.reduce((sum, p) => sum + p.value, 0);
  if (otherValue > 0) top.push({ name: 'Other', value: otherValue });
  return top.sort((a, b) => b.value - a.value);
}

function ChartWidgetImpl({ id, settings }: ChartWidgetProps) {
  const filters = useDashboardStore((s) => s.filters);
  const updateWidgetSettings = useDashboardStore((s) => s.updateWidgetSettings);
  const { data, isLoading, isError } = useDashboardData(filters);
  const containerRef = useRef<HTMLDivElement | null>(null);
  // Start with a safe non-zero fallback so the chart never renders "invisible" on first paint.
  const [size, setSize] = useState<{ width: number; height: number }>({ width: 640, height: 260 });

  // In some layouts (notably react-grid-layout), ResponsiveContainer's internal measurement can
  // miss initial sizing. We measure the container ourselves and feed fixed numbers to Recharts.
  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const measure = () => {
      const width = el.clientWidth;
      const height = el.clientHeight;
      if (width > 0 && height > 0) setSize({ width, height });
    };

    measure();

    // Keep measuring until we see a real size (RGL can size after first paint).
    // We cap the loop for safety, but this is long enough to cover slow layout.
    let raf = 0;
    let tries = 0;
    const tick = () => {
      tries += 1;
      measure();
      const hasRealSize = el.clientWidth > 0 && el.clientHeight > 0;
      if (!hasRealSize && tries < 120) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    const timeout = window.setTimeout(() => measure(), 50);

    const ro = new ResizeObserver(() => measure());
    ro.observe(el);
    window.addEventListener('resize', measure);
    return () => {
      if (raf) cancelAnimationFrame(raf);
      window.clearTimeout(timeout);
      window.removeEventListener('resize', measure);
      ro.disconnect();
    };
  }, []);

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

    // pie - center the pie in the widget
    return (
      <PieChart>
        <Tooltip />
        <Legend layout="vertical" align="right" verticalAlign="middle" wrapperStyle={{ fontSize: 12 }} />
        <Pie
          data={pieSlices}
          dataKey="value"
          nameKey="name"
          cx="40%"
          cy="50%"
          innerRadius={40}
          outerRadius={80}
        >
          {pieSlices.map((_, idx) => (
            <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
          ))}
        </Pie>
      </PieChart>
    );
  }, [pieSlices, series, settings.chartType]);

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
      </div>

      <div ref={containerRef} className="flex-1 min-h-[220px] min-w-0 w-full">
        <ResponsiveContainer width={size.width} height={size.height}>
          {chartNode ?? <div />}
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export const ChartWidget = memo(ChartWidgetImpl);


