import type { Term, TermListParams } from '../types'

// 카테고리·난이도·태그·키워드(용어명+한 줄 요약, 대소문자 무시)를 클라이언트 사이드로 적용한다.
// 공개여부 필터는 프록시(서버) 측에서 이미 적용된 상태로 내려오므로 여기서는 다루지 않는다(PRD 6장).
export function filterTerms(terms: Term[], params: TermListParams): Term[] {
  const keyword = params.keyword.trim().toLowerCase()

  return terms.filter((term) => {
    if (params.category !== 'all' && term.category !== params.category)
      return false
    if (params.difficulty !== 'all' && term.difficulty !== params.difficulty)
      return false
    if (params.tag !== 'all' && !term.tags.includes(params.tag)) return false
    if (
      keyword &&
      !term.name.toLowerCase().includes(keyword) &&
      !term.summary.toLowerCase().includes(keyword)
    ) {
      return false
    }
    return true
  })
}

// React Compiler가 자동으로 메모이제이션하므로 useMemo 없이 filterTerms를 그대로 호출한다.
export function useFilteredTerms(
  terms: Term[],
  params: TermListParams,
): Term[] {
  return filterTerms(terms, params)
}
