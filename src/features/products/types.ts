export type ProductStatus = 'active' | 'inactive' | 'discontinued'

export interface Product {
  id: string
  name: string
  category: string
  status: ProductStatus
  price: number
  stock: number
  updatedAt: string
}

export interface ProductListParams {
  keyword: string
  status: ProductStatus | 'all'
  page: number
  pageSize: number
}

export interface ProductListResult {
  items: Product[]
  total: number
}
