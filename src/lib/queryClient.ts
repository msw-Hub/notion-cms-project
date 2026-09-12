import { QueryClient } from '@tanstack/react-query'
import { isApiError } from '@/lib/isApiError'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1분 이내 재요청은 캐시를 그대로 사용
      // 404 같은 4xx는 재시도해도 결과가 바뀌지 않으므로 즉시 실패 처리하고,
      // 그 외(네트워크 오류, 5xx)만 한 번 재시도한다.
      retry: (failureCount, error) => {
        if (isApiError(error) && error.status >= 400 && error.status < 500) {
          return false
        }
        return failureCount < 1
      },
      refetchOnWindowFocus: false,
    },
  },
})
