'use client'

import Image from 'next/image'
import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  CheckIcon,
  ClipboardIcon,
  MagnifyingGlassIcon,
  PhotoIcon
} from '@heroicons/react/24/outline'

type MediaItem = {
  id: string
  filename: string
  originalName: string
  mimeType: string
  size: number
  path: string
  alt: string | null
  caption: string | null
  createdAt: string
  updatedAt: string
}

type Message =
  | { type: 'success' | 'error'; text: string }
  | null

const formatBytes = (bytes: number) => {
  if (!bytes) return '0 KB'
  const kilobytes = bytes / 1024
  if (kilobytes < 1024) {
    return `${kilobytes.toFixed(1)} KB`
  }
  return `${(kilobytes / 1024).toFixed(1)} MB`
}

const formatDate = (input: string) => {
  const date = new Date(input)
  if (Number.isNaN(date.getTime())) {
    return ''
  }
  return date.toLocaleString()
}

const toFormValue = (value: string | null) => value ?? ''

export function SeoImageLibrary() {
  const [media, setMedia] = useState<MediaItem[]>([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [alt, setAlt] = useState('')
  const [caption, setCaption] = useState('')
  const [message, setMessage] = useState<Message>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!message) return
    const timer = setTimeout(() => setMessage(null), 5000)
    return () => clearTimeout(timer)
  }, [message])

  const fetchMedia = useCallback(async (query: string) => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        limit: '50'
      })
      if (query.trim()) {
        params.set('search', query.trim())
      }

      const response = await fetch(`/api/admin/seo/images?${params.toString()}`, {
        credentials: 'include'
      })
      if (!response.ok) {
        throw new Error('Failed to load media')
      }
      const data = await response.json()
      const items: MediaItem[] = data?.media || []
      setMedia(items)
    } catch (error) {
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Unable to load media library.'
      })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const handler = setTimeout(() => {
      fetchMedia(search)
    }, 300)
    return () => clearTimeout(handler)
  }, [search, fetchMedia])

  useEffect(() => {
    fetchMedia('')
  }, [fetchMedia])

  const selectedItem = useMemo(() => {
    if (!selectedId) return null
    return media.find((item) => item.id === selectedId) ?? null
  }, [selectedId, media])

  useEffect(() => {
    if (!selectedItem) {
      setAlt('')
      setCaption('')
      return
    }
    setAlt(toFormValue(selectedItem.alt))
    setCaption(toFormValue(selectedItem.caption))
  }, [selectedItem])

  const handleSave = async () => {
    if (!selectedItem) return
    setSaving(true)
    setMessage(null)
    try {
      const response = await fetch(`/api/admin/seo/images/${selectedItem.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          alt: alt.trim() === '' ? null : alt.trim(),
          caption: caption.trim() === '' ? null : caption.trim()
        })
      })
      if (!response.ok) {
        throw new Error('Failed to update media entry')
      }
      const data = await response.json()
      const updated: MediaItem | undefined = data?.media
      if (updated) {
        setMedia((prev) =>
          prev.map((item) => (item.id === updated.id ? updated : item))
        )
      }
      setMessage({ type: 'success', text: 'Image metadata saved.' })
    } catch (error) {
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Unable to update image.'
      })
    } finally {
      setSaving(false)
    }
  }

  const handleCopy = async (value: string) => {
    if (typeof navigator === 'undefined' || !navigator.clipboard) {
      setMessage({ type: 'error', text: 'Clipboard is unavailable.' })
      return
    }
    try {
      await navigator.clipboard.writeText(value)
      setMessage({ type: 'success', text: 'Image path copied to clipboard.' })
    } catch {
      setMessage({ type: 'error', text: 'Unable to copy image path.' })
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-neutral-900">SEO Image Library</h2>
        <p className="mt-1 text-sm text-neutral-600">
          Update alt text and captions to improve accessibility and search relevance.
        </p>
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

      <div className="flex flex-col gap-6 lg:grid lg:grid-cols-[1.2fr,1fr]">
        <div className="rounded-xl border border-neutral-200 bg-white">
          <div className="flex items-center justify-between border-b border-neutral-200 px-5 py-4">
            <div className="relative flex-1">
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search by filename, alt text, or caption..."
                className="w-full rounded-lg border border-neutral-300 px-3 py-2 pr-10 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <MagnifyingGlassIcon className="pointer-events-none absolute right-3 top-2.5 h-4 w-4 text-neutral-400" />
            </div>
          </div>

          <div className="grid gap-4 p-5 sm:grid-cols-2 xl:grid-cols-3">
            {loading ? (
              <div className="col-span-full py-10 text-center text-sm text-neutral-500">
                Loading images...
              </div>
            ) : media.length === 0 ? (
              <div className="col-span-full py-10 text-center text-sm text-neutral-500">
                No images found. Try widening your search.
              </div>
            ) : (
              media.map((item) => {
                const isActive = item.id === selectedId
                const displayPath = item.path || item.filename

                return (
                  <button
                    key={item.id}
                    onClick={() => setSelectedId(item.id)}
                    className={`group flex flex-col overflow-hidden rounded-xl border transition ${
                      isActive ? 'border-blue-500 ring-2 ring-blue-200' : 'border-neutral-200 hover:border-neutral-300'
                    }`}
                  >
                    <div className="relative flex h-40 items-center justify-center bg-neutral-100">
                      {item.path ? (
                        <Image
                          src={item.path}
                          alt={item.alt || item.originalName}
                          fill
                          sizes="(max-width: 1024px) 50vw, 33vw"
                          className="object-cover"
                        />
                      ) : (
                        <PhotoIcon className="h-12 w-12 text-neutral-400" />
                      )}
                    </div>
                    <div className="flex flex-1 flex-col gap-1 p-4 text-left">
                      <p className="truncate text-sm font-semibold text-neutral-900">
                        {item.originalName || item.filename}
                      </p>
                      <p className="truncate text-xs text-neutral-500">{displayPath}</p>
                      <p className="text-xs text-neutral-400">{formatBytes(item.size)}</p>
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation()
                          handleCopy(displayPath)
                        }}
                        className="mt-2 inline-flex items-center rounded border border-neutral-300 px-2 py-1 text-xs font-medium text-neutral-600 transition hover:bg-neutral-100"
                      >
                        <ClipboardIcon className="mr-1 h-4 w-4" />
                        Copy Path
                      </button>
                    </div>
                  </button>
                )
              })
            )}
          </div>
        </div>

        <div className="rounded-xl border border-neutral-200 bg-white p-6">
          {selectedItem ? (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-neutral-900">
                    {selectedItem.originalName || selectedItem.filename}
                  </h3>
                  <p className="text-xs text-neutral-500">
                    {selectedItem.mimeType} • {formatBytes(selectedItem.size)}
                  </p>
                </div>
                <p className="text-xs text-neutral-400">
                  Updated {formatDate(selectedItem.updatedAt)}
                </p>
              </div>

              {selectedItem.path && (
                <div className="relative h-40 w-full overflow-hidden rounded-lg">
                  <Image
                    src={selectedItem.path}
                    alt={selectedItem.alt || selectedItem.originalName}
                    fill
                    sizes="(max-width: 1024px) 100vw, 600px"
                    className="object-cover"
                  />
                </div>
              )}

              <div>
                <label className="mb-1 block text-sm font-medium text-neutral-700">
                  Alt Text
                </label>
                <textarea
                  value={alt}
                  onChange={(event) => setAlt(event.target.value)}
                  rows={3}
                  placeholder="Describe the image for screen readers and search engines"
                  className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-neutral-700">
                  Caption
                </label>
                <textarea
                  value={caption}
                  onChange={(event) => setCaption(event.target.value)}
                  rows={2}
                  placeholder="Optional caption displayed with the image"
                  className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3">
                <button
                  onClick={() => setSelectedId(null)}
                  className="rounded-lg border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-600 transition hover:bg-neutral-100"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? 'Saving...' : (
                    <span className="inline-flex items-center">
                      <CheckIcon className="mr-2 h-4 w-4" />
                      Save Changes
                    </span>
                  )}
                </button>
              </div>
            </div>
          ) : (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <PhotoIcon className="mb-3 h-10 w-10 text-neutral-300" />
              <p className="text-sm text-neutral-500">
                Select an image to edit its alt text and caption.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
