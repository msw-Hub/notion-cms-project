// Notion 프록시(/notion-proxy) 전용 axios 인스턴스.
//
// 왜 src/lib/apiClient.ts를 재사용하지 않는가: 그 인터셉터는 백엔드의
// `CommonResponse<T>`(`{ success, data }`)와 RFC 9457 `ProblemDetail` 응답을 전제로
// `response.data.data`를 꺼내고 `problem.properties.errorCode`를 읽는다. 반면 Notion API는
// `{ object: 'list', results, has_more, next_cursor }` / `{ object: 'error', status, code, message }`
// 형태로 응답해 그 규약과 전혀 다르다(docs/ROADMAP.md "apiClient 규약과 Notion 응답의 불일치" 리스크).
// 그래서 별도 인스턴스를 두고, 이 파일 안에서만 Notion 고유 에러 형태를 ApiError로 정규화한다.
import axios from 'axios'
import type { AxiosError, AxiosRequestConfig } from 'axios'
import type { ApiError } from '@/types/api'
import { getErrorMessage } from '@/lib/errorMessages'

// Notion API 에러 응답 형태 (https://developers.notion.com 에러 규약).
interface NotionErrorResponse {
  object: 'error'
  status: number
  code: string
  message: string
}

export const notionClient = axios.create({
  baseURL: '/notion-proxy',
  timeout: 10_000,
})

// 성공 응답은 그대로 JSON 본문이 곧 페이로드이므로(백엔드처럼 한 겹 더 감싸져 있지 않음)
// response.data만 꺼내면 된다 — apiClient처럼 response.data.data가 아니다.
notionClient.interceptors.response.use(
  (response) => response.data,
  (error: AxiosError<NotionErrorResponse>) => {
    // dev 프록시는 화이트리스트 위반 시 연결을 끊는다(proxyReq.destroy()) — 이 경우
    // error.response 자체가 없는 상태 코드 없는 네트워크 오류로 온다(ROADMAP 리스크 항목).
    const status = error.response?.status ?? 0
    const errorCode = mapNotionErrorToErrorCode(
      status,
      error.response?.data?.code,
    )

    const apiError: ApiError = {
      status,
      errorCode,
      message: getErrorMessage(errorCode),
    }
    return Promise.reject(apiError)
  },
)

// Notion 고유 에러 코드/상태를 errorMessages.ts가 아는 앱 공통 errorCode로 정규화한다.
function mapNotionErrorToErrorCode(
  status: number,
  notionCode: string | undefined,
): string {
  if (status === 0) return 'NETWORK_ERROR'
  if (status === 429) return 'TOO_MANY_REQUESTS'
  if (status >= 500) return 'INTERNAL_SERVER_ERROR'
  if (status === 401 || status === 403) return 'FORBIDDEN'
  if (notionCode === 'object_not_found' || status === 404) return 'NOT_FOUND'
  return 'INVALID_REQUEST'
}

// 위 인터셉터가 실제로는 T(응답 JSON 자체)를 반환하지만 axios 타입은 AxiosResponse<T>를
// 기대하므로, apiClient.ts의 request<T> 래퍼와 동일한 패턴으로 반환 타입을 T로 좁혀준다.
async function request<T>(config: AxiosRequestConfig): Promise<T> {
  return notionClient(config) as unknown as Promise<T>
}

export const notion = {
  get: <T>(url: string, config?: AxiosRequestConfig) =>
    request<T>({ ...config, method: 'GET', url }),
  post: <T>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
    request<T>({ ...config, method: 'POST', url, data }),
}
