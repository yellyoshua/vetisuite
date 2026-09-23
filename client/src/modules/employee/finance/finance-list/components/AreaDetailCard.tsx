import { DownloadIcon, PrinterIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { CustomPageContainer } from '@/components/CustomPage/CustomPage'
import type { FinanceArea, FinanceAreaTotals } from '@/modules/employee/finance/finance.schema'
import AreaDetailTable from './AreaDetailTable'

type AreaDetailCardProps = {
  areas: FinanceArea[]
  totals: FinanceAreaTotals
}

export default function AreaDetailCard({ areas, totals }: AreaDetailCardProps) {
  return (
    <CustomPageContainer className="mt-3.5 overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
        <div className="min-w-0">
          <h2 className="m-0 font-head text-[15px] font-semibold">Detalle por área</h2>
          <p className="mt-[3px] text-xs text-sub">Cada línea se calcula con las facturas emitidas en el periodo.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" disabled>
            <DownloadIcon /> CSV
          </Button>
          <Button variant="ghost" size="sm" onClick={() => window.print()}>
            <PrinterIcon /> Imprimir
          </Button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <AreaDetailTable areas={areas} totals={totals} />
      </div>
    </CustomPageContainer>
  )
}
