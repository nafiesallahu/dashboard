import type { TableSettings } from '../../store/types';

import { memo, useMemo, useState } from 'react';
import type { ColumnDef, SortingState } from '@tanstack/react-table';
import { flexRender, getCoreRowModel, getPaginationRowModel, getSortedRowModel, useReactTable } from '@tanstack/react-table';

import { useDashboardData } from '../../hooks/useDashboardData';
import { useDashboardStore } from '../../store/dashboardStore';
import { downloadCsv, toCsv } from '../../utils/csv';
import { buildTablePdf, downloadPdf } from '../../utils/pdf';
import { formatCurrency } from '../../utils/format';
import { DatasetFilter } from '../filters/DatasetFilter';
import { ErrorState } from '../shared/ErrorState';
import { Skeleton } from '../shared/Skeleton';

export type TableWidgetProps = {
  id: string;
  settings: TableSettings;
};

type TableRow = {
  id: string;
  name: string;
  email: string;
  country: string;
  status: 'active' | 'inactive';
  sales: number;
};

function normalize(s: string) {
  return s.trim().toLowerCase();
}

function SortIcon({ state }: { state: false | 'asc' | 'desc' }) {
  // Minimal, readable icon set:
  // - unsorted: ⇅
  // - asc: ▲
  // - desc: ▼
  const label = state === 'asc' ? 'Sorted ascending' : state === 'desc' ? 'Sorted descending' : 'Not sorted';
  const glyph = state === 'asc' ? '▲' : state === 'desc' ? '▼' : '⇅';
  const muted = state === false ? 'text-slate-400' : 'text-slate-700';
  return (
    <span className={`text-[10px] leading-none ${muted}`} aria-label={label}>
      {glyph}
    </span>
  );
}

function TableWidgetImpl({ id, settings }: TableWidgetProps) {
  const filters = useDashboardStore((s) => s.filters);
  const updateWidgetSettings = useDashboardStore((s) => s.updateWidgetSettings);

  const { data, isLoading, isError } = useDashboardData(filters);

  const baseRows: TableRow[] = (data?.tableRows ?? []) as TableRow[];

  const filteredRows = useMemo(() => {
    const q = normalize(settings.textFilter);
    if (!q) return baseRows;
    return baseRows.filter((r) => {
      const haystack = `${r.name} ${r.email} ${r.country} ${r.status}`.toLowerCase();
      return haystack.includes(q);
    });
  }, [baseRows, settings.textFilter]);

  const columns = useMemo<ColumnDef<TableRow>[]>(() => {
    return [
      { accessorKey: 'name', header: 'Name', enableSorting: true, cell: (info) => info.getValue<string>() },
      { accessorKey: 'email', header: 'Email', enableSorting: true, cell: (info) => info.getValue<string>() },
      { accessorKey: 'country', header: 'Country', enableSorting: true, cell: (info) => info.getValue<string>() },
      {
        accessorKey: 'status',
        header: 'Status',
        enableSorting: true,
        cell: (info) => {
          const v = info.getValue<'active' | 'inactive'>();
          return (
            <span
              className={
                v === 'active'
                  ? 'rounded-full bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700'
                  : 'rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700'
              }
            >
              {v}
            </span>
          );
        },
      },
      {
        accessorKey: 'sales',
        header: 'Sales',
        enableSorting: true,
        cell: (info) => <span className="font-medium">{formatCurrency(info.getValue<number>())}</span>,
      },
    ];
  }, []);

  const [sorting, setSorting] = useState<SortingState>([]);
  const [pageIndex, setPageIndex] = useState(0);

  const table = useReactTable({
    data: filteredRows,
    columns,
    state: {
      sorting,
      pagination: { pageIndex, pageSize: settings.pageSize },
    },
    onSortingChange: setSorting,
    enableSorting: true,
    enableSortingRemoval: true,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  if (isLoading) return <Skeleton />;
  if (isError || !data) return <ErrorState />;

  const pageCount = table.getPageCount();
  const canPrev = table.getCanPreviousPage();
  const canNext = table.getCanNextPage();

  const exportCsv = () => {
    const sortedAll = table.getSortedRowModel().rows.map((r) => r.original);
    const csvText = toCsv(sortedAll, [
      { key: 'name', header: 'Name' },
      { key: 'email', header: 'Email' },
      { key: 'country', header: 'Country' },
      { key: 'status', header: 'Status' },
      { key: 'sales', header: 'Sales' },
    ]);
    downloadCsv(`users-${filters.dateRange}-${filters.region}.csv`, csvText);
  };

  const exportPdf = () => {
    const sortedAll = table.getSortedRowModel().rows.map((r) => r.original);
    const bytes = buildTablePdf<TableRow>({
      title: `Users (${filters.dateRange}, ${filters.region.toUpperCase()}, ${filters.dataset})`,
      columns: [
        { key: 'name', header: 'Name' },
        { key: 'email', header: 'Email' },
        { key: 'country', header: 'Country' },
        { key: 'status', header: 'Status' },
        { key: 'sales', header: 'Sales' },
      ],
      rows: sortedAll,
    });
    downloadPdf(`users-${filters.dateRange}-${filters.region}-${filters.dataset}.pdf`, bytes);
  };

  return (
    <div className="flex h-full min-h-0 min-w-0 flex-col">
      <div className="flex shrink-0 flex-col gap-3 pb-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-3">
            <DatasetFilter />
            <input
              className="w-full rounded-md border bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 sm:max-w-xs"
              placeholder="Filter…"
              value={settings.textFilter}
              onChange={(e) => {
                setPageIndex(0);
                updateWidgetSettings({ id, type: 'table', patch: { textFilter: e.target.value } });
              }}
            />
          </div>
        </div>

        <div className="flex items-center gap-2 sm:justify-end">
          <button
            type="button"
            className="rounded-md border px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            onClick={exportCsv}
          >
            Export CSV
          </button>
          <button
            type="button"
            className="rounded-md border px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            onClick={exportPdf}
          >
            Export PDF
          </button>
        </div>
      </div>

      <div className="min-h-0 min-w-0 flex-1 overflow-auto rounded-lg border">
        <table className="w-full min-w-0 border-collapse text-sm">
          <thead className="sticky top-0 bg-slate-50 text-xs font-medium uppercase tracking-wide text-slate-600">
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id} className="border-b">
                {hg.headers.map((h) => {
                  const canSort = h.column.getCanSort();
                  const sorted = h.column.getIsSorted();

                  return (
                    <th key={h.id} className="px-3 py-2 text-left">
                      {h.isPlaceholder ? null : canSort ? (
                        <button
                          type="button"
                          className="inline-flex items-center gap-1 hover:text-slate-900"
                          onClick={h.column.getToggleSortingHandler()}
                        >
                          {flexRender(h.column.columnDef.header, h.getContext())}
                          <SortIcon state={sorted} />
                        </button>
                      ) : (
                        flexRender(h.column.columnDef.header, h.getContext())
                      )}
                    </th>
                  );
                })}
              </tr>
            ))}
          </thead>

          <tbody className="text-gray-900">
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id} className="border-b last:border-b-0 hover:bg-slate-50">
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-3 py-2 align-middle">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}

            {table.getRowModel().rows.length === 0 ? (
              <tr>
                <td className="px-3 py-6 text-center text-sm text-gray-500" colSpan={columns.length}>
                  No results
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      <div className="mt-3 flex shrink-0 items-center justify-between gap-3 text-sm text-gray-700">
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="rounded-md border px-3 py-1.5 text-sm font-medium hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
            onClick={() => setPageIndex((p) => Math.max(0, p - 1))}
            disabled={!canPrev}
          >
            Prev
          </button>
          <button
            type="button"
            className="rounded-md border px-3 py-1.5 text-sm font-medium hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
            onClick={() => setPageIndex((p) => Math.min(pageCount - 1, p + 1))}
            disabled={!canNext}
          >
            Next
          </button>

          <span className="text-sm text-gray-600">
            Page {pageCount === 0 ? 0 : pageIndex + 1} of {pageCount}
          </span>
        </div>

        <label className="flex items-center gap-2 text-sm text-gray-600">
          <span className="text-xs font-medium uppercase tracking-wide text-gray-500">Page size</span>
          <select
            className="rounded-md border bg-white px-2 py-1.5 text-sm text-gray-900"
            value={settings.pageSize}
            onChange={(e) => {
              const next = Number(e.target.value);
              setPageIndex(0);
              updateWidgetSettings({ id, type: 'table', patch: { pageSize: next } });
            }}
          >
            <option value={4}>4</option>
            <option value={6}>6</option>
            <option value={10}>10</option>
          </select>
        </label>
      </div>
    </div>
  );
}

export const TableWidget = memo(TableWidgetImpl);


