import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import {
  buildRedirectLookupPaths,
  normalizeRedirectPath
} from '@/lib/redirects'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const path = searchParams.get('path')

    if (!path) {
      return NextResponse.json(
        { redirect: null, error: 'Path is required.' },
        { status: 400 }
      )
    }

    const variantSet = new Set(
      buildRedirectLookupPaths(path).map(normalizeRedirectPath)
    )
    const variants = Array.from(variantSet)
    const rawPath = path.trim()

    if (rawPath && !variants.includes(rawPath)) {
      variants.push(rawPath)
    }

    const redirect = await prisma.redirect.findFirst({
      where: {
        isActive: true,
        fromPath: {
          in: variants
        }
      },
      orderBy: {
        updatedAt: 'desc'
      }
    })

    if (!redirect) {
      return NextResponse.json(
        { redirect: null },
        { status: 404 }
      )
    }

    return NextResponse.json({ redirect })
  } catch (error) {
    console.error('Redirect lookup error:', error)
    return NextResponse.json(
      { redirect: null, error: 'Lookup failed.' },
      { status: 500 }
    )
  }
}
