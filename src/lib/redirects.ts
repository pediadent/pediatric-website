export const normalizeRedirectPath = (input: unknown): string => {
  if (typeof input !== 'string') {
    return '/'
  }

  let path = input.trim()

  if (!path.startsWith('/')) {
    path = `/${path}`
  }

  const [cleanPath] = path.split(/[?#]/)
  path = cleanPath.replace(/\/{2,}/g, '/')

  if (path.length > 1 && path.endsWith('/')) {
    path = path.slice(0, -1)
  }

  if (!path) {
    return '/'
  }

  return path.toLowerCase()
}

export const sanitizeRedirectTarget = (input: unknown): string => {
  if (typeof input !== 'string') {
    return '/'
  }

  const trimmed = input.trim()
  if (!trimmed) {
    return '/'
  }

  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed
  }

  const normalized = trimmed.startsWith('/') ? trimmed : `/${trimmed}`

  return normalized.replace(/\/{2,}/g, '/')
}

export const buildRedirectLookupPaths = (input: string): string[] => {
  const normalized = normalizeRedirectPath(input)
  const variants = new Set<string>([normalized])

  if (normalized !== '/' && normalized.endsWith('/')) {
    variants.add(normalized.slice(0, -1))
  } else if (normalized !== '/') {
    variants.add(`${normalized}/`)
  }

  return Array.from(variants)
}
