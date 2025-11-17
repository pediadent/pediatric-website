'use client'

import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import {
  MagnifyingGlassIcon,
  BellIcon,
  ArrowRightOnRectangleIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline'

export function Header() {
  const router = useRouter()
  const [user, setUser] = useState<{ name: string; email: string } | null>(null)
  const [query, setQuery] = useState('')

  useEffect(() => {
    void fetchSession()
  }, [])

  const fetchSession = async () => {
    try {
      const response = await fetch('/api/auth/session', { cache: 'no-store' })
      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
      }
    } catch (error) {
      console.error('Failed to fetch session:', error)
    }
  }

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      router.push('/admin/login')
      router.refresh()
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  const handleSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!query.trim()) return
    router.push(`/admin/search?term=${encodeURIComponent(query.trim())}`)
  }

  return (
    <header className="relative z-20 bg-gradient-to-r from-[rgba(17,113,239,0.88)] via-[rgba(94,114,228,0.95)] to-[rgba(45,206,255,0.9)] text-white shadow-[0_18px_45px_-25px_rgba(17,113,239,0.8)]">
      <div className="flex items-center justify-between px-8 py-7">
        <div className="space-y-1">
          <p className="argon-heading text-xs font-semibold uppercase tracking-[0.28em] text-white/70">
            Pages / Dashboard
          </p>
          <h1 className="argon-heading text-3xl font-semibold tracking-tight">
            Dashboard
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <form
            onSubmit={handleSearch}
            className="flex items-center rounded-2xl bg-white/20 px-4 py-2 text-sm shadow-inner shadow-white/10 backdrop-blur transition"
          >
            <MagnifyingGlassIcon className="mr-2 h-[18px] w-[18px] text-white/70" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Type here..."
              className="w-52 border-0 bg-transparent text-white placeholder:text-white/70 focus:outline-none"
            />
          </form>
          <button
            className="rounded-2xl border border-white/30 bg-white/15 p-3 text-white transition duration-200 hover:bg-white/25"
            title="Notifications"
            type="button"
          >
            <BellIcon className="h-5 w-5" />
          </button>
          <button
            className="rounded-2xl border border-white/30 bg-white/15 p-3 text-white transition duration-200 hover:bg-white/25"
            title="Settings"
            type="button"
          >
            <Cog6ToothIcon className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-3 rounded-2xl border border-white/25 bg-white/20 px-4 py-2 shadow-inner shadow-white/10">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#11cdef] to-[#1171ef] font-semibold">
              {user?.name?.charAt(0) ?? 'A'}
            </div>
            <div className="text-left text-xs">
              <p className="argon-heading text-sm font-semibold text-white">
                {user?.name || 'Admin User'}
              </p>
              <p className="text-white/80">{user?.email || 'Loading...'}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-2 rounded-2xl border border-white/30 bg-white/10 px-4 py-2 text-sm font-semibold tracking-wide text-white transition duration-200 hover:bg-white/20"
            type="button"
          >
            <ArrowRightOnRectangleIcon className="h-[18px] w-[18px]" />
            Logout
          </button>
        </div>
      </div>
    </header>
  )
}
