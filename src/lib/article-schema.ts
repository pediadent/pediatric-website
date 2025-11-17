import { generateBlogPostSchema } from '@/lib/schema-generator'

const DEFAULT_SITE_URL = 'https://pediatricdentistinqueensny.com'

const getBaseUrl = () => {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL
  if (!fromEnv) return DEFAULT_SITE_URL
  return fromEnv.endsWith('/') ? fromEnv.slice(0, -1) : fromEnv
}

export interface ArticleSchemaInput {
  title: string
  description?: string | null
  slug: string
  authorName?: string | null
  publishedAt: Date
  updatedAt: Date
  featuredImage?: string | null
}

export function buildArticleSchema(input: ArticleSchemaInput): string {
  const baseUrl = getBaseUrl()
  const articleUrl = `${baseUrl}/${input.slug.replace(/^\/+/, '')}/`

  const schemaObject = generateBlogPostSchema({
    title: input.title,
    description: input.description || '',
    url: articleUrl,
    author: input.authorName || 'Editorial Team',
    datePublished: input.publishedAt.toISOString(),
    dateModified: input.updatedAt.toISOString(),
    image: input.featuredImage || undefined
  })

  return JSON.stringify(schemaObject)
}
