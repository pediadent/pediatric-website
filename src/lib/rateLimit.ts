import { NextRequest, NextResponse } from 'next/server'

interface RateLimitStore {
  [key: string]: {
    count: number
    resetTime: number
  }
}

const store: RateLimitStore = {}

// Clean up old entries every hour
setInterval(() => {
  const now = Date.now()
  Object.keys(store).forEach(key => {
    if (store[key].resetTime < now) {
      delete store[key]
    }
  })
}, 3600000)

export interface RateLimitOptions {
  maxRequests: number
  windowMs: number
}

export function rateLimit(options: RateLimitOptions) {
  const { maxRequests, windowMs } = options

  return (request: NextRequest): NextResponse | null => {
    const ip = request.headers.get('x-forwarded-for') ||
               request.headers.get('x-real-ip') ||
               'unknown'

    const key = `${ip}:${request.nextUrl.pathname}`
    const now = Date.now()

    if (!store[key] || store[key].resetTime < now) {
      store[key] = {
        count: 1,
        resetTime: now + windowMs
      }
      return null
    }

    store[key].count++

    if (store[key].count > maxRequests) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        {
          status: 429,
          headers: {
            'Retry-After': Math.ceil((store[key].resetTime - now) / 1000).toString()
          }
        }
      )
    }

    return null
  }
}

// Predefined rate limiters
export const loginRateLimit = rateLimit({
  maxRequests: 5,
  windowMs: 15 * 60 * 1000 // 15 minutes
})

export const apiRateLimit = rateLimit({
  maxRequests: 100,
  windowMs: 60 * 1000 // 1 minute
})

export const uploadRateLimit = rateLimit({
  maxRequests: 10,
  windowMs: 60 * 1000 // 1 minute
})
