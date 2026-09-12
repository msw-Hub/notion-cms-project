import { useQuery } from '@tanstack/react-query'
import { fetchProductById, productKeys } from '@/features/products/api/products'

export function useProduct(id: string) {
  return useQuery({
    queryKey: productKeys.detail(id),
    queryFn: () => fetchProductById(id),
  })
}
