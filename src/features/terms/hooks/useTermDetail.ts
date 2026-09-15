import { useQuery } from '@tanstack/react-query'
import { fetchTermBySlug, termKeys } from '../api/terms'

// 슬러그로 용어 상세 1건(본문 블록 포함)을 조회하는 훅.
// slug별로 termKeys.detail(slug)가 다른 쿼리 키를 가지므로, 관련 용어 링크를 눌러
// 다른 상세로 이동해도 각자 독립적으로 캐시되고 로딩 상태가 올바르게 갈린다.
// 존재하지 않는 슬러그는 fetchTermBySlug가 404 ApiError로 거절하며, 4xx는
// queryClient의 기본 정책상 재시도하지 않는다.
export function useTermDetail(slug: string) {
  return useQuery({
    queryKey: termKeys.detail(slug),
    queryFn: () => fetchTermBySlug(slug),
  })
}
