import { Link, useParams } from 'react-router'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { ErrorState } from '@/components/common/ErrorState'
import { ProductStatusBadge } from '@/features/products/components/ProductStatusBadge'
import { useProduct } from '@/features/products/hooks/useProduct'

const currencyFormatter = new Intl.NumberFormat('ko-KR', {
  style: 'currency',
  currency: 'KRW',
})

export function ProductDetailPage() {
  const { id } = useParams<{ id: string }>()
  const query = useProduct(id ?? '')

  return (
    <div className="space-y-6">
      <Button asChild variant="ghost" size="sm" className="-ml-2">
        <Link to="/products">
          <ArrowLeft className="size-4" />
          목록으로
        </Link>
      </Button>

      {query.isPending && (
        <div className="space-y-3">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-40 w-full" />
        </div>
      )}

      {query.isError && <ErrorState error={query.error} />}

      {query.data && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-xl">{query.data.name}</CardTitle>
            <ProductStatusBadge status={query.data.status} />
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-sm text-muted-foreground">카테고리</p>
              <p className="font-medium">{query.data.category}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">가격</p>
              <p className="font-medium">
                {currencyFormatter.format(query.data.price)}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">재고</p>
              <p className="font-medium">
                {query.data.stock === 0 ? '품절' : `${query.data.stock}개`}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">최근 수정일</p>
              <p className="font-medium">{query.data.updatedAt}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
