import { Link } from 'react-router'
import { Button } from '@/components/ui/button'

export function NotFoundPage() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 py-24 text-center">
      <p className="text-6xl font-bold">404</p>
      <p className="text-muted-foreground">
        요청하신 페이지를 찾을 수 없습니다.
      </p>
      <Button asChild>
        <Link to="/dashboard">대시보드로 이동</Link>
      </Button>
    </div>
  )
}
