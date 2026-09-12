import { useQuery } from '@tanstack/react-query'
import { fetchProducts, productKeys } from '@/features/products/api/products'
import type { ProductListParams } from '@/features/products/types'

export function useProducts(params: ProductListParams) {
  return useQuery({
    queryKey: productKeys.list(params),
    queryFn: () => fetchProducts(params),
  })
}
