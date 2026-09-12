import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface PaginationProps {
  page: number
  totalPages: number
  onPageChange: (page: number) => void
}

export function Pagination({
  page,
  totalPages,
  onPageChange,
}: PaginationProps) {
  const isFirstPage = page <= 1
  const isLastPage = page >= totalPages

  return (
    <div className="flex items-center justify-between">
      <p className="text-sm text-muted-foreground">
        전체 {totalPages}페이지 중 {page}페이지
      </p>
      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          size="icon"
          disabled={isFirstPage}
          onClick={() => onPageChange(page - 1)}
        >
          <ChevronLeft className="size-4" />
          <span className="sr-only">이전 페이지</span>
        </Button>
        <Button
          type="button"
          variant="outline"
          size="icon"
          disabled={isLastPage}
          onClick={() => onPageChange(page + 1)}
        >
          <ChevronRight className="size-4" />
          <span className="sr-only">다음 페이지</span>
        </Button>
      </div>
    </div>
  )
}
