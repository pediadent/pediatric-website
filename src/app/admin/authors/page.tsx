'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import Link from 'next/link'
import { PlusIcon, PencilIcon, TrashIcon, EyeIcon } from '@heroicons/react/24/outline'
import { AdminWrapper } from '@/components/admin/AdminWrapper'
import { MediaUpload } from '@/components/admin/MediaUpload'
import { useAdminApi } from '@/hooks/useAdminApi'

interface Author {
  id: string
  name: string
  slug: string
  bio: string | null
  email: string | null
  _count: {
    articles: number
    reviews: number
  }
}

export default function AuthorsPage() {
  const [authors, setAuthors] = useState<Author[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingAuthor, setEditingAuthor] = useState<Author | null>(null)
  const [isBrowser, setIsBrowser] = useState(false)
  const adminFetch = useAdminApi()
  const initialFormState = {
    name: '',
    slug: '',
    bio: '',
    email: '',
    website: '',
    avatar: '',
    seoTitle: '',
    seoDescription: '',
    featuredImage: '',
    schema: '',
    isNoIndex: false,
    isNoFollow: false
  }

  const [formData, setFormData] = useState(initialFormState)

  useEffect(() => {
    fetchAuthors()
  }, [])

  useEffect(() => {
    setIsBrowser(true)
  }, [])

  const fetchAuthors = async () => {
    try {
      setLoading(true)
      const response = await adminFetch('/api/admin/authors?limit=100')
      if (!response.ok) {
        const body = await response.json().catch(() => null)
        console.error('Failed to load authors', body)
        setAuthors([])
        return
      }
      const data = await response.json()
      setAuthors(Array.isArray(data.authors) ? data.authors : [])
    } catch (error) {
      console.error('Error fetching authors:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const url = editingAuthor
        ? `/api/admin/authors/${editingAuthor.id}`
        : '/api/admin/authors'

      const response = await adminFetch(url, {
        method: editingAuthor ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        fetchAuthors()
        setShowModal(false)
        setEditingAuthor(null)
        setFormData(initialFormState)
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to save author')
      }
    } catch (error) {
      console.error('Error saving author:', error)
      alert('Failed to save author')
    }
  }

  const handleEdit = (author: any) => {
    setEditingAuthor(author)
    setFormData({
      name: author.name,
      slug: author.slug,
      bio: author.bio || '',
      email: author.email || '',
      website: author.website || '',
      avatar: author.avatar || '',
      seoTitle: author.seoTitle || '',
      seoDescription: author.seoDescription || '',
      featuredImage: author.featuredImage || '',
      schema: author.schema || '',
      isNoIndex: author.isNoIndex || false,
      isNoFollow: author.isNoFollow || false
    })
    setShowModal(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this author?')) return

    try {
      const response = await adminFetch(`/api/admin/authors/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        fetchAuthors()
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to delete author')
      }
    } catch (error) {
      console.error('Error deleting author:', error)
      alert('Failed to delete author')
    }
  }

  const generateSlug = () => {
    const slug = formData.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
    setFormData({ ...formData, slug })
  }

  return (
    <AdminWrapper>
      <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Authors</h1>
          <p className="text-gray-600 mt-1">Manage content authors</p>
        </div>
        <button
          onClick={() => {
            setEditingAuthor(null)
            setFormData(initialFormState)
            setShowModal(true)
          }}
          className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Add Author
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Articles
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Reviews
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                  Loading...
                </td>
              </tr>
            ) : authors.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                  No authors found
                </td>
              </tr>
            ) : (
              authors.map((author) => (
                <tr key={author.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">{author.name}</div>
                    <div className="text-sm text-gray-500">{author.slug}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">{author.email || '-'}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{author._count.articles}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{author._count.reviews}</td>
                  <td className="px-6 py-4 text-right text-sm font-medium">
                    <div className="inline-flex items-center justify-end gap-2">
                      <Link
                        href={`/authors/${author.slug}/`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-neutral-500 hover:text-neutral-700 inline-flex items-center"
                        title="View author"
                      >
                        <EyeIcon className="h-5 w-5" />
                      </Link>
                      <button
                        onClick={() => handleEdit(author)}
                        className="text-blue-600 hover:text-blue-900 inline-flex items-center"
                        title="Edit author"
                      >
                        <PencilIcon className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(author.id)}
                        className="text-red-600 hover:text-red-900 inline-flex items-center"
                        title="Delete author"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && isBrowser && createPortal(
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/60 p-4">
          <div className="relative mt-16 max-h-[calc(100vh-4rem)] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {editingAuthor ? 'Edit Author' : 'Add Author'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto pr-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  onBlur={generateSlug}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Slug *</label>
                <input
                  type="text"
                  required
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
                <input
                  type="url"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                <textarea
                  rows={3}
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Avatar Image</label>
                <MediaUpload
                  onUpload={(url) => setFormData({ ...formData, avatar: url })}
                  currentImage={formData.avatar}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">SEO Title</label>
                <input
                  type="text"
                  value={formData.seoTitle}
                  onChange={(e) => setFormData({ ...formData, seoTitle: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="SEO optimized title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">SEO Description</label>
                <textarea
                  rows={3}
                  value={formData.seoDescription}
                  onChange={(e) => setFormData({ ...formData, seoDescription: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Meta description for search engines"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Featured Image</label>
                <MediaUpload
                  onUpload={(url) => setFormData({ ...formData, featuredImage: url })}
                  currentImage={formData.featuredImage}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Schema (JSON-LD)
                </label>
                <textarea
                  rows={4}
                  value={formData.schema}
                  onChange={(e) => setFormData({ ...formData, schema: e.target.value })}
                  placeholder='Optional structured data snippet (example: { "@context": "https://schema.org", "@type": "Person", ... })'
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg font-mono text-xs focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center space-x-6">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.isNoIndex}
                    onChange={(e) => setFormData({ ...formData, isNoIndex: e.target.checked })}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">No Index</span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.isNoFollow}
                    onChange={(e) => setFormData({ ...formData, isNoFollow: e.target.checked })}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">No Follow</span>
                </label>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false)
                    setEditingAuthor(null)
                  }}
                  className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium"
                >
                  {editingAuthor ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </div>
    </AdminWrapper>
  )
}
