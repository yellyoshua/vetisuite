import { DownloadIcon, PlusIcon, SearchIcon } from 'lucide-react'
import useQueryParams from '@/hooks/use-query-params'
import CustomPage, { CustomPageContainer } from '@/components/CustomPage/CustomPage'
import CustomTable from '@/components/CustomTable/CustomTable'
import FilterChips from '@/components/FilterChips/FilterChips'
import OptionSelect, { type SelectOption } from '@/components/OptionSelect/OptionSelect'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { BADGE_TONE_CLASS_NAMES } from '@/constants/badge-tones'
import { BILLING_DOCUMENT_KIND_LABELS, BILLING_STATUS_LABELS, BILLING_STATUS_TONES } from '@/constants/billing'
import { formatCurrency } from '@/lib/format-currency'
import { formatDate } from '@/lib/date'
import type { BillingDocument } from '@/modules/employee/billing/billing.schema'

type BillingDocumentsProps = {
  documents: BillingDocument[]
}

const STATUS_OPTIONS: SelectOption[] = [
  { value: '', label: 'Todo' },
  { value: 'open', label: 'Cuentas abiertas' },
  { value: 'receivable', label: 'Por cobrar' },
  { value: 'paid', label: 'Pagadas' },
]

const PRESET_OPTIONS: SelectOption[] = [
  { value: '', label: 'Todo' },
  { value: 'open-account', label: 'Cuentas abiertas' },
  { value: 'overdue', label: 'Vencidas' },
  { value: 'paid-today', label: 'Pagadas hoy' },
]

function formatReference(billingDocument: BillingDocument): string {
  return `${BILLING_DOCUMENT_KIND_LABELS[billingDocument.kind]} ${billingDocument.number}`
}

function formatChargeCount(chargeCount: number): string {
  return `${chargeCount} ${chargeCount === 1 ? 'cargo' : 'cargos'}`
}

export default function BillingDocuments({ documents }: BillingDocumentsProps) {
  const { nextPage, prevPage, search, changeQuery, query } = useQueryParams()
  const currentPage = Number(query.page) || 1

  return (
    <CustomPage
      title="Cuentas y facturas"
      description="Cierre del cliente: los cargos que dejaron los módulos de atención se agrupan, se facturan y se cobran aquí."
      actions={
        <>
          <Button variant="ghost" disabled>
            <DownloadIcon /> Exportar
          </Button>
          <Button disabled>
            <PlusIcon /> Nueva factura
          </Button>
        </>
      }
    >
      <CustomPageContainer className="space-y-3">
        <div className="flex flex-col gap-2 sm:flex-row">
          <div className="relative flex-1">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <input
              type="text"
              aria-label="Buscar cuentas y facturas"
              placeholder="Busca por cliente o factura…"
              defaultValue={query.search || ''}
              onChange={({ target }) => search(target.value)}
              className="w-full pl-10 pr-4 py-2 bg-background border border-input rounded-lg text-foreground"
            />
          </div>
          <OptionSelect label="Estado" value={query.status || ''} options={STATUS_OPTIONS} onChange={(status) => changeQuery({ status, page: null })} />
        </div>
        <FilterChips label="Filtros rápidos de cuentas y facturas" options={PRESET_OPTIONS} value={query.preset || ''} onChange={(preset) => changeQuery({ preset, page: null })} />
      </CustomPageContainer>

      <CustomTable dataSize={documents.length} currentPage={currentPage} nextPage={nextPage} prevPage={prevPage}>
        <CustomTable.Thead>
          <CustomTable.TableRow header={true}>
            <CustomTable.TheadItem>Cliente</CustomTable.TheadItem>
            <CustomTable.TheadItem>Cargos</CustomTable.TheadItem>
            <CustomTable.TheadItem>Total</CustomTable.TheadItem>
            <CustomTable.TheadItem>Fecha</CustomTable.TheadItem>
            <CustomTable.TheadItem>Estado</CustomTable.TheadItem>
          </CustomTable.TableRow>
        </CustomTable.Thead>
        <CustomTable.TBody>
          {documents.map((billingDocument) => (
            <CustomTable.TableRow key={billingDocument.id}>
              <CustomTable.TBodyItem><span className="flex flex-col"><span className="font-medium">{billingDocument.clientName}</span><span className="text-sub">{formatReference(billingDocument)}</span></span></CustomTable.TBodyItem>
              <CustomTable.TBodyItem>{formatChargeCount(billingDocument.chargeCount)}</CustomTable.TBodyItem>
              <CustomTable.TBodyItem>{formatCurrency(billingDocument.total)}</CustomTable.TBodyItem>
              <CustomTable.TBodyItem>{formatDate(billingDocument.createdAt, { day: '2-digit', month: 'short', year: 'numeric' })}</CustomTable.TBodyItem>
              <CustomTable.TBodyItem><Badge variant="outline" className={BADGE_TONE_CLASS_NAMES[BILLING_STATUS_TONES[billingDocument.status]]}>{BILLING_STATUS_LABELS[billingDocument.status]}</Badge></CustomTable.TBodyItem>
            </CustomTable.TableRow>
          ))}
        </CustomTable.TBody>
      </CustomTable>
    </CustomPage>
  )
}
