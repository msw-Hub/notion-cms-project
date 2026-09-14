import { PageHeader } from '@/components/common/PageHeader'
import { EmptyState } from '@/components/common/EmptyState'
import { ErrorState } from '@/components/common/ErrorState'
import { useTerms } from '@/features/terms/hooks/useTerms'
import { useTermFilters } from '@/features/terms/hooks/useTermFilters'
import { useFilteredTerms } from '@/features/terms/hooks/useFilteredTerms'
import { TermCard } from '@/features/terms/components/TermCard'
import { TermCardGrid } from '@/features/terms/components/TermCardGrid'
import { TermCardSkeleton } from '@/features/terms/components/TermCardSkeleton'
import { TermFilterBar } from '@/features/terms/components/TermFilterBar'

// 용어 목록 화면 — 조회한 공개 용어를 검색·필터링해 카드 그리드로 보여준다.
export function HomePage() {
  const { data: terms, isPending, isError, error } = useTerms()
  const {
    filters,
    debouncedFilters,
    setKeyword,
    setCategory,
    setDifficulty,
    setTag,
    reset,
  } = useTermFilters()

  // 로딩/에러 중에는 terms가 없으므로 빈 배열로 필터링해 훅 호출 순서를 항상 유지한다.
  const filteredTerms = useFilteredTerms(terms ?? [], debouncedFilters)

  // 카테고리·태그 옵션은 필터링 전 원본 목록에서 파생한다 — 그래야 카테고리를 고른 뒤에도
  // 태그 드롭다운 선택지가 줄어드는 혼란이 없다.
  const categoryOptions = terms ? [...new Set(terms.map((term) => term.category))] : []
  const tagOptions = terms ? [...new Set(terms.flatMap((term) => term.tags))] : []

  return (
    <div className="space-y-6">
      <PageHeader
        title="용어 목록"
        description="개발 용어와 개념을 검색하고 필터링해 찾아보세요."
      />

      <TermFilterBar
        keyword={filters.keyword}
        category={filters.category}
        difficulty={filters.difficulty}
        tag={filters.tag}
        categoryOptions={categoryOptions}
        tagOptions={tagOptions}
        disabled={isPending || isError}
        onKeywordChange={setKeyword}
        onCategoryChange={setCategory}
        onDifficultyChange={setDifficulty}
        onTagChange={setTag}
        onReset={reset}
      />

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

      {!isPending && !isError && terms.length > 0 && filteredTerms.length === 0 && (
        <EmptyState
          title="검색 결과가 없습니다"
          description="다른 키워드나 필터로 다시 시도해보세요."
        />
      )}

      {!isPending && !isError && filteredTerms.length > 0 && (
        <TermCardGrid>
          {filteredTerms.map((term) => (
            <TermCard key={term.pageId} term={term} />
          ))}
        </TermCardGrid>
      )}
    </div>
  )
}
