import Card from '@/components/ui/Card'
import Meter from '@/components/ui/Meter'
import { FINANCE_TREND_CLASS_NAMES } from '@/constants/finance'
import type { FinanceArea } from '../../finance.schema'

type AreaIncomeCardProps = {
  areas: FinanceArea[]
  periodLabel: string
}

export default function AreaIncomeCard({ areas, periodLabel }: AreaIncomeCardProps) {
  return (
    <Card className="p-5">
      <div className="mb-4 flex items-baseline justify-between gap-2.5">
        <h2 className="m-0 font-head text-[15px] font-semibold">Ingresos por área</h2>
        <span className="text-[11.5px] text-sub">{periodLabel}</span>
      </div>
      <ul className="flex flex-col gap-3">
        {areas.map((area) => (
          <li key={area.name} className="flex items-center gap-2.5">
            <span className="w-[88px] text-xs text-sub">{area.name}</span>
            <Meter percent={area.barPercent} />
            <span className="w-14 text-right text-xs font-semibold tabular-nums">{area.amount}</span>
            <span className={`w-[52px] text-right text-[11.5px] tabular-nums ${FINANCE_TREND_CLASS_NAMES[area.trend]}`}>
              {area.delta}
            </span>
          </li>
        ))}
      </ul>
    </Card>
  )
}
