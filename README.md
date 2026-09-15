# DevDict — 개발 용어/개념 사전

Notion을 CMS로 활용해 개발 용어·개념(메타프롬프트, PRD, MVP 등)을 정리하는 읽기 전용 미니 위키
서비스입니다. 인증 없이 누구나 열람 가능하며, 콘텐츠 관리는 Notion 페이지 편집만으로 이루어집니다.

자세한 제품 요구사항은 [`docs/PRD.md`](./docs/PRD.md)를 참고하세요.

## 기술 스택

- **Frontend**: React 19 + TypeScript + Vite 8 (SPA)
- **라우팅**: React Router 8 (loader/action 미사용)
- **서버 상태**: TanStack Query v5
- **클라이언트 전역 상태**: Zustand 5 (테마 등)
- **HTTP**: axios
- **Styling**: Tailwind CSS v4 + shadcn/ui (`radix-nova` 스타일)
- **Icons**: lucide-react
- **CMS**: Notion API (data source 모델, 서버리스 프록시를 경유해 호출)
- **배포**: Vercel (Edge Function 프록시 — [`api/notion-proxy/`](./api/notion-proxy))

프로젝트 아키텍처와 코딩 컨벤션에 대한 상세 설명은 [`CLAUDE.md`](./CLAUDE.md)를 참고하세요.

## 시작하기

```bash
npm install
cp .env.example .env.local   # 아래 "Notion 설정" 절차대로 값 채우기
npm run dev
```

## Notion 설정

DevDict는 Notion 데이터베이스를 CMS로 쓰므로, 로컬에서 실제 데이터로 개발하려면 먼저 Notion 쪽을
준비해야 합니다. 정확한 속성 이름·옵션 값·설정 절차는 [`docs/notion-schema.md`](./docs/notion-schema.md)가
단일 근거이니 그대로 따라가세요. 요약하면:

1. `docs/notion-schema.md` §1~§8에 따라 Notion에 데이터베이스를 만들고 속성 9개(`Name`/`Slug`/
   `Summary`/`Category`/`Tags`/`Difficulty`/`Published`/`Updated At`/`Related Terms`)를 구성한다.
2. [notion.so/my-integrations](https://www.notion.so/my-integrations)에서 읽기 전용(read content만)
   capability로 제한한 내부 통합(internal integration)을 만들고, 시크릿(토큰)을 복사한다.
3. 만든 데이터베이스를 그 통합과 공유(Connect)한다.
4. `GET https://api.notion.com/v1/databases/{database_id}` 요청으로 `data_sources[0].id`를 확인한다
   (`database_id`는 데이터베이스 페이지 URL에서, 요청에는 3번 시크릿을 `Authorization: Bearer` 헤더로 사용).
5. 아래 "환경 변수" 표의 값을 `.env.local`에 채운다.

이 절차를 마치면 `npm run dev`가 `vite.config.ts`의 dev 프록시(`/notion-proxy/**`)를 통해 실제
Notion 데이터를 불러옵니다.

## 배포 (Vercel)

1. 이 저장소를 Vercel 프로젝트로 연결한다(프레임워크는 Vite로 자동 인식됨).
2. Vercel 프로젝트 **Settings → Environments**에서 **Production** 환경으로 들어가 아래 "환경 변수"
   표의 `NOTION_API_KEY`, `NOTION_DATA_SOURCE_ID`를 등록한다 (`VITE_` 접두사를 붙이지 않는다 —
   붙이면 토큰이 클라이언트 번들에 노출된다). 환경변수는 등록 시점 이후의 배포에만 적용되므로,
   이미 만들어진 배포가 있다면 등록 후 재배포해야 한다.
3. 배포하면 `vercel.json`의 rewrite 설정에 따라 `/notion-proxy/**` 요청이 `api/notion-proxy.ts`
   (Vercel Edge Function, 쿼리 파라미터 `path`로 실제 하위 경로를 전달받는다)로 연결되어, dev
   프록시와 동일한 화이트리스트·헤더 주입 규칙으로 동작한다.

## 명령어

```bash
npm run dev            # 개발 서버 (Vite)
npm run build           # tsc -b (타입 체크) 후 vite build
npm run lint            # eslint .
npm run format          # prettier --write .
npm run format:check    # prettier --check .
npm run preview         # 빌드 결과 미리보기
```

테스트 러너는 아직 구성되어 있지 않습니다 (Vitest/RTL 미설치).

## 환경 변수

`.env.example`을 참고해 `.env.local`을 생성하세요.

| 변수                    | 필수   | 설명                                                                                                                                             |
| ----------------------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| `NOTION_API_KEY`        | ✅     | 위 "Notion 설정" 2번에서 발급한 내부 통합 시크릿. `VITE_` 접두사 없음 — 서버(dev 프록시/Vercel 함수) 전용이라 클라이언트 번들에 노출되지 않는다. |
| `NOTION_DATA_SOURCE_ID` | ✅     | 위 "Notion 설정" 4번으로 확인한 data source ID. 마찬가지로 `VITE_` 접두사 없음.                                                                  |
| `VITE_API_BASE_URL`     | 미사용 | 기존 SPA 스타터킷에서 물려받은 변수로, DevDict에는 Notion 프록시 외의 별도 백엔드가 없어 현재 참조하는 코드가 없다.                              |

`NOTION_API_KEY`/`NOTION_DATA_SOURCE_ID`는 실제 자격 증명이므로 `.env.local`은 절대 커밋하지
마세요(`.gitignore`에 이미 포함되어 있습니다).

## 프로젝트 구조

```
src/
  features/terms/  # 용어 도메인 (api: Notion 매핑/조회, components, hooks, types)
  components/      # 공통 UI 컴포넌트 (components/ui는 shadcn CLI 관리)
  lib/             # axios 인스턴스, 쿼리 클라이언트, 에러 메시지 매핑 등
  routes/          # React Router 라우트 정의
api/
  notion-proxy/    # Vercel Edge Function — 프로덕션 Notion 프록시
docs/
  PRD.md           # 제품 요구사항 문서
  notion-schema.md # Notion 데이터베이스 설계·설정 절차
  ROADMAP.md       # 개발 로드맵
vercel.json        # /notion-proxy/** → api/notion-proxy 라우팅 + SPA fallback
```
