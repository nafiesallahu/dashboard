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
    <section className="h-full overflow-hidden rounded-xl border bg-white">
      <div className="flex shrink-0 items-center justify-between gap-3 border-b px-4 py-3">
        <div className="drag-handle inline-flex cursor-move select-none items-center gap-2 rounded-md bg-slate-50 px-2 py-1 text-xs font-medium text-slate-700">
          Drag
        </div>

        <div className="min-w-0 flex-1 truncate text-sm font-semibold text-gray-900">{title}</div>

        <button
          type="button"
          className="rounded-md border px-2 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50"
          onClick={onHide}
        >
          Hide
        </button>
      </div>

      <div className="flex min-h-0 flex-1 flex-col p-4">{children}</div>
    </section>
  );
}

export const WidgetFrame = memo(WidgetFrameImpl);


