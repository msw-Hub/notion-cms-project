import { useState } from 'react'
import { useDebounce } from '@/hooks/useDebounce'
import type { TermListParams } from '../types'

// 검색·필터 상태를 관리하는 훅.
// keyword는 두 버전을 함께 반환한다 — filters.keyword는 Input을 controlled로 유지하기 위한
// 즉시 반영 값이고, debouncedFilters.keyword는 300ms 디바운스된 값으로 실제 필터링(useFilteredTerms)에
// 쓰인다. 이렇게 나누지 않으면 매 keystroke마다 필터링이 재계산된다.
export function useTermFilters() {
  const [keyword, setKeyword] = useState('')
  const [category, setCategory] = useState<TermListParams['category']>('all')
  const [difficulty, setDifficulty] = useState<TermListParams['difficulty']>('all')
  const [tag, setTag] = useState<TermListParams['tag']>('all')

  const debouncedKeyword = useDebounce(keyword, 300)

  const filters: TermListParams = { keyword, category, difficulty, tag }
  const debouncedFilters: TermListParams = { ...filters, keyword: debouncedKeyword }

  function reset() {
    setKeyword('')
    setCategory('all')
    setDifficulty('all')
    setTag('all')
  }

  return {
    filters,
    debouncedFilters,
    setKeyword,
    setCategory,
    setDifficulty,
    setTag,
    reset,
  }
}
