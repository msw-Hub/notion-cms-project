import { Outlet } from 'react-router'
import { Sidebar } from './Sidebar'
import { Header } from './Header'

export function AppLayout() {
  return (
    <div className="flex min-h-svh">
      <Sidebar />
      {/* min-w-0: 자식(테이블 등)의 내재 너비가 flex 아이템을 넓혀 페이지 전체가
          가로로 밀리는 것을 막는다 — flex 기본값(min-width:auto) 때문에 필요하다. */}
      <div className="flex min-w-0 flex-1 flex-col">
        <Header />
        <main className="min-w-0 flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
