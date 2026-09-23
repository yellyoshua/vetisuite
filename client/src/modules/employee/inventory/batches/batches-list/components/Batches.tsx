import { PlusIcon, SearchIcon } from 'lucide-react'
import useQueryParams from '@/hooks/use-query-params'
import CustomPage, { CustomPageContainer } from '@/components/CustomPage/CustomPage'
import CustomTable from '@/components/CustomTable/CustomTable'
import FilterChips from '@/components/FilterChips/FilterChips'
import OptionSelect, { type SelectOption } from '@/components/OptionSelect/OptionSelect'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { BADGE_TONE_CLASS_NAMES } from '@/constants/badge-tones'
import { EXPIRY_STATUS_LABELS, EXPIRY_STATUS_TONES, PRODUCT_CATEGORY_LABELS } from '@/constants/inventory'
import { formatDate } from '@/lib/date'
import type { Batch } from '@/modules/employee/inventory/batches/batches.schema'

type BatchesProps = {
  batches: Batch[]
}

const STATUS_OPTIONS: SelectOption[] = [
  { value: '', label: 'Todos los lotes' },
  { value: 'valid', label: 'Vigentes' },
  { value: 'expiring', label: 'Por caducar' },
  { value: 'expired', label: 'Vencidos' },
]

const PRESET_OPTIONS: SelectOption[] = [
  { value: '', label: 'Todos' },
  { value: 'expiring', label: 'Por caducar' },
  { value: 'expired', label: 'Vencidos' },
]

export default function Batches({ batches }: BatchesProps) {
  const { nextPage, prevPage, search, changeQuery, query } = useQueryParams()
  const currentPage = Number(query.page) || 1

  return (
    <CustomPage
      title="Lotes y caducidad"
      description="Cada ingreso entra como lote con su fecha de caducidad; el stock del catálogo es la suma de los lotes vigentes."
      actions={
        <>
          <Button disabled>
            <PlusIcon /> Ingresar lote
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
              aria-label="Buscar lotes"
              placeholder="Busca por producto o lote…"
              defaultValue={query.search || ''}
              onChange={({ target }) => search(target.value)}
              className="w-full pl-10 pr-4 py-2 bg-background border border-input rounded-lg text-foreground"
            />
          </div>
          <OptionSelect label="Estado del lote" value={query.status || ''} options={STATUS_OPTIONS} onChange={(status) => changeQuery({ status, page: null })} />
        </div>
        <FilterChips label="Filtros rápidos de lotes" options={PRESET_OPTIONS} value={query.status || ''} onChange={(status) => changeQuery({ status, page: null })} />
      </CustomPageContainer>

      <CustomTable dataSize={batches.length} currentPage={currentPage} nextPage={nextPage} prevPage={prevPage}>
        <CustomTable.Thead>
          <CustomTable.TableRow header={true}>
            <CustomTable.TheadItem>Producto</CustomTable.TheadItem>
            <CustomTable.TheadItem>Lote</CustomTable.TheadItem>
            <CustomTable.TheadItem>Cantidad</CustomTable.TheadItem>
            <CustomTable.TheadItem>Ingreso</CustomTable.TheadItem>
            <CustomTable.TheadItem>Caducidad</CustomTable.TheadItem>
            <CustomTable.TheadItem>Estado</CustomTable.TheadItem>
          </CustomTable.TableRow>
        </CustomTable.Thead>
        <CustomTable.TBody>
          {batches.map((batch) => (
            <CustomTable.TableRow key={batch.id}>
              <CustomTable.TBodyItem><span className="flex flex-col"><span className="font-medium">{batch.productName}</span><span className="text-sub">{PRODUCT_CATEGORY_LABELS[batch.category]}</span></span></CustomTable.TBodyItem>
              <CustomTable.TBodyItem>{batch.code}</CustomTable.TBodyItem>
              <CustomTable.TBodyItem>{batch.quantity}</CustomTable.TBodyItem>
              <CustomTable.TBodyItem>{formatDate(`${batch.receivedAt}T00:00:00`, { day: '2-digit', month: 'short', year: 'numeric' })}</CustomTable.TBodyItem>
              <CustomTable.TBodyItem>{formatDate(`${batch.expiresAt}T00:00:00`, { day: '2-digit', month: 'short', year: 'numeric' })}</CustomTable.TBodyItem>
              <CustomTable.TBodyItem><Badge variant="outline" className={BADGE_TONE_CLASS_NAMES[EXPIRY_STATUS_TONES[batch.status]]}>{EXPIRY_STATUS_LABELS[batch.status]}</Badge></CustomTable.TBodyItem>
            </CustomTable.TableRow>
          ))}
        </CustomTable.TBody>
      </CustomTable>
    </CustomPage>
  )
}
