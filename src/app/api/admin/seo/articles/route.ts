import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdminAuth } from '@/lib/auth'

type ArticleUpdatePayload = {
  id: string
  seoTitle?: string | null
  seoDescription?: string | null
  schema?: string | null
  isNoIndex?: boolean
  isNoFollow?: boolean
  featuredImage?: string | null
}

const buildArticleWhereClause = (search: string | null) => {
  if (!search) return {}

  return {
    OR: [
      { title: { contains: search, mode: 'insensitive' } },
      { slug: { contains: search, mode: 'insensitive' } },
      { seoTitle: { contains: search, mode: 'insensitive' } }
    ]
  }
}

export async function GET(request: NextRequest) {
  const auth = await requireAdminAuth(request)
  if ('response' in auth) {
    return auth.response
  }

  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    const idsParam = searchParams.get('ids')
    const limit = Math.min(Number(searchParams.get('limit') || 25), 100)

    const where = buildArticleWhereClause(search)

    if (idsParam) {
      const ids = idsParam.split(',').map((id) => id.trim()).filter(Boolean)
      if (ids.length > 0) {
        Object.assign(where, { id: { in: ids } })
      }
    }

    const articles = await prisma.article.findMany({
      where,
      take: limit,
      orderBy: { updatedAt: 'desc' },
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        seoTitle: true,
        seoDescription: true,
        schema: true,
        isNoIndex: true,
        isNoFollow: true,
        featuredImage: true,
        updatedAt: true
      }
    })

    return NextResponse.json({ articles })
  } catch (error) {
    console.error('Error fetching article SEO data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch article SEO data.' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  const auth = await requireAdminAuth(request)
  if ('response' in auth) {
    return auth.response
  }

  try {
    const body = await request.json()
    const payloads: ArticleUpdatePayload[] = Array.isArray(body)
      ? body
      : Array.isArray(body?.articles)
        ? body.articles
        : [body]

    const updates = []

    for (const payload of payloads) {
      if (!payload?.id || typeof payload.id !== 'string') {
        return NextResponse.json(
          { error: 'Each update must include a valid article id.' },
          { status: 400 }
        )
      }

      const data: Record<string, string | boolean | null | undefined> = {}

      if ('seoTitle' in payload) data.seoTitle = payload.seoTitle ?? null
      if ('seoDescription' in payload) data.seoDescription = payload.seoDescription ?? null
      if ('schema' in payload) data.schema = payload.schema ?? null
      if ('isNoIndex' in payload) data.isNoIndex = Boolean(payload.isNoIndex)
      if ('isNoFollow' in payload) data.isNoFollow = Boolean(payload.isNoFollow)
      if ('featuredImage' in payload) data.featuredImage = payload.featuredImage ?? null

      const result = await prisma.article.update({
        where: { id: payload.id },
        data
      })

      updates.push(result)
    }

    return NextResponse.json({ articles: updates })
  } catch (error) {
    console.error('Error updating article SEO data:', error)
    return NextResponse.json(
      { error: 'Failed to update article SEO data.' },
      { status: 500 }
    )
  }
}
