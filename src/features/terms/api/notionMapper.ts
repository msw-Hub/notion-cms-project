// Notion 원본 응답(raw)을 앱이 쓰는 평탄한 Term/TermBlock으로 변환하는 매핑 레이어.
// 속성 이름(영문)은 docs/notion-schema.md §1 표가 유일한 근거이므로, 여기서도 그 이름
// 문자열로만 속성을 찾는다.
import type { RichText, Term, TermBlock, TermDifficulty } from '../types'

const TERM_DIFFICULTIES: readonly TermDifficulty[] = ['입문', '중급', '심화']

// ---- Notion 원본 응답 타입 (이 파일 안에서만 쓰는 파싱 대상 shape) ----
// Task011/012에서 /notion-proxy 응답을 타이핑할 때도 이 타입들을 그대로 재사용한다.

interface NotionRichTextRaw {
  plain_text: string
  href: string | null
  annotations: {
    bold: boolean
    italic: boolean
    strikethrough: boolean
    underline: boolean
    code: boolean
    color: string
  }
}

interface NotionTitleProperty {
  type: 'title'
  title: NotionRichTextRaw[]
}

interface NotionRichTextProperty {
  type: 'rich_text'
  rich_text: NotionRichTextRaw[]
}

interface NotionSelectProperty {
  type: 'select'
  select: { name: string } | null
}

interface NotionMultiSelectProperty {
  type: 'multi_select'
  multi_select: { name: string }[]
}

interface NotionLastEditedTimeProperty {
  type: 'last_edited_time'
  last_edited_time: string
}

interface NotionRelationProperty {
  type: 'relation'
  relation: { id: string }[]
}

export interface NotionPage {
  object: 'page'
  id: string
  properties: {
    Name?: NotionTitleProperty
    Slug?: NotionRichTextProperty
    Summary?: NotionRichTextProperty
    Category?: NotionSelectProperty
    Tags?: NotionMultiSelectProperty
    Difficulty?: NotionSelectProperty
    'Updated At'?: NotionLastEditedTimeProperty
    'Related Terms'?: NotionRelationProperty
    // 편집 편의용으로 추가된 속성 등, 매핑에 쓰지 않는 나머지 속성은 타입을 좁히지 않는다.
    [propertyName: string]: unknown
  }
}

interface NotionBlockBase {
  id: string
  type: string
  has_children: boolean
}

// paragraph/heading_1~3/bulleted_list_item/numbered_list_item/quote는 전부
// `{ [type]: { rich_text } }` 형태만 갖는다는 공통점이 있어 하나의 인터페이스로 묶는다.
interface NotionRichTextOnlyBlock extends NotionBlockBase {
  type:
    | 'paragraph'
    | 'heading_1'
    | 'heading_2'
    | 'heading_3'
    | 'bulleted_list_item'
    | 'numbered_list_item'
    | 'quote'
  [key: string]: unknown
}

interface NotionCodeBlock extends NotionBlockBase {
  type: 'code'
  code: { rich_text: NotionRichTextRaw[]; language: string }
}

interface NotionImageBlock extends NotionBlockBase {
  type: 'image'
  image: {
    type: 'external' | 'file'
    external?: { url: string }
    file?: { url: string }
    caption: NotionRichTextRaw[]
  }
}

// PRD가 지원하는 7종 밖의 블록(toggle, divider, table 등)은 이 catch-all로 받아 매핑 단계에서 걸러낸다.
export type NotionBlock =
  | NotionRichTextOnlyBlock
  | NotionCodeBlock
  | NotionImageBlock
  | (NotionBlockBase & Record<string, unknown>)

// ---- rich_text 변환 ----

// Notion rich_text 배열의 각 항목은 원본 type(text/mention/equation)과 무관하게
// plain_text·annotations·href를 공통으로 갖는다. 렌더러(NotionRichText)는 이 세 필드만
// 쓰므로 원본 type 구분은 버리고 전부 'text'로 통일해 앱 내부 RichText 타입에 맞춘다.
function mapRichText(richText: NotionRichTextRaw[] | undefined): RichText[] {
  if (!richText) return []
  return richText.map((item) => ({
    type: 'text',
    plain_text: item.plain_text,
    annotations: { ...item.annotations },
    href: item.href,
  }))
}

function joinPlainText(richText: NotionRichTextRaw[] | undefined): string {
  return (richText ?? []).map((item) => item.plain_text).join('')
}

// ---- Term 매핑 ----

// Notion 페이지 1건을 Term으로 변환한다. Name(제목) 또는 Slug가 비어 있으면 null을 반환해
// 호출자가 그 행을 건너뛰게 한다 — 실수로 생긴 빈 행 하나 때문에 전체 목록 조회가 깨지지
// 않게 하기 위함이다(실제로 이런 빈 행이 Task 009 검증 중 발견됐다).
export function mapNotionPageToTerm(page: NotionPage): Term | null {
  const name = joinPlainText(page.properties.Name?.title)
  const slug = joinPlainText(page.properties.Slug?.rich_text).trim()

  if (!name || !slug) {
    if (import.meta.env.DEV) {
      console.warn(
        `[notionMapper] Name 또는 Slug가 비어 있어 페이지를 건너뜁니다. (pageId: ${page.id})`,
      )
    }
    return null
  }

  const rawDifficulty = page.properties.Difficulty?.select?.name
  const difficulty = TERM_DIFFICULTIES.includes(rawDifficulty as TermDifficulty)
    ? (rawDifficulty as TermDifficulty)
    : '입문'

  if (difficulty !== rawDifficulty && import.meta.env.DEV) {
    console.warn(
      `[notionMapper] "${name}"의 Difficulty 값("${String(rawDifficulty)}")이 유효 범위(입문/중급/심화)를 벗어나 "입문"으로 대체합니다.`,
    )
  }

  return {
    pageId: page.id,
    slug,
    name,
    summary: joinPlainText(page.properties.Summary?.rich_text),
    category: page.properties.Category?.select?.name ?? '',
    difficulty,
    tags: page.properties.Tags?.multi_select.map((option) => option.name) ?? [],
    updatedAt: page.properties['Updated At']?.last_edited_time ?? '',
    relatedPageIds:
      page.properties['Related Terms']?.relation.map(
        (relation) => relation.id,
      ) ?? [],
  }
}

export function mapNotionPageListToTerms(pages: NotionPage[]): Term[] {
  return pages
    .map(mapNotionPageToTerm)
    .filter((term): term is Term => term !== null)
}

// ---- TermBlock 매핑 ----

const SUPPORTED_BLOCK_TYPES = new Set<string>([
  'paragraph',
  'heading_1',
  'heading_2',
  'heading_3',
  'bulleted_list_item',
  'numbered_list_item',
  'code',
  'quote',
  'image',
])

// 호출자(fetchBlockChildren)가 미지원 타입의 자식까지 굳이 API로 재귀 조회하는 낭비를
// 피할 수 있도록 판별 함수를 노출한다 — 판단 결과가 버려질 호출을 미리 건너뛰기 위함이다.
export function isSupportedBlockType(type: string): boolean {
  return SUPPORTED_BLOCK_TYPES.has(type)
}

function getRichTextField(block: NotionBlock): NotionRichTextRaw[] | undefined {
  const field = (block as Record<string, unknown>)[block.type]
  if (field && typeof field === 'object' && 'rich_text' in field) {
    return (field as { rich_text: NotionRichTextRaw[] }).rich_text
  }
  return undefined
}

// Notion 블록 1건을 TermBlock으로 변환한다. 재귀 조회(부모의 자식 블록을 별도 API로 가져오는 것)
// 자체는 이 함수의 책임이 아니다 — 호출자(Task012의 fetchTermBySlug)가 자식을 먼저 재귀적으로
// 조회·매핑한 뒤 children으로 넘겨준다. PRD가 지원하는 7종 밖의 타입은 null을 반환해 렌더러까지
// 가지 않고 이 단계에서 걸러진다.
export function mapNotionBlockToTermBlock(
  block: NotionBlock,
  children?: TermBlock[],
): TermBlock | null {
  if (!SUPPORTED_BLOCK_TYPES.has(block.type)) {
    if (import.meta.env.DEV) {
      console.warn(
        `[notionMapper] 지원하지 않는 블록 타입("${block.type}")을 건너뜁니다.`,
      )
    }
    return null
  }

  const base = { id: block.id, has_children: block.has_children, children }

  if (block.type === 'code') {
    const codeBlock = block as NotionCodeBlock
    return {
      ...base,
      type: 'code',
      code: {
        rich_text: mapRichText(codeBlock.code.rich_text),
        language: codeBlock.code.language,
      },
    }
  }

  if (block.type === 'image') {
    const imageBlock = block as NotionImageBlock
    return {
      ...base,
      type: 'image',
      image: {
        url: imageBlock.image.external?.url ?? imageBlock.image.file?.url ?? '',
        caption: mapRichText(imageBlock.image.caption),
      },
    }
  }

  // 나머지(paragraph/heading_1~3/bulleted_list_item/numbered_list_item/quote)는 전부
  // `{ [block.type]: { rich_text } }` 형태만 가지므로 공통으로 처리한다.
  // TS는 동적 키(`[block.type]`)로 만든 객체가 TermBlock 유니온의 어느 분기와 일치하는지
  // 정적으로 추론하지 못하므로 단언(as)이 필요하다 — 위 SUPPORTED_BLOCK_TYPES 체크가
  // 런타임 안전성을 보장한다.
  return {
    ...base,
    type: block.type,
    [block.type]: { rich_text: mapRichText(getRichTextField(block)) },
  } as TermBlock
}

export function mapNotionBlockListToTermBlocks(
  blocks: NotionBlock[],
): TermBlock[] {
  return blocks
    .map((block) => mapNotionBlockToTermBlock(block))
    .filter((block): block is TermBlock => block !== null)
}
