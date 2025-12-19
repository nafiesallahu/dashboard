import { useDashboardStore } from '../../store/dashboardStore';

export function DateRangeFilter() {
  const filters = useDashboardStore((s) => s.filters);
  const setFilter = useDashboardStore((s) => s.setFilter);

  return (
    <label className="flex items-center gap-2 text-sm text-gray-600">
      <span className="text-xs font-medium uppercase tracking-wide text-gray-500">Range</span>
      <select
        className="h-9 rounded-md border bg-white px-3 text-sm text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
        value={filters.dateRange}
        onChange={(e) => setFilter({ dateRange: e.target.value as typeof filters.dateRange })}
      >
        <option value="30d">Last 30 days</option>
        <option value="90d">Last 90 days</option>
        <option value="365d">Last 365 days</option>
      </select>
    </label>
  );
}


