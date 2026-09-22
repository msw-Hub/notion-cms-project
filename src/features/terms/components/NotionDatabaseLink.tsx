import { ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'

// 목록 화면 우측 상단에 노출하는 Notion 바로가기 버튼(v2 확장 기능, PRD 9장 참고).
// 운영자(작성자) 전용 동선이라 VITE_NOTION_DATABASE_URL이 설정되지 않은 배포본(예: 방문자용)에서는
// 조용히 숨기는 편이 자연스러워 값이 없으면 null을 반환한다.
export function NotionDatabaseLink() {
  const databaseUrl = import.meta.env.VITE_NOTION_DATABASE_URL

  if (!databaseUrl) {
    return null
  }

  return (
    <Button asChild variant="outline" size="sm">
      <a href={databaseUrl} target="_blank" rel="noopener noreferrer">
        <ExternalLink aria-hidden="true" />
        Notion에서 용어 추가
      </a>
    </Button>
  )
}
