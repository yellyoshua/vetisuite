import { FINANCE_TREND_CLASS_NAMES } from '@/constants/finance'
import type { FinanceArea, FinanceAreaTotals } from '../../finance.schema'

type AreaDetailTableProps = {
  areas: FinanceArea[]
  totals: FinanceAreaTotals
}

const COLUMNS = [
  { key: 'area', header: 'Área', alignClassName: 'text-left' },
  { key: 'invoices', header: 'Facturas', alignClassName: 'text-right' },
  { key: 'income', header: 'Ingresos', alignClassName: 'text-right' },
  { key: 'share', header: '% del total', alignClassName: 'text-right' },
  { key: 'delta', header: 'Var. vs periodo anterior', alignClassName: 'text-right' },
]

const BODY_CELL_CLASS_NAME = 'border-b border-line-soft px-5 py-3 text-right text-[13px] tabular-nums'

const TOTAL_CELL_CLASS_NAME = 'px-5 py-[13px] text-right text-[13px] tabular-nums'

export default function AreaDetailTable({ areas, totals }: AreaDetailTableProps) {
  return (
    <table aria-label="Detalle por área" className="w-full min-w-[760px] border-separate border-spacing-0">
      <thead>
        <tr>
          {COLUMNS.map((column) => (
            <th
              key={column.key}
              scope="col"
              className={`border-y border-line px-5 py-[11px] font-body text-[11px] font-semibold tracking-[0.4px] whitespace-nowrap text-sub uppercase ${column.alignClassName}`}
            >
              {column.header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {areas.map((area) => (
          <tr key={area.name}>
            <th scope="row" className="border-b border-line-soft px-5 py-3 text-left font-head text-[13.5px] font-semibold whitespace-nowrap">
              {area.name}
            </th>
            <td className={BODY_CELL_CLASS_NAME}>{area.invoiceCount}</td>
            <td className={BODY_CELL_CLASS_NAME}>{area.amount}</td>
            <td className={`${BODY_CELL_CLASS_NAME} text-sub`}>{area.share}</td>
            <td className={`${BODY_CELL_CLASS_NAME} font-semibold ${FINANCE_TREND_CLASS_NAMES[area.trend]}`}>{area.delta}</td>
          </tr>
        ))}
      </tbody>
      <tfoot>
        <tr>
          <th scope="row" className="px-5 py-[13px] text-left font-head text-[13.5px] font-bold">
            Total
          </th>
          <td className={`${TOTAL_CELL_CLASS_NAME} font-bold`}>{totals.invoiceCount}</td>
          <td className={`${TOTAL_CELL_CLASS_NAME} font-bold`}>{totals.amount}</td>
          <td className={`${TOTAL_CELL_CLASS_NAME} text-sub`}>{totals.share}</td>
          <td className={`${TOTAL_CELL_CLASS_NAME} font-bold ${FINANCE_TREND_CLASS_NAMES[totals.trend]}`}>{totals.delta}</td>
        </tr>
      </tfoot>
    </table>
  )
}
