import type { KpiSettings } from '../../store/types';

import { memo, useMemo } from 'react';

import { useDashboardData } from '../../hooks/useDashboardData';
import { useDashboardStore } from '../../store/dashboardStore';
import { formatCurrency, formatNumber, formatPercent } from '../../utils/format';
import { ErrorState } from '../shared/ErrorState';
import { Skeleton } from '../shared/Skeleton';

export type KpiWidgetProps = {
  id: string;
  settings: KpiSettings;
};

const METRIC_LABEL: Record<KpiSettings['metric'], string> = {
  totalSales: 'Total Sales',
  activeUsers: 'Active Users',
  engagementRate: 'Engagement Rate',
};

function KpiWidgetImpl({ settings }: KpiWidgetProps) {
  const filters = useDashboardStore((s) => s.filters);
  const { data, isLoading, isError } = useDashboardData(filters);

  const { label, displayValue } = useMemo(() => {
    const label = METRIC_LABEL[settings.metric];
    if (!data) return { label, displayValue: '' };

    if (settings.metric === 'totalSales') return { label, displayValue: formatCurrency(data.kpis.totalSales) };
    if (settings.metric === 'activeUsers') return { label, displayValue: formatNumber(data.kpis.activeUsers) };
    return { label, displayValue: formatPercent(data.kpis.engagementRate) };
  }, [data, settings.metric]);

  if (isLoading) return <Skeleton />;
  if (isError || !data) return <ErrorState />;

  return (
    <div className="flex h-full flex-col justify-between">
      <div className="text-xs font-medium uppercase tracking-wide text-gray-500">{label}</div>
      <div className="text-4xl font-semibold tracking-tight text-gray-900">{displayValue}</div>
      <div className="text-xs text-gray-500">
        {filters.region.toUpperCase()} · {filters.dateRange}
      </div>
    </div>
  );
}

export const KpiWidget = memo(KpiWidgetImpl);


