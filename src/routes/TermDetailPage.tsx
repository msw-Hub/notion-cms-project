import { Link, useParams } from 'react-router'
import { ArrowLeft } from 'lucide-react'
import { PageHeader } from '@/components/common/PageHeader'
import { ErrorState } from '@/components/common/ErrorState'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { buildTermMap } from '@/features/terms/api/terms'
import { useTermDetail } from '@/features/terms/hooks/useTermDetail'
import { useTerms } from '@/features/terms/hooks/useTerms'
import { TermMetaBadges } from '@/features/terms/components/TermMetaBadges'
import { RelatedTermList } from '@/features/terms/components/RelatedTermList'

// 목록으로 돌아가는 링크. 정상/에러 화면 양쪽에서 공유한다.
function BackToListLink() {
  return (
    <Link
      to="/"
      className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
    >
      <ArrowLeft className="size-4" />
      목록으로 돌아가기
    </Link>
  )
}

// 상세 데이터 도착 전 레이아웃 점프를 줄이기 위한 스켈레톤 — 실제 화면과 동일한 블록 구성을 공유한다.
function TermDetailSkeleton() {
  return (
    <div className="mx-auto w-full max-w-3xl space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-8 w-1/3" />
        <Skeleton className="h-4 w-2/3" />
      </div>
      <div className="flex gap-2">
        <Skeleton className="h-5 w-16 rounded-4xl" />
        <Skeleton className="h-5 w-16 rounded-4xl" />
        <Skeleton className="h-5 w-16 rounded-4xl" />
      </div>
      <Separator />
      <Skeleton className="h-40 w-full" />
    </div>
  )
}

// 용어 상세 화면 — 슬러그로 단건을 조회해 배지·본문 블록·관련 용어를 보여준다.
export function TermDetailPage() {
  // 라우트가 `/terms/:slug`로 정의되어 있어 이 컴포넌트가 렌더링되는 시점엔 항상 값이 있다.
  const { slug = '' } = useParams<{ slug: string }>()
  const { data: term, isPending, isError, error } = useTermDetail(slug)

  // 관련 용어(Relation) 해석에 필요한 pageId → Term 맵을 만들기 위해 목록 쿼리를 함께 구독한다.
  // 상세 페이지에 새로고침으로 바로 진입하면 목록 캐시가 비어 있어 관련 용어가 안 보일 수 있는데,
  // 이 문제의 정식 보강(프리페치 등)은 Task 013에서 다루기로 했으므로 여기서는 과설계하지 않는다.
  const { data: allTerms } = useTerms()
  const termMap = buildTermMap(allTerms ?? [])

  if (isPending) {
    return <TermDetailSkeleton />
  }

  if (isError) {
    return (
      <div className="mx-auto w-full max-w-3xl space-y-6">
        <ErrorState error={error} />
        <BackToListLink />
      </div>
    )
  }

  return (
    // 본문이 문단 위주의 읽기 콘텐츠라, 목록 화면(그리드)과 달리 가독성을 위해
    // 좁은 max-width로 중앙 정렬한다 — 와이드 화면에서 한 줄이 너무 길어지는 것을 방지.
    <div className="mx-auto w-full max-w-3xl space-y-6">
      <PageHeader title={term.name} description={term.summary} />

      <TermMetaBadges term={term} />

      <Separator />

      {/* Notion 본문 블록(문단/제목/목록/코드/인용/이미지) 렌더링 — Task 008에서 실제 렌더러 연결 예정 */}
      <div className="min-h-40 rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
        본문 블록 렌더링 영역
      </div>

      <Separator />

      <RelatedTermList relatedPageIds={term.relatedPageIds} termMap={termMap} />

      <BackToListLink />
    </div>
  )
}
