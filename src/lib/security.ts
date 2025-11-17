/**
 * Security Configuration
 * Central place for all security-related settings
 */

export const SECURITY_CONFIG = {
  // Session Configuration
  SESSION: {
    MAX_AGE: 7 * 24 * 60 * 60 * 1000, // 7 days
    COOKIE_NAME: 'admin_session',
    COOKIE_PATH: '/',
    SAME_SITE: 'strict' as const,
    SECRET:
      process.env.ADMIN_SESSION_SECRET ||
      process.env.NEXTAUTH_SECRET ||
      'development-session-secret-change-me'
  },

  // Password Policy
  PASSWORD: {
    MIN_LENGTH: 8,
    REQUIRE_UPPERCASE: true,
    REQUIRE_LOWERCASE: true,
    REQUIRE_NUMBER: true,
    REQUIRE_SPECIAL: false,
    BCRYPT_ROUNDS: 12, // Increased from 10 for better security
  },

  PASSWORD_RESET: {
    TOKEN_EXPIRATION_MS: 60 * 60 * 1000, // 1 hour
  },

  // Rate Limiting
  RATE_LIMIT: {
    LOGIN: {
      MAX_REQUESTS: 5,
      WINDOW_MS: 15 * 60 * 1000, // 15 minutes
    },
    API: {
      MAX_REQUESTS: 100,
      WINDOW_MS: 60 * 1000, // 1 minute
    },
    UPLOAD: {
      MAX_REQUESTS: 10,
      WINDOW_MS: 60 * 1000, // 1 minute
    },
  },

  // File Upload
  UPLOAD: {
    MAX_SIZE: 10 * 1024 * 1024, // 10MB
    ALLOWED_IMAGE_TYPES: [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'image/webp',
    ],
    ALLOWED_EXTENSIONS: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
  },

  // Content Security
  CONTENT: {
    MAX_TITLE_LENGTH: 200,
    MAX_DESCRIPTION_LENGTH: 500,
    MAX_CONTENT_LENGTH: 100000, // 100KB
    MAX_SLUG_LENGTH: 100,
  },

  // CORS
  CORS: {
    ALLOWED_ORIGINS: process.env.ALLOWED_ORIGINS?.split(',') || [],
    ALLOWED_METHODS: ['GET', 'POST', 'PUT', 'DELETE'],
    ALLOWED_HEADERS: ['Content-Type', 'Authorization'],
  },
}

/**
 * Validate password strength
 */
export function validatePasswordStrength(password: string): {
  valid: boolean
  errors: string[]
} {
  const errors: string[] = []
  const { PASSWORD } = SECURITY_CONFIG

  if (password.length < PASSWORD.MIN_LENGTH) {
    errors.push(`Password must be at least ${PASSWORD.MIN_LENGTH} characters long`)
  }

  if (PASSWORD.REQUIRE_UPPERCASE && !/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter')
  }

  if (PASSWORD.REQUIRE_LOWERCASE && !/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter')
  }

  if (PASSWORD.REQUIRE_NUMBER && !/\d/.test(password)) {
    errors.push('Password must contain at least one number')
  }

  if (PASSWORD.REQUIRE_SPECIAL && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password must contain at least one special character')
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}

/**
 * Check if request is from allowed origin
 */
export function isAllowedOrigin(origin: string | null): boolean {
  if (!origin) return true // Same-origin requests

  const { ALLOWED_ORIGINS } = SECURITY_CONFIG.CORS

  if (ALLOWED_ORIGINS.length === 0) return true // No restrictions set

  return ALLOWED_ORIGINS.includes(origin) || ALLOWED_ORIGINS.includes('*')
}

/**
 * Generate secure random token
 */
export function generateSecureToken(length: number = 32): string {
  if (typeof globalThis?.crypto?.getRandomValues === 'function') {
    const bytes = new Uint8Array(length)
    globalThis.crypto.getRandomValues(bytes)
    return Array.from(bytes)
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('')
  }

  // Fallback for Node.js environments
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { randomBytes } = require('crypto')
  return randomBytes(length).toString('hex')
}
