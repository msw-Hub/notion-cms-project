import { createBrowserRouter } from 'react-router'
import { AppLayout } from '@/components/layout/AppLayout'
import { HomePage } from '@/routes/HomePage'
import { DashboardPage } from '@/routes/DashboardPage'
import { ProductListPage } from '@/routes/ProductListPage'
import { ProductDetailPage } from '@/routes/ProductDetailPage'
import { NotFoundPage } from '@/routes/NotFoundPage'

// 라우팅은 React Router가, 서버 상태는 TanStack Query가 전담한다.
// loader/action은 의도적으로 쓰지 않는다 — 두 라이브러리가 각자 캐시를 가지면
// 화면을 이동할 때마다 어느 쪽 데이터를 신뢰할지 경합이 생기기 때문이다.
export const router = createBrowserRouter([
  // 랜딩페이지(홈)는 사이드바 없는 독립 화면이라 AppLayout 밖에 둔다.
  { path: '/', element: <HomePage /> },
  {
    // path 없이 element/children만 있는 pathless layout route.
    element: <AppLayout />,
    children: [
      { path: 'dashboard', element: <DashboardPage /> },
      { path: 'products', element: <ProductListPage /> },
      { path: 'products/:id', element: <ProductDetailPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])
