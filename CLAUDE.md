# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 명령어

```
npm run dev            # 개발 서버 (Vite)
npm run build          # tsc -b (타입 체크) 후 vite build
npm run lint           # eslint .
npm run format         # prettier --write .
npm run format:check   # prettier --check .
npm run preview        # 빌드 결과 미리보기
```

테스트 러너는 아직 구성되어 있지 않다 (Vitest/RTL 미설치).

## 아키텍처

React 19 + TypeScript + Vite 기반 SPA 스타터킷이며, `~/.claude/rules/frontend-style.md`에 정의된
feature 단위 구조를 그대로 따른다. 새 기능을 추가할 때는 그 규칙(네이밍, 주석 밀도, 폴더 구성)을 우선 참고할 것.

### 데이터 흐름과 백엔드 연동 계약

- `src/lib/apiClient.ts`의 axios 인터셉터가 백엔드의 `CommonResponse<T>` 래퍼를 벗겨 `data.data`만 반환하므로,
  `features/*/api/*.ts`에서는 `response.data.data`를 반복해서 꺼낼 필요가 없다.
- 에러는 백엔드가 RFC 9457 `ProblemDetail`(`application/problem+json`)로 내려주는 것을 전제로,
  인터셉터가 이를 파싱해 앱 내부 형태인 `ApiError`(`status`/`errorCode`/`message`)로 통일해 던진다.
  `errorCode`(SCREAMING_SNAKE_CASE) → 한국어 메시지 매핑은 `src/lib/errorMessages.ts` 한 곳에서만 관리한다.
- 아직 실제 백엔드가 없어 `src/mocks/mockApi.ts` + `src/mocks/db.ts`로 API를 흉내낸다. `mockApi.delay`/`delayError`가
  axios 인터셉터와 동일한 지연/에러 형태를 재현하므로, `features/*/api/*.ts`의 `mockApi` 호출을
  `import { api } from '@/lib/apiClient'` 기반 호출로 교체해도 훅/컴포넌트 쪽 코드는 손댈 필요가 없다.
  실제 연동 시 `src/mocks/` 전체를 삭제하는 것이 전제다.
- TanStack Query가 서버 상태를, Zustand가 클라이언트 전역 상태(테마, 사이드바 열림 여부)를 전담한다.
  React Router는 loader/action을 의도적으로 쓰지 않는다 — 두 라이브러리가 각자 캐시를 가지면 화면 전환 시
  어느 쪽 데이터를 신뢰할지 경합이 생기기 때문 (`src/routes/router.tsx` 주석 참고).
- 쿼리 키는 각 feature의 `api/*.ts`에 팩토리(`xxxKeys`)로 정의하고, 캐시 무효화 시 이 팩토리만 참조한다
  (`src/features/products/api/products.ts`의 `productKeys` 참고).
- `src/lib/queryClient.ts`의 기본 재시도 정책: 4xx는 재시도하지 않고 그 외(네트워크 오류, 5xx)만 1회 재시도.

### 테마 (다크모드)

- `useThemeStore`(zustand, `persist` 미들웨어)가 `localStorage`의 `theme-storage` 키에 테마를 저장하고
  `<html>`의 `dark` 클래스를 토글한다.
- `index.html`에 있는 인라인 스크립트가 React 렌더링 전에 같은 `theme-storage` 키를 읽어 FOUC(다크모드 깜빡임)를
  방지한다 — `useThemeStore`의 키 이름을 바꾸면 이 스크립트도 함께 수정해야 한다.

### 경로 별칭

`@/*` → `src/*` (`tsconfig.app.json`, `vite.config.ts` 양쪽에 정의되어 있으므로 별칭을 바꾸려면 두 곳 모두 수정).

### UI 컴포넌트 (shadcn/ui)

`src/components/ui/`는 shadcn CLI로 생성/관리되는 파일이다 (`components.json` 설정: style `radix-nova`,
baseColor `neutral`, iconLibrary `lucide`). 이 폴더는 `react-refresh/only-export-components` eslint 규칙에서
제외되어 있다 (cva 변형 객체 등을 컴포넌트와 함께 export하기 때문).

### React Compiler

`vite.config.ts`에서 `@rolldown/plugin-babel` + `reactCompilerPreset()`로 React Compiler(자동 메모이제이션)가
활성화되어 있다. 즉 `useMemo`/`useCallback`을 습관적으로 추가할 필요가 거의 없다 — 컴파일러가 처리하지 못하는
예외적인 경우에만 수동 메모이제이션을 고려한다.

## 환경 변수

`.env.example` 참고. `VITE_API_BASE_URL`(백엔드 API 베이스 URL)이 유일한 필수 변수이며, 실제 값은 `.env.local`에 채운다.
