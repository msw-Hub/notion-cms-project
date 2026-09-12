// 백엔드 errorCode(SCREAMING_SNAKE_CASE) → 사용자에게 보여줄 한국어 메시지 매핑

const ERROR_MESSAGES: Record<string, string> = {
  NOT_FOUND: '요청하신 데이터를 찾을 수 없습니다.',
  INVALID_REQUEST: '요청 값이 올바르지 않습니다.',
  UNAUTHORIZED: '로그인이 필요합니다.',
  FORBIDDEN: '접근 권한이 없습니다.',
  INTERNAL_SERVER_ERROR:
    '서버에 일시적인 문제가 발생했습니다. 잠시 후 다시 시도해주세요.',
}

const DEFAULT_ERROR_MESSAGE = '알 수 없는 오류가 발생했습니다.'

// 매핑 테이블에 없는 errorCode는 기본 메시지로 대체한다.
export function getErrorMessage(errorCode: string): string {
  return ERROR_MESSAGES[errorCode] ?? DEFAULT_ERROR_MESSAGE
}
