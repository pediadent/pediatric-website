import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { buildArticleSchema } from '@/lib/article-schema'
import { requireAdminAuth } from '@/lib/auth'

type RouteContext = {
  params: Promise<{
    id: string
  }>
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
    const article = await prisma.article.findUnique({
      where: { id },
      include: {
        author: true,
        category: true,
        user: true
      }
    })

    if (!article) {
      return NextResponse.json(
        { error: 'Article not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(article)
  } catch (error) {
    console.error('Error fetching article:', error)
    return NextResponse.json(
      { error: 'Failed to fetch article' },
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

    const existingArticle = await prisma.article.findUnique({
      where: { id },
      include: {
        author: { select: { id: true, name: true } }
      }
    })

    if (!existingArticle) {
      return NextResponse.json(
        { error: 'Article not found' },
        { status: 404 }
      )
    }

    if (slug) {
      const existingArticle = await prisma.article.findFirst({
        where: {
          slug,
          id: { not: id }
        }
      })

      if (existingArticle) {
        return NextResponse.json(
          { error: 'Article with this slug already exists' },
          { status: 400 }
        )
      }
    }

    const finalStatus = status ?? existingArticle.status
    const rawPublishedAt = publishedAt
      ? new Date(publishedAt)
      : existingArticle.publishedAt
    const publishedAtForStatus =
      finalStatus === 'PUBLISHED'
        ? rawPublishedAt ?? new Date()
        : rawPublishedAt

    let authorName = existingArticle.author?.name || 'Editorial Team'
    const authorIdToUse = authorId ?? existingArticle.authorId
    if (authorIdToUse !== existingArticle.authorId) {
      const authorRecord = await prisma.author.findUnique({
        where: { id: authorIdToUse },
        select: { name: true }
      })
      authorName = authorRecord?.name || authorName
    }

    const trimmedSchema = typeof schema === 'string' ? schema.trim() : ''
    const shouldGenerateSchema =
      (!trimmedSchema || trimmedSchema.length === 0) && finalStatus === 'PUBLISHED'

    const dataToUpdate: Record<string, unknown> = {
      title: title ?? existingArticle.title,
      slug: slug ?? existingArticle.slug,
      content: content ?? existingArticle.content,
      excerpt: excerpt ?? existingArticle.excerpt,
      featuredImage: featuredImage ?? existingArticle.featuredImage,
      status: finalStatus,
      type: type ?? existingArticle.type,
      seoTitle: seoTitle ?? existingArticle.seoTitle,
      seoDescription: seoDescription ?? existingArticle.seoDescription,
      isNoIndex: typeof isNoIndex === 'boolean' ? isNoIndex : existingArticle.isNoIndex,
      isNoFollow: typeof isNoFollow === 'boolean' ? isNoFollow : existingArticle.isNoFollow,
      publishedAt: publishedAtForStatus ?? null,
      categoryId: categoryId ?? existingArticle.categoryId,
      authorId: authorIdToUse
    }

    if (typeof faqs === 'string') {
      dataToUpdate.faqs = faqs.trim().length > 0 ? faqs : null
    }

    if (shouldGenerateSchema) {
      dataToUpdate.schema = buildArticleSchema({
        title: dataToUpdate.title,
        description: dataToUpdate.seoDescription || dataToUpdate.excerpt || '',
        slug: dataToUpdate.slug,
        authorName,
        publishedAt: (publishedAtForStatus ?? new Date()),
        updatedAt: new Date(),
        featuredImage: dataToUpdate.featuredImage
      })
    } else if (typeof schema === 'string') {
      dataToUpdate.schema = schema
    }

    const article = await prisma.article.update({
      where: { id },
      data: dataToUpdate,
      include: {
        author: true,
        category: true,
        user: true
      }
    })

    return NextResponse.json(article)
  } catch (error) {
    console.error('Error updating article:', error)
    return NextResponse.json(
      { error: 'Failed to update article' },
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
    await prisma.article.delete({
      where: { id }
    })

    return NextResponse.json({ message: 'Article deleted successfully' })
  } catch (error) {
    console.error('Error deleting article:', error)
    return NextResponse.json(
      { error: 'Failed to delete article' },
      { status: 500 }
    )
  }
}
