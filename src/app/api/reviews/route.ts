import { NextRequest, NextResponse } from 'next/server'

import { prisma } from '@/lib/prisma'

const DEFAULT_LIMIT = 10
const MAX_LIMIT = 30

const serializeReview = (review: any) => ({
  id: review.id,
  title: review.title,
  slug: review.slug,
  excerpt: review.excerpt,
  featuredImage: review.featuredImage,
  rating: review.rating,
  publishedAt: review.publishedAt ? review.publishedAt.toISOString() : null,
  author: review.author ? { name: review.author.name, slug: review.author.slug } : null,
  primaryReviewer: review.primaryReviewer
    ? { name: review.primaryReviewer.name, slug: review.primaryReviewer.slug }
    : null,
  category: review.category
    ? { name: review.category.name, slug: review.category.slug }
    : null
})

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const offsetParam = parseInt(searchParams.get('offset') ?? '0', 10)
  const limitParam = parseInt(searchParams.get('limit') ?? `${DEFAULT_LIMIT}`, 10)
  const categorySlug = searchParams.get('category')?.trim()

  const offset = Number.isFinite(offsetParam) && offsetParam > 0 ? offsetParam : 0
  const limitCandidate =
    Number.isFinite(limitParam) && limitParam > 0 ? limitParam : DEFAULT_LIMIT
  const limit = Math.min(limitCandidate, MAX_LIMIT)

  const baseWhere = {
    status: 'PUBLISHED' as const,
    ...(categorySlug
      ? {
          category: {
            slug: categorySlug
          }
        }
      : {})
  }

  const [items, total] = await Promise.all([
    prisma.review.findMany({
      where: baseWhere,
      orderBy: [
        { publishedAt: 'desc' },
        { updatedAt: 'desc' }
      ],
      include: {
        author: { select: { name: true, slug: true } },
        primaryReviewer: { select: { name: true, slug: true } },
        category: { select: { name: true, slug: true } }
      },
      skip: offset,
      take: limit
    }),
    prisma.review.count({
      where: baseWhere
    })
  ])

  const serializedItems = items.map(serializeReview)

  return NextResponse.json({
    items: serializedItems,
    offset,
    limit,
    total,
    hasMore: offset + serializedItems.length < total,
    nextOffset: offset + serializedItems.length
  })
}

