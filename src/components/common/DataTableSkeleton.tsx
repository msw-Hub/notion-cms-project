import { Skeleton } from '@/components/ui/skeleton'

interface DataTableSkeletonProps {
  rows?: number
}

export function DataTableSkeleton({ rows = 5 }: DataTableSkeletonProps) {
  // 자리표시자용 행이라 고유 식별자가 없다 — 순서가 절대 바뀌지 않는 고정 개수 목록이라
  // 인덱스를 key로 써도 안전하다.
  return (
    <div className="space-y-2">
      {Array.from({ length: rows }).map((_, index) => (
        <Skeleton key={index} className="h-10 w-full" />
      ))}
    </div>
  )
}
