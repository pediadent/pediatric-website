import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { formatDate, slugify } from '@/lib/utils'
import { Metadata } from 'next'
import { ClockIcon } from '@heroicons/react/24/outline'
import { ReviewShareBar } from '@/components/reviews/ReviewShareBar'
import { DirectorySidebar } from '@/components/directory/DirectorySidebar'
import FloatingTOC from '@/components/layout/FloatingTOC'

export interface PageProps {
  params: Promise<{
    slug: string
  }>
}

export async function getArticle(slug: string) {
  const article = await prisma.article.findUnique({
    where: {
      slug,
      status: 'PUBLISHED'
    },
    include: {
      author: true,
      category: true
    }
  })

  return article
}

export type ArticleWithRelations =
  NonNullable<Awaited<ReturnType<typeof getArticle>>> & {
    faqHeading?: string | null
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
              const answerParagraphs = answer
                .split(/\r?\n+/)
                .map((segment) => segment.trim())
                .filter((segment) => segment.length > 0)
              return { question, answer: answerParagraphs }
            }
          }
          return null
        })
        .filter(
          (item): item is { question: string; answer: string[] } => item !== null
        )
    }
  } catch (error) {
    console.warn('Failed to parse article FAQs', error)
  }

  return []
}

const estimateReadingTimeMinutes = (html: string): number => {
  const text = html.replace(/<[^>]*>/g, ' ')
  const words = text.trim().split(/\s+/).filter(Boolean)
  if (words.length === 0) return 1
  return Math.max(1, Math.round(words.length / 220))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const article = await getArticle(slug)

  if (!article) {
    return {
      title: 'Article Not Found'
    }
  }

  return buildArticleMetadata(article)
}

export function buildArticleMetadata(article: ArticleWithRelations): Metadata {
  return {
    title: article.seoTitle || article.title,
    description: article.seoDescription || article.excerpt || undefined,
    openGraph: {
      title: article.seoTitle || article.title,
      description: article.seoDescription || article.excerpt || undefined,
      images: article.featuredImage ? [article.featuredImage] : undefined,
      type: 'article',
      publishedTime: article.publishedAt?.toISOString(),
      modifiedTime: article.updatedAt.toISOString(),
      authors: [article.author.name]
    },
    robots: {
      index: !article.isNoIndex,
      follow: !article.isNoFollow
    }
  }
}

export default async function ArticlePage({ params }: PageProps) {
  const { slug } = await params
  const article = await getArticle(slug)

  if (!article) {
    notFound()
  }

  return <ArticlePageContent article={article} />
}

export async function ArticlePageContent({ article }: { article: ArticleWithRelations }) {
  const headingOccurrences = new Map<string, number>()
  const tocItems: Array<{ id: string; label: string; level: number; order: number }> = []
  let h2Counter = 0

  const enhancedContent = article.content.replace(/<h([2-3])([^>]*)>(.*?)<\/h\1>/gi, (match, level, attrs, inner) => {
    const plainText = inner.replace(/<[^>]*>/g, '').trim()
    if (!plainText) {
      return match
    }

    const baseId = slugify(plainText) || `section-${tocItems.length + 1}`
    const count = headingOccurrences.get(baseId) ?? 0
    headingOccurrences.set(baseId, count + 1)
    const id = count === 0 ? baseId : `${baseId}-${count + 1}`

    const headingLevel = Number(level)
    if (headingLevel === 2) {
      h2Counter += 1
      tocItems.push({ id, label: plainText, level: 2, order: h2Counter })
    } else if (headingLevel === 3) {
      tocItems.push({ id, label: plainText, level: 3, order: h2Counter })
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

  const [categoryNav, relatedArticleEntries] = await Promise.all([
    prisma.category.findMany({
      where: {
        articles: {
          some: { status: 'PUBLISHED' }
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
      orderBy: {
        name: 'asc'
      }
    }),
    prisma.article.findMany({
      where: {
        status: 'PUBLISHED',
        categoryId: article.categoryId ?? article.category.id,
        id: {
          not: article.id
        }
      },
      orderBy: {
        publishedAt: 'desc'
      },
      take: 5,
      select: {
        id: true,
        title: true,
        slug: true,
        publishedAt: true
      }
    })
  ])

  const categoryBrowseItems = categoryNav
    .map((item) => ({
      name: item.name,
      slug: item.slug,
      count: item.articles.length
    }))
    .filter((item) => item.count > 0)

  const relatedArticleCards = relatedArticleEntries.map((item) => ({
    id: item.id,
    title: item.title,
    slug: item.slug,
    publishedAt: item.publishedAt
  }))

  const faqs = parseFaqEntries(article.faqs)
  const readingTimeMinutes = estimateReadingTimeMinutes(article.content)
  const siteBaseUrl =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') ||
    'https://pediatricdentistinqueensny.com'
  const shareUrl = `${siteBaseUrl}/${article.slug}/`

  // Import schema generators at the top of the file
  const { generateBlogPostSchema, generateBreadcrumbSchema, generateFAQSchema } = await import('@/lib/schema-generator')

  // Article Schema
  const articleSchema = article.schema ? JSON.parse(article.schema) : generateBlogPostSchema({
    title: article.title,
    description: article.excerpt || article.title,
    url: shareUrl,
    author: {
      name: article.author.name,
      url: `${siteBaseUrl}/authors/${article.author.slug}/`,
      image: article.author.avatar || undefined
    },
    datePublished: article.publishedAt?.toISOString() || new Date().toISOString(),
    dateModified: article.updatedAt.toISOString(),
    image: article.featuredImage ? {
      url: article.featuredImage.startsWith('http') ? article.featuredImage : `${siteBaseUrl}${article.featuredImage}`,
      caption: article.title
    } : undefined
  })

  // Breadcrumb Schema
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: siteBaseUrl },
    { name: article.category.name, url: `${siteBaseUrl}/${article.category.slug}/` },
    { name: article.title, url: shareUrl }
  ])

  // FAQ Schema (if FAQs exist)
  const faqSchema = faqs.length > 0 ? generateFAQSchema(
    faqs.map(faq => ({
      question: faq.question,
      answer: faq.answer
    }))
  ) : null

  // Combine all schemas
  const jsonLd = [articleSchema, breadcrumbSchema, faqSchema].filter(Boolean)

  const displayTocItems =
    tocItems.length > 0 && tocItems.some((item) => item.level === 2)
      ? tocItems
      : tocItems.map((item, index) => ({
          ...item,
          level: 2,
          order: index + 1
        }))

  const faqHeadingText = article.faqHeading?.trim() || 'Frequently asked questions'

  return (
    <>
      {jsonLd.map((schema, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}

      <ReviewShareBar title={article.title} url={shareUrl} />

      <article className="bg-white">
        {/* Hero Section */}
        <div className="relative bg-gradient-to-br from-yellow-50 via-white to-orange-50 py-16 px-4 sm:px-6 lg:px-8 lg:py-20">
          <div className="mx-auto max-w-6xl">
            {/* Breadcrumbs */}
            <nav className="mb-8">
              <ol className="flex items-center space-x-2 text-sm text-neutral-500">
                <li>
                  <Link href="/" className="hover:text-primary-600 transition-colors">
                    Home
                  </Link>
                </li>
                <li className="flex items-center">
                  <svg className="w-4 h-4 mx-2 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                  <Link
                    href={`/${article.category.slug}/`}
                    className="font-medium text-neutral-800 hover:text-primary-600 transition-colors"
                  >
                    {article.category.name}
                  </Link>
                </li>
              </ol>
            </nav>

            {/* Category Badge */}
            <div className="mb-4">
              <Link
                href={`/${article.category.slug}/`}
                className="inline-flex items-center rounded-full bg-yellow-100 px-4 py-2 text-sm font-medium text-yellow-700 transition-colors hover:bg-yellow-200"
              >
                {article.category.name}
              </Link>
            </div>

            {/* Title */}
            <h1 className="text-4xl font-bold text-neutral-900 sm:text-5xl">
              {article.title}
            </h1>

            {/* Excerpt */}
            {article.excerpt && (
              <p className="mt-4 max-w-3xl text-lg text-neutral-600">
                {article.excerpt}
              </p>
            )}

            {/* Meta Info */}
            <div className="mt-6 flex flex-wrap items-center gap-6 text-sm text-neutral-500">
              <span className="inline-flex items-center gap-2 font-medium text-neutral-800">
                By {article.author.name}
              </span>
              <span>
                Published {article.publishedAt ? formatDate(article.publishedAt) : formatDate(article.createdAt)}
              </span>
              <span>Updated {formatDate(article.updatedAt)}</span>
              <span className="inline-flex items-center gap-2">
                <ClockIcon className="h-4 w-4 text-neutral-400" />
                {readingTimeMinutes} min read
              </span>
            </div>
          </div>
        </div>

        {/* Featured Image */}
        <div className="-mt-12 px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-2xl">
            {article.featuredImage ? (
              <Image
                src={article.featuredImage}
                alt={article.title}
                width={1600}
                height={900}
                className="h-80 w-full object-cover sm:h-96 lg:h-[26rem]"
                priority
              />
            ) : (
              <div className="flex h-80 w-full flex-col items-center justify-center gap-2 bg-gradient-to-br from-blue-50 via-white to-purple-50 text-center sm:h-96 lg:h-[26rem]">
                <div className="text-2xl font-semibold text-neutral-700">Featured image coming soon</div>
                <p className="max-w-sm text-sm text-neutral-500">
                  Add a featured image in the article settings to showcase this story.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="mx-auto max-w-7xl px-4 pb-16 pt-20 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_320px]">
            <div className="space-y-12 min-w-0">
              <div
                className="prose prose-lg prose-blue max-w-none prose-headings:font-bold prose-h2:text-3xl prose-h3:text-2xl prose-p:leading-relaxed prose-a:text-primary-600 prose-a:no-underline hover:prose-a:underline prose-img:rounded-xl prose-img:shadow-lg"
                dangerouslySetInnerHTML={{ __html: enhancedContent }}
              />

              {faqs.length > 0 && (
                <section className="rounded-3xl border border-neutral-200 bg-white/95 p-8 shadow-lg shadow-sky-50">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <h2 className="text-2xl font-semibold text-neutral-900">{faqHeadingText}</h2>
                      <p className="mt-1 text-sm text-neutral-500">
                        Answers to the questions we hear most often about this topic.
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

              <div className="mt-16 space-y-10 border-t border-neutral-200 pt-10">
                <section className="rounded-3xl border border-neutral-200 bg-white p-8 shadow-sm">
                  <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-4">
                      <div className="relative h-16 w-16 overflow-hidden rounded-full border border-neutral-200 bg-neutral-100">
                        {article.author.avatar ? (
                          <Image
                            src={article.author.avatar}
                            alt={article.author.name}
                            fill
                            className="object-cover"
                            sizes="64px"
                          />
                        ) : (
                          <span className="flex h-full w-full items-center justify-center text-lg font-semibold text-primary-700">
                            {article.author.name.charAt(0)}
                          </span>
                        )}
                      </div>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-neutral-500">
                          Author
                        </p>
                        <Link
                          href={`/authors/${article.author.slug}/`}
                          className="mt-1 block text-xl font-semibold text-neutral-900 transition-colors hover:text-primary-600"
                        >
                          {article.author.name}
                        </Link>
                        {article.author.bio && (
                          <p className="mt-2 text-sm leading-relaxed text-neutral-600">
                            {article.author.bio}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="mt-6 flex flex-wrap gap-3">
                    <Link
                      href={`/authors/${article.author.slug}/`}
                      className="inline-flex items-center gap-2 rounded-full border border-primary-200 bg-white px-5 py-2 text-sm font-semibold text-primary-700 shadow-sm transition hover:bg-primary-50"
                    >
                      View author profile
                    </Link>
                    <Link
                      href={`/${article.category.slug}/`}
                      className="inline-flex items-center gap-2 rounded-full border border-primary-200 bg-white px-5 py-2 text-sm font-medium text-primary-700 shadow-sm transition hover:bg-primary-50"
                    >
                      More {article.category.name} guides
                    </Link>
                  </div>
                </section>

                <div className="flex justify-center">
                  <Link
                    href={`/${article.category.slug}/`}
                    className="inline-flex items-center gap-2 rounded-full border border-primary-200 bg-white px-6 py-3 text-sm font-semibold text-primary-700 shadow-sm transition hover:bg-primary-50"
                  >
                    <span aria-hidden>{'<'}</span>
                    Back to {article.category.name}
                  </Link>
                </div>
              </div>
            </div>

            <aside className="space-y-8">
              <FloatingTOC items={displayTocItems} />

              <DirectorySidebar
                categoryName={article.category.name}
                siblingCategories={categoryBrowseItems}
                relatedArticles={relatedArticleCards}
                categoryLinkBuilder={(slug) => `/${slug}/`}
                articleLinkBuilder={(slug) => `/${slug}/`}
                activeCategorySlug={article.category.slug}
                allCategoryLink={{
                  label: `More ${article.category.name}`,
                  href: `/${article.category.slug}/`,
                  count: categoryBrowseItems.find((item) => item.slug === article.category.slug)?.count
                }}
              />
            </aside>
          </div>
        </div>
      </article>
    </>
  )
}





