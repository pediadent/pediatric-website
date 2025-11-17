import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w ]+/g, '')
    .replace(/ +/g, '-')
    .trim()
}

export function generateExcerpt(content: string, length: number = 160): string {
  // Remove HTML tags and get plain text
  const plainText = content.replace(/<[^>]*>/g, '')

  if (plainText.length <= length) {
    return plainText
  }

  return plainText.substring(0, length).trim() + '...'
}

export function formatDate(date: Date | string): string {
  const d = new Date(date)
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

export function generateMetaTitle(title: string, siteName: string = 'Pediatric Dentist Queens NY'): string {
  if (title.includes(siteName)) {
    return title
  }
  return `${title} | ${siteName}`
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function generateSiteUrl(path: string = ''): string {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://pediatricdentistinqueensny.com'
  return `${baseUrl}${path.startsWith('/') ? path : `/${path}`}`
}