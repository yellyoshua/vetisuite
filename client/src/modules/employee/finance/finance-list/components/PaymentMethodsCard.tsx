import DonutChart from '@/components/DonutChart/DonutChart'
import { CustomPageContainer } from '@/components/CustomPage/CustomPage'
import { FINANCE_PAYMENT_METHOD_LABELS, FINANCE_PAYMENT_METHOD_TONES } from '@/constants/finance'
import { formatCurrency } from '@/lib/format-currency'
import type { FinancePaymentShare } from '@/modules/employee/finance/finance.schema'

type PaymentMethodsCardProps = {
  collectedTotal: number
  paymentShares: FinancePaymentShare[]
}

export default function PaymentMethodsCard({ collectedTotal, paymentShares }: PaymentMethodsCardProps) {
  const segments = paymentShares.map((share) => ({
    label: FINANCE_PAYMENT_METHOD_LABELS[share.method],
    value: `${share.percent}%`,
    percent: share.percent,
    tone: FINANCE_PAYMENT_METHOD_TONES[share.method],
  }))

  return (
    <CustomPageContainer className="p-5">
      <h2 className="m-0 font-head text-[15px] font-semibold">Cobros por método</h2>
      <DonutChart total={formatCurrency(collectedTotal)} unit="cobrado" segments={segments} totalSize="sm" />
      <p className="mt-4 border-t border-line-soft pt-3.5 text-[11.5px] text-sub">
        Solo lectura: un cobro se registra al pagar una factura en Cuentas y facturas.
      </p>
    </CustomPageContainer>
  )
}
