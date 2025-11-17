import { NextRequest, NextResponse } from 'next/server'
import { requireAdminAuth } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAdminAuth(request)
    if ('response' in auth) {
      return auth.response
    }

    return NextResponse.json({ user: auth.user })
  } catch (error) {
    console.error('Session error:', error)
    return NextResponse.json(
      { error: 'Session validation failed' },
      { status: 401 }
    )
  }
}
