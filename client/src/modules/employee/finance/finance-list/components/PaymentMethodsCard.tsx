import DonutChart from '@/components/DonutChart'
import Card from '@/components/legacy-ui/Card'
import { FINANCE_PAYMENT_METHOD_LABELS, FINANCE_PAYMENT_METHOD_TONES } from '@/constants/finance'
import type { FinancePaymentShare } from '../../finance.schema'

type PaymentMethodsCardProps = {
  collectedTotal: string
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
    <Card className="p-5">
      <h2 className="m-0 font-head text-[15px] font-semibold">Cobros por método</h2>
      <DonutChart total={collectedTotal} unit="cobrado" segments={segments} totalSize="sm" />
      <p className="mt-4 border-t border-line-soft pt-3.5 text-[11.5px] text-sub">
        Solo lectura: un cobro se registra al pagar una factura en Cuentas y facturas.
      </p>
    </Card>
  )
}
