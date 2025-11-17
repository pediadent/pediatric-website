/**
 * Comprehensive Article Import Script
 *
 * This script imports all articles from the live website across different categories:
 * - Oral Health Tips (Blog)
 * - News
 * - Reviews
 * - Salary Information
 * - Accessories
 * - Baby and Child Health
 * - Charts
 * - Info
 *
 * Usage:
 * 1. Set environment variable: LIVE_SITE_URL=https://pediatricdentistinqueensny.com
 * 2. Run: npx tsx scripts/import-articles.ts
 * 3. Optional flags:
 *    --category=<category>  - Import only specific category
 *    --dry-run             - Preview without importing
 *    --limit=<number>      - Limit number of articles per category
 */

import { PrismaClient, ContentStatus, ContentType } from '@prisma/client'
import * as cheerio from 'cheerio'
import sharp from 'sharp'
import { mkdir, writeFile } from 'fs/promises'
import { existsSync } from 'fs'
import { join } from 'path'

const prisma = new PrismaClient()

interface ArticleData {
  title: string
  slug: string
  content: string
  excerpt: string | null
  category: string
  author: string | null
  publishedAt: Date
  featuredImage: string | null
  seoTitle: string | null
  seoDescription: string | null
  isPublished: boolean
  faqs: Array<{ question: string; answer: string[] }>
  faqHeading: string | null
}

interface ReviewData {
  title: string
  slug: string
  content: string
  excerpt: string | null
  category: string
  author: string | null
  publishedAt: Date
  featuredImage: string | null
  seoTitle: string | null
  seoDescription: string | null
  rating: number | null
  pros: string[]
  cons: string[]
  affiliateLinks: Array<{ title: string; url: string; price?: string }>
  faqs: Array<{ question: string; answer: string[] }>
  faqHeading: string | null
}

const LIVE_SITE_URL = process.env.LIVE_SITE_URL || 'https://pediatricdentistinqueensny.com'
const SITE_BASE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') ||
  process.env.SITE_URL?.replace(/\/$/, '') ||
  'https://pediatricdentistinqueensny.com'

const CATEGORIES: Array<{
  name: string
  slug: string
  path: string
  type: ImportContentType
}> = [
  { name: 'Oral Health Tips', slug: 'oral-health-tips', path: '/oral-health-tips/', type: 'article' },
  { name: 'News', slug: 'news', path: '/news/', type: 'article' },
  { name: 'Reviews', slug: 'reviews', path: '/reviews/', type: 'review' },
  { name: 'Salary', slug: 'salary', path: '/salary/', type: 'article' },
  { name: 'Accessories', slug: 'accessories', path: '/category/accessories/', type: 'article' },
  { name: 'Baby and Child Health', slug: 'baby-and-child-health', path: '/category/baby-and-child-health/', type: 'article' },
  { name: 'Charts', slug: 'charts', path: '/category/charts/', type: 'article' },
  { name: 'Info', slug: 'info', path: '/category/info/', type: 'article' },
]

const UPLOAD_ROOT = join(process.cwd(), 'public', 'uploads')
const ARTICLE_UPLOAD_DIR = join(UPLOAD_ROOT, 'articles')
const REVIEW_UPLOAD_DIR = join(UPLOAD_ROOT, 'reviews')
const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
const FALLBACK_AUTHOR_NAME = 'Editorial Team'
const FALLBACK_AUTHOR_SLUG = 'editorial-team'

const categoryNameMap = new Map(CATEGORIES.map((category) => [category.slug, category.name]))
const categoryIdCache = new Map<string, string>()
const authorIdCache = new Map<string, string>()
let cachedUserId: string | null = null

interface SavedImageInfo {
  path: string
  filename: string
  alt: string
}

interface MediaRecordInput {
  filename: string
  originalName: string
  mimeType: string
  size: number
  path: string
  alt: string
}

type ImportContentType = 'article' | 'review'

interface SaveImageParams {
  src: string
  altText?: string | null
  articleSlug: string
  label: string
  contentType?: ImportContentType
}

const imageCache = new Map<string, SavedImageInfo>()
const TABLE_OF_CONTENTS_SELECTORS = [
  '.ez-toc-container',
  '.ez-toc',
  '[class*="ez-toc"]',
  '.toc',
  '.toc-container',
  '.toc_widget',
  '#toc_container',
  '[id*="ez-toc"]',
  '[data-ez-toc-container]'
]

const AUTHOR_BOX_SELECTORS = [
  '.simple-author-box',
  '.author-box',
  '.authorbox',
  '.author-bio',
  '.author-info',
  '.author-profile-card',
  '.saboxplugin-wrap',
  '.wp-block-author-profile',
  '.entry-author-info',
  '.author-wrapper'
]

const SHARE_WIDGET_SELECTORS = [
  '.sharedaddy',
  '.jp-sharing-container',
  '.sharethis-inline-share-buttons',
  '.addtoany_share_save_container',
  '.addtoany_content',
  '.shared-post',
  '.share-icons',
  '.social-share',
  '.sow-social-media-button',
  '.wp-block-social-links',
  '.a2a_kit',
  '.blog-share'
]

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 120)
}

function slugifyForFilename(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 120) || 'image'
}

function resolveImageUrl(src: string | null | undefined): string | null {
  if (!src) return null
  const trimmed = src.trim()
  if (!trimmed) return null
  if (trimmed.startsWith('//')) {
    return `https:${trimmed}`
  }
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed
  }
  if (trimmed.startsWith('/')) {
    return `${LIVE_SITE_URL}${trimmed}`
  }
  try {
    return new URL(trimmed, LIVE_SITE_URL).href
  } catch {
    return null
  }
}

async function ensureDirectory(directoryPath: string) {
  if (!existsSync(directoryPath)) {
    await mkdir(directoryPath, { recursive: true })
  }
}

function guessExtension(mimeType: string): string {
  if (mimeType.includes('png')) return 'png'
  if (mimeType.includes('webp')) return 'webp'
  if (mimeType.includes('gif')) return 'gif'
  if (mimeType.includes('svg')) return 'svg'
  return 'jpg'
}

function buildAltText(rawAlt: string | null | undefined, fallback: string): string {
  const trimmed = rawAlt?.trim()
  if (trimmed && trimmed.length > 0) {
    return trimmed
  }
  const cleaned = fallback.replace(/[-_]+/g, ' ').replace(/\s+/g, ' ').trim()
  return cleaned || 'Article image'
}

function humanizeSlug(slug: string): string {
  if (categoryNameMap.has(slug)) {
    return categoryNameMap.get(slug)!
  }
  return slug
    .split(/[-_]+/)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(' ')
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (char) => {
    switch (char) {
      case '&':
        return '&amp;'
      case '<':
        return '&lt;'
      case '>':
        return '&gt;'
      case '"':
        return '&quot;'
      case "'":
        return '&#39;'
      default:
        return char
    }
  })
}

async function resolveCategoryId(categorySlug: string): Promise<string> {
  const normalizedSlug = categorySlug || 'uncategorized'
  if (categoryIdCache.has(normalizedSlug)) {
    return categoryIdCache.get(normalizedSlug)!
  }

  const existing = await prisma.category.findUnique({
    where: { slug: normalizedSlug }
  })

  if (existing) {
    categoryIdCache.set(normalizedSlug, existing.id)
    return existing.id
  }

  const name = humanizeSlug(normalizedSlug)
  const record = await prisma.category.create({
    data: {
      slug: normalizedSlug,
      name,
      description: `Articles imported from live site for ${name}.`,
      seoTitle: name,
      seoDescription: `Latest resources covering ${name}.`,
      featuredImage: null,
      isNoIndex: false,
      isNoFollow: false,
      schema: null
    }
  })

  categoryIdCache.set(normalizedSlug, record.id)
  return record.id
}

async function resolveAuthorId(authorName: string | null): Promise<string> {
  const name = (authorName && authorName.trim().length > 0) ? authorName.trim() : FALLBACK_AUTHOR_NAME
  const baseSlug = slugify(name) || FALLBACK_AUTHOR_SLUG
  const slug = baseSlug.substring(0, 60) || FALLBACK_AUTHOR_SLUG

  if (authorIdCache.has(slug)) {
    return authorIdCache.get(slug)!
  }

  const existing = await prisma.author.findUnique({
    where: { slug }
  })

  if (existing) {
    authorIdCache.set(slug, existing.id)
    return existing.id
  }

  const created = await prisma.author.create({
    data: {
      slug,
      name,
      bio: null,
      email: null,
      website: null,
      avatar: null,
      seoTitle: name,
      seoDescription: `Articles written by ${name}.`,
      featuredImage: null,
      isNoIndex: false,
      isNoFollow: false,
      schema: null
    }
  })

  authorIdCache.set(slug, created.id)
  return created.id
}

async function resolveUserId(): Promise<string> {
  if (cachedUserId) return cachedUserId

  const user = await prisma.user.findFirst({
    orderBy: { createdAt: 'asc' }
  })

  if (!user) {
    throw new Error('No CMS user found. Please create at least one user before running the import.')
  }

  cachedUserId = user.id
  return cachedUserId
}

async function recordMediaAsset({
  filename,
  originalName,
  mimeType,
  size,
  path,
  alt
}: MediaRecordInput) {
  try {
    const existing = await prisma.media.findFirst({ where: { path } })
    if (existing) {
      await prisma.media.update({
        where: { id: existing.id },
        data: { alt }
      })
      return
    }

    await prisma.media.create({
      data: {
        filename,
        originalName,
        mimeType,
        size,
        path,
        alt,
        caption: alt
      }
    })
  } catch (error) {
    console.warn('    Failed to persist media metadata:', error)
  }
}

async function downloadAndStoreImage({
  src,
  altText,
  articleSlug,
  label,
  contentType = 'article'
}: SaveImageParams): Promise<SavedImageInfo | null> {
  if (!src) return null
  const trimmedSrc = src.trim()
  if (!trimmedSrc) return null

  let buffer: Buffer | null = null
  let mimeType = 'image/jpeg'
  let resolvedUrl: string | null = null
  let originalName = `${slugifyForFilename(label)}.jpg`
  const normalizedAlt = buildAltText(altText, label)

  if (trimmedSrc.startsWith('data:')) {
    const match = trimmedSrc.match(/^data:(image\/[a-zA-Z0-9+.\-]+);base64,(.+)$/)
    if (!match) {
      console.warn('    Skipping inline image with unsupported data URI format')
      return null
    }
    mimeType = match[1]
    buffer = Buffer.from(match[2], 'base64')
    originalName = `${slugifyForFilename(label)}.${guessExtension(mimeType)}`
  } else {
    resolvedUrl = resolveImageUrl(trimmedSrc)
    if (!resolvedUrl) return null

    const cacheKey = `${contentType}:${resolvedUrl}`
    if (imageCache.has(cacheKey)) {
      const cached = imageCache.get(cacheKey)!
      return { ...cached, alt: normalizedAlt }
    }

    try {
      const response = await fetch(resolvedUrl, {
        headers: { 'User-Agent': USER_AGENT }
      })

      if (!response.ok) {
        console.warn(`    Failed to download image ${resolvedUrl}: HTTP ${response.status}`)
        return null
      }

      const arrayBuffer = await response.arrayBuffer()
      buffer = Buffer.from(arrayBuffer)
      mimeType = response.headers.get('content-type') || mimeType
      try {
        originalName = decodeURIComponent(
          new URL(resolvedUrl).pathname.split('/').pop() || originalName
        )
      } catch {
        originalName = `${slugifyForFilename(label)}.${guessExtension(mimeType)}`
      }
    } catch (error) {
      console.warn(`    Error downloading image ${resolvedUrl}:`, error)
      return null
    }
  }

  if (!buffer) return null

  await ensureDirectory(UPLOAD_ROOT)
  const baseUploadDir = contentType === 'review' ? REVIEW_UPLOAD_DIR : ARTICLE_UPLOAD_DIR
  await ensureDirectory(baseUploadDir)
  const safeSlug = slugifyForFilename(articleSlug || 'article')
  const articleDir = join(baseUploadDir, safeSlug)
  await ensureDirectory(articleDir)

  const baseName = slugifyForFilename(`${safeSlug}-${label}`)
  let extension = 'jpg'
  let processedBuffer = buffer

  try {
    processedBuffer = await sharp(buffer)
      .resize(1920, 1080, {
        fit: 'inside',
        withoutEnlargement: true
      })
      .jpeg({
        quality: 85,
        progressive: true
      })
      .toBuffer()
    extension = 'jpg'
    mimeType = 'image/jpeg'
  } catch (error) {
    console.warn('    Unable to optimize image, using original buffer:', error)
    processedBuffer = buffer
    extension = guessExtension(mimeType)
  }

  let filename = `${baseName}.${extension}`
  let targetPath = join(articleDir, filename)
  let counter = 1
  while (existsSync(targetPath)) {
    filename = `${baseName}-${counter}.${extension}`
    targetPath = join(articleDir, filename)
    counter++
  }

  await writeFile(targetPath, processedBuffer)
  const relativePathBase = contentType === 'review' ? '/uploads/reviews' : '/uploads/articles'
  const relativePath = `${relativePathBase}/${safeSlug}/${filename}`

  await recordMediaAsset({
    filename,
    originalName,
    mimeType,
    size: processedBuffer.length,
    path: relativePath,
    alt: normalizedAlt
  })

  const saved: SavedImageInfo = { path: relativePath, filename, alt: normalizedAlt }
  if (resolvedUrl) {
    const cacheKey = `${contentType}:${resolvedUrl}`
    imageCache.set(cacheKey, saved)
  }

  return saved
}

interface ProcessedContentResult {
  html: string
  faqs: Array<{ question: string; answer: string[] }>
  faqHeading: string | null
}

async function processArticleContent(
  html: string,
  articleSlug: string,
  articleTitle: string,
  contentType: ImportContentType = 'article'
): Promise<ProcessedContentResult> {
  if (!html) {
    return {
      html,
      faqs: [],
      faqHeading: null
    }
  }

  const wrapperId = 'article-import-root'
  const $ = cheerio.load(`<div id="${wrapperId}">${html}</div>`, {
    decodeEntities: false
  })

  sanitizeImportedContent($, wrapperId)
  const { faqs, heading } = extractFaqsFromDom($, wrapperId)
  await rewriteImagesInContent($, wrapperId, articleSlug, articleTitle, contentType)
  if (contentType === 'review') {
    enhanceReviewContent($, wrapperId)
  }

  return {
    html: $(`#${wrapperId}`).html() || html,
    faqs,
    faqHeading: heading
  }
}

function sanitizeImportedContent($: cheerio.CheerioAPI, wrapperId: string) {
  const container = $(`#${wrapperId}`)
  if (!container.length) return

  const selectorsToRemove = [
    ...TABLE_OF_CONTENTS_SELECTORS,
    ...AUTHOR_BOX_SELECTORS,
    ...SHARE_WIDGET_SELECTORS
  ]

  selectorsToRemove.forEach((selector) => {
    container.find(selector).remove()
  })

  container.find('h1, h2, h3, h4, h5, h6, p, strong').each((_, element) => {
    const text = $(element).text().trim().toLowerCase()
    if (!text) return

    if (text === 'table of contents') {
      const block = $(element).closest('div').length ? $(element).closest('div') : $(element)
      block.remove()
      return
    }

    if (text.startsWith('share this')) {
      const block = $(element).closest('div').length ? $(element).closest('div') : $(element)
      const nextList = block.next()
      if (nextList.is('ul') || nextList.is('ol')) {
        nextList.remove()
      }
      block.remove()
      return
    }

    if (text === 'related') {
      const block = $(element).closest('div').length ? $(element).closest('div') : $(element)
      const nextList = block.next()
      block.remove()
      if (nextList.is('ul') || nextList.is('ol')) {
        nextList.remove()
      }
    }
  })
}

async function rewriteImagesInContent(
  $: cheerio.CheerioAPI,
  wrapperId: string,
  articleSlug: string,
  articleTitle: string,
  contentType: ImportContentType
) {
  const images = $(`#${wrapperId} img`).toArray()

  for (const [index, node] of images.entries()) {
    const img = $(node)
    const actualSrc =
      img.attr('data-src') ||
      img.attr('data-lazy-src') ||
      img.attr('data-original') ||
      img.attr('data-medium-file') ||
      img.attr('data-large-file') ||
      (img.attr('srcset')?.split(',').map((entry) => entry.trim().split(/\s+/)[0]).find(Boolean) ?? null) ||
      img.attr('src')

    if (!actualSrc) continue

    const alt = buildAltText(
      img.attr('alt') || img.attr('title'),
      `${articleTitle} image ${index + 1}`
    )

    const saved = await downloadAndStoreImage({
      src: actualSrc,
      altText: alt,
      articleSlug,
      label: `body-${index + 1}`,
      contentType
    })

    if (saved) {
      img.attr('src', saved.path)
      img.attr('alt', saved.alt)
      img.removeAttr('srcset')
      img.removeAttr('data-src')
      img.removeAttr('data-lazy-src')
      img.removeAttr('data-original')
    }
  }
}

function extractFaqsFromDom(
  $: cheerio.CheerioAPI,
  wrapperId: string
): { faqs: Array<{ question: string; answer: string[] }>; heading: string | null } {
  const container = $(`#${wrapperId}`)
  const faqs: Array<{ question: string; answer: string[] }> = []
  const seenQuestions = new Set<string>()
  let faqHeading: string | null = null

  const isFaqHeading = (text?: string | null) => {
    if (!text) return false
    const normalized = text.replace(/\s+/g, ' ').trim().toLowerCase()
    if (!normalized) return false
    return (
      normalized.includes('faq') ||
      normalized.includes('frequently asked') ||
      normalized.includes('common questions') ||
      normalized.includes('popular questions')
    )
  }

  const toParagraphs = (raw?: string | null): string[] => {
    if (!raw) return []
    const normalized = raw.replace(/\r/g, '').trim()
    if (!normalized) return []

    const containsHtml = /<[^>]+>/.test(normalized)
    if (!containsHtml) {
      return normalized
        .split(/\n{1,}/)
        .map((segment) => segment.replace(/\s+/g, ' ').trim())
        .filter((segment) => segment.length > 0)
    }

    const snippet = cheerio.load(`<div>${normalized}</div>`, {
      decodeEntities: false
    })

    const blocks: string[] = []
    snippet('p, li, div').each((_, node) => {
      const text = snippet(node).text().replace(/\s+/g, ' ').trim()
      if (text) {
        blocks.push(text)
      }
    })

    if (blocks.length === 0) {
      const fallbackText = snippet.root().text().replace(/\s+/g, ' ').trim()
      return fallbackText ? [fallbackText] : []
    }

    return blocks
  }

  const addFaqEntry = (question?: string | null, answer?: string | string[] | null) => {
    const normalizedQuestion = question?.replace(/\s+/g, ' ').trim()
    if (!normalizedQuestion) return

    const dedupeKey = normalizedQuestion.toLowerCase()
    if (seenQuestions.has(dedupeKey)) return

    let answerParagraphs: string[] = []
    if (Array.isArray(answer)) {
      answerParagraphs = answer.map((paragraph) => paragraph.replace(/\s+/g, ' ').trim()).filter(Boolean)
    } else {
      answerParagraphs = toParagraphs(answer)
    }

    if (answerParagraphs.length === 0) return

    faqs.push({ question: normalizedQuestion, answer: answerParagraphs })
    seenQuestions.add(dedupeKey)
  }

  const captureHeading = (text?: string) => {
    if (faqHeading) return
    const trimmed = text?.replace(/\s+/g, ' ').trim()
    if (trimmed) {
      faqHeading = trimmed
    }
  }

  const captureHeadingFromPrev = (node: cheerio.Cheerio) => {
    if (faqHeading) return
    const prevHeading = node.prevAll('h1,h2,h3,h4,h5,h6').filter((_, el) => isFaqHeading($(el).text())).first()
    if (prevHeading.length) {
      captureHeading(prevHeading.text())
      prevHeading.remove()
    }
  }

  const extractQuestionAnswerBlocks = (questionSelector: string, answerSelector: string) => {
    container.find(questionSelector).each((_, element) => {
      const questionNode = $(element)
      captureHeadingFromPrev(questionNode)

      const answerNode = answerSelector
        ? questionNode.nextAll(answerSelector).first()
        : questionNode.next()
      const answerHtml = answerNode.length ? answerNode.html() || answerNode.text() : undefined

      addFaqEntry(questionNode.text(), answerHtml)

      if (answerNode.length) {
        answerNode.remove()
      }
      questionNode.remove()
    })
  }

  container
    .find('.schema-faq-section, .schema-faq-container, .schema-faq-wrap, .faq-container, .faq-block')
    .each((_, section) => {
      const sectionNode = $(section)
      captureHeadingFromPrev(sectionNode)
      const answerNode = sectionNode.find('.schema-faq-answer, .faq-answer').first()
      const answerHtml = answerNode.length
        ? answerNode.html() || answerNode.text()
        : sectionNode
            .find('p')
            .map((__, p) => $(p).html() || $(p).text())
            .get()
            .join('\n')

      addFaqEntry(
        sectionNode.find('.schema-faq-question, .faq-question').first().text(),
        answerHtml
      )
      sectionNode.remove()
    })

  container
    .find('[itemscope][itemtype="https://schema.org/Question"]')
    .each((_, element) => {
      const questionNode = $(element)
      captureHeadingFromPrev(questionNode)
      const answerNode = questionNode.find('[itemprop="acceptedAnswer"] [itemprop="text"]').first()
      const answerHtml = answerNode.length
        ? answerNode.html() || answerNode.text()
        : questionNode
            .find('p')
            .map((__, p) => $(p).html() || $(p).text())
            .get()
            .join('\n')
      addFaqEntry(questionNode.find('[itemprop="name"]').first().text(), answerHtml)
      questionNode.remove()
    })

  extractQuestionAnswerBlocks('.rank-math-question', '.rank-math-answer')
  container.find('.rank-math-faq, .rank-math-list, .rank-math-answer').remove()

  container
    .find('script[type="application/ld+json"]')
    .toArray()
    .forEach((script) => {
      const raw = $(script).contents().text()?.trim()
      if (!raw || !/faqpage/i.test(raw)) return

      try {
        const data = JSON.parse(raw)
        const nodes = Array.isArray(data) ? data : data['@graph'] ?? [data]
        nodes.forEach((node) => {
          if (!node || typeof node !== 'object') return
          const typeValue = (node as Record<string, unknown>)['@type']
          const typeList = Array.isArray(typeValue) ? typeValue : [typeValue]
          const isFaqNode = typeList.some(
            (type) => typeof type === 'string' && type.toLowerCase().includes('faqpage')
          )
          if (!isFaqNode) return

          captureHeading(
            typeof (node as Record<string, unknown>).name === 'string'
              ? ((node as Record<string, unknown>).name as string)
              : typeof (node as Record<string, unknown>).headline === 'string'
                ? ((node as Record<string, unknown>).headline as string)
                : undefined
          )

          const mainEntity = (node as Record<string, unknown>).mainEntity
          if (!Array.isArray(mainEntity)) return

          mainEntity.forEach((entity) => {
            if (!entity || typeof entity !== 'object') return
            const questionText =
              typeof (entity as Record<string, unknown>).name === 'string'
                ? ((entity as Record<string, unknown>).name as string)
                : typeof (entity as Record<string, unknown>).headline === 'string'
                  ? ((entity as Record<string, unknown>).headline as string)
                  : undefined

            const acceptedAnswer = (entity as Record<string, unknown>).acceptedAnswer
            if (Array.isArray(acceptedAnswer)) {
              const mergedAnswers = acceptedAnswer
                .map((answer) =>
                  answer && typeof answer === 'object'
                    ? ((answer as Record<string, unknown>).text as string | undefined) ??
                      ((answer as Record<string, unknown>).description as string | undefined)
                    : undefined
                )
                .filter((value): value is string => typeof value === 'string')
                .join('\n\n')
              addFaqEntry(questionText, mergedAnswers)
            } else if (acceptedAnswer && typeof acceptedAnswer === 'object') {
              const textValue =
                ((acceptedAnswer as Record<string, unknown>).text as string | undefined) ??
                ((acceptedAnswer as Record<string, unknown>).description as string | undefined)
              addFaqEntry(questionText, textValue)
            }
          })
        })
      } catch (error) {
        console.warn('Failed to parse FAQ JSON-LD', error)
      }
    })

  container.find('h1,h2,h3,h4,h5,h6').each((_, element) => {
    const headingNode = $(element)
    const text = headingNode.text()
    if (isFaqHeading(text)) {
      captureHeading(text)
      headingNode.remove()
    }
  })

  return {
    faqs,
    heading: faqHeading
  }
}

function enhanceReviewContent($: cheerio.CheerioAPI, wrapperId: string) {
  convertSpecTablesToCards($, wrapperId)
  convertDefinitionPairsToCards($, wrapperId)
  wrapResponsiveEmbeds($, wrapperId)
  enhanceAffiliateLinks($, wrapperId)
}

function convertSpecTablesToCards($: cheerio.CheerioAPI, wrapperId: string) {
  const container = $(`#${wrapperId}`)
  container.find('table').each((_, table) => {
    const rows = $(table).find('tr').toArray()
    if (rows.length === 0 || rows.length > 8) {
      return
    }

    const cards: string[] = []
    for (const row of rows) {
      const cells = $(row).find('td,th')
      if (cells.length !== 2) {
        return
      }
      const label = cells.eq(0).text().replace(/\s+/g, ' ').trim()
      const valueHtml = cells.eq(1).html()?.trim() ?? ''
      if (!label || !valueHtml) {
        return
      }
      cards.push(
        `<div class="review-spec-card"><p class="review-spec-label">${escapeHtml(label)}</p><div class="review-spec-value">${valueHtml}</div></div>`
      )
    }

    if (cards.length === 0) return
    $(table).replaceWith(`<div class="review-spec-grid">${cards.join('')}</div>`)
  })
}

function convertDefinitionPairsToCards($: cheerio.CheerioAPI, wrapperId: string) {
  const container = $(`#${wrapperId}`)
  const paragraphs = container.find('p').toArray()
  let pairs: Array<{ label: cheerio.Cheerio; value: cheerio.Cheerio }> = []

  const flush = () => {
    if (pairs.length >= 3) {
      const anchorNode = pairs[0].label
      const cards = pairs.map(({ label, value }) => {
        const labelText = label.text().replace(/\s+/g, ' ').trim()
        const valueHtml = value.html()?.trim() ?? value.text().trim()
        const lowerLabel = labelText.toLowerCase()
        const classes = ['review-spec-card']
        if (/rating|score|star/i.test(labelText)) {
          classes.push('review-spec-card--rating')
        }
        const icon = getSpecIcon(lowerLabel)
        if (icon) {
          classes.push('review-spec-card--with-icon')
        }
        const labelHtml = `<p class="review-spec-label">${escapeHtml(labelText)}</p>`
        const valueBlock = `<div class="review-spec-value">${valueHtml}</div>`
        const iconBlock = icon ? `<div class="review-spec-icon">${icon}</div>` : ''
        return `<div class="${classes.join(' ')}">${iconBlock}<div class="review-spec-body">${labelHtml}${valueBlock}</div></div>`
      })
      anchorNode.before(`<div class="review-spec-grid">${cards.join('')}</div>`)
      pairs.forEach(({ label, value }) => {
        label.remove()
        value.remove()
      })
    }
    pairs = []
  }

  for (let i = 0; i < paragraphs.length; i++) {
    const para = $(paragraphs[i])
    const strong = para.find('strong').first()
    const next = paragraphs[i + 1] ? $(paragraphs[i + 1]) : null
    if (
      strong.length === 1 &&
      strong.text().trim().length > 0 &&
      strong.text().trim().length <= 60 &&
      next &&
      next.is('p') &&
      next.find('strong').length === 0
    ) {
      pairs.push({ label: para, value: next })
      i += 1
      continue
    }
    flush()
  }
  flush()
}

function getSpecIcon(label: string): string | null {
  if (label.includes('battery')) return '🔋'
  if (label.includes('plaque') || label.includes('clean')) return '🦷'
  if (label.includes('capacity') || label.includes('tank')) return '💧'
  if (label.includes('rating') || label.includes('score')) return '⭐'
  if (label.includes('noise') || label.includes('sound')) return '🔈'
  if (label.includes('coverage') || label.includes('warranty')) return '🛡️'
  if (label.includes('mode') || label.includes('setting')) return '⚙️'
  return null
}

function wrapResponsiveEmbeds($: cheerio.CheerioAPI, wrapperId: string) {
  const container = $(`#${wrapperId}`)
  container.find('iframe, video').each((_, element) => {
    const node = $(element)
    if (!node.attr('allowfullscreen')) {
      node.attr('allowfullscreen', 'true')
    }
    const parent = node.parent()
    if (parent.hasClass('review-embed')) {
      return
    }
    node.wrap('<div class="review-embed"></div>')
  })
}

function enhanceAffiliateLinks($: cheerio.CheerioAPI, wrapperId: string) {
  const container = $(`#${wrapperId}`)
  container
    .find('a')
    .filter((_, element) => {
      const href = ($(element).attr('href') || '').toLowerCase()
      const text = $(element).text().toLowerCase()
      return (
        href.includes('amazon.') ||
        href.includes('amzn.to') ||
        /check price|buy now|shop now/.test(text)
      )
    })
    .each((_, element) => {
      const anchor = $(element)
      anchor.addClass('review-affiliate-link')
      anchor.attr('target', '_blank')
      anchor.attr('rel', 'noopener sponsored nofollow')
      const text = anchor.text().trim() || 'Check price'
      anchor.html(
        `<span class="review-affiliate-icon">💳</span><span class="review-affiliate-text">${escapeHtml(text)}</span>`
      )
    })
}

function extractRatingFromDom($: cheerio.CheerioAPI): number | null {
  const ratingAttr =
    $('[itemprop="ratingValue"]').attr('content') ||
    $('[data-rating]').attr('data-rating') ||
    $('[data-score]').attr('data-score')

  if (ratingAttr) {
    const directValue = parseFloat(ratingAttr)
    if (!Number.isNaN(directValue) && directValue > 0 && directValue <= 5) {
      return Math.round(directValue * 10) / 10
    }
  }

  const candidateTexts = new Set<string>()
  $('[class*="rating"], [class*="score"], strong, b')
    .toArray()
    .forEach((node) => {
      const text = $(node).text().trim()
      if (text) candidateTexts.add(text)
    })

  const bodyText = $('body').text()
  if (bodyText) candidateTexts.add(bodyText)

  for (const text of candidateTexts) {
    const parsed = parseRatingFromText(text)
    if (parsed !== null) {
      return parsed
    }
  }

  return null
}

function parseRatingFromText(text: string): number | null {
  if (!text) return null
  const match = text.match(/(\d(?:\.\d+)?)\s*(?:\/|out of)\s*5/i)
  if (!match) return null
  const value = parseFloat(match[1])
  if (Number.isNaN(value) || value < 0 || value > 5) return null
  return Math.round(value * 10) / 10
}

function extractProsConsFromHtml(html: string): { pros: string[]; cons: string[] } {
  const wrapperId = '__review_content_root'
  const $ = cheerio.load(`<div id="${wrapperId}">${html}</div>`, {
    decodeEntities: false
  })
  const container = $(`#${wrapperId}`)
  const pros: string[] = []
  const cons: string[] = []

  const headingRegex = /^h[2-4]$/i
  container.find('h2, h3, h4').each((_, heading) => {
    const headingNode = $(heading)
    const text = headingNode.text().toLowerCase()
    let target: 'pros' | 'cons' | 'both' | null = null

    if (/pros\s+and\s+cons/.test(text)) {
      target = 'both'
    } else if (/(pros|advantages|benefits|what we like|strength)/.test(text)) {
      target = 'pros'
    } else if (/(cons|drawbacks|limitations|issues|what we don't like|where it could improve)/.test(text)) {
      target = 'cons'
    }

    if (!target) return

    let node = headingNode.next()
    while (node.length && !headingRegex.test(node[0].tagName ?? '')) {
      if (node.is('ul, ol')) {
        node.find('li').each((__, li) => {
          const entry = $(li).text()
          const classification = target === 'both' ? classifyProsConsText(entry) : target
          if (classification) {
            addEntryToCollection(classification, entry, pros, cons)
          }
        })
      } else if (node.is('p')) {
        const entry = node.text()
        const classification = target === 'both' ? classifyProsConsText(entry) : target
        if (classification) {
          addEntryToCollection(classification, entry, pros, cons)
        }
      }
      node = node.next()
    }
  })

  if (pros.length === 0 || cons.length === 0) {
    container.find('p').each((_, paragraph) => {
      const text = $(paragraph).text()
      const classification = classifyProsConsText(text)
      if (classification) {
        addEntryToCollection(classification, text, pros, cons)
      }
    })
  }

  return {
    pros: dedupeEntries(pros),
    cons: dedupeEntries(cons)
  }
}

function classifyProsConsText(text: string): 'pros' | 'cons' | null {
  if (!text) return null
  const normalized = text.replace(/\s+/g, ' ').trim()
  if (!normalized) return null
  const lower = normalized.toLowerCase()
  const prosKeywords = ['pros', 'advantage', 'benefit', 'positive', 'love', 'strength']
  const consKeywords = ['cons', 'drawback', 'limitation', 'downside', 'issue', 'negative', 'however', 'but']

  const hasProsKeyword = prosKeywords.some((keyword) => lower.includes(keyword))
  const hasConsKeyword = consKeywords.some((keyword) => lower.includes(keyword))

  if (hasProsKeyword && !hasConsKeyword) return 'pros'
  if (hasConsKeyword && !hasProsKeyword) return 'cons'
  if (lower.includes('con')) return 'cons'
  if (lower.includes('pro')) return 'pros'

  return null
}

function addEntryToCollection(
  target: 'pros' | 'cons',
  value: string,
  pros: string[],
  cons: string[]
) {
  const cleaned = value.replace(/\s+/g, ' ').trim()
  if (!cleaned) return
  if (target === 'pros') {
    pros.push(cleaned)
  } else {
    cons.push(cleaned)
  }
}

function dedupeEntries(items: string[], limit = 8): string[] {
  const seen = new Set<string>()
  const result: string[] = []
  for (const item of items) {
    const normalized = item.trim()
    if (!normalized) continue
    const key = normalized.toLowerCase()
    if (seen.has(key)) continue
    seen.add(key)
    result.push(normalized)
    if (result.length >= limit) break
  }
  return result
}

function extractAffiliateLinksFromHtml(
  html: string
): Array<{ title: string; url: string; price?: string }> {
  const wrapperId = '__affiliate_root'
  const $ = cheerio.load(`<div id="${wrapperId}">${html}</div>`, {
    decodeEntities: false
  })
  const container = $(`#${wrapperId}`)
  const links = new Map<string, { title: string; url: string; price?: string }>()

  container.find('a[href]').each((_, element) => {
    const anchor = $(element)
    const href = anchor.attr('href')?.trim()
    if (!href) return
    if (!/^https?:/i.test(href)) return
    if (!/(amazon\.)|(amzn\.to)/i.test(href)) return

    const text = anchor.text().replace(/\s+/g, ' ').trim()
    if (/associates program/i.test(text)) return

    const title = text || anchor.attr('title')?.trim() || 'Check availability'
    const priceMatch = text.match(/\$\d[\d.,]*/)
    const key = href.split('#')[0]
    if (!links.has(key)) {
      links.set(key, {
        title,
        url: href,
        price: priceMatch ? priceMatch[0] : undefined
      })
    }
  })

  return Array.from(links.values()).slice(0, 5)
}

/**
 * Fetch HTML content from a URL
 */
async function fetchHtml(url: string): Promise<string> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': USER_AGENT
      }
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    return await response.text()
  } catch (error) {
    console.error(`Failed to fetch ${url}:`, error)
    throw error
  }
}

/**
 * Extract all article URLs from a category page
 */
async function getArticleUrls(categoryPath: string): Promise<string[]> {
  const urls: string[] = []
  let page = 1
  let hasMorePages = true

  console.log(`\nFetching article URLs from ${categoryPath}...`)

  while (hasMorePages) {
    try {
      const pageUrl = page === 1
        ? `${LIVE_SITE_URL}${categoryPath}`
        : `${LIVE_SITE_URL}${categoryPath}page/${page}/`

      console.log(`  Page ${page}: ${pageUrl}`)
      const html = await fetchHtml(pageUrl)
      const $ = cheerio.load(html)

      // Extract article links - adjust selector based on actual HTML structure
      const articleLinks = $('.entry-title a, article h2 a, .post-title a, h3.entry-title a')
        .map((_, el) => $(el).attr('href'))
        .get()
        .filter(href => href && !href.includes('#') && !href.includes('javascript:'))

      if (articleLinks.length === 0) {
        hasMorePages = false
      } else {
        urls.push(...articleLinks)
        console.log(`    Found ${articleLinks.length} articles`)
        page++
      }

      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000))

    } catch (error) {
      console.error(`  Error fetching page ${page}:`, error)
      hasMorePages = false
    }
  }

  console.log(`Total articles found: ${urls.length}`)
  return urls
}

/**
 * Extract article content from a single article page
 */
async function extractArticleData(url: string, category: string): Promise<ArticleData | null> {
  try {
    const html = await fetchHtml(url)
    const $ = cheerio.load(html)

    // Extract title
    const title = $('h1.entry-title, h1.post-title, article h1, h1').first().text().trim()
    if (!title) {
      console.warn(`  No title found for ${url}`)
      return null
    }

    // Extract slug from URL
    const urlParts = url.split('/')
    const slug = urlParts[urlParts.length - 2] || urlParts[urlParts.length - 1]

    // Extract content
    const contentSelectors = [
      '.entry-content',
      '.post-content',
      'article .content',
      '.article-content',
      'article'
    ]

    let rawContent = ''
    for (const selector of contentSelectors) {
      const element = $(selector).first()
      if (element.length) {
        // Remove scripts, styles, and navigation elements
        element.find('script, style, nav, .nav, .navigation, .social-share').remove()
        const candidate = element.html() || ''
        if (!rawContent || candidate.length > rawContent.length) {
          rawContent = candidate
        }
        if (candidate.length > 100) break
      }
    }

    const {
      html: content,
      faqs: extractedFaqs,
      faqHeading
    } = await processArticleContent(rawContent, slug, title)

    // Extract excerpt/description
    let excerpt = $('meta[name="description"]').attr('content') ||
                  $('meta[property="og:description"]').attr('content') ||
                  $('.excerpt, .entry-summary').first().text().trim() ||
                  null

    // Extract featured image
    const featuredImageSrc =
      $('meta[property="og:image"]').attr('content') ||
      $('.featured-image img, .post-thumbnail img, article img').first().attr('src') ||
      null

    const storedFeaturedImage = featuredImageSrc
      ? await downloadAndStoreImage({
          src: featuredImageSrc,
          altText: `${title} featured image`,
          articleSlug: slug,
          label: 'featured'
        })
      : null

    if (featuredImageSrc && !storedFeaturedImage) {
      console.warn(`    Unable to store featured image for ${slug}, falling back to remote URL`)
    }

    const featuredImage = storedFeaturedImage?.path || (featuredImageSrc ? resolveImageUrl(featuredImageSrc) : null)

    // Extract author
    const author = $('.author-name, .entry-author, .post-author, [rel="author"]').first().text().trim() ||
                   $('meta[name="author"]').attr('content') ||
                   null

    // Extract publish date
    let publishedAt = new Date()
    const dateStr = $('.entry-date, .published, time[datetime]').first().attr('datetime') ||
                    $('.entry-date, .published, time').first().text().trim()
    if (dateStr) {
      const parsed = new Date(dateStr)
      if (!isNaN(parsed.getTime())) {
        publishedAt = parsed
      }
    }

    // Extract SEO data
    const seoTitle = $('meta[property="og:title"]').attr('content') ||
                     $('title').text().trim() ||
                     null

    const seoDescription = $('meta[name="description"]').attr('content') ||
                          $('meta[property="og:description"]').attr('content') ||
                          null

    // Extract tags
  const tags = $('.tag, .post-tag, [rel="tag"]')
    .map((_, el) => $(el).text().trim())
    .get()
    .filter(tag => tag.length > 0)

    return {
      title,
      slug,
      content,
      excerpt,
      category,
      author,
      publishedAt,
      featuredImage,
      seoTitle,
      seoDescription,
      isPublished: true,
      faqs: extractedFaqs,
      faqHeading
    }

  } catch (error) {
    console.error(`  Error extracting data from ${url}:`, error)
    return null
  }
}

async function extractReviewData(url: string, defaultCategorySlug: string): Promise<ReviewData | null> {
  try {
    const html = await fetchHtml(url)
    const $ = cheerio.load(html)

    const title = $('h1.entry-title, h1.post-title, article h1, h1').first().text().trim()
    if (!title) {
      console.warn(`  No title found for ${url}`)
      return null
    }

    const urlParts = url.split('/')
    const slug = urlParts[urlParts.length - 2] || urlParts[urlParts.length - 1]

    const contentSelectors = [
      '.entry-content',
      '.post-content',
      'article .content',
      '.article-content',
      'article'
    ]

    let rawContent = ''
    for (const selector of contentSelectors) {
      const element = $(selector).first()
      if (element.length) {
        element.find('script, style, nav, .nav, .navigation, .social-share').remove()
        const candidate = element.html() || ''
        if (!rawContent || candidate.length > rawContent.length) {
          rawContent = candidate
        }
        if (candidate.length > 100) break
      }
    }

    const {
      html: content,
      faqs: extractedFaqs,
      faqHeading
    } = await processArticleContent(rawContent, slug, title, 'review')

    const excerpt =
      $('meta[name="description"]').attr('content') ||
      $('meta[property="og:description"]').attr('content') ||
      $('.excerpt, .entry-summary').first().text().trim() ||
      null

    const featuredImageSrc =
      $('meta[property="og:image"]').attr('content') ||
      $('.featured-image img, .post-thumbnail img, article img').first().attr('src') ||
      null

    const storedFeaturedImage = featuredImageSrc
      ? await downloadAndStoreImage({
          src: featuredImageSrc,
          altText: `${title} featured image`,
          articleSlug: slug,
          label: 'featured',
          contentType: 'review'
        })
      : null

    if (featuredImageSrc && !storedFeaturedImage) {
      console.warn(`    Unable to store featured image for ${slug}, falling back to remote URL`)
    }

    const featuredImage = storedFeaturedImage?.path || (featuredImageSrc ? resolveImageUrl(featuredImageSrc) : null)

    const author =
      $('.author-name, .entry-author, .post-author, [rel="author"]').first().text().trim() ||
      $('meta[name="author"]').attr('content') ||
      null

    let publishedAt = new Date()
    const dateStr =
      $('.entry-date, .published, time[datetime]').first().attr('datetime') ||
      $('.entry-date, .published, time').first().text().trim()
    if (dateStr) {
      const parsed = new Date(dateStr)
      if (!isNaN(parsed.getTime())) {
        publishedAt = parsed
      }
    }

    const seoTitle = $('meta[property="og:title"]').attr('content') || $('title').text().trim() || null

    const seoDescription =
      $('meta[name="description"]').attr('content') ||
      $('meta[property="og:description"]').attr('content') ||
      null

    const rating = extractRatingFromDom($)
    const { pros, cons } = extractProsConsFromHtml(content)
    const affiliateLinks = extractAffiliateLinksFromHtml(content)
    const resolvedCategory = detectCategorySlug($, defaultCategorySlug)

    return {
      title,
      slug,
      content,
      excerpt,
      category: resolvedCategory,
      author,
      publishedAt,
      featuredImage,
      seoTitle,
      seoDescription,
      rating,
      pros,
      cons,
      affiliateLinks,
      faqs: extractedFaqs,
      faqHeading
    }
  } catch (error) {
    console.error(`  Error extracting review data from ${url}:`, error)
    return null
  }
}

function detectCategorySlug($: cheerio.CheerioAPI, fallbackSlug: string): string {
  const articleClasses =
    $('article')
      .first()
      .attr('class')
      ?.split(/\s+/)
      .filter(Boolean) ?? []

  const categoryClass = articleClasses
    .map((cls) => (cls.startsWith('category-') ? cls.replace(/^category-/, '') : null))
    .filter(Boolean)
    .find((slug) => slug && slug !== 'reviews')

  if (categoryClass) {
    return categoryClass
  }

  return fallbackSlug
}

function buildDefaultArticleSchemaPayload(articleData: ArticleData, authorName: string | null) {
  const schemaType = articleData.category === 'news' ? 'NewsArticle' : 'Article'
  const canonicalUrl = `${SITE_BASE_URL}/${articleData.slug}/`
  const imageUrl = articleData.featuredImage
    ? articleData.featuredImage.startsWith('http')
      ? articleData.featuredImage
      : `${SITE_BASE_URL}${articleData.featuredImage}`
    : undefined

  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': schemaType,
    headline: articleData.title,
    description: articleData.seoDescription || articleData.excerpt || articleData.title,
    author: {
      '@type': 'Person',
      name: authorName || FALLBACK_AUTHOR_NAME
    },
    publisher: {
      '@type': 'Organization',
      name: 'Pediatric Dentist in Queens NY',
      logo: {
        '@type': 'ImageObject',
        url: `${SITE_BASE_URL}/og-default.jpg`
      }
    },
    datePublished: articleData.publishedAt.toISOString(),
    dateModified: articleData.publishedAt.toISOString(),
    image: imageUrl,
    url: canonicalUrl,
    mainEntityOfPage: canonicalUrl
  })
}

function buildDefaultReviewSchemaPayload(reviewData: ReviewData, authorName: string | null) {
  const canonicalUrl = `${SITE_BASE_URL}/${reviewData.slug}/`
  const payload: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Review',
    name: reviewData.title,
    description: reviewData.excerpt || reviewData.title,
    datePublished: reviewData.publishedAt.toISOString(),
    itemReviewed: {
      '@type': 'Product',
      name: reviewData.title
    },
    reviewBody: reviewData.excerpt || reviewData.title,
    url: canonicalUrl,
    mainEntityOfPage: canonicalUrl
  }

  if (authorName) {
    payload.author = {
      '@type': 'Person',
      name: authorName
    }
  }

  if (typeof reviewData.rating === 'number') {
    payload.reviewRating = {
      '@type': 'Rating',
      ratingValue: reviewData.rating,
      bestRating: 5
    }
  }

  return JSON.stringify(payload)
}

/**
 * Import a single article into the database
 */
async function importArticle(articleData: ArticleData, dryRun: boolean = false): Promise<boolean> {
  if (dryRun) {
    console.log(`  [DRY RUN] Would import: ${articleData.title}`)
    return true
  }

  try {
    const [categoryId, authorId, userId] = await Promise.all([
      resolveCategoryId(articleData.category),
      resolveAuthorId(articleData.author),
      resolveUserId()
    ])

    const faqsPayload =
      articleData.faqs.length > 0
        ? JSON.stringify(
            articleData.faqs.map((faq) => ({
              question: faq.question,
              answer: faq.answer.join('\n\n')
            }))
          )
        : null

    const schemaPayload = buildDefaultArticleSchemaPayload(articleData, articleData.author)

    const baseData = {
      title: articleData.title,
      content: articleData.content,
      excerpt: articleData.excerpt,
      featuredImage: articleData.featuredImage,
      status: ContentStatus.PUBLISHED,
      type: ContentType.BLOG,
      seoTitle: articleData.seoTitle || articleData.title,
      seoDescription: articleData.seoDescription || articleData.excerpt || null,
      isNoIndex: false,
      isNoFollow: false,
      schema: schemaPayload,
      faqs: faqsPayload,
      faqHeading: articleData.faqHeading,
      publishedAt: articleData.publishedAt,
      categoryId,
      authorId,
      userId
    }

    const existing = await prisma.article.findUnique({
      where: { slug: articleData.slug }
    })

    if (existing) {
      console.log(`  Updating: ${articleData.title}`)
      await prisma.article.update({
        where: { slug: articleData.slug },
        data: baseData
      })
    } else {
      console.log(`  Creating: ${articleData.title}`)
      await prisma.article.create({
        data: {
          slug: articleData.slug,
          ...baseData
        }
      })
    }

    return true
  } catch (error) {
    console.error(`  Failed to import ${articleData.title}:`, error)
    return false
  }
}

async function importReview(reviewData: ReviewData, dryRun: boolean = false): Promise<boolean> {
  if (dryRun) {
    console.log(`  [DRY RUN] Would import review: ${reviewData.title}`)
    return true
  }

  try {
    const [categoryId, authorId, userId] = await Promise.all([
      resolveCategoryId(reviewData.category),
      resolveAuthorId(reviewData.author),
      resolveUserId()
    ])

    const prosPayload = reviewData.pros.length
      ? JSON.stringify(reviewData.pros.map((text) => ({ text })))
      : null

    const consPayload = reviewData.cons.length
      ? JSON.stringify(reviewData.cons.map((text) => ({ text })))
      : null

    const affiliateLinksPayload = reviewData.affiliateLinks.length
      ? JSON.stringify(reviewData.affiliateLinks)
      : null

    const faqsPayload =
      reviewData.faqs.length > 0
        ? JSON.stringify(
            reviewData.faqs.map((faq) => ({
              question: faq.question,
              answer: faq.answer.join('\n\n')
            }))
          )
        : null

    const schemaPayload = buildDefaultReviewSchemaPayload(reviewData, reviewData.author)

    const baseData = {
      title: reviewData.title,
      content: reviewData.content,
      excerpt: reviewData.excerpt,
      featuredImage: reviewData.featuredImage,
      rating: reviewData.rating,
      pros: prosPayload,
      cons: consPayload,
      affiliateLinks: affiliateLinksPayload,
      faqs: faqsPayload,
      faqHeading: reviewData.faqHeading,
      status: ContentStatus.PUBLISHED,
      seoTitle: reviewData.seoTitle || reviewData.title,
      seoDescription: reviewData.seoDescription || reviewData.excerpt || null,
      isNoIndex: false,
      isNoFollow: false,
      schema: schemaPayload,
      publishedAt: reviewData.publishedAt,
      categoryId,
      authorId,
      userId
    }

    const existing = await prisma.review.findUnique({
      where: { slug: reviewData.slug }
    })

    if (existing) {
      console.log(`  Updating review: ${reviewData.title}`)
      await prisma.review.update({
        where: { slug: reviewData.slug },
        data: baseData
      })
    } else {
      console.log(`  Creating review: ${reviewData.title}`)
      await prisma.review.create({
        data: {
          slug: reviewData.slug,
          ...baseData
        }
      })
    }

    return true
  } catch (error) {
    console.error(`  Failed to import review ${reviewData.title}:`, error)
    return false
  }
}

/**
 * Import all articles from a category
 */
async function importCategory(
  categoryName: string,
  categoryPath: string,
  categorySlug: string,
  categoryType: ImportContentType,
  options: { dryRun?: boolean; limit?: number } = {}
): Promise<{ total: number; success: number; failed: number }> {
  console.log(`\n${'='.repeat(60)}`)
  console.log(`Importing category: ${categoryName}`)
  console.log(`${'='.repeat(60)}`)

  const articleUrls = await getArticleUrls(categoryPath)
  const limitedUrls = options.limit ? articleUrls.slice(0, options.limit) : articleUrls

  const stats = { total: limitedUrls.length, success: 0, failed: 0 }

  for (let i = 0; i < limitedUrls.length; i++) {
    const url = limitedUrls[i]
    console.log(`\n[${i + 1}/${limitedUrls.length}] Processing: ${url}`)

    try {
      if (categoryType === 'review') {
        const reviewData = await extractReviewData(url, categorySlug)
        if (reviewData) {
          const imported = await importReview(reviewData, options.dryRun)
          if (imported) {
            stats.success++
          } else {
            stats.failed++
          }
        } else {
          stats.failed++
        }
      } else {
        const articleData = await extractArticleData(url, categorySlug)

        if (articleData) {
          const imported = await importArticle(articleData, options.dryRun)
          if (imported) {
            stats.success++
          } else {
            stats.failed++
          }
        } else {
          stats.failed++
        }
      }

      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 1500))

    } catch (error) {
      console.error(`  Failed to process ${url}:`, error)
      stats.failed++
    }
  }

  console.log(`\n${'-'.repeat(60)}`)
  console.log(`Category "${categoryName}" Stats:`)
  console.log(`  Total: ${stats.total}`)
  console.log(`  Success: ${stats.success}`)
  console.log(`  Failed: ${stats.failed}`)
  console.log(`${'-'.repeat(60)}`)

  return stats
}

/**
 * Main import function
 */
async function main() {
  const args = process.argv.slice(2)
  const dryRun = args.includes('--dry-run')
  const categoryFilter = args.find(arg => arg.startsWith('--category='))?.split('=')[1]
  const limitArg = args.find(arg => arg.startsWith('--limit='))?.split('=')[1]
  const limit = limitArg ? parseInt(limitArg) : undefined

  console.log('\n╔════════════════════════════════════════════════════════╗')
  console.log('║     Comprehensive Article Import Script                ║')
  console.log('╚════════════════════════════════════════════════════════╝')
  console.log(`Live Site: ${LIVE_SITE_URL}`)
  console.log(`Mode: ${dryRun ? 'DRY RUN (no changes)' : 'LIVE IMPORT'}`)
  if (categoryFilter) console.log(`Category Filter: ${categoryFilter}`)
  if (limit) console.log(`Limit: ${limit} articles per category`)
  console.log('')

  const categoriesToImport = categoryFilter
    ? CATEGORIES.filter(cat => cat.slug === categoryFilter)
    : CATEGORIES

  if (categoriesToImport.length === 0) {
    console.error(`Category "${categoryFilter}" not found!`)
    console.log('\nAvailable categories:')
    CATEGORIES.forEach(cat => console.log(`  - ${cat.slug}`))
    process.exit(1)
  }

  const allStats = { total: 0, success: 0, failed: 0 }

  for (const category of categoriesToImport) {
    try {
      const stats = await importCategory(
        category.name,
        category.path,
        category.slug,
        category.type,
        { dryRun, limit }
      )
      allStats.total += stats.total
      allStats.success += stats.success
      allStats.failed += stats.failed
    } catch (error) {
      console.error(`\nFailed to import category ${category.name}:`, error)
    }
  }

  console.log('\n' + '='.repeat(60))
  console.log('FINAL STATISTICS')
  console.log('='.repeat(60))
  console.log(`Total Articles Processed: ${allStats.total}`)
  console.log(`Successfully Imported: ${allStats.success}`)
  console.log(`Failed: ${allStats.failed}`)
  console.log(`Success Rate: ${((allStats.success / allStats.total) * 100).toFixed(1)}%`)
  console.log('='.repeat(60))

  if (dryRun) {
    console.log('\n✓ DRY RUN complete - no changes were made')
    console.log('Run without --dry-run to perform actual import')
  }
}

main()
  .catch((e) => {
    console.error('\n❌ Fatal error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
