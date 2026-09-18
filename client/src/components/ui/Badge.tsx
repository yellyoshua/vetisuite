import type { ReactNode } from 'react'

export type BadgeTone = 'green' | 'amber' | 'red' | 'blue' | 'gray'

const TONE_CLASS_NAMES: Record<BadgeTone, string> = {
  green: 'bg-green-soft text-green',
  amber: 'bg-amber-soft text-amber',
  red: 'bg-red-soft text-red',
  blue: 'bg-blue-soft text-blue',
  gray: 'bg-gray-soft text-sub',
}

type BadgeProps = {
  tone?: BadgeTone
  children: ReactNode
}

export default function Badge({ tone = 'green', children }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 whitespace-nowrap rounded-full px-[9px] py-[3px] text-[11.5px] font-semibold ${TONE_CLASS_NAMES[tone]}`}
    >
      {children}
    </span>
  )
}
