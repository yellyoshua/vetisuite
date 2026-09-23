import { DownloadIcon, PlusIcon, SearchIcon } from 'lucide-react'
import useQueryParams from '@/hooks/use-query-params'
import CustomPage, { CustomPageContainer } from '@/components/CustomPage/CustomPage'
import CustomTable from '@/components/CustomTable/CustomTable'
import FilterChips from '@/components/FilterChips/FilterChips'
import OptionSelect, { type SelectOption } from '@/components/OptionSelect/OptionSelect'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { BADGE_TONE_CLASS_NAMES } from '@/constants/badge-tones'
import { MOVEMENT_TYPE_LABELS, MOVEMENT_TYPE_SIGNS, MOVEMENT_TYPE_TONES } from '@/constants/inventory'
import { formatDate } from '@/lib/date'
import type { Movement } from '@/modules/employee/inventory/movements/movements.schema'

type MovementsProps = {
  movements: Movement[]
}

const TYPE_OPTIONS: SelectOption[] = [
  { value: '', label: 'Todos los movimientos' },
  { value: 'in', label: 'Entradas' },
  { value: 'out', label: 'Salidas' },
  { value: 'write-off', label: 'Bajas' },
]

const PRESET_OPTIONS: SelectOption[] = [
  { value: '', label: 'Todo' },
  { value: 'in', label: 'Entradas' },
  { value: 'out', label: 'Salidas' },
  { value: 'write-off', label: 'Bajas' },
]

export default function Movements({ movements }: MovementsProps) {
  const { nextPage, prevPage, search, changeQuery, query } = useQueryParams()
  const currentPage = Number(query.page) || 1

  return (
    <CustomPage
      title="Movimientos"
      description="Entradas y salidas. Una salida a una visita crea el cargo que Facturación cobrará después."
      actions={
        <>
          <Button variant="ghost" disabled>
            <DownloadIcon /> Exportar
          </Button>
          <Button disabled>
            <PlusIcon /> Nuevo movimiento
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
              aria-label="Buscar movimientos"
              placeholder="Busca por producto o destino…"
              defaultValue={query.search || ''}
              onChange={({ target }) => search(target.value)}
              className="w-full pl-10 pr-4 py-2 bg-background border border-input rounded-lg text-foreground"
            />
          </div>
          <OptionSelect label="Tipo de movimiento" value={query.type || ''} options={TYPE_OPTIONS} onChange={(type) => changeQuery({ type, page: null })} />
        </div>
        <FilterChips label="Filtros rápidos de movimientos" options={PRESET_OPTIONS} value={query.type || ''} onChange={(type) => changeQuery({ type, page: null })} />
      </CustomPageContainer>

      <CustomTable dataSize={movements.length} currentPage={currentPage} nextPage={nextPage} prevPage={prevPage}>
        <CustomTable.Thead>
          <CustomTable.TableRow header={true}>
            <CustomTable.TheadItem>Producto</CustomTable.TheadItem>
            <CustomTable.TheadItem>Movimiento</CustomTable.TheadItem>
            <CustomTable.TheadItem>Cantidad</CustomTable.TheadItem>
            <CustomTable.TheadItem>Destino</CustomTable.TheadItem>
            <CustomTable.TheadItem>Fecha</CustomTable.TheadItem>
            <CustomTable.TheadItem>Responsable</CustomTable.TheadItem>
          </CustomTable.TableRow>
        </CustomTable.Thead>
        <CustomTable.TBody>
          {movements.map((movement) => (
            <CustomTable.TableRow key={movement.id}>
              <CustomTable.TBodyItem><span className="flex flex-col"><span className="font-medium">{movement.productName}</span><span className="text-sub">{movement.batchCode}</span></span></CustomTable.TBodyItem>
              <CustomTable.TBodyItem><Badge variant="outline" className={BADGE_TONE_CLASS_NAMES[MOVEMENT_TYPE_TONES[movement.type]]}>{MOVEMENT_TYPE_LABELS[movement.type]}</Badge></CustomTable.TBodyItem>
              <CustomTable.TBodyItem>{MOVEMENT_TYPE_SIGNS[movement.type]}{movement.quantity}</CustomTable.TBodyItem>
              <CustomTable.TBodyItem>{movement.destination}</CustomTable.TBodyItem>
              <CustomTable.TBodyItem>{formatDate(`${movement.date}T00:00:00`, { day: '2-digit', month: 'short', year: 'numeric' })} · {movement.time}</CustomTable.TBodyItem>
              <CustomTable.TBodyItem>{movement.responsibleName}</CustomTable.TBodyItem>
            </CustomTable.TableRow>
          ))}
        </CustomTable.TBody>
      </CustomTable>
    </CustomPage>
  )
}
