import type { ChartSettings } from '../../store/types';

export function ChartWidget({ id, settings }: { id: string; settings: ChartSettings }) {
  // TODO: render a Recharts chart using settings.metric and settings.chartType.
  return (
    <div className="flex h-full flex-col justify-between">
      <div className="text-xs text-gray-500">ChartWidget</div>
      <div className="text-sm font-medium text-gray-900">{id}</div>
      <div className="text-xs text-gray-600">
        {settings.chartType} · {settings.metric}
      </div>
    </div>
  );
}


