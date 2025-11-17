import { NextRequest, NextResponse } from 'next/server'
import { AnalyticsProvider } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { requireAdminAuth } from '@/lib/auth'

const PROVIDER_VALUES = new Set<AnalyticsProvider>([
  'GOOGLE_ANALYTICS',
  'GOOGLE_TAG_MANAGER',
  'SEARCH_CONSOLE',
  'FACEBOOK_PIXEL',
  'LINKEDIN_INSIGHT',
  'TIKTOK_PIXEL',
  'OTHER'
])

const normalizeProvider = (value: unknown): AnalyticsProvider => {
  if (typeof value !== 'string') {
    return 'OTHER'
  }

  const normalized = value.trim().toUpperCase()
  if (PROVIDER_VALUES.has(normalized as AnalyticsProvider)) {
    return normalized as AnalyticsProvider
  }

  return 'OTHER'
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
    const id = params?.id?.trim()
    if (!id) {
      return NextResponse.json(
        { error: 'Analytics snippet id is required.' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const name = typeof body?.name === 'string' ? body.name.trim() : ''
    const code = typeof body?.code === 'string' ? body.code.trim() : ''
    const description =
      typeof body?.description === 'string' ? body.description.trim() : ''
    const provider = normalizeProvider(body?.provider)
    const isEnabled = typeof body?.isEnabled === 'boolean' ? body.isEnabled : true

    if (!name) {
      return NextResponse.json(
        { error: 'Name is required.' },
        { status: 400 }
      )
    }

    if (!code) {
      return NextResponse.json(
        { error: 'Tracking code is required.' },
        { status: 400 }
      )
    }

    const snippet = await prisma.analyticsSnippet.update({
      where: { id },
      data: {
        name,
        code,
        description: description || null,
        provider,
        isEnabled
      }
    })

    return NextResponse.json({ snippet })
  } catch (error) {
    console.error('Error updating analytics snippet:', error)
    return NextResponse.json(
      { error: 'Failed to update analytics snippet.' },
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
    const id = params?.id?.trim()
    if (!id) {
      return NextResponse.json(
        { error: 'Analytics snippet id is required.' },
        { status: 400 }
      )
    }

    await prisma.analyticsSnippet.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting analytics snippet:', error)
    return NextResponse.json(
      { error: 'Failed to delete analytics snippet.' },
      { status: 500 }
    )
  }
}
