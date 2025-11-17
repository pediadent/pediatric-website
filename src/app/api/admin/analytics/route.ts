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

export async function GET(request: NextRequest) {
  const auth = await requireAdminAuth(request)
  if ('response' in auth) {
    return auth.response
  }

  try {
    const snippets = await prisma.analyticsSnippet.findMany({
      orderBy: { updatedAt: 'desc' }
    })

    return NextResponse.json({ snippets })
  } catch (error) {
    console.error('Error fetching analytics snippets:', error)
    return NextResponse.json(
      { error: 'Failed to load analytics snippets.' },
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

    const snippet = await prisma.analyticsSnippet.create({
      data: {
        name,
        code,
        description: description || null,
        provider,
        isEnabled
      }
    })

    return NextResponse.json({ snippet }, { status: 201 })
  } catch (error) {
    console.error('Error creating analytics snippet:', error)
    return NextResponse.json(
      { error: 'Failed to create analytics snippet.' },
      { status: 500 }
    )
  }
}
