import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { SECURITY_CONFIG } from '@/lib/security'
import { verifyLegacySessionToken, verifySessionToken } from '@/lib/session'

export type AuthenticatedAdmin = {
  id: string
  email: string
  name: string
  role: string
}

type AuthResult =
  | { user: AuthenticatedAdmin }
  | { response: NextResponse }

const buildUnauthorizedResponse = () =>
  NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

export async function requireAdminAuth(
  request: NextRequest
): Promise<AuthResult> {
  const token =
    request.cookies.get(SECURITY_CONFIG.SESSION.COOKIE_NAME)?.value

  if (!token) {
    return { response: buildUnauthorizedResponse() }
  }

  const session =
    verifySessionToken(token, SECURITY_CONFIG.SESSION.MAX_AGE) ??
    verifyLegacySessionToken(token, SECURITY_CONFIG.SESSION.MAX_AGE)

  if (!session) {
    return { response: buildUnauthorizedResponse() }
  }

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: {
      id: true,
      email: true,
      name: true,
      role: true
    }
  })

  if (!user) {
    return { response: buildUnauthorizedResponse() }
  }

  return { user }
}
