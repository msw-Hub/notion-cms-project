// 백엔드 공통 응답 규약 타입 정의

// 성공 응답 래퍼 — 실제 페이로드는 axios 인터셉터가 꺼내주므로
// 앱 코드에서는 이 타입을 직접 다룰 일이 거의 없다.
export interface CommonResponse<T> {
  success: true
  data: T
}

// 에러 응답 (RFC 9457 application/problem+json)
export interface ProblemDetail {
  type?: string
  title: string
  status: number
  detail?: string
  instance?: string
  properties?: {
    errorCode?: string
    [key: string]: unknown
  }
}

// 인터셉터가 ProblemDetail을 파싱해 만드는 앱 내부 에러 형태
export interface ApiError {
  status: number
  errorCode: string
  message: string
}
