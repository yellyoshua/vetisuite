import type { LucideIcon } from 'lucide-react'
import { CustomPageContainer } from '@/components/CustomPage/CustomPage'

export type KpiTone = 'primary' | 'warning' | 'info' | 'danger' | 'muted' | 'primary-strong'

const TONE_CLASS_NAMES: Record<KpiTone, string> = {
  primary: 'text-primary',
  warning: 'text-warning',
  info: 'text-info',
  danger: 'text-danger',
  muted: 'text-muted-foreground',
  'primary-strong': 'text-primary-strong',
}

type KpiCardProps = {
  label: string
  value: string
  detail: string
  icon: LucideIcon
  tone: KpiTone
}

export default function KpiCard({ label, value, detail, icon: Icon, tone }: KpiCardProps) {
  return (
    <CustomPageContainer className="p-4">
      <div className="mb-2.5 flex items-center justify-between gap-2">
        <span className="text-[11.5px] font-semibold tracking-[0.2px] text-muted-foreground uppercase">{label}</span>
        <span className={TONE_CLASS_NAMES[tone]}>
          <Icon className="size-4" aria-hidden="true" />
        </span>
      </div>
      <p className="font-head text-[26px] font-bold tracking-[-0.5px] text-foreground tabular-nums">{value}</p>
      <p className="mt-0.5 text-[11.5px] text-muted-foreground">{detail}</p>
    </CustomPageContainer>
  )
}
