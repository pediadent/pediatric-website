import { prisma } from '@/lib/prisma'
import { formatDate } from '@/lib/utils'

export async function RecentActivity() {
  const recentArticles = await prisma.article.findMany({
    take: 5,
    orderBy: { updatedAt: 'desc' },
    include: { author: true }
  })

  const recentReviews = await prisma.review.findMany({
    take: 5,
    orderBy: { updatedAt: 'desc' },
    include: { author: true, primaryReviewer: true }
  })

  const activities = [
    ...recentArticles.map((article) => ({
      type: 'article',
      title: article.title,
      author: article.author.name,
      date: article.updatedAt,
      status: article.status
    })),
    ...recentReviews.map((review) => ({
      type: 'review',
      title: review.title,
      author: review.primaryReviewer?.name ?? review.author.name,
      date: review.updatedAt,
      status: review.status
    }))
  ]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 10)

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between">
        <div>
          <p className="argon-heading text-xs font-semibold uppercase tracking-[0.28em] text-[var(--argon-dark)]/60">
            Recent Activity
          </p>
          <h3 className="argon-heading mt-1 text-2xl font-semibold text-[var(--argon-dark)]">
            Editorial timeline
          </h3>
        </div>
        <span className="rounded-full bg-gradient-to-br from-[#11cdef]/20 to-[#5e72e4]/20 px-3 py-1 text-xs font-semibold text-[var(--argon-dark)]/70">
          {activities.length} updates
        </span>
      </div>

      <div className="mt-6 space-y-4">
        {activities.length > 0 ? (
          activities.map((activity) => (
            <div
              key={`${activity.type}-${activity.title}-${activity.date.toString()}`}
              className="group relative overflow-hidden rounded-2xl border border-[var(--argon-border)] bg-white/70 px-4 py-3 shadow-[0_16px_30px_-20px_rgba(23,43,77,0.5)] transition duration-300 hover:-translate-y-0.5 hover:border-[#11cdef]/40 hover:bg-white backdrop-blur"
            >
              <div className="absolute inset-y-0 left-0 w-1 rounded-full bg-gradient-to-b from-[#11cdef] to-[#5e72e4]" />
              <div className="ml-4 flex items-start justify-between gap-4">
                <div className="min-w-0 space-y-1">
                  <p className="argon-heading truncate text-sm font-semibold text-[var(--argon-dark)]">
                    {activity.title}
                  </p>
                  <p className="text-xs text-[var(--argon-dark)]/60">
                    {activity.type === 'article' ? 'Article' : 'Review'} • {activity.author}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#11cdef]">
                    {activity.status}
                  </p>
                  <p className="text-xs text-[var(--argon-dark)]/50">
                    {formatDate(activity.date)}
                  </p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className="rounded-2xl border border-dashed border-[var(--argon-border)] bg-white/60 px-4 py-6 text-center text-sm text-[var(--argon-dark)]/60">
            No recent activity
          </p>
        )}
      </div>
    </div>
  )
}
