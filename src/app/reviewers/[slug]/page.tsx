import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import type { Metadata } from 'next'
import { prisma } from '@/lib/prisma'
import { AuthorContentGrid } from '@/components/authors/AuthorContentGrid'

interface PageProps {
  params: {
    slug: string
  }
}

async function getReviewer(slug: string) {
  return prisma.reviewer.findUnique({
    where: { slug },
    include: {
      primaryReviews: {
        where: { status: 'PUBLISHED' },
        orderBy: { publishedAt: 'desc' },
        select: {
          id: true,
          title: true,
          slug: true,
          excerpt: true,
          rating: true,
          publishedAt: true,
          featuredImage: true,
          category: {
            select: { name: true, slug: true }
          }
        }
      },
      reviewAssignments: {
        where: {
          review: {
            status: 'PUBLISHED'
          }
        },
        include: {
          review: {
            select: {
              id: true,
              title: true,
              slug: true,
              excerpt: true,
              rating: true,
              publishedAt: true,
              featuredImage: true,
              category: {
                select: { name: true, slug: true }
              }
            }
          }
        }
      }
    }
  })
}

type ReviewerWithRelations = NonNullable<Awaited<ReturnType<typeof getReviewer>>>

const buildReviewList = (reviewer: ReviewerWithRelations) => {
  const map = new Map<
    string,
    {
      id: string
      title: string
      slug: string
      excerpt: string | null
      rating: number | null
      publishedAt: Date | null
      featuredImage: string | null
      category: { name: string; slug: string } | null
      role: 'primary' | 'supporting'
    }
  >()

  reviewer.primaryReviews.forEach((review) => {
    map.set(review.id, {
      ...review,
      category: review.category ?? null,
      publishedAt: review.publishedAt ? new Date(review.publishedAt) : null,
      role: 'primary'
    })
  })

  reviewer.reviewAssignments.forEach((assignment) => {
    const review = assignment.review
    if (!review) return
    if (map.has(review.id)) return
    map.set(review.id, {
      ...review,
      category: review.category ?? null,
      publishedAt: review.publishedAt ? new Date(review.publishedAt) : null,
      role: 'supporting'
    })
  })

  return Array.from(map.values()).sort((a, b) => {
    const aTime = a.publishedAt ? a.publishedAt.getTime() : 0
    const bTime = b.publishedAt ? b.publishedAt.getTime() : 0
    return bTime - aTime
  })
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await Promise.resolve(params)
  const reviewer = await getReviewer(slug)

  if (!reviewer) {
    return {
      title: 'Reviewer Not Found'
    }
  }

  return {
    title: reviewer.seoTitle || `${reviewer.name} - Pediatric Dental Product Reviewer`,
    description:
      reviewer.seoDescription ||
      reviewer.description ||
      reviewer.bio ||
      `${reviewer.name} shares evidence-based insights on pediatric oral health products.`,
    openGraph: {
      title: reviewer.seoTitle || reviewer.name,
      description:
        reviewer.seoDescription ||
        reviewer.description ||
        reviewer.bio ||
        `${reviewer.name} evaluates pediatric dental products.`,
      images: reviewer.featuredImage ? [reviewer.featuredImage] : undefined,
      url: `/reviewers/${reviewer.slug}/`
    },
    robots: {
      index: !reviewer.isNoIndex,
      follow: !reviewer.isNoFollow
    }
  }
}

export default async function ReviewerPage({ params }: PageProps) {
  const { slug } = await Promise.resolve(params)
  const reviewer = await getReviewer(slug)

  if (!reviewer) {
    notFound()
  }

  const reviews = buildReviewList(reviewer)
  const leadCount = reviewer.primaryReviews.length
  const supportingCount = reviews.filter((review) => review.role === 'supporting').length
  const totalReviews = reviews.length
  const avatarInitials = reviewer.name
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
  const heroImage = reviewer.featuredImage || reviewer.avatar || null
  const hasHeroImage = Boolean(heroImage)
  const reviewCards = reviews.map((review) => ({
    id: review.id,
    slug: review.slug,
    title: review.title,
    excerpt: review.excerpt,
    featuredImage: review.featuredImage ?? undefined,
    publishedAt: review.publishedAt ? review.publishedAt.toISOString() : null,
    category: review.category,
    rating: review.rating,
    metaTag: review.role === 'primary' ? 'Lead reviewer' : 'Supporting reviewer'
  }))

  return (
    <article className="min-h-screen bg-neutral-50">
      <div className="relative overflow-hidden bg-gradient-to-br from-amber-100 via-white to-rose-100">
        <div className="absolute inset-0 opacity-60">
          <div className="absolute -top-20 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-amber-200 blur-3xl" />
          <div className="absolute bottom-0 right-10 h-80 w-80 rounded-full bg-rose-200 blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-10">
          <nav className="text-sm text-neutral-600">
            <ol className="flex items-center gap-2">
              <li>
                <Link href="/" className="transition hover:text-primary-600">
                  Home
                </Link>
              </li>
              <li>/</li>
              <li>
                <Link href="/reviewers" className="transition hover:text-primary-600">
                  Reviewers
                </Link>
              </li>
              <li>/</li>
              <li className="text-neutral-800">{reviewer.name}</li>
            </ol>
          </nav>

          <div className="mt-10">
            <div className="overflow-hidden rounded-[36px] border border-white/50 bg-white/90 shadow-[0_30px_90px_-40px_rgba(15,23,42,0.55)] backdrop-blur">
              <div className="grid gap-0 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
                <div className="flex flex-col gap-8 p-10">
                  <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
                    <div className="flex items-center gap-5">
                      <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 via-pink-500 to-rose-600 text-3xl font-bold text-white shadow-2xl ring-4 ring-white">
                        <span>{avatarInitials}</span>
                      </div>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-amber-500">
                          Clinical reviewer
                        </p>
                        <h1 className="mt-2 text-4xl font-bold text-neutral-900">{reviewer.name}</h1>
                        {reviewer.title && (
                          <p className="text-lg text-neutral-600">{reviewer.title}</p>
                        )}
                        {reviewer.credentials && (
                          <p className="text-sm font-medium text-neutral-500">{reviewer.credentials}</p>
                        )}
                      </div>
                    </div>
                  </div>
                  {reviewer.bio && (
                    <p className="text-base leading-relaxed text-neutral-600">{reviewer.bio}</p>
                  )}
                  {reviewer.description && (
                    <p className="text-sm text-neutral-500">{reviewer.description}</p>
                  )}
                  <div className="flex flex-wrap gap-3 text-sm font-semibold">
                    {reviewer.email && (
                      <a
                        href={`mailto:${reviewer.email}`}
                        className="inline-flex items-center rounded-full border border-amber-200 px-4 py-2 text-amber-700 transition hover:border-amber-300 hover:bg-amber-50"
                      >
                        Contact reviewer
                      </a>
                    )}
                    {reviewer.website && (
                      <a
                        href={reviewer.website.startsWith('http') ? reviewer.website : `https://${reviewer.website}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center rounded-full border border-neutral-200 px-4 py-2 text-neutral-700 transition hover:border-neutral-300 hover:bg-neutral-50"
                      >
                        Visit website
                      </a>
                    )}
                  </div>
                  <div className="grid gap-6 sm:grid-cols-3">
                    <div className="rounded-3xl border border-white/60 bg-gradient-to-br from-white via-white to-amber-50 p-6 shadow-[0_15px_35px_-25px_rgba(15,23,42,0.4)]">
                      <p className="text-xs font-semibold uppercase tracking-[0.35em] text-neutral-500">
                        Lead reviews
                      </p>
                      <p className="mt-3 text-4xl font-semibold text-neutral-900">{leadCount}</p>
                    </div>
                    <div className="rounded-3xl border border-white/60 bg-gradient-to-br from-white via-white to-rose-50 p-6 shadow-[0_15px_35px_-25px_rgba(15,23,42,0.4)]">
                      <p className="text-xs font-semibold uppercase tracking-[0.35em] text-neutral-500">
                        Supporting roles
                      </p>
                      <p className="mt-3 text-4xl font-semibold text-neutral-900">{supportingCount}</p>
                    </div>
                    <div className="rounded-3xl border border-white/60 bg-gradient-to-br from-white via-white to-pink-50 p-6 shadow-[0_15px_35px_-25px_rgba(15,23,42,0.4)]">
                      <p className="text-xs font-semibold uppercase tracking-[0.35em] text-neutral-500">
                        Total reviews
                      </p>
                      <p className="mt-3 text-4xl font-semibold text-neutral-900">{totalReviews}</p>
                    </div>
                  </div>
                </div>
                <div className="relative flex items-center justify-center p-8">
                  {hasHeroImage ? (
                    <div className="relative h-80 w-80 overflow-hidden rounded-[28px] border border-white/60 bg-neutral-900 shadow-2xl">
                      <Image
                        src={heroImage!}
                        alt={`${reviewer.name} portrait`}
                        fill
                        className="object-cover"
                        sizes="320px"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent" />
                      <div className="absolute bottom-3 left-3 rounded-full bg-white/85 px-4 py-1 text-xs font-semibold text-neutral-800 shadow">
                        Featured portrait
                      </div>
                    </div>
                  ) : (
                    <div className="flex h-80 w-80 flex-col items-center justify-center gap-2 rounded-[28px] border border-dashed border-neutral-300 bg-neutral-100 text-center text-neutral-500">
                      <div className="rounded-full border border-dashed border-neutral-300 p-6">
                        <span className="text-sm font-semibold">Reviewer photo</span>
                      </div>
                      <p className="text-xs">No profile image provided.</p>
                    </div>
                  )}
                  <div className="pointer-events-none absolute inset-0 rounded-[36px] border border-white/20" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-10 space-y-12">
        {reviewCards.length > 0 ? (
          <section className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-neutral-500">
                  Published Reviews
                </p>
                <h2 className="text-3xl font-semibold text-neutral-900">Expert verdicts</h2>
              </div>
              <Link
                href="/reviews/"
                className="text-sm font-semibold text-primary-600 transition hover:text-primary-700"
              >
                View all reviews
              </Link>
            </div>
            <AuthorContentGrid items={reviewCards} variant="review" initialCount={15} loadStep={15} />
          </section>
        ) : (
          <div className="rounded-3xl border border-dashed border-neutral-300 bg-white/80 p-12 text-center text-neutral-500">
            No published reviews yet.
          </div>
        )}
      </div>
    </article>
  )
}
