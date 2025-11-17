import { NextResponse } from 'next/server'
import { SECURITY_CONFIG } from '@/lib/security'

export async function POST() {
  const response = NextResponse.json({ message: 'Logout successful' })

  // Clear session cookie
  response.cookies.delete(SECURITY_CONFIG.SESSION.COOKIE_NAME, {
    path: SECURITY_CONFIG.SESSION.COOKIE_PATH
  })

  return response
}
