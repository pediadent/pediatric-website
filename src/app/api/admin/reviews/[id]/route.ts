import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdminAuth } from '@/lib/auth'

type RouteContext = {
  params: Promise<{
    id: string
  }>
}

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

const includeConfig = {
  author: true,
  category: true,
  user: true,
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
} as const

const findReviewByIdentifier = async (identifier: string) => {
  if (!identifier) return null
  const decoded = decodeURIComponent(identifier).trim()
  const byId = await prisma.review.findUnique({
    where: { id: decoded },
    include: includeConfig
  })
  if (byId) return byId
  return prisma.review.findUnique({
    where: { slug: decoded },
    include: includeConfig
  })
}

export async function GET(
  request: NextRequest,
  { params }: RouteContext
) {
  const auth = await requireAdminAuth(request)
  if ('response' in auth) {
    return auth.response
  }

  try {
    const { id } = await params
    const { searchParams } = new URL(request.url)
    const lookupMode = searchParams.get('lookup')

    const review =
      lookupMode === 'slug'
        ? await prisma.review.findUnique({
            where: { slug: decodeURIComponent(id) },
            include: includeConfig
          })
        : await findReviewByIdentifier(id)

    if (!review) {
      return NextResponse.json(
        { error: 'Review not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      ...review,
      reviewers: review.reviewers?.map((entry) => entry.reviewer) ?? []
    })
  } catch (error) {
    console.error('Error fetching review:', error)
    return NextResponse.json(
      { error: 'Failed to fetch review' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: RouteContext
) {
  const auth = await requireAdminAuth(request)
  if ('response' in auth) {
    return auth.response
  }

  try {
    const { id } = await params
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

    const existingReview = await findReviewByIdentifier(id)

    if (!existingReview) {
      return NextResponse.json(
        { error: 'Review not found' },
        { status: 404 }
      )
    }

    if (slug) {
      const otherReview = await prisma.review.findFirst({
        where: {
          slug,
          id: { not: existingReview.id }
        }
      })

      if (otherReview) {
        return NextResponse.json(
          { error: 'Review with this slug already exists' },
          { status: 400 }
        )
      }
    }

    const normalizedReviewerIds = normalizeReviewerIds(reviewerIds ?? [])
    const resolvedPrimary =
      (typeof primaryReviewerId === 'string' && primaryReviewerId.trim().length > 0
        ? primaryReviewerId.trim()
        : undefined) ||
      normalizedReviewerIds[0] ||
      existingReview.primaryReviewerId

    if (!resolvedPrimary) {
      return NextResponse.json(
        { error: 'At least one reviewer is required.' },
        { status: 400 }
      )
    }

    const reviewerIdSet = new Set<string>(normalizedReviewerIds)
    reviewerIdSet.add(resolvedPrimary)
    const reviewerAssignments = Array.from(reviewerIdSet)

    if (reviewerAssignments.length > 0) {
      const existingReviewers = await prisma.reviewer.findMany({
        where: { id: { in: reviewerAssignments } },
        select: { id: true }
      })

      if (existingReviewers.length !== reviewerAssignments.length) {
        return NextResponse.json(
          { error: 'One or more reviewers could not be found.' },
          { status: 400 }
        )
      }
    }

    const trimmedAuthorId =
      typeof authorId === 'string' ? authorId.trim() : undefined
    let authorIdToUse = existingReview.authorId

    if (
      trimmedAuthorId &&
      trimmedAuthorId.length > 0 &&
      trimmedAuthorId !== existingReview.authorId
    ) {
      const authorExists = await prisma.author.findUnique({
        where: { id: trimmedAuthorId },
        select: { id: true }
      })

      if (authorExists) {
        authorIdToUse = trimmedAuthorId
      }
    }

    const trimmedCategoryId =
      typeof categoryId === 'string' ? categoryId.trim() : undefined
    const categoryIdToUse =
      trimmedCategoryId && trimmedCategoryId.length > 0
        ? trimmedCategoryId
        : existingReview.categoryId

    if (categoryIdToUse !== existingReview.categoryId) {
      const categoryExists = await prisma.category.findUnique({
        where: { id: categoryIdToUse },
        select: { id: true }
      })

      if (!categoryExists) {
        return NextResponse.json(
          { error: 'Selected category does not exist.' },
          { status: 400 }
        )
      }
    }

    const finalStatus = status ?? existingReview.status
    const rawPublishedAt = publishedAt
      ? new Date(publishedAt)
      : existingReview.publishedAt
    const publishedAtForStatus =
      finalStatus === 'PUBLISHED'
        ? rawPublishedAt ?? new Date()
        : rawPublishedAt

    const dataToUpdate: Record<string, unknown> = {
      title: title ?? existingReview.title,
      slug: slug ?? existingReview.slug,
      content: content ?? existingReview.content,
      excerpt: excerpt ?? existingReview.excerpt,
      featuredImage: featuredImage ?? existingReview.featuredImage,
      rating:
        rating !== undefined && rating !== null
          ? parseFloat(rating)
          : existingReview.rating,
      pros: pros ?? existingReview.pros,
      cons: cons ?? existingReview.cons,
      affiliateLinks: affiliateLinks ?? existingReview.affiliateLinks,
      faqs: faqs ?? existingReview.faqs,
      status: finalStatus,
      seoTitle: seoTitle ?? existingReview.seoTitle,
      seoDescription: seoDescription ?? existingReview.seoDescription,
      isNoIndex:
        typeof isNoIndex === 'boolean' ? isNoIndex : existingReview.isNoIndex,
      isNoFollow:
        typeof isNoFollow === 'boolean'
          ? isNoFollow
          : existingReview.isNoFollow,
      schema: schema ?? existingReview.schema,
      publishedAt: publishedAtForStatus ?? null,
      categoryId: categoryIdToUse,
      primaryReviewerId: resolvedPrimary
    }

    dataToUpdate.authorId = authorIdToUse

    if (Array.isArray(reviewerIds)) {
      dataToUpdate.reviewers = {
        deleteMany: {},
        create: reviewerAssignments.map((id) => ({ reviewerId: id }))
      }
    }

    const review = await prisma.review.update({
      where: { id: existingReview.id },
      data: dataToUpdate,
      include: includeConfig
    })

    return NextResponse.json({
      ...review,
      reviewers: review.reviewers?.map((entry) => entry.reviewer) ?? []
    })
  } catch (error) {
    console.error('Error updating review:', error)
    return NextResponse.json(
      { error: 'Failed to update review' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: RouteContext
) {
  const auth = await requireAdminAuth(request)
  if ('response' in auth) {
    return auth.response
  }

  try {
    const { id } = await params
    const existingReview = await findReviewByIdentifier(id)

    if (!existingReview) {
      return NextResponse.json(
        { error: 'Review not found' },
        { status: 404 }
      )
    }

    await prisma.review.delete({
      where: { id: existingReview.id }
    })

    return NextResponse.json(
      { message: 'Review deleted successfully' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error deleting review:', error)
    return NextResponse.json(
      { error: 'Failed to delete review' },
      { status: 500 }
    )
  }
}
