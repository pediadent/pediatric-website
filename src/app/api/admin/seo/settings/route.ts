import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdminAuth } from '@/lib/auth'

const ALLOWED_FIELDS = new Set([
  'title',
  'description',
  'ogTitle',
  'ogDescription',
  'ogImage',
  'twitterTitle',
  'twitterDescription',
  'twitterImage',
  'schema',
  'canonical',
  'robots'
])

type SeoSettingPayload = {
  path: string
  title?: string | null
  description?: string | null
  ogTitle?: string | null
  ogDescription?: string | null
  ogImage?: string | null
  twitterTitle?: string | null
  twitterDescription?: string | null
  twitterImage?: string | null
  schema?: string | null
  canonical?: string | null
  robots?: string | null
}

const sanitizePath = (path: string) => {
  const trimmed = path.trim()
  if (!trimmed.startsWith('/')) {
    return `/${trimmed}`
  }
  return trimmed.replace(/\/{2,}/g, '/')
}

export async function GET(request: NextRequest) {
  const auth = await requireAdminAuth(request)
  if ('response' in auth) {
    return auth.response
  }

  try {
    const { searchParams } = new URL(request.url)
    const path = searchParams.get('path')

    if (path) {
      const setting = await prisma.seoSettings.findUnique({
        where: { path: sanitizePath(path) }
      })

      if (!setting) {
        return NextResponse.json({ setting: null }, { status: 404 })
      }

      return NextResponse.json({ setting })
    }

    const settings = await prisma.seoSettings.findMany({
      orderBy: { updatedAt: 'desc' }
    })

    return NextResponse.json({ settings })
  } catch (error) {
    console.error('Error fetching SEO settings:', error)
    return NextResponse.json(
      { error: 'Failed to fetch SEO settings.' },
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
    const payloads: SeoSettingPayload[] = Array.isArray(body)
      ? body
      : [body]

    const results = []

    for (const payload of payloads) {
      if (!payload?.path || typeof payload.path !== 'string') {
        return NextResponse.json(
          { error: 'Each SEO setting must include a valid path.' },
          { status: 400 }
        )
      }

      const normalizedPath = sanitizePath(payload.path)
      const data: Record<string, string | null> = {}

      for (const [key, value] of Object.entries(payload)) {
        if (key === 'path') continue
        if (ALLOWED_FIELDS.has(key)) {
          data[key] = value !== undefined ? value : null
        }
      }

      const result = await prisma.seoSettings.upsert({
        where: { path: normalizedPath },
        update: data,
        create: {
          path: normalizedPath,
          ...data
        }
      })

      results.push(result)
    }

    return NextResponse.json({ settings: results })
  } catch (error) {
    console.error('Error saving SEO settings:', error)
    return NextResponse.json(
      { error: 'Failed to save SEO settings.' },
      { status: 500 }
    )
  }
}
