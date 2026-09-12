import { Link, NavLink } from 'react-router'
import { LayoutDashboard, Package } from 'lucide-react'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
  { to: '/dashboard', label: '대시보드', icon: LayoutDashboard, end: true },
  { to: '/products', label: '상품 관리', icon: Package, end: false },
] as const

interface SidebarNavProps {
  onNavigate?: () => void
}

// 데스크톱 고정 사이드바와 모바일 Sheet 내부에서 함께 쓰는 내비게이션 목록.
export function SidebarNav({ onNavigate }: SidebarNavProps) {
  return (
    <nav className="flex flex-col gap-1 p-4">
      {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          onClick={onNavigate}
          className={({ isActive }) =>
            cn(
              'flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors',
              isActive
                ? 'bg-secondary text-secondary-foreground'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground',
            )
          }
        >
          <Icon className="size-4" />
          {label}
        </NavLink>
      ))}
    </nav>
  )
}

export function Sidebar() {
  return (
    <aside className="hidden w-56 shrink-0 border-r md:block">
      <Link
        to="/"
        className="flex h-14 items-center border-b px-4 font-semibold"
      >
        React Starter Kit
      </Link>
      <SidebarNav />
    </aside>
  )
}
