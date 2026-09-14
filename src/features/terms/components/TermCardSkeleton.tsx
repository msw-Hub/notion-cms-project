import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

// TermCard와 동일한 Card 골격을 공유하는 로딩 스켈레톤.
// 골격을 공유해야 실제 카드가 도착했을 때 높이 차이로 레이아웃이 튀지 않는다.
export function TermCardSkeleton() {
  return (
    <Card className="h-full">
      <CardHeader className="gap-2">
        <Skeleton className="h-5 w-2/3" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-4/5" />
      </CardHeader>
      <CardContent className="flex gap-1.5">
        <Skeleton className="h-5 w-14 rounded-4xl" />
        <Skeleton className="h-5 w-14 rounded-4xl" />
      </CardContent>
    </Card>
  )
}
