'use client'

import { useEffect, useMemo, useState } from 'react'

type ReviewShareBarProps = {
  title: string
  url?: string
}

const socialLinks = [
  {
    id: 'twitter',
    label: 'Share on X (Twitter)',
    buildUrl: (url: string, title: string) =>
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`,
    Icon: () => (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5">
        <path
          d="M20.227 3.75h2.426l-5.305 6.063 6.246 8.437h-4.888L14.66 13.12l-5.03 5.13h3.615l-1.11 1.25h-8.36l5.57-6.056-5.98-8.695h5.02l3.42 4.86 4.91-5.44Zm-1.57 14.058h1.344L7.88 5.255H6.44l12.217 12.553Z"
          fill="currentColor"
        />
      </svg>
    )
  },
  {
    id: 'facebook',
    label: 'Share on Facebook',
    buildUrl: (url: string) =>
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
    Icon: () => (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5">
        <path
          d="M22 12.073C22 6.504 17.523 2 12 2S2 6.504 2 12.073c0 5 3.657 9.152 8.438 9.878v-6.988H7.898v-2.89h2.54V9.845c0-2.506 1.492-3.89 3.77-3.89 1.094 0 2.238.196 2.238.196v2.46h-1.26c-1.243 0-1.63.776-1.63 1.572v1.888h2.773l-.443 2.89h-2.33V21.95C18.343 21.225 22 17.073 22 12.073Z"
          fill="currentColor"
        />
      </svg>
    )
  },
  {
    id: 'linkedin',
    label: 'Share on LinkedIn',
    buildUrl: (url: string, title: string) =>
      `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}`,
    Icon: () => (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5">
        <path
          d="M20.451 20.452h-3.555v-5.568c0-1.328-.027-3.036-1.85-3.036-1.85 0-2.134 1.445-2.134 2.938v5.666H9.356V9h3.414v1.561h.048c.476-.9 1.637-1.85 3.37-1.85 3.604 0 4.27 2.37 4.27 5.455v6.286ZM5.337 7.433a2.062 2.062 0 1 1 0-4.124 2.062 2.062 0 0 1 0 4.124Zm1.777 13.019H3.56V9h3.554v11.452Z"
          fill="currentColor"
        />
      </svg>
    )
  }
] as const

export function ReviewShareBar({ title, url }: ReviewShareBarProps) {
  const [resolvedUrl, setResolvedUrl] = useState(url ?? '')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!url && typeof window !== 'undefined') {
      setResolvedUrl(window.location.href)
    }
  }, [url])

  const shareTargets = useMemo(() => {
    if (!resolvedUrl) {
      return []
    }

    return socialLinks.map((item) => ({
      ...item,
      href: item.buildUrl(resolvedUrl, title)
    }))
  }, [resolvedUrl, title])

  const handleCopy = async () => {
    if (!resolvedUrl) return
    try {
      await navigator.clipboard.writeText(resolvedUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Unable to copy review URL', error)
    }
  }

  return (
    <div className="pointer-events-none fixed left-3 top-1/3 z-30 hidden lg:block">
      <div className="flex flex-col items-center gap-3 rounded-full bg-white/90 p-3 shadow-xl ring-1 ring-black/5 backdrop-blur pointer-events-auto">
        {shareTargets.map((item) => (
          <a
            key={item.id}
            href={item.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={item.label}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-100 text-neutral-600 transition-colors hover:bg-primary-600 hover:text-white"
          >
            <item.Icon />
          </a>
        ))}
        <button
          type="button"
          onClick={handleCopy}
          aria-label="Copy review link"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-100 text-neutral-600 transition-colors hover:bg-primary-600 hover:text-white"
        >
          {copied ? (
            <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5">
              <path
                d="M20.285 6.709a1 1 0 0 0-1.414-1.418l-8.243 8.25-3.5-3.498a1 1 0 1 0-1.414 1.414l4.207 4.205a1 1 0 0 0 1.414 0l8.95-8.953Z"
                fill="currentColor"
              />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5">
              <path
                d="M15.5 2A2.5 2.5 0 0 1 18 4.5v11A2.5 2.5 0 0 1 15.5 18h-7A2.5 2.5 0 0 1 6 15.5v-11A2.5 2.5 0 0 1 8.5 2h7Zm0 1.5h-7a1 1 0 0 0-1 1V8h9V4.5a1 1 0 0 0-1-1ZM16.5 9.5h-9V15.5a1 1 0 0 0 1 1h7a1 1 0 0 0 1-1V9.5Z"
                fill="currentColor"
              />
            </svg>
          )}
        </button>
      </div>
    </div>
  )
}
