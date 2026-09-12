import { activitiesDb, productsDb } from '@/mocks/db'
import { mockApi } from '@/mocks/mockApi'
import type { ActivityItem, DashboardStats } from '@/features/dashboard/types'

export const dashboardKeys = {
  stats: ['dashboard', 'stats'] as const,
  activities: ['dashboard', 'activities'] as const,
}

const LOW_STOCK_THRESHOLD = 5

// NOTE: 실제 백엔드 연동 시 이 파일의 mockApi 호출을 아래 형태로 교체한다.
//   import { api } from '@/lib/apiClient'
//   return api.get<DashboardStats>('/dashboard/stats')
export async function fetchDashboardStats(): Promise<DashboardStats> {
  const activeProducts = productsDb.filter(
    (product) => product.status === 'active',
  )
  const totalStockValue = activeProducts.reduce(
    (sum, product) => sum + product.price * product.stock,
    0,
  )
  const lowStockCount = activeProducts.filter(
    (product) => product.stock > 0 && product.stock <= LOW_STOCK_THRESHOLD,
  ).length

  return mockApi.delay({
    totalProducts: productsDb.length,
    activeProducts: activeProducts.length,
    totalStockValue,
    lowStockCount,
  })
}

export async function fetchRecentActivities(): Promise<ActivityItem[]> {
  return mockApi.delay(activitiesDb)
}
