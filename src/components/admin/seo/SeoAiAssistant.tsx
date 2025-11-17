'use client'

import { FormEvent, useEffect, useMemo, useState } from 'react'
import {
  ArrowPathIcon,
  ClipboardIcon,
  SparklesIcon
} from '@heroicons/react/24/outline'

type Provider = 'openai' | 'anthropic' | 'gemini'

interface AIFormState {
  provider: Provider
  apiKey: string
  model: string
  prompt: string
  systemPrompt: string
  temperature: string
  maxTokens: string
}

type Message =
  | { type: 'success' | 'error'; text: string }
  | null

const DEFAULT_MODELS: Record<Provider, string> = {
  openai: 'gpt-4o-mini',
  anthropic: 'claude-3-5-sonnet-latest',
  gemini: 'gemini-1.5-pro'
}

const PROMPT_LIBRARY = [
  {
    title: 'Meta Description (160 chars)',
    prompt:
      'Write a concise meta description under 160 characters for a pediatric dentistry article focused on preventive care for kids in Queens, NY.'
  },
  {
    title: 'Schema Summary',
    prompt:
      'Generate a JSON summary of key facts to include in an Article schema for a pediatric dentistry blog post. Return bullet points only.'
  },
  {
    title: 'Image Alt Text',
    prompt:
      'Provide 3 short variations of accessible alt text for an image showing a pediatric dentist treating a young patient.'
  }
]

export function SeoAiAssistant() {
  const [form, setForm] = useState<AIFormState>({
    provider: 'openai',
    apiKey: '',
    model: DEFAULT_MODELS.openai,
    prompt: '',
    systemPrompt: '',
    temperature: '0.5',
    maxTokens: '600'
  })
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState('')
  const [message, setMessage] = useState<Message>(null)
  const [showAdvanced, setShowAdvanced] = useState(false)

  useEffect(() => {
    if (!message) return
    const timer = setTimeout(() => setMessage(null), 5000)
    return () => clearTimeout(timer)
  }, [message])

  const temperatureValue = useMemo(() => {
    const value = parseFloat(form.temperature)
    if (Number.isNaN(value)) return undefined
    return value
  }, [form.temperature])

  const maxTokensValue = useMemo(() => {
    const value = parseInt(form.maxTokens, 10)
    if (Number.isNaN(value)) return undefined
    return value
  }, [form.maxTokens])

  const handleChange = <Key extends keyof AIFormState>(key: Key, value: AIFormState[Key]) => {
    setForm((prev) => {
      const next = { ...prev, [key]: value }
      if (key === 'provider') {
        const providerKey = value as Provider
        next.provider = providerKey
        next.model = DEFAULT_MODELS[providerKey]
      }
      return next
    })
  }

  const handlePromptTemplate = (prompt: string) => {
    setForm((prev) => ({ ...prev, prompt }))
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setMessage(null)
    setResult('')

    if (!form.apiKey.trim() || !form.model.trim() || !form.prompt.trim()) {
      setMessage({ type: 'error', text: 'API key, model, and prompt are required.' })
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/admin/seo/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          provider: form.provider,
          apiKey: form.apiKey.trim(),
          model: form.model.trim(),
          prompt: form.prompt.trim(),
          systemPrompt: form.systemPrompt.trim() || undefined,
          temperature: typeof temperatureValue === 'number' ? temperatureValue : undefined,
          maxTokens: typeof maxTokensValue === 'number' ? maxTokensValue : undefined
        })
      })

      if (!response.ok) {
        const errorBody = await response.json().catch(() => null)
        const errorMessage =
          (errorBody?.error as string | undefined) || 'Failed to generate SEO copy.'
        throw new Error(errorMessage)
      }

      const data = await response.json()
      setResult(data?.text || '')
      setMessage({ type: 'success', text: 'AI assistant generated new content.' })
    } catch (error) {
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Unable to generate content.'
      })
    } finally {
      setLoading(false)
    }
  }

  const copyResult = async () => {
    if (!result) return
    if (typeof navigator === 'undefined' || !navigator.clipboard) {
      setMessage({ type: 'error', text: 'Clipboard is unavailable.' })
      return
    }
    try {
      await navigator.clipboard.writeText(result)
      setMessage({ type: 'success', text: 'Output copied to clipboard.' })
    } catch {
      setMessage({ type: 'error', text: 'Unable to copy the output.' })
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[420px,1fr]">
      <form
        onSubmit={handleSubmit}
        className="space-y-6 rounded-xl border border-neutral-200 bg-white p-6"
      >
        <div>
          <h2 className="text-xl font-semibold text-neutral-900">SEO AI Assistant</h2>
          <p className="mt-1 text-sm text-neutral-600">
            Generate titles, descriptions, schema snippets, and more with your preferred provider.
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

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-700">
              Provider
            </label>
            <select
              value={form.provider}
              onChange={(event) => handleChange('provider', event.target.value as Provider)}
              className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="openai">OpenAI</option>
              <option value="anthropic">Anthropic</option>
              <option value="gemini">Google Gemini</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-700">
              Model
            </label>
            <input
              type="text"
              value={form.model}
              onChange={(event) => handleChange('model', event.target.value)}
              placeholder="gpt-4o-mini"
              className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-neutral-700">
            API Key
          </label>
          <input
            type="password"
            value={form.apiKey}
            onChange={(event) => handleChange('apiKey', event.target.value)}
            placeholder="Enter your API key (not stored)"
            className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-neutral-700">
            Prompt
          </label>
          <textarea
            value={form.prompt}
            onChange={(event) => handleChange('prompt', event.target.value)}
            rows={6}
            placeholder="Describe the SEO copy you need..."
            className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="space-y-2">
          <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">
            Quick Prompts
          </p>
          <div className="flex flex-wrap gap-2">
            {PROMPT_LIBRARY.map((item) => (
              <button
                type="button"
                key={item.title}
                onClick={() => handlePromptTemplate(item.prompt)}
                className="rounded-full border border-neutral-300 px-3 py-1 text-xs font-medium text-neutral-600 transition hover:bg-neutral-100"
              >
                {item.title}
              </button>
            ))}
          </div>
        </div>

        <div>
          <button
            type="button"
            onClick={() => setShowAdvanced((value) => !value)}
            className="text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            {showAdvanced ? 'Hide advanced controls' : 'Show temperature and token settings'}
          </button>
        </div>

        {showAdvanced && (
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-neutral-700">
                Temperature
              </label>
              <input
                type="number"
                min="0"
                max="1"
                step="0.1"
                value={form.temperature}
                onChange={(event) => handleChange('temperature', event.target.value)}
                className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-neutral-700">
                Max Tokens
              </label>
              <input
                type="number"
                min="1"
                value={form.maxTokens}
                onChange={(event) => handleChange('maxTokens', event.target.value)}
                className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? (
            <span className="inline-flex items-center">
              <ArrowPathIcon className="mr-2 h-4 w-4 animate-spin" />
              Generating...
            </span>
          ) : (
            <span className="inline-flex items-center">
              <SparklesIcon className="mr-2 h-4 w-4" />
              Generate SEO Copy
            </span>
          )}
        </button>
      </form>

      <div className="space-y-4 rounded-xl border border-neutral-200 bg-white p-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-neutral-900">Output</h3>
          <button
            type="button"
            onClick={copyResult}
            disabled={!result}
            className="inline-flex items-center rounded-lg border border-neutral-300 px-3 py-2 text-sm font-medium text-neutral-600 transition hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <ClipboardIcon className="mr-2 h-4 w-4" />
            Copy
          </button>
        </div>
        <textarea
          value={result}
          readOnly
          rows={20}
          className="w-full rounded-lg border border-neutral-300 px-3 py-2 font-mono text-sm text-neutral-800 focus:outline-none"
          placeholder="AI generated content will appear here."
        />
      </div>
    </div>
  )
}
