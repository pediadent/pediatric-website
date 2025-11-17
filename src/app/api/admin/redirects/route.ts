import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import {
  normalizeRedirectPath,
  sanitizeRedirectTarget
} from '@/lib/redirects'
import { requireAdminAuth } from '@/lib/auth'

const resolveRedirectType = (value: unknown): 'PERMANENT' | 'TEMPORARY' => {
  if (typeof value !== 'string') {
    return 'PERMANENT'
  }

  const upper = value.toUpperCase()
  return upper === 'TEMPORARY' ? 'TEMPORARY' : 'PERMANENT'
}

const resolveComparisonTarget = (target: string): string | null => {
  try {
    if (/^https?:\/\//i.test(target)) {
      const url = new URL(target)
      return normalizeRedirectPath(url.pathname)
    }

    return normalizeRedirectPath(target)
  } catch {
    return null
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
    const search = searchParams.get('search')

    const skip = (page - 1) * limit
    const where: Record<string, unknown> = {}

    if (search) {
      where.OR = [
        { fromPath: { contains: search, mode: 'insensitive' } },
        { toPath: { contains: search, mode: 'insensitive' } }
      ]
    }

    const [redirects, total] = await Promise.all([
      prisma.redirect.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.redirect.count({ where })
    ])

    return NextResponse.json({
      redirects,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching redirects:', error)
    return NextResponse.json(
      { error: 'Failed to fetch redirects' },
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
    const { fromPath, toPath, type, isActive } = body

    if (typeof fromPath !== 'string' || typeof toPath !== 'string') {
      return NextResponse.json(
        { error: 'Both fromPath and toPath are required.' },
        { status: 400 }
      )
    }

    const sanitizedFromPath = normalizeRedirectPath(fromPath)
    const sanitizedToPath = sanitizeRedirectTarget(toPath)
    const resolvedType = resolveRedirectType(type)
    const isActiveFlag = isActive !== false

    const comparisonTarget = resolveComparisonTarget(sanitizedToPath)

    if (comparisonTarget && sanitizedFromPath === comparisonTarget) {
      return NextResponse.json(
        { error: 'Redirect target cannot be the same as the source path.' },
        { status: 400 }
      )
    }

    const existingRedirect = await prisma.redirect.findUnique({
      where: { fromPath: sanitizedFromPath }
    })

    if (existingRedirect) {
      return NextResponse.json(
        { error: 'Redirect with this from path already exists' },
        { status: 400 }
      )
    }

    const redirect = await prisma.redirect.create({
      data: {
        fromPath: sanitizedFromPath,
        toPath: sanitizedToPath,
        type: resolvedType,
        isActive: isActiveFlag
      }
    })

    return NextResponse.json(redirect, { status: 201 })
  } catch (error) {
    console.error('Error creating redirect:', error)
    return NextResponse.json(
      { error: 'Failed to create redirect' },
      { status: 500 }
    )
  }
}
