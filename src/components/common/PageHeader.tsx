import type { ReactNode } from 'react'

interface PageHeaderProps {
  title: string
  description?: string
  // 제목 옆(우측)에 배치할 버튼/링크 등 — 옵셔널이라 기존 호출부는 그대로 동작한다
  actions?: ReactNode
}

export function PageHeader({ title, description, actions }: PageHeaderProps) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {actions}
    </div>
  )
}
