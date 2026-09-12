import { useQuery } from '@tanstack/react-query'
import {
  dashboardKeys,
  fetchDashboardStats,
  fetchRecentActivities,
} from '@/features/dashboard/api/dashboard'

export function useDashboardStats() {
  return useQuery({
    queryKey: dashboardKeys.stats,
    queryFn: fetchDashboardStats,
  })
}

export function useRecentActivities() {
  return useQuery({
    queryKey: dashboardKeys.activities,
    queryFn: fetchRecentActivities,
  })
}
