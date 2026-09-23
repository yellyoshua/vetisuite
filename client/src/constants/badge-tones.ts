export type BadgeTone = 'green' | 'amber' | 'red' | 'blue' | 'gray'

export const BADGE_TONE_CLASS_NAMES: Record<BadgeTone, string> = {
  green: 'border-transparent bg-green-soft text-green',
  amber: 'border-transparent bg-amber-soft text-amber',
  red: 'border-transparent bg-red-soft text-red',
  blue: 'border-transparent bg-blue-soft text-blue',
  gray: 'border-transparent bg-gray-soft text-sub',
}
