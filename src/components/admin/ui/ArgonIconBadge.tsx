import { cn } from '@/lib/utils'

interface ArgonIconBadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  tone?: 'blue' | 'cyan' | 'green' | 'orange' | 'purple'
  size?: 'sm' | 'md' | 'lg'
}

const toneClassMap: Record<Required<ArgonIconBadgeProps>['tone'], string> = {
  blue: 'from-argon-blue/85 to-argon-indigo/85 text-white shadow-[0_8px_20px_-10px_rgba(94,114,228,0.7)]',
  cyan: 'from-argon-cyan/90 to-sky-500/90 text-white shadow-[0_8px_20px_-10px_rgba(17,205,239,0.65)]',
  green: 'from-argon-accent/95 to-emerald-500/90 text-white shadow-[0_8px_20px_-10px_rgba(45,206,137,0.6)]',
  orange: 'from-argon-orange/95 to-orange-500/95 text-white shadow-[0_8px_20px_-10px_rgba(251,99,64,0.6)]',
  purple: 'from-argon-purple/95 to-purple-500/95 text-white shadow-[0_8px_20px_-10px_rgba(137,101,224,0.6)]',
}

const sizeClassMap: Record<Required<ArgonIconBadgeProps>['size'], string> = {
  sm: 'h-10 w-10 text-base',
  md: 'h-12 w-12 text-lg',
  lg: 'h-14 w-14 text-xl',
}

export function ArgonIconBadge({
  tone = 'blue',
  size = 'md',
  className,
  children,
  ...props
}: ArgonIconBadgeProps) {
  return (
    <div
      className={cn(
        'inline-flex items-center justify-center rounded-2xl bg-gradient-to-br text-white transition-transform duration-300',
        toneClassMap[tone],
        sizeClassMap[size],
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}
