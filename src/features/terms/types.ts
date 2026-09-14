// DevDict 용어(Term) 관련 타입 정의. PRD 4장(Notion 데이터베이스 구조)을 기준으로 한다.

// 난이도 3단계 (Notion 데이터베이스의 "Difficulty" Select 속성, 옵션 값은 한국어 고정)
export type TermDifficulty = '입문' | '중급' | '심화'

// 용어 목록·상세에서 공통으로 쓰는 요약 정보.
// Notion 원본 응답(각 속성이 { type, select: {...} } 형태로 중첩된 구조)을 그대로 쓰지 않고,
// 매핑 레이어(api/terms.ts 예정)에서 이 평탄한 구조로 변환해 사용한다.
export interface Term {
  pageId: string // Notion 페이지 ID. 관련 용어(Relation) 해석에 쓰이며 URL에는 노출하지 않는다.
  slug: string // URL 경로에 쓰는 영문 소문자 식별자 (Notion "Slug" 속성)
  name: string // 용어명 (Notion "Name" Title 속성)
  summary: string // 목록 카드에 노출할 한 줄 요약 (Notion "Summary" 속성)
  category: string // 단일 대분류 (Notion "Category" Select 속성, 옵션 값은 한국어)
  difficulty: TermDifficulty // 난이도 (Notion "Difficulty" Select 속성, 옵션 값은 한국어)
  tags: string[] // 교차 주제 키워드 목록 (Notion "Tags" Multi-select 속성, 옵션 값은 한국어)
  updatedAt: string // 최종수정일 (Notion "Updated At" Last edited time 속성, ISO 문자열)
  relatedPageIds: string[] // 관련 용어 Notion 페이지 ID 목록 (Notion "Related Terms" Relation 속성, single_property)
}

// 용어 목록 조회 시 클라이언트 사이드에서 적용하는 필터 파라미터.
// 공개여부 필터는 프록시(서버) 측에서 이미 적용된 상태로 내려오므로 여기 포함하지 않는다.
export interface TermListParams {
  keyword: string // 용어명 + 한 줄 요약 대상 키워드 검색
  category: string | 'all'
  difficulty: TermDifficulty | 'all'
  tag: string | 'all'
}

// Notion 페이지 본문 블록(문단/제목/목록/코드/인용/이미지) 렌더링용 타입.
// TODO: 실제 Notion 블록 응답 스키마에 맞춰 구체화한다 (PRD 7장 구현 단계 4).
export type TermBlock = unknown

// 용어 상세 조회 결과 — 목록 요약 정보에 본문 블록을 더한 형태.
export interface TermDetail extends Term {
  blocks: TermBlock[]
}
