import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { apiRateLimit } from '@/lib/rateLimit'
import { createPasswordResetToken } from '@/lib/passwordReset'

export async function POST(request: NextRequest) {
  const rateLimitResponse = apiRateLimit(request)
  if (rateLimitResponse) {
    return rateLimitResponse
  }

  try {
    const { email } = await request.json()

    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    const normalizedEmail = email.trim().toLowerCase()
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      select: { id: true, email: true }
    })

    if (!user) {
      return NextResponse.json({
        message: 'If an account exists, password reset instructions have been sent.'
      })
    }

    const { token } = await createPasswordResetToken(user.id)

    console.info(
      `Password reset token generated for ${user.email}. Token (development use only): ${token}`
    )

    return NextResponse.json({
      message: 'Password reset instructions generated.',
      resetToken: process.env.NODE_ENV === 'production' ? undefined : token
    })
  } catch (error) {
    console.error('Password reset request failed:', error)
    return NextResponse.json(
      { error: 'Failed to process password reset request.' },
      { status: 500 }
    )
  }
}
