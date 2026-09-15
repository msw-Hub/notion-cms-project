import { CircleAlert } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { isApiError } from '@/lib/isApiError'

interface ErrorStateProps {
  error: unknown
  // 전달되면 "다시 시도" 버튼을 노출한다 — 주로 TanStack Query의 refetch를 그대로 연결한다.
  onRetry?: () => void
}

export function ErrorState({ error, onRetry }: ErrorStateProps) {
  const message = isApiError(error)
    ? error.message
    : '데이터를 불러오지 못했습니다.'

  return (
    <Alert variant="destructive">
      <CircleAlert className="size-4" />
      <AlertTitle>오류가 발생했습니다</AlertTitle>
      <AlertDescription>
        <p>{message}</p>
        {onRetry && (
          <Button
            variant="outline"
            size="sm"
            className="mt-2 w-fit"
            onClick={onRetry}
          >
            다시 시도
          </Button>
        )}
      </AlertDescription>
    </Alert>
  )
}
