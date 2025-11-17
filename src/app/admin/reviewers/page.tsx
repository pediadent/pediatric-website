'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import Link from 'next/link'
import { PlusIcon, PencilIcon, TrashIcon, EyeIcon } from '@heroicons/react/24/outline'
import { AdminWrapper } from '@/components/admin/AdminWrapper'
import { MediaUpload } from '@/components/admin/MediaUpload'

interface Reviewer {
  id: string
  name: string
  slug: string
  title: string | null
  credentials: string | null
  bio: string | null
  description: string | null
  email: string | null
  website: string | null
  avatar: string | null
  seoTitle: string | null
  seoDescription: string | null
  featuredImage: string | null
  isNoIndex: boolean
  isNoFollow: boolean
  schema: string | null
  _count: {
    primaryReviews: number
    reviewAssignments: number
  }
}

type ReviewerFormState = {
  name: string
  slug: string
  title: string
  credentials: string
  bio: string
  description: string
  email: string
  website: string
  avatar: string
  seoTitle: string
  seoDescription: string
  featuredImage: string
  isNoIndex: boolean
  isNoFollow: boolean
  schema: string
}

const emptyForm: ReviewerFormState = {
  name: '',
  slug: '',
  title: '',
  credentials: '',
  bio: '',
  description: '',
  email: '',
  website: '',
  avatar: '',
  seoTitle: '',
  seoDescription: '',
  featuredImage: '',
  isNoIndex: false,
  isNoFollow: false,
  schema: ''
}

const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')

export default function ReviewersPage() {
  const [reviewers, setReviewers] = useState<Reviewer[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingReviewer, setEditingReviewer] = useState<Reviewer | null>(null)
  const [formData, setFormData] = useState<ReviewerFormState>(emptyForm)
  const [isBrowser, setIsBrowser] = useState(false)

  useEffect(() => {
    fetchReviewers()
    setIsBrowser(true)
  }, [])

  const fetchReviewers = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/reviewers?limit=100', { credentials: 'include' })
      if (!response.ok) {
        throw new Error('Failed to load reviewers')
      }
      const data = await response.json()
      setReviewers(data.reviewers ?? [])
    } catch (error) {
      console.error('Error fetching reviewers:', error)
    } finally {
      setLoading(false)
    }
  }

  const openCreateModal = () => {
    setEditingReviewer(null)
    setFormData(emptyForm)
    setShowModal(true)
  }

  const openEditModal = (reviewer: Reviewer) => {
    setEditingReviewer(reviewer)
    setFormData({
      name: reviewer.name,
      slug: reviewer.slug,
      title: reviewer.title ?? '',
      credentials: reviewer.credentials ?? '',
      bio: reviewer.bio ?? '',
      description: reviewer.description ?? '',
      email: reviewer.email ?? '',
      website: reviewer.website ?? '',
      avatar: reviewer.avatar ?? '',
      seoTitle: reviewer.seoTitle ?? '',
      seoDescription: reviewer.seoDescription ?? '',
      featuredImage: reviewer.featuredImage ?? '',
      isNoIndex: reviewer.isNoIndex,
      isNoFollow: reviewer.isNoFollow,
      schema: reviewer.schema ?? ''
    })
    setShowModal(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this reviewer? This cannot be undone.')) return

    try {
      const response = await fetch(`/api/admin/reviewers/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      })

      if (!response.ok) {
        const error = await response.json()
        alert(error.error || 'Failed to delete reviewer')
        return
      }

      fetchReviewers()
    } catch (error) {
      console.error('Error deleting reviewer:', error)
      alert('Failed to delete reviewer')
    }
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    const payload = { ...formData }

    try {
      const url = editingReviewer
        ? `/api/admin/reviewers/${editingReviewer.id}`
        : '/api/admin/reviewers'

      const response = await fetch(url, {
        method: editingReviewer ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        const error = await response.json()
        alert(error.error || 'Failed to save reviewer')
        return
      }

      setShowModal(false)
      setEditingReviewer(null)
      setFormData(emptyForm)
      fetchReviewers()
    } catch (error) {
      console.error('Error saving reviewer:', error)
      alert('Failed to save reviewer')
    }
  }

  return (
    <AdminWrapper>
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-neutral-900">Reviewers</h1>
            <p className="mt-1 text-sm text-neutral-500">
              Manage the clinical reviewers who validate product reviews.
            </p>
          </div>
          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
          >
            <PlusIcon className="h-4 w-4" />
            Add Reviewer
          </button>
        </div>

        <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-neutral-200">
              <thead className="bg-neutral-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500">
                    Reviewer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500">
                    Credentials
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500">
                    Assignments
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wide text-neutral-500">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200 bg-white">
                {loading ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-10 text-center text-neutral-500">
                      Loading reviewers...
                    </td>
                  </tr>
                ) : reviewers.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-10 text-center text-neutral-500">
                      No reviewers found. Add your first reviewer to get started.
                    </td>
                  </tr>
                ) : (
                  reviewers.map((reviewer) => (
                    <tr key={reviewer.id} className="align-top hover:bg-neutral-50">
                      <td className="px-6 py-4">
                        <div className="text-sm font-semibold text-neutral-900">{reviewer.name}</div>
                        <div className="text-xs text-neutral-500 mt-1">
                          {reviewer.title || '—'}
                        </div>
                        <div className="text-xs text-neutral-400 mt-1">
                          /reviewers/{reviewer.slug}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-neutral-700">
                        {reviewer.credentials || '—'}
                      </td>
                      <td className="px-6 py-4 text-sm text-neutral-700">
                        <div className="leading-5">
                          <div>
                            Primary reviewer:{' '}
                            <span className="font-semibold">
                              {reviewer._count.primaryReviews}
                            </span>
                          </div>
                          <div>
                            Supporting reviews:{' '}
                            <span className="font-semibold">
                              {reviewer._count.reviewAssignments}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <Link
                            href={`/reviewers/${reviewer.slug}/`}
                            className="rounded-full p-2 text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-700"
                            title="View reviewer"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <EyeIcon className="h-4 w-4" />
                          </Link>
                          <button
                            onClick={() => openEditModal(reviewer)}
                            className="rounded-full p-2 text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-700"
                            title="Edit reviewer"
                          >
                            <PencilIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(reviewer.id)}
                            className="rounded-full p-2 text-neutral-400 transition hover:bg-red-50 hover:text-red-600"
                            title="Delete reviewer"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {showModal && isBrowser && createPortal(
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
            <div className="relative flex h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-xl">
              <div className="border-b border-neutral-200 px-6 py-4">
                <h2 className="text-lg font-semibold text-neutral-900">
                  {editingReviewer ? 'Edit Reviewer' : 'Add Reviewer'}
                </h2>
                <p className="mt-1 text-sm text-neutral-500">
                  Provide reviewer details used across the site and structured data.
                </p>
              </div>

              <form
                onSubmit={handleSubmit}
                className="flex-1 space-y-5 overflow-y-auto px-6 py-6"
              >
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-neutral-700">
                      Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(event) =>
                        setFormData({ ...formData, name: event.target.value })
                      }
                      className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-neutral-700">
                      Slug *
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        required
                        value={formData.slug}
                        onChange={(event) =>
                          setFormData({ ...formData, slug: event.target.value })
                        }
                        className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setFormData((prev) => ({
                            ...prev,
                            slug: slugify(prev.name)
                          }))
                        }
                        className="rounded-lg border border-neutral-300 px-3 text-xs font-medium text-neutral-600 hover:bg-neutral-100"
                      >
                        Auto
                      </button>
                    </div>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-neutral-700">
                      Title / Role
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(event) =>
                        setFormData({ ...formData, title: event.target.value })
                      }
                      placeholder="e.g., Pediatric Dentist"
                      className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-neutral-700">
                      Credentials
                    </label>
                    <input
                      type="text"
                      value={formData.credentials}
                      onChange={(event) =>
                        setFormData({ ...formData, credentials: event.target.value })
                      }
                      placeholder="e.g., DDS, MPH"
                      className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                    />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-neutral-700">
                      Email
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(event) =>
                        setFormData({ ...formData, email: event.target.value })
                      }
                      className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-neutral-700">
                      Website
                    </label>
                    <input
                      type="url"
                      value={formData.website}
                      onChange={(event) =>
                        setFormData({ ...formData, website: event.target.value })
                      }
                      placeholder="https://"
                      className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                    />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-neutral-700">
                      Bio
                    </label>
                    <textarea
                      rows={3}
                      value={formData.bio}
                      onChange={(event) =>
                        setFormData({ ...formData, bio: event.target.value })
                      }
                      placeholder="Extended biography, credentials, experience"
                      className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-neutral-700">
                      Description
                    </label>
                    <textarea
                      rows={3}
                      value={formData.description}
                      onChange={(event) =>
                        setFormData({ ...formData, description: event.target.value })
                      }
                      placeholder="Short description shown in listings or cards"
                      className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                    />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-neutral-700">
                      Avatar Image
                    </label>
                    <MediaUpload
                      onUpload={(url) => setFormData({ ...formData, avatar: url })}
                      currentImage={formData.avatar}
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-neutral-700">
                      Featured Image
                    </label>
                    <MediaUpload
                      onUpload={(url) =>
                        setFormData({ ...formData, featuredImage: url })
                      }
                      currentImage={formData.featuredImage}
                    />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-neutral-700">
                      SEO Title
                    </label>
                    <input
                      type="text"
                      value={formData.seoTitle}
                      onChange={(event) =>
                        setFormData({ ...formData, seoTitle: event.target.value })
                      }
                      className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-neutral-700">
                      SEO Description
                    </label>
                    <textarea
                      rows={2}
                      value={formData.seoDescription}
                      onChange={(event) =>
                        setFormData({
                          ...formData,
                          seoDescription: event.target.value
                        })
                      }
                      className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-neutral-700">
                    Schema (JSON-LD)
                  </label>
                  <textarea
                    rows={4}
                    value={formData.schema}
                    onChange={(event) =>
                      setFormData({ ...formData, schema: event.target.value })
                    }
                    className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-xs font-mono focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                    placeholder="Paste structured data (optional)"
                  />
                </div>

                <div className="flex items-center gap-6">
                  <label className="flex items-center text-sm text-neutral-700">
                    <input
                      type="checkbox"
                      checked={formData.isNoIndex}
                      onChange={(event) =>
                        setFormData({ ...formData, isNoIndex: event.target.checked })
                      }
                      className="h-4 w-4 rounded border-neutral-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2">No Index</span>
                  </label>
                  <label className="flex items-center text-sm text-neutral-700">
                    <input
                      type="checkbox"
                      checked={formData.isNoFollow}
                      onChange={(event) =>
                        setFormData({ ...formData, isNoFollow: event.target.checked })
                      }
                      className="h-4 w-4 rounded border-neutral-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2">No Follow</span>
                  </label>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false)
                      setEditingReviewer(null)
                    }}
                    className="rounded-lg bg-neutral-100 px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
                  >
                    {editingReviewer ? 'Update Reviewer' : 'Create Reviewer'}
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
