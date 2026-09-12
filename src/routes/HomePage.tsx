import { Link } from 'react-router'
import {
  Braces,
  LayoutDashboard,
  Package,
  Palette,
  Puzzle,
  Zap,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ModeToggle } from '@/components/theme/ModeToggle'

const TECH_STACK = [
  { name: 'Vite', description: '빠른 개발 서버와 번들링', icon: Zap },
  {
    name: 'React 19',
    description: 'React Compiler로 자동 최적화가 적용됩니다',
    icon: Puzzle,
  },
  {
    name: 'TypeScript',
    description: 'strict 모드로 안전한 타입 검사를 합니다',
    icon: Braces,
  },
  {
    name: 'Tailwind CSS v4',
    description: 'CSS 우선 설정 방식의 유틸리티 스타일링',
    icon: Palette,
  },
  {
    name: 'shadcn/ui',
    description: '복사해서 바로 커스터마이징하는 컴포넌트',
    icon: LayoutDashboard,
  },
  {
    name: 'TanStack Query + Zustand',
    description: '서버 상태와 클라이언트 상태를 분리해 관리합니다',
    icon: Package,
  },
] as const

export function HomePage() {
  return (
    <div className="min-h-svh">
      <header className="flex h-14 items-center justify-between border-b px-6">
        <Link to="/" className="font-semibold">
          React Starter Kit
        </Link>
        <ModeToggle />
      </header>

      <main className="mx-auto max-w-5xl px-6 py-16">
        <section className="space-y-6 text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            React Starter Kit
          </h1>
          <p className="mx-auto max-w-xl text-lg text-muted-foreground">
            Vite + React 19 + TypeScript + Tailwind CSS로 구성된, 바로 시작할 수
            있는 프론트엔드 스타터킷입니다.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Button asChild size="lg">
              <Link to="/dashboard">대시보드 보기</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/products">상품 관리 보기</Link>
            </Button>
          </div>
        </section>

        <section className="mt-20 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {TECH_STACK.map(({ name, description, icon: Icon }) => (
            <Card key={name}>
              <CardHeader className="flex flex-row items-center gap-3 space-y-0">
                <Icon className="size-5 text-muted-foreground" />
                <CardTitle className="text-base">{name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{description}</p>
              </CardContent>
            </Card>
          ))}
        </section>
      </main>
    </div>
  )
}
