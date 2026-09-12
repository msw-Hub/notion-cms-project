import { CircleAlert } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { isApiError } from '@/lib/isApiError'

interface ErrorStateProps {
  error: unknown
}

export function ErrorState({ error }: ErrorStateProps) {
  const message = isApiError(error)
    ? error.message
    : '데이터를 불러오지 못했습니다.'

  return (
    <Alert variant="destructive">
      <CircleAlert className="size-4" />
      <AlertTitle>오류가 발생했습니다</AlertTitle>
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  )
}
