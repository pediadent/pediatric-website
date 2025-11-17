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
        { email: { contains: search, mode: 'insensitive' } }
      ]
    }

    const [authors, total] = await Promise.all([
      prisma.author.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: {
              articles: true,
              reviews: true
            }
          }
        }
      }),
      prisma.author.count({ where })
    ])

    return NextResponse.json({
      authors,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching authors:', error)
    return NextResponse.json(
      { error: 'Failed to fetch authors' },
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
      bio,
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

    const existingAuthor = await prisma.author.findUnique({
      where: { slug }
    })

    if (existingAuthor) {
      return NextResponse.json(
        { error: 'Author with this slug already exists' },
        { status: 400 }
      )
    }

    const author = await prisma.author.create({
      data: {
        name,
        slug,
        bio,
        email,
        website,
        avatar,
        seoTitle,
        seoDescription,
        featuredImage,
        isNoIndex: isNoIndex || false,
        isNoFollow: isNoFollow || false,
        schema
      }
    })

    return NextResponse.json(author, { status: 201 })
  } catch (error) {
    console.error('Error creating author:', error)
    return NextResponse.json(
      { error: 'Failed to create author' },
      { status: 500 }
    )
  }
}
