import { cn } from '@/lib/utils'
import { ArgonCard } from './ArgonCard'
import { ArgonIconBadge } from './ArgonIconBadge'

interface ArgonMetricCardProps {
  label: string
  value: string
  deltaLabel?: string
  deltaValue?: string
  positiveDelta?: boolean
  icon?: React.ReactNode
  tone?: 'blue' | 'cyan' | 'green' | 'orange' | 'purple'
  className?: string
}

export function ArgonMetricCard({
  label,
  value,
  deltaLabel,
  deltaValue,
  positiveDelta = true,
  icon,
  tone = 'blue',
  className
}: ArgonMetricCardProps) {
  return (
    <ArgonCard
      variant="glass"
      className={cn(
        'group relative overflow-hidden border border-white/60 bg-white/80 p-6 shadow-[0_18px_32px_-20px_rgba(15,23,42,0.4)] backdrop-blur-xl',
        className
      )}
    >
      <div className="absolute inset-0 -z-10 opacity-70 transition-opacity duration-300 group-hover:opacity-100">
        <div className="absolute -right-24 -top-32 h-52 w-52 rounded-full bg-gradient-to-br from-white/60 to-transparent blur-3xl" />
        <div className="absolute -bottom-32 -left-20 h-44 w-44 rounded-full bg-gradient-to-br from-white/40 to-transparent blur-2xl" />
      </div>
      <div className="flex items-center justify-between gap-6">
        <div>
          <span className="argon-heading text-xs font-semibold uppercase tracking-[0.14em] text-[var(--argon-dark)]/60">
            {label}
          </span>
          <h4 className="argon-heading mt-2 text-3xl font-semibold text-[var(--argon-dark)]">
            {value}
          </h4>
          {deltaLabel || deltaValue ? (
            <div className="mt-3 flex items-center gap-2 text-sm font-medium">
              <span
                className={cn(
                  positiveDelta ? 'text-emerald-500' : 'text-rose-500'
                )}
              >
                {deltaValue}
              </span>
              <span className="text-[var(--argon-dark)]/60">
                {deltaLabel}
              </span>
            </div>
          ) : null}
        </div>
        {icon ? (
          <ArgonIconBadge tone={tone} size="lg">
            {icon}
          </ArgonIconBadge>
        ) : null}
      </div>
    </ArgonCard>
  )
}
