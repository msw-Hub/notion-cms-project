import { useQuery } from '@tanstack/react-query'
import { fetchTerms, termKeys } from '../api/terms'

// 공개 용어 전체를 조회하는 훅.
// 카테고리·난이도·태그·키워드 필터(Task 006)는 이 전체 목록을 받아온 뒤
// 클라이언트 사이드 순수 함수로 처리하므로(PRD 6장), 훅은 파라미터를 받지 않고
// termKeys.lists() 하나만 쿼리 키로 쓴다. 필터가 termKeys.list(params)처럼
// 파라미터를 키에 넣는 구조였다면 필터를 바꿀 때마다 새 쿼리 키가 생겨
// 캐시가 미스되고 매번 재요청·재로딩되었을 것이다.
export function useTerms() {
  return useQuery({
    queryKey: termKeys.lists(),
    queryFn: fetchTerms,
  })
}
