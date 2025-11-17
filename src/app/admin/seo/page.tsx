'use client'

import { useMemo, useState } from 'react'
import { AdminWrapper } from '@/components/admin/AdminWrapper'
import { SeoSettingsManager } from '@/components/admin/seo/SeoSettingsManager'
import { SeoContentManager } from '@/components/admin/seo/SeoContentManager'
import { SeoImageLibrary } from '@/components/admin/seo/SeoImageLibrary'
import { SeoAiAssistant } from '@/components/admin/seo/SeoAiAssistant'

type TabKey = 'settings' | 'articles' | 'reviews' | 'images' | 'ai'

const tabs: Array<{ key: TabKey; label: string; description: string }> = [
  {
    key: 'settings',
    label: 'Site SEO',
    description: 'Manage metadata for static pages, directories, and custom routes.'
  },
  {
    key: 'articles',
    label: 'Articles',
    description: 'Audit and update SEO metadata for published and draft blog content.'
  },
  {
    key: 'reviews',
    label: 'Reviews',
    description: 'Optimize review pages for syndication and search snippets.'
  },
  {
    key: 'images',
    label: 'Images',
    description: 'Improve accessibility with alt text and captions across your media library.'
  },
  {
    key: 'ai',
    label: 'AI Assistant',
    description: 'Generate metadata, schema snippets, and copy with your preferred provider.'
  }
]

export default function AdminSeoPage() {
  const [activeTab, setActiveTab] = useState<TabKey>('settings')

  const activeDescription = useMemo(() => {
    return tabs.find((tab) => tab.key === activeTab)?.description ?? ''
  }, [activeTab])

  return (
    <AdminWrapper>
      <div className="mx-auto max-w-[1400px] space-y-8">
        <header className="space-y-4">
          <div>
            <h1 className="text-3xl font-bold text-neutral-900">SEO Control Center</h1>
            <p className="mt-2 text-base text-neutral-600">
              Monitor and optimize search performance across site pages, articles, reviews, and media.
            </p>
          </div>

          <nav className="flex flex-wrap gap-2">
            {tabs.map((tab) => {
              const isActive = tab.key === activeTab
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                    isActive
                      ? 'border-blue-600 bg-blue-600 text-white shadow-sm'
                      : 'border-neutral-200 bg-white text-neutral-700 hover:border-neutral-300 hover:bg-neutral-100'
                  }`}
                >
                  {tab.label}
                </button>
              )
            })}
          </nav>

          <p className="text-sm text-neutral-500">{activeDescription}</p>
        </header>

        <section>
          {activeTab === 'settings' && <SeoSettingsManager />}
          {activeTab === 'articles' && (
            <SeoContentManager
              resource="articles"
              title="Article SEO"
              description="Search, audit, and update structured data for blog and evergreen articles."
              emptyStateMessage="No articles found with the current filters."
              schemaType="article"
            />
          )}
          {activeTab === 'reviews' && (
            <SeoContentManager
              resource="reviews"
              title="Review SEO"
              description="Tune review metadata, schema, and indexing rules for product and service coverage."
              emptyStateMessage="No reviews match your filters."
              schemaType="review"
            />
          )}
          {activeTab === 'images' && <SeoImageLibrary />}
          {activeTab === 'ai' && <SeoAiAssistant />}
        </section>
      </div>
    </AdminWrapper>
  )
}
