import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdminAuth } from '@/lib/auth'

const buildImageWhereClause = (search: string | null) => {
  if (!search) return {}

  return {
    OR: [
      { filename: { contains: search, mode: 'insensitive' } },
      { originalName: { contains: search, mode: 'insensitive' } },
      { alt: { contains: search, mode: 'insensitive' } },
      { caption: { contains: search, mode: 'insensitive' } }
    ]
  }
}

export async function GET(request: NextRequest) {
  const auth = await requireAdminAuth(request)
  if ('response' in auth) {
    return auth.response
  }

  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    const idsParam = searchParams.get('ids')
    const limit = Math.min(Number(searchParams.get('limit') || 50), 200)

    const where = buildImageWhereClause(search)

    if (idsParam) {
      const ids = idsParam.split(',').map((id) => id.trim()).filter(Boolean)
      if (ids.length > 0) {
        Object.assign(where, { id: { in: ids } })
      }
    }

    const media = await prisma.media.findMany({
      where,
      take: limit,
      orderBy: { updatedAt: 'desc' },
      select: {
        id: true,
        filename: true,
        originalName: true,
        mimeType: true,
        size: true,
        path: true,
        alt: true,
        caption: true,
        createdAt: true,
        updatedAt: true
      }
    })

    return NextResponse.json({ media })
  } catch (error) {
    console.error('Error fetching media for SEO:', error)
    return NextResponse.json(
      { error: 'Failed to fetch media entries.' },
      { status: 500 }
    )
  }
}
