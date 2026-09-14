import { PageHeader } from '@/components/common/PageHeader'
import { EmptyState } from '@/components/common/EmptyState'
import { ErrorState } from '@/components/common/ErrorState'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useTerms } from '@/features/terms/hooks/useTerms'
import { TermCard } from '@/features/terms/components/TermCard'
import { TermCardGrid } from '@/features/terms/components/TermCardGrid'
import { TermCardSkeleton } from '@/features/terms/components/TermCardSkeleton'

// 용어 목록 화면 — 조회한 공개 용어를 카드 그리드로 보여준다.
// 검색·필터 입력(위 Input/Select 3종)은 아직 상태·동작이 없어 disabled로 표시만 해둔다
// (Task 006에서 useTermFilters/TermFilterBar로 교체 예정).
export function HomePage() {
  const { data: terms, isPending, isError, error } = useTerms()

  return (
    <div className="space-y-6">
      <PageHeader
        title="용어 목록"
        description="개발 용어와 개념을 검색하고 필터링해 찾아보세요."
      />

      {/* 검색·필터 자리 — 키워드 검색과 카테고리/난이도/태그 셀렉트가 들어갈 영역.
          아직 상태·조회 로직이 없어 disabled로 표시만 해둔다. */}
      <div className="flex flex-wrap gap-3">
        <Input
          placeholder="용어명 또는 한 줄 요약으로 검색"
          className="max-w-xs"
          disabled
        />
        <Select disabled>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="카테고리" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">전체</SelectItem>
          </SelectContent>
        </Select>
        <Select disabled>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="난이도" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">전체</SelectItem>
          </SelectContent>
        </Select>
        <Select disabled>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="태그" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">전체</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isPending && (
        <TermCardGrid>
          {/* 데이터 정체성이 없는 순수 플레이스홀더라 인덱스 key를 예외적으로 허용한다 */}
          {Array.from({ length: 6 }).map((_, index) => (
            <TermCardSkeleton key={index} />
          ))}
        </TermCardGrid>
      )}

      {isError && <ErrorState error={error} />}

      {!isPending && !isError && terms.length === 0 && (
        <EmptyState
          title="등록된 용어가 없습니다"
          description="Notion에 공개된 용어가 추가되면 여기에 표시됩니다."
        />
      )}

      {!isPending && !isError && terms.length > 0 && (
        <TermCardGrid>
          {terms.map((term) => (
            <TermCard key={term.pageId} term={term} />
          ))}
        </TermCardGrid>
      )}
    </div>
  )
}
