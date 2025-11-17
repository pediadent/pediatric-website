import { createHmac, randomBytes, timingSafeEqual } from 'crypto'
import { SECURITY_CONFIG } from '@/lib/security'
import { SESSION_TOKEN_VERSION } from '@/lib/session-constants'

type SessionPayload = {
  userId: string
  issuedAt: number
  nonce: string
}

const SECRET = (() => {
  const secret =
    SECURITY_CONFIG.SESSION.SECRET ||
    process.env.NEXTAUTH_SECRET ||
    ''

  if (!secret) {
    throw new Error(
      'Admin session secret is not configured. Set ADMIN_SESSION_SECRET or NEXTAUTH_SECRET.'
    )
  }

  return secret
})()

const SECRET_BUFFER = Buffer.from(SECRET, 'utf8')

const encodeBase64Url = (input: Buffer | string) =>
  Buffer.from(input)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')

const decodeBase64Url = (input: string) => {
  const padLength = 4 - (input.length % 4 || 4)
  const padded = input.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat(padLength % 4)
  return Buffer.from(padded, 'base64')
}

export function createSessionToken(userId: string): string {
  const payload: SessionPayload = {
    userId,
    issuedAt: Date.now(),
    nonce: randomBytes(16).toString('hex')
  }

  const payloadJson = JSON.stringify({
    ...payload,
    v: SESSION_TOKEN_VERSION
  })

  const payloadEncoded = encodeBase64Url(payloadJson)
  const signature = createHmac('sha256', SECRET_BUFFER)
    .update(payloadEncoded)
    .digest()
  const signatureEncoded = encodeBase64Url(signature)

  return `${payloadEncoded}.${signatureEncoded}`
}

export function verifySessionToken(
  token: string,
  maxAge: number
): SessionPayload | null {
  if (!token || typeof token !== 'string') {
    return null
  }

  const parts = token.split('.')
  if (parts.length !== 2) {
    return null
  }

  const [payloadEncoded, signatureEncoded] = parts

  try {
    const expectedSignature = createHmac('sha256', SECRET_BUFFER)
      .update(payloadEncoded)
      .digest()
    const providedSignature = decodeBase64Url(signatureEncoded)

    if (
      expectedSignature.length !== providedSignature.length ||
      !timingSafeEqual(expectedSignature, providedSignature)
    ) {
      return null
    }

    const payloadJson = decodeBase64Url(payloadEncoded).toString('utf8')
    const parsed = JSON.parse(payloadJson) as SessionPayload & { v?: string }

    if (parsed.v !== SESSION_TOKEN_VERSION) {
      return null
    }

    if (
      !parsed.userId ||
      typeof parsed.userId !== 'string' ||
      typeof parsed.issuedAt !== 'number' ||
      typeof parsed.nonce !== 'string'
    ) {
      return null
    }

    if (Date.now() - parsed.issuedAt > maxAge) {
      return null
    }

    return {
      userId: parsed.userId,
      issuedAt: parsed.issuedAt,
      nonce: parsed.nonce
    }
  } catch (error) {
    console.error('Session token verification failed:', error)
    return null
  }
}

export function verifyLegacySessionToken(
  token: string,
  maxAge: number
): SessionPayload | null {
  try {
    const decoded = Buffer.from(token, 'base64').toString('utf8')
    const [userId, issuedAtRaw] = decoded.split(':')
    const issuedAt = Number.parseInt(issuedAtRaw ?? '', 10)

    if (!userId || Number.isNaN(issuedAt)) {
      return null
    }

    if (Date.now() - issuedAt > maxAge) {
      return null
    }

    return {
      userId,
      issuedAt,
      nonce: 'legacy'
    }
  } catch (error) {
    console.error('Legacy session token verification failed:', error)
    return null
  }
}
