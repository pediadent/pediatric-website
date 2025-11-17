import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { SECURITY_CONFIG } from './src/lib/security'
import { SESSION_TOKEN_VERSION } from './src/lib/session-constants'

const PUBLIC_ADMIN_PATHS = ['/admin/login']
const REDIRECT_METHODS = new Set(['GET', 'HEAD'])
const STATIC_EXTENSIONS = new Set([
  '.png',
  '.jpg',
  '.jpeg',
  '.gif',
  '.svg',
  '.webp',
  '.ico',
  '.bmp',
  '.tiff',
  '.mp4',
  '.mp3',
  '.webm',
  '.ogg',
  '.txt',
  '.xml',
  '.json',
  '.js',
  '.mjs',
  '.css',
  '.map',
  '.woff',
  '.woff2',
  '.ttf',
  '.eot',
  '.otf',
  '.pdf'
])

const isPublicAdminPath = (pathname: string) =>
  PUBLIC_ADMIN_PATHS.some(
    (publicPath) => pathname === publicPath || pathname.startsWith(`${publicPath}/`)
  )

const encoder = new TextEncoder()
let hmacKeyPromise: Promise<CryptoKey> | null = null

const getHmacKey = () => {
  if (!hmacKeyPromise) {
    const secret = SECURITY_CONFIG.SESSION.SECRET
    hmacKeyPromise = crypto.subtle.importKey(
      'raw',
      encoder.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    )
  }

  return hmacKeyPromise
}

const decodeBase64UrlToUint8 = (input: string) => {
  const padLength = 4 - (input.length % 4 || 4)
  const base64 = input.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat(padLength % 4)
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i)
  }
  return bytes
}

const decodeBase64UrlToString = (input: string) => {
  const bytes = decodeBase64UrlToUint8(input)
  return new TextDecoder().decode(bytes)
}

type EdgeSessionPayload = {
  userId: string
  issuedAt: number
  nonce: string
  v?: string
}

const verifySessionToken = async (
  token: string | undefined
): Promise<EdgeSessionPayload | null> => {
  if (!token) return null

  const parts = token.split('.')
  if (parts.length !== 2) {
    return null
  }

  const [payloadSegment, signatureSegment] = parts

  try {
    const key = await getHmacKey()
    const signatureBytes = decodeBase64UrlToUint8(signatureSegment)
    const dataBytes = encoder.encode(payloadSegment)
    const isValid = await crypto.subtle.verify(
      'HMAC',
      key,
      signatureBytes,
      dataBytes
    )

    if (!isValid) {
      return null
    }

    const payloadJson = decodeBase64UrlToString(payloadSegment)
    const payload = JSON.parse(payloadJson) as EdgeSessionPayload

    if (
      payload.v !== SESSION_TOKEN_VERSION ||
      typeof payload.userId !== 'string' ||
      typeof payload.issuedAt !== 'number'
    ) {
      return null
    }

    if (Date.now() - payload.issuedAt > SECURITY_CONFIG.SESSION.MAX_AGE) {
      return null
    }

    return payload
  } catch (error) {
    console.error('Middleware session verification failed:', error)
    return null
  }
}

const buildSafeRedirect = (request: NextRequest, target: string) =>
  new URL(target, request.nextUrl)

const isAdminPath = (pathname: string) =>
  pathname === '/admin' || pathname.startsWith('/admin/')

const shouldBypassSiteRedirect = (pathname: string) => {
  if (pathname.startsWith('/_next')) return true
  if (pathname.startsWith('/static')) return true
  if (pathname.startsWith('/api')) return true
  if (pathname === '/favicon.ico') return true
  if (pathname === '/robots.txt') return true
  if (pathname === '/sitemap.xml') return true
  const lastSegment = pathname.split('/').pop() ?? ''
  const dotIndex = lastSegment.lastIndexOf('.')
  if (dotIndex !== -1) {
    const extension = lastSegment.slice(dotIndex).toLowerCase()
    if (STATIC_EXTENSIONS.has(extension)) return true
  }
  return false
}

const lookupRedirect = async (request: NextRequest, pathname: string) => {
  try {
    const lookupUrl = request.nextUrl.clone()
    lookupUrl.pathname = '/api/redirects/lookup'
    lookupUrl.search = ''
    lookupUrl.searchParams.set('path', pathname)

    const response = await fetch(lookupUrl.toString(), {
      headers: {
        'x-middleware-redirect': '1'
      },
      cache: 'no-store'
    })

    if (!response.ok) {
      return null
    }

    const payload = await response.json()
    return payload?.redirect ?? null
  } catch (error) {
    console.error('Redirect lookup failed:', error)
    return null
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  if (pathname.startsWith('/api/admin')) {
    const sessionCookie = request.cookies.get(SECURITY_CONFIG.SESSION.COOKIE_NAME)?.value
    const session = await verifySessionToken(sessionCookie)
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    return NextResponse.next()
  }

  if (isAdminPath(pathname)) {
    const sessionCookie = request.cookies.get(SECURITY_CONFIG.SESSION.COOKIE_NAME)?.value
    const session = await verifySessionToken(sessionCookie)
    const validSession = Boolean(session)
    const publicPath = isPublicAdminPath(pathname)

    if (!validSession && !publicPath) {
      const loginUrl = buildSafeRedirect(request, '/admin/login')
      const redirectTarget = `${pathname}${request.nextUrl.search}`
      loginUrl.searchParams.set('redirect', redirectTarget)
      return NextResponse.redirect(loginUrl)
    }

    if (validSession && pathname === '/admin/login') {
      const redirectParam = request.nextUrl.searchParams.get('redirect')
      const safeRedirect =
        redirectParam && redirectParam.startsWith('/admin')
          ? redirectParam
          : '/admin'
      return NextResponse.redirect(buildSafeRedirect(request, safeRedirect))
    }

    return NextResponse.next()
  }

  if (!REDIRECT_METHODS.has(request.method.toUpperCase())) {
    return NextResponse.next()
  }

  if (shouldBypassSiteRedirect(pathname)) {
    return NextResponse.next()
  }

  const redirectRecord = await lookupRedirect(request, pathname)

  if (!redirectRecord) {
    return NextResponse.next()
  }

  const status = redirectRecord.type === 'PERMANENT' ? 301 : 302
  const target = redirectRecord.toPath

  const destination =
    /^https?:\/\//i.test(target)
      ? new URL(target)
      : new URL(target, request.nextUrl.origin)

  if (destination.href === request.nextUrl.href) {
    return NextResponse.next()
  }

  const response = NextResponse.redirect(destination, status)
  response.headers.set('x-pediatric-redirect', redirectRecord.fromPath)
  return response
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/api/admin/:path*',
    '/((?!api|_next/static|_next/image|_next/data|favicon.ico).*)'
  ]
}
