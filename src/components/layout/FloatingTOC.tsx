'use client';

import { useState } from 'react';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';

interface TOCItem {
  id: string;
  label: string;
  level: number;
  order: number;
}

interface FloatingTOCProps {
  items: TOCItem[];
}

export default function FloatingTOC({ items }: FloatingTOCProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (items.length === 0) return null;

  return (
    <>
      {/* Desktop: Sidebar version */}
      <div className="hidden lg:block lg:sticky lg:top-32">
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
              {items.map((item) => (
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
                    {item.level === 3 ? '•' : item.order}
                  </span>
                  <span>{item.label}</span>
                </a>
              ))}
            </nav>
          </div>
        </details>
      </div>

      {/* Mobile: Floating bottom version */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50">
        {/* Backdrop overlay when open */}
        {isOpen && (
          <div
            className="fixed inset-0 bg-black/20 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />
        )}

        {/* Floating TOC container */}
        <div className="relative bg-white border-t border-neutral-200 shadow-2xl">
          {/* Toggle button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="w-full flex items-center justify-between px-4 py-3 text-sm font-semibold text-neutral-900 active:bg-neutral-50"
            aria-expanded={isOpen}
            aria-label="Toggle table of contents"
          >
            <span className="flex items-center gap-2">
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-sky-100 text-xs font-semibold text-sky-600">
                {items.length}
              </span>
              Table of contents
            </span>
            {isOpen ? (
              <ChevronDownIcon className="h-5 w-5 text-neutral-500" />
            ) : (
              <ChevronUpIcon className="h-5 w-5 text-neutral-500" />
            )}
          </button>

          {/* Expandable content */}
          <div
            className={`transition-all duration-300 ease-in-out overflow-hidden ${
              isOpen ? 'max-h-96' : 'max-h-0'
            }`}
          >
            <nav className="px-4 pb-4 pt-2 max-h-96 overflow-y-auto space-y-1">
              {items.map((item) => (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-start gap-3 rounded-xl py-2 text-sm font-medium transition-colors active:bg-sky-50 ${
                    item.level === 3 ? 'pl-8' : 'px-3'
                  }`}
                >
                  <span
                    className={`mt-0.5 inline-flex h-6 w-6 flex-none items-center justify-center rounded-full ${
                      item.level === 3
                        ? 'bg-transparent text-sky-500 text-base leading-none'
                        : 'bg-sky-100 text-xs font-semibold text-sky-600'
                    }`}
                  >
                    {item.level === 3 ? '•' : item.order}
                  </span>
                  <span className="text-neutral-700">{item.label}</span>
                </a>
              ))}
            </nav>
          </div>
        </div>
      </div>

      {/* Bottom padding spacer for mobile to prevent content from being hidden behind floating TOC */}
      <div className="lg:hidden h-14" />
    </>
  );
}
