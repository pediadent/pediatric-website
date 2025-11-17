import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { CategoryArticleList } from '@/components/category/CategoryArticleList'
import { DirectorySidebar } from '@/components/directory/DirectorySidebar'
import { prisma } from '@/lib/prisma'

const CATEGORY_SLUG = 'oral-health-tips'
const PAGE_SIZE = 10

export const dynamic = 'force-dynamic'

async function getOralHealthTipsData() {
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
      include: {
        author: { select: { name: true, slug: true } },
        category: { select: { name: true, slug: true } }
      },
      orderBy: [
        { publishedAt: 'desc' },
        { createdAt: 'desc' }
      ],
      take: PAGE_SIZE
    }),
    prisma.article.count({
      where: {
        status: 'PUBLISHED',
        category: {
          slug: CATEGORY_SLUG
        }
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
  const data = await getOralHealthTipsData()

  if (!data) {
    return {
      title: 'Oral Health Tips for Kids',
      description: 'Expert oral health tips to help families protect kids’ smiles with preventive care at home.'
    }
  }

  const { category } = data

  return {
    title: category.seoTitle ?? `${category.name} | Pediatric Dentist Directory`,
    description:
      category.seoDescription ??
      category.description ??
      'Practical pediatric oral health advice covering brushing routines, diet tips, and preventative care.',
    openGraph: {
      title: category.seoTitle ?? `${category.name} | Pediatric Dentist Directory`,
      description:
        category.seoDescription ??
        category.description ??
        'Practical pediatric oral health advice covering brushing routines, diet tips, and preventative care.'
    }
  }
}

export default async function OralHealthTipsPage() {
  const data = await getOralHealthTipsData()

  if (!data) {
    notFound()
  }

  const { category, articles, siblingCategories, totalCount } = data

  return (
    <div className="bg-neutral-50">
      <section className="relative overflow-hidden bg-gradient-to-br from-emerald-50 via-white to-sky-50">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -left-20 top-12 h-72 w-72 rounded-full bg-emerald-100 blur-3xl" />
          <div className="absolute -right-20 bottom-8 h-96 w-96 rounded-full bg-sky-100 blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-5xl px-6 py-20 text-center">
          <span className="inline-flex items-center rounded-full border border-emerald-200 bg-white/80 px-4 py-2 text-sm font-semibold uppercase tracking-wider text-emerald-600 shadow-sm">
            Family Oral Care Guides
          </span>
          <h1 className="mt-5 text-4xl font-extrabold text-neutral-900 sm:text-5xl lg:text-6xl">
            {category.name}
          </h1>
          <p className="mt-6 text-lg text-neutral-600 sm:text-xl">
            {category.description ??
              'Actionable oral health guidance from pediatric dental specialists to keep smiles bright at every age.'}
          </p>
        </div>
      </section>

      <section className="relative mx-auto max-w-7xl px-6 pb-24">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1fr)_320px]">
          <CategoryArticleList
            categorySlug={CATEGORY_SLUG}
            initialArticles={articles}
            totalCount={totalCount}
            variant="oral-health-tips"
            emptyState={{
              title: 'More oral health tips coming soon',
              description:
                "We're preparing new family-friendly guides. Check back shortly or browse other categories in the sidebar."
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
              href: '/oral-health-tips/',
              count: totalCount
            }}
          />
        </div>
      </section>
    </div>
  )
}
