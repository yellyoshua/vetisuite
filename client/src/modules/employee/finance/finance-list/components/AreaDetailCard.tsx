import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import Icon from '@/components/ui/Icon'
import type { FinanceArea, FinanceAreaTotals } from '../../finance.schema'
import AreaDetailTable from './AreaDetailTable'

type AreaDetailCardProps = {
  areas: FinanceArea[]
  totals: FinanceAreaTotals
}

export default function AreaDetailCard({ areas, totals }: AreaDetailCardProps) {
  return (
    <Card className="mt-3.5 overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
        <div className="min-w-0">
          <h2 className="m-0 font-head text-[15px] font-semibold">Detalle por área</h2>
          <p className="mt-[3px] text-xs text-sub">Cada línea se calcula con las facturas emitidas en el periodo.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" isDisabled>
            <Icon name="download" size={13} /> CSV
          </Button>
          <Button variant="ghost" size="sm" onClick={() => window.print()}>
            <Icon name="printer" size={13} /> Imprimir
          </Button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <AreaDetailTable areas={areas} totals={totals} />
      </div>
    </Card>
  )
}
