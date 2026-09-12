import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { ProductStatus } from '@/features/products/types'

interface ProductFiltersProps {
  keyword: string
  onKeywordChange: (keyword: string) => void
  status: ProductStatus | 'all'
  onStatusChange: (status: ProductStatus | 'all') => void
}

export function ProductFilters({
  keyword,
  onKeywordChange,
  status,
  onStatusChange,
}: ProductFiltersProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <div className="relative flex-1">
        <Search className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="상품명으로 검색"
          value={keyword}
          onChange={(event) => onKeywordChange(event.target.value)}
          className="pl-8"
        />
      </div>
      <Select
        value={status}
        onValueChange={(value) =>
          onStatusChange(value as ProductStatus | 'all')
        }
      >
        <SelectTrigger className="w-full sm:w-40">
          <SelectValue placeholder="상태" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">전체 상태</SelectItem>
          <SelectItem value="active">판매중</SelectItem>
          <SelectItem value="inactive">판매중지</SelectItem>
          <SelectItem value="discontinued">단종</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}
