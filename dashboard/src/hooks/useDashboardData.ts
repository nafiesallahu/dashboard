import { useQuery } from '@tanstack/react-query';

import { fetchDashboardData } from '../services/mockApi';

export function useDashboardData() {
  // TODO: accept filters as params and include them in the query key.
  return useQuery({
    queryKey: ['dashboard'],
    queryFn: fetchDashboardData,
  });
}


