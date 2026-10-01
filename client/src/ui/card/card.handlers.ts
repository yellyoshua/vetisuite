import type { ComponentProps } from 'react'
import { cn } from '@/lib/utils'

export type CardPart = 'root' | 'header' | 'title' | 'description' | 'content' | 'footer'

export type CardProps = ComponentProps<'div'> & {
  part?: CardPart
}

const partClasses: Record<CardPart, string> = {
  root: 'rounded-row border border-border bg-card text-card-foreground',
  header: 'flex flex-col gap-1.5 p-3',
  title: 'text-sm leading-tight font-medium text-muted-foreground',
  description: 'text-xs text-neutral-faint',
  content: 'px-3 pb-3 text-[13px]',
  footer: 'flex flex-wrap items-center gap-2 border-t border-dashed border-border px-3 py-2.5 text-xs',
}

export default function useCard({ part = 'root', className, ...rest }: CardProps) {
  return { cardProps: { ...rest, className: cn(partClasses[part], className) } }
}
