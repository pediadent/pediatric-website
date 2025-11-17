'use client'

import { useMemo, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { CalendarDaysIcon, StarIcon, UserIcon } from '@heroicons/react/24/outline'

import { formatDate } from '@/lib/utils'

export type ReviewListItem = {
  id: string
  title: string
  slug: string
  excerpt: string | null
  featuredImage: string | null
  rating: number | null
  publishedAt: string | null
  author: {
    name: string
    slug?: string | null
  } | null
  primaryReviewer: {
    name: string
    slug?: string | null
  } | null
  category: {
    name: string
    slug: string
  } | null
}

interface ReviewListProps {
  initialReviews: ReviewListItem[]
  totalCount: number
  categorySlug: string | null
}

const PAGE_SIZE = 10

const buildRatingStars = (rating: number | null, size: 'sm' | 'md' = 'md') => {
  if (!rating || rating <= 0) return null
  const fullStars = Math.round(rating)
  const starSize = size === 'sm' ? 'h-4 w-4' : 'h-5 w-5'

  return (
    <div className="flex items-center gap-1 text-amber-500">
      {Array.from({ length: 5 }).map((_, index) => (
        <StarIcon
          key={index}
          className={`${starSize} ${index < fullStars ? 'fill-amber-400 text-amber-500' : 'text-amber-200'}`}
        />
      ))}
      <span className="ml-2 text-sm font-semibold text-amber-600">{rating.toFixed(1)}</span>
    </div>
  )
}

export function ReviewList({ initialReviews, totalCount, categorySlug }: ReviewListProps) {
  const [reviews, setReviews] = useState<ReviewListItem[]>(initialReviews)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const hasMore = reviews.length < totalCount

  const handleLoadMore = async () => {
    if (!hasMore || isLoading) return
    setIsLoading(true)
    setError(null)

    const params = new URLSearchParams({
      offset: `${reviews.length}`,
      limit: `${PAGE_SIZE}`
    })
    if (categorySlug) {
      params.set('category', categorySlug)
    }

    try {
      const response = await fetch(`/api/reviews?${params.toString()}`, {
        cache: 'no-store'
      })

      if (!response.ok) {
        throw new Error('Unable to load more reviews')
      }

      const data = await response.json()
      const newItems: ReviewListItem[] = data.items ?? []
      setReviews((prev) => [...prev, ...newItems])
    } catch (requestError) {
      const message =
        requestError instanceof Error ? requestError.message : 'Unable to load more reviews'
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }

  const renderedReviews = useMemo(() => {
    if (reviews.length === 0) {
      return (
        <div className="rounded-3xl border border-neutral-200 bg-white px-8 py-16 text-center shadow-sm">
          <h2 className="text-2xl text-neutral-900">More reviews coming soon</h2>
          <p className="mt-4 text-neutral-600">
            We&apos;re testing additional products. Check back shortly or explore other categories in the sidebar.
          </p>
        </div>
      )
    }

    return reviews.map((review) => (
      <article
        key={review.id}
        className="group relative overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
      >
        <div className="grid gap-0 md:grid-cols-[320px_minmax(0,1fr)]">
          <div className="relative h-64 overflow-hidden md:h-full">
            {review.featuredImage ? (
              <Image
                src={review.featuredImage}
                alt={review.title}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
            ) : (
              <div className="flex h-full items-center justify-center bg-gradient-to-br from-sky-100 to-indigo-100">
                <StarIcon className="h-16 w-16 text-sky-400" />
              </div>
            )}
            {review.category && (
              <div className="absolute left-4 top-4 rounded-full bg-white/90 px-4 py-1 text-sm font-semibold text-sky-600 shadow">
                {review.category.name}
              </div>
            )}
          </div>
          <div className="flex flex-col justify-between p-8">
            <div className="space-y-4">
              {buildRatingStars(review.rating)}
              <h2 className="text-2xl font-bold text-neutral-900 md:text-3xl">
                <Link href={`/${review.slug}/`} className="hover:text-sky-600">
                  {review.title}
                </Link>
              </h2>
              {review.excerpt && <p className="text-neutral-600">{review.excerpt}</p>}
            </div>
            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-4 text-sm text-neutral-500">
              {(review.primaryReviewer?.name || review.author?.name) && (
                <div className="flex items-center gap-2 text-neutral-600">
                  <UserIcon className="h-4 w-4 text-sky-500" />
                  <span>
                    Reviewed by{' '}
                    <span className="font-medium text-neutral-800">
                      {review.primaryReviewer?.name ?? review.author?.name}
                    </span>
                  </span>
                </div>
              )}
              {review.publishedAt && (
                <div className="flex items-center gap-2">
                  <CalendarDaysIcon className="h-4 w-4 text-neutral-400" />
                  <span>{formatDate(review.publishedAt)}</span>
                </div>
              )}
              <Link
                href={`/${review.slug}/`}
                className="ml-auto inline-flex items-center gap-2 font-semibold text-sky-600 hover:text-sky-700"
              >
                Read full review
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </article>
    ))
  }, [reviews])

  return (
    <div className="space-y-8">
      {renderedReviews}

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
            {isLoading ? 'Loading…' : 'Load more reviews'}
          </button>
        </div>
      )}
    </div>
  )
}
