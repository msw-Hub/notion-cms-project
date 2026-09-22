/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string
  // Notion 바로가기 링크(v2) 대상 URL. 비밀값이 아니라 의도적으로 VITE_ 접두사를 붙였다.
  // 값이 없어도 앱이 정상 동작해야 하므로(버튼만 숨김) 옵셔널로 선언한다.
  readonly VITE_NOTION_DATABASE_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
