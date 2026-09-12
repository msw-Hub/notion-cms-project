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

프로젝트 아키텍처와 코딩 컨벤션에 대한 상세 설명은 [`CLAUDE.md`](./CLAUDE.md)를 참고하세요.

## 시작하기

```bash
npm install
cp .env.example .env.local   # VITE_API_BASE_URL 등 값 채우기
npm run dev
```

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

`.env.example`을 참고해 `.env.local`을 생성하세요. `VITE_API_BASE_URL`이 현재 유일한 필수
변수입니다.

## 프로젝트 구조

```
src/
  features/    # 기능 단위 모듈 (api, components, hooks)
  components/  # 공통 UI 컴포넌트 (components/ui는 shadcn CLI 관리)
  lib/          # axios 인스턴스, 쿼리 클라이언트, 에러 메시지 매핑 등
  mocks/        # 백엔드 연동 전 임시 목 API
  routes/       # React Router 라우트 정의
docs/
  PRD.md       # 제품 요구사항 문서
```
