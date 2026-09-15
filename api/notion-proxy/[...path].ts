// 프로덕션 Notion API 프록시 (Vercel Edge Function).
//
// dev 프록시(vite.config.ts)와 동일하게 화이트리스트 2개 엔드포인트만 통과시키고, 실제
// Notion 토큰/버전 헤더는 여기(서버)에서만 주입한다. 프런트엔드(src/features/terms/api/
// notionClient.ts)는 dev/프로덕션 구분 없이 `/notion-proxy/**`라는 동일한 경로만 알면 되고,
// vercel.json의 rewrite가 이 경로를 `/api/notion-proxy/**`로 연결해 이 함수까지 도달시킨다.
//
// dev 프록시와 다른 점(프로덕션에 필요한 보강, PRD 3장/7장 5단계):
// - 화이트리스트 위반 시 연결을 끊는 대신(dev의 proxyReq.destroy()는 상태 코드 없는 네트워크
//   오류로 보인다) 403 JSON으로 명확히 응답한다.
// - 429(rate limit) 응답은 Notion이 알려주는 Retry-After만큼 대기한 뒤 재시도한다.
// - 60초 수준의 인메모리 캐시를 둔다. 서버리스 함수 인스턴스가 재사용되는 동안만 유효하고
//   콜드 스타트 시 비워지므로(ROADMAP "Rate limit 대비 캐시 위치" 리스크), 블록 조회(GET)는
//   CDN도 캐시할 수 있도록 Cache-Control 헤더를 추가로 얹어 실질적인 방어선을 하나 더 둔다.
//   데이터소스 쿼리(POST)는 표준적으로 CDN이 캐시하지 않는 메서드라 인메모리 캐시에만 의존한다.
export const config = { runtime: 'edge' }

const NOTION_API_BASE = 'https://api.notion.com'
const NOTION_VERSION = '2026-03-11'
const CACHE_TTL_MS = 60_000
const MAX_RETRIES = 2

// 클라이언트는 실제 데이터소스 ID를 모른다(NOTION_DATA_SOURCE_ID는 VITE_ 접두사가 없어 번들에
// 노출되지 않는다) — 그래서 이 고정 경로로만 요청하고, 여기서 진짜 ID로 치환해 Notion에 전달한다.
const DATA_SOURCE_QUERY_PATH = '/v1/data_sources/query'
const BLOCK_CHILDREN_PATTERN = /^\/v1\/blocks\/[^/]+\/children$/

// 인스턴스가 재사용되는 동안만 유효한 인메모리 캐시(요청 키 → 응답 본문/상태).
const cache = new Map<string, { body: string; status: number; expiresAt: number }>()

function forbidden(message: string): Response {
  return new Response(
    JSON.stringify({ object: 'error', status: 403, code: 'forbidden', message }),
    { status: 403, headers: { 'Content-Type': 'application/json' } },
  )
}

function notionHeaders(extra?: HeadersInit): HeadersInit {
  return {
    Authorization: `Bearer ${process.env.NOTION_API_KEY}`,
    'Notion-Version': NOTION_VERSION,
    ...extra,
  }
}

async function fetchNotionWithRetry(url: string, init: RequestInit): Promise<Response> {
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    const response = await fetch(url, init)
    if (response.status !== 429 || attempt === MAX_RETRIES) {
      return response
    }
    const retryAfterSeconds = Number(response.headers.get('Retry-After') ?? '1')
    await new Promise((resolve) => setTimeout(resolve, retryAfterSeconds * 1000))
  }
  // 위 루프가 매 분기에서 반환하므로 실제로는 도달하지 않는다 — TS 흐름 분석용.
  throw new Error('unreachable')
}

async function proxyWithCache(cacheKey: string, url: string, init: RequestInit): Promise<Response> {
  const cached = cache.get(cacheKey)
  if (cached && cached.expiresAt > Date.now()) {
    return new Response(cached.body, {
      status: cached.status,
      headers: { 'Content-Type': 'application/json', 'X-Cache': 'HIT' },
    })
  }

  const upstream = await fetchNotionWithRetry(url, init)
  const bodyText = await upstream.text()

  // 실패 응답(4xx/5xx)은 캐시하지 않는다 — 일시적 오류가 60초간 고착되면 안 되기 때문이다.
  if (upstream.status === 200) {
    cache.set(cacheKey, { body: bodyText, status: upstream.status, expiresAt: Date.now() + CACHE_TTL_MS })
  }

  return new Response(bodyText, {
    status: upstream.status,
    headers: { 'Content-Type': 'application/json', 'X-Cache': 'MISS' },
  })
}

export default async function handler(request: Request): Promise<Response> {
  const url = new URL(request.url)
  const path = url.pathname.replace(/^\/api\/notion-proxy/, '')

  if (request.method === 'POST' && path === DATA_SOURCE_QUERY_PATH) {
    const requestBody = await request.text()
    return proxyWithCache(
      `query:${requestBody}`,
      `${NOTION_API_BASE}/v1/data_sources/${process.env.NOTION_DATA_SOURCE_ID}/query`,
      { method: 'POST', headers: notionHeaders({ 'Content-Type': 'application/json' }), body: requestBody },
    )
  }

  if (request.method === 'GET' && BLOCK_CHILDREN_PATTERN.test(path)) {
    const search = url.searchParams.toString()
    const response = await proxyWithCache(
      `blocks:${path}?${search}`,
      `${NOTION_API_BASE}${path}${search ? `?${search}` : ''}`,
      { method: 'GET', headers: notionHeaders() },
    )
    response.headers.set('Cache-Control', 's-maxage=60, stale-while-revalidate=30')
    return response
  }

  return forbidden('허용되지 않은 경로입니다.')
}
