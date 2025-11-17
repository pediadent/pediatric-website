'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  FunnelIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline'
import { AdminWrapper } from '@/components/admin/AdminWrapper'
import { useAdminApi } from '@/hooks/useAdminApi'

interface Article {
  id: string
  title: string
  slug: string
  excerpt: string | null
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'
  type: 'BLOG' | 'DIRECTORY' | 'TOOL'
  publishedAt: string | null
  createdAt: string
  updatedAt: string
  author: {
    id: string
    name: string
    slug: string
  }
  category: {
    id: string
    name: string
    slug: string
  }
  user: {
    id: string
    name: string
    email: string
  }
}

interface ArticlesResponse {
  articles: Article[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

export default function ArticlesPage() {
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [categories, setCategories] = useState<Array<{ id: string; name: string }>>([])
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  })
  const [filters, setFilters] = useState({
    status: '',
    search: '',
    categoryId: ''
  })
  const adminFetch = useAdminApi()

  const fetchArticles = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...(filters.status && { status: filters.status }),
        ...(filters.search && { search: filters.search }),
        ...(filters.categoryId && { categoryId: filters.categoryId })
      })

      const response = await adminFetch(`/api/admin/articles?${params}`)
      if (response.ok) {
        const data: ArticlesResponse = await response.json()
        setArticles(data.articles)
        setPagination(data.pagination)
      }
    } catch (error) {
      console.error('Error fetching articles:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await adminFetch('/api/admin/categories?limit=100')
      if (response.ok) {
        const data = await response.json()
        const mapped = (data.categories || []).map((category: any) => ({
          id: category.id,
          name: category.name
        }))
        setCategories(mapped)
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  useEffect(() => {
    fetchArticles()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.page, pagination.limit, filters.status, filters.search, filters.categoryId])

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this article?')) {
      try {
        const response = await adminFetch(`/api/admin/articles/${id}`, {
          method: 'DELETE'
        })
        if (response.ok) {
          fetchArticles()
        }
      } catch (error) {
        console.error('Error deleting article:', error)
      }
    }
  }

  const getStatusBadge = (status: string) => {
    const styles = {
      DRAFT: 'bg-yellow-100 text-yellow-800',
      PUBLISHED: 'bg-green-100 text-green-800',
      ARCHIVED: 'bg-gray-100 text-gray-800'
    }
    return styles[status as keyof typeof styles] || styles.DRAFT
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <AdminWrapper>
      <div className="min-h-screen bg-neutral-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-neutral-900">Articles</h1>
            <p className="text-neutral-600 mt-2">Manage your blog posts and content</p>
          </div>
          <Link
            href="/admin/articles/new"
            className="inline-flex items-center px-4 py-2 rounded-lg font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-sm"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Add Article
          </Link>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl border border-neutral-200 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-neutral-400" />
              <input
                type="text"
                placeholder="Search articles..."
                value={filters.search}
                onChange={(e) => {
                  const value = e.target.value
                  setFilters(prev => ({ ...prev, search: value }))
                  setPagination(prev => ({ ...prev, page: 1 }))
                }}
                className="w-full pl-10 pr-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            <select
              value={filters.status}
              onChange={(e) => {
                const value = e.target.value
                setFilters(prev => ({ ...prev, status: value }))
                setPagination(prev => ({ ...prev, page: 1 }))
              }}
              className="px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="">All Statuses</option>
              <option value="DRAFT">Draft</option>
              <option value="PUBLISHED">Published</option>
              <option value="ARCHIVED">Archived</option>
            </select>

            <select
              value={filters.categoryId}
              onChange={(e) => {
                const value = e.target.value
                setFilters(prev => ({ ...prev, categoryId: value }))
                setPagination(prev => ({ ...prev, page: 1 }))
              }}
              className="px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="">All Categories</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Articles Table */}
        <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
              <p className="text-neutral-600 mt-2">Loading articles...</p>
            </div>
          ) : articles.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-neutral-600">No articles found.</p>
              <Link
                href="/admin/articles/new"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors mt-4 shadow-sm"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Create your first article
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-neutral-50 border-b border-neutral-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-medium text-neutral-500 uppercase tracking-wider">
                      Title
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-neutral-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-neutral-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-neutral-500 uppercase tracking-wider">
                      Author
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-neutral-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-4 text-right text-sm font-medium text-neutral-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200">
                  {articles.map((article) => (
                    <tr key={article.id} className="hover:bg-neutral-50">
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-neutral-900">
                            {article.title}
                          </div>
                          {article.excerpt && (
                            <div className="text-sm text-neutral-500 mt-1 line-clamp-2">
                              {article.excerpt}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(article.status)}`}>
                          {article.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-neutral-900">{article.category.name}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-neutral-900">{article.author.name}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-neutral-900">
                          {article.publishedAt ? formatDate(article.publishedAt) : formatDate(article.createdAt)}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <Link
                            href={`/${article.slug}/`}
                            className="p-2 text-neutral-400 hover:text-neutral-600 transition-colors"
                            title="View"
                          >
                            <EyeIcon className="h-4 w-4" />
                          </Link>
                          <Link
                            href={`/admin/articles/${article.id}`}
                            className="p-2 text-neutral-400 hover:text-primary-600 transition-colors"
                            title="Edit"
                          >
                            <PencilIcon className="h-4 w-4" />
                          </Link>
                          <button
                            onClick={() => handleDelete(article.id)}
                            className="p-2 text-neutral-400 hover:text-red-600 transition-colors"
                            title="Delete"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="px-6 py-4 border-t border-neutral-200 flex items-center justify-between">
              <div className="text-sm text-neutral-500">
                Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} results
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                  disabled={pagination.page === 1}
                  className="px-3 py-2 border border-neutral-300 rounded-lg text-sm font-medium text-neutral-700 hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                  disabled={pagination.page === pagination.pages}
                  className="px-3 py-2 border border-neutral-300 rounded-lg text-sm font-medium text-neutral-700 hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
    </AdminWrapper>
  )
}
