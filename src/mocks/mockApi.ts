import type { ApiError } from '@/types/api'
import { getErrorMessage } from '@/lib/errorMessages'

const DEFAULT_DELAY_MS = 500

// 실제 백엔드 인터셉터(src/lib/apiClient.ts)와 동일한 지연/에러 형태를 흉내낸다.
// 이렇게 하면 features/*/api 파일에서 mockApi를 axios 기반 api로 교체할 때
// 호출부(TanStack Query 훅, 컴포넌트)는 전혀 수정할 필요가 없다.
function delay<T>(value: T, ms = DEFAULT_DELAY_MS): Promise<T> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(value), ms)
  })
}

function delayError(
  errorCode: string,
  status = 404,
  ms = DEFAULT_DELAY_MS,
): Promise<never> {
  return new Promise((_resolve, reject) => {
    setTimeout(() => {
      const error: ApiError = {
        status,
        errorCode,
        message: getErrorMessage(errorCode),
      }
      reject(error)
    }, ms)
  })
}

export const mockApi = { delay, delayError }
