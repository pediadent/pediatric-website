'use client'

import { ChevronDownIcon } from '@heroicons/react/24/outline'

interface TOCItem {
  id: string
  label: string
  level?: number
  order?: number
}

interface StickyTOCProps {
  items: TOCItem[]
}

export function StickyTOC({ items }: StickyTOCProps) {
  if (items.length === 0) return null

  return (
    <div className="lg:sticky lg:top-32">
      <details
        className="group rounded-3xl border border-neutral-200 bg-white shadow-sm [&_summary::-webkit-details-marker]:hidden"
        open={true}
      >
        <summary className="flex cursor-pointer items-center justify-between px-6 py-4 text-lg font-semibold text-neutral-900">
          Table of contents
          <span className="ml-4 inline-flex h-8 w-8 items-center justify-center rounded-full bg-sky-100 text-sky-600 transition-transform duration-200 group-open:rotate-180">
            <ChevronDownIcon className="h-4 w-4" />
          </span>
        </summary>
        <div className="px-6 pb-6">
          <nav className="space-y-1 text-sm text-neutral-600">
            {items.map((item, index) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                className={`flex items-start gap-3 rounded-xl py-1.5 text-sm font-medium transition-colors hover:bg-sky-50 hover:text-sky-700 ${
                  item.level === 3 ? 'pl-8' : 'px-4'
                }`}
              >
                <span
                  className={`mt-0.5 inline-flex h-6 w-6 flex-none items-center justify-center rounded-full ${
                    item.level === 3
                      ? 'bg-transparent text-sky-500 text-base leading-none'
                      : 'bg-sky-100 text-xs font-semibold text-sky-600'
                  }`}
                >
                  {item.level === 3 ? '•' : (item.order || index + 1)}
                </span>
                <span>{item.label}</span>
              </a>
            ))}
          </nav>
        </div>
      </details>
    </div>
  )
}
