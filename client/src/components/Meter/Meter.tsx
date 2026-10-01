type MeterTone = 'primary' | 'primary-soft' | 'info' | 'primary-strong'

type MeterSize = 'md' | 'lg'

const TONE_CLASS_NAMES: Record<MeterTone, string> = {
  primary: 'bg-primary',
  'primary-soft': 'bg-primary-soft',
  info: 'bg-info',
  'primary-strong': 'bg-primary-strong',
}

const SIZE_CLASS_NAMES: Record<MeterSize, string> = {
  md: 'h-2',
  lg: 'h-2.5',
}

type MeterProps = {
  percent: number
  tone?: MeterTone
  size?: MeterSize
}

export default function Meter({ percent, tone = 'primary', size = 'md' }: MeterProps) {
  return (
    <div aria-hidden="true" className={`min-w-0 flex-1 rounded-full bg-muted ${SIZE_CLASS_NAMES[size]}`}>
      <div className={`h-full rounded-full ${TONE_CLASS_NAMES[tone]}`} style={{ width: `${percent}%` }} />
    </div>
  )
}
