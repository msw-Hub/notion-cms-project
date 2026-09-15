import { Badge } from '@/components/ui/badge'
import type { Term } from '../types'

interface TermMetaBadgesProps {
  term: Term
}

// 상세 화면 상단에 카테고리·난이도·태그 배지와 최종수정일을 함께 보여준다.
export function TermMetaBadges({ term }: TermMetaBadgesProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Badge variant="secondary">{term.category}</Badge>
      <Badge variant="secondary">{term.difficulty}</Badge>
      {term.tags.map((tag) => (
        <Badge key={tag} variant="outline">
          {tag}
        </Badge>
      ))}
      <span className="text-sm text-muted-foreground">
        마지막 업데이트 {formatUpdatedAt(term.updatedAt)}
      </span>
    </div>
  )
}

// Notion Last edited time(ISO 문자열)을 "YYYY.MM.DD" 표기로 변환한다.
function formatUpdatedAt(isoString: string): string {
  const date = new Date(isoString)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}.${month}.${day}`
}
