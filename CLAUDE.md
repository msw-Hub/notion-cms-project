# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# Project Context
- PRD 문서: @docs/PRD.md
- 개발 로드맵: @docs/ROADMAP.md

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

DevDict(개발 용어/개념 사전)는 Notion을 CMS로 쓰는 읽기 전용 미니 위키다. React 19 + TypeScript + Vite
기반 SPA 스타터킷을 바탕으로 만들었으며, `~/.claude/rules/frontend-style.md`에 정의된 feature 단위 구조를
그대로 따른다. 새 기능을 추가할 때는 그 규칙(네이밍, 주석 밀도, 폴더 구성)을 우선 참고할 것. 상세 요구사항은
`docs/PRD.md`를 1차 근거로 삼는다.

### 데이터 흐름과 백엔드 연동 계약

- `src/lib/apiClient.ts`의 axios 인터셉터가 백엔드의 `CommonResponse<T>` 래퍼를 벗겨 `data.data`만 반환하므로,
  `features/*/api/*.ts`에서는 `response.data.data`를 반복해서 꺼낼 필요가 없다.
- 에러는 백엔드가 RFC 9457 `ProblemDetail`(`application/problem+json`)로 내려주는 것을 전제로,
  인터셉터가 이를 파싱해 앱 내부 형태인 `ApiError`(`status`/`errorCode`/`message`)로 통일해 던진다.
  `errorCode`(SCREAMING_SNAKE_CASE) → 한국어 메시지 매핑은 `src/lib/errorMessages.ts` 한 곳에서만 관리한다.
- 아직 Notion 연동 전이라 `src/mocks/mockApi.ts` + `src/mocks/db.ts`로 API를 흉내낸다. `mockApi.delay`/`delayError`가
  axios 인터셉터와 동일한 지연/에러 형태를 재현하므로, `features/terms/api/terms.ts`의 `mockApi` 호출을
  `import { api } from '@/lib/apiClient'` 기반 호출(자체 Notion 프록시 엔드포인트 호출)로 교체해도
  훅/컴포넌트 쪽 코드는 손댈 필요가 없다. 실제 연동 시 `src/mocks/` 전체를 삭제하는 것이 전제다.
- TanStack Query가 서버 상태를, Zustand가 클라이언트 전역 상태(테마, 사이드바 열림 여부)를 전담한다.
  React Router는 loader/action을 의도적으로 쓰지 않는다 — 두 라이브러리가 각자 캐시를 가지면 화면 전환 시
  어느 쪽 데이터를 신뢰할지 경합이 생기기 때문 (`src/routes/router.tsx` 주석 참고).
- 쿼리 키는 각 feature의 `api/*.ts`에 팩토리(`xxxKeys`)로 정의하고, 캐시 무효화 시 이 팩토리만 참조한다
  (`src/features/terms/api/terms.ts`의 `termKeys` 참고).
- `src/lib/queryClient.ts`의 기본 재시도 정책: 4xx는 재시도하지 않고 그 외(네트워크 오류, 5xx)만 1회 재시도.

### Notion 연동 (프록시 경유)

- Notion 통합 토큰은 브라우저에 노출할 수 없고 Notion API는 CORS를 지원하지 않으므로, 프런트엔드는
  Notion API를 직접 호출하지 않는다. `src/lib/apiClient.ts`로 자체 프록시 엔드포인트(`/notion-proxy/**`)만
  호출하고, `@notionhq/client` SDK는 클라이언트 번들에 절대 import하지 않는다 (서버/프록시 측 전용).
- 개발 중에는 `vite.config.ts`의 `server.proxy`가 dev 전용 프록시 역할을 한다 — `configure`에서
  `Authorization`/`Notion-Version` 헤더를 서버(Node) 측에서 주입하고, PRD가 허용한 두 엔드포인트
  (data source 조회, 블록 children 조회)만 화이트리스트로 통과시킨다. 프로덕션에는 이 설정이 적용되지
  않으므로 별도 서버리스 프록시 구현이 필요하다 (PRD 3장).
- 공개여부(비공개 초안) 필터는 반드시 프록시 측에서 Notion query filter로 적용한다. 카테고리·난이도·태그·
  키워드 필터는 공개 용어 전체를 받아온 뒤 클라이언트 사이드에서 수행한다 (PRD 6장).
- `NOTION_TOKEN`/`NOTION_DATA_SOURCE_ID`는 `VITE_` 접두사를 붙이지 않는다 (`.env.example` 참고) —
  붙이면 토큰이 클라이언트 번들에 그대로 노출된다.

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

`.env.example` 참고. `VITE_API_BASE_URL`(백엔드 API 베이스 URL) 외에 Notion 연동용 `NOTION_TOKEN`,
`NOTION_DATA_SOURCE_ID`(서버/프록시 측 전용, `VITE_` 접두사 없음)가 필요하다. 실제 값은 `.env.local`에 채운다.
