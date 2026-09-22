# DevDict v2 로드맵 — Notion 바로가기 링크

_기준: `docs/PRD.md` 9장(MVP 이후 확장), 코드베이스 커밋 `ebf941f` 시점_
_MVP(PRD 1~~8장 / `docs/ROADMAP.md`의 Task 001~~016)는 전부 완료·배포된 상태이며, 이 문서는 그 위에
얹는 증분 기능 하나만 다룬다. 기존 `docs/ROADMAP.md`는 v1 기록으로 그대로 보존한다._

## 개요

v2의 범위는 PRD 9장이 정의한 단 하나의 기능이다.

- **Notion 바로가기 링크**: 용어 목록 화면(`/`)에 "Notion에서 용어 추가" 외부 링크 버튼을 추가하고,
  클릭 시 새 탭(`target="_blank"`, `rel="noopener noreferrer"`)으로 Notion 데이터베이스 페이지를 연다.
- **대상 URL 관리**: Notion 데이터베이스 페이지의 공개 URL은 통합 토큰과 달리 비밀값이 아니므로,
  `VITE_` 접두사를 붙인 `VITE_NOTION_DATABASE_URL` 환경변수로 관리한다(클라이언트 번들 노출 무방).
- **사용자**: 실질적으로 콘텐츠 작성자(운영자 본인) 전용 동선이다. 링크 대상 페이지는 해당 Notion
  워크스페이스 멤버만 열람할 수 있으므로 일반 방문자에게는 의미가 없는 링크다.

이 기능은 "바로가기"일 뿐이며, 사이트가 쓰기 기능을 갖게 되는 것은 아니다(PRD 9장 "제외" 항목).

## 현재 상태

코드베이스 실사 기준으로, 이 증분 작업에 필요한 기반은 **이미 전부 갖춰져 있다**.

- **목록 화면**: `src/routes/HomePage.tsx`가 `PageHeader`(제목 "용어 목록") → `TermFilterBar` →
  카드 그리드 순으로 구성되어 있고, `mx-auto w-full max-w-6xl space-y-6` 컨테이너로 중앙 정렬된다.
- **공통 헤더 컴포넌트**: `src/components/common/PageHeader.tsx`는 `title`/`description`만 받고
  **액션 슬롯이 없다** — 제목 우측에 버튼을 놓으려면 선택적 `actions` prop 추가가 필요하다(Task 018).
- **레이아웃**: `src/components/layout/Header.tsx`(모바일 메뉴 + `ModeToggle`),
  `src/components/layout/Sidebar.tsx`(`NAV_ITEMS` 기반 내부 라우트 내비)는 모두 내부 내비게이션
  전용이며 외부 링크 개념이 없다. PRD 9장이 배치를 **목록 화면(`/`)** 으로 한정하므로 이번 작업에서
  두 컴포넌트는 건드리지 않는다.
- **버튼/아이콘**: `src/components/ui/button.tsx`가 `asChild`(Slot)를 지원하므로
  `<Button asChild variant="outline"><a href=... /></Button>` 형태로 앵커 렌더링이 가능하다.
  아이콘은 기존 의존성 `lucide-react`를 그대로 쓴다. 새로 설치할 패키지는 없다.
- **환경변수 체계**: `.env.example`에는 현재 `VITE_API_BASE_URL`(미사용), `NOTION_API_KEY`,
  `NOTION_DATA_SOURCE_ID`만 있다. `src/vite-env.d.ts`의 `ImportMetaEnv`에도 `VITE_API_BASE_URL`만
  선언돼 있어, **선언을 추가하지 않으면 `npm run build`(tsc -b)에서 타입 에러가 난다**.
- **배포**: Vercel + `api/notion-proxy/` Edge Function + `vercel.json` rewrite가 이미 동작 중이며
  (https://notion-cms-project-one-rho.vercel.app/), README에 Notion 설정·배포 절차가 문서화돼 있다.
  `VITE_` 환경변수는 **빌드 타임에 번들로 인라인**되므로 Vercel 환경변수 등록 후 재배포가 필요하다.

**아직 없는 것**: `VITE_NOTION_DATABASE_URL` 환경변수 정의/타입 선언, 링크 버튼 컴포넌트,
`PageHeader`의 액션 슬롯, 프로덕션 환경변수 등록.

---

## Phase 1: 프로젝트 초기 설정 (골격 구축)

- **왜 이 순서인가**: 이번 증분에서 새로 생기는 "골격"은 라우트나 타입 체계가 아니라 **대상 URL을
  주입할 환경변수 하나**뿐입니다. 컴포넌트가 `import.meta.env.VITE_NOTION_DATABASE_URL`을 참조하려면
  `ImportMetaEnv` 선언이 먼저 있어야 타입 체크(`tsc -b`)를 통과하므로, 구현보다 앞에 둡니다.
  라우팅·레이아웃·상태관리·스타일링 등 나머지 기반은 MVP에서 이미 확보되어 그대로 재사용합니다.
- **예상 소요 시간**: 0.5시간 미만
- **완료 기준**: `.env.example`과 `src/vite-env.d.ts`에 `VITE_NOTION_DATABASE_URL`이 정의되고,
  `.env.local`에 실제 URL이 채워진 상태에서 `npm run build`가 타입 에러 없이 통과한다.

- **Task 017: `VITE_NOTION_DATABASE_URL` 환경변수 정의 및 타입 선언**
  - [ ] `.env.example`에 `VITE_NOTION_DATABASE_URL=` 추가 — 기존 `NOTION_API_KEY` 블록과 구분되는
        주석으로 "비밀값이 아니라 의도적으로 `VITE_` 접두사를 붙인 공개 URL"임을 명시(PRD 9장 근거)
  - [ ] `src/vite-env.d.ts`의 `ImportMetaEnv`에 `readonly VITE_NOTION_DATABASE_URL?: string` 추가
        — 값이 없어도 앱이 동작해야 하므로 옵셔널로 선언(미설정 시 동작은 Task 018에서 정의)
  - [ ] 로컬 `.env.local`에 실제 Notion 데이터베이스 페이지 URL 기입
        (예: `https://www.notion.so/<workspace>/<database_id>?v=<view_id>`)
  - [ ] README "환경 변수" 표에 `VITE_NOTION_DATABASE_URL` 행 추가 (필수 여부: 선택,
        "미설정 시 바로가기 버튼이 렌더링되지 않음"을 설명)
  - [ ] 실행 검증: `npm run build`로 타입 체크 통과 확인 → `npm run dev` 기동 후 Playwright로 `/`에
        접속해 **아직 UI 변화가 없고** 기존 목록 화면이 그대로 렌더링되는지 스냅샷 확인,
        `browser_console_messages`로 콘솔 에러 0건 확인 → `browser_close` 및 dev 서버 종료

---

## Phase 2: 공통 모듈/컴포넌트 개발

- **해당 사항 없음 — 기존 인프라를 그대로 재사용합니다.**
- 새로 만들 재사용 부품이 없습니다. 버튼은 기존 shadcn `Button`(`asChild`)과 `lucide-react` 아이콘을
  그대로 쓰고, 링크 컴포넌트 자체는 여러 화면에서 공유되지 않는 `/` 전용 부품이라
  `src/components/`가 아니라 feature 폴더(`src/features/terms/components/`)에 둡니다.
- 유일하게 손대는 공통 컴포넌트는 `PageHeader`의 선택적 `actions` 슬롯 추가인데, prop 하나를
  넘겨받아 렌더링하는 수준이라 별도 Task로 분리하지 않고 Task 018의 체크리스트에 포함했습니다.
- **예상 소요 시간**: 0일

---

## Phase 3: 핵심 기능 개발

- **왜 이 순서인가**: 환경변수와 타입 선언(Phase 1)이 준비된 뒤라야 컴포넌트가 URL을 읽어올 수
  있고, 이 단계가 곧 PRD 9장이 정의한 v2의 핵심 가치(운영자가 한 번의 클릭으로 Notion으로
  이동)가 실제로 동작하게 되는 지점입니다.
- **예상 소요 시간**: 0.5일
- **완료 기준**: `/`에서 "Notion에서 용어 추가" 버튼이 보이고, 클릭 시 새 탭으로 설정된 Notion
  데이터베이스 URL이 열리며, 상세·404 화면에는 버튼이 노출되지 않는다. 모바일 폭과 다크모드에서도
  레이아웃이 깨지지 않고 콘솔 에러가 없다.

- **Task 018: Notion 바로가기 링크 버튼 구현 및 목록 화면 연결** - 우선순위
  - [ ] `src/components/common/PageHeader.tsx`에 선택적 `actions?: ReactNode` prop 추가 —
        제목/설명 영역과 액션을 `flex` 양끝 정렬로 배치하고, 좁은 화면에서는 줄바꿈되도록 처리
        (기존 호출부인 `TermDetailPage` 등은 prop을 넘기지 않으므로 영향 없음)
  - [ ] `src/features/terms/components/NotionDatabaseLink.tsx` 신규 작성 —
        `import.meta.env.VITE_NOTION_DATABASE_URL`을 읽어 `<Button asChild variant="outline" size="sm">`
        안에 `<a href={url} target="_blank" rel="noopener noreferrer">`를 렌더링
        (PRD 9장이 명시한 `target`/`rel` 조합을 그대로 준수)
  - [ ] 환경변수가 비어 있으면 `null`을 반환해 버튼 자체를 렌더링하지 않음 — 값이 없을 때 빈 링크나
        깨진 버튼이 노출되는 것을 막고, 운영자 전용 동선이라 일반 배포 환경에서 없어도 무방하기 때문
        (아래 "리스크 및 확인 필요" 1번 항목 확인 후 확정)
  - [ ] 버튼 레이블은 "Notion에서 용어 추가", 아이콘은 `lucide-react`의 `ExternalLink`(또는 `Plus`)를
        사용하고 `aria-hidden` 처리 — 아이콘만 남기는 축약형을 쓸 경우 `sr-only` 텍스트로 접근 이름 보장
  - [ ] `src/routes/HomePage.tsx`에서 `PageHeader`에 `actions={<NotionDatabaseLink />}`로 연결
        (목록 데이터 로딩/에러 상태와 무관하게 항상 노출 — 외부 링크라 서버 상태에 의존하지 않음)
  - [ ] `npm run lint`, `npm run format:check`, `npm run build` 무오류 통과
  - [ ] 실행 검증(Playwright MCP): `npm run dev` 백그라운드 기동 → `browser_navigate`로 `/` 접속 →
        `browser_snapshot`으로 제목 "용어 목록" 우측에 "Notion에서 용어 추가" 링크가 접근 가능한
        이름과 함께 렌더링되는지 확인 → 링크의 `href`가 `.env.local`의 값과 일치하고
        `target="_blank"`/`rel="noopener noreferrer"`가 붙어 있는지 확인 → `browser_click`으로 클릭해
        **새 탭**이 열리고 그 탭의 URL이 Notion 데이터베이스 URL인지 확인
        (Notion 로그인/권한 화면이 뜨는 것은 정상 — PRD 9장대로 워크스페이스 멤버만 열람 가능)
  - [ ] 실행 검증(범위 한정): `/terms/<임의의 공개 슬러그>`와 존재하지 않는 경로(404)로 이동해
        해당 화면에는 버튼이 노출되지 않는지 확인 (PRD 9장은 배치를 목록 화면으로 한정)
  - [ ] 실행 검증(반응형·다크모드): `browser_resize`로 390px / 1280px에서 제목과 버튼이 겹치거나
        넘치지 않는지 확인 → `ModeToggle`로 다크모드 전환 후 버튼 대비를 `browser_take_screenshot`으로
        확인 → `browser_console_messages`로 콘솔 에러 0건 확인 → `browser_close` 및 dev 서버 종료

---

## Phase 4: 추가 기능 개발

- **해당 사항 없음 — 기존 인프라를 그대로 재사용합니다.**
- 이 증분에는 별도의 에러·빈 상태 처리가 필요 없습니다. 외부 링크라 네트워크 호출이나 서버 상태가
  없고, "환경변수 미설정" 케이스는 Task 018에서 버튼 미렌더링으로 이미 처리됩니다.
- 반응형·다크모드·접근성(접근 이름, 키보드 포커스) 점검은 항목이 버튼 하나뿐이라 별도 Task로
  분리하지 않고 Task 018의 실행 검증 체크리스트에 포함했습니다.
- **예상 소요 시간**: 0일

---

## Phase 5: 최적화 및 배포

- **왜 이 순서인가**: `VITE_` 접두사 변수는 런타임이 아니라 **빌드 타임에 번들로 인라인**되므로,
  로컬에서 동작을 확정한 뒤에 Vercel 환경변수를 등록하고 재배포해야 프로덕션에 반영됩니다.
  기능이 확정되기 전에 배포 설정부터 건드리면 값만 등록된 채 버튼이 없는 상태가 되어 검증이
  무의미해집니다.
- **예상 소요 시간**: 0.5시간 미만 (Vercel 빌드 시간 제외)
- **완료 기준**: 프로덕션 배포본(https://notion-cms-project-one-rho.vercel.app/)의 `/`에서 버튼이
  노출되고 올바른 Notion URL로 연결되며, `npm run lint`/`build`가 무오류로 통과한다.

- **Task 019: Vercel 환경변수 등록 및 프로덕션 배포 검증**
  - [ ] Vercel 프로젝트 **Settings → Environments → Production**에 `VITE_NOTION_DATABASE_URL` 등록
        (기존 `NOTION_API_KEY`/`NOTION_DATA_SOURCE_ID`와 달리 `VITE_` 접두사를 **붙이는 것이 의도**임을
        README에도 함께 명시 — 실수로 보이지 않도록)
  - [ ] 환경변수는 등록 이후의 배포부터 적용되므로 재배포 수행 (README "배포 (Vercel)" 절의 기존
        주의사항과 동일)
  - [ ] README "배포 (Vercel)" 절차에 이 변수 등록 단계 반영
  - [ ] 번들 영향 점검: 새 의존성 없이 문자열 상수 하나와 아이콘만 추가되므로 번들 증가가
        무시할 수준인지 `npm run build` 출력으로 확인
  - [ ] 실행 검증(로컬 프리뷰): `npm run build && npm run preview` → Playwright로 `/` 접속 →
        버튼 노출 및 `href` 값 확인, 콘솔 에러 0건 확인 → `browser_close` 및 preview 서버 종료
  - [ ] 실행 검증(프로덕션): 배포 완료 후 Playwright로 https://notion-cms-project-one-rho.vercel.app/
        접속 → 버튼이 렌더링되고 `href`가 등록한 Notion URL과 일치하는지 스냅샷으로 확인 →
        기존 용어 목록·상세 기능이 회귀 없이 동작하는지 함께 확인 → 콘솔 에러 0건 확인 →
        `browser_close`

---

## 리스크 및 확인 필요

- **환경변수 미설정 시 동작 정책** — PRD 9장은 `VITE_NOTION_DATABASE_URL`을 정의하기만 하고 값이
  없을 때의 동작을 명시하지 않습니다. 이 로드맵은 "버튼을 아예 렌더링하지 않는다"로 가정했습니다.
  대안(비활성 버튼 노출, 빌드 타임 오류)을 원한다면 Task 018 착수 전에 확정이 필요합니다.
- **버튼 레이블·아이콘 문구 미확정** — PRD는 "Notion에서 용어 추가" 같은 예시와 "외부 링크 버튼
  (또는 아이콘 버튼)"이라는 선택지만 제시합니다. 최종 문구/형태는 구현 시 확정해야 합니다.
- **배치 위치** — PRD 9장 "기능" 항목은 배치를 **용어 목록 화면(`/`)** 으로 못 박은 반면, "화면 위치"
  항목은 헤더/사이드바까지 검토 대상으로 열어둡니다. 코드 실사 결과 `Header`/`Sidebar`는 내부
  내비게이션 전용이고 외부 링크 개념이 없어, 이 로드맵은 PRD의 더 구체적인 기술을 따라 `/`의
  `PageHeader` 액션 슬롯으로 확정했습니다. 전역 노출(모든 화면)을 원한다면 PRD 9장 수정이 선행되어야
  합니다.
- **프로덕션에서의 링크 검증 한계** — 대상 Notion 페이지는 워크스페이스 멤버만 열람 가능하므로,
  Playwright로는 "새 탭이 올바른 URL로 열리는지"까지만 검증할 수 있고 페이지 내용 확인은 불가능합니다
  (Notion 로그인/권한 화면이 뜨는 것이 정상 동작입니다).
- **URL 형태가 공개 정보라는 전제** — 데이터베이스 페이지 URL에는 `database_id`가 포함되며 번들에
  그대로 노출됩니다. PRD 9장이 "비밀값이 아니다"라고 명시했으므로 그대로 따르지만, 해당 ID로
  Notion API를 호출하려면 여전히 통합 토큰이 필요하다는 점(= 실질적 위험 없음)을 전제로 합니다.
- **테스트 러너 부재(v1과 동일)** — Vitest/RTL이 없어 검증은 전적으로 Playwright MCP 브라우저
  확인에 의존합니다.

## 로드맵에서 제외한 것

PRD 9장 "제외(v2에서도 유지)" 및 6장 "제외" 범위를 그대로 따릅니다.

- **사이트 내 용어 생성/수정 폼** — 쓰기는 여전히 Notion에서만 이루어집니다
- **로그인/인증** — 인증 없는 완전 공개 읽기 전용 사이트라는 원칙을 v2에서도 유지합니다
- **Notion 쓰기 API(`POST /v1/pages` 등) 연동** — 이 링크는 순수 바로가기이며 사이트가 쓰기 기능을
  갖게 되는 것이 아닙니다
- **기존 MVP 기능(목록/필터/검색/상세/블록 렌더러/프록시)** — 전부 완료·배포된 상태이며
  `docs/ROADMAP.md`의 Task 001~016에 기록되어 있습니다. 이 문서에 다시 올리지 않습니다
- **v1에서 제외한 항목(댓글·좋아요·SSR/SEO·다국어·조회수·무한 스크롤 등)** — 변동 없이 그대로
  범위 밖입니다
