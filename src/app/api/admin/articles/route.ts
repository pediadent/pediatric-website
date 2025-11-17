import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { buildArticleSchema } from '@/lib/article-schema'
import { requireAdminAuth } from '@/lib/auth'

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
      status,
      type,
      seoTitle,
      seoDescription,
      isNoIndex,
      isNoFollow,
      schema,
      faqs,
      publishedAt,
      categoryId,
      authorId
    } = body

    const trimmedSchema = typeof schema === 'string' ? schema.trim() : ''
    const shouldGenerateSchema = (!trimmedSchema || trimmedSchema.length === 0) && status === 'PUBLISHED'

    const publishedAtDate = publishedAt ? new Date(publishedAt) : (status === 'PUBLISHED' ? new Date() : null)
    const authorRecord = shouldGenerateSchema
      ? await prisma.author.findUnique({
          where: { id: authorId },
          select: { name: true }
        })
      : null

    const schemaToSave = shouldGenerateSchema
      ? buildArticleSchema({
          title,
          description: seoDescription || excerpt || '',
          slug,
          authorName: authorRecord?.name,
          publishedAt: publishedAtDate ?? new Date(),
          updatedAt: new Date(),
          featuredImage
        })
      : schema

    // Check if slug already exists
    const existingArticle = await prisma.article.findUnique({
      where: { slug }
    })

    if (existingArticle) {
      return NextResponse.json(
        { error: 'Article with this slug already exists' },
        { status: 400 }
      )
    }

    const article = await prisma.article.create({
      data: {
        title,
        slug,
        content,
        excerpt,
        featuredImage,
        status,
        type,
        seoTitle,
        seoDescription,
        isNoIndex,
        isNoFollow,
        schema: schemaToSave,
        faqs: typeof faqs === 'string' && faqs.trim().length > 0 ? faqs : null,
        publishedAt: publishedAtDate,
        categoryId,
        authorId,
        userId: auth.user.id
      },
      include: {
        author: true,
        category: true,
        user: true
      }
    })

    return NextResponse.json(article, { status: 201 })
  } catch (error) {
    console.error('Error creating article:', error)
    return NextResponse.json(
      { error: 'Failed to create article' },
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

    const [articles, total] = await Promise.all([
      prisma.article.findMany({
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
          }
        }
      }),
      prisma.article.count({ where })
    ])

    return NextResponse.json({
      articles,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching articles:', error)
    return NextResponse.json(
      { error: 'Failed to fetch articles' },
      { status: 500 }
    )
  }
}
