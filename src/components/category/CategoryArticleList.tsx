'use client'

import { useMemo, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { CalendarDaysIcon, UserIcon } from '@heroicons/react/24/outline'

import { formatDate } from '@/lib/utils'

type ArticleListItem = {
  id: string
  title: string
  slug: string
  excerpt: string | null
  featuredImage: string | null
  publishedAt: string | null
  author: {
    name: string
    slug?: string | null
  } | null
  category: {
    name: string
    slug: string
  }
}

const PAGE_SIZE = 10

type Variant = 'oral-health-tips' | 'news' | 'salary'

const VARIANT_STYLES: Record<
  Variant,
  {
    placeholderGradient: string
    accentText: string
    accentHoverText: string
    authorIcon: string
    placeholderLabel: string
    readLabel: string
  }
> = {
  'oral-health-tips': {
    placeholderGradient: 'from-emerald-100 to-sky-100',
    accentText: 'text-emerald-600',
    accentHoverText: 'hover:text-emerald-700',
    authorIcon: 'text-emerald-500',
    placeholderLabel: 'Oral Health Tips',
    readLabel: 'Read guide'
  },
  news: {
    placeholderGradient: 'from-indigo-100 to-sky-100',
    accentText: 'text-sky-600',
    accentHoverText: 'hover:text-sky-700',
    authorIcon: 'text-sky-500',
    placeholderLabel: 'Latest News',
    readLabel: 'Read update'
  },
  salary: {
    placeholderGradient: 'from-sky-100 to-indigo-100',
    accentText: 'text-sky-600',
    accentHoverText: 'hover:text-sky-700',
    authorIcon: 'text-sky-500',
    placeholderLabel: 'Salary Insights',
    readLabel: 'Read article'
  }
}

interface CategoryArticleListProps {
  categorySlug: string
  initialArticles: ArticleListItem[]
  totalCount: number
  variant: Variant
  emptyState: {
    title: string
    description: string
  }
}

export function CategoryArticleList({
  categorySlug,
  initialArticles,
  totalCount,
  variant,
  emptyState
}: CategoryArticleListProps) {
  const [articles, setArticles] = useState<ArticleListItem[]>(initialArticles)
  const [offset, setOffset] = useState(initialArticles.length)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const hasMore = offset < totalCount
  const styles = VARIANT_STYLES[variant]

  const handleLoadMore = async () => {
    if (isLoading || !hasMore) return
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(
        `/api/categories/${categorySlug}/articles?offset=${offset}&limit=${PAGE_SIZE}`,
        { cache: 'no-store' }
      )

      if (!response.ok) {
        throw new Error('Unable to load more articles')
      }

      const data = await response.json()
      setArticles((prev) => [...prev, ...(data.items ?? [])])
      setOffset((prev) => prev + (data.items?.length ?? 0))
    } catch (fetchError) {
      const message =
        fetchError instanceof Error ? fetchError.message : 'Unable to load more articles'
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }

  const content = useMemo(() => {
    if (articles.length === 0) {
      return (
        <div className="rounded-3xl border border-neutral-200 bg-white px-8 py-16 text-center shadow-sm">
          <h2 className="text-2xl font-semibold text-neutral-900">{emptyState.title}</h2>
          <p className="mt-4 text-neutral-600">{emptyState.description}</p>
        </div>
      )
    }

    return articles.map((article) => (
      <article
        key={article.id}
        className="group overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
      >
        <div className="grid gap-0 md:grid-cols-[280px_minmax(0,1fr)]">
          <div className="relative h-60 overflow-hidden md:h-full">
            {article.featuredImage ? (
              <Image
                src={article.featuredImage}
                alt={article.title}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
            ) : (
              <div
                className={`flex h-full items-center justify-center bg-gradient-to-br ${styles.placeholderGradient}`}
              >
                <span className={`text-lg font-semibold ${styles.accentText}`}>
                  {styles.placeholderLabel}
                </span>
              </div>
            )}
            <div className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-neutral-700 shadow">
              {article.category.name}
            </div>
          </div>

          <div className="flex flex-col justify-between p-8 min-w-0">
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-neutral-900 md:text-3xl">
                <Link
                  href={`/${article.slug}/`}
                  className={`${styles.accentText} ${styles.accentHoverText}`}
                >
                  {article.title}
                </Link>
              </h2>
              {article.excerpt && <p className="text-neutral-600">{article.excerpt}</p>}
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-neutral-500">
              {article.author?.name && (
                <div className="flex items-center gap-2 text-neutral-600">
                  <UserIcon className={`h-4 w-4 ${styles.authorIcon}`} />
                  <span className="font-medium text-neutral-800">{article.author.name}</span>
                </div>
              )}

              {article.publishedAt && (
                <div className="flex items-center gap-2">
                  <CalendarDaysIcon className="h-4 w-4 text-neutral-400" />
                  <span>{formatDate(article.publishedAt)}</span>
                </div>
              )}

              <Link
                href={`/${article.slug}/`}
                className={`ml-auto inline-flex items-center gap-2 font-semibold ${styles.accentText} ${styles.accentHoverText}`}
              >
                {styles.readLabel}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </article>
    ))
  }, [articles, emptyState.description, emptyState.title, styles])

  return (
    <div className="space-y-10 min-w-0">
      {content}

      {error && (
        <p className="text-center text-sm text-red-600" role="alert">
          {error}
        </p>
      )}

      {hasMore && (
        <div className="flex justify-center">
          <button
            type="button"
            onClick={handleLoadMore}
            disabled={isLoading}
            className={`inline-flex items-center rounded-full border border-neutral-300 bg-white px-8 py-3 text-sm font-semibold text-neutral-700 shadow-sm transition hover:border-neutral-400 ${isLoading ? 'cursor-not-allowed opacity-70' : ''}`}
          >
            {isLoading ? 'Loading...' : 'Load more articles'}
          </button>
        </div>
      )}
    </div>
  )
}
