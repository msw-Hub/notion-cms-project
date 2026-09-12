import { useEffect, useState } from 'react'

// 검색어처럼 빠르게 바뀌는 값을 delay(ms) 동안 입력이 없을 때만 갱신해 반환한다.
// 매 keystroke마다 API를 호출하지 않기 위해 사용한다.
export function useDebounce<T>(value: T, delay = 300): T {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])

  return debouncedValue
}
