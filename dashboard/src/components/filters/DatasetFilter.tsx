import { useDashboardStore } from '../../store/dashboardStore';

export function DatasetFilter() {
  const filters = useDashboardStore((s) => s.filters);
  const setFilter = useDashboardStore((s) => s.setFilter);

  return (
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
  );
}
