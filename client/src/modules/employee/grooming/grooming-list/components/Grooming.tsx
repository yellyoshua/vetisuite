import { PlusIcon, SearchIcon } from 'lucide-react'
import useQueryParams from '@/hooks/use-query-params'
import CustomPage, { CustomPageContainer } from '@/components/CustomPage/CustomPage'
import CustomTable from '@/components/CustomTable/CustomTable'
import FilterChips from '@/components/FilterChips/FilterChips'
import OptionSelect, { type SelectOption } from '@/components/OptionSelect/OptionSelect'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { BADGE_TONE_CLASS_NAMES } from '@/constants/badge-tones'
import { GROOMING_STATUS_LABELS, GROOMING_STATUS_TONES } from '@/constants/grooming'
import { formatDate } from '@/lib/date'
import type { GroomingService } from '@/modules/employee/grooming/grooming.schema'

type GroomingProps = {
  services: GroomingService[]
}

const STATUS_OPTIONS: SelectOption[] = [
  { value: '', label: 'Todos los estados' },
  { value: 'pending', label: 'Pendiente' },
  { value: 'in-progress', label: 'Proceso' },
  { value: 'finished', label: 'Terminado' },
  { value: 'delivered', label: 'Entregado' },
]

const PRESET_OPTIONS: SelectOption[] = [
  { value: '', label: 'Todo' },
  { value: 'undelivered', label: 'Sin entregar' },
  { value: 'delivered', label: 'Entregados' },
]

export default function Grooming({ services }: GroomingProps) {
  const { nextPage, prevPage, search, changeQuery, query } = useQueryParams()
  const currentPage = Number(query.page) || 1

  return (
    <CustomPage
      title="Peluquería y Estética"
      description="Servicios de estética del día, con su responsable y estado."
      actions={
        <Button disabled>
          <PlusIcon /> Nuevo check-in
        </Button>
      }
    >
      <CustomPageContainer className="space-y-3">
        <div className="flex flex-col gap-2 sm:flex-row">
          <div className="relative flex-1">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <input
              type="text"
              aria-label="Buscar servicios"
              placeholder="Busca por paciente o dueño…"
              defaultValue={query.search || ''}
              onChange={({ target }) => search(target.value)}
              className="w-full pl-10 pr-4 py-2 bg-background border border-input rounded-lg text-foreground"
            />
          </div>
          <OptionSelect label="Estado" value={query.status || ''} options={STATUS_OPTIONS} onChange={(status) => changeQuery({ status, page: null })} />
        </div>
        <FilterChips label="Filtros rápidos de peluquería" options={PRESET_OPTIONS} value={query.preset || ''} onChange={(preset) => changeQuery({ preset, page: null })} />
      </CustomPageContainer>

      <CustomTable dataSize={services.length} currentPage={currentPage} nextPage={nextPage} prevPage={prevPage}>
        <CustomTable.Thead>
          <CustomTable.TableRow header={true}>
            <CustomTable.TheadItem>Paciente</CustomTable.TheadItem>
            <CustomTable.TheadItem>Servicio</CustomTable.TheadItem>
            <CustomTable.TheadItem>Estilista</CustomTable.TheadItem>
            <CustomTable.TheadItem>Ingreso</CustomTable.TheadItem>
            <CustomTable.TheadItem>Estado</CustomTable.TheadItem>
          </CustomTable.TableRow>
        </CustomTable.Thead>
        <CustomTable.TBody>
          {services.map((service) => (
            <CustomTable.TableRow key={service.id}>
              <CustomTable.TBodyItem><span className="flex flex-col"><span className="font-medium">{service.patientName}</span><span className="text-sub">{service.ownerName}</span></span></CustomTable.TBodyItem>
              <CustomTable.TBodyItem>{service.serviceName}</CustomTable.TBodyItem>
              <CustomTable.TBodyItem>{service.stylistName}</CustomTable.TBodyItem>
              <CustomTable.TBodyItem>{service.checkInTime ? formatDate(service.checkInTime, { hour: '2-digit', minute: '2-digit' }) : '—'}</CustomTable.TBodyItem>
              <CustomTable.TBodyItem><Badge variant="outline" className={BADGE_TONE_CLASS_NAMES[GROOMING_STATUS_TONES[service.status]]}>{GROOMING_STATUS_LABELS[service.status]}</Badge></CustomTable.TBodyItem>
            </CustomTable.TableRow>
          ))}
        </CustomTable.TBody>
      </CustomTable>
    </CustomPage>
  )
}
