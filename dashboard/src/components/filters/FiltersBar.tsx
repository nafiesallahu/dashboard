import { useDashboardStore } from '../../store/dashboardStore';

export function FiltersBar() {
  const filters = useDashboardStore((s) => s.filters);
  const setFilter = useDashboardStore((s) => s.setFilter);

  return (
    <div className="rounded-xl border bg-white px-4 py-3 shadow-sm">
      <div className="flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-2 text-sm text-gray-600">
          <span className="text-xs font-medium uppercase tracking-wide text-gray-500">Dataset</span>
          <select
            className="h-9 rounded-md border bg-white px-3 text-sm text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            value={filters.dataset}
            onChange={(e) => setFilter({ dataset: e.target.value as typeof filters.dataset })}
          >
            <option value="default">Default</option>
            <option value="alt">Alt</option>
          </select>
        </label>

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

        <label className="flex items-center gap-2 text-sm text-gray-600">
          <span className="text-xs font-medium uppercase tracking-wide text-gray-500">Region</span>
          <select
            className="h-9 rounded-md border bg-white px-3 text-sm text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            value={filters.region}
            onChange={(e) => setFilter({ region: e.target.value as typeof filters.region })}
          >
            <option value="all">All</option>
            <option value="us">US</option>
            <option value="eu">EU</option>
            <option value="apac">APAC</option>
          </select>
        </label>
      </div>
    </div>
  );
}


