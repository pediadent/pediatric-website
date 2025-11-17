'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Fragment } from 'react'
import { cn } from '@/lib/utils'
import {
  HomeIcon,
  DocumentTextIcon,
  StarIcon,
  UserGroupIcon,
  TagIcon,
  PhotoIcon,
  ArrowPathIcon,
  CogIcon,
  ChartBarIcon,
  UsersIcon,
  UserIcon,
  ArrowRightIcon,
  AcademicCapIcon
} from '@heroicons/react/24/outline'

const NAVIGATION: Array<{
  label: string
  href: string
  icon: (props: React.SVGProps<SVGSVGElement>) => JSX.Element
  section?: 'content' | 'team' | 'system'
}> = [
  { label: 'Dashboard', href: '/admin', icon: HomeIcon, section: 'content' },
  { label: 'Articles', href: '/admin/articles', icon: DocumentTextIcon, section: 'content' },
  { label: 'Reviews', href: '/admin/reviews', icon: StarIcon, section: 'content' },
  { label: 'Categories', href: '/admin/categories', icon: TagIcon, section: 'content' },
  { label: 'Media Library', href: '/admin/media', icon: PhotoIcon, section: 'content' },
  { label: 'Dentists', href: '/admin/dentists', icon: UserGroupIcon, section: 'team' },
  { label: 'Reviewers', href: '/admin/reviewers', icon: UserIcon, section: 'team' },
  { label: 'Authors', href: '/admin/authors', icon: AcademicCapIcon, section: 'team' },
  { label: 'Users', href: '/admin/users', icon: UsersIcon, section: 'system' },
  { label: 'SEO Control', href: '/admin/seo', icon: CogIcon, section: 'system' },
  { label: 'Redirects', href: '/admin/redirects', icon: ArrowPathIcon, section: 'system' },
  { label: 'Analytics', href: '/admin/analytics', icon: ChartBarIcon, section: 'system' }
]

const SECTION_TITLES: Record<'content' | 'team' | 'system', string> = {
  content: 'Content Suite',
  team: 'Team',
  system: 'System'
}

const SECTION_ORDER: Array<'content' | 'team' | 'system'> = [
  'content',
  'team',
  'system'
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="relative flex w-[18.5rem] flex-col border-r border-white/20 bg-gradient-to-br from-[#0f1b4c] via-[#172b4d] to-[#274b8a] text-white shadow-[0_24px_45px_-20px_rgba(23,43,77,0.55)] backdrop-blur-xl">
      <div className="relative z-10 flex items-center gap-3 px-8 pb-6 pt-10">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 shadow-inner shadow-white/10 backdrop-blur">
          <span className="argon-heading text-lg font-semibold text-white">
            PD
          </span>
        </div>
        <div>
          <p className="argon-heading text-lg font-semibold tracking-tight">
            Pediatric CMS
          </p>
          <p className="text-xs font-medium uppercase tracking-[0.3em] text-white/60">
            Admin Control
          </p>
        </div>
      </div>

      <div className="relative z-10 flex-1 overflow-y-auto px-6 pb-10">
        <div className="rounded-3xl border border-white/10 bg-white/6 p-3 shadow-[0_10px_30px_-15px_rgba(15,23,42,0.7)]">
          {SECTION_ORDER.map((sectionKey) => {
            const links = NAVIGATION.filter((item) => item.section === sectionKey)
            if (links.length === 0) return null

            return (
              <Fragment key={sectionKey}>
                <p className="argon-heading mt-4 px-3 text-xs font-semibold uppercase tracking-[0.2em] text-white/50">
                  {SECTION_TITLES[sectionKey]}
                </p>
                <div className="mt-3 space-y-2">
                  {links.map((item) => {
                    const isActive = pathname === item.href
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                          'group flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-medium transition-all duration-300',
                          isActive
                            ? 'bg-white text-[#172b4d] shadow-[0_15px_32px_-18px_rgba(255,255,255,0.9)]'
                            : 'text-white/75 hover:bg-white/10 hover:text-white'
                        )}
                      >
                        <span className="flex items-center gap-3">
                          <span
                            className={cn(
                              'inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/10 backdrop-blur transition duration-300 group-hover:scale-[1.02]',
                              isActive && 'border-transparent bg-gradient-to-br from-[#11cdef] to-[#5e72e4] text-white'
                            )}
                          >
                            <item.icon className="h-[18px] w-[18px]" />
                          </span>
                          <span className="argon-heading text-sm font-semibold tracking-wide">
                            {item.label}
                          </span>
                        </span>
                        <ArrowRightIcon
                          className={cn(
                            'h-4 w-4 transition duration-300',
                            isActive ? 'text-[#11cdef]' : 'opacity-0 group-hover:translate-x-1 group-hover:opacity-100'
                          )}
                        />
                      </Link>
                    )
                  })}
                </div>
              </Fragment>
            )
          })}
        </div>

        <div className="argon-card--gradient mt-8 rounded-3xl p-5 text-sm text-white shadow-[0_16px_32px_-18px_rgba(17,205,239,0.65)]">
          <p className="argon-heading text-base font-semibold">
            Need assistance?
          </p>
          <p className="mt-2 text-sm text-white/80">
            Access guided workflows and docs curated for your pediatric content team.
          </p>
          <Link
            href="/admin/support"
            className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-white/15 px-4 py-2 text-sm font-semibold tracking-wide text-white transition duration-200 hover:bg-white/25"
          >
            Help Center
            <ArrowRightIcon className="h-4 w-4" />
          </Link>
        </div>
      </div>

      <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-white/15 to-transparent opacity-50" />
    </aside>
  )
}
