import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdminAuth } from '@/lib/auth'

type ImageUpdatePayload = {
  alt?: string | null
  caption?: string | null
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
    const { id } = params
    if (!id) {
      return NextResponse.json(
        { error: 'Image id is required.' },
        { status: 400 }
      )
    }

    const body = (await request.json()) as ImageUpdatePayload
    const data: ImageUpdatePayload = {}

    if ('alt' in body) {
      data.alt = body.alt ?? null
    }

    if ('caption' in body) {
      data.caption = body.caption ?? null
    }

    const updated = await prisma.media.update({
      where: { id },
      data
    })

    return NextResponse.json({ media: updated })
  } catch (error) {
    console.error('Error updating media entry:', error)
    return NextResponse.json(
      { error: 'Failed to update media entry.' },
      { status: 500 }
    )
  }
}
