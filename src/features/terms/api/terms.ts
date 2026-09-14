import { mockApi } from '@/mocks/mockApi'
import { mockBlocks, mockTerms } from '@/mocks/db'
import type { Term, TermDetail, TermListParams } from '../types'

// TanStack Query 쿼리 키 팩토리 — 캐시 무효화 시 이 팩토리만 참조한다.
export const termKeys = {
  all: ['terms'] as const,
  lists: () => [...termKeys.all, 'list'] as const,
  list: (params: TermListParams) => [...termKeys.lists(), params] as const,
  details: () => [...termKeys.all, 'detail'] as const,
  detail: (slug: string) => [...termKeys.details(), slug] as const,
}

// 공개 용어 목록을 조회한다.
// 실제 Notion 연동 전에는 mockApi.delay로 목 데이터를 흉내낸다(Task 011에서 프록시 호출로 교체 예정).
// 공개여부 필터는 프록시(서버) 측에서 이미 적용된 상태로 내려오는 것을 전제하므로,
// mockTerms에도 비공개 용어(RAG)는 애초에 포함하지 않았다.
export function fetchTerms(): Promise<Term[]> {
  return mockApi.delay(mockTerms)
}

// 슬러그로 상세 용어 1건과 본문 블록을 조회한다. 없는 슬러그는 404로 거절한다.
export function fetchTermBySlug(slug: string): Promise<TermDetail> {
  const term = mockTerms.find((candidate) => candidate.slug === slug)
  if (!term) {
    return mockApi.delayError('NOT_FOUND', 404)
  }
  return mockApi.delay({ ...term, blocks: mockBlocks[slug] ?? [] })
}

// 관련 용어(Relation) 해석에 재사용하는 pageId → Term 맵.
// 맵에 없는 pageId(예: 비공개 용어)는 관련 용어 렌더링에서 자연스럽게 제외된다.
export function buildTermMap(terms: Term[]): Map<string, Term> {
  return new Map(terms.map((term) => [term.pageId, term]))
}
