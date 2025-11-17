import { NextResponse } from 'next/server'

import { prisma } from '@/lib/prisma'

const BASE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') ||
  process.env.SITE_URL?.replace(/\/$/, '') ||
  'https://pediatricdentistinqueensny.com'

interface StaticRoute {
  path: string
  priority: number
}

const staticRoutes: StaticRoute[] = [
  { path: '/', priority: 1 },
  { path: '/reviews/', priority: 0.9 },
  { path: '/news/', priority: 0.7 },
  { path: '/oral-health-tips/', priority: 0.8 },
  { path: '/salary/', priority: 0.7 },
  { path: '/about-us/', priority: 0.5 },
  { path: '/contact-us/', priority: 0.5 },
  { path: '/submit-clinic/', priority: 0.4 }
]

export async function GET() {
  const [articles, reviews, dentists] = await Promise.all([
    prisma.article.findMany({
      where: { status: 'PUBLISHED' },
      select: { slug: true, updatedAt: true }
    }),
    prisma.review.findMany({
      where: { status: 'PUBLISHED' },
      select: { slug: true, updatedAt: true }
    }),
    prisma.dentistDirectory.findMany({
      where: { isActive: true },
      select: { slug: true, updatedAt: true }
    })
  ])

  const urls: Array<{ loc: string; lastmod?: string; priority: number }> = []

  staticRoutes.forEach((entry) => {
    urls.push({
      loc: `${BASE_URL}${entry.path}`,
      lastmod: new Date().toISOString(),
      priority: entry.priority
    })
  })

  articles.forEach((article) => {
    urls.push({
      loc: `${BASE_URL}/${article.slug}/`,
      lastmod: article.updatedAt.toISOString(),
      priority: 0.7
    })
  })

  reviews.forEach((review) => {
    urls.push({
      loc: `${BASE_URL}/${review.slug}/`,
      lastmod: review.updatedAt.toISOString(),
      priority: 0.8
    })
  })

  dentists.forEach((dentist) => {
    urls.push({
      loc: `${BASE_URL}/${dentist.slug}/`,
      lastmod: dentist.updatedAt.toISOString(),
      priority: 0.6
    })
  })

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${urls
    .map(
      (url) => `<url>
    <loc>${url.loc}</loc>
    ${url.lastmod ? `<lastmod>${url.lastmod}</lastmod>` : ''}
    <priority>${url.priority.toFixed(1)}</priority>
  </url>`
    )
    .join('\n')}
</urlset>`

  return new NextResponse(sitemap, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml'
    }
  })
}
