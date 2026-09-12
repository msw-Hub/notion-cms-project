import { useState } from 'react'
import { PageHeader } from '@/components/common/PageHeader'
import { ErrorState } from '@/components/common/ErrorState'
import { EmptyState } from '@/components/common/EmptyState'
import { DataTableSkeleton } from '@/components/common/DataTableSkeleton'
import { Pagination } from '@/components/common/Pagination'
import { ProductFilters } from '@/features/products/components/ProductFilters'
import { ProductTable } from '@/features/products/components/ProductTable'
import { useProducts } from '@/features/products/hooks/useProducts'
import { useDebounce } from '@/hooks/useDebounce'
import type { ProductStatus } from '@/features/products/types'

const PAGE_SIZE = 8

export function ProductListPage() {
  const [keyword, setKeyword] = useState('')
  const [status, setStatus] = useState<ProductStatus | 'all'>('all')
  const [page, setPage] = useState(1)

  // 매 keystroke마다 재조회하지 않도록 검색어만 디바운스한다.
  const debouncedKeyword = useDebounce(keyword, 300)

  const query = useProducts({
    keyword: debouncedKeyword,
    status,
    page,
    pageSize: PAGE_SIZE,
  })

  const totalPages = query.data
    ? Math.max(1, Math.ceil(query.data.total / PAGE_SIZE))
    : 1

  function handleKeywordChange(next: string) {
    setKeyword(next)
    setPage(1)
  }

  function handleStatusChange(next: ProductStatus | 'all') {
    setStatus(next)
    setPage(1)
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="상품 관리"
        description="등록된 상품을 검색하고 상태별로 확인하세요."
      />

      <ProductFilters
        keyword={keyword}
        onKeywordChange={handleKeywordChange}
        status={status}
        onStatusChange={handleStatusChange}
      />

      {query.isError && <ErrorState error={query.error} />}
      {query.isPending && <DataTableSkeleton rows={PAGE_SIZE} />}

      {query.data && query.data.items.length === 0 && (
        <EmptyState
          title="검색 결과가 없습니다"
          description="다른 검색어나 상태로 다시 시도해보세요."
        />
      )}

      {query.data && query.data.items.length > 0 && (
        <div className="space-y-4">
          <ProductTable products={query.data.items} />
          <Pagination
            page={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </div>
      )}
    </div>
  )
}
