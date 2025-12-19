import { memo } from 'react';

import { useDashboardStore, useWidgetById } from '../../store/dashboardStore';
import type { ChartWidgetConfig, FiltersWidgetConfig, KpiWidgetConfig, TableWidgetConfig } from '../../store/types';

import { ChartWidget } from '../widgets/ChartWidget';
import { FiltersWidget } from '../widgets/FiltersWidget';
import { KpiWidget } from '../widgets/KpiWidget';
import { TableWidget } from '../widgets/TableWidget';
import { WidgetFrame } from './WidgetFrame';

const registry = {
  kpi: KpiWidget,
  chart: ChartWidget,
  table: TableWidget,
  filters: FiltersWidget,
} as const;

function WidgetRendererImpl({ id }: { id: string }) {
  const widget = useWidgetById(id);
  const setWidgetVisibility = useDashboardStore((s) => s.setWidgetVisibility);

  if (!widget) return null;
  if (!widget.visible) return null;

  const onHide = () => setWidgetVisibility(id, false);

  if (widget.type === 'kpi') {
    const Component = registry.kpi;
    const w: KpiWidgetConfig = widget;
    return (
      <WidgetFrame id={id} title={w.title} onHide={onHide}>
        <Component id={id} settings={w.settings} />
      </WidgetFrame>
    );
  }

  if (widget.type === 'chart') {
    const Component = registry.chart;
    const w: ChartWidgetConfig = widget;
    return (
      <WidgetFrame id={id} title={w.title} onHide={onHide}>
        <Component id={id} settings={w.settings} />
      </WidgetFrame>
    );
  }

  if (widget.type === 'filters') {
    const Component = registry.filters;
    const w: FiltersWidgetConfig = widget;
    return (
      <WidgetFrame id={id} title={w.title} onHide={onHide}>
        <Component id={id} />
      </WidgetFrame>
    );
  }

  // widget.type === 'table'
  const Component = registry.table;
  const w: TableWidgetConfig = widget;
  return (
    <WidgetFrame id={id} title={w.title} onHide={onHide}>
      <Component id={id} settings={w.settings} />
    </WidgetFrame>
  );
}

export const WidgetRenderer = memo(WidgetRendererImpl);


