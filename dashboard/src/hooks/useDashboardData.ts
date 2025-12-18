import { useQuery } from '@tanstack/react-query';
import type { FiltersState } from '../store/types';

import { getDashboardData } from '../services/mockApi';

export function useDashboardData(filters: FiltersState) {
  return useQuery({
    queryKey: ['dashboard', filters.dateRange, filters.region, filters.dataset],
    queryFn: () => getDashboardData(filters),
    staleTime: 5 * 60 * 1000,
    retry: 1,
    refetchOnWindowFocus: false,
  });
}


