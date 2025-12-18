import type { TableSettings } from '../../store/types';

export function TableWidget({ id, settings }: { id: string; settings: TableSettings }) {
  // TODO: render a TanStack table with settings.pageSize and settings.textFilter.
  return (
    <div className="flex h-full flex-col justify-between">
      <div className="text-xs text-gray-500">TableWidget</div>
      <div className="text-sm font-medium text-gray-900">{id}</div>
      <div className="text-xs text-gray-600">
        pageSize: {settings.pageSize} · filter: “{settings.textFilter}”
      </div>
    </div>
  );
}


