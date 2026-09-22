import Card from '@/components/legacy-ui/Card'
import Icon, { type IconName } from '@/components/legacy-ui/Icon'

export type KpiTone = 'green' | 'amber' | 'blue' | 'red' | 'sub' | 'dark'

const TONE_CLASS_NAMES: Record<KpiTone, string> = {
  green: 'text-green',
  amber: 'text-amber',
  blue: 'text-blue',
  red: 'text-red',
  sub: 'text-sub',
  dark: 'text-dark',
}

type KpiCardProps = {
  label: string
  value: string
  detail: string
  icon: IconName
  tone: KpiTone
}

export default function KpiCard({ label, value, detail, icon, tone }: KpiCardProps) {
  return (
    <Card className="p-4">
      <div className="mb-2.5 flex items-center justify-between gap-2">
        <span className="text-[11.5px] font-semibold tracking-[0.2px] text-sub uppercase">{label}</span>
        <span className={TONE_CLASS_NAMES[tone]}>
          <Icon name={icon} size={16} />
        </span>
      </div>
      <p className="font-head text-[26px] font-bold tracking-[-0.5px] text-ink tabular-nums">{value}</p>
      <p className="mt-0.5 text-[11.5px] text-sub">{detail}</p>
    </Card>
  )
}
