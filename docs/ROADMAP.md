# DevDict 로드맵

_기준: `docs/PRD.md`, 코드베이스 커밋 `18d0e65` 시점_

## 개요

DevDict는 개발 용어·개념의 정의를 찾는 누구나(그리고 이를 정리하는 작성자 본인)를 위한
**Notion을 CMS로 쓰는 읽기 전용 미니 위키**로, 다음 기능을 제공합니다:

- **용어 목록 조회**: Notion 데이터베이스의 공개 용어를 카드 그리드로 표시 (용어명, 한 줄 요약,
  카테고리, 난이도, 태그)
- **필터링 및 검색**: 카테고리·난이도·태그 필터 + 용어명/한 줄 요약 대상 클라이언트 사이드 키워드 검색
- **용어 상세 조회**: 슬러그 기반 상세 페이지에서 Notion 페이지 본문 블록을 렌더링하고, 관련 용어 링크 제공
- **콘텐츠 운영**: 용어 추가·수정이 Notion 페이지 편집만으로 끝나며 재배포가 필요 없음

인증·쓰기 기능이 없는 읽기 전용 SPA이며, 쓰기는 전부 Notion 쪽에서 이루어집니다.

## 현재 상태

범용 React/Vite 스타터킷에서 데모(products/dashboard)를 제거하고 DevDict 골격까지 구성된 상태입니다.
코드베이스 실사 기준으로 **이미 있는 것**은 다음과 같습니다.

- **라우트 골격**: `src/routes/router.tsx`에 `/`(HomePage), `/terms/:slug`(TermDetailPage),
  `*`(NotFoundPage)가 pathless layout route(`AppLayout`) 아래에 정의되어 있고, loader/action은
  의도적으로 미사용
- **레이아웃/공통 컴포넌트**: `AppLayout`, `Header`(모바일 Sheet 트리거 + `ModeToggle`),
  `Sidebar`(DevDict 브랜드 + "용어 목록" 내비), `PageHeader`, `EmptyState`, `ErrorState`
- **화면 뼈대**: `HomePage`는 disabled 상태의 검색 Input + 카테고리/난이도/태그 Select와 스켈레톤
  카드 6개만 렌더링, `TermDetailPage`는 슬러그를 제목에 노출하고 배지·본문·관련 용어 자리를
  플레이스홀더 텍스트로 표시
- **도메인 타입**: `src/features/terms/types.ts`에 `TermDifficulty`, `Term`, `TermListParams`,
  `TermDetail` 정의 완료. 단 `TermBlock`은 `unknown` 플레이스홀더
- **쿼리 키 팩토리**: `src/features/terms/api/terms.ts`의 `termKeys`(all/lists/list/details/detail)
- **데이터 계층 기반**: `src/lib/apiClient.ts`(`CommonResponse` 언래핑 + `ProblemDetail` → `ApiError`),
  `src/lib/errorMessages.ts`, `src/lib/queryClient.ts`(4xx 재시도 안 함), `src/lib/isApiError.ts`,
  `src/mocks/mockApi.ts`(`delay`/`delayError`), `src/hooks/useDebounce.ts`
- **Notion dev 프록시**: `vite.config.ts`의 `/notion-proxy`가 `loadEnv`로 읽은 `NOTION_API_KEY`와
  `Notion-Version: 2026-03-11`을 주입하고, data source query(POST)와 block children(GET)만
  화이트리스트로 허용
- **환경변수 템플릿**: `.env.example`에 `VITE_API_BASE_URL`, `NOTION_API_KEY`, `NOTION_DATA_SOURCE_ID`
- **실행 검증 완료(직전 로드맵 작성 시점)**: `npm run dev` 후 `/`, `/terms/meta-prompt`,
  `/no-such-page` 모두 콘솔 에러 0건으로 렌더링되며, 390px 폭에서 사이드바가 숨고 "메뉴 열기"
  버튼이 노출되는 것까지 Playwright로 확인

**아직 없는 것**: 목 데이터(`src/mocks/db.ts`는 `export {}`만 있음), `fetchTerms`/`fetchTermBySlug`
구현(TODO 주석 스텁), `src/features/terms/components/`·`hooks/`는 `.gitkeep`만 있는 빈 폴더,
Notion 블록 렌더러, 실제 검색·필터 동작, 프로덕션용 서버리스 프록시, Notion 데이터베이스 자체.

---

## Phase 1: 프로젝트 초기 설정 (골격 구축) ✅

- **왜 이 순서인가**: 라우트·레이아웃·타입·환경변수·외부 연동 프록시라는 전체 뼈대가 없으면
  이후 어떤 화면·기능도 어디에 붙여야 할지 정해지지 않습니다. 나머지 4단계 전부가 이 위에서
  진행되므로 항상 가장 먼저 옵니다.
- **예상 소요 시간**: 0.5~1일 (완료됨)
- **완료 기준**: 전체 라우트가 정의되어 있고, 도메인 타입과 환경변수 템플릿이 준비되어 있으며,
  dev 서버 기동 시 모든 라우트가 콘솔 에러 없이 렌더링된다 — **충족**

- **Task 001: 라우트·레이아웃·공통 컴포넌트 구성** ✅ - 완료
  - [x] `src/routes/router.tsx`에 `/`, `/terms/:slug`, `*` 라우트 정의 (loader/action 미사용)
  - [x] `AppLayout` + `Header` + `Sidebar`(DevDict 내비) 구성, 모바일 Sheet 대응
  - [x] `PageHeader`/`EmptyState`/`ErrorState` 공통 컴포넌트 확보
  - [x] `HomePage`/`TermDetailPage`/`NotFoundPage` 플레이스홀더 화면 구성
  - [x] 실행 검증: dev 서버 기동 → 세 라우트 모두 콘솔 에러 없이 로드됨을 Playwright 스냅샷으로 확인

- **Task 002: 도메인 타입 및 쿼리 키 팩토리 정의** ✅ - 완료
  - [x] `src/features/terms/types.ts`에 `Term`, `TermDifficulty`, `TermListParams`, `TermDetail` 정의
  - [x] `src/features/terms/api/terms.ts`에 `termKeys` 쿼리 키 팩토리 정의
  - [ ] `TermBlock`을 실제 Notion 블록 스키마에 맞춰 구체화 (현재 `unknown` — Task 008에서 처리)

- **Task 003: Notion dev 프록시 및 환경변수 템플릿 구성** ✅ - 완료
  - [x] `vite.config.ts`에 `/notion-proxy` dev 프록시 추가, `loadEnv`로 `NOTION_API_KEY` 주입
  - [x] `Notion-Version: 2026-03-11` 헤더 고정
  - [x] data source query / block children 두 경로만 통과시키는 화이트리스트 검사
  - [x] `.env.example`에 `NOTION_API_KEY`, `NOTION_DATA_SOURCE_ID` 추가 (`VITE_` 접두사 미사용)

---

## Phase 2: 공통 모듈/컴포넌트 개발

- **왜 이 순서인가**: 목 데이터, 카드/필터/상세 UI 같은 재사용 부품을 먼저 만들어 둬야 Phase 3에서
  실제 Notion 데이터를 연결할 때 컴포넌트를 다시 만들지 않고 데이터 소스만 교체할 수 있습니다.
  `mockApi.delay`/`delayError`가 axios 인터셉터와 동일한 형태를 재현하므로, Phase 3에서 API 호출
  내부만 바뀌고 훅·컴포넌트는 그대로 유지됩니다.
- **예상 소요 시간**: 4~6일
- **완료 기준**: 목 데이터를 기반으로 목록·필터·상세 화면이 전부 실제처럼 동작하고(로딩/빈
  상태/에러 분기 포함), Playwright 검증에서 콘솔 에러 없이 확인된다.

- **Task 004: 용어 목 데이터 및 조회 함수 스텁 구현** - 우선순위
  - [ ] `src/mocks/db.ts`에 `Term` 타입을 만족하는 용어 시드 8~10건 작성
        (메타프롬프트/PRD/MVP 등, 카테고리·난이도·태그가 골고루 섞이도록 구성)
  - [ ] 시드 데이터에 `relatedPageIds`를 서로 참조하도록 채우고, 맵에 없는 ID(비공개 용어) 케이스도 1건 포함
  - [ ] 용어 본문용 목 블록 데이터(문단/제목/목록/코드/인용/이미지 각 1건 이상) 작성
  - [ ] `src/features/terms/api/terms.ts`의 `fetchTerms()`를 `mockApi.delay`로 `Term[]` 반환하도록 구현
  - [ ] `fetchTermBySlug(slug)`를 구현하고, 없는 슬러그는 `mockApi.delayError('NOT_FOUND', 404)`로 거절
  - [ ] `pageId → Term` 맵을 만드는 헬퍼(`buildTermMap`)를 같은 파일에 작성해 관련 용어 해석에 재사용
  - [ ] 실행 검증: dev 서버 기동 → `/` 접속 → React Query Devtools에서 `['terms','list',...]` 쿼리가
        성공 상태인지 확인, 콘솔 에러 없음 확인

- **Task 005: 용어 목록 조회 훅 및 카드 컴포넌트 구현**
  - [ ] `src/features/terms/hooks/useTerms.ts`에 `useQuery(termKeys.list(...))` 기반 목록 조회 훅 작성
  - [ ] `src/features/terms/components/TermCard.tsx` — 용어명, 한 줄 요약(2줄 말줄임), 카테고리·난이도
        배지, 태그 목록을 표시하고 카드 전체가 `/terms/:slug`로 이동하는 링크
  - [ ] `src/features/terms/components/TermCardGrid.tsx` — `sm:grid-cols-2 lg:grid-cols-3` 그리드
  - [ ] `src/features/terms/components/TermCardSkeleton.tsx` — 로딩 중 스켈레톤 카드
  - [ ] `HomePage`에서 훅 + 그리드 연결, `isPending`은 스켈레톤, `isError`는 `ErrorState`,
        결과 0건은 `EmptyState`로 분기
  - [ ] 실행 검증: dev 서버 기동 → `/` 접속 → Playwright 스냅샷으로 카드 그리드에 목 데이터 용어명이
        실제로 렌더링되는지 확인 → 카드 클릭 시 `/terms/:slug`로 이동하는지 확인, 콘솔 에러 없음 확인

- **Task 006: 검색·필터 상태 훅 및 필터 컨트롤 구현**
  - [ ] `src/features/terms/hooks/useTermFilters.ts` — `TermListParams`(keyword/category/difficulty/tag)
        상태와 setter 제공, 키워드는 `useDebounce`(300ms) 적용
  - [ ] `src/features/terms/hooks/useFilteredTerms.ts` (또는 순수 함수 `filterTerms`) — 공개 용어 전체에
        카테고리·난이도·태그·키워드(용어명 + 한 줄 요약, 대소문자 무시)를 클라이언트 사이드로 적용
  - [ ] 카테고리·태그 옵션 목록은 하드코딩하지 않고 조회된 용어 데이터에서 파생해 생성
  - [ ] `src/features/terms/components/TermFilterBar.tsx` — `HomePage`의 disabled 플레이스홀더를
        실제 동작하는 Input + Select 3종으로 교체, "필터 초기화" 동작 포함
  - [ ] 결과 0건일 때 `EmptyState`에 "검색 결과가 없습니다" 안내 노출
  - [ ] 실행 검증: dev 서버 기동 → `/` 접속 → `browser_type`으로 키워드 입력 시 카드 수가 줄어드는지,
        `browser_select_option`으로 카테고리/난이도/태그 선택 시 필터가 적용되는지 스냅샷으로 확인 →
        결과 없는 키워드 입력 시 빈 상태 문구가 뜨는지 확인, 콘솔 에러 없음 확인

- **Task 007: 용어 상세 화면 UI 및 관련 용어 링크 구현**
  - [ ] `src/features/terms/hooks/useTermDetail.ts` — `useQuery(termKeys.detail(slug))` 기반 상세 조회 훅
  - [ ] `src/features/terms/components/TermMetaBadges.tsx` — 카테고리·난이도·태그 배지와
        최종수정일("마지막 업데이트 YYYY.MM.DD") 표시
  - [ ] `src/features/terms/components/RelatedTermList.tsx` — `pageId → Term` 맵으로 `relatedPageIds`를
        해석해 링크 렌더링, 맵에 없는 ID는 건너뛰고, 관련 용어가 0건이면 섹션 자체를 숨김
  - [ ] `TermDetailPage`에서 플레이스홀더를 실제 데이터로 교체, 로딩 스켈레톤 연결
  - [ ] 상세 조회 실패(404 `ApiError`) 시 한국어 안내 + 목록 이동 링크 표시 (`errorMessages.ts` 규약 준수)
  - [ ] 실행 검증: dev 서버 기동 → `/terms/<목 데이터 슬러그>` 접속 → 용어명·배지·수정일이 실제 값으로
        표시되는지 스냅샷 확인 → 관련 용어 링크 클릭 시 해당 용어 상세로 이동 확인 →
        `/terms/없는-슬러그` 접속 시 안내 메시지 확인, 콘솔 에러 없음 확인

---

## Phase 3: 핵심 기능 개발

- **왜 이 순서인가**: 공통 UI 부품이 목 데이터로 이미 검증된 상태이므로, 이 단계는 데이터
  소스만 실제 Notion API로 교체하는 데 집중할 수 있습니다. DevDict의 핵심 가치(Notion을 CMS로
  쓰는 실시간 콘텐츠 반영)가 실제로 구현되는 단계이기도 합니다.
- **예상 소요 시간**: 5~7일 (Notion 데이터베이스·통합 설정 등 외부 준비 포함)
- **완료 기준**: 실제 Notion 데이터베이스에 입력한 용어가 목록·상세·필터·검색에 정확히 반영되고,
  비공개(초안) 용어는 노출되지 않으며, 본문 블록(문단/제목/목록/코드/인용/이미지)이 실제로 렌더링된다.

- **Task 008: Notion 블록 렌더러 구현**
  - [ ] `src/features/terms/types.ts`의 `TermBlock`을 실제 스키마로 구체화
        (`paragraph`/`heading_1~3`/`bulleted_list_item`/`numbered_list_item`/`code`/`quote`/`image`,
        `has_children`, `children`)
  - [ ] `src/features/terms/components/NotionRichText.tsx` — rich text 배열의
        `annotations`(bold/italic/code/strikethrough)와 `href` 처리
  - [ ] `src/features/terms/components/NotionBlockRenderer.tsx` — 블록 타입별 렌더링, 자식 블록 재귀 렌더링
  - [ ] 연속된 `bulleted_list_item`/`numbered_list_item`을 하나의 `<ul>`/`<ol>`로 묶는 그룹핑 처리
  - [ ] 미지원 블록 타입은 앱을 깨뜨리지 않고 조용히 건너뛰기 (개발 모드에서만 `console.warn`)
  - [ ] 이미지 블록은 `alt` 텍스트(캡션 우선)를 채워 접근성 확보
  - [ ] 실행 검증: dev 서버 기동 → 목 블록 전 타입이 들어간 상세 페이지 접속 → 제목/목록/코드/인용/이미지가
        각각 올바른 시맨틱 태그로 렌더링되는지 스냅샷으로 확인, 콘솔 에러 없음 확인

- **Task 009: Notion 데이터베이스 구축 및 통합 설정**
  - [ ] PRD 4장 스키마대로 Notion 데이터베이스 생성 (용어명/슬러그/한줄요약/카테고리/태그/난이도/
        공개여부/최종수정일/관련용어)
  - [ ] 샘플 용어 5~10건 입력 (비공개 초안 1건 포함해 공개여부 필터 검증용 데이터 확보)
  - [ ] Notion 통합 생성 후 읽기 전용 capability로 제한, 해당 데이터베이스 공유
  - [ ] `GET /v1/databases/{database_id}`로 `data_sources[0].id` 확보
  - [ ] `.env.local`에 `NOTION_API_KEY`, `NOTION_DATA_SOURCE_ID` 기입 (`.gitignore` 적용 여부 확인)
  - [ ] 실행 검증: dev 서버 기동 후 `/notion-proxy/v1/data_sources/{id}/query`에 브라우저/HTTP 클라이언트로
        요청해 200과 실제 페이지 목록이 오는지 확인, 화이트리스트 밖 경로는 차단되는지 확인

- **Task 010: Notion 응답 → Term 매핑 레이어 구현**
  - [ ] `src/features/terms/api/notionMapper.ts` — Notion 페이지 properties를 평탄한 `Term`으로 변환
        (Title/Rich text/Select/Multi-select/Checkbox/Last edited time/Relation 각각 처리)
  - [ ] 필수 속성 누락(슬러그 없음 등) 시 해당 항목을 건너뛰고 개발 모드에서 경고 — 한 건 때문에
        전체 목록이 깨지지 않게 함
  - [ ] 난이도 값이 `TermDifficulty` 범위를 벗어날 때의 폴백 처리
  - [ ] 블록 응답 → `TermBlock` 매핑 함수 작성
  - [ ] 실행 검증: 매핑 적용 후 dev 서버 기동 → `/` 접속 → Notion에 입력한 실제 용어명이 카드에
        표시되는지 스냅샷으로 확인

- **Task 011: 목록 조회를 Notion 프록시 호출로 교체**
  - [ ] `fetchTerms()`를 `mockApi` 대신 `/notion-proxy/v1/data_sources/{id}/query` 호출로 교체
  - [ ] 공개여부 필터를 요청 본문의 Notion query filter로 적용 (비공개 용어가 클라이언트로 오지 않게)
  - [ ] `has_more`/`next_cursor` 커서 순회로 100건 초과 데이터를 전량 수집해 단일 배열로 반환
  - [ ] `pageId → Term` 맵을 목록 결과에서 생성해 상세 화면의 관련 용어 해석에 재사용 (N+1 조회 방지)
  - [ ] Notion 에러 응답을 `ApiError` 형태로 정규화 (`errorMessages.ts` 매핑 테이블에 필요한 코드 추가)
  - [ ] 실행 검증: dev 서버 기동 → `/` 접속 → 실제 Notion 용어가 카드에 표시되고, 비공개로 표시한 용어는
        나타나지 않는지 스냅샷으로 확인 → 검색·필터가 실데이터에서도 동작하는지 재현, 콘솔 에러 없음 확인

- **Task 012: 상세 조회 및 블록 수집을 Notion 프록시 호출로 교체**
  - [ ] `fetchTermBySlug(slug)`를 슬러그 기준 Notion query + 블록 children 조회 호출로 교체
  - [ ] 블록 목록도 100건 단위 커서 순회로 전량 수집
  - [ ] `has_children: true` 블록의 자식을 재귀 조회 (중첩 깊이 상한을 두어 무한 재귀 방지)
  - [ ] 슬러그에 해당하는 공개 용어가 없으면 404 `ApiError`로 통일해 Not Found 화면 연결
  - [ ] `src/mocks/` 의존 제거 확인 후 목 데이터 정리 여부 판단
  - [ ] 실행 검증: dev 서버 기동 → Notion에 실제로 작성한 용어 상세 접속 → 본문 블록과 관련 용어가
        실제 값으로 렌더링되는지 확인 → 비공개/없는 슬러그 접속 시 Not Found 안내 확인

---

## Phase 4: 추가 기능 개발

- **왜 이 순서인가**: 에러/빈 상태 문구, 접근성, 반응형·다크모드 같은 보조 기능은 핵심 기능이
  실제 데이터로 동작해야 의미 있게 재현·검증할 수 있습니다(예: 실제 네트워크 실패, 실제 빈
  검색 결과). 핵심 기능보다 먼저 다듬어봐야 다시 손대야 할 가능성이 큽니다.
- **예상 소요 시간**: 2~3일
- **완료 기준**: 네트워크 실패·빈 결과 시나리오에서 한국어 안내가 정확히 뜨고, 모바일·다크모드·
  키보드 접근성 점검 항목이 모두 통과한다.

- **Task 013: 에러·빈 상태·로딩 처리 보강**
  - [ ] 네트워크 실패/5xx/429 각각에 대한 한국어 안내 문구를 `errorMessages.ts`에 정리
  - [ ] 상세 화면 재시도 버튼(TanStack Query `refetch`) 추가 검토
  - [ ] 목록 로딩 스켈레톤과 실제 카드의 높이 차이로 생기는 레이아웃 점프 완화
  - [ ] 상세 페이지 직접 진입(새로고침) 시 목록 캐시가 없어 관련 용어 맵이 비는 문제 보강 —
        `TermDetailPage`에서도 목록 쿼리를 함께 구독해 `pageId → Term` 맵을 확보
  - [ ] 실행 검증: dev 프록시를 일시 중단하거나 잘못된 토큰으로 기동해 에러 화면을 재현하고,
        Playwright 스냅샷으로 한국어 안내가 노출되는지 확인. `/terms/:slug`로 직접 진입(새로고침)해도
        관련 용어 링크가 뜨는지 확인

- **Task 014: 반응형·다크모드·접근성 점검**
  - [ ] `browser_resize`로 390px / 768px / 1280px에서 목록·상세 레이아웃 점검
  - [ ] `ModeToggle`로 다크모드 전환 후 카드·배지·코드 블록 대비 확인, 새로고침 시 FOUC 없는지 확인
  - [ ] 제목 레벨(h1/h2), 링크 접근 이름, 이미지 `alt`, 키보드 탭 순서 점검
  - [ ] 실행 검증: 각 폭·테마 조합에서 `browser_take_screenshot`으로 비교, 콘솔 에러 없음 확인

---

## Phase 5: 최적화 및 배포

- **왜 이 순서인가**: 기능이 모두 확정되고 검증된 뒤에야 실제 최적화 대상(번들 크기, 캐시 전략)과
  배포 요건(플랫폼, 환경변수 주입 방식)이 명확해집니다. 기능 변경 가능성이 남아 있는 상태에서
  배포 인프라부터 굳히면 재작업 위험이 큽니다.
- **예상 소요 시간**: 2~4일 (배포 플랫폼 선정 등 외부 의존 요소에 따라 변동)
- **완료 기준**: 프로덕션 서버리스 프록시가 실제로 배포되어 토큰 노출 없이 정상 응답하고,
  `npm run build`/`npm run lint`가 무오류로 통과하며 프리뷰 빌드에서 전 라우트가 정상 동작한다.

- **Task 015: 프로덕션 서버리스 프록시 구현**
  - [ ] 배포 대상 플랫폼의 서버리스 함수로 프록시 구현 (dev 프록시와 동일한 화이트리스트 2개 엔드포인트)
  - [ ] `NOTION_API_KEY`/`NOTION_DATA_SOURCE_ID`를 플랫폼 환경변수로 주입, 클라이언트 번들 비노출 확인
  - [ ] 429 응답 시 `Retry-After` 기반 재시도 구현
  - [ ] 60초 수준의 인메모리/CDN 캐시로 분당 180회(3 req/s) 한도 대응
  - [ ] 프런트엔드가 dev/프로덕션 모두 동일한 자체 엔드포인트 경로를 쓰도록 정리
  - [ ] 실행 검증: `npm run build && npm run preview`(또는 프리뷰 배포) 후 Playwright로 `/`와 상세 페이지
        접속 → 데이터가 정상 렌더링되고 네트워크 응답에 토큰이 노출되지 않는지 확인

- **Task 016: 최종 빌드 검증 및 배포 준비**
  - [ ] `npm run lint`, `npm run format:check`, `npm run build` 무오류 통과
  - [ ] `.env.example`과 README에 Notion 설정 절차(통합 생성 → data source ID 확보 → 환경변수) 문서화
  - [ ] 번들 크기 확인 및 불필요한 의존성(미사용 shadcn 컴포넌트 등) 정리
  - [ ] 실행 검증: `npm run preview`로 빌드 결과를 띄워 `/`, 상세, 404 라우트를 Playwright로 순회하며
        콘솔 에러 없음 확인 (SPA fallback 라우팅이 프로덕션에서도 동작하는지 포함)

---

## 리스크 및 확인 필요

- **프로덕션 프록시 플랫폼 미정** — PRD는 서버리스 프록시가 "필수"라고만 하고 배포 대상(Vercel/Netlify/
  Cloudflare Workers 등)을 지정하지 않습니다. Task 015를 착수하려면 플랫폼 결정이 선행되어야 하며,
  현재 저장소에는 배포 설정이 없습니다(GitHub Pages 설정은 커밋 `b8b81bf`에서 제거됨).
- **Notion API 버전 `2026-03-11`의 data source 모델** — `vite.config.ts`와 PRD가 이 버전을 고정하고
  있으나 실제 요청/응답 스키마(특히 data source query 필터 형식, Relation 응답 형태)는 실연동 전까지
  검증되지 않았습니다. `@notionhq/client` v5의 기본 버전(2025-09-03)과도 다르므로 Task 009에서
  실제 응답으로 확인이 필요합니다.
- **`apiClient` 규약과 Notion 응답의 불일치** — `src/lib/apiClient.ts` 인터셉터는 백엔드의
  `CommonResponse<T>`(`data.data`)와 RFC 9457 `ProblemDetail`을 전제로 하지만, Notion API는
  `{ object, results, has_more, next_cursor }` / `{ object: "error", code, message }` 형태로
  응답합니다. 프록시가 응답을 `CommonResponse`/`ProblemDetail`로 감싸 규약을 맞출지, 아니면
  Notion 전용 axios 인스턴스를 따로 둘지 결정이 필요합니다(Task 011 착수 전 확정).
- **`VITE_API_BASE_URL`의 역할** — `.env.example`에 남아 있으나 DevDict에는 Notion 프록시 외의
  백엔드가 없습니다. 프록시 베이스 URL로 재정의할지, 별도 변수를 둘지 정리가 필요합니다.
- **dev 프록시의 `proxyReq.destroy()` 동작** — 화이트리스트 위반 시 연결을 끊는 방식이라 클라이언트가
  받는 에러 형태가 불명확합니다(상태 코드 없는 네트워크 오류). 프로덕션 프록시에서는 403 JSON 응답으로
  통일하는 편이 에러 처리에 유리합니다.
- **관련용어 해석의 캐시 의존성** — 상세 페이지에 직접 진입(새로고침)하면 목록 쿼리 캐시가 비어 있어
  `pageId → Term` 맵이 없습니다. Task 013에서 상세 화면도 목록 쿼리를 함께 구독하도록 보강할
  계획입니다.
- **Rate limit 대비 캐시 위치** — PRD의 60초 캐시는 서버리스 함수 인스턴스가 재사용될 때만 유효합니다.
  콜드 스타트가 잦으면 CDN 캐시 헤더가 실질적인 방어선이 되므로 Task 015에서 함께 설계가 필요합니다.
- **테스트 러너 부재** — Vitest/RTL이 설치되어 있지 않아 모든 검증이 Playwright MCP를 통한 수동/자동
  브라우저 확인에 의존합니다. 필터 로직처럼 순수 함수로 분리 가능한 부분은 향후 단위 테스트 도입을
  고려할 수 있으나, PRD 범위 밖이라 로드맵에는 포함하지 않았습니다.

## 로드맵에서 제외한 것

PRD 6장의 "제외" 범위를 그대로 따릅니다.

- **로그인/회원, 댓글·좋아요·즐겨찾기, 사이트 내 편집 UI** — 읽기 전용 서비스이며 쓰기는 전부 Notion에서
  이루어집니다
- **SSR/정적 생성 및 SEO 고도화** — 기존 저장소가 SPA 스타터킷이므로 MVP 범위 밖
- **다국어** — 단일 언어(한국어) 전제
- **조회수 통계** — 분석 인프라가 필요해 MVP 범위 밖
- **무한 스크롤·서버 사이드 페이지네이션** — 용어 수백 건 이하 전제로 전량 조회 후 클라이언트 필터링.
  단, 프록시 내부의 Notion API 커서 순회(Task 011/012)는 별개이며 반드시 구현합니다
- **본문 전문 검색** — 검색 대상은 용어명 + 한 줄 요약으로 한정
