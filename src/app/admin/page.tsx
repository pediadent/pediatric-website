'use client'

export const dynamic = 'force-dynamic'

import { DocumentIcon } from '@heroicons/react/24/solid'
import Link from 'next/link'
import {
  
  StarIcon,
  UserGroupIcon,
  BuildingOfficeIcon,
  ArrowRightIcon,
  SparklesIcon
} from '@heroicons/react/24/outline'
import { prisma } from '@/lib/prisma'
import { RecentActivity } from '@/components/admin/RecentActivity'
import { AdminWrapper } from '@/components/admin/AdminWrapper'
import { ArgonMetricCard } from '@/components/admin/ui/ArgonMetricCard'
import { ArgonCard } from '@/components/admin/ui/ArgonCard'

const quickActions = [
  {
    title: 'New Article',
    description: 'Create a new blog post',
    href: '/admin/articles/new',
    colorClasses: 'bg-blue-50 hover:bg-blue-100 text-blue-900',
    accentClasses: 'text-blue-600'
  },
  {
    title: 'New Review',
    description: 'Add a new product review',
    href: '/admin/reviews/new',
    colorClasses: 'bg-green-50 hover:bg-green-100 text-green-900',
    accentClasses: 'text-green-600'
  },
  {
    title: 'Add Dentist',
    description: 'Add to directory',
    href: '/admin/dentists/new',
    colorClasses: 'bg-purple-50 hover:bg-purple-100 text-purple-900',
    accentClasses: 'text-purple-600'
  }
] as const

export default async function AdminDashboard() {
  const [articlesCount, reviewsCount, authorsCount, dentistsCount] = await Promise.all([
    prisma.article.count(),
    prisma.review.count(),
    prisma.author.count(),
    prisma.dentistDirectory.count()
  ])

  const stats = [
    {
      name: 'Total Articles',
      value: articlesCount.toLocaleString(),
      delta: '+12%',
      deltaLabel: 'vs last month',
      positive: true,
      icon: <DocumentIcon className="h-5 w-5" />,
      tone: 'blue' as const
    },
    {
      name: 'Total Reviews',
      value: reviewsCount.toLocaleString(),
      delta: '+8%',
      deltaLabel: 'vs last month',
      positive: true,
      icon: <StarIcon className="h-5 w-5" />,
      tone: 'purple' as const
    },
    {
      name: 'Authors',
      value: authorsCount.toLocaleString(),
      delta: '+3%',
      deltaLabel: 'active this week',
      positive: true,
      icon: <UserGroupIcon className="h-5 w-5" />,
      tone: 'cyan' as const
    },
    {
      name: 'Dentist Listings',
      value: dentistsCount.toLocaleString(),
      delta: '+5%',
      deltaLabel: 'profile updates',
      positive: true,
      icon: <BuildingOfficeIcon className="h-5 w-5" />,
      tone: 'green' as const
    }
  ]

  return (
    <AdminWrapper>
      <div className="space-y-10">
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => (
            <ArgonMetricCard
              key={stat.name}
              label={stat.name}
              value={stat.value}
              deltaValue={stat.delta}
              deltaLabel={stat.deltaLabel}
              positiveDelta={stat.positive}
              icon={stat.icon}
              tone={stat.tone}
            />
          ))}
        </div>

        <div className="grid gap-8 xl:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
          <ArgonCard className="relative overflow-hidden">
            <div className="absolute -top-24 -right-28 h-72 w-72 rounded-full bg-gradient-to-br from-white/25 to-transparent blur-3xl" />
            <div className="absolute -bottom-40 left-10 h-64 w-64 rounded-full bg-gradient-to-br from-[#11cdef]/30 to-transparent blur-3xl" />
            <div className="relative flex h-full flex-col justify-between">
              <div className="flex flex-col gap-2">
                <span className="argon-heading text-xs font-semibold uppercase tracking-[0.28em] text-[var(--argon-dark)]/60">
                  Content Pulse
                </span>
                <h2 className="argon-heading text-3xl font-semibold text-[var(--argon-dark)]">
                  Publishing cadence &amp; review coverage
                </h2>
                <p className="max-w-xl text-sm text-[var(--argon-dark)]/65">
                  Track how your pediatric content evolves each month. These metrics combine article throughput, reviewer activity, and directory updates to highlight traction.
                </p>
              </div>
              <div className="mt-8 grid gap-6 md:grid-cols-3">
                <div className="rounded-2xl border border-[var(--argon-border)] bg-white/70 p-4 text-sm text-[var(--argon-dark)] shadow-[0_14px_32px_-22px_rgba(23,43,77,0.5)] backdrop-blur-lg">
                  <span className="argon-heading text-xs font-semibold uppercase tracking-[0.16em] text-[var(--argon-dark)]/55">
                    Editorial Velocity
                  </span>
                  <p className="argon-heading mt-2 text-2xl font-semibold text-[var(--argon-dark)]">
                    18 posts
                  </p>
                  <p className="mt-1 text-[var(--argon-dark)]/60">published in the last 30 days</p>
                </div>
                <div className="rounded-2xl border border-[var(--argon-border)] bg-white/70 p-4 text-sm text-[var(--argon-dark)] shadow-[0_14px_32px_-22px_rgba(23,43,77,0.5)] backdrop-blur-lg">
                  <span className="argon-heading text-xs font-semibold uppercase tracking-[0.16em] text-[var(--argon-dark)]/55">
                    Review Coverage
                  </span>
                  <p className="argon-heading mt-2 text-2xl font-semibold text-[var(--argon-dark)]">
                    92%
                  </p>
                  <p className="mt-1 text-[var(--argon-dark)]/60">directory listings with expert review</p>
                </div>
                <div className="rounded-2xl border border-[var(--argon-border)] bg-white/70 p-4 text-sm text-[var(--argon-dark)] shadow-[0_14px_32px_-22px_rgba(23,43,77,0.5)] backdrop-blur-lg">
                  <span className="argon-heading text-xs font-semibold uppercase tracking-[0.16em] text-[var(--argon-dark)]/55">
                    Review SLA
                  </span>
                  <p className="argon-heading mt-2 text-2xl font-semibold text-[var(--argon-dark)]">
                    2.4 days
                  </p>
                  <p className="mt-1 text-[var(--argon-dark)]/60">average time from submission to approval</p>
                </div>
              </div>
            </div>
          </ArgonCard>

          <ArgonCard variant="gradient" className="overflow-hidden">
            <div className="flex items-start justify-between">
              <div>
                <p className="argon-heading text-xs font-semibold uppercase tracking-[0.28em] text-white/70">
                  Quick Actions
                </p>
                <h3 className="argon-heading mt-2 text-2xl font-semibold text-white">
                  Launch new pediatric experiences
                </h3>
                <p className="mt-2 max-w-sm text-sm text-white/80">
                  Shortcut into the workflows your editors use daily. Each action opens a guided form with auto-saved drafts.
                </p>
              </div>
              <span className="rounded-3xl border border-white/20 bg-white/10 p-3 text-white/90">
                <SparklesIcon className="h-6 w-6" />
              </span>
            </div>
            <div className="mt-6 space-y-3">
              {quickActions.map((action) => (
                <Link
                  key={action.title}
                  href={action.href}
                  className="group flex items-center justify-between rounded-2xl bg-white/15 px-4 py-3 text-sm font-semibold tracking-wide text-white transition duration-300 hover:bg-white/25"
                >
                  <div>
                    <div className="argon-heading text-base font-semibold leading-tight">
                      {action.title}
                    </div>
                    <div className="text-xs uppercase tracking-[0.28em] text-white/70">
                      {action.description}
                    </div>
                  </div>
                  <ArrowRightIcon className="h-5 w-5 opacity-70 transition duration-300 group-hover:translate-x-2 group-hover:opacity-100" />
                </Link>
              ))}
            </div>
          </ArgonCard>
        </div>

        <div className="grid gap-8 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
          <ArgonCard className="overflow-hidden">
            <RecentActivity />
          </ArgonCard>
          <ArgonCard className="relative overflow-hidden">
            <div className="absolute -right-12 -top-16 h-40 w-40 rounded-full bg-gradient-to-br from-[#11cdef]/35 to-transparent blur-3xl" />
            <div className="flex h-full flex-col justify-between">
              <div>
                <p className="argon-heading text-xs font-semibold uppercase tracking-[0.28em] text-[var(--argon-dark)]/60">
                  Editorial Insights
                </p>
                <h3 className="argon-heading mt-2 text-2xl font-semibold text-[var(--argon-dark)]">
                  Team availability
                </h3>
                <p className="mt-2 text-sm text-[var(--argon-dark)]/60">
                  Review the weekly availability so assignments flow without bottlenecks.
                </p>
              </div>
              <div className="mt-6 space-y-4 text-sm text-[var(--argon-dark)]">
                <div className="flex items-center justify-between rounded-2xl border border-[var(--argon-border)] bg-white/70 px-4 py-3 backdrop-blur">
                  <div>
                    <p className="argon-heading text-sm font-semibold text-[var(--argon-dark)]">Medical Reviewers</p>
                    <p className="text-xs text-[var(--argon-dark)]/60">3 of 4 available today</p>
                  </div>
                  <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-600">
                    75% capacity
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-2xl border border-[var(--argon-border)] bg-white/70 px-4 py-3 backdrop-blur">
                  <div>
                    <p className="argon-heading text-sm font-semibold text-[var(--argon-dark)]">Copy Editors</p>
                    <p className="text-xs text-[var(--argon-dark)]/60">2 new editors onboarding</p>
                  </div>
                  <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold text-orange-500">
                    Hiring
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-2xl border border-[var(--argon-border)] bg-white/70 px-4 py-3 backdrop-blur">
                  <div>
                    <p className="argon-heading text-sm font-semibold text-[var(--argon-dark)]">Dentist Contributors</p>
                    <p className="text-xs text-[var(--argon-dark)]/60">Directory coverage refreshed weekly</p>
                  </div>
                  <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-600">
                    Stable
                  </span>
                </div>
              </div>
            </div>
          </ArgonCard>
        </div>
      </div>
    </AdminWrapper>
  )
}
