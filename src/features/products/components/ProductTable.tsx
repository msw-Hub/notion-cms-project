import { Link } from 'react-router'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { ProductStatusBadge } from '@/features/products/components/ProductStatusBadge'
import type { Product } from '@/features/products/types'

interface ProductTableProps {
  products: Product[]
}

const currencyFormatter = new Intl.NumberFormat('ko-KR', {
  style: 'currency',
  currency: 'KRW',
})

export function ProductTable({ products }: ProductTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>상품명</TableHead>
          <TableHead>카테고리</TableHead>
          <TableHead>상태</TableHead>
          <TableHead className="text-right">가격</TableHead>
          <TableHead className="text-right">재고</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {products.map((product) => (
          <TableRow key={product.id}>
            <TableCell>
              <Link
                to={`/products/${product.id}`}
                className="font-medium hover:underline"
              >
                {product.name}
              </Link>
            </TableCell>
            <TableCell className="text-muted-foreground">
              {product.category}
            </TableCell>
            <TableCell>
              <ProductStatusBadge status={product.status} />
            </TableCell>
            <TableCell className="text-right">
              {currencyFormatter.format(product.price)}
            </TableCell>
            <TableCell className="text-right">
              {product.stock === 0 ? (
                <span className="text-destructive">품절</span>
              ) : (
                product.stock
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
