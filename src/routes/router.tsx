import { createBrowserRouter } from 'react-router'
import { AppLayout } from '@/components/layout/AppLayout'
import { HomePage } from '@/routes/HomePage'
import { TermDetailPage } from '@/routes/TermDetailPage'
import { NotFoundPage } from '@/routes/NotFoundPage'

// 라우팅은 React Router가, 서버 상태는 TanStack Query가 전담한다.
// loader/action은 의도적으로 쓰지 않는다 — 두 라이브러리가 각자 캐시를 가지면
// 화면을 이동할 때마다 어느 쪽 데이터를 신뢰할지 경합이 생기기 때문이다.
export const router = createBrowserRouter([
  {
    // path 없이 element/children만 있는 pathless layout route.
    element: <AppLayout />,
    children: [
      { path: '/', element: <HomePage /> }, // 용어 목록 (검색·필터·카드 그리드)
      { path: 'terms/:slug', element: <TermDetailPage /> }, // 용어 상세
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])
