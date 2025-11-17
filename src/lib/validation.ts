import DOMPurify from 'isomorphic-dompurify'

/**
 * Sanitize HTML content to prevent XSS attacks
 */
export function sanitizeHtml(dirty: string): string {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: [
      'p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'ul', 'ol', 'li', 'a', 'img', 'blockquote', 'code', 'pre',
      'table', 'thead', 'tbody', 'tr', 'th', 'td'
    ],
    ALLOWED_ATTR: ['href', 'src', 'alt', 'title', 'class', 'id', 'target', 'rel']
  })
}

/**
 * Sanitize plain text input
 */
export function sanitizeText(text: string): string {
  return text
    .trim()
    .replace(/[<>]/g, '') // Remove HTML tags
    .replace(/[^\w\s\-.,!?@#$%&*()]/gi, '') // Remove special characters except common punctuation
}

/**
 * Validate and sanitize email
 */
export function validateEmail(email: string): { valid: boolean; sanitized: string } {
  const sanitized = email.toLowerCase().trim()
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

  return {
    valid: emailRegex.test(sanitized),
    sanitized
  }
}

/**
 * Validate and sanitize URL
 */
export function validateUrl(url: string): { valid: boolean; sanitized: string } {
  try {
    const sanitized = url.trim()
    const urlObj = new URL(sanitized)

    // Only allow http and https protocols
    if (!['http:', 'https:'].includes(urlObj.protocol)) {
      return { valid: false, sanitized: '' }
    }

    return { valid: true, sanitized }
  } catch {
    return { valid: false, sanitized: '' }
  }
}

/**
 * Validate slug (URL-safe string)
 */
export function validateSlug(slug: string): { valid: boolean; sanitized: string } {
  const sanitized = slug
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')

  const valid = /^[a-z0-9-]+$/.test(sanitized) && sanitized.length > 0

  return { valid, sanitized }
}

/**
 * Validate phone number
 */
export function validatePhone(phone: string): { valid: boolean; sanitized: string } {
  const sanitized = phone.replace(/[^\d\s\-+()]/g, '').trim()
  const phoneRegex = /^[\d\s\-+()]{7,20}$/

  return {
    valid: phoneRegex.test(sanitized),
    sanitized
  }
}

/**
 * Validate and parse JSON safely
 */
export function parseJsonSafely<T = any>(json: string): { valid: boolean; data: T | null } {
  try {
    const data = JSON.parse(json)
    return { valid: true, data }
  } catch {
    return { valid: false, data: null }
  }
}

/**
 * Sanitize filename to prevent directory traversal
 */
export function sanitizeFilename(filename: string): string {
  return filename
    .replace(/\.\./g, '') // Remove .. to prevent directory traversal
    .replace(/[^a-zA-Z0-9._-]/g, '_') // Replace unsafe characters
    .slice(0, 255) // Limit length
}

/**
 * Validate file type
 */
export function validateFileType(
  mimeType: string,
  allowedTypes: string[]
): boolean {
  return allowedTypes.includes(mimeType)
}

/**
 * Validate file size
 */
export function validateFileSize(size: number, maxSize: number): boolean {
  return size > 0 && size <= maxSize
}
