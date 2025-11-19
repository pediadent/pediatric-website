import { notFound, redirect } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import type { Metadata } from 'next'
import { StarIcon } from '@heroicons/react/24/solid'
import {
  CheckIcon,
  XMarkIcon,
  ArrowTopRightOnSquareIcon,
  ShoppingBagIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline'
import { prisma } from '@/lib/prisma'
import { formatDate, slugify } from '@/lib/utils'
import FloatingTOC from '@/components/layout/FloatingTOC'
import { ReviewShareBar } from '@/components/reviews/ReviewShareBar'
import { getAmazonItems, resolveAmazonLink } from '@/lib/amazon'
import { DirectorySidebar } from '@/components/directory/DirectorySidebar'

interface PageProps {
  params: {
    slug: string
  }
}

export async function getReview(slug: string) {
  return prisma.review.findUnique({
    where: {
      slug,
      status: 'PUBLISHED'
    },
    include: {
      author: true,
      category: true,
      primaryReviewer: true,
      reviewers: {
        include: {
          reviewer: true
        }
      }
    }
  })
}

export type ReviewWithRelations = NonNullable<Awaited<ReturnType<typeof getReview>>>

const parseList = (value: string | null | undefined): string[] => {
  if (!value) return []

  try {
    const parsed = JSON.parse(value)
    if (Array.isArray(parsed)) {
      return parsed
        .map((item) => {
          if (typeof item === 'string') return item
          if (item && typeof item === 'object' && 'text' in item) {
            const maybeText = (item as { text?: unknown }).text
            return typeof maybeText === 'string' ? maybeText : null
          }
          return null
        })
        .filter((entry): entry is string => typeof entry === 'string' && entry.trim().length > 0)
    }
  } catch (error) {
    console.warn('Failed to parse list value', error)
  }

  return []
}

const parseAffiliateLinks = (
  value: string | null | undefined
): Array<{ title: string; url: string; price?: string }> => {
  if (!value) return []

  try {
    const parsed = JSON.parse(value)
    if (Array.isArray(parsed)) {
      return parsed
        .map((item) => {
          if (item && typeof item === 'object') {
            const { title, url, price } = item as Record<string, unknown>
            if (typeof title === 'string' && typeof url === 'string') {
              return {
                title,
                url,
                price: typeof price === 'string' ? price : undefined
              }
            }
          }
          return null
        })
        .filter((entry): entry is { title: string; url: string; price?: string } => Boolean(entry))
    }
  } catch (error) {
    console.warn('Failed to parse affiliate links', error)
  }

  return []
}

const parseFaqEntries = (
  value: string | null | undefined
): Array<{ question: string; answer: string[] }> => {
  if (!value) return []

  try {
    const parsed = JSON.parse(value)
    if (Array.isArray(parsed)) {
      return parsed
        .map((entry) => {
          if (entry && typeof entry === 'object') {
            const { question, answer } = entry as Record<string, unknown>
            if (typeof question === 'string' && typeof answer === 'string') {
              const rawParagraphs = answer
                .split(/\r?\n+/)
                .map((part) => part.trim())
                .filter((part) => part.length > 0)
              const seen = new Set<string>()
              const paragraphs = rawParagraphs.filter((part) => {
                const key = part.toLowerCase()
                if (seen.has(key)) return false
                seen.add(key)
                return true
              })
              return {
                question,
                answer: paragraphs
              }
            }
          }
          return null
        })
        .filter((item): item is { question: string; answer: string[] } => item !== null)
    }
  } catch (error) {
    console.warn('Failed to parse review FAQs', error)
  }

  return []
}

type ReviewerDisplay = {
  id: string
  name: string
  slug: string
  bio?: string | null
  avatar?: string | null
  route: 'authors' | 'reviewers'
}

const getReviewerInfo = (review: ReviewWithRelations): { reviewerNames: string[]; primaryReviewer: ReviewerDisplay; additionalReviewers: ReviewerDisplay[] } => {
  const reviewerEntries = Array.isArray(review.reviewers)
    ? review.reviewers
        .map((entry) => entry.reviewer)
        .filter((item): item is NonNullable<typeof entry.reviewer> => Boolean(item))
    : []

  const reviewerNames = reviewerEntries.map((item) => item.name)

  const fallbackAuthor: ReviewerDisplay | null =
    review.author
      ? {
          id: review.author.id,
          name: review.author.name,
          slug: review.author.slug,
          bio: review.author.bio,
          avatar: review.author.avatar,
          route: 'authors'
        }
      : null

  const primaryBase = review.primaryReviewer ?? reviewerEntries[0] ?? null
  const primaryReviewer: ReviewerDisplay | null = primaryBase
    ? {
        id: primaryBase.id,
        name: primaryBase.name,
        slug: primaryBase.slug,
        bio: primaryBase.bio,
        avatar: primaryBase.avatar,
        route: 'reviewers'
      }
    : null

  const resolvedPrimary = (primaryReviewer ?? fallbackAuthor)!

  const additionalReviewers: ReviewerDisplay[] = reviewerEntries
    .filter((item) => item.id !== resolvedPrimary.id)
    .map((item) => ({
      id: item.id,
      name: item.name,
      slug: item.slug,
      bio: item.bio,
      avatar: item.avatar,
      route: 'reviewers' as const
    }))

  const names = reviewerNames.length
    ? reviewerNames
    : resolvedPrimary
      ? [resolvedPrimary.name]
      : []

  return {
    reviewerNames: names,
    primaryReviewer: resolvedPrimary,
    additionalReviewers
  }
}

const buildJsonLd = async (review: ReviewWithRelations, authorNames: string[], faqs: Array<{ question: string; answer: string }>) => {
  const { generateReviewSchema, generateBreadcrumbSchema, generateFAQSchema } = await import('@/lib/schema-generator')
  const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') || 'https://pediatricdentistinqueensny.com') as string
  const shareUrl = `${baseUrl}/${review.slug}/`

  // Review Schema
  const reviewSchema = review.schema ? JSON.parse(review.schema) : generateReviewSchema({
    title: review.title,
    description: review.excerpt || review.title,
    url: shareUrl,
    author: {
      name: review.primaryReviewer?.name || authorNames[0] || 'Editorial Team',
      url: review.primaryReviewer?.slug ? `${baseUrl}/reviewers/${review.primaryReviewer.slug}/` : undefined,
      image: review.primaryReviewer?.avatar || undefined
    },
    datePublished: review.publishedAt?.toISOString() || new Date().toISOString(),
    dateModified: review.updatedAt?.toISOString(),
    itemName: review.title,
    itemImage: review.featuredImage || undefined,
    rating: review.rating ?? undefined,
    image: review.featuredImage ? {
      url: review.featuredImage,
      caption: review.title
    } : undefined
  })

  // Breadcrumb Schema
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: baseUrl },
    { name: 'Reviews', url: `${baseUrl}/reviews/` },
    { name: review.title, url: shareUrl }
  ])

  // FAQ Schema (if FAQs exist)
  const faqSchema = faqs.length > 0 ? generateFAQSchema(
    faqs.map(faq => ({
      question: faq.question,
      answer: faq.answer
    }))
  ) : null

  return [reviewSchema, breadcrumbSchema, faqSchema].filter(Boolean)
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const review = await getReview(slug)

  if (!review) {
    return {
      title: 'Review Not Found'
    }
  }

  return buildReviewMetadata(review)
}

const renderStars = (ratingValue: number | null | undefined) => {
  if (typeof ratingValue !== 'number' || Number.isNaN(ratingValue)) {
    return (
      <div className="text-sm font-medium text-neutral-500">
        Rating coming soon
      </div>
    )
  }

  const rating = Math.min(Math.max(ratingValue, 0), 5)

  return (
    <div className="flex items-center">
      {[1, 2, 3, 4, 5].map((star) => (
        <StarIcon
          key={star}
          className={`h-6 w-6 ${star <= rating ? 'text-yellow-500' : 'text-neutral-300'}`}
        />
      ))}
      <span className="ml-2 text-xl font-semibold text-neutral-900">{rating.toFixed(1)}</span>
      <span className="ml-1 text-neutral-500">/ 5</span>
    </div>
  )
}

export const buildReviewMetadata = (review: ReviewWithRelations): Metadata => {
  const title =
    review.seoTitle ||
    `${review.title} Review${
      review.primaryReviewer?.name ? ` by ${review.primaryReviewer.name}` : ''
    }`
  const description =
    review.seoDescription ||
    review.excerpt ||
    `Read our in-depth review of ${review.title}.`
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  const imageUrl = review.featuredImage ? `${baseUrl}${review.featuredImage}` : undefined

  return {
    title,
    description,
    alternates: {
      canonical: `${baseUrl}/${review.slug}/`
    },
    openGraph: {
      title,
      description,
      url: `${baseUrl}/${review.slug}/`,
      siteName: 'Pediatric Dentist Reviews',
      images: imageUrl
        ? [
            {
              url: imageUrl,
              width: 1200,
              height: 630,
              alt: review.title
            }
          ]
        : undefined
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: imageUrl ? [imageUrl] : undefined
    }
  }
}

export async function ReviewContent({ review }: { review: ReviewWithRelations }) {
  const { reviewerNames, primaryReviewer, additionalReviewers } = getReviewerInfo(review)
  const authorNames =
    reviewerNames.length > 0
      ? reviewerNames
      : primaryReviewer
        ? [primaryReviewer.name]
        : []
  const pros = parseList(review.pros)
  const cons = parseList(review.cons)
  const affiliateLinks = parseAffiliateLinks(review.affiliateLinks)
  const faqs = parseFaqEntries(review.faqs)
  const jsonLd = await buildJsonLd(review, authorNames, faqs)

  const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') ?? '') as string
  const shareUrl = baseUrl ? `${baseUrl}/${review.slug}/` : undefined

  const quickFacts = [
    review.rating ? { label: 'Overall rating', value: `${review.rating.toFixed(1)} / 5` } : null,
    review.category?.name ? { label: 'Category', value: review.category.name } : null,
    primaryReviewer ? { label: 'Primary reviewer', value: primaryReviewer.name } : null,
    reviewerNames.length ? { label: 'Dental experts', value: reviewerNames.join(', ') } : null,
    review.publishedAt ? { label: 'Published', value: formatDate(review.publishedAt) } : null,
    { label: 'Last updated', value: formatDate(review.updatedAt) }
  ].filter((row): row is { label: string; value: string } => Boolean(row))

  const headingOccurrences = new Map<string, number>()
  const tocItems: Array<{ id: string; label: string }> = []

  const enhancedContent = review.content.replace(/<h([2-3])([^>]*)>(.*?)<\/h\1>/gi, (match, level, attrs, inner) => {
    const plainText = inner.replace(/<[^>]*>/g, '').trim()
    if (!plainText) {
      return match
    }

    const baseId = slugify(plainText) || `section-${tocItems.length + 1}`
    const count = headingOccurrences.get(baseId) ?? 0
    headingOccurrences.set(baseId, count + 1)
    const id = count === 0 ? baseId : `${baseId}-${count + 1}`

    const numericLevel = Number(level)
    if (numericLevel === 2) {
      tocItems.push({ id, label: plainText })
    }

    let updatedAttrs = attrs || ''
    if (/id=/i.test(updatedAttrs)) {
      updatedAttrs = updatedAttrs.replace(/id="[^"]*"/i, `id="${id}"`)
    } else {
      updatedAttrs = `${updatedAttrs} id="${id}"`
    }

    updatedAttrs = updatedAttrs.replace(/\s+/g, ' ').trim()
    const attrString = updatedAttrs ? ` ${updatedAttrs}` : ''

    return `<h${level}${attrString}>${inner}</h${level}>`
  })

  const [categoryNav, relatedReviewEntries, totalReviewCount] = await Promise.all([
    prisma.category.findMany({
      where: {
        articles: {
          some: {
            status: 'PUBLISHED'
          }
        }
      },
      select: {
        name: true,
        slug: true,
        articles: {
          where: { status: 'PUBLISHED' },
          select: { id: true }
        }
      },
      orderBy: { name: 'asc' }
    }),
    prisma.review.findMany({
      where: {
        status: 'PUBLISHED',
        id: { not: review.id },
        category: { slug: review.category.slug }
      },
      select: {
        id: true,
        title: true,
        slug: true,
        publishedAt: true,
        featuredImage: true,
        excerpt: true,
        rating: true
      },
      orderBy: [
        { publishedAt: 'desc' },
        { updatedAt: 'desc' }
      ],
      take: 4
    }),
    prisma.review.count({
      where: { status: 'PUBLISHED' }
    })
  ])

  const affiliateLinksResolved = await Promise.all(
    affiliateLinks.map(async (link) => {
      const resolved = await resolveAmazonLink(link.url)
      return {
        ...link,
        resolvedUrl: resolved.finalUrl,
        asin: resolved.asin
      }
    })
  )

  const amazonAsins = Array.from(
    new Set(
      affiliateLinksResolved
        .map((link) => link.asin)
        .filter((asin): asin is string => Boolean(asin))
    )
  )

  const amazonDetails =
    amazonAsins.length > 0 ? await getAmazonItems(amazonAsins) : {}

  const affiliateLinksWithMeta = affiliateLinksResolved.map((link) => ({
    ...link,
    amazon: link.asin ? amazonDetails[link.asin] : undefined
  }))

  const getRetailerFromHost = (href?: string | null) => {
    if (!href) return null
    try {
      const host = new URL(href).hostname.replace(/^www\./, '')
      if (!host) return null
      if (host.includes('amazon')) return 'Amazon'
      if (host.includes('walmart')) return 'Walmart'
      if (host.includes('target')) return 'Target'
      const base = host.split('.')[0]
      return base
        .replace(/[-_]/g, ' ')
        .replace(/\b\w/g, (char) => char.toUpperCase())
    } catch {
      return null
    }
  }

  const formatRetailerName = (link: {
    title: string
    resolvedUrl?: string
    url?: string
    amazon?: { title?: string; brand?: string }
  }) => {
    const hostName = getRetailerFromHost(link.resolvedUrl || link.url || null)
    if (hostName) return hostName
    if (link.amazon?.brand) return link.amazon.brand
    if (link.amazon?.title) return 'Amazon'
    const cleanedTitle = link.title.trim()
    if (cleanedTitle && !/check price|availability|click here/i.test(cleanedTitle)) {
      return cleanedTitle
    }
    return 'Verified retailer'
  }

  const buildRetailerKey = (link: {
    asin?: string
    resolvedUrl?: string
    url?: string
    title: string
  }) => {
    if (link.asin) return `asin:${link.asin}`
    const host = getRetailerFromHost(link.resolvedUrl || link.url || '')
    if (host) return `host:${host.toLowerCase()}`
    if (link.title) return `title:${slugify(link.title.toLowerCase())}`
    return `fallback:${link.resolvedUrl || link.url || ''}`
  }

  const uniqueAffiliateLinks = (() => {
    const seen = new Set<string>()
    const unique: typeof affiliateLinksWithMeta = []
    for (const link of affiliateLinksWithMeta) {
      const key = buildRetailerKey(link)
      if (seen.has(key)) continue
      seen.add(key)
      unique.push(link)
      if (unique.length >= 4) break
    }
    return unique
  })()

  const categoryBrowseItems = categoryNav.map((item) => ({
    name: item.name,
    slug: item.slug,
    count: item.articles.length
  }))

  const relatedReviewCards = relatedReviewEntries.map((item) => ({
    id: item.id,
    title: item.title,
    slug: item.slug,
    publishedAt: item.publishedAt,
    featuredImage: item.featuredImage,
    excerpt: item.excerpt,
    rating: typeof item.rating === 'number' ? Math.round(item.rating * 10) / 10 : null
  }))

  return (
    <>
      {jsonLd.map((schema, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}

      <ReviewShareBar title={review.title} url={shareUrl} />

      <article className="bg-white overflow-x-hidden">
        <div className="relative bg-gradient-to-br from-yellow-50 via-white to-orange-50 py-16 px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <nav className="mb-8">
              <ol className="flex items-center space-x-2 text-sm text-neutral-500">
                <li>
                  <Link href="/" className="hover:text-primary-600 transition-colors">
                    Home
                  </Link>
                </li>
                <li className="flex items-center">
                  <svg
                    className="mx-2 h-4 w-4 text-neutral-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                  <Link href="/reviews/" className="hover:text-primary-600 transition-colors">
                    Reviews
                  </Link>
                </li>
                <li className="flex items-center">
                  <svg
                    className="mx-2 h-4 w-4 text-neutral-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                  <span className="font-medium text-neutral-700">{review.category.name}</span>
                </li>
              </ol>
            </nav>

            <Link
              href={`/reviews/?category=${review.category.slug}`}
              className="mb-4 inline-flex items-center rounded-full bg-yellow-100 px-4 py-2 text-sm font-medium text-yellow-700 hover:bg-yellow-200 transition-colors"
            >
              {review.category.name} Review
            </Link>

            <h1 className="text-4xl font-bold text-neutral-900 sm:text-5xl">{review.title}</h1>

            {review.excerpt && (
              <p className="mt-4 text-lg text-neutral-600">{review.excerpt}</p>
            )}

            <div className="mt-6 flex flex-wrap items-center gap-6">
              {renderStars(review.rating)}
              <div className="text-sm text-neutral-500">
                {review.publishedAt ? (
                  <>
                    Published {formatDate(review.publishedAt)}{' '}
                    <span className="mx-1 text-neutral-400">-</span>
                    Updated {formatDate(review.updatedAt)}
                  </>
                ) : (
                  <>Updated {formatDate(review.updatedAt)}</>
                )}
              </div>
            </div>
          </div>
        </div>

        {review.featuredImage && (
          <div className="-mt-12 px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-6xl overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-2xl">
              <Image
                src={review.featuredImage}
                alt={review.title}
                width={1600}
                height={900}
                className="h-80 w-full object-cover sm:h-96 lg:h-[26rem]"
                priority
              />
            </div>
          </div>
        )}

        <div className="mx-auto max-w-7xl px-4 pb-16 pt-20 sm:px-6 lg:px-8 overflow-x-hidden">
          <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_320px]">
            <div className="space-y-12 min-w-0 overflow-x-hidden">

              <section className="rounded-2xl border border-neutral-200 bg-neutral-50 p-6 sm:p-8">
                <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-neutral-500">Reviewed by</p>
                    <Link
                      href={`/${primaryReviewer.route}/${primaryReviewer.slug}/`}
                      className="mt-2 flex items-center space-x-3 transition-colors hover:text-primary-600"
                    >
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-yellow-200 to-orange-300 text-lg font-semibold text-orange-700">
                        {primaryReviewer.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-semibold text-neutral-900">{primaryReviewer.name}</div>
                        {primaryReviewer.bio && (
                          <p className="text-sm text-neutral-600 line-clamp-2">{primaryReviewer.bio}</p>
                        )}
                      </div>
                    </Link>
                    {additionalReviewers.length > 0 && (
                      <p className="mt-3 text-xs text-neutral-500">
                        Also reviewed by{' '}
                        {additionalReviewers.map((reviewer, index) => (
                          <span key={reviewer.id}>
                            <Link
                              href={`/${reviewer.route}/${reviewer.slug}/`}
                              className="text-primary-600 hover:underline"
                            >
                              {reviewer.name}
                            </Link>
                            {index < additionalReviewers.length - 1 ? ', ' : ''}
                          </span>
                        ))}
                      </p>
                    )}
                  </div>

                  {typeof review.rating === 'number' && (
                    <div className="rounded-xl bg-yellow-100 p-4">
                      <p className="text-sm text-neutral-500">Overall rating</p>
                      <div className="mt-2">{renderStars(review.rating)}</div>
                    </div>
                  )}
                </div>
              </section>

              <section
                className="review-prose prose prose-lg prose-headings:font-semibold prose-a:text-primary-600 prose-a:no-underline hover:prose-a:underline prose-img:rounded-lg prose-img:shadow mb-12 mt-12 max-w-none"
                dangerouslySetInnerHTML={{ __html: enhancedContent }}
              />

              {uniqueAffiliateLinks.length > 0 && (
                <section className="mb-16 overflow-hidden rounded-3xl border border-sky-100 bg-gradient-to-br from-sky-50 via-white to-indigo-50 shadow-lg shadow-sky-100/50">
                  <div className="flex flex-col gap-6 px-8 py-10 lg:flex-row lg:items-center lg:justify-between">
                    <div className="max-w-xl space-y-3">
                      <span className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-1 text-xs font-semibold uppercase tracking-wide text-sky-600 shadow-sm">
                        <ShoppingBagIcon className="h-4 w-4" />
                        Shop smarter
                      </span>
                      <h2 className="text-3xl font-semibold text-neutral-900">Where to buy</h2>
                      <p className="text-sm text-neutral-600">
                        We only link to retailers we trust. Pricing and availability were checked during our most recent lab audit.
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-3 text-xs text-neutral-500">
                      <span className="inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-2 shadow-sm">
                        <ShieldCheckIcon className="h-4 w-4 text-sky-500" />
                        Verified retailers
                      </span>
                      <span className="inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-2 shadow-sm">
                        <CheckIcon className="h-4 w-4 text-emerald-500" />
                        Expert reviewed
                      </span>
                    </div>
                  </div>
                  <div className="border-t border-sky-100 bg-white/70 px-8 py-8">
                    <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                      {uniqueAffiliateLinks.map((link, index) => (
                        <a
                          key={`${link.title}-${index}`}
                          href={link.amazon?.detailPageUrl ?? link.resolvedUrl}
                          target="_blank"
                          rel="noopener noreferrer nofollow"
                          className="group flex h-full flex-col justify-between rounded-2xl border border-transparent bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-sky-200 hover:shadow-lg"
                        >
                          <div className="space-y-3">
                            <div className="flex items-center justify-between text-xs uppercase tracking-wide text-neutral-400">
                              <span>Retailer</span>
                              <ArrowTopRightOnSquareIcon className="h-4 w-4 text-neutral-300 transition-colors group-hover:text-sky-500" />
                            </div>
                            <h3 className="text-lg font-semibold text-neutral-900 transition-colors group-hover:text-sky-600">
                              {formatRetailerName(link)}
                            </h3>
                            {(link.amazon?.price?.display || link.price) && (
                              <p className="text-2xl font-bold text-sky-600">
                                {link.amazon?.price?.display ?? link.price}
                              </p>
                            )}
                          </div>
                          <div className="mt-4 inline-flex items-center justify-center gap-2 rounded-full bg-sky-600 px-5 py-2 text-sm font-semibold text-white transition-colors group-hover:bg-sky-700">
                            Check availability
                          </div>
                        </a>
                      ))}
                    </div>
                    <p className="mt-6 text-center text-sm text-neutral-500">
                      * Some of the links above are affiliate links. We may earn a commission if you make a purchase.
                    </p>
                  </div>
                </section>
              )}

              {faqs.length > 0 && (
                <section className="mb-12 rounded-3xl border border-neutral-200 bg-white/95 p-8 shadow-lg shadow-sky-50">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <h2 className="text-2xl font-semibold text-neutral-900">Frequently asked questions</h2>
                      <p className="mt-1 text-sm text-neutral-500">
                        Clinical reviewers answered the questions parents ask us most about this product.
                      </p>
                    </div>
                  </div>
                  <div className="mt-6 space-y-3">
                    {faqs.map((item, index) => (
                      <details
                        key={item.question}
                        className="group overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm transition-shadow hover:shadow-md"
                        open={index === 0 ? true : undefined}
                      >
                        <summary className="flex cursor-pointer items-center justify-between gap-4 px-5 py-4 text-left text-neutral-900 transition-colors hover:bg-sky-50/60 [&::-webkit-details-marker]:hidden">
                          <span className="flex items-center gap-3">
                            <span className="flex h-8 w-8 flex-none items-center justify-center rounded-full bg-sky-100 text-sm font-semibold text-sky-600">
                              {String(index + 1).padStart(2, '0')}
                            </span>
                            <span className="text-base font-semibold leading-snug">{item.question}</span>
                          </span>
                          <span className="inline-flex h-7 w-7 flex-none items-center justify-center rounded-full bg-neutral-100 text-neutral-500 transition-transform duration-200 group-open:rotate-180">
                            <ChevronDownIcon className="h-4 w-4" />
                          </span>
                        </summary>
                        <div className="border-t border-neutral-100 bg-sky-50/60 px-6 py-4 text-sm text-neutral-700">
                          {item.answer.map((paragraph, answerIndex) => (
                            <p key={answerIndex} className={answerIndex > 0 ? 'mt-3' : undefined}>
                              {paragraph}
                            </p>
                          ))}
                        </div>
                      </details>
                    ))}
                  </div>
                </section>
              )}

              {relatedReviewCards.length > 0 && (
                <section className="mb-16 rounded-3xl border border-neutral-100 bg-white p-8 shadow-lg shadow-slate-100">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <h2 className="text-2xl font-semibold text-neutral-900">More pediatric product reviews</h2>
                      <p className="mt-1 text-sm text-neutral-500">
                        Explore additional hands-on tests from the same clinical review team.
                      </p>
                    </div>
                    <Link
                      href="/reviews/"
                      className="inline-flex items-center gap-2 rounded-full border border-neutral-200 px-4 py-2 text-sm font-semibold text-sky-600 hover:border-sky-200 hover:bg-sky-50"
                    >
                      Browse all reviews
                      <ArrowTopRightOnSquareIcon className="h-4 w-4" />
                    </Link>
                  </div>
                  <div className="mt-8 overflow-x-auto pb-4">
                    <div className="flex gap-6 snap-x snap-mandatory">
                      {relatedReviewCards.map((item) => (
                        <Link
                          key={item.id}
                          href={`/${item.slug}/`}
                          className="group min-w-[280px] snap-center overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm transition-all hover:-translate-y-1 hover:border-sky-200 hover:shadow-lg md:min-w-[320px]"
                        >
                          <div className="aspect-[4/3] w-full overflow-hidden bg-sky-50">
                            {item.featuredImage ? (
                              <Image
                                src={item.featuredImage}
                                alt={item.title}
                                width={320}
                                height={240}
                                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-sky-100 via-white to-indigo-100 text-sm font-semibold text-sky-600">
                                Pediatric Review
                              </div>
                            )}
                          </div>
                          <div className="space-y-3 p-6">
                            <div className="flex items-center gap-3 text-xs text-neutral-500">
                              {item.publishedAt && <span>{formatDate(item.publishedAt)}</span>}
                              {item.rating !== null && (
                                <span className="inline-flex items-center gap-1 rounded-full bg-sky-50 px-2 py-1 text-xs font-semibold text-sky-600">
                                  <StarIcon className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                  {item.rating.toFixed(1)}
                                </span>
                              )}
                            </div>
                            <h3 className="text-lg font-semibold text-neutral-900 transition-colors group-hover:text-sky-600">
                              {item.title}
                            </h3>
                            {item.excerpt && (
                              <p className="line-clamp-3 text-sm text-neutral-600">
                                {item.excerpt}
                              </p>
                            )}
                            <span className="inline-flex items-center gap-2 text-sm font-semibold text-sky-600">
                              Read full review
                              <ArrowTopRightOnSquareIcon className="h-4 w-4" />
                            </span>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                </section>
              )}

              <div className="mt-16 flex justify-center">
                <Link
                  href="/reviews/"
                  className="inline-flex items-center rounded-lg bg-gradient-to-r from-yellow-500 to-orange-500 px-6 py-3 text-white shadow-lg transition-all duration-200 hover:from-yellow-600 hover:to-orange-600 hover:shadow-xl"
                >
                  Back to reviews
                </Link>
              </div>
            </div>

            <aside className="space-y-8">
              <FloatingTOC items={tocItems} />

              {quickFacts.length > 0 && (
                <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
                  <h3 className="text-lg font-semibold text-neutral-900">Quick facts</h3>
                  <dl className="mt-4 space-y-4 text-sm">
                    {quickFacts.map((fact) => (
                      <div key={fact.label} className="flex items-start justify-between gap-3">
                        <dt className="font-medium text-neutral-500">{fact.label}</dt>
                        <dd className="text-right text-neutral-800">{fact.value}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              )}

              <DirectorySidebar
                categoryName={review.category?.name ?? 'Reviews'}
                siblingCategories={categoryBrowseItems}
                relatedArticles={relatedReviewCards}
                categoryLinkBuilder={(slug) => `/reviews/?category=${slug}`}
                articleLinkBuilder={(slug) => `/${slug}/`}
                activeCategorySlug={review.category?.slug ?? null}
                allCategoryLink={{
                  label: 'All reviews',
                  href: '/reviews/',
                  count: totalReviewCount
                }}
              />
            </aside>
          </div>
        </div>
      </article>
    </>
  )
}

export default async function ReviewPage({ params }: PageProps) {
  const { slug } = await params
  const review = await getReview(slug)

  if (!review) {
    notFound()
  }

  redirect(`/${review.slug}/`)
}
