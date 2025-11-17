import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { loginRateLimit } from '@/lib/rateLimit'
import { SECURITY_CONFIG } from '@/lib/security'
import { createSessionToken } from '@/lib/session'

export async function POST(request: NextRequest) {
  // Apply rate limiting
  const rateLimitResponse = loginRateLimit(request)
  if (rateLimitResponse) {
    return rateLimitResponse
  }

  try {
    const { email, password } = await request.json()

    // Input validation
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Sanitize email (prevent SQL injection)
    const sanitizedEmail = email.toLowerCase().trim()

    // Add artificial delay to prevent timing attacks
    const delayPromise = new Promise(resolve => setTimeout(resolve, 1000))

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: sanitizedEmail }
    })

    await delayPromise

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password)

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    const sessionToken = createSessionToken(user.id)

    // Create response with session cookie
    const response = NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      },
      message: 'Login successful'
    })

    // Set secure cookie with session token
    response.cookies.set(SECURITY_CONFIG.SESSION.COOKIE_NAME, sessionToken, {
      httpOnly: true, // Prevents XSS attacks
      secure: process.env.NODE_ENV === 'production', // HTTPS only in production
      sameSite: SECURITY_CONFIG.SESSION.SAME_SITE,
      maxAge: SECURITY_CONFIG.SESSION.MAX_AGE / 1000,
      path: SECURITY_CONFIG.SESSION.COOKIE_PATH
    })

    console.log('Login successful for user:', user.email)

    return response
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Login failed' },
      { status: 500 }
    )
  }
}
