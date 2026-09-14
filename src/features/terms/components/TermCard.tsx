import { Link } from 'react-router'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { Term } from '../types'

interface TermCardProps {
  term: Term
}

// 용어 목록 카드 1건. 카드 전체가 상세 페이지로 이동하는 링크다.
export function TermCard({ term }: TermCardProps) {
  return (
    <Link to={`/terms/${term.slug}`} className="block h-full">
      <Card className="h-full transition-colors hover:bg-muted/50">
        <CardHeader>
          <CardTitle>{term.name}</CardTitle>
          {/* line-clamp-2로 요약이 길어도 카드 높이가 2줄로 고정된다 */}
          <CardDescription className="line-clamp-2">
            {term.summary}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-1.5">
          <Badge variant="secondary">{term.category}</Badge>
          <Badge variant="secondary">{term.difficulty}</Badge>
          {term.tags.map((tag) => (
            <Badge key={tag} variant="outline">
              {tag}
            </Badge>
          ))}
        </CardContent>
      </Card>
    </Link>
  )
}
