import { Badge } from '@/components/ui/badge'
import type { ProductStatus } from '@/features/products/types'

const STATUS_LABEL: Record<ProductStatus, string> = {
  active: '판매중',
  inactive: '판매중지',
  discontinued: '단종',
}

const STATUS_VARIANT: Record<
  ProductStatus,
  'default' | 'secondary' | 'outline'
> = {
  active: 'default',
  inactive: 'secondary',
  discontinued: 'outline',
}

interface ProductStatusBadgeProps {
  status: ProductStatus
}

export function ProductStatusBadge({ status }: ProductStatusBadgeProps) {
  return <Badge variant={STATUS_VARIANT[status]}>{STATUS_LABEL[status]}</Badge>
}
