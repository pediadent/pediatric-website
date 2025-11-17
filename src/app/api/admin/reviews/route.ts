import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdminAuth } from '@/lib/auth'

const normalizeReviewerIds = (value: unknown): string[] => {
  if (!Array.isArray(value)) return []
  const unique = new Set<string>()
  value.forEach((item) => {
    if (typeof item === 'string' && item.trim().length > 0) {
      unique.add(item.trim())
    }
  })
  return Array.from(unique)
}

const reviewerSelect = {
  id: true,
  name: true,
  slug: true,
  title: true,
  credentials: true,
  avatar: true
}

export async function POST(request: NextRequest) {
  const auth = await requireAdminAuth(request)
  if ('response' in auth) {
    return auth.response
  }

  try {
    const body = await request.json()

    const {
      title,
      slug,
      content,
      excerpt,
      featuredImage,
      rating,
      pros,
      cons,
      affiliateLinks,
      status,
      seoTitle,
      seoDescription,
      isNoIndex,
      isNoFollow,
      schema,
      publishedAt,
      categoryId,
      authorId,
      reviewerIds,
      primaryReviewerId,
      faqs
    } = body

    if (!authorId) {
      return NextResponse.json(
        { error: 'Author is required for a review.' },
        { status: 400 }
      )
    }

    const reviewers = normalizeReviewerIds(reviewerIds)
    const resolvedPrimary =
      (typeof primaryReviewerId === 'string' && primaryReviewerId.trim().length > 0
        ? primaryReviewerId.trim()
        : undefined) ||
      reviewers[0]

    if (!resolvedPrimary) {
      return NextResponse.json(
        { error: 'At least one reviewer is required.' },
        { status: 400 }
      )
    }

    // Ensure primary reviewer is included in assignments
    const reviewerIdSet = new Set<string>(reviewers)
    reviewerIdSet.add(resolvedPrimary)
    const reviewerAssignments = Array.from(reviewerIdSet)

    const existingReview = await prisma.review.findUnique({
      where: { slug }
    })

    if (existingReview) {
      return NextResponse.json(
        { error: 'Review with this slug already exists' },
        { status: 400 }
      )
    }

    const review = await prisma.review.create({
      data: {
        title,
        slug,
        content,
        excerpt,
        featuredImage,
        rating: rating !== undefined && rating !== null ? parseFloat(rating) : null,
        pros,
        cons,
        affiliateLinks,
        faqs,
        status,
        seoTitle,
        seoDescription,
        isNoIndex,
        isNoFollow,
        schema,
        publishedAt: publishedAt ? new Date(publishedAt) : null,
        categoryId,
        authorId,
        primaryReviewerId: resolvedPrimary,
        userId: auth.user.id,
        reviewers: reviewerAssignments.length
          ? {
              create: reviewerAssignments.map((id) => ({ reviewerId: id }))
            }
          : undefined
      },
      include: {
        author: {
          select: { id: true, name: true, slug: true }
        },
        category: {
          select: { id: true, name: true, slug: true }
        },
        user: {
          select: { id: true, name: true, email: true }
        },
        primaryReviewer: {
          select: reviewerSelect
        },
        reviewers: {
          include: {
            reviewer: {
              select: reviewerSelect
            }
          }
        }
      }
    })

    return NextResponse.json(
      {
        ...review,
        reviewers: review.reviewers?.map((entry) => entry.reviewer) ?? []
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating review:', error)
    return NextResponse.json(
      { error: 'Failed to create review' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  const auth = await requireAdminAuth(request)
  if ('response' in auth) {
    return auth.response
  }

  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const status = searchParams.get('status')
    const categoryId = searchParams.get('categoryId')
    const search = searchParams.get('search')

    const skip = (page - 1) * limit

    const where: Record<string, unknown> = {}

    if (status) {
      where.status = status
    }

    if (categoryId) {
      where.categoryId = categoryId
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } },
        { excerpt: { contains: search, mode: 'insensitive' } }
      ]
    }

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          author: {
            select: { id: true, name: true, slug: true }
          },
          category: {
            select: { id: true, name: true, slug: true }
          },
          user: {
            select: { id: true, name: true, email: true }
          },
          primaryReviewer: {
            select: reviewerSelect
          },
          reviewers: {
            include: {
              reviewer: {
                select: reviewerSelect
              }
            }
          }
        }
      }),
      prisma.review.count({ where })
    ])

    return NextResponse.json({
      reviews: reviews.map((review) => ({
        ...review,
        reviewers: review.reviewers?.map((entry) => entry.reviewer) ?? []
      })),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching reviews:', error)
    return NextResponse.json(
      { error: 'Failed to fetch reviews' },
      { status: 500 }
    )
  }
}
