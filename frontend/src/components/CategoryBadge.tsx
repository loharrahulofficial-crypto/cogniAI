import { cn } from '@/lib/utils'

interface BadgeProps {
  category: 'BEHAVIOURAL' | 'DOMAIN' | 'FUNCTIONAL'
  className?: string
}

const categoryStyles: Record<BadgeProps['category'], string> = {
  BEHAVIOURAL: 'bg-frac-behavioural/10 text-frac-behavioural border-frac-behavioural/20',
  DOMAIN: 'bg-frac-domain/10 text-frac-domain border-frac-domain/20',
  FUNCTIONAL: 'bg-frac-functional/10 text-frac-functional border-frac-functional/20',
}

export function CategoryBadge({ category, className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium',
        categoryStyles[category],
        className
      )}
    >
      {category}
    </span>
  )
}
