import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

// TermCard와 동일한 Card 골격을 공유하는 로딩 스켈레톤.
// 골격을 공유해야 실제 카드가 도착했을 때 높이 차이로 레이아웃이 튀지 않는다.
// CardHeader는 실제 카드처럼 기본 gap을 그대로 쓰고(별도 className으로 덮어쓰지 않음),
// 배지도 카테고리·난이도 2개 + 태그 2개(권장 1~3개의 중간값, docs/notion-schema.md §3)를
// 흉내 낸 4개로 맞춰 실제 카드와 높이가 최대한 비슷해지도록 한다.
export function TermCardSkeleton() {
  return (
    <Card className="h-full">
      <CardHeader>
        <Skeleton className="h-5 w-2/3" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-4/5" />
      </CardHeader>
      <CardContent className="flex flex-wrap gap-1.5">
        <Skeleton className="h-5 w-14 rounded-4xl" />
        <Skeleton className="h-5 w-14 rounded-4xl" />
        <Skeleton className="h-5 w-12 rounded-4xl" />
        <Skeleton className="h-5 w-16 rounded-4xl" />
      </CardContent>
    </Card>
  )
}
