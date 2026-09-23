import OptionSelect from '@/components/OptionSelect/OptionSelect'
import { Input } from '@/components/ui/input'
import {
  FINANCE_COMPARISON_LABELS,
  FINANCE_COMPARISON_VALUES,
  FINANCE_PERIOD_LABELS,
  FINANCE_PERIOD_VALUES,
} from '@/constants/finance'
import type { FinanceQuery, FinanceQueryKey } from '@/modules/employee/finance/finance.schema'

type PeriodBarProps = {
  query: FinanceQuery
  onChange: (key: FinanceQueryKey, value: string) => void
}

const ACTIVE_PERIOD_CLASS_NAME = 'bg-dark font-semibold text-white'

const INACTIVE_PERIOD_CLASS_NAME = 'bg-transparent font-medium text-sub'

export default function PeriodBar({ query, onChange }: PeriodBarProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <div role="group" aria-label="Periodo" className="flex max-w-full flex-wrap items-center gap-0.5 rounded-control border border-line bg-card p-[3px]">
        {FINANCE_PERIOD_VALUES.map((period) => (
          <button
            key={period}
            type="button"
            aria-pressed={period === query.period}
            onClick={() => onChange('period', period)}
            className={`cursor-pointer rounded-lg border-0 px-3 py-[7px] font-body text-[12.5px] whitespace-nowrap ${period === query.period ? ACTIVE_PERIOD_CLASS_NAME : INACTIVE_PERIOD_CLASS_NAME}`}
          >
            {FINANCE_PERIOD_LABELS[period]}
          </button>
        ))}
      </div>
      <div className="w-[150px]">
        <Input type="date" aria-label="Desde" value={query.from} onChange={(event) => onChange('from', event.target.value)} />
      </div>
      <span className="text-xs text-sub">a</span>
      <div className="w-[150px]">
        <Input type="date" aria-label="Hasta" value={query.to} onChange={(event) => onChange('to', event.target.value)} />
      </div>
      <div className="w-[230px] max-w-full">
        <OptionSelect
          label="Comparación"
          value={query.comparison}
          options={FINANCE_COMPARISON_VALUES.map((comparison) => ({ value: comparison, label: FINANCE_COMPARISON_LABELS[comparison] }))}
          onChange={(comparison) => onChange('comparison', comparison)}
          className="sm:w-full"
        />
      </div>
    </div>
  )
}
