import type { ReactNode } from 'react'

export type DonutTone = 'green' | 'amber' | 'blue' | 'track'

export type DonutSegment = {
  label: string
  value: string
  percent: number
  tone: DonutTone
}

type DonutTotalSize = 'md' | 'sm'

const TONE_COLORS: Record<DonutTone, string> = {
  green: 'var(--color-green)',
  amber: 'var(--color-amber)',
  blue: 'var(--color-blue)',
  track: 'var(--color-track)',
}

const TONE_DOT_CLASS_NAMES: Record<DonutTone, string> = {
  green: 'bg-green',
  amber: 'bg-amber',
  blue: 'bg-blue',
  track: 'bg-track',
}

const TOTAL_SIZE_CLASS_NAMES: Record<DonutTotalSize, string> = {
  md: 'text-[22px] tracking-[-0.5px]',
  sm: 'text-[17px] tracking-[-0.4px]',
}

type DonutChartProps = {
  total: string
  unit: string
  segments: DonutSegment[]
  totalSize?: DonutTotalSize
  legendFooter?: ReactNode
}

function buildGradient(segments: DonutSegment[]): string {
  const stops = segments.map((segment, index) => {
    const start = segments.slice(0, index).reduce((sum, previous) => sum + previous.percent, 0)

    return `${TONE_COLORS[segment.tone]} ${start}% ${start + segment.percent}%`
  })

  return `conic-gradient(${stops.join(', ')})`
}

export default function DonutChart({ total, unit, segments, totalSize = 'md', legendFooter }: DonutChartProps) {
  return (
    <div className="mt-[18px] flex flex-wrap items-center gap-[22px]">
      <div
        aria-hidden="true"
        className="relative size-[118px] shrink-0 rounded-full"
        style={{ background: buildGradient(segments) }}
      >
        <div className="absolute inset-[15px] flex flex-col items-center justify-center rounded-full bg-card">
          <span className={`font-head font-bold tabular-nums ${TOTAL_SIZE_CLASS_NAMES[totalSize]}`}>{total}</span>
          <span className="text-[10.5px] text-sub">{unit}</span>
        </div>
      </div>
      <div className="relative flex min-w-[140px] flex-1 flex-col gap-[9px]">
        <p className="sr-only">
          {total} {unit}
        </p>
        <ul className="flex flex-col gap-[9px]">
          {segments.map((segment) => (
            <li key={segment.label} className="flex items-center gap-2 text-[12.5px]">
              <span aria-hidden="true" className={`size-[9px] rounded-full ${TONE_DOT_CLASS_NAMES[segment.tone]}`} />
              <span className="flex-1 text-sub">{segment.label}</span>
              <b className="tabular-nums">{segment.value}</b>
            </li>
          ))}
        </ul>
        {legendFooter}
      </div>
    </div>
  )
}
