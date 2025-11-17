'use client'

import { useEffect, useMemo, useState } from 'react'
import { DocumentDuplicateIcon, PlusIcon } from '@heroicons/react/24/outline'
import { SchemaEditor } from '@/components/admin/SchemaEditor'

type SchemaEditorType = 'article' | 'review' | 'dentist' | 'organization' | 'website'

type SeoSetting = {
  id: string
  path: string
  title: string | null
  description: string | null
  ogTitle: string | null
  ogDescription: string | null
  ogImage: string | null
  twitterTitle: string | null
  twitterDescription: string | null
  twitterImage: string | null
  canonical: string | null
  robots: string | null
  schema: string | null
  updatedAt: string
}

type SeoSettingForm = {
  id?: string
  path: string
  title: string
  description: string
  ogTitle: string
  ogDescription: string
  ogImage: string
  twitterTitle: string
  twitterDescription: string
  twitterImage: string
  canonical: string
  robots: string
  schema: string
}

type MessageState =
  | { type: 'success'; text: string }
  | { type: 'error'; text: string }
  | null

const emptyForm: SeoSettingForm = {
  path: '',
  title: '',
  description: '',
  ogTitle: '',
  ogDescription: '',
  ogImage: '',
  twitterTitle: '',
  twitterDescription: '',
  twitterImage: '',
  canonical: '',
  robots: '',
  schema: ''
}

const SCHEMA_TYPE_MAP: Record<string, SchemaEditorType> = {
  article: 'article',
  newsarticle: 'article',
  review: 'review',
  dentist: 'dentist',
  organization: 'organization',
  localbusiness: 'organization',
  website: 'website'
}

const formatDate = (value: string) => {
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) {
    return ''
  }
  return parsed.toLocaleString()
}

const toSchemaType = (schema: string): SchemaEditorType => {
  try {
    const parsed = JSON.parse(schema)
    const typeValue = String(parsed?.['@type'] || '').toLowerCase()
    if (typeValue && typeValue in SCHEMA_TYPE_MAP) {
      return SCHEMA_TYPE_MAP[typeValue]
    }
  } catch {
    // ignore invalid json
  }
  return 'website'
}

const toWireValue = (value: string) => {
  const trimmed = value.trim()
  return trimmed === '' ? null : trimmed
}

export function SeoSettingsManager() {
  const [settings, setSettings] = useState<SeoSetting[]>([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [form, setForm] = useState<SeoSettingForm>(emptyForm)
  const [schemaType, setSchemaType] = useState<SchemaEditorType>('website')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<MessageState>(null)
  const [showSchemaEditor, setShowSchemaEditor] = useState(false)

  useEffect(() => {
    setLoading(true)
    fetch('/api/admin/seo/settings', { credentials: 'include' })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error('Failed to fetch settings')
        }
        const data = await response.json()
        setSettings((data?.settings || []) as SeoSetting[])
      })
      .catch(() => {
        setMessage({ type: 'error', text: 'Unable to load SEO settings.' })
      })
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (!message) return
    const timer = setTimeout(() => setMessage(null), 5000)
    return () => clearTimeout(timer)
  }, [message])

  const filteredSettings = useMemo(() => {
    if (!search.trim()) {
      return settings
    }
    const lower = search.trim().toLowerCase()
    return settings.filter((setting) =>
      setting.path.toLowerCase().includes(lower) ||
      (setting.title ?? '').toLowerCase().includes(lower)
    )
  }, [search, settings])

  const handleSelect = (setting: SeoSetting) => {
    setSelectedId(setting.id)
    setForm({
      id: setting.id,
      path: setting.path,
      title: setting.title ?? '',
      description: setting.description ?? '',
      ogTitle: setting.ogTitle ?? '',
      ogDescription: setting.ogDescription ?? '',
      ogImage: setting.ogImage ?? '',
      twitterTitle: setting.twitterTitle ?? '',
      twitterDescription: setting.twitterDescription ?? '',
      twitterImage: setting.twitterImage ?? '',
      canonical: setting.canonical ?? '',
      robots: setting.robots ?? '',
      schema: setting.schema ?? ''
    })
    setSchemaType(setting.schema ? toSchemaType(setting.schema) : 'website')
    setShowSchemaEditor(Boolean(setting.schema))
  }

  const resetForm = () => {
    setSelectedId(null)
    setForm(emptyForm)
    setSchemaType('website')
    setShowSchemaEditor(false)
  }

  const handleInputChange = (
    key: keyof SeoSettingForm,
    value: string
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const handleSave = async () => {
    if (!form.path.trim()) {
      setMessage({ type: 'error', text: 'Path is required.' })
      return
    }

    setSaving(true)
    setMessage(null)

    const payload = {
      path: form.path.trim(),
      title: toWireValue(form.title),
      description: toWireValue(form.description),
      ogTitle: toWireValue(form.ogTitle),
      ogDescription: toWireValue(form.ogDescription),
      ogImage: toWireValue(form.ogImage),
      twitterTitle: toWireValue(form.twitterTitle),
      twitterDescription: toWireValue(form.twitterDescription),
      twitterImage: toWireValue(form.twitterImage),
      canonical: toWireValue(form.canonical),
      robots: toWireValue(form.robots),
      schema: form.schema.trim() === '' ? null : form.schema
    }

    try {
      const response = await fetch('/api/admin/seo/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        throw new Error('Failed to save SEO setting')
      }

      const data = await response.json()
      const updatedSettings: SeoSetting[] = data?.settings || []

      setSettings((prev) => {
        const map = new Map(prev.map((item) => [item.path, item]))
        updatedSettings.forEach((item) => map.set(item.path, item))
        return Array.from(map.values()).sort(
          (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        )
      })

      const saved = updatedSettings[0]
      if (saved) {
        setSelectedId(saved.id)
        handleSelect(saved)
      }

      setMessage({ type: 'success', text: 'SEO setting saved successfully.' })
    } catch (error) {
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Failed to save SEO setting.'
      })
    } finally {
      setSaving(false)
    }
  }

  const copyPath = async (path: string) => {
    if (typeof navigator === 'undefined' || !navigator.clipboard) {
      setMessage({ type: 'error', text: 'Clipboard is not available in this environment.' })
      return
    }
    try {
      await navigator.clipboard.writeText(path)
      setMessage({ type: 'success', text: 'Path copied to clipboard.' })
    } catch {
      setMessage({ type: 'error', text: 'Unable to copy path.' })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-neutral-900">Sitewide SEO Settings</h2>
          <p className="mt-1 text-sm text-neutral-600">
            Manage metadata for static pages and custom routes.
          </p>
        </div>
        <button
          onClick={resetForm}
          className="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700"
        >
          <PlusIcon className="mr-2 h-4 w-4" />
          New Path
        </button>
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

      <div className="grid gap-6 lg:grid-cols-[320px,1fr]">
        <div className="rounded-xl border border-neutral-200 bg-white">
          <div className="border-b border-neutral-200 p-4">
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by path or title..."
              className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="max-h-[540px] overflow-y-auto">
            {loading ? (
              <div className="p-4 text-sm text-neutral-500">Loading settings...</div>
            ) : filteredSettings.length === 0 ? (
              <div className="p-4 text-sm text-neutral-500">
                No SEO settings found. Create a new entry to get started.
              </div>
            ) : (
              <ul className="divide-y divide-neutral-100">
                {filteredSettings.map((setting) => {
                  const isActive = selectedId === setting.id
                  return (
                    <li key={setting.id}>
                      <button
                        onClick={() => handleSelect(setting)}
                        className={`flex w-full flex-col items-start px-4 py-3 text-left transition ${
                          isActive ? 'bg-blue-50' : 'hover:bg-neutral-50'
                        }`}
                      >
                        <div className="flex w-full items-center justify-between">
                          <span className="text-sm font-medium text-neutral-900">
                            {setting.path}
                          </span>
                          <span className="text-xs text-neutral-500">
                            {formatDate(setting.updatedAt)}
                          </span>
                        </div>
                        {setting.title && (
                          <span className="mt-1 text-xs text-neutral-500">
                            {setting.title}
                          </span>
                        )}
                      </button>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
        </div>

        <div className="rounded-xl border border-neutral-200 bg-white p-6">
          <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h3 className="text-lg font-semibold text-neutral-900">
                {selectedId ? 'Edit SEO Setting' : 'Create SEO Setting'}
              </h3>
              <p className="text-sm text-neutral-600">
                Define meta tags for <code className="rounded bg-neutral-100 px-1.5 py-0.5 text-xs">{form.path || '/path'}</code>
              </p>
            </div>
            {form.path && (
              <button
                onClick={() => copyPath(form.path)}
                className="inline-flex items-center rounded-lg border border-neutral-300 px-3 py-2 text-sm font-medium text-neutral-600 transition hover:bg-neutral-100"
              >
                <DocumentDuplicateIcon className="mr-2 h-4 w-4" />
                Copy Path
              </button>
            )}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="mb-1 block text-sm font-medium text-neutral-700">
                Path
              </label>
              <input
                type="text"
                value={form.path}
                onChange={(event) => handleInputChange('path', event.target.value)}
                placeholder="/about-us"
                className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-neutral-700">
                Title Tag
              </label>
              <input
                type="text"
                value={form.title}
                onChange={(event) => handleInputChange('title', event.target.value)}
                maxLength={160}
                placeholder="Compelling meta title..."
                className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-neutral-700">
                Canonical URL
              </label>
              <input
                type="text"
                value={form.canonical}
                onChange={(event) => handleInputChange('canonical', event.target.value)}
                placeholder="https://example.com/path"
                className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="mb-1 block text-sm font-medium text-neutral-700">
                Meta Description
              </label>
              <textarea
                value={form.description}
                onChange={(event) => handleInputChange('description', event.target.value)}
                rows={3}
                placeholder="Concise description for search results..."
                className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-neutral-700">
                Robots Directives
              </label>
              <input
                type="text"
                value={form.robots}
                onChange={(event) => handleInputChange('robots', event.target.value)}
                placeholder="index,follow"
                className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-neutral-700">
                Open Graph Title
              </label>
              <input
                type="text"
                value={form.ogTitle}
                onChange={(event) => handleInputChange('ogTitle', event.target.value)}
                placeholder="Social share title"
                className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-neutral-700">
                Open Graph Description
              </label>
              <textarea
                value={form.ogDescription}
                onChange={(event) => handleInputChange('ogDescription', event.target.value)}
                rows={2}
                placeholder="Social share description"
                className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-neutral-700">
                Open Graph Image
              </label>
              <input
                type="text"
                value={form.ogImage}
                onChange={(event) => handleInputChange('ogImage', event.target.value)}
                placeholder="/media/og-image.jpg"
                className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-neutral-700">
                Twitter Title
              </label>
              <input
                type="text"
                value={form.twitterTitle}
                onChange={(event) => handleInputChange('twitterTitle', event.target.value)}
                placeholder="Twitter headline"
                className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-neutral-700">
                Twitter Description
              </label>
              <textarea
                value={form.twitterDescription}
                onChange={(event) => handleInputChange('twitterDescription', event.target.value)}
                rows={2}
                placeholder="Twitter description"
                className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-neutral-700">
                Twitter Image
              </label>
              <input
                type="text"
                value={form.twitterImage}
                onChange={(event) => handleInputChange('twitterImage', event.target.value)}
                placeholder="/media/twitter-card.jpg"
                className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="mt-6 rounded-lg border border-neutral-200 p-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm font-medium text-neutral-800">Structured Data</p>
                <p className="text-xs text-neutral-500">
                  Generate JSON-LD schema to enhance search visibility.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <select
                  value={schemaType}
                  onChange={(event) => setSchemaType(event.target.value as SchemaEditorType)}
                  className="rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="website">Website</option>
                  <option value="organization">Organization</option>
                  <option value="article">Article</option>
                  <option value="review">Review</option>
                  <option value="dentist">Dentist</option>
                </select>
                <button
                  onClick={() => setShowSchemaEditor((value) => !value)}
                  className="rounded-lg border border-neutral-300 px-3 py-2 text-sm font-medium text-neutral-600 transition hover:bg-neutral-100"
                >
                  {showSchemaEditor ? 'Hide Editor' : 'Open Editor'}
                </button>
              </div>
            </div>

            {showSchemaEditor && (
              <div className="mt-4">
                <SchemaEditor
                  key={selectedId ?? 'new-setting'}
                  initialSchema={form.schema || undefined}
                  onChange={(value) => handleInputChange('schema', value)}
                  contentType={schemaType}
                />
              </div>
            )}
          </div>

          <div className="mt-6 flex flex-col gap-3 md:flex-row md:justify-end">
            <button
              onClick={resetForm}
              className="rounded-lg border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-600 transition hover:bg-neutral-100"
            >
              Reset
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
      </div>
    </div>
  )
}
