import { Moon, Sun } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useThemeStore } from '@/stores/useThemeStore'

// 드롭다운(열기 → 옵션 선택)은 두 번 클릭해야 테마가 바뀌어 불편하다는 피드백에 따라,
// 버튼 한 번 클릭으로 라이트↔다크가 즉시 토글되도록 단순화했다. 스토어의 Theme 타입
// (light/dark/system 3값)은 그대로 두었다 — index.html의 FOUC 방지 스크립트와
// sonner.tsx(Toaster의 theme prop)가 'system' 값과 'theme-storage' 키를 그대로
// 전제하고 있어, 스토어 구조를 바꾸면 그쪽까지 함께 손대야 하는데 이번 요청은 토글
// "상호작용 방식"만 바꾸면 충분하기 때문이다. 대신 이 컴포넌트는 'system' 선택지를
// 더 이상 노출하지 않고, 클릭 시점에 실제로 적용된 라이트/다크 여부만 보고 반대쪽으로
// setTheme한다 — 기존에 'system'으로 저장돼 있던 사용자도 한 번 클릭하면 명시적인
// light/dark로 전환되어 정상 동작한다.
export function ModeToggle() {
  const theme = useThemeStore((state) => state.theme)
  const setTheme = useThemeStore((state) => state.setTheme)

  // 스토어의 applyTheme과 동일한 판정 로직 — theme이 'system'일 때는 실제 화면이
  // OS 설정을 따르므로, 문자열 값이 아니라 이 판정 결과로 아이콘/aria-label을 맞춘다.
  const isDark =
    theme === 'dark' ||
    (theme === 'system' &&
      window.matchMedia('(prefers-color-scheme: dark)').matches)

  return (
    <Button
      type="button"
      variant="outline"
      size="icon"
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      aria-label={isDark ? '라이트 모드로 전환' : '다크 모드로 전환'}
    >
      <Sun className="size-4 scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
      <Moon className="absolute size-4 scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
    </Button>
  )
}
