import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl

  if (pathname.startsWith('/blog/')) {
    const slug = pathname.replace(/^\/blog\//, '').replace(/\/+$/, '')

    if (slug.length > 0) {
      const redirectUrl = new URL(`/${slug}/`, request.url)
      redirectUrl.search = search
      return NextResponse.redirect(redirectUrl, 308)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/blog/:path*']
}
