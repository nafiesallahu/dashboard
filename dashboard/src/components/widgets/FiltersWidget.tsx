import { memo } from 'react';

import { DatasetFilter } from '../filters/DatasetFilter';
import { DateRangeFilter } from '../filters/DateRangeFilter';
import { RegionFilter } from '../filters/RegionFilter';

export type FiltersWidgetProps = {
  id: string;
};

function FiltersWidgetImpl({ id }: FiltersWidgetProps) {
  return (
    <div className="flex h-full min-w-0 flex-col" data-widget-id={id}>
      <div className="flex flex-wrap items-center gap-3">
        <DatasetFilter />
        <DateRangeFilter />
        <RegionFilter />
      </div>
      <div className="mt-auto text-xs text-gray-500">
        These are global filters — changing them updates all visible widgets.
      </div>
    </div>
  );
}

export const FiltersWidget = memo(FiltersWidgetImpl);


