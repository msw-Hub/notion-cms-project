# DevDict AI Agent 운영 규칙

> 이 문서는 Coding Agent(AI)가 이 저장소에서 작업할 때만 참고하는 프로젝트 고유 규칙이다.
> 일반적인 React/TypeScript 지식은 다루지 않는다 — 그 내용은 `~/.claude/rules/frontend-style.md`에 있다.
> 요구사항은 `docs/PRD.md`, 작업 순서는 `docs/ROADMAP.md`가 1차 근거다. 이 문서와 충돌하면
> `docs/PRD.md` > `docs/ROADMAP.md` > 이 문서 순으로 우선한다.

## 1. 프로젝트 개요

- Notion을 CMS로 쓰는 읽기 전용 개발 용어 사전 SPA (React 19 + TypeScript + Vite 8).
- 인증 없음, 쓰기 기능 없음. 콘텐츠 편집은 전부 Notion 쪽에서 이루어진다.
- 현재 시점(`docs/ROADMAP.md` Phase 2 착수 전): 라우트/레이아웃/타입/쿼리 키 팩토리/dev 프록시까지만
  존재하고, `src/mocks/db.ts`는 비어 있으며 `fetchTerms`/`fetchTermBySlug`는 TODO 스텁이다.
  **작업 전 반드시 `docs/ROADMAP.md`에서 어느 Task까지 완료됐는지 먼저 확인하고, 그 순서(004 → 016)를
  건너뛰지 않는다.**

## 2. 데이터 계층 규칙 (수정 시 반드시 지킬 것)

### `src/lib/apiClient.ts` / `src/mocks/mockApi.ts`
- `apiClient`의 response 인터셉터가 이미 `response.data.data`를 반환한다.
  **DO**: `features/*/api/*.ts`에서 `await api.get<Term[]>(...)`처럼 바로 `T`를 받는다.
  **DON'T**: `response.data.data`를 다시 꺼내는 코드를 추가하지 않는다 (이중 언랩 버그).
- Notion 연동 전 단계(`fetchTerms`/`fetchTermBySlug` 구현 시)는 `src/mocks/mockApi.ts`의
  `delay`/`delayError`를 사용해 axios 인터셉터와 동일한 지연·에러 형태를 재현한다.
  실제 Notion 프록시 호출로 교체(ROADMAP Task 011/012)할 때만 `src/mocks/` 전체를 삭제한다 —
  그 전에는 목 데이터 경로를 남겨둔다.

### `src/lib/errorMessages.ts`
- 새로운 `errorCode`(예: Notion 에러를 정규화할 때, `RATE_LIMITED` 등)를 도입하면 **반드시**
  `ERROR_MESSAGES`에 한국어 메시지를 함께 추가한다. 추가하지 않으면 `DEFAULT_ERROR_MESSAGE`로
  조용히 대체되어 사용자에게 부정확한 안내가 나간다.
- `errorCode`는 SCREAMING_SNAKE_CASE로 통일한다.

### `src/features/terms/api/terms.ts` (쿼리 키)
- 캐시 무효화·쿼리 키 참조는 반드시 `termKeys`(`all`/`lists`/`list`/`details`/`detail`) 팩토리를
  통해서만 한다. `['terms', ...]` 형태의 배열을 다른 파일에서 직접 하드코딩하지 않는다.
- 새로운 용어 관련 쿼리가 필요하면 이 팩토리에 항목을 추가하고, 그 파일 하나에서만 관리한다.

### `src/lib/queryClient.ts`
- 재시도 정책(4xx 재시도 안 함, 그 외 1회 재시도)은 에러가 `ApiError`(`status`/`errorCode`/`message`)
  형태로 던져질 때만 정상 동작한다. 새 fetch 함수를 작성할 때 이 형태를 벗어난 에러(순수 `Error` 등)를
  그대로 던지지 않는다 — `isApiError` 가드가 실패해 항상 1회 재시도 경로를 타게 된다.

### `src/features/terms/types.ts`
- `TermBlock`은 현재 `unknown` 플레이스홀더다. ROADMAP Task 008(Notion 블록 렌더러) 이전에
  임의로 구체화하지 않는다 — 실제 Notion 블록 응답 스키마 확인 후 진행한다.
- `Term`/`TermDetail`의 필드는 PRD 4장 Notion 속성과 1:1 대응한다. 새 필드를 추가하려면
  `docs/PRD.md` 4장 표에도 대응 항목을 추가해야 한다(문서-코드 불일치 방지).

## 3. Notion 연동 규칙

### `vite.config.ts`의 `/notion-proxy` 화이트리스트
- 현재 허용된 경로는 정확히 둘뿐이다: `POST /v1/data_sources/{id}/query`, `GET /v1/blocks/{id}/children`.
- **새 Notion 엔드포인트가 필요해지면** `vite.config.ts`의 `isDataSourceQuery`/`isBlockChildren`
  정규식 화이트리스트에 조건을 추가하고, 동시에 `docs/PRD.md` 3장의 "허용 엔드포인트" 서술과
  ROADMAP Task 015(프로덕션 서버리스 프록시)의 화이트리스트 설계도 함께 갱신 대상으로 기록한다.
  프록시 화이트리스트를 한쪽만 고치고 다른 쪽을 누락하지 않는다.
- `Notion-Version` 헤더 값(`2026-03-11`)은 PRD가 지정한 값이다. `@notionhq/client` 기본값과
  다르다는 이유로 임의로 SDK 기본값에 맞추지 않는다.

### 속성 이름 표기 규칙
- Notion 데이터베이스 **속성 이름은 영어**(`Name`/`Slug`/`Category`/`Difficulty`/`Published` 등,
  `docs/notion-schema.md` 매핑표 기준)로, **Select/Multi-select 옵션 값과 Difficulty 3개 값은 한국어**로
  유지한다. `notionMapper.ts`(Task 010)에서 `properties['Slug']`처럼 영문 키로 접근하며,
  `docs/notion-schema.md`의 매핑표가 유일한 근거다 — 임의로 다른 영문 이름을 쓰지 않는다.

### 토큰/환경변수
- `NOTION_API_KEY`, `NOTION_DATA_SOURCE_ID`는 **절대** `VITE_` 접두사를 붙이지 않는다. 붙이면
  Vite가 클라이언트 번들에 그대로 노출한다. 새 환경변수를 추가할 때도 브라우저에 노출돼도 되는
  값인지 먼저 판단한 뒤 접두사 여부를 정한다.
- `.env.example`에 새 환경변수를 추가하면 `docs/PRD.md` 7장(구현 단계 1) 서술도 함께 갱신한다.

### `@notionhq/client` SDK
- `devDependencies`에 설치되어 있지만 **서버/프록시 코드 전용**이다. `src/**`(클라이언트 번들)
  어디에서도 `import`하지 않는다. dev 프록시(`vite.config.ts`)는 SDK 없이 순수 http 헤더 주입만
  한다는 점을 유지한다.

## 4. 다중 파일 연쇄 수정 지점

아래 항목을 수정할 때는 반드시 짝을 이루는 파일도 함께 확인·수정한다.

| 수정 대상 | 함께 확인·수정해야 하는 파일 | 이유 |
|---|---|---|
| `src/stores/useThemeStore.ts`의 `persist` `name`(`'theme-storage'`) | `index.html`의 FOUC 방지 인라인 스크립트 | 두 곳이 같은 localStorage 키를 읽어야 새로고침 시 깜빡임이 없다 |
| `@` 경로 별칭 값 | `tsconfig.app.json`, `vite.config.ts` (`resolve.alias`) | 별칭이 두 설정에 각각 정의되어 있어 한쪽만 바꾸면 타입체크/빌드가 어긋난다 |
| `vite.config.ts`의 `/notion-proxy` 화이트리스트 | `docs/PRD.md` 3장, ROADMAP Task 015(프로덕션 프록시) | dev 프록시와 프로덕션 프록시가 같은 화이트리스트 정책을 공유해야 한다 |
| `src/features/terms/api/terms.ts`의 `fetchTerms`/`fetchTermBySlug` 구현 교체 (mock → Notion) | `src/mocks/db.ts`, `src/mocks/mockApi.ts` 삭제 여부 | ROADMAP Task 011/012에서만 mock 제거가 전제이며, 그 전에 임의로 지우지 않는다 |
| `docs/PRD.md`의 기능/스키마 서술 변경 | `docs/ROADMAP.md`의 해당 Task 체크리스트 | 로드맵은 PRD 기준으로 생성되었으므로 PRD가 바뀌면 로드맵도 갱신 대상이다 |
| `src/lib/errorMessages.ts`의 `errorCode` 추가 | 해당 에러를 던지는 API 계층(`apiClient.ts` 또는 향후 Notion 매핑 레이어) | 매핑 누락 시 기본 메시지로 조용히 대체된다 |

## 5. UI 컴포넌트(`src/components/ui/`)

- 이 폴더는 `shadcn` CLI(`components.json`: style `radix-nova`, baseColor `neutral`)가 생성·관리한다.
- 새 shadcn 컴포넌트가 필요하면 파일을 손으로 새로 만들지 말고 CLI(`npx shadcn add ...`)로 추가하는
  것을 우선 고려한다. 기존 파일의 cva 변형(variant) 로직을 손대는 정도의 커스터마이징은 허용되지만,
  구조 자체를 다른 패턴으로 바꾸지 않는다.
- 이 폴더는 `react-refresh/only-export-components` eslint 규칙에서 제외되어 있다 — 컴포넌트가 아닌
  값(cva 변형 객체 등)을 같은 파일에서 export해도 lint 에러가 아니다.

## 6. 라우팅/상태관리 경계

- `src/routes/router.tsx`는 loader/action을 **의도적으로** 쓰지 않는다. 새 라우트를 추가하더라도
  `loader`로 데이터를 가져오지 말고, 해당 페이지 컴포넌트 안에서 TanStack Query 훅(`useQuery`)으로
  조회한다. React Router 캐시와 TanStack Query 캐시가 동시에 서버 상태를 가지면 화면 전환 시 어느
  쪽이 최신인지 경합이 생기기 때문이다.
- 클라이언트 전역 상태(테마, 사이드바 열림 여부 등)만 Zustand(`src/stores/`)에 둔다. 서버에서 온
  데이터(용어 목록/상세 등)를 Zustand store에 올리지 않는다 — TanStack Query 캐시가 단일 소스다.

## 7. 검증 방법 (테스트 러너 없음)

- Vitest/RTL이 설치되어 있지 않다. 코드 변경 후 `npm run lint`와 `npm run build`(tsc 타입체크 포함)로
  정적 검증하고, 화면 동작 확인은 Playwright MCP로 실제 브라우저에서 수행한다(`docs/ROADMAP.md`
  각 Task의 "실행 검증" 항목이 구체적 시나리오를 명시한다).
- 임의로 테스트 프레임워크(Vitest 등)를 새로 설치하지 않는다 — 로드맵에 명시된 범위 밖이다.

## 8. 금지 행동

- `response.data.data`를 `apiClient` 인터셉터 통과 후 다시 꺼내는 코드 작성 금지.
- `NOTION_API_KEY`/`NOTION_DATA_SOURCE_ID`에 `VITE_` 접두사 부여 금지.
- `src/**`(클라이언트 번들)에서 `@notionhq/client` import 금지.
- `vite.config.ts`의 Notion 프록시 화이트리스트를 우회하거나 범위를 넓히는 임의 경로 추가 금지
  (PRD가 허용한 2개 엔드포인트 외 추가 시 PRD/로드맵 갱신을 함께 진행).
- `src/routes/router.tsx`에 `loader`/`action` 추가 금지.
- ROADMAP Task 순서를 건너뛰고 뒤 단계(예: Task 011 Notion 프록시 연동)를 먼저 구현하는 것 금지 —
  단, 사용자가 명시적으로 순서 변경을 요청한 경우는 예외.
- `src/components/ui/` 파일을 구조적으로 재설계하는 것 금지(변형 값 조정 수준만 허용).
- 목적이 불분명한 `useMemo`/`useCallback`을 습관적으로 추가하는 것 금지 — React Compiler가
  활성화되어 있어 대부분 불필요하다.
