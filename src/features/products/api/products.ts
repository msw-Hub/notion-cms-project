import { productsDb } from '@/mocks/db'
import { mockApi } from '@/mocks/mockApi'
import type {
  Product,
  ProductListParams,
  ProductListResult,
} from '@/features/products/types'

// TanStack Query 쿼리 키 팩토리 — 캐시 무효화 시 여기 정의된 키만 참조하면 된다.
export const productKeys = {
  all: ['products'] as const,
  lists: () => [...productKeys.all, 'list'] as const,
  list: (params: ProductListParams) =>
    [...productKeys.lists(), params] as const,
  details: () => [...productKeys.all, 'detail'] as const,
  detail: (id: string) => [...productKeys.details(), id] as const,
}

// NOTE: 실제 백엔드 연동 시 이 파일의 mockApi 호출을 아래 형태로 교체한다.
//   import { api } from '@/lib/apiClient'
//   return api.get<ProductListResult>('/products', { params })
export async function fetchProducts(
  params: ProductListParams,
): Promise<ProductListResult> {
  let items = productsDb

  if (params.keyword.trim()) {
    const keyword = params.keyword.trim().toLowerCase()
    items = items.filter((product) =>
      product.name.toLowerCase().includes(keyword),
    )
  }
  if (params.status !== 'all') {
    items = items.filter((product) => product.status === params.status)
  }

  const total = items.length
  const start = (params.page - 1) * params.pageSize
  const paged = items.slice(start, start + params.pageSize)

  return mockApi.delay({ items: paged, total })
}

export async function fetchProductById(id: string): Promise<Product> {
  const found = productsDb.find((product) => product.id === id)
  if (!found) {
    // 존재하지 않는 id 조회 시 실제 404 응답과 동일한 형태로 실패시켜
    // 에러 처리 경로(ErrorState, 한국어 메시지 매핑)를 그대로 보여준다.
    return mockApi.delayError('NOT_FOUND', 404)
  }
  return mockApi.delay(found)
}
