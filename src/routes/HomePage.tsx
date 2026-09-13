import { PageHeader } from '@/components/common/PageHeader'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'

// 용어 목록 화면 — 검색·필터 입력과 카드 그리드 레이아웃 뼈대만 구성한다.
// 실제 Notion 데이터 조회·검색·필터 동작은 src/features/terms/ 구현(PRD 7장 2~3단계) 이후 연결한다.
export function HomePage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="용어 목록"
        description="개발 용어와 개념을 검색하고 필터링해 찾아보세요."
      />

      {/* 검색·필터 자리 — 키워드 검색과 카테고리/난이도/태그 셀렉트가 들어갈 영역.
          아직 상태·조회 로직이 없어 disabled로 표시만 해둔다. */}
      <div className="flex flex-wrap gap-3">
        <Input
          placeholder="용어명 또는 한 줄 요약으로 검색"
          className="max-w-xs"
          disabled
        />
        <Select disabled>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="카테고리" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">전체</SelectItem>
          </SelectContent>
        </Select>
        <Select disabled>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="난이도" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">전체</SelectItem>
          </SelectContent>
        </Select>
        <Select disabled>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="태그" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">전체</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* 목록 표시 자리 — 실제 연동 후 로딩 중에는 아래와 같은 스켈레톤 카드를,
          결과 0건일 때는 EmptyState(@/components/common/EmptyState)를 렌더링한다. */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <Skeleton key={index} className="h-40 rounded-lg" />
        ))}
      </div>
    </div>
  )
}
