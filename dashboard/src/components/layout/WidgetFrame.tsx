import type { ReactNode } from 'react';

export function WidgetFrame({ title, children }: { title: string; children: ReactNode }) {
  // TODO: common widget chrome (title, actions, loading/error states).
  return (
    <section className="rounded-lg border bg-white p-4">
      <div className="mb-2 text-sm font-medium text-gray-900">WidgetFrame</div>
      <div className="text-xs text-gray-500">{title}</div>
      <div className="mt-3">{children}</div>
    </section>
  );
}


