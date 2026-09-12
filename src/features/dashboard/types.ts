export interface DashboardStats {
  totalProducts: number
  activeProducts: number
  totalStockValue: number
  lowStockCount: number
}

export interface ActivityItem {
  id: string
  actor: string
  action: string
  target: string
  createdAt: string
}
