export type DashboardData = {
  // TODO: define real server contract for widgets/filters.
  updatedAt: string;
};

export async function fetchDashboardData(): Promise<DashboardData> {
  // TODO: replace with real HTTP calls (or MSW) later.
  return { updatedAt: new Date().toISOString() };
}


