import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdminAuth } from '@/lib/auth'

export async function GET(request: NextRequest) {
  const auth = await requireAdminAuth(request)
  if ('response' in auth) {
    return auth.response
  }

  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search')

    const skip = (page - 1) * limit

    const where: Record<string, unknown> = {}

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { bio: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { credentials: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } }
      ]
    }

    const [reviewers, total] = await Promise.all([
      prisma.reviewer.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: {
              primaryReviews: true,
              reviewAssignments: true
            }
          }
        }
      }),
      prisma.reviewer.count({ where })
    ])

    return NextResponse.json({
      reviewers,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching reviewers:', error)
    return NextResponse.json(
      { error: 'Failed to fetch reviewers' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
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

    const existingReviewer = await prisma.reviewer.findUnique({
      where: { slug }
    })

    if (existingReviewer) {
      return NextResponse.json(
        { error: 'Reviewer with this slug already exists' },
        { status: 400 }
      )
    }

    const reviewer = await prisma.reviewer.create({
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
        isNoIndex: Boolean(isNoIndex),
        isNoFollow: Boolean(isNoFollow),
        schema
      }
    })

    return NextResponse.json(reviewer, { status: 201 })
  } catch (error) {
    console.error('Error creating reviewer:', error)
    return NextResponse.json(
      { error: 'Failed to create reviewer' },
      { status: 500 }
    )
  }
}
