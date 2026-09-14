import path from 'node:path'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig, loadEnv } from 'vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // NOTE: NOTION_API_KEY 등 서버 전용 환경변수는 VITE_ 접두사가 없어 import.meta.env로 노출되지
  // 않는다(의도적 — 토큰을 클라이언트 번들에 노출하지 않기 위함). 이 설정 파일(Node 컨텍스트)에서
  // 직접 쓰기 위해 loadEnv로 접두사 제한 없이 읽어온다.
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [
      react(),
      babel({ presets: [reactCompilerPreset()] }),
      tailwindcss(),
    ],
    resolve: {
      alias: {
        '@': path.resolve(import.meta.dirname, './src'),
      },
    },
    server: {
      // 개발 전용 Notion API 프록시. 브라우저는 이 자체 엔드포인트(/notion-proxy/**)만 알면
      // 되고, 실제 Notion 토큰/버전 헤더는 여기(Node 서버 측)에서만 주입한다.
      // Notion API는 CORS를 지원하지 않고 토큰도 브라우저에 노출할 수 없으므로, 클라이언트가
      // 직접 api.notion.com을 호출하는 방식은 애초에 불가능하다.
      // 이 프록시는 개발 편의용이며 프로덕션에는 적용되지 않는다 — 프로덕션은 별도 서버리스
      // 프록시가 필요하다(PRD 3장). @notionhq/client SDK는 그 서버 측 프록시 구현에서 쓰기 위해
      // 설치해 두었고, 아래 dev 프록시는 단순 헤더 주입 + 화이트리스트 검사만 수행한다.
      proxy: {
        '/notion-proxy': {
          target: 'https://api.notion.com',
          changeOrigin: true,
          rewrite: (requestPath) => requestPath.replace(/^\/notion-proxy/, ''),
          configure: (proxy) => {
            proxy.on('proxyReq', (proxyReq, req) => {
              const url = req.url ?? ''
              // 화이트리스트: PRD가 허용한 두 엔드포인트만 통과시킨다.
              // (a) 지정된 data source 조회, (b) 블록 children 조회.
              const isDataSourceQuery =
                req.method === 'POST' &&
                /^\/v1\/data_sources\/[^/]+\/query$/.test(url)
              const isBlockChildren =
                req.method === 'GET' &&
                /^\/v1\/blocks\/[^/]+\/children(\?.*)?$/.test(url)

              if (!isDataSourceQuery && !isBlockChildren) {
                // 화이트리스트에 없는 경로는 즉시 연결을 끊어 임의의 Notion 경로 접근을 막는다.
                proxyReq.destroy()
                return
              }

              proxyReq.setHeader('Authorization', `Bearer ${env.NOTION_API_KEY}`)
              // @notionhq/client의 기본 Notion-Version(2025-09-03)보다 최신인 PRD 지정 버전을
              // 명시적으로 고정한다. notionVersion 옵션으로 얼마든지 오버라이드 가능하므로
              // SDK 기본값과 다른 것은 문제가 아니다.
              proxyReq.setHeader('Notion-Version', '2026-03-11')
            })
          },
        },
      },
    },
  }
})
