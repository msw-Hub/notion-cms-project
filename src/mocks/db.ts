// 목 데이터 저장소.
// docs/notion-schema.md §8 "Task 009 샘플 용어 9건" 설계를 그대로 따른다 — 실제 Notion DB를
// 구축할 때(Task 009)도 동일한 용어 목록을 입력하므로, 목 데이터 단계에서 검증한 시나리오
// (공개여부 필터, 관련 용어 맵 미스, 관련 용어 0건 등)가 실연동 후에도 그대로 재현된다.
// 실제 Notion API 연동이 끝나면 src/mocks/ 전체를 삭제하는 것이 전제다.
import type { Term, TermBlock } from '@/features/terms/types'

// RAG(#9)는 비공개 초안이라 목록에 노출되지 않는다.
// 다른 용어(#1 메타프롬프트)가 이 ID를 relatedPageIds로 참조하게 해서
// "관련 용어 맵에 없는 ID는 렌더링하지 않는다"(PRD 4장) 케이스를 재현한다.
const UNPUBLISHED_RAG_PAGE_ID = 'mock-page-009'

// Notion 공개 용어 8건 (docs/notion-schema.md §8의 #1~#8, #9 RAG는 비공개라 제외)
export const mockTerms: Term[] = [
  {
    pageId: 'mock-page-001',
    slug: 'meta-prompt',
    name: '메타프롬프트',
    summary: 'LLM에게 프롬프트 자체를 작성·개선하도록 지시하는 상위 수준의 프롬프트.',
    category: '프롬프트',
    difficulty: '중급',
    tags: ['AI', '자동화'],
    updatedAt: '2026-08-20T09:00:00.000Z',
    relatedPageIds: ['mock-page-002', UNPUBLISHED_RAG_PAGE_ID],
  },
  {
    pageId: 'mock-page-002',
    slug: 'context-window',
    name: '컨텍스트 윈도',
    summary: 'LLM이 한 번에 참조할 수 있는 입력 토큰의 최대 범위.',
    category: '프롬프트',
    difficulty: '입문',
    tags: ['AI'],
    updatedAt: '2026-08-15T09:00:00.000Z',
    relatedPageIds: ['mock-page-001'],
  },
  {
    pageId: 'mock-page-003',
    slug: 'prd',
    name: 'PRD',
    summary: '제품이 무엇을, 왜 만드는지를 정의하는 제품 요구사항 문서.',
    category: '기획/문서',
    difficulty: '입문',
    tags: ['문서화', '협업', '약어'],
    updatedAt: '2026-08-10T09:00:00.000Z',
    relatedPageIds: ['mock-page-004', 'mock-page-005'],
  },
  {
    pageId: 'mock-page-004',
    slug: 'mvp',
    name: 'MVP',
    summary: '핵심 가설을 검증할 수 있는 최소한의 기능만 담은 제품 버전.',
    category: '개발방법론',
    difficulty: '입문',
    tags: ['협업', '약어'],
    updatedAt: '2026-08-05T09:00:00.000Z',
    relatedPageIds: ['mock-page-003'],
  },
  {
    pageId: 'mock-page-005',
    slug: 'adr',
    name: 'ADR (아키텍처 결정 기록)',
    summary: '아키텍처 의사결정의 배경과 결과를 남기는 짧은 문서.',
    category: '기획/문서',
    difficulty: '중급',
    tags: ['문서화', '약어', '헷갈림주의'],
    updatedAt: '2026-08-01T09:00:00.000Z',
    relatedPageIds: ['mock-page-003', 'mock-page-006'],
  },
  {
    pageId: 'mock-page-006',
    slug: 'hexagonal-architecture',
    name: '헥사고날 아키텍처',
    summary: '도메인 로직을 포트/어댑터로 감싸 외부 의존성과 분리하는 아키텍처 패턴.',
    category: '아키텍처',
    difficulty: '심화',
    tags: ['테스트', '리팩터링'],
    updatedAt: '2026-07-28T09:00:00.000Z',
    relatedPageIds: ['mock-page-005'],
  },
  {
    pageId: 'mock-page-007',
    slug: 'hydration',
    name: '하이드레이션',
    summary: '서버에서 렌더링된 정적 HTML에 클라이언트 JS 이벤트를 붙이는 과정.',
    category: '프론트엔드',
    difficulty: '중급',
    tags: ['성능', '헷갈림주의'],
    updatedAt: '2026-07-20T09:00:00.000Z',
    relatedPageIds: [],
  },
  {
    pageId: 'mock-page-008',
    slug: 'ci-cd',
    name: 'CI/CD 파이프라인',
    summary: '빌드·테스트·배포를 자동화해 변경사항을 빠르고 안전하게 반영하는 절차.',
    category: '백엔드/인프라',
    difficulty: '중급',
    tags: ['자동화', '배포', '테스트', '약어'],
    updatedAt: '2026-07-15T09:00:00.000Z',
    relatedPageIds: [],
  },
]

// Notion rich_text 배열 항목 1개를 흉내내는 헬퍼.
// 실제 Notion API 응답과 동일한 형태로 만들어 두면, Task 008에서 TermBlock을 구체화할 때
// 이 목 데이터를 그대로 재사용할 수 있다.
function textRun(text: string) {
  return {
    type: 'text' as const,
    plain_text: text,
    annotations: {
      bold: false,
      italic: false,
      strikethrough: false,
      underline: false,
      code: false,
      color: 'default',
    },
    href: null,
  }
}

function paragraph(text: string) {
  return { type: 'paragraph', paragraph: { rich_text: [textRun(text)] } }
}

function heading(level: 2 | 3, text: string) {
  const key = level === 2 ? 'heading_2' : 'heading_3'
  return { type: key, [key]: { rich_text: [textRun(text)] } }
}

function bulletedListItem(text: string) {
  return { type: 'bulleted_list_item', bulleted_list_item: { rich_text: [textRun(text)] } }
}

function numberedListItem(text: string) {
  return { type: 'numbered_list_item', numbered_list_item: { rich_text: [textRun(text)] } }
}

function code(text: string, language: string) {
  return { type: 'code', code: { rich_text: [textRun(text)], language } }
}

function quote(text: string) {
  return { type: 'quote', quote: { rich_text: [textRun(text)] } }
}

function image(url: string, caption: string) {
  return {
    type: 'image',
    image: { type: 'external', external: { url }, caption: [textRun(caption)] },
  }
}

// slug 기준 본문 블록 목 데이터. 실제 조회 시 TermDetail.blocks로 붙는다.
export const mockBlocks: Record<string, TermBlock[]> = {
  // 문단/H2/H3/글머리목록/번호목록/코드/인용/이미지를 전부 포함한 "블록 샘플러" 페이지.
  'meta-prompt': [
    paragraph(
      '메타프롬프트는 LLM에게 최종 답변이 아니라, 더 나은 프롬프트 자체를 만들도록 지시하는 프롬프트다.',
    ),
    heading(2, '왜 필요한가'),
    paragraph('프롬프트를 사람이 일일이 다듬는 대신, LLM이 스스로 개선안을 제안하게 할 수 있다.'),
    heading(3, '대표 활용 패턴'),
    bulletedListItem('요구사항을 받아 프롬프트 초안을 생성'),
    bulletedListItem('기존 프롬프트의 모호한 지점을 지적하고 수정안 제시'),
    heading(3, '적용 순서'),
    numberedListItem('작업 목표와 제약 조건을 정리한다'),
    numberedListItem('메타프롬프트로 초안 프롬프트를 생성한다'),
    numberedListItem('생성된 프롬프트를 실제 사례로 검증한다'),
    code('아래는 프롬프트 초안을 생성하도록 지시하는 메타프롬프트 예시다.', 'text'),
    quote('좋은 메타프롬프트는 "무엇을 답할지"가 아니라 "어떤 질문을 던질지"를 설계한다.'),
    image(
      'https://placehold.co/800x400?text=Meta-Prompt+Flow',
      '사용자 요구사항 → 메타프롬프트 → 생성된 프롬프트 → 검증의 흐름도',
    ),
  ],
  'context-window': [
    paragraph('컨텍스트 윈도는 모델이 한 번의 요청에서 참조 가능한 토큰 수의 상한을 뜻한다.'),
    paragraph('윈도를 초과한 앞부분 내용은 모델이 더 이상 참조하지 못한다.'),
  ],
  prd: [
    paragraph('PRD(Product Requirements Document)는 무엇을 왜 만드는지를 정의하는 문서다.'),
    bulletedListItem('배경과 목적'),
    bulletedListItem('주요 기능과 범위'),
  ],
  mvp: [
    paragraph('MVP는 핵심 가설을 검증하기 위한 최소한의 기능만 담은 제품 버전이다.'),
  ],
  adr: [
    paragraph('ADR은 특정 아키텍처 결정의 배경, 대안, 최종 선택 이유를 짧게 기록한다.'),
    quote('결정을 기록하지 않으면, 나중엔 왜 그렇게 했는지 아무도 설명하지 못한다.'),
  ],
  'hexagonal-architecture': [
    paragraph('헥사고날 아키텍처는 도메인 로직을 포트와 어댑터로 감싸 외부 기술에 대한 의존을 줄인다.'),
    heading(2, '핵심 구성 요소'),
    bulletedListItem('포트(Port): 도메인이 외부와 소통하는 인터페이스'),
    bulletedListItem('어댑터(Adapter): 포트를 구체 기술로 구현한 것'),
  ],
  hydration: [
    paragraph('하이드레이션은 서버에서 렌더링된 정적 HTML에 클라이언트 자바스크립트 이벤트를 붙이는 과정이다.'),
  ],
  'ci-cd': [
    paragraph('CI/CD 파이프라인은 빌드·테스트·배포 과정을 자동화해 변경사항을 빠르고 안전하게 반영한다.'),
    numberedListItem('코드 푸시'),
    numberedListItem('자동 빌드 및 테스트'),
    numberedListItem('배포'),
  ],
}
