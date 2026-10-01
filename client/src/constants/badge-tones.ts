export type BadgeTone = 'primary' | 'warning' | 'danger' | 'info' | 'neutral'

export const BADGE_TONE_CLASS_NAMES: Record<BadgeTone, string> = {
  primary: 'border-transparent bg-primary-soft text-primary',
  warning: 'border-transparent bg-warning-soft text-warning',
  danger: 'border-transparent bg-danger-soft text-danger',
  info: 'border-transparent bg-info-soft text-info',
  neutral: 'border-transparent bg-neutral-soft text-muted-foreground',
}
