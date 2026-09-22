type MeterTone = 'green' | 'green-soft' | 'blue' | 'dark'

type MeterSize = 'md' | 'lg'

const TONE_CLASS_NAMES: Record<MeterTone, string> = {
  green: 'bg-green',
  'green-soft': 'bg-green-soft',
  blue: 'bg-blue',
  dark: 'bg-dark',
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

export default function Meter({ percent, tone = 'green', size = 'md' }: MeterProps) {
  return (
    <div aria-hidden="true" className={`min-w-0 flex-1 rounded-full bg-track ${SIZE_CLASS_NAMES[size]}`}>
      <div className={`h-full rounded-full ${TONE_CLASS_NAMES[tone]}`} style={{ width: `${percent}%` }} />
    </div>
  )
}
