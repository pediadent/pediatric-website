import Link from 'next/link'
import { formatDate } from '@/lib/utils'

interface CategorySummary {
  name: string
  slug: string
  count: number
}

interface RelatedArticleSummary {
  id: string
  title: string
  slug: string
  publishedAt: Date | string | null
}

interface DirectorySidebarProps {
  categoryName: string
  siblingCategories: CategorySummary[]
  relatedArticles: RelatedArticleSummary[]
  categoryLinkBuilder?: (slug: string) => string
  articleLinkBuilder?: (slug: string) => string
  activeCategorySlug?: string | null
  allCategoryLink?: {
    label: string
    href: string
    count?: number
  }
}

export function DirectorySidebar({
  categoryName,
  siblingCategories,
  relatedArticles,
  categoryLinkBuilder,
  articleLinkBuilder,
  activeCategorySlug,
  allCategoryLink
}: DirectorySidebarProps) {
  const buildCategoryHref = categoryLinkBuilder ?? ((slug: string) => `/${slug}/`)
  const buildArticleHref = articleLinkBuilder ?? ((slug: string) => `/${slug}/`)

  const categoryItemClasses = (isActive: boolean) =>
    `flex items-center justify-between rounded-2xl border px-4 py-3 text-sm font-semibold transition-colors ${
      isActive
        ? 'border-sky-300 bg-sky-50 text-sky-700'
        : 'border-transparent bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
    }`

  return (
    <aside className="space-y-8">
      <div className="rounded-3xl border border-sky-200 bg-gradient-to-br from-sky-50 via-white to-indigo-50 p-6 shadow-inner">
        <h3 className="text-lg font-semibold text-neutral-900">Submit your dental clinic</h3>
        <p className="mt-2 text-sm text-neutral-600">
          Listing your pediatric dental clinic keeps our directory comprehensive and helps families find trusted professionals nearby.
        </p>
        <Link
          href="/submit-clinic/"
          className="mt-4 inline-flex w-full items-center justify-center rounded-2xl bg-gradient-to-r from-sky-600 to-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-sky-200 transition-transform hover:-translate-y-0.5 hover:bg-gradient-to-r hover:from-sky-700 hover:to-indigo-700"
        >
          Submit clinic details
        </Link>
      </div>

      {(siblingCategories.length > 0 || allCategoryLink) && (
        <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-neutral-900">Browse categories</h3>
          <p className="mt-2 text-sm text-neutral-500">
            Explore additional guides and resources for dental professionals.
          </p>
          <div className="mt-4 space-y-3">
            {allCategoryLink && (
              <Link
                href={allCategoryLink.href}
                className={categoryItemClasses(activeCategorySlug === null)}
              >
                {allCategoryLink.label}
                {typeof allCategoryLink.count === 'number' && (
                  <span className="rounded-full bg-white px-2 py-0.5 text-xs text-neutral-500">
                    {allCategoryLink.count}
                  </span>
                )}
              </Link>
            )}
            {siblingCategories.map((item) => (
              <Link
                key={item.slug}
                href={buildCategoryHref(item.slug)}
                className={categoryItemClasses(activeCategorySlug === item.slug)}
              >
                {item.name}
                <span className="rounded-full bg-white px-2 py-0.5 text-xs text-neutral-500">
                  {item.count}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {relatedArticles.length > 0 && (
        <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-neutral-900">Latest {categoryName}</h3>
          <div className="mt-4 space-y-4">
            {relatedArticles.map((article) => (
              <Link
                key={article.id}
                href={buildArticleHref(article.slug)}
                className="block rounded-2xl border border-transparent px-4 py-3 text-sm text-neutral-600 transition-colors hover:border-sky-200 hover:bg-sky-50 hover:text-sky-700"
              >
                <p className="font-semibold">{article.title}</p>
                {article.publishedAt && (
                  <p className="mt-1 text-xs text-neutral-400">
                    {formatDate(article.publishedAt)}
                  </p>
                )}
              </Link>
            ))}
          </div>
        </div>
      )}

      {relatedArticles.length === 0 && (
        <div className="rounded-3xl border border-neutral-200 bg-white p-6 text-sm text-neutral-500 shadow-sm">
          We will publish fresh {categoryName} soon.
        </div>
      )}
    </aside>
  )
}
