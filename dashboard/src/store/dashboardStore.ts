import { create } from 'zustand';

import { DEFAULT_LAYOUTS } from './defaults';
import type { DashboardLayouts } from './types';

export type DashboardStore = {
  layouts: DashboardLayouts;
  setLayouts: (layouts: DashboardLayouts) => void;
};

export const useDashboardStore = create<DashboardStore>((set) => ({
  // TODO: hydrate from persistence and add actions for widgets/filters.
  layouts: DEFAULT_LAYOUTS,
  setLayouts: (layouts) => set({ layouts }),
}));


