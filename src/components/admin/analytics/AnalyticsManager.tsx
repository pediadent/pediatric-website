'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  ArrowPathIcon,
  CheckCircleIcon,
  CodeBracketIcon,
  DocumentDuplicateIcon,
  ExclamationTriangleIcon,
  PlusIcon,
  TrashIcon
} from '@heroicons/react/24/outline'

type AnalyticsProvider =
  | 'GOOGLE_ANALYTICS'
  | 'GOOGLE_TAG_MANAGER'
  | 'SEARCH_CONSOLE'
  | 'FACEBOOK_PIXEL'
  | 'LINKEDIN_INSIGHT'
  | 'TIKTOK_PIXEL'
  | 'OTHER'

type AnalyticsSnippet = {
  id: string
  name: string
  provider: AnalyticsProvider
  description: string | null
  code: string
  isEnabled: boolean
  createdAt: string
  updatedAt: string
}

type AnalyticsSnippetForm = {
  id?: string
  name: string
  provider: AnalyticsProvider
  description: string
  code: string
  isEnabled: boolean
}

type Message =
  | { type: 'success'; text: string }
  | { type: 'error'; text: string }
  | null

const DEFAULT_FORM: AnalyticsSnippetForm = {
  name: '',
  provider: 'OTHER',
  description: '',
  code: '',
  isEnabled: true
}

const PROVIDER_OPTIONS: Array<{ value: AnalyticsProvider; label: string }> = [
  { value: 'GOOGLE_ANALYTICS', label: 'Google Analytics' },
  { value: 'GOOGLE_TAG_MANAGER', label: 'Google Tag Manager' },
  { value: 'SEARCH_CONSOLE', label: 'Google Search Console' },
  { value: 'FACEBOOK_PIXEL', label: 'Facebook Pixel' },
  { value: 'LINKEDIN_INSIGHT', label: 'LinkedIn Insight Tag' },
  { value: 'TIKTOK_PIXEL', label: 'TikTok Pixel' },
  { value: 'OTHER', label: 'Custom / Other' }
]

const providerLabel = (value: AnalyticsProvider) => {
  const match = PROVIDER_OPTIONS.find((option) => option.value === value)
  return match?.label ?? 'Custom / Other'
}

const formatDateTime = (value: string) => {
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) {
    return ''
  }
  return parsed.toLocaleString()
}

export function AnalyticsManager() {
  const [snippets, setSnippets] = useState<AnalyticsSnippet[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [form, setForm] = useState<AnalyticsSnippetForm>({ ...DEFAULT_FORM })
  const [message, setMessage] = useState<Message>(null)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const selectedIdRef = useRef<string | null>(null)

  useEffect(() => {
    selectedIdRef.current = selectedId
  }, [selectedId])

  const updateForm = useCallback((snippet: AnalyticsSnippet | null) => {
    if (!snippet) {
      setForm({ ...DEFAULT_FORM })
      return
    }
    setForm({
      id: snippet.id,
      name: snippet.name,
      provider: snippet.provider,
      description: snippet.description ?? '',
      code: snippet.code,
      isEnabled: Boolean(snippet.isEnabled)
    })
  }, [])

  const fetchSnippets = useCallback(async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/analytics', {
        credentials: 'include'
      })
      if (!response.ok) {
        throw new Error('Failed to fetch analytics snippets')
      }
      const data = await response.json()
      const records: AnalyticsSnippet[] = data?.snippets || []
      const currentSelected = selectedIdRef.current
      const isCurrentValid = currentSelected
        ? records.some((record) => record.id === currentSelected)
        : false
      const fallbackId = records[0]?.id ?? null
      const nextSelectedId = isCurrentValid ? currentSelected : fallbackId

      setSnippets(records)
      setSelectedId(nextSelectedId)

      if (nextSelectedId) {
        const target = records.find((record) => record.id === nextSelectedId) ?? null
        updateForm(target)
      } else {
        updateForm(null)
      }
    } catch (error) {
      console.error(error)
      setMessage({
        type: 'error',
        text: 'Unable to load analytics tracking codes.'
      })
    } finally {
      setLoading(false)
    }
  }, [updateForm])

  useEffect(() => {
    fetchSnippets()
  }, [fetchSnippets])

  useEffect(() => {
    if (!message) return
    const timer = setTimeout(() => setMessage(null), 5000)
    return () => clearTimeout(timer)
  }, [message])

  const sortedSnippets = useMemo(() => {
    return [...snippets].sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    )
  }, [snippets])

  const handleSelect = (snippet: AnalyticsSnippet) => {
    setSelectedId(snippet.id)
    updateForm(snippet)
  }

  const startNewSnippet = () => {
    setSelectedId(null)
    setForm({ ...DEFAULT_FORM })
  }

  const handleChange = <Key extends keyof AnalyticsSnippetForm>(
    key: Key,
    value: AnalyticsSnippetForm[Key]
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const upsertSnippet = (record: AnalyticsSnippet) => {
    setSnippets((prev) => {
      const existingIndex = prev.findIndex((item) => item.id === record.id)
      if (existingIndex !== -1) {
        const next = [...prev]
        next[existingIndex] = record
        return next
      }
      return [record, ...prev]
    })
  }

  const handleSave = async () => {
    const payload = {
      name: form.name.trim(),
      provider: form.provider,
      description: form.description.trim(),
      code: form.code.trim(),
      isEnabled: form.isEnabled
    }

    if (!payload.name) {
      setMessage({ type: 'error', text: 'Please provide a descriptive name.' })
      return
    }

    if (!payload.code) {
      setMessage({
        type: 'error',
        text: 'Paste the tracking code snippet you want added to the <head>.'
      })
      return
    }

    setSaving(true)
    setMessage(null)

    try {
      if (form.id) {
        const response = await fetch(`/api/admin/analytics/${form.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(payload)
        })

        if (!response.ok) {
          const data = await response.json().catch(() => ({}))
          throw new Error(data?.error || 'Failed to update tracking code.')
        }

        const data = await response.json()
        const record: AnalyticsSnippet = data?.snippet
        if (record) {
          upsertSnippet(record)
          setSelectedId(record.id)
          updateForm(record)
        }

        setMessage({ type: 'success', text: 'Tracking code updated.' })
      } else {
        const response = await fetch('/api/admin/analytics', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(payload)
        })

        if (!response.ok) {
          const data = await response.json().catch(() => ({}))
          throw new Error(data?.error || 'Failed to create tracking code.')
        }

        const data = await response.json()
        const record: AnalyticsSnippet = data?.snippet
        if (record) {
          upsertSnippet(record)
          setSelectedId(record.id)
          updateForm(record)
        }

        setMessage({ type: 'success', text: 'Tracking code saved and enabled.' })
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text:
          error instanceof Error
            ? error.message
            : 'Unable to persist tracking code.'
      })
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!form.id) return
    const confirmed = confirm(
      'Remove this tracking snippet? The code will no longer be injected into the site head.'
    )
    if (!confirmed) return

    setDeleting(true)
    setMessage(null)

    try {
      const response = await fetch(`/api/admin/analytics/${form.id}`, {
        method: 'DELETE',
        credentials: 'include'
      })
      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        throw new Error(data?.error || 'Failed to delete tracking code.')
      }

      setSnippets((prev) => prev.filter((item) => item.id !== form.id))
      startNewSnippet()
      setMessage({ type: 'success', text: 'Tracking code removed.' })
    } catch (error) {
      setMessage({
        type: 'error',
        text:
          error instanceof Error
            ? error.message
            : 'Unable to delete tracking code.'
      })
    } finally {
      setDeleting(false)
    }
  }

  const copyToClipboard = async (code: string) => {
    if (typeof navigator === 'undefined' || !navigator.clipboard) {
      setMessage({
        type: 'error',
        text: 'Clipboard is unavailable in this environment.'
      })
      return
    }
    try {
      await navigator.clipboard.writeText(code)
      setMessage({ type: 'success', text: 'Snippet copied to clipboard.' })
    } catch {
      setMessage({ type: 'error', text: 'Unable to copy snippet.' })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-900">
            Analytics &amp; Tracking
          </h1>
          <p className="mt-1 max-w-3xl text-sm text-neutral-600">
            Manage Google Analytics, Search Console verification, Facebook Pixel, or any
            custom scripts that need to be injected into the site&apos;s{' '}
            <code className="rounded bg-neutral-100 px-1.5 py-0.5 text-xs">&lt;head&gt;</code>.
          </p>
        </div>
        <button
          onClick={startNewSnippet}
          className="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
        >
          <PlusIcon className="mr-2 h-4 w-4" />
          New Snippet
        </button>
      </div>

      <div className="rounded-xl border border-blue-100 bg-blue-50 p-4 text-sm text-blue-700">
        <p className="flex items-start gap-2">
          <CheckCircleIcon className="mt-0.5 h-5 w-5" />
          Paste the exact script or meta tag provided by your analytics provider.
          We preserve the markup and insert it server-side before the closing
          <code className="ml-1 rounded bg-blue-100 px-1 py-0.5 text-xs text-blue-800">
            &lt;/head&gt;
          </code>{' '}
          element on every page.
        </p>
      </div>

  <div className="grid gap-6 lg:grid-cols-[320px,1fr]">
        <div className="rounded-xl border border-neutral-200 bg-white">
          <div className="border-b border-neutral-200 px-4 py-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-neutral-700 uppercase tracking-wide">
                Active Snippets
              </h2>
              <button
                onClick={fetchSnippets}
                className="rounded-full border border-neutral-200 p-1 text-neutral-500 transition hover:bg-neutral-100 hover:text-neutral-700"
                title="Refresh list"
              >
                <ArrowPathIcon className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
          <div className="max-h-[540px] overflow-y-auto">
            {loading ? (
              <div className="p-4 text-sm text-neutral-500">Loading snippets...</div>
            ) : sortedSnippets.length === 0 ? (
              <div className="space-y-2 p-4 text-sm text-neutral-500">
                <p>No tracking codes yet.</p>
                <p>Add Google Analytics, pixels, or verification tags to get started.</p>
              </div>
            ) : (
              <ul className="divide-y divide-neutral-100">
                {sortedSnippets.map((snippet) => {
                  const isActive = selectedId === snippet.id
                  return (
                    <li key={snippet.id}>
                      <button
                        onClick={() => handleSelect(snippet)}
                        className={`flex w-full flex-col items-start px-4 py-3 text-left transition ${
                          isActive ? 'bg-blue-50' : 'hover:bg-neutral-50'
                        }`}
                      >
                        <div className="flex w-full items-center justify-between">
                          <span className="text-sm font-semibold text-neutral-900">
                            {snippet.name}
                          </span>
                          <span
                            className={`text-xs font-medium ${
                              snippet.isEnabled ? 'text-green-600' : 'text-neutral-400'
                            }`}
                          >
                            {snippet.isEnabled ? 'Enabled' : 'Disabled'}
                          </span>
                        </div>
                        <span className="mt-1 text-xs text-neutral-500">
                          {providerLabel(snippet.provider)}
                        </span>
                        <span className="mt-2 text-xs text-neutral-400">
                          Updated {formatDateTime(snippet.updatedAt)}
                        </span>
                      </button>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
        </div>

        <div className="space-y-4">
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

          <div className="rounded-xl border border-neutral-200 bg-white p-6">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <h3 className="text-lg font-semibold text-neutral-900">
                  {form.id ? 'Edit Tracking Snippet' : 'New Tracking Snippet'}
                </h3>
                <p className="text-sm text-neutral-500">
                  Snippets render in the site head exactly as provided.
                </p>
              </div>
              {form.code && (
                <button
                  onClick={() => copyToClipboard(form.code)}
                  className="inline-flex items-center rounded-lg border border-neutral-300 px-3 py-2 text-sm font-medium text-neutral-600 transition hover:bg-neutral-100"
                >
                  <DocumentDuplicateIcon className="mr-2 h-4 w-4" />
                  Copy Code
                </button>
              )}
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-neutral-700">
                  Display Name
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(event) => handleChange('name', event.target.value)}
                  placeholder="Google Analytics 4"
                  className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-neutral-700">
                  Provider
                </label>
                <select
                  value={form.provider}
                  onChange={(event) =>
                    handleChange('provider', event.target.value as AnalyticsProvider)
                  }
                  className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {PROVIDER_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="mb-1 block text-sm font-medium text-neutral-700">
                  Notes (optional)
                </label>
                <textarea
                  value={form.description}
                  onChange={(event) => handleChange('description', event.target.value)}
                  rows={2}
                  placeholder="Example: Paste GA4 global site tag for production."
                  className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="mb-1 block text-sm font-medium text-neutral-700">
                  Code Snippet
                </label>
                <textarea
                  value={form.code}
                  onChange={(event) => handleChange('code', event.target.value)}
                  rows={10}
                  placeholder="<script>/* your analytics code */</script>"
                  className="w-full rounded-lg border border-neutral-300 px-3 py-3 font-mono text-xs leading-5 text-neutral-800 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="mt-2 flex items-start gap-2 text-xs text-neutral-500">
                  <CodeBracketIcon className="mt-0.5 h-4 w-4 text-neutral-400" />
                  Include the full HTML snippet (script, meta, link, etc.). We sanitize nothing
                  and render it exactly as provided.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 text-sm font-medium text-neutral-700">
                  <input
                    type="checkbox"
                    checked={form.isEnabled}
                    onChange={(event) => handleChange('isEnabled', event.target.checked)}
                    className="h-4 w-4 rounded border-neutral-300 text-blue-600 focus:ring-blue-500"
                  />
                  Enabled
                </label>
                <span className="text-xs text-neutral-400">
                  Disabled snippets stay saved but are not injected.
                </span>
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-3 md:flex-row md:justify-between">
              {form.id ? (
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="inline-flex items-center rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <TrashIcon className="mr-2 h-4 w-4" />
                  {deleting ? 'Deleting...' : 'Delete Snippet'}
                </button>
              ) : (
                <div className="flex items-center gap-2 text-xs text-neutral-500">
                  <ExclamationTriangleIcon className="h-4 w-4 text-amber-500" />
                  Remember to click save after pasting your code snippet.
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={startNewSnippet}
                  className="rounded-lg border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-600 transition hover:bg-neutral-100"
                >
                  Clear
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

          {form.code && (
            <div className="rounded-xl border border-neutral-200 bg-white p-6">
              <h4 className="flex items-center gap-2 text-sm font-semibold text-neutral-800">
                <CodeBracketIcon className="h-4 w-4 text-neutral-500" />
                Render Preview
              </h4>
              <pre className="mt-3 max-h-64 overflow-auto rounded-lg bg-neutral-900 p-4 text-xs text-neutral-50">
                <code>{form.code}</code>
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
