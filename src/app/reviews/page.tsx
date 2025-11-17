import { prisma } from '@/lib/prisma'
import { DirectorySidebar } from '@/components/directory/DirectorySidebar'
import { ReviewList, ReviewListItem } from '@/components/reviews/ReviewList'

type PageProps = {
  searchParams?: {
    category?: string
  }
}

export const dynamic = 'force-dynamic'

const PAGE_SIZE = 10

const serializeReview = (review: {
  id: string
  title: string
  slug: string
  excerpt: string | null
  featuredImage: string | null
  rating: number | null
  publishedAt: Date | null
  author: { name: string; slug: string } | null
  primaryReviewer: { name: string; slug: string } | null
  category: { name: string; slug: string } | null
}): ReviewListItem => ({
  id: review.id,
  title: review.title,
  slug: review.slug,
  excerpt: review.excerpt,
  featuredImage: review.featuredImage,
  rating: review.rating,
  publishedAt: review.publishedAt ? review.publishedAt.toISOString() : null,
  author: review.author,
  primaryReviewer: review.primaryReviewer,
  category: review.category
})

async function getReviewsData(categorySlug?: string) {
  const baseWhere = {
    status: 'PUBLISHED' as const,
    ...(categorySlug
      ? {
          category: {
            slug: categorySlug
          }
        }
      : {})
  }

  const [initialReviews, filteredCount, totalReviewCount, categoryNav] = await Promise.all([
    prisma.review.findMany({
      where: baseWhere,
      orderBy: [
        { publishedAt: 'desc' },
        { updatedAt: 'desc' }
      ],
      include: {
        author: { select: { name: true, slug: true } },
        primaryReviewer: { select: { name: true, slug: true } },
        category: { select: { name: true, slug: true } }
      },
      take: PAGE_SIZE
    }),
    prisma.review.count({ where: baseWhere }),
    prisma.review.count({
      where: {
        status: 'PUBLISHED'
      }
    }),
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
      orderBy: {
        name: 'asc'
      }
    })
  ])

  const categories = categoryNav.map((item) => ({
    name: item.name,
    slug: item.slug,
    count: item.articles.length
  }))

  return {
    reviews: initialReviews.map(serializeReview),
    categories,
    totalReviewCount,
    filteredCount
  }
}

export default async function ReviewsPage({ searchParams }: PageProps) {
  const activeCategory = searchParams?.category
  const { reviews, categories, totalReviewCount, filteredCount } = await getReviewsData(
    activeCategory
  )

  const activeCategoryName = activeCategory
    ? categories.find((category) => category.slug === activeCategory)?.name ?? 'Reviews'
    : 'Reviews'
  const activeSlug = typeof activeCategory === 'string' && activeCategory.length > 0 ? activeCategory : null

  return (
    <div className="bg-neutral-50">
      <section className="relative overflow-hidden bg-gradient-to-br from-sky-50 via-white to-indigo-50">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -left-24 top-20 h-72 w-72 rounded-full bg-sky-100 blur-3xl" />
          <div className="absolute -right-16 bottom-10 h-96 w-96 rounded-full bg-indigo-100 blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-5xl px-6 py-24 text-center">
          <span className="inline-flex items-center rounded-full border border-sky-200 bg-white/80 px-4 py-2 text-sm font-semibold uppercase tracking-wider text-sky-600 shadow-sm">
            Expert Product Reviews
          </span>
          <h1 className="mt-6 text-4xl font-extrabold text-neutral-900 sm:text-5xl lg:text-6xl">
            Honest Reviews Parents Can Trust
          </h1>
          <p className="mt-6 text-lg text-neutral-600 sm:text-xl">
            We test the latest pediatric dental products so you can make confident choices for your family. Compare top picks, ratings, and real insights from our clinical team.
          </p>
        </div>
      </section>

      <section className="relative mx-auto max-w-7xl px-6 pb-24">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1fr)_320px]">
          <ReviewList initialReviews={reviews} totalCount={filteredCount} categorySlug={activeSlug} />

          <aside className="space-y-8">
            <DirectorySidebar
              categoryName={activeCategoryName}
              siblingCategories={categories}
              relatedArticles={reviews.slice(0, 3).map((review) => ({
                id: review.id,
                title: review.title,
                slug: review.slug,
                publishedAt: review.publishedAt
              }))}
              categoryLinkBuilder={(slug) => `/reviews/?category=${slug}`}
              activeCategorySlug={activeSlug}
              allCategoryLink={{
                label: 'All categories',
                href: '/reviews/',
                count: totalReviewCount
              }}
            />
          </aside>
        </div>
      </section>
    </div>
  )
}
