'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { formatDate } from '@/lib/utils'

type CategorySummary = {
  name?: string | null
}

export type AuthorContentEntry = {
  id: string
  slug: string
  title: string
  excerpt?: string | null
  featuredImage?: string | null
  publishedAt?: string | null
  category?: CategorySummary | null
  rating?: number | null
  metaTag?: string | null
}

interface AuthorContentGridProps {
  items: AuthorContentEntry[]
  variant: 'article' | 'review'
  initialCount?: number
  loadStep?: number
}

export function AuthorContentGrid({
  items,
  variant,
  initialCount = 15,
  loadStep = 15
}: AuthorContentGridProps) {
  const [visible, setVisible] = useState(initialCount)
  const visibleItems = items.slice(0, visible)
  const hasMore = visible < items.length

  const badgeClasses =
    variant === 'review'
      ? 'bg-indigo-50 text-indigo-700'
      : 'bg-primary-50 text-primary-700'

  const hoverBorder =
    variant === 'review' ? 'hover:border-indigo-200' : 'hover:border-primary-200'

  const buttonTone =
    variant === 'review'
      ? 'border-indigo-200 text-indigo-700 hover:border-indigo-300 hover:bg-indigo-50'
      : 'border-primary-200 text-primary-700 hover:border-primary-300 hover:bg-primary-50'

  const loadMore = () => {
    setVisible((prev) => Math.min(prev + loadStep, items.length))
  }

  return (
    <div className="space-y-8">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {visibleItems.map((item) => (
          <Link
            key={item.id}
            href={`/${item.slug}/`}
            className={`group flex h-full flex-col rounded-3xl border border-neutral-200 bg-white/95 p-5 shadow-sm transition-all duration-200 hover:-translate-y-1 ${hoverBorder} hover:shadow-xl`}
          >
            <div className="relative mb-4 h-40 w-full overflow-hidden rounded-2xl bg-neutral-100">
              {item.featuredImage ? (
                <Image
                  src={item.featuredImage}
                  alt={item.title}
                  fill
                  className="object-cover transition duration-300 group-hover:scale-105"
                  sizes="(min-width: 1024px) 320px, 100vw"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-neutral-400">
                  No image
                </div>
              )}
            </div>
            <div className="flex flex-1 flex-col gap-3">
              <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-neutral-500">
                {item.category?.name && (
                  <span className={`rounded-full px-3 py-1 ${badgeClasses}`}>
                    {item.category.name}
                  </span>
                )}
                {item.metaTag && (
                  <span className="rounded-full border border-neutral-200 px-3 py-1 text-[10px] text-neutral-600">
                    {item.metaTag}
                  </span>
                )}
                {item.publishedAt && (
                  <time dateTime={item.publishedAt} className="text-neutral-500">
                    {formatDate(new Date(item.publishedAt))}
                  </time>
                )}
              </div>
              <h3 className="text-xl font-semibold leading-snug text-neutral-900">
                {item.title}
              </h3>
              {item.excerpt && (
                <p className="text-sm text-neutral-600 line-clamp-3">{item.excerpt}</p>
              )}
              {variant === 'review' && typeof item.rating === 'number' && (
                <div className="text-sm font-semibold text-indigo-600">
                  Rating: {item.rating.toFixed(1)} / 5
                </div>
              )}
              <div
                className={`mt-auto text-sm font-semibold ${
                  variant === 'review' ? 'text-indigo-600' : 'text-primary-600'
                }`}
              >
                Read {variant === 'review' ? 'review' : 'article'} →
              </div>
            </div>
          </Link>
        ))}
      </div>

      {hasMore && (
        <div className="flex justify-center">
          <button
            type="button"
            onClick={loadMore}
            className={`rounded-full border px-6 py-2 text-sm font-semibold transition ${buttonTone}`}
          >
            Load more
          </button>
        </div>
      )}
    </div>
  )
}
