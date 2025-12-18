import type { DashboardLayouts } from './types';

const STORAGE_KEY = 'dashboard.layout.v1';

export function loadLayouts(): DashboardLayouts | null {
  // TODO: version migrations and validation.
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as DashboardLayouts;
  } catch {
    return null;
  }
}

export function saveLayouts(layouts: DashboardLayouts) {
  // TODO: debounce writes and validate shape before saving.
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(layouts));
  } catch {
    // ignore
  }
}


