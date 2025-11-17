import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { CategoryArticleList } from '@/components/category/CategoryArticleList'
import { DirectorySidebar } from '@/components/directory/DirectorySidebar'
import { prisma } from '@/lib/prisma'

const CATEGORY_SLUG = 'news'
const PAGE_SIZE = 10

export const dynamic = 'force-dynamic'

async function getNewsCategoryData() {
  const [category, articles, totalCount, siblingCategories] = await Promise.all([
    prisma.category.findUnique({
      where: { slug: CATEGORY_SLUG },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        seoTitle: true,
        seoDescription: true
      }
    }),
    prisma.article.findMany({
      where: {
        status: 'PUBLISHED',
        category: {
          slug: CATEGORY_SLUG
        }
      },
      orderBy: [
        { publishedAt: 'desc' },
        { createdAt: 'desc' }
      ],
      include: {
        author: { select: { name: true, slug: true } },
        category: { select: { name: true, slug: true } }
      },
      take: PAGE_SIZE
    }),
    prisma.article.count({
      where: {
        status: 'PUBLISHED',
        category: { slug: CATEGORY_SLUG }
      }
    }),
    prisma.category.findMany({
      where: {
        slug: { not: CATEGORY_SLUG },
        articles: {
          some: {
            status: 'PUBLISHED'
          }
        }
      },
      orderBy: { name: 'asc' },
      select: {
        name: true,
        slug: true,
        articles: {
          where: { status: 'PUBLISHED' },
          select: { id: true }
        }
      }
    })
  ])

  if (!category) {
    return null
  }

  return {
    category,
    articles,
    totalCount,
    siblingCategories: siblingCategories.map((item) => ({
      name: item.name,
      slug: item.slug,
      count: item.articles.length
    }))
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const data = await getNewsCategoryData()

  if (!data) {
    return {
      title: 'Pediatric Dental News & Updates',
      description:
        'Latest announcements, trends, and updates from pediatric dental practices and industry partners.'
    }
  }

  const { category } = data

  return {
    title: category.seoTitle ?? `${category.name} | Pediatric Dentist Directory`,
    description:
      category.seoDescription ??
      category.description ??
      'Stay current with pediatric dental industry announcements, product launches, and community updates.'
  }
}

export default async function NewsCategoryPage() {
  const data = await getNewsCategoryData()

  if (!data) {
    notFound()
  }

  const { category, articles, siblingCategories, totalCount } = data

  return (
    <div className="bg-neutral-50">
      <section className="relative overflow-hidden bg-gradient-to-br from-indigo-50 via-white to-sky-50">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -left-20 top-16 h-64 w-64 rounded-full bg-indigo-100 blur-3xl" />
          <div className="absolute -right-28 bottom-8 h-96 w-96 rounded-full bg-sky-100 blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-5xl px-6 py-20 text-center">
          <span className="inline-flex items-center rounded-full border border-sky-200 bg-white/80 px-4 py-2 text-sm font-semibold uppercase tracking-wider text-sky-600 shadow-sm">
            Directory Newsroom
          </span>
          <h1 className="mt-5 text-4xl font-extrabold text-neutral-900 sm:text-5xl lg:text-6xl">
            {category.name}
          </h1>
          <p className="mt-6 text-lg text-neutral-600 sm:text-xl">
            {category.description ??
              'Discover the latest updates, product launches, and community news shaping pediatric dental care.'}
          </p>
        </div>
      </section>

      <section className="relative mx-auto max-w-7xl px-6 pb-24">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1fr)_320px]">
          <CategoryArticleList
            categorySlug={CATEGORY_SLUG}
            initialArticles={articles}
            totalCount={totalCount}
            variant="news"
            emptyState={{
              title: 'News updates coming soon',
              description:
                "We're preparing new announcements and stories. Check back shortly or explore another category."
            }}
          />

          <DirectorySidebar
            categoryName={category.name}
            siblingCategories={siblingCategories}
            relatedArticles={articles.slice(0, 3)}
            categoryLinkBuilder={(slug) => `/${slug}/`}
            activeCategorySlug={CATEGORY_SLUG}
            allCategoryLink={{
              label: 'All categories',
              href: '/news/',
              count: totalCount
            }}
          />
        </div>
      </section>
    </div>
  )
}
