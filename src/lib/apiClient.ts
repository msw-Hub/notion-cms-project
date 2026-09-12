import axios from 'axios'
import type { AxiosError, AxiosRequestConfig } from 'axios'
import type { ApiError, ProblemDetail } from '@/types/api'
import { getErrorMessage } from './errorMessages'

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 10_000,
})

// 성공 응답은 CommonResponse<T>로 감싸져 오므로, 여기서 실제 페이로드(data.data)만
// 꺼내 돌려준다 — 각 API 호출부에서 매번 response.data.data를 반복하지 않기 위함이다.
apiClient.interceptors.response.use(
  (response) => response.data.data,
  (error: AxiosError<ProblemDetail>) => {
    const problem = error.response?.data
    const errorCode = problem?.properties?.errorCode ?? 'UNKNOWN_ERROR'

    const apiError: ApiError = {
      status: error.response?.status ?? 0,
      errorCode,
      message: getErrorMessage(errorCode),
    }

    return Promise.reject(apiError)
  },
)

// 위 인터셉터가 실제로는 T를 반환하지만 axios 타입은 AxiosResponse<T>를 기대하므로,
// feature의 api 파일에서 그대로 쓸 수 있도록 반환 타입을 T로 좁혀주는 얇은 래퍼.
async function request<T>(config: AxiosRequestConfig): Promise<T> {
  return apiClient(config) as unknown as Promise<T>
}

export const api = {
  get: <T>(url: string, config?: AxiosRequestConfig) =>
    request<T>({ ...config, method: 'GET', url }),
  post: <T>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
    request<T>({ ...config, method: 'POST', url, data }),
  put: <T>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
    request<T>({ ...config, method: 'PUT', url, data }),
  patch: <T>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
    request<T>({ ...config, method: 'PATCH', url, data }),
  delete: <T>(url: string, config?: AxiosRequestConfig) =>
    request<T>({ ...config, method: 'DELETE', url }),
}
