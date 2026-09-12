import type { ApiError } from '@/types/api'

// apiClient/mockApi가 던지는 ApiError 형태인지 런타임에 판별한다.
export function isApiError(error: unknown): error is ApiError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    'errorCode' in error
  )
}
