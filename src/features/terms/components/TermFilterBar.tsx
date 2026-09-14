import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import type { TermDifficulty } from '../types'

// 난이도는 TermDifficulty가 3단계로 고정된 유니온이라(docs/notion-schema.md §4) 옵션을 하드코딩한다.
// 카테고리·태그는 조회된 용어 데이터에서 파생된 옵션을 props로 받는다(하드코딩 금지).
const DIFFICULTY_OPTIONS: TermDifficulty[] = ['입문', '중급', '심화']

interface TermFilterBarProps {
  keyword: string
  category: string
  difficulty: TermDifficulty | 'all'
  tag: string
  categoryOptions: string[]
  tagOptions: string[]
  disabled?: boolean
  onKeywordChange: (value: string) => void
  onCategoryChange: (value: string) => void
  onDifficultyChange: (value: TermDifficulty | 'all') => void
  onTagChange: (value: string) => void
  onReset: () => void
}

// 용어 목록 검색·필터 컨트롤 — 키워드 입력 + 카테고리/난이도/태그 셀렉트 + 초기화 버튼.
export function TermFilterBar({
  keyword,
  category,
  difficulty,
  tag,
  categoryOptions,
  tagOptions,
  disabled,
  onKeywordChange,
  onCategoryChange,
  onDifficultyChange,
  onTagChange,
  onReset,
}: TermFilterBarProps) {
  return (
    <div className="flex flex-wrap gap-3">
      <Input
        placeholder="용어명 또는 한 줄 요약으로 검색"
        className="max-w-xs"
        value={keyword}
        onChange={(event) => onKeywordChange(event.target.value)}
        disabled={disabled}
      />

      <Select value={category} onValueChange={onCategoryChange} disabled={disabled}>
        <SelectTrigger className="w-40">
          <SelectValue placeholder="카테고리" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">전체</SelectItem>
          {categoryOptions.map((option) => (
            <SelectItem key={option} value={option}>
              {option}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={difficulty}
        onValueChange={(value) => onDifficultyChange(value as TermDifficulty | 'all')}
        disabled={disabled}
      >
        <SelectTrigger className="w-32">
          <SelectValue placeholder="난이도" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">전체</SelectItem>
          {DIFFICULTY_OPTIONS.map((option) => (
            <SelectItem key={option} value={option}>
              {option}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={tag} onValueChange={onTagChange} disabled={disabled}>
        <SelectTrigger className="w-32">
          <SelectValue placeholder="태그" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">전체</SelectItem>
          {tagOptions.map((option) => (
            <SelectItem key={option} value={option}>
              {option}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Button variant="outline" onClick={onReset} disabled={disabled}>
        필터 초기화
      </Button>
    </div>
  )
}
