import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdminAuth } from '@/lib/auth'

type Params = { id: string }
type RouteContext = { params: Params } | { params: Promise<Params> }

const resolveParams = async (input: Params | Promise<Params>) =>
  Promise.resolve(input)

export async function GET(
  request: NextRequest,
  context: RouteContext
) {
  const { id } = await resolveParams(context.params)

  const auth = await requireAdminAuth(request)
  if ('response' in auth) {
    return auth.response
  }

  try {
    const author = await prisma.author.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            articles: true,
            reviews: true
          }
        }
      }
    })

    if (!author) {
      return NextResponse.json(
        { error: 'Author not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(author)
  } catch (error) {
    console.error('Error fetching author:', error)
    return NextResponse.json(
      { error: 'Failed to fetch author' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  context: RouteContext
) {
  const { id } = await resolveParams(context.params)

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

    if (slug) {
      const existingAuthor = await prisma.author.findFirst({
        where: {
          slug,
          id: { not: id }
        }
      })

      if (existingAuthor) {
        return NextResponse.json(
          { error: 'Author with this slug already exists' },
          { status: 400 }
        )
      }
    }

    const author = await prisma.author.update({
      where: { id },
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
        isNoIndex,
        isNoFollow,
        schema
      }
    })

    return NextResponse.json(author)
  } catch (error) {
    console.error('Error updating author:', error)
    return NextResponse.json(
      { error: 'Failed to update author' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  context: RouteContext
) {
  const { id } = await resolveParams(context.params)

  const auth = await requireAdminAuth(request)
  if ('response' in auth) {
    return auth.response
  }

  try {
    const author = await prisma.author.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            articles: true,
            reviews: true
          }
        }
      }
    })

    if (!author) {
      return NextResponse.json(
        { error: 'Author not found' },
        { status: 404 }
      )
    }

    if (author._count.articles > 0 || author._count.reviews > 0) {
      return NextResponse.json(
        { error: 'Cannot delete author with existing articles or reviews' },
        { status: 400 }
      )
    }

    await prisma.author.delete({
      where: { id }
    })

    return NextResponse.json({ message: 'Author deleted successfully' })
  } catch (error) {
    console.error('Error deleting author:', error)
    return NextResponse.json(
      { error: 'Failed to delete author' },
      { status: 500 }
    )
  }
}
