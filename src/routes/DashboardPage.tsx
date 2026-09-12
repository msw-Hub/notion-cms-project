import { Package, PackageCheck, PackageX, Wallet } from 'lucide-react'
import { PageHeader } from '@/components/common/PageHeader'
import { ErrorState } from '@/components/common/ErrorState'
import { DataTableSkeleton } from '@/components/common/DataTableSkeleton'
import { Skeleton } from '@/components/ui/skeleton'
import { StatCard } from '@/features/dashboard/components/StatCard'
import { RecentActivityTable } from '@/features/dashboard/components/RecentActivityTable'
import {
  useDashboardStats,
  useRecentActivities,
} from '@/features/dashboard/hooks/useDashboard'

const currencyFormatter = new Intl.NumberFormat('ko-KR', {
  style: 'currency',
  currency: 'KRW',
  maximumFractionDigits: 0,
})

export function DashboardPage() {
  const statsQuery = useDashboardStats()
  const activitiesQuery = useRecentActivities()

  return (
    <div className="space-y-6">
      <PageHeader
        title="대시보드"
        description="상품 현황을 한눈에 확인하세요."
      />

      {statsQuery.isError && <ErrorState error={statsQuery.error} />}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statsQuery.isPending &&
          Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-24 w-full" />
          ))}
        {statsQuery.data && (
          <>
            <StatCard
              label="전체 상품"
              value={`${statsQuery.data.totalProducts}개`}
              icon={Package}
            />
            <StatCard
              label="판매중 상품"
              value={`${statsQuery.data.activeProducts}개`}
              icon={PackageCheck}
            />
            <StatCard
              label="재고 자산 가치"
              value={currencyFormatter.format(statsQuery.data.totalStockValue)}
              icon={Wallet}
            />
            <StatCard
              label="재고 부족"
              value={`${statsQuery.data.lowStockCount}개`}
              icon={PackageX}
            />
          </>
        )}
      </div>

      <div className="rounded-xl border">
        <div className="border-b p-4 font-medium">최근 활동</div>
        <div className="p-4">
          {activitiesQuery.isError && (
            <ErrorState error={activitiesQuery.error} />
          )}
          {activitiesQuery.isPending && <DataTableSkeleton rows={5} />}
          {activitiesQuery.data && (
            <RecentActivityTable activities={activitiesQuery.data} />
          )}
        </div>
      </div>
    </div>
  )
}
