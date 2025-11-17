import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdminAuth } from '@/lib/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await requireAdminAuth(request)
  if ('response' in auth) {
    return auth.response
  }

  try {
    const { id } = await Promise.resolve(params)
    const reviewer = await prisma.reviewer.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            primaryReviews: true,
            reviewAssignments: true
          }
        }
      }
    })

    if (!reviewer) {
      return NextResponse.json(
        { error: 'Reviewer not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(reviewer)
  } catch (error) {
    console.error('Error fetching reviewer:', error)
    return NextResponse.json(
      { error: 'Failed to fetch reviewer' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await requireAdminAuth(request)
  if ('response' in auth) {
    return auth.response
  }

  try {
    const body = await request.json()

    const {
      name,
      slug,
      title,
      credentials,
      bio,
      description,
      email,
      website,
      avatar,
      seoTitle,
      seoDescription,
      featuredImage,
      isNoIndex,
      isNoFollow,
      schema
    } = body

    const { id } = await Promise.resolve(params)

    if (slug) {
      const existing = await prisma.reviewer.findFirst({
        where: {
          slug,
          id: { not: id }
        }
      })

      if (existing) {
        return NextResponse.json(
          { error: 'Reviewer with this slug already exists' },
          { status: 400 }
        )
      }
    }

    const reviewer = await prisma.reviewer.update({
      where: { id },
      data: {
        name,
        slug,
        title,
        credentials,
        bio,
        description,
        email,
        website,
        avatar,
        seoTitle,
        seoDescription,
        featuredImage,
        isNoIndex,
        isNoFollow,
        schema
      }
    })

    return NextResponse.json(reviewer)
  } catch (error) {
    console.error('Error updating reviewer:', error)
    return NextResponse.json(
      { error: 'Failed to update reviewer' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await requireAdminAuth(request)
  if ('response' in auth) {
    return auth.response
  }

  try {
    const { id } = await Promise.resolve(params)
    const reviewer = await prisma.reviewer.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            primaryReviews: true,
            reviewAssignments: true
          }
        }
      }
    })

    if (!reviewer) {
      return NextResponse.json(
        { error: 'Reviewer not found' },
        { status: 404 }
      )
    }

    if (reviewer._count.primaryReviews > 0 || reviewer._count.reviewAssignments > 0) {
      return NextResponse.json(
        { error: 'Cannot delete reviewer with assigned reviews.' },
        { status: 400 }
      )
    }

    await prisma.reviewer.delete({
      where: { id }
    })

    return NextResponse.json({ message: 'Reviewer deleted successfully' })
  } catch (error) {
    console.error('Error deleting reviewer:', error)
    return NextResponse.json(
      { error: 'Failed to delete reviewer' },
      { status: 500 }
    )
  }
}
