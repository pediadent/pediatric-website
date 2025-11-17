'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'

import { AdminWrapper } from '@/components/admin/AdminWrapper'
import { RichTextEditor } from '@/components/admin/RichTextEditor'
import { SchemaEditor } from '@/components/admin/SchemaEditor'
import { MediaUpload } from '@/components/admin/MediaUpload'

interface Option {
  id: string
  name: string
}

interface ArticleFormState {
  title: string
  slug: string
  content: string
  excerpt: string
  featuredImage: string
  seoTitle: string
  seoDescription: string
  categoryId: string
  authorId: string
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'
  isNoIndex: boolean
  isNoFollow: boolean
  schema: string
}

type FAQItem = {
  id: string
  question: string
  answer: string
}

const createId = () =>
  typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2)

const normalizeOptions = (items: unknown): Option[] =>
  Array.isArray(items)
    ? items
        .map((entry) => {
          if (entry && typeof entry === 'object') {
            const candidate = entry as { id?: unknown; name?: unknown }
            if (typeof candidate.id === 'string' && typeof candidate.name === 'string') {
              return { id: candidate.id, name: candidate.name }
            }
          }
          return null
        })
        .filter((item): item is Option => item !== null)
    : []

export default function NewArticlePage() {
  const router = useRouter()

  const [isLoading, setIsLoading] = useState(false)
  const [categories, setCategories] = useState<Option[]>([])
  const [authors, setAuthors] = useState<Option[]>([])
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false)
  const [formData, setFormData] = useState<ArticleFormState>({
    title: '',
    slug: '',
    content: '',
    excerpt: '',
    featuredImage: '',
    seoTitle: '',
    seoDescription: '',
    categoryId: '',
    authorId: '',
    status: 'DRAFT',
    isNoIndex: false,
    isNoFollow: false,
    schema: ''
  })
  const [faqs, setFaqs] = useState<FAQItem[]>([
    { id: createId(), question: '', answer: '' }
  ])

  useEffect(() => {
    const loadOptions = async () => {
      try {
        const [categoriesRes, authorsRes] = await Promise.all([
          fetch('/api/admin/categories?limit=100', { credentials: 'include' }),
          fetch('/api/admin/authors?limit=100', { credentials: 'include' })
        ])

        if (categoriesRes.ok) {
          const data = await categoriesRes.json()
          setCategories(normalizeOptions(data.categories))
        }

        if (authorsRes.ok) {
          const data = await authorsRes.json()
          setAuthors(normalizeOptions(data.authors))
        }
      } catch (error) {
        console.error('Error loading article options:', error)
      }
    }

    loadOptions()
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    if (name === 'slug') {
      setSlugManuallyEdited(true)
    }
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }))
  }

  const generateSlug = (title: string) =>
    title
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '-')
      .trim()

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value
    setFormData(prev => ({
      ...prev,
      title,
      slug: slugManuallyEdited ? prev.slug : generateSlug(title),
      seoTitle: prev.seoTitle || title
    }))
  }

  const handleRegenerateSlug = () => {
    setFormData(prev => ({
      ...prev,
      slug: generateSlug(prev.title)
    }))
    setSlugManuallyEdited(false)
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

  const handleSubmit = async (e: React.FormEvent, action: 'draft' | 'publish' = 'draft') => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const preparedFaqs = faqs
        .map((item) => ({
          question: item.question.trim(),
          answer: item.answer.trim()
        }))
        .filter((item) => item.question.length > 0 && item.answer.length > 0)

      const payload = {
        ...formData,
        title: formData.title.trim(),
        slug: formData.slug.trim(),
        featuredImage: formData.featuredImage || null,
        status: action === 'publish' ? 'PUBLISHED' : formData.status,
        publishedAt: action === 'publish' ? new Date().toISOString() : null,
        faqs: preparedFaqs.length > 0 ? JSON.stringify(preparedFaqs) : ''
      }

      const response = await fetch('/api/admin/articles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload)
      })

      if (response.ok) {
        router.push('/admin/articles')
      } else {
        alert('Error creating article')
      }
    } catch (error) {
      console.error('Error creating article:', error)
      alert('Error creating article')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AdminWrapper>
      <div className="min-h-screen bg-neutral-100">
        <div className="mx-auto max-w-[1200px] px-6 py-8">
          <div className="border-b border-neutral-200 pb-6">
            <Link
              href="/admin/articles"
              className="inline-flex items-center text-neutral-600 hover:text-neutral-900 transition-colors mb-3"
            >
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              Back to Articles
            </Link>
            <h1 className="text-3xl font-semibold text-neutral-900">Create New Article</h1>
          </div>

          <form className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px]" onSubmit={handleSubmit}>
            <div className="space-y-8">
              <section className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-neutral-900 mb-6">Article Content</h2>
                <div className="space-y-6">
                  <div>
                    <label htmlFor="title" className="block text-sm font-medium text-neutral-700 mb-2">
                      Title *
                    </label>
                    <input
                      type="text"
                      id="title"
                      name="title"
                      value={formData.title}
                      onChange={handleTitleChange}
                      className="w-full rounded-lg border border-neutral-300 px-4 py-3 text-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-200"
                      placeholder="Enter article title"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="slug" className="block text-sm font-medium text-neutral-700 mb-2">
                      URL Slug *
                    </label>
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                      <input
                        type="text"
                        id="slug"
                        name="slug"
                        value={formData.slug}
                        onChange={handleInputChange}
                        className="flex-1 rounded-lg border border-neutral-300 px-4 py-3 focus:border-primary-500 focus:ring-2 focus:ring-primary-200"
                        placeholder="article-url-slug"
                        required
                      />
                      <button
                        type="button"
                        onClick={handleRegenerateSlug}
                        className="inline-flex items-center justify-center rounded-lg border border-neutral-300 px-3 py-2 text-sm font-medium text-neutral-600 hover:bg-neutral-100 transition-colors"
                      >
                        Regenerate
                      </button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-neutral-700">
                      Content *
                    </label>
                    <RichTextEditor
                      content={formData.content}
                      onChange={(content) => setFormData(prev => ({ ...prev, content }))}
                      placeholder="Write your article content here..."
                    />
                  </div>

                  <div>
                    <label htmlFor="excerpt" className="block text-sm font-medium text-neutral-700 mb-2">
                      Excerpt
                    </label>
                    <textarea
                      id="excerpt"
                      name="excerpt"
                      value={formData.excerpt}
                      onChange={handleInputChange}
                      rows={4}
                      className="w-full rounded-lg border border-neutral-300 px-4 py-3 focus:border-primary-500 focus:ring-2 focus:ring-primary-200"
                      placeholder="Brief description of the article"
                    />
                  </div>
                </div>
              </section>

              <section className="space-y-6 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-semibold text-neutral-900">Frequently Asked Questions</h2>
                    <p className="text-sm text-neutral-500">Add optional FAQs that will appear below the article content.</p>
                  </div>
                  <button
                    type="button"
                    onClick={addFaq}
                    className="inline-flex items-center gap-2 rounded-full border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 transition-colors hover:border-primary-300 hover:text-primary-600"
                  >
                    + Add FAQ
                  </button>
                </div>
                <div className="space-y-4">
                  {faqs.map((faq, index) => (
                    <div
                      key={faq.id}
                      className="space-y-4 rounded-2xl border border-neutral-200 bg-neutral-50/70 p-5"
                    >
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold text-neutral-700">FAQ {index + 1}</p>
                        {faqs.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeFaq(faq.id)}
                            className="text-xs font-medium text-neutral-500 transition-colors hover:text-red-500"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-neutral-700">Question</label>
                        <input
                          type="text"
                          value={faq.question}
                          onChange={(event) => updateFaq(faq.id, 'question', event.target.value)}
                          className="w-full rounded-lg border border-neutral-300 px-4 py-3 focus:border-primary-500 focus:ring-2 focus:ring-primary-200"
                          placeholder="e.g. What age should my child first visit a dentist?"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-neutral-700">Answer</label>
                        <textarea
                          rows={4}
                          value={faq.answer}
                          onChange={(event) => updateFaq(faq.id, 'answer', event.target.value)}
                          className="w-full rounded-lg border border-neutral-300 px-4 py-3 focus:border-primary-500 focus:ring-2 focus:ring-primary-200"
                          placeholder="Provide a concise, helpful response."
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <section className="space-y-6 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
                <div>
                  <h2 className="text-lg font-semibold text-neutral-900 mb-4">SEO Settings</h2>
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="seoTitle" className="block text-sm font-medium text-neutral-700 mb-2">
                        SEO Title
                      </label>
                      <input
                        type="text"
                        id="seoTitle"
                        name="seoTitle"
                        value={formData.seoTitle}
                        onChange={handleInputChange}
                        className="w-full rounded-lg border border-neutral-300 px-4 py-3 focus:border-primary-500 focus:ring-2 focus:ring-primary-200"
                        placeholder="SEO optimized title"
                      />
                    </div>

                    <div>
                      <label htmlFor="seoDescription" className="block text-sm font-medium text-neutral-700 mb-2">
                        SEO Description
                      </label>
                      <textarea
                        id="seoDescription"
                        name="seoDescription"
                        value={formData.seoDescription}
                        onChange={handleInputChange}
                        rows={3}
                        className="w-full rounded-lg border border-neutral-300 px-4 py-3 focus:border-primary-500 focus:ring-2 focus:ring-primary-200"
                        placeholder="Meta description for search engines"
                      />
                    </div>

                    <div className="flex flex-wrap gap-4">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          name="isNoIndex"
                          checked={formData.isNoIndex}
                          onChange={handleInputChange}
                          className="rounded text-primary-600 focus:ring-primary-500"
                        />
                        <span className="ml-2 text-sm text-neutral-700">No Index</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          name="isNoFollow"
                          checked={formData.isNoFollow}
                          onChange={handleInputChange}
                          className="rounded text-primary-600 focus:ring-primary-500"
                        />
                        <span className="ml-2 text-sm text-neutral-700">No Follow</span>
                      </label>
                    </div>
                  </div>
                </div>

                <div className="border-t border-dashed border-neutral-200 pt-4">
                  <SchemaEditor
                    initialSchema={formData.schema}
                    onChange={(schema) => setFormData(prev => ({ ...prev, schema }))}
                    contentType="article"
                  />
                </div>
              </section>
            </div>

            <aside className="space-y-6 lg:sticky lg:top-24">
              <div className="rounded-2xl border border-neutral-200 bg-white shadow-sm">
                <div className="border-b border-neutral-200 px-6 py-4">
                  <h2 className="text-lg font-semibold text-neutral-900">Publish</h2>
                </div>
                <div className="space-y-5 px-6 py-5">
                  <div className="space-y-2">
                    <label htmlFor="status" className="block text-sm font-medium text-neutral-700">
                      Status
                    </label>
                    <select
                      id="status"
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      className="w-full rounded border border-neutral-300 bg-white px-3 py-2 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-200"
                    >
                      <option value="DRAFT">Draft</option>
                      <option value="PUBLISHED">Published</option>
                      <option value="ARCHIVED">Archived</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <button
                      type="button"
                      onClick={(e) => handleSubmit(e, 'draft')}
                      disabled={isLoading}
                      className="w-full rounded border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-100 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      Save Draft
                    </button>
                    <button
                      type="button"
                      onClick={(e) => handleSubmit(e, 'publish')}
                      disabled={isLoading}
                      className="w-full rounded bg-[#2563eb] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#1d4ed8] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      Publish
                    </button>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-neutral-900 mb-4">Organization</h2>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="categoryId" className="block text-sm font-medium text-neutral-700 mb-2">
                      Category
                    </label>
                    <select
                      id="categoryId"
                      name="categoryId"
                      value={formData.categoryId}
                      onChange={handleInputChange}
                      className="w-full rounded-lg border border-neutral-300 px-4 py-3 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 bg-white"
                      required
                    >
                      <option value="">Select Category</option>
                      {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="authorId" className="block text-sm font-medium text-neutral-700 mb-2">
                      Author
                    </label>
                    <select
                      id="authorId"
                      name="authorId"
                      value={formData.authorId}
                      onChange={handleInputChange}
                      className="w-full rounded-lg border border-neutral-300 px-4 py-3 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 bg-white"
                      required
                    >
                      <option value="">Select Author</option>
                      {authors.map((author) => (
                        <option key={author.id} value={author.id}>
                          {author.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-neutral-900 mb-4">Featured Image</h2>
                <MediaUpload
                  onUpload={(url) => setFormData(prev => ({ ...prev, featuredImage: url }))}
                  currentImage={formData.featuredImage}
                />
              </div>
            </aside>
          </form>
        </div>
      </div>
    </AdminWrapper>
  )
}
