import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import {
  markPasswordResetTokenUsed,
  findValidPasswordResetToken
} from '@/lib/passwordReset'
import { prisma } from '@/lib/prisma'
import { SECURITY_CONFIG, validatePasswordStrength } from '@/lib/security'
import { apiRateLimit } from '@/lib/rateLimit'

export async function POST(request: NextRequest) {
  const rateLimitResponse = apiRateLimit(request)
  if (rateLimitResponse) {
    return rateLimitResponse
  }

  try {
    const { token, password } = await request.json()

    if (!token || typeof token !== 'string') {
      return NextResponse.json(
        { error: 'Reset token is required.' },
        { status: 400 }
      )
    }

    if (!password || typeof password !== 'string') {
      return NextResponse.json(
        { error: 'New password is required.' },
        { status: 400 }
      )
    }

    const strength = validatePasswordStrength(password)
    if (!strength.valid) {
      return NextResponse.json(
        { error: strength.errors.join(' ') },
        { status: 400 }
      )
    }

    const tokenRecord = await findValidPasswordResetToken(token)

    if (!tokenRecord) {
      return NextResponse.json(
        { error: 'Reset token is invalid or has expired.' },
        { status: 400 }
      )
    }

    const hashedPassword = await bcrypt.hash(
      password,
      SECURITY_CONFIG.PASSWORD.BCRYPT_ROUNDS
    )

    await prisma.user.update({
      where: { id: tokenRecord.userId },
      data: {
        password: hashedPassword
      }
    })

    await markPasswordResetTokenUsed(tokenRecord.id)

    return NextResponse.json({
      message: 'Password has been reset successfully.'
    })
  } catch (error) {
    console.error('Password reset confirmation failed:', error)
    return NextResponse.json(
      { error: 'Failed to reset password.' },
      { status: 500 }
    )
  }
}
