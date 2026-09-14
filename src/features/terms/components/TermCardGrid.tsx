import type { ReactNode } from 'react'

interface TermCardGridProps {
  children: ReactNode
}

// 용어 카드 그리드 레이아웃. TermCard와 TermCardSkeleton이 같은 그리드를
// 공유해야 로딩→실제 카드 전환 시 레이아웃이 튀지 않으므로, terms 배열을
// 직접 받지 않고 children으로 받아 두 경우 모두에서 재사용한다.
export function TermCardGrid({ children }: TermCardGridProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{children}</div>
  )
}
