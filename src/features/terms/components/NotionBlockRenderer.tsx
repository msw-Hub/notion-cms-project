import { Fragment, type ReactNode } from 'react'
import type {
  BulletedListItemBlock,
  NumberedListItemBlock,
  TermBlock,
} from '../types'
import { NotionRichText } from './NotionRichText'

interface NotionBlockRendererProps {
  blocks: TermBlock[]
}

// 인접한 목록 항목을 하나의 <ul>/<ol>로 묶기 위한 중간 표현.
// Notion API는 목록 항목을 각각 독립된 블록으로 내려주므로(그룹 개념이 없음),
// 렌더링 직전에 같은 타입이 연속되는 구간을 찾아 하나의 그룹으로 합친다.
type RenderGroup =
  | {
      kind: 'list'
      tag: 'ul' | 'ol'
      items: Array<BulletedListItemBlock | NumberedListItemBlock>
    }
  | { kind: 'single'; block: TermBlock }

function isListItemBlock(
  block: TermBlock,
): block is BulletedListItemBlock | NumberedListItemBlock {
  return (
    block.type === 'bulleted_list_item' || block.type === 'numbered_list_item'
  )
}

function groupBlocks(blocks: TermBlock[]): RenderGroup[] {
  const groups: RenderGroup[] = []

  for (const block of blocks) {
    if (isListItemBlock(block)) {
      const tag = block.type === 'bulleted_list_item' ? 'ul' : 'ol'
      const lastGroup = groups.at(-1)
      // 바로 직전 그룹이 같은 목록 태그면 새 그룹을 만들지 않고 이어 붙인다.
      if (lastGroup?.kind === 'list' && lastGroup.tag === tag) {
        lastGroup.items.push(block)
        continue
      }
      groups.push({ kind: 'list', tag, items: [block] })
    } else {
      groups.push({ kind: 'single', block })
    }
  }

  return groups
}

// Notion 페이지 본문 블록 배열을 시맨틱 태그로 렌더링한다.
// 자식 블록(has_children)이 있는 경우 이 컴포넌트를 재귀 호출해 중첩 구조를 그대로 반영한다.
export function NotionBlockRenderer({ blocks }: NotionBlockRendererProps) {
  const groups = groupBlocks(blocks)

  return (
    <div className="space-y-4">
      {groups.map((group) =>
        group.kind === 'list' ? (
          <ListGroup
            key={group.items[0].id}
            tag={group.tag}
            items={group.items}
          />
        ) : (
          <SingleBlock key={group.block.id} block={group.block} />
        ),
      )}
    </div>
  )
}

interface ListGroupProps {
  tag: 'ul' | 'ol'
  items: Array<BulletedListItemBlock | NumberedListItemBlock>
}

// 연속된 bulleted_list_item/numbered_list_item을 하나의 <ul>/<ol>로 묶어 렌더링한다.
function ListGroup({ tag: Tag, items }: ListGroupProps) {
  return (
    <Tag
      className={
        Tag === 'ul'
          ? 'list-disc space-y-1 pl-6'
          : 'list-decimal space-y-1 pl-6'
      }
    >
      {items.map((item) => {
        const richText =
          item.type === 'bulleted_list_item'
            ? item.bulleted_list_item.rich_text
            : item.numbered_list_item.rich_text

        return (
          <li key={item.id}>
            <NotionRichText richText={richText} />
            {/* 목록 항목의 자식(중첩 목록/문단 등)은 li 안에서 재귀 렌더링한다 */}
            {item.has_children && item.children && item.children.length > 0 && (
              <div className="mt-1">
                <NotionBlockRenderer blocks={item.children} />
              </div>
            )}
          </li>
        )
      })}
    </Tag>
  )
}

interface SingleBlockProps {
  block: TermBlock
}

// 목록이 아닌 단일 블록 하나를 타입에 맞는 시맨틱 태그로 렌더링한다.
function SingleBlock({ block }: SingleBlockProps) {
  switch (block.type) {
    case 'paragraph':
      return (
        <BlockWithChildren block={block}>
          <p>
            <NotionRichText richText={block.paragraph.rich_text} />
          </p>
        </BlockWithChildren>
      )

    // 페이지 제목이 이미 h1이므로 Notion heading_1~3을 한 단계씩 내려 h2~h4로 매핑해
    // 문서 전체의 제목 계층을 지킨다.
    case 'heading_1':
      return (
        <BlockWithChildren block={block}>
          <h2 className="text-xl font-semibold tracking-tight">
            <NotionRichText richText={block.heading_1.rich_text} />
          </h2>
        </BlockWithChildren>
      )
    case 'heading_2':
      return (
        <BlockWithChildren block={block}>
          <h3 className="text-lg font-semibold tracking-tight">
            <NotionRichText richText={block.heading_2.rich_text} />
          </h3>
        </BlockWithChildren>
      )
    case 'heading_3':
      return (
        <BlockWithChildren block={block}>
          <h4 className="text-base font-semibold tracking-tight">
            <NotionRichText richText={block.heading_3.rich_text} />
          </h4>
        </BlockWithChildren>
      )

    case 'code':
      return (
        <pre className="overflow-x-auto rounded-lg bg-muted p-4 text-sm">
          <code>
            {block.code.rich_text.map((run) => run.plain_text).join('')}
          </code>
        </pre>
      )

    case 'quote':
      return (
        <BlockWithChildren block={block}>
          <blockquote className="border-l-2 pl-4 italic text-muted-foreground">
            <NotionRichText richText={block.quote.rich_text} />
          </blockquote>
        </BlockWithChildren>
      )

    case 'image': {
      // 캡션이 있으면 캡션을 alt로 우선 사용하고, 없으면 대체 텍스트로 접근성을 확보한다.
      const captionText = block.image.caption
        .map((run) => run.plain_text)
        .join('')
      return (
        <figure className="space-y-2">
          <img
            src={block.image.url}
            alt={captionText || '본문에 첨부된 이미지'}
            className="w-full rounded-lg border"
          />
          {captionText && (
            <figcaption className="text-center text-sm text-muted-foreground">
              {captionText}
            </figcaption>
          )}
        </figure>
      )
    }

    default:
      // PRD가 지원 대상으로 정한 7종 밖의 블록 타입(toggle, divider 등)이 실제 Notion
      // 응답에 섞여 와도 앱을 깨뜨리지 않고 조용히 건너뛴다. 개발 중에만 놓친 타입을 알아채도록 경고한다.
      if (import.meta.env.DEV) {
        console.warn(
          `지원하지 않는 Notion 블록 타입입니다: ${(block as { type: string }).type}`,
        )
      }
      return null
  }
}

interface BlockWithChildrenProps {
  block: TermBlock
  children: ReactNode
}

// has_children인 블록의 자식을 들여쓰기로 표현해 원본 페이지의 중첩 구조를 그대로 반영한다.
function BlockWithChildren({ block, children }: BlockWithChildrenProps) {
  const hasNestedContent =
    block.has_children && block.children && block.children.length > 0

  return (
    <Fragment>
      {children}
      {hasNestedContent && (
        <div className="mt-2 ml-4 space-y-2 border-l pl-4">
          <NotionBlockRenderer blocks={block.children!} />
        </div>
      )}
    </Fragment>
  )
}
