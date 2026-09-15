import type { ReactNode } from 'react'
import type { RichText } from '../types'

interface NotionRichTextProps {
  richText: RichText[]
}

// Notion rich_text 배열을 annotations(bold/italic/code/strikethrough)와 href에 따라
// 중첩된 인라인 태그로 감싸 렌더링한다 (예: bold + link 조합도 처리).
export function NotionRichText({ richText }: NotionRichTextProps) {
  return (
    <>
      {richText.map((run, index) => (
        // rich_text 항목 자체는 고유 식별자가 없는 순수 텍스트 조각이라 인덱스를 key로 쓴다.
        <span key={index}>{renderRun(run)}</span>
      ))}
    </>
  )
}

// annotations를 안쪽부터 바깥쪽 순서로 감싸 하나의 텍스트 조각을 렌더링한다.
// code → bold → italic → strikethrough → href(링크는 가장 바깥) 순으로 중첩한다.
function renderRun(run: RichText): ReactNode {
  const { plain_text: text, annotations, href } = run

  let node: ReactNode = text

  if (annotations.code) {
    node = <code>{node}</code>
  }
  if (annotations.bold) {
    node = <strong>{node}</strong>
  }
  if (annotations.italic) {
    node = <em>{node}</em>
  }
  if (annotations.strikethrough) {
    node = <s>{node}</s>
  }
  if (href) {
    node = (
      <a href={href} target="_blank" rel="noreferrer" className="underline underline-offset-2">
        {node}
      </a>
    )
  }

  return node
}
