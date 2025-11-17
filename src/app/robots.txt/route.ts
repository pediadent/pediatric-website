import { NextResponse } from 'next/server'

const BASE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') ||
  process.env.SITE_URL?.replace(/\/$/, '') ||
  'https://pediatricdentistinqueensny.com'

const ROBOTS = `User-agent: *
Allow: /

Sitemap: ${BASE_URL}/sitemap.xml
`

export function GET() {
  return new NextResponse(ROBOTS, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8'
    }
  })
}

