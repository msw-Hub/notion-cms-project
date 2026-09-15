import type { ApiError } from '@/types/api'
import { getErrorMessage } from '@/lib/errorMessages'
import {
  isSupportedBlockType,
  mapNotionBlockToTermBlock,
  mapNotionPageListToTerms,
  mapNotionPageToTerm,
} from './notionMapper'
import type { NotionBlock, NotionPage } from './notionMapper'
import { notion } from './notionClient'
import type { Term, TermBlock, TermDetail, TermListParams } from '../types'

// TanStack Query 쿼리 키 팩토리 — 캐시 무효화 시 이 팩토리만 참조한다.
export const termKeys = {
  all: ['terms'] as const,
  lists: () => [...termKeys.all, 'list'] as const,
  list: (params: TermListParams) => [...termKeys.lists(), params] as const,
  details: () => [...termKeys.all, 'detail'] as const,
  detail: (slug: string) => [...termKeys.details(), slug] as const,
}

// data source 쿼리 응답 — Notion list 객체 공통 형태.
interface NotionQueryResponse {
  object: 'list'
  results: NotionPage[]
  has_more: boolean
  next_cursor: string | null
}

// 공개 용어 목록을 조회한다. 공개여부 필터를 요청 본문의 Notion query filter로 걸어
// 프록시(서버) 단에서 비공개(초안) 용어가 애초에 응답에 실리지 않게 한다(PRD 6장).
// Notion의 page_size 상한(100)을 has_more/next_cursor로 순회해 전량을 모은 뒤 반환한다 —
// "페이지네이션 없음"은 UI에 한정되고, 이 내부 커서 순회와는 별개다.
export async function fetchTerms(): Promise<Term[]> {
  const pages: NotionPage[] = []
  let cursor: string | undefined

  do {
    const response = await notion.post<NotionQueryResponse>(
      '/v1/data_sources/query',
      {
        filter: { property: 'Published', checkbox: { equals: true } },
        page_size: 100,
        start_cursor: cursor,
      },
    )
    pages.push(...response.results)
    cursor = response.has_more ? (response.next_cursor ?? undefined) : undefined
  } while (cursor)

  return mapNotionPageListToTerms(pages)
}

// 블록 children 응답 — Notion list 객체 공통 형태.
interface NotionBlockListResponse {
  object: 'list'
  results: NotionBlock[]
  has_more: boolean
  next_cursor: string | null
}

function notFoundError(): ApiError {
  return {
    status: 404,
    errorCode: 'NOT_FOUND',
    message: getErrorMessage('NOT_FOUND'),
  }
}

// 무한 재귀(순환 참조 등 비정상 응답)를 막기 위한 자식 블록 조회 깊이 상한.
// docs/notion-schema.md §8의 중첩 검증 케이스(헥사고날 아키텍처, 깊이 1)보다 넉넉하게 잡는다.
const MAX_BLOCK_DEPTH = 5

// 블록 하나의 자식 목록을 100건 단위 커서 순회로 전량 수집하고, has_children인 자식은
// 깊이 상한 안에서 재귀적으로 조회·매핑한다. 상한을 넘어서면 그 밑의 자식은 생략한다
// (조용히 잘라내는 편이 상세 페이지 전체가 깨지는 것보다 낫다).
async function fetchBlockChildren(
  blockId: string,
  depth = 0,
): Promise<TermBlock[]> {
  const rawBlocks: NotionBlock[] = []
  let cursor: string | undefined

  do {
    const response = await notion.get<NotionBlockListResponse>(
      `/v1/blocks/${blockId}/children`,
      { params: { page_size: 100, start_cursor: cursor } },
    )
    rawBlocks.push(...response.results)
    cursor = response.has_more ? (response.next_cursor ?? undefined) : undefined
  } while (cursor)

  const blocks: TermBlock[] = []
  for (const raw of rawBlocks) {
    // 미지원 타입(toggle 등)은 매핑 결과가 어차피 버려지므로, 자식이 있어도 재귀 조회
    // 자체를 하지 않는다 — 안 그러면 Notion API 호출만 낭비된다(60초 캐시/3req·s 한도 대응).
    let children: TermBlock[] | undefined
    if (raw.has_children && isSupportedBlockType(raw.type)) {
      if (depth < MAX_BLOCK_DEPTH) {
        children = await fetchBlockChildren(raw.id, depth + 1)
      } else if (import.meta.env.DEV) {
        console.warn(
          `[terms] 블록 중첩 깊이 상한(${MAX_BLOCK_DEPTH})을 초과해 자식 블록을 생략합니다. (blockId: ${raw.id})`,
        )
      }
    }
    const mapped = mapNotionBlockToTermBlock(raw, children)
    if (mapped) blocks.push(mapped)
  }
  return blocks
}

// 슬러그로 상세 용어 1건과 본문 블록을 조회한다.
// Published·Slug 복합 필터로 공개 용어 중 슬러그가 일치하는 1건만 조회하고,
// 없으면(비공개이거나 존재하지 않는 슬러그) 404 ApiError로 통일해 거절한다.
export async function fetchTermBySlug(slug: string): Promise<TermDetail> {
  const response = await notion.post<NotionQueryResponse>(
    '/v1/data_sources/query',
    {
      filter: {
        and: [
          { property: 'Published', checkbox: { equals: true } },
          { property: 'Slug', rich_text: { equals: slug } },
        ],
      },
      page_size: 1,
    },
  )

  const page = response.results[0]
  if (!page) {
    return Promise.reject(notFoundError())
  }

  const term = mapNotionPageToTerm(page)
  if (!term) {
    // 필터가 이미 Slug 일치 행만 반환했으므로 이론상 도달하지 않지만,
    // Name이 비어 있는 등 매핑 실패 케이스도 동일하게 404로 처리해 방어한다.
    return Promise.reject(notFoundError())
  }

  const blocks = await fetchBlockChildren(page.id)
  return { ...term, blocks }
}

// 관련 용어(Relation) 해석에 재사용하는 pageId → Term 맵.
// 맵에 없는 pageId(예: 비공개 용어)는 관련 용어 렌더링에서 자연스럽게 제외된다.
export function buildTermMap(terms: Term[]): Map<string, Term> {
  return new Map(terms.map((term) => [term.pageId, term]))
}
