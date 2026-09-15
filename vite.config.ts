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
          // NOTION_DATA_SOURCE_ID는 VITE_ 접두사가 없어 클라이언트 번들에 노출되지 않는다
          // (CLAUDE.md 규약) — 즉 프런트엔드 코드는 이 ID를 아예 알 수 없다. 그래서 클라이언트는
          // ID 없는 고정 경로(`/notion-proxy/v1/data_sources/query`)만 호출하고, 이 dev 프록시가
          // (Node 컨텍스트에서 loadEnv로 읽은) 실제 ID를 여기서 채워 넣어 진짜 Notion 엔드포인트로
          // 바꿔준다. 블록 children 조회는 페이지/블록 ID가 비밀값이 아니므로 그대로 통과시킨다.
          rewrite: (requestPath) => {
            if (requestPath === '/notion-proxy/v1/data_sources/query') {
              return `/v1/data_sources/${env.NOTION_DATA_SOURCE_ID}/query`
            }
            return requestPath.replace(/^\/notion-proxy/, '')
          },
          configure: (proxy) => {
            proxy.on('proxyReq', (proxyReq, req) => {
              const url = req.url ?? ''
              // 화이트리스트: PRD가 허용한 두 엔드포인트만 통과시킨다.
              // (a) 지정된 data source 조회, (b) 블록 children 조회.
              // rewrite가 이미 실제 데이터소스 ID로 치환한 뒤이므로, 여기서는 치환된 경로가
              // 정확히 그 형태인지만 다시 한번 확인한다(방어적 이중 검사).
              const isDataSourceQuery =
                req.method === 'POST' &&
                url === `/v1/data_sources/${env.NOTION_DATA_SOURCE_ID}/query`
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
