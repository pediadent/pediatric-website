import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import {
  normalizeRedirectPath,
  sanitizeRedirectTarget
} from '@/lib/redirects'
import { requireAdminAuth } from '@/lib/auth'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await requireAdminAuth(request)
  if ('response' in auth) {
    return auth.response
  }

  try {
    const body = await request.json()
    const { fromPath, toPath, type, isActive } = body

    const existing = await prisma.redirect.findUnique({
      where: { id: params.id }
    })

    if (!existing) {
      return NextResponse.json(
        { error: 'Redirect not found' },
        { status: 404 }
      )
    }

    const normalizedExistingFromPath = normalizeRedirectPath(existing.fromPath)

    const resolvedFromPath =
      typeof fromPath === 'string'
        ? normalizeRedirectPath(fromPath)
        : normalizedExistingFromPath

    const shouldCheckDuplicate =
      typeof fromPath === 'string' || resolvedFromPath !== existing.fromPath

    if (shouldCheckDuplicate) {
      const duplicate = await prisma.redirect.findFirst({
        where: {
          fromPath: resolvedFromPath,
          id: { not: params.id }
        }
      })

      if (duplicate) {
        return NextResponse.json(
          { error: 'Redirect with this from path already exists' },
          { status: 400 }
        )
      }
    }

    const resolvedToPath =
      typeof toPath === 'string'
        ? sanitizeRedirectTarget(toPath)
        : existing.toPath

    const comparisonTarget = (() => {
      try {
        if (/^https?:\/\//i.test(resolvedToPath)) {
          const url = new URL(resolvedToPath)
          return normalizeRedirectPath(url.pathname)
        }
        return normalizeRedirectPath(resolvedToPath)
      } catch {
        return null
      }
    })()

    if (comparisonTarget && resolvedFromPath === comparisonTarget) {
      return NextResponse.json(
        { error: 'Redirect target cannot be the same as the source path.' },
        { status: 400 }
      )
    }

    const resolvedType =
      typeof type === 'string'
        ? type.toUpperCase() === 'TEMPORARY'
          ? 'TEMPORARY'
          : 'PERMANENT'
        : existing.type

    const resolvedActive =
      typeof isActive === 'boolean' ? isActive : existing.isActive

    const redirect = await prisma.redirect.update({
      where: { id: params.id },
      data: {
        fromPath: resolvedFromPath,
        toPath: resolvedToPath,
        type: resolvedType,
        isActive: resolvedActive
      }
    })

    return NextResponse.json(redirect)
  } catch (error) {
    console.error('Error updating redirect:', error)
    return NextResponse.json(
      { error: 'Failed to update redirect' },
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
    await prisma.redirect.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: 'Redirect deleted successfully' })
  } catch (error) {
    console.error('Error deleting redirect:', error)
    return NextResponse.json(
      { error: 'Failed to delete redirect' },
      { status: 500 }
    )
  }
}
