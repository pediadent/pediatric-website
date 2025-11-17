import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import type { Metadata } from 'next'
import { prisma } from '@/lib/prisma'
import { formatDate } from '@/lib/utils'
import { AuthorContentGrid } from '@/components/authors/AuthorContentGrid'

type Params = { slug: string }
type ParamsInput = Params | Promise<Params>

const resolveParams = async (params: ParamsInput): Promise<Params> => {
  return await Promise.resolve(params)
}

async function getAuthor(slug: string) {
  return prisma.author.findUnique({
    where: { slug },
    include: {
      articles: {
        where: { status: 'PUBLISHED' },
        orderBy: { publishedAt: 'desc' },
        select: {
          id: true,
          title: true,
          slug: true,
          excerpt: true,
          publishedAt: true,
          featuredImage: true,
          category: {
            select: { name: true, slug: true }
          }
        }
      },
      reviews: {
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
      }
    }
  })
}

type AuthorWithRelations = NonNullable<Awaited<ReturnType<typeof getAuthor>>>

const buildArticleList = (author: AuthorWithRelations) =>
  (author.articles ?? []).map((article) => ({
    ...article,
    publishedAt: article.publishedAt ? article.publishedAt.toISOString() : null
  }))

const buildReviewList = (author: AuthorWithRelations) =>
  (author.reviews ?? []).map((review) => ({
    ...review,
    publishedAt: review.publishedAt ? review.publishedAt.toISOString() : null
  }))

export async function generateMetadata({ params }: { params: ParamsInput }): Promise<Metadata> {
  const { slug } = await resolveParams(params)
  const author = await getAuthor(slug)

  if (!author) {
    return {
      title: 'Author Not Found'
    }
  }

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  const imageUrl = author.featuredImage
    ? `${baseUrl}${author.featuredImage}`
    : author.avatar
      ? `${baseUrl}${author.avatar}`
      : `${baseUrl}/og-default.jpg`

  return {
    title: author.seoTitle || `${author.name} - Pediatric Content Author`,
    description:
      author.seoDescription ||
      author.bio ||
      `Explore articles and reviews written by ${author.name}.`,
    robots: {
      index: !author.isNoIndex,
      follow: !author.isNoFollow
    },
    openGraph: {
      title: author.seoTitle || author.name,
      description:
        author.seoDescription ||
        author.bio ||
        `Explore articles and reviews written by ${author.name}.`,
      url: `${baseUrl}/authors/${author.slug}`,
      images: [
        {
          url: imageUrl
        }
      ]
    }
  }
}

export default async function AuthorPage({ params }: { params: ParamsInput }) {
  const { slug } = await resolveParams(params)
  const author = await getAuthor(slug)

  if (!author) {
    notFound()
  }

  const articles = buildArticleList(author)
  const reviews = buildReviewList(author)
  const totalPublications = articles.length + reviews.length
  const avatarInitials = author.name
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
  const avatarImage = author.avatar || author.featuredImage || null
  const heroImage = author.featuredImage || author.avatar || null
  const hasHeroImage = Boolean(heroImage)
  const expertiseTags = Array.from(
    new Set(
      [...articles, ...reviews]
        .map((entry) => entry.category?.name)
        .filter((name): name is string => Boolean(name))
    )
  )

  return (
    <article className="min-h-screen bg-neutral-50">
      <div className="relative overflow-hidden bg-gradient-to-br from-sky-100 via-white to-indigo-100">
        <div className="absolute inset-0 opacity-60">
          <div className="absolute -top-20 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-sky-200 blur-3xl" />
          <div className="absolute bottom-0 right-10 h-80 w-80 rounded-full bg-indigo-200 blur-3xl" />
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
                <Link href="/authors" className="transition hover:text-primary-600">
                  Authors
                </Link>
              </li>
              <li>/</li>
              <li className="text-neutral-800">{author.name}</li>
            </ol>
          </nav>

          <div className="mt-10">
            <div className="overflow-hidden rounded-[36px] border border-white/50 bg-white/90 shadow-[0_30px_90px_-40px_rgba(15,23,42,0.55)] backdrop-blur">
              <div className="grid gap-0 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
                <div className="flex flex-col gap-8 p-10">
                  <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
                    <div className="flex items-center gap-5">
                      <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500 via-cyan-500 to-indigo-500 text-3xl font-bold text-white shadow-2xl ring-4 ring-white">
                        <span>{avatarInitials}</span>
                      </div>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-sky-500">
                          Editorial voice
                        </p>
                        <h1 className="mt-2 text-4xl font-bold text-neutral-900">{author.name}</h1>
                      </div>
                    </div>
                  </div>
                  {author.bio && (
                    <p className="text-base leading-relaxed text-neutral-600">{author.bio}</p>
                  )}
                  <div className="flex flex-wrap gap-3 text-sm font-semibold">
                    {author.email && (
                      <a
                        href={`mailto:${author.email}`}
                        className="inline-flex items-center rounded-full border border-primary-200 px-4 py-2 text-primary-600 transition hover:border-primary-300 hover:bg-primary-50"
                      >
                        Contact {author.name.split(' ')[0]}
                      </a>
                    )}
                    {author.website && (
                      <a
                        href={author.website.startsWith('http') ? author.website : `https://${author.website}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center rounded-full border border-neutral-200 px-4 py-2 text-neutral-700 transition hover:border-neutral-300 hover:bg-neutral-50"
                      >
                        Visit website
                      </a>
                    )}
                  </div>
                  <div className="grid gap-6 sm:grid-cols-3">
                    <div className="rounded-3xl border border-white/60 bg-gradient-to-br from-white via-white to-sky-50 p-6 shadow-[0_15px_35px_-25px_rgba(15,23,42,0.4)]">
                      <p className="text-xs font-semibold uppercase tracking-[0.35em] text-neutral-500">Articles</p>
                      <p className="mt-3 text-4xl font-semibold text-neutral-900">{articles.length}</p>
                    </div>
                    <div className="rounded-3xl border border-white/60 bg-gradient-to-br from-white via-white to-indigo-50 p-6 shadow-[0_15px_35px_-25px_rgba(15,23,42,0.4)]">
                      <p className="text-xs font-semibold uppercase tracking-[0.35em] text-neutral-500">Reviews</p>
                      <p className="mt-3 text-4xl font-semibold text-neutral-900">{reviews.length}</p>
                      {reviews.length > 0 && <p className="text-xs text-neutral-500">Product insights</p>}
                    </div>
                    <div className="rounded-3xl border border-white/60 bg-gradient-to-br from-white via-white to-cyan-50 p-6 shadow-[0_15px_35px_-25px_rgba(15,23,42,0.4)]">
                      <p className="text-xs font-semibold uppercase tracking-[0.35em] text-neutral-500">Total stories</p>
                      <p className="mt-3 text-4xl font-semibold text-neutral-900">{totalPublications}</p>
                    </div>
                  </div>
                </div>
                <div className="relative flex items-center justify-center p-8">
                  {hasHeroImage ? (
                    <>
                      <div className="relative h-80 w-80 overflow-hidden rounded-[28px] border border-white/60 bg-neutral-900 shadow-2xl">
                        <Image
                          src={heroImage!}
                          alt={`${author.name} portrait`}
                          fill
                          className="object-cover"
                          sizes="320px"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent" />
                        <div className="absolute bottom-3 left-3 rounded-full bg-white/85 px-4 py-1 text-xs font-semibold text-neutral-800 shadow">
                          Featured portrait
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="flex h-80 w-80 flex-col items-center justify-center gap-2 rounded-[28px] border border-dashed border-neutral-300 bg-neutral-100 text-center text-neutral-500">
                      <div className="rounded-full border border-dashed border-neutral-300 p-6">
                        <span className="text-sm font-semibold">Author image</span>
                      </div>
                      <p className="text-xs">
                        No profile image yet.
                        {author.email && (
                          <>
                            {' '}
                            <a
                              href={`mailto:${author.email}`}
                              className="font-semibold text-primary-600 underline"
                            >
                              Send one now
                            </a>
                            .
                          </>
                        )}
                      </p>
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
        {articles.length > 0 && (
          <section className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-neutral-500">Latest Articles</p>
                <h2 className="text-3xl font-semibold text-neutral-900">Published work</h2>
              </div>
              <span className="text-sm text-neutral-500">
                {articles.length} {articles.length === 1 ? 'story' : 'stories'}
              </span>
            </div>
            <AuthorContentGrid items={articles} variant="article" initialCount={15} loadStep={15} />
          </section>
        )}

        {reviews.length > 0 && (
          <section className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-neutral-500">Product Reviews</p>
                <h2 className="text-3xl font-semibold text-neutral-900">Expert verdicts</h2>
              </div>
              <span className="text-sm text-neutral-500">
                {reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}
              </span>
            </div>
            <AuthorContentGrid items={reviews} variant="review" initialCount={15} loadStep={15} />
          </section>
        )}

        {articles.length === 0 && reviews.length === 0 && (
          <div className="rounded-3xl border border-dashed border-neutral-300 bg-white/80 p-12 text-center text-neutral-500">
            No published content yet.
          </div>
        )}
      </div>
    </article>
  )
}
