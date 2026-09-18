import type { DailyBar } from '../dashboard.schema'

const BAR_MAX_HEIGHT = 96

type DailyBarChartProps = {
  bars: DailyBar[]
}

export default function DailyBarChart({ bars }: DailyBarChartProps) {
  const maxValue = Math.max(1, ...bars.map((bar) => bar.value))

  return (
    <ul className="mt-[18px] flex h-[150px] gap-2">
      {bars.map((bar) => (
        <li key={bar.label} className="flex h-full flex-1 flex-col-reverse items-center gap-1.5">
          <span className={`text-[10.5px] ${bar.isToday ? 'font-semibold text-ink' : 'text-sub'}`}>{bar.label}</span>
          <div
            aria-hidden="true"
            className={`w-full max-w-8 rounded-t-[7px] rounded-b-[3px] ${bar.isToday ? 'bg-green' : 'bg-green-soft'}`}
            style={{ height: `${(bar.value / maxValue) * BAR_MAX_HEIGHT}px` }}
          />
          <span className={`text-[11px] tabular-nums ${bar.isToday ? 'font-bold text-ink' : 'font-semibold text-sub'}`}>
            {bar.value}
          </span>
        </li>
      ))}
    </ul>
  )
}
