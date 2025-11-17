import { NextRequest } from 'next/server'
import { randomBytes, createHash } from 'crypto'

const CSRF_SECRET = process.env.CSRF_SECRET || 'change-this-in-production'

export function generateCsrfToken(): string {
  const token = randomBytes(32).toString('hex')
  return token
}

export function hashCsrfToken(token: string): string {
  return createHash('sha256')
    .update(`${token}${CSRF_SECRET}`)
    .digest('hex')
}

export function verifyCsrfToken(token: string, hashedToken: string): boolean {
  const expectedHash = hashCsrfToken(token)
  return expectedHash === hashedToken
}

export function getCsrfTokenFromRequest(request: NextRequest): string | null {
  // Check header first
  const headerToken = request.headers.get('x-csrf-token')
  if (headerToken) return headerToken

  // Check body for multipart form data
  return null
}
