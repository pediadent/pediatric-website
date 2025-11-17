import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const DEFAULT_LIMIT = 10
const MAX_LIMIT = 20

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  const categorySlug = params.slug?.trim()

  if (!categorySlug) {
    return NextResponse.json(
      { error: 'Category slug is required' },
      { status: 400 }
    )
  }

  const { searchParams } = new URL(request.url)
  const offsetParam = parseInt(searchParams.get('offset') ?? '0', 10)
  const limitParam = parseInt(
    searchParams.get('limit') ?? `${DEFAULT_LIMIT}`,
    10
  )

  const offset = Number.isFinite(offsetParam) && offsetParam > 0 ? offsetParam : 0
  const limitCandidate =
    Number.isFinite(limitParam) && limitParam > 0 ? limitParam : DEFAULT_LIMIT
  const limit = Math.min(limitCandidate, MAX_LIMIT)

  const baseWhere = {
    status: 'PUBLISHED' as const,
    category: {
      slug: categorySlug
    }
  }

  const [items, total] = await Promise.all([
    prisma.article.findMany({
      where: baseWhere,
      orderBy: [
        { publishedAt: 'desc' },
        { createdAt: 'desc' }
      ],
      include: {
        author: {
          select: { name: true, slug: true }
        },
        category: {
          select: { name: true, slug: true }
        }
      },
      skip: offset,
      take: limit
    }),
    prisma.article.count({
      where: baseWhere
    })
  ])

  return NextResponse.json({
    items,
    offset,
    limit,
    total,
    hasMore: offset + items.length < total,
    nextOffset: offset + items.length
  })
}
