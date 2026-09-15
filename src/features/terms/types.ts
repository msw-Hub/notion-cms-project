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

// Notion rich_text 배열 항목 1개. annotations는 실제 Notion API와 동일하게
// bold/italic/strikethrough/underline/code + 텍스트 색상(color)을 모두 담아 두되,
// 현재 렌더러(NotionRichText)는 이 중 bold/italic/code/strikethrough + href만 사용한다.
export interface RichTextAnnotations {
  bold: boolean
  italic: boolean
  strikethrough: boolean
  underline: boolean
  code: boolean
  color: string
}

export interface RichText {
  type: 'text'
  plain_text: string
  annotations: RichTextAnnotations
  href: string | null // 텍스트에 링크가 걸려 있으면 URL, 없으면 null
}

// 모든 블록 타입이 공통으로 갖는 필드.
// has_children이 true면 children에 자식 블록 목록이 채워진다 (재귀 렌더링 대상).
interface BaseBlock {
  id: string
  has_children: boolean
  children?: TermBlock[]
}

export interface ParagraphBlock extends BaseBlock {
  type: 'paragraph'
  paragraph: { rich_text: RichText[] }
}

export interface Heading1Block extends BaseBlock {
  type: 'heading_1'
  heading_1: { rich_text: RichText[] }
}

export interface Heading2Block extends BaseBlock {
  type: 'heading_2'
  heading_2: { rich_text: RichText[] }
}

export interface Heading3Block extends BaseBlock {
  type: 'heading_3'
  heading_3: { rich_text: RichText[] }
}

export interface BulletedListItemBlock extends BaseBlock {
  type: 'bulleted_list_item'
  bulleted_list_item: { rich_text: RichText[] }
}

export interface NumberedListItemBlock extends BaseBlock {
  type: 'numbered_list_item'
  numbered_list_item: { rich_text: RichText[] }
}

export interface CodeBlock extends BaseBlock {
  type: 'code'
  code: { rich_text: RichText[]; language: string }
}

export interface QuoteBlock extends BaseBlock {
  type: 'quote'
  quote: { rich_text: RichText[] }
}

// PRD·Task 008 가정: 이미지 블록은 caption(rich_text[])과 url만 필요로 한다.
// 실제 Notion 응답은 type(external/file)에 따라 중첩 구조가 다르지만,
// 매핑 레이어(Task 010)가 이 평탄한 형태로 변환하는 것을 전제로 한다.
export interface ImageBlock extends BaseBlock {
  type: 'image'
  image: { url: string; caption: RichText[] }
}

// Notion 페이지 본문 블록(문단/제목/목록/코드/인용/이미지) 렌더링용 타입.
// PRD가 명시한 7종만 지원 대상으로 삼는다 — 그 외 타입(toggle, divider 등)이 실제
// Notion 응답에 섞여 와도 런타임 switch의 default 분기가 조용히 건너뛴다
// (NotionBlockRenderer 참고, 앱이 깨지지 않는 것이 우선이라 TS 유니온에 억지로 포함하지 않는다).
export type TermBlock =
  | ParagraphBlock
  | Heading1Block
  | Heading2Block
  | Heading3Block
  | BulletedListItemBlock
  | NumberedListItemBlock
  | CodeBlock
  | QuoteBlock
  | ImageBlock

// 용어 상세 조회 결과 — 목록 요약 정보에 본문 블록을 더한 형태.
export interface TermDetail extends Term {
  blocks: TermBlock[]
}
