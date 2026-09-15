import { Link } from 'react-router'
import type { Term } from '../types'

interface RelatedTermListProps {
  relatedPageIds: string[] // 현재 용어가 참조하는 관련 용어의 Notion 페이지 ID 목록
  termMap: Map<string, Term> // pageId → Term 해석용 맵 (목록 조회 결과로 생성)
}

// relatedPageIds를 termMap으로 해석해 관련 용어 링크 목록을 보여준다.
// 맵에 없는 ID(비공개 처리되었거나 아직 목록 캐시에 없는 용어)는 조용히 건너뛰고,
// 해석된 관련 용어가 하나도 없으면 섹션 자체를 렌더링하지 않는다(PRD 4장).
export function RelatedTermList({
  relatedPageIds,
  termMap,
}: RelatedTermListProps) {
  const relatedTerms = relatedPageIds
    .map((pageId) => termMap.get(pageId))
    .filter((term): term is Term => term !== undefined)

  if (relatedTerms.length === 0) {
    return null
  }

  return (
    <div className="space-y-2">
      <h2 className="text-sm font-semibold">관련 용어</h2>
      <ul className="flex flex-wrap gap-2">
        {relatedTerms.map((term) => (
          <li key={term.pageId}>
            <Link
              to={`/terms/${term.slug}`}
              className="inline-flex rounded-full border px-3 py-1 text-sm transition-colors hover:bg-muted"
            >
              {term.name}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
