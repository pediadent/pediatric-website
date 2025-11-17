import { cn } from '@/lib/utils'

type ArgonCardVariant = 'solid' | 'gradient' | 'glass'

interface ArgonCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: ArgonCardVariant
  header?: React.ReactNode
  footer?: React.ReactNode
}

export function ArgonCard({
  variant = 'solid',
  header,
  footer,
  children,
  className,
  ...props
}: ArgonCardProps) {
  const variantClasses = {
    solid: 'argon-card bg-white',
    gradient: 'argon-card--gradient text-white',
    glass:
      'argon-card bg-white/70 backdrop-blur-xl border border-white/40 shadow-lg',
  } satisfies Record<ArgonCardVariant, string>

  return (
    <div
      className={cn(
        'relative flex flex-col rounded-3xl p-6 transition-transform duration-300 hover:-translate-y-1',
        variantClasses[variant],
        className
      )}
      {...props}
    >
      {header ? (
        <div className="mb-5 flex items-start justify-between gap-4">
          {header}
        </div>
      ) : null}
      <div className="flex-1">{children}</div>
      {footer ? <div className="mt-6 border-t border-white/10 pt-4">{footer}</div> : null}
    </div>
  )
}

export function ArgonCardTitle({
  className,
  children,
  subtle,
}: {
  className?: string
  children: React.ReactNode
  subtle?: boolean
}) {
  return (
    <h3
      className={cn(
        'argon-heading text-lg font-semibold tracking-tight',
        subtle ? 'text-white/80' : 'text-[var(--argon-dark)]',
        className
      )}
    >
      {children}
    </h3>
  )
}

export function ArgonCardDescription({
  className,
  children,
}: {
  className?: string
  children: React.ReactNode
}) {
  return (
    <p
      className={cn(
        'text-sm text-[var(--argon-dark)]/70',
        className
      )}
    >
      {children}
    </p>
  )
}

export function ArgonMetric({
  label,
  value,
  delta,
  positive = true,
  className,
}: {
  label: string
  value: string
  delta?: string
  positive?: boolean
  className?: string
}) {
  return (
    <div className={cn('space-y-2', className)}>
      <span className="text-xs font-semibold uppercase tracking-[0.08em] text-white/70">
        {label}
      </span>
      <div className="text-3xl font-semibold text-white">{value}</div>
      {delta ? (
        <span
          className={cn(
            'text-xs font-medium',
            positive ? 'text-emerald-200' : 'text-rose-200'
          )}
        >
          {delta}
        </span>
      ) : null}
    </div>
  )
}
