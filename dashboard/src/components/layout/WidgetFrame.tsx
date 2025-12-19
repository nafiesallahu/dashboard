import type { ReactNode } from 'react';
import { memo } from 'react';

export type WidgetFrameProps = {
  id: string;
  title: string;
  onHide: () => void;
  children: ReactNode;
};

function WidgetFrameImpl({ title, onHide, children }: WidgetFrameProps) {
  return (
    <section className="flex h-full flex-col overflow-hidden rounded-xl border bg-white shadow-sm">
      <div className="flex shrink-0 items-center justify-between gap-3 border-b px-4 py-3">
        <div className="flex min-w-0 items-center gap-3">
          <div
            className="drag-handle inline-flex cursor-move select-none items-center rounded-md bg-slate-50 px-2 py-1 text-slate-700"
            aria-label="Drag widget"
            title="Drag"
          >
            <span className="sr-only">Drag</span>
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              className="h-4 w-4"
              fill="currentColor"
            >
              <path d="M12 2l3.5 3.5-1.4 1.4L13 5.8V10h4.2l-1.1-1.1 1.4-1.4L22 12l-3.5 3.5-1.4-1.4 1.1-1.1H13v4.2l1.1-1.1 1.4 1.4L12 22l-3.5-3.5 1.4-1.4 1.1 1.1V13H6.8l1.1 1.1-1.4 1.4L2 12l3.5-3.5 1.4 1.4L5.8 10H11V5.8L9.9 6.9 8.5 5.5 12 2z" />
            </svg>
          </div>

          <div className="min-w-0 truncate text-sm font-semibold text-gray-900">{title}</div>
        </div>

        <button
          type="button"
          className="rounded-md border px-2 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50"
          onClick={onHide}
        >
          Hide
        </button>
      </div>

      <div className="flex min-h-0 min-w-0 flex-1 flex-col p-4">{children}</div>
    </section>
  );
}

export const WidgetFrame = memo(WidgetFrameImpl);


