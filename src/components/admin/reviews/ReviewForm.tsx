'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeftIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline'
import { RichTextEditor } from '@/components/admin/RichTextEditor'
import { SchemaEditor } from '@/components/admin/SchemaEditor'
import { MediaUpload } from '@/components/admin/MediaUpload'

type ReviewStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'

type Option = {
  id: string
  name: string
  slug?: string
}

type ReviewerOption = Option & {
  title?: string | null
  credentials?: string | null
}

type ProCon = { id: string; text: string }
type AffiliateLink = { id: string; title: string; url: string; price: string }
type FAQItem = { id: string; question: string; answer: string }

type ReviewFormState = {
  title: string
  slug: string
  content: string
  excerpt: string
  featuredImage: string
  rating: number
  seoTitle: string
  seoDescription: string
  categoryId: string
  status: ReviewStatus
  isNoIndex: boolean
  isNoFollow: boolean
  schema: string
  publishedAt: string
  authorId: string
}

const defaultFormState: ReviewFormState = {
  title: '',
  slug: '',
  content: '',
  excerpt: '',
  featuredImage: '',
  rating: 4.5,
  seoTitle: '',
  seoDescription: '',
  categoryId: '',
  status: 'DRAFT',
  isNoIndex: false,
  isNoFollow: false,
  schema: '',
  publishedAt: '',
  authorId: ''
}

const createId = () =>
typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2)

const toLocalDateInput = (iso?: string | null) => {
  if (!iso) return ''
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ''
  const offset = date.getTimezoneOffset() * 60000
  return new Date(date.getTime() - offset).toISOString().slice(0, 16)
}

const parseProCon = (raw: unknown): ProCon[] => {
  if (typeof raw !== 'string' || !raw.trim()) return []
  try {
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed
      .map((entry) => {
        if (typeof entry === 'string') {
          return { id: createId(), text: entry }
        }
        if (entry && typeof entry === 'object') {
          const maybe = entry as { text?: unknown }
          if (typeof maybe.text === 'string') {
            return { id: createId(), text: maybe.text }
          }
        }
        return null
      })
      .filter((item): item is ProCon => item !== null)
  } catch (error) {
    console.warn('Failed to parse pros/cons', error)
    return []
  }
}

const parseAffiliateLinks = (raw: unknown): AffiliateLink[] => {
  if (typeof raw !== 'string' || !raw.trim()) return []
  try {
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed
      .map((entry) => {
        if (entry && typeof entry === 'object') {
          const { title, url, price } = entry as Record<string, unknown>
          return {
            id: createId(),
            title: typeof title === 'string' ? title : '',
            url: typeof url === 'string' ? url : '',
            price: typeof price === 'string' ? price : ''
          }
        }
        return null
      })
      .filter((item): item is AffiliateLink => item !== null)
  } catch (error) {
    console.warn('Failed to parse affiliate links', error)
    return []
  }
}

const parseFaqItems = (raw: unknown): FAQItem[] => {
  if (typeof raw !== 'string' || !raw.trim()) return []
  try {
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed
      .map((entry) => {
        if (entry && typeof entry === 'object') {
          const { question, answer } = entry as Record<string, unknown>
          if (typeof question === 'string' && typeof answer === 'string') {
            return {
              id: createId(),
              question,
              answer
            }
          }
        }
        return null
      })
      .filter((item): item is FAQItem => item !== null)
  } catch (error) {
    console.warn('Failed to parse review FAQs', error)
    return []
  }
}

interface ReviewFormProps {
  mode: 'create' | 'edit'
  reviewId?: string
}

export function ReviewForm({ mode, reviewId }: ReviewFormProps) {
  const router = useRouter()

  const [formData, setFormData] = useState<ReviewFormState>(defaultFormState)
  const [pros, setPros] = useState<ProCon[]>([{ id: createId(), text: '' }])
  const [cons, setCons] = useState<ProCon[]>([{ id: createId(), text: '' }])
  const [affiliateLinks, setAffiliateLinks] = useState<AffiliateLink[]>([
    { id: createId(), title: '', url: '', price: '' }
  ])
  const [faqs, setFaqs] = useState<FAQItem[]>([
    { id: createId(), question: '', answer: '' }
  ])
  const [categories, setCategories] = useState<Option[]>([])
  const [reviewers, setReviewers] = useState<ReviewerOption[]>([])
  const [selectedReviewerIds, setSelectedReviewerIds] = useState<string[]>([])
  const [primaryReviewerId, setPrimaryReviewerId] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    const loadOptions = async () => {
      try {
        const [catRes, reviewerRes] = await Promise.all([
          fetch('/api/admin/categories?limit=100', { credentials: 'include' }),
          fetch('/api/admin/reviewers?limit=100', { credentials: 'include' })
        ])

        if (catRes.ok) {
          const data = await catRes.json()
          const mappedCategories =
            Array.isArray(data.categories)
              ? data.categories
                  .map((item: unknown) => {
                    if (item && typeof item === 'object') {
                      const candidate = item as { id?: unknown; name?: unknown; slug?: unknown }
                      if (typeof candidate.id === 'string' && typeof candidate.name === 'string') {
                        return {
                          id: candidate.id,
                          name: candidate.name,
                          slug: typeof candidate.slug === 'string' ? candidate.slug : undefined
                        }
                      }
                    }
                    return null
                  })
                  .filter((item): item is Option => item !== null)
              : []
          setCategories(mappedCategories)
        }

        if (reviewerRes.ok) {
          const data = await reviewerRes.json()
          const mappedReviewers =
            Array.isArray(data.reviewers)
              ? data.reviewers
                  .map((item: unknown) => {
                    if (item && typeof item === 'object') {
                      const candidate = item as {
                        id?: unknown
                        name?: unknown
                        slug?: unknown
                        title?: unknown
                        credentials?: unknown
                      }
                      if (typeof candidate.id === 'string' && typeof candidate.name === 'string') {
                        return {
                          id: candidate.id,
                          name: candidate.name,
                          slug: typeof candidate.slug === 'string' ? candidate.slug : undefined,
                          title: typeof candidate.title === 'string' ? candidate.title : null,
                          credentials:
                            typeof candidate.credentials === 'string' ? candidate.credentials : null
                        }
                      }
                    }
                    return null
                  })
                  .filter((item): item is ReviewerOption => item !== null)
              : []
          setReviewers(mappedReviewers)
        }
      } catch (error) {
        console.error('Error loading review form options', error)
      }
    }

    loadOptions()
  }, [])

  useEffect(() => {
    const loadReview = async () => {
      if (mode !== 'edit' || !reviewId) {
        setIsLoading(false)
        return
      }

      try {
        const normalizedId = reviewId.trim()
        const basePath = `/api/admin/reviews/${encodeURIComponent(normalizedId)}`
        let response = await fetch(basePath, {
          cache: 'no-store'
        })
        if (!response.ok && response.status === 404) {
          response = await fetch(`${basePath}?lookup=slug`, {
            cache: 'no-store'
          })
        }
        if (!response.ok) {
          let message = 'Failed to fetch review'
          try {
            const payload = await response.json()
            if (payload?.error) {
              message = payload.error
            }
          } catch {
            message = `Failed to fetch review (${response.status})`
          }
          throw new Error(message)
        }
        const review = await response.json()

        setFormData({
          title: review.title ?? '',
          slug: review.slug ?? '',
          content: review.content ?? '',
          excerpt: review.excerpt ?? '',
          featuredImage: review.featuredImage ?? '',
          rating: review.rating ?? 4.5,
          seoTitle: review.seoTitle ?? '',
          seoDescription: review.seoDescription ?? '',
          categoryId: review.categoryId ?? '',
          status: review.status ?? 'DRAFT',
          isNoIndex: review.isNoIndex ?? false,
          isNoFollow: review.isNoFollow ?? false,
          schema: review.schema ?? '',
          publishedAt: toLocalDateInput(review.publishedAt),
          authorId: review.authorId ?? ''
        })

        const parsedPros = parseProCon(review.pros)
        setPros(parsedPros.length ? parsedPros : [{ id: createId(), text: '' }])
        const parsedCons = parseProCon(review.cons)
        setCons(parsedCons.length ? parsedCons : [{ id: createId(), text: '' }])
        const parsedLinks = parseAffiliateLinks(review.affiliateLinks)
        setAffiliateLinks(parsedLinks.length ? parsedLinks : [{ id: createId(), title: '', url: '', price: '' }])
        const parsedFaqs = parseFaqItems(review.faqs)
        setFaqs(parsedFaqs.length ? parsedFaqs : [{ id: createId(), question: '', answer: '' }])

        const reviewerIds = Array.isArray(review.reviewers)
          ? review.reviewers
              .map((entry: unknown) => {
                if (entry && typeof entry === 'object') {
                  const candidate = entry as { id?: unknown }
                  if (typeof candidate.id === 'string') {
                    return candidate.id
                  }
                }
                return null
              })
              .filter((id): id is string => id !== null)
          : []
        const primary = review.primaryReviewer?.id ?? reviewerIds[0] ?? ''
        setSelectedReviewerIds(primary ? Array.from(new Set([primary, ...reviewerIds])) : reviewerIds)
        setPrimaryReviewerId(primary)
      } catch (error) {
        console.error('Error loading review', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadReview()
  }, [mode, reviewId])

  const categoryOptions = useMemo(() => categories, [categories])
  const reviewerOptions = useMemo(() => reviewers, [reviewers])

  const updatePro = (id: string, text: string) => {
    setPros((prev) => prev.map((item) => (item.id === id ? { ...item, text } : item)))
  }

  const updateCon = (id: string, text: string) => {
    setCons((prev) => prev.map((item) => (item.id === id ? { ...item, text } : item)))
  }

  const updateAffiliate = (id: string, field: keyof AffiliateLink, value: string) => {
    setAffiliateLinks((prev) => prev.map((item) => (item.id === id ? { ...item, [field]: value } : item)))
  }

  const updateFaq = (id: string, field: keyof Omit<FAQItem, 'id'>, value: string) => {
    setFaqs((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    )
  }

  const addFaq = () => {
    setFaqs((prev) => [...prev, { id: createId(), question: '', answer: '' }])
  }

  const removeFaq = (id: string) => {
    setFaqs((prev) => prev.filter((item) => item.id !== id))
  }

  const toggleReviewer = (id: string) => {
    setSelectedReviewerIds((prev) => {
      if (prev.includes(id)) {
        const remaining = prev.filter((item) => item !== id)
        if (primaryReviewerId === id) {
          const nextPrimary = remaining[0] ?? ''
          setPrimaryReviewerId(nextPrimary)
          setFormData((prevData) => ({ ...prevData, authorId: nextPrimary || '' }))
        }
        return remaining
      }
      return [...prev, id]
    })
  }

  const removeReviewer = (id: string) => {
    setSelectedReviewerIds((prev) => {
      if (!prev.includes(id)) return prev
      const remaining = prev.filter((item) => item !== id)
      const nextPrimary =
        primaryReviewerId === id ? remaining[0] ?? '' : primaryReviewerId
      setPrimaryReviewerId(nextPrimary)
      setFormData((prevData) => ({
        ...prevData,
        authorId: nextPrimary || ''
      }))
      return remaining
    })
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    const reviewersToSend = Array.from(
      new Set(primaryReviewerId ? [primaryReviewerId, ...selectedReviewerIds] : selectedReviewerIds)
    )

    if (reviewersToSend.length === 0) {
      alert('Select at least one reviewer.')
      return
    }

    const derivedAuthorId = primaryReviewerId || reviewersToSend[0] || formData.authorId

    if (!derivedAuthorId) {
      alert('Primary reviewer is required.')
      return
    }

    const payload = {
      ...formData,
      rating: Number(formData.rating) || 0,
      publishedAt: formData.publishedAt ? new Date(formData.publishedAt).toISOString() : null,
      pros: JSON.stringify(pros.filter((item) => item.text.trim().length > 0)),
      cons: JSON.stringify(cons.filter((item) => item.text.trim().length > 0)),
      affiliateLinks: JSON.stringify(
        affiliateLinks.filter((item) => item.title || item.url || item.price)
      ),
      faqs: JSON.stringify(
        faqs
          .map((item) => ({
            question: item.question.trim(),
            answer: item.answer.trim()
          }))
          .filter((item) => item.question.length > 0 && item.answer.length > 0)
      ),
      reviewerIds: reviewersToSend,
      primaryReviewerId: primaryReviewerId || reviewersToSend[0],
      authorId: derivedAuthorId
    }

    try {
      setIsSaving(true)
      const url = mode === 'edit' && reviewId ? `/api/admin/reviews/${reviewId}` : '/api/admin/reviews'
      const response = await fetch(url, {
        method: mode === 'edit' ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        const error = await response.json()
        alert(error.error || 'Failed to save review')
        return
      }

      router.push('/admin/reviews')
    } catch (error) {
      console.error('Error saving review', error)
      alert('Failed to save review')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="rounded-lg border border-neutral-200 bg-white p-10 text-center text-neutral-500">
        Loading review...
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/reviews"
            className="inline-flex items-center rounded-md border border-neutral-300 px-3 py-2 text-sm text-neutral-600 hover:bg-neutral-100"
          >
            <ArrowLeftIcon className="mr-1 h-4 w-4" />
            Back
          </Link>
          <h1 className="text-xl font-semibold text-neutral-900">
            {mode === 'edit' ? 'Edit Review' : 'Create Review'}
          </h1>
        </div>
        <button
type="submit"
          disabled={isSaving}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSaving ? 'Saving...' : 'Save Review'}
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <div className="space-y-6">
          <section className="space-y-4 rounded-lg border border-neutral-200 bg-white p-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="md:col-span-2">
                <label className="text-sm font-medium text-neutral-700">Title *</label>
                <input
                  value={formData.title}
                  onChange={(event) => setFormData({ ...formData, title: event.target.value })}
                  required
                  className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-neutral-700">Slug *</label>
                <div className="mt-1 flex gap-2">
                  <input
                    value={formData.slug}
                    onChange={(event) => setFormData({ ...formData, slug: event.target.value })}
                    required
                    className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  />
                  <button
type="button"
                    onClick={() =>
                      setFormData((prev) => ({
                        ...prev,
                        slug: prev.title
                          .toLowerCase()
                          .replace(/[^a-z0-9]+/g, '-')
                          .replace(/(^-|-$)/g, '')
                      }))
                    }
                    className="rounded-md border border-neutral-300 px-3 text-xs font-medium text-neutral-600 hover:bg-neutral-100"
                  >
                    Auto
                  </button>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-neutral-700">Category *</label>
                <select
                  value={formData.categoryId}
                  onChange={(event) => setFormData({ ...formData, categoryId: event.target.value })}
                  required
                  className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                >
                  <option value="">Select category</option>
                  {categoryOptions.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-neutral-700">Status *</label>
                <select
                  value={formData.status}
                  onChange={(event) =>
                    setFormData({ ...formData, status: event.target.value as ReviewStatus })
                  }
                  className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                >
                  <option value="DRAFT">Draft</option>
                  <option value="PUBLISHED">Published</option>
                  <option value="ARCHIVED">Archived</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-neutral-700">Publish date</label>
                <input
type="datetime-local"
                  value={formData.publishedAt}
                  onChange={(event) => setFormData({ ...formData, publishedAt: event.target.value })}
                  className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-neutral-700">Rating (0-5)</label>
                <input
type="number"
                  min={0}
                  max={5}
                  step={0.1}
                  value={formData.rating}
                  onChange={(event) => setFormData({ ...formData, rating: parseFloat(event.target.value) })}
                  className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                />
              </div>
            </div>
          </section>

          <section className="space-y-3 rounded-lg border border-neutral-200 bg-white p-6">
            <label className="text-sm font-medium text-neutral-700">Excerpt</label>
            <textarea
              rows={3}
              value={formData.excerpt}
              onChange={(event) => setFormData({ ...formData, excerpt: event.target.value })}
              className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              placeholder="Short summary for listings"
            />
          </section>

          <section className="space-y-3 rounded-lg border border-neutral-200 bg-white p-6">
            <h2 className="text-sm font-semibold text-neutral-900">Content</h2>
            <RichTextEditor
              content={formData.content}
              onChange={(value) => setFormData({ ...formData, content: value })}
              placeholder="Write the full review..."
            />
          </section>

          <section className="rounded-lg border border-neutral-200 bg-white p-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-neutral-900">Pros</h3>
                  <button
                    type="button"
                    onClick={() => setPros([...pros, { id: createId(), text: '' }])}
                    className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700"
                  >
                    <PlusIcon className="h-4 w-4" /> Add
                  </button>
                </div>
                <div className="mt-3 space-y-2">
                  {pros.map((item, index) => (
                    <div key={item.id} className="flex gap-2">
                      <textarea
                        rows={2}
                        value={item.text}
                        onChange={(event) => updatePro(item.id, event.target.value)}
                        className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                        placeholder={`Pro ${index + 1}`}
                      />
                      {pros.length > 1 && (
                        <button
                          type="button"
                          onClick={() => setPros(pros.filter((entry) => entry.id !== item.id))}
                          className="rounded-md border border-neutral-200 p-2 text-neutral-400 hover:text-red-600"
                          title="Remove"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-neutral-900">Cons</h3>
                  <button
                    type="button"
                    onClick={() => setCons([...cons, { id: createId(), text: '' }])}
                    className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700"
                  >
                    <PlusIcon className="h-4 w-4" /> Add
                  </button>
                </div>
                <div className="mt-3 space-y-2">
                  {cons.map((item, index) => (
                    <div key={item.id} className="flex gap-2">
                      <textarea
                        rows={2}
                        value={item.text}
                        onChange={(event) => updateCon(item.id, event.target.value)}
                        className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                        placeholder={`Con ${index + 1}`}
                      />
                      {cons.length > 1 && (
                        <button
                          type="button"
                          onClick={() => setCons(cons.filter((entry) => entry.id !== item.id))}
                          className="rounded-md border border-neutral-200 p-2 text-neutral-400 hover:text-red-600"
                          title="Remove"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section className="space-y-4 rounded-lg border border-neutral-200 bg-white p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-neutral-900">Frequently asked questions</h3>
                <p className="text-xs text-neutral-500">
                  These questions render in an accordion on the public review page.
                </p>
              </div>
              <button
                type="button"
                onClick={addFaq}
                className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700"
              >
                <PlusIcon className="h-4 w-4" /> Add FAQ
              </button>
            </div>
            <div className="space-y-3">
              {faqs.map((faq, index) => (
                <div key={faq.id} className="space-y-3 rounded-lg border border-neutral-200 p-4">
                  <div className="flex items-start gap-3">
                    <span className="mt-1 inline-flex h-7 w-7 flex-none items-center justify-center rounded-full bg-blue-50 text-xs font-semibold text-blue-600">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <div className="flex-1 space-y-3">
                      <div>
                        <label className="text-xs font-medium text-neutral-600">Question</label>
                        <input
                          value={faq.question}
                          onChange={(event) => updateFaq(faq.id, 'question', event.target.value)}
                          className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                          placeholder="e.g. Is the Nicwell Water Flosser travel friendly?"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-neutral-600">Answer</label>
                        <textarea
                          rows={4}
                          value={faq.answer}
                          onChange={(event) => updateFaq(faq.id, 'answer', event.target.value)}
                          className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                          placeholder="Provide a concise, helpful answer."
                        />
                      </div>
                      {faqs.length > 1 && (
                        <div className="flex justify-end">
                          <button
                            type="button"
                            onClick={() => removeFaq(faq.id)}
                            className="inline-flex items-center gap-1 rounded-md border border-neutral-200 px-3 py-1.5 text-xs text-neutral-500 hover:border-red-200 hover:text-red-600"
                          >
                            <TrashIcon className="h-3.5 w-3.5" />
                            Remove
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {faqs.length === 0 && (
                <div className="rounded-md border border-dashed border-neutral-300 p-4 text-sm text-neutral-500">
                  No FAQs yet. Click “Add FAQ” to create one.
                </div>
              )}
            </div>
          </section>

          <section className="space-y-3 rounded-lg border border-neutral-200 bg-white p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-neutral-900">Affiliate links</h3>
              <button
type="button"
                onClick={() =>
                  setAffiliateLinks([
                    ...affiliateLinks,
                    { id: createId(), title: '', url: '', price: '' }
                  ])
                }
                className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700"
              >
                <PlusIcon className="h-4 w-4" /> Add
              </button>
            </div>
            <div className="space-y-3">
              {affiliateLinks.map((link) => (
                <div key={link.id} className="grid gap-3 rounded-md border border-neutral-200 p-4 md:grid-cols-3">
                  <input
                    value={link.title}
                    onChange={(event) => updateAffiliate(link.id, 'title', event.target.value)}
                    className="rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                    placeholder="Title"
                  />
                  <input
                    value={link.url}
                    onChange={(event) => updateAffiliate(link.id, 'url', event.target.value)}
                    className="rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                    placeholder="https://"
                  />
                  <div className="flex gap-2">
                    <input
                      value={link.price}
                      onChange={(event) => updateAffiliate(link.id, 'price', event.target.value)}
                      className="flex-1 rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                      placeholder="$39.99"
                    />
                    {affiliateLinks.length > 1 && (
                      <button
type="button"
                        onClick={() =>
                          setAffiliateLinks(affiliateLinks.filter((item) => item.id !== link.id))
                        }
                        className="rounded-md border border-neutral-200 p-2 text-neutral-400 hover:text-red-600"
                        title="Remove"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="space-y-3 rounded-lg border border-neutral-200 bg-white p-6">
            <h3 className="text-sm font-semibold text-neutral-900">Structured data</h3>
            <p className="text-xs text-neutral-500">
              Optional JSON-LD that will be embedded on this review page.
            </p>
            <SchemaEditor
              contentType="review"
              initialSchema={formData.schema}
              onChange={(schema) => setFormData({ ...formData, schema })}
            />
          </section>
        </div>

        <div className="space-y-6">
          <section className="space-y-3 rounded-lg border border-neutral-200 bg-white p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-neutral-900">Reviewers</h3>
                <p className="text-xs text-neutral-500">Primary reviewer appears publicly first.</p>
              </div>
              <Link href="/admin/reviewers" className="text-xs font-medium text-blue-600 hover:text-blue-700">
                Manage reviewers
              </Link>
            </div>
            <div>
              <label className="text-xs font-medium text-neutral-600">Primary reviewer *</label>
              <select
                value={primaryReviewerId}
                onChange={(event) => {
                  const value = event.target.value
                  setPrimaryReviewerId(value)
                  if (value) {
                    setSelectedReviewerIds((prev) => (prev.includes(value) ? prev : [...prev, value]))
                    setFormData((prevData) => ({ ...prevData, authorId: value }))
                  } else {
                    setFormData((prevData) => ({ ...prevData, authorId: prevData.authorId }))
                  }
                }}
                className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              >
                <option value="">Select reviewer</option>
                {reviewerOptions.map((reviewer) => (
                  <option key={reviewer.id} value={reviewer.id}>
                    {reviewer.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              {reviewerOptions.length === 0 && (
                <p className="rounded-md border border-dashed border-neutral-300 p-3 text-sm text-neutral-500">
                  No reviewers available yet.
                </p>
              )}
              {reviewerOptions.map((reviewer) => (
                <label
                  key={reviewer.id}
                  className="flex items-start gap-2 rounded-md px-2 py-1 text-sm hover:bg-neutral-50"
                >
                  <input
                    type="checkbox"
                    checked={selectedReviewerIds.includes(reviewer.id)}
                    onChange={() => toggleReviewer(reviewer.id)}
                    className="mt-1 h-4 w-4 rounded border-neutral-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span>
                    <span className="font-medium text-neutral-900">{reviewer.name}</span>
                    {primaryReviewerId === reviewer.id && (
                      <span className="ml-2 rounded bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-600">
                        Primary
                      </span>
                    )}
                    {reviewer.credentials && (
                      <span className="ml-2 text-xs text-neutral-500">{reviewer.credentials}</span>
                    )}
                  </span>
                </label>
              ))}
              {selectedReviewerIds.length > 0 && (
                <div className="pt-2">
                  <p className="text-xs font-medium text-neutral-600 mb-2">Selected reviewers</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedReviewerIds.map((id) => {
                      const reviewer = reviewerOptions.find((option) => option.id === id)
                      if (!reviewer) return null
                      return (
                        <span
                          key={id}
                          className="inline-flex items-center gap-2 rounded-full bg-neutral-100 px-3 py-1 text-xs text-neutral-700"
                        >
                          {reviewer.name}
                          <button
                            type="button"
                            onClick={() => removeReviewer(id)}
                            className="ml-1 text-neutral-500 hover:text-red-600"
                            aria-label={`Remove ${reviewer.name}`}
                          >
                            ×
                          </button>
                        </span>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          </section>

          <section className="space-y-3 rounded-lg border border-neutral-200 bg-white p-6">
            <h3 className="text-sm font-semibold text-neutral-900">Featured image</h3>
            <MediaUpload
              currentImage={formData.featuredImage}
              onUpload={(url) => setFormData({ ...formData, featuredImage: url })}
            />
          </section>

          <section className="space-y-3 rounded-lg border border-neutral-200 bg-white p-6">
            <h3 className="text-sm font-semibold text-neutral-900">SEO</h3>
            <input
              value={formData.seoTitle}
              onChange={(event) => setFormData({ ...formData, seoTitle: event.target.value })}
              className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              placeholder="SEO title"
            />
            <textarea
              rows={3}
              value={formData.seoDescription}
              onChange={(event) => setFormData({ ...formData, seoDescription: event.target.value })}
              className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              placeholder="Meta description"
            />
            <div className="flex items-center gap-4 text-sm text-neutral-700">
              <label className="flex items-center gap-2">
                <input
type="checkbox"
                  checked={formData.isNoIndex}
                  onChange={(event) => setFormData({ ...formData, isNoIndex: event.target.checked })}
                />
                No index
              </label>
              <label className="flex items-center gap-2">
                <input
type="checkbox"
                  checked={formData.isNoFollow}
                  onChange={(event) => setFormData({ ...formData, isNoFollow: event.target.checked })}
                />
                No follow
              </label>
            </div>
          </section>

        </div>
      </div>
    </form>
  )
}



