import type { TermListParams } from '../types'

// TanStack Query 쿼리 키 팩토리 — 캐시 무효화 시 이 팩토리만 참조한다.
export const termKeys = {
  all: ['terms'] as const,
  lists: () => [...termKeys.all, 'list'] as const,
  list: (params: TermListParams) => [...termKeys.lists(), params] as const,
  details: () => [...termKeys.all, 'detail'] as const,
  detail: (slug: string) => [...termKeys.details(), slug] as const,
}

// TODO: PRD 7장 구현 단계 2 — 아래 두 함수를 구현한다.
// - fetchTerms(): 공개 용어 목록을 조회하고 Notion 응답을 Term[]으로 매핑한다.
//   동시에 관련 용어(Relation) 해석용 pageId → Term 맵도 함께 만든다.
// - fetchTermBySlug(slug): 슬러그로 상세 용어 1건과 본문 블록을 조회한다.
// 실제 Notion 연동 전에는 기존 src/mocks/ 규약(mockApi.delay/delayError)대로 목 데이터를
// 반환하도록 먼저 구현하고, 이후 src/lib/apiClient.ts 기반의 프록시 호출로 교체한다.
