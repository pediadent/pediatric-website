'use client'

import Image from 'next/image'
import { useEffect, useMemo, useState } from 'react'
import { AdjustmentsHorizontalIcon, ArrowPathIcon } from '@heroicons/react/24/outline'
import { SchemaEditor } from '@/components/admin/SchemaEditor'

type Resource = 'articles' | 'reviews'
type SchemaEditorType = 'article' | 'review'

type SeoContentItem = {
  id: string
  title: string
  slug: string
  excerpt: string | null
  seoTitle: string | null
  seoDescription: string | null
  schema: string | null
  isNoIndex: boolean
  isNoFollow: boolean
  featuredImage: string | null
  updatedAt: string
}

type SeoContentForm = {
  id: string
  seoTitle: string
  seoDescription: string
  schema: string
  featuredImage: string
  isNoIndex: boolean
  isNoFollow: boolean
}

type Message = { type: 'success' | 'error'; text: string } | null

interface SeoContentManagerProps {
  resource: Resource
  title: string
  description: string
  emptyStateMessage: string
  schemaType: SchemaEditorType
}

const toForm = (item: SeoContentItem): SeoContentForm => ({
  id: item.id,
  seoTitle: item.seoTitle ?? '',
  seoDescription: item.seoDescription ?? '',
  schema: item.schema ?? '',
  featuredImage: item.featuredImage ?? '',
  isNoIndex: Boolean(item.isNoIndex),
  isNoFollow: Boolean(item.isNoFollow)
})

const toWire = (form: SeoContentForm) => ({
  id: form.id,
  seoTitle: form.seoTitle.trim() === '' ? null : form.seoTitle.trim(),
  seoDescription: form.seoDescription.trim() === '' ? null : form.seoDescription.trim(),
  schema: form.schema.trim() === '' ? null : form.schema,
  featuredImage: form.featuredImage.trim() === '' ? null : form.featuredImage.trim(),
  isNoIndex: form.isNoIndex,
  isNoFollow: form.isNoFollow
})

const formatTimestamp = (value: string) => {
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) {
    return ''
  }
  return parsed.toLocaleString()
}

export function SeoContentManager({
  resource,
  title,
  description,
  emptyStateMessage,
  schemaType
}: SeoContentManagerProps) {
  const [items, setItems] = useState<SeoContentItem[]>([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [activeId, setActiveId] = useState<string | null>(null)
  const [form, setForm] = useState<SeoContentForm | null>(null)
  const [message, setMessage] = useState<Message>(null)
  const [saving, setSaving] = useState(false)
  const [showSchemaEditor, setShowSchemaEditor] = useState(false)

  const responseKey = resource === 'articles' ? 'articles' : 'reviews'
  const apiPath = `/api/admin/seo/${resource}`

  useEffect(() => {
    const controller = new AbortController()
    setLoading(true)

    const params = new URLSearchParams({
      limit: '50'
    })

    if (search.trim()) {
      params.set('search', search.trim())
    }

    fetch(`${apiPath}?${params.toString()}`, {
      signal: controller.signal,
      credentials: 'include'
    })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error('Failed to fetch content')
        }
        const data = await response.json()
        setItems((data?.[responseKey] || []) as SeoContentItem[])
      })
      .catch((error) => {
        if (error.name === 'AbortError') return
        setMessage({ type: 'error', text: 'Unable to load content entries.' })
      })
      .finally(() => setLoading(false))

    return () => controller.abort()
  }, [search, apiPath, responseKey])

  useEffect(() => {
    if (!message) return
    const timer = setTimeout(() => setMessage(null), 5000)
    return () => clearTimeout(timer)
  }, [message])

  const activeItem = useMemo(() => {
    if (!activeId) return null
    return items.find((item) => item.id === activeId) ?? null
  }, [activeId, items])

  useEffect(() => {
    if (!activeItem) {
      setForm(null)
      setShowSchemaEditor(false)
      return
    }
    setForm(toForm(activeItem))
    setShowSchemaEditor(Boolean(activeItem.schema))
  }, [activeItem])

  const handleSelect = (item: SeoContentItem) => {
    setActiveId(item.id)
  }

  const clearSelection = () => {
    setActiveId(null)
    setForm(null)
    setShowSchemaEditor(false)
  }

  const handleFormChange = <Key extends keyof SeoContentForm>(key: Key, value: SeoContentForm[Key]) => {
    setForm((prev) => (prev ? { ...prev, [key]: value } : prev))
  }

  const handleSave = async () => {
    if (!form) return
    setSaving(true)
    setMessage(null)

    try {
      const response = await fetch(apiPath, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(toWire(form))
      })

      if (!response.ok) {
        throw new Error('Failed to update entry')
      }

      const data = await response.json()
      const updatedItems: SeoContentItem[] = data?.[responseKey] || []

      if (updatedItems.length > 0) {
        setItems((prev) => {
          const map = new Map(prev.map((item) => [item.id, item]))
          updatedItems.forEach((item) => map.set(item.id, item))
          return Array.from(map.values()).sort(
            (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
          )
        })
        setActiveId(updatedItems[0].id)
        setMessage({ type: 'success', text: 'SEO metadata updated.' })
      } else {
        setMessage({ type: 'success', text: 'SEO metadata updated.' })
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Failed to update entry.'
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
        <div>
          <h2 className="text-xl font-semibold text-neutral-900">{title}</h2>
          <p className="mt-1 text-sm text-neutral-600">{description}</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={`Search ${resource} by title or slug...`}
              className="w-64 rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <AdjustmentsHorizontalIcon className="pointer-events-none absolute right-3 top-2.5 h-4 w-4 text-neutral-400" />
          </div>
          {activeId && (
            <button
              onClick={clearSelection}
              className="inline-flex items-center rounded-lg border border-neutral-300 px-3 py-2 text-sm font-medium text-neutral-600 transition hover:bg-neutral-100"
            >
              <ArrowPathIcon className="mr-2 h-4 w-4" />
              Clear
            </button>
          )}
        </div>
      </div>

      {message && (
        <div
          className={`rounded-lg border px-4 py-3 text-sm ${
            message.type === 'success'
              ? 'border-green-200 bg-green-50 text-green-700'
              : 'border-red-200 bg-red-50 text-red-700'
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[360px,1fr]">
        <div className="rounded-xl border border-neutral-200 bg-white">
          <div className="border-b border-neutral-200 px-4 py-3">
            <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">
              Recent Updates
            </p>
          </div>
          <div className="max-h-[560px] overflow-y-auto">
            {loading ? (
              <div className="p-4 text-sm text-neutral-500">Loading entries...</div>
            ) : items.length === 0 ? (
              <div className="p-4 text-sm text-neutral-500">{emptyStateMessage}</div>
            ) : (
              <ul className="divide-y divide-neutral-100">
                {items.map((item) => {
                  const isActive = activeId === item.id
                  return (
                    <li key={item.id}>
                      <button
                        onClick={() => handleSelect(item)}
                        className={`block w-full px-4 py-3 text-left transition ${
                          isActive ? 'bg-blue-50' : 'hover:bg-neutral-50'
                        }`}
                      >
                        <p className="text-sm font-semibold text-neutral-900">{item.title}</p>
                        <p className="mt-0.5 text-xs text-neutral-500">{item.slug}</p>
                        <p className="mt-2 text-xs text-neutral-500">
                          Updated {formatTimestamp(item.updatedAt)}
                        </p>
                      </button>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
        </div>

        <div className="rounded-xl border border-neutral-200 bg-white p-6">
          {form && activeItem ? (
            <div className="space-y-6">
              <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-neutral-900">{activeItem.title}</h3>
                  <p className="text-sm text-neutral-600">/{activeItem.slug}</p>
                </div>
                {activeItem.featuredImage && (
                  <div className="relative h-12 w-12 overflow-hidden rounded-lg border border-neutral-200">
                    <Image
                      src={activeItem.featuredImage}
                      alt={activeItem.title}
                      fill
                      sizes="48px"
                      className="object-cover"
                    />
                  </div>
                )}
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="md:col-span-2">
                  <label className="mb-1 block text-sm font-medium text-neutral-700">
                    SEO Title
                  </label>
                  <input
                    type="text"
                    value={form.seoTitle}
                    onChange={(event) => handleFormChange('seoTitle', event.target.value)}
                    maxLength={160}
                    placeholder="Meta title for this entry"
                    className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="mb-1 block text-sm font-medium text-neutral-700">
                    SEO Description
                  </label>
                  <textarea
                    value={form.seoDescription}
                    onChange={(event) => handleFormChange('seoDescription', event.target.value)}
                    rows={3}
                    placeholder="Appears in search results"
                    className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-neutral-700">
                    Featured Image
                  </label>
                  <input
                    type="text"
                    value={form.featuredImage}
                    onChange={(event) => handleFormChange('featuredImage', event.target.value)}
                    placeholder="https://..."
                    className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 text-sm font-medium text-neutral-700">
                    <input
                      type="checkbox"
                      checked={form.isNoIndex}
                      onChange={(event) => handleFormChange('isNoIndex', event.target.checked)}
                      className="h-4 w-4 rounded border-neutral-300 text-blue-600 focus:ring-blue-500"
                    />
                    noindex
                  </label>
                  <label className="flex items-center gap-2 text-sm font-medium text-neutral-700">
                    <input
                      type="checkbox"
                      checked={form.isNoFollow}
                      onChange={(event) => handleFormChange('isNoFollow', event.target.checked)}
                      className="h-4 w-4 rounded border-neutral-300 text-blue-600 focus:ring-blue-500"
                    />
                    nofollow
                  </label>
                </div>
              </div>

              <div className="rounded-lg border border-neutral-200 p-4">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-sm font-medium text-neutral-800">Schema.org Markup</p>
                    <p className="text-xs text-neutral-500">
                      Generate JSON-LD specific to this {resource.slice(0, -1)}.
                    </p>
                  </div>
                  <button
                    onClick={() => setShowSchemaEditor((value) => !value)}
                    className="rounded-lg border border-neutral-300 px-3 py-2 text-sm font-medium text-neutral-600 transition hover:bg-neutral-100"
                  >
                    {showSchemaEditor ? 'Hide Editor' : 'Open Editor'}
                  </button>
                </div>

                {showSchemaEditor && (
                  <div className="mt-4">
                    <SchemaEditor
                      key={form.id}
                      initialSchema={form.schema || undefined}
                      onChange={(value) => handleFormChange('schema', value)}
                      contentType={schemaType}
                    />
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3">
                <button
                  onClick={clearSelection}
                  className="rounded-lg border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-600 transition hover:bg-neutral-100"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          ) : (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <p className="text-sm text-neutral-500">
                Select an entry to edit its SEO metadata.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
