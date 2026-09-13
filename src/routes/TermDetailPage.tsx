import { Link, useParams } from 'react-router'
import { ArrowLeft } from 'lucide-react'
import { PageHeader } from '@/components/common/PageHeader'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

// 용어 상세 화면 — 슬러그로 단건을 조회해 본문 블록과 관련 용어를 보여줄 자리.
// 실제 Notion 조회·블록 렌더링·관련 용어 링크·Not Found 처리는
// src/features/terms/ 구현(PRD 7장 4단계) 이후 연결한다.
export function TermDetailPage() {
  const { slug } = useParams<{ slug: string }>()

  return (
    <div className="space-y-6">
      <PageHeader
        title={`용어 상세 (${slug})`}
        description="용어명이 표시될 자리"
      />

      {/* 카테고리·난이도·태그 배지 + 최종수정일 자리 */}
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="secondary">카테고리</Badge>
        <Badge variant="secondary">난이도</Badge>
        <Badge variant="outline">태그</Badge>
        <span className="text-sm text-muted-foreground">최종 수정일 자리</span>
      </div>

      <Separator />

      {/* Notion 본문 블록(문단/제목/목록/코드/인용/이미지) 렌더링 자리 */}
      <div className="min-h-40 rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
        본문 블록 렌더링 영역
      </div>

      <Separator />

      {/* 관련 용어 링크 자리 — pageId → Term 맵으로 해석한 관련 용어 목록이 들어간다 */}
      <div className="space-y-2">
        <h2 className="text-sm font-semibold">관련 용어</h2>
        <p className="text-sm text-muted-foreground">
          관련 용어 링크가 표시될 자리
        </p>
      </div>

      <Link
        to="/"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        목록으로 돌아가기
      </Link>
    </div>
  )
}
