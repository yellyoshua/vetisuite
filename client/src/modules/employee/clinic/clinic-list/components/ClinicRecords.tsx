import { PlusIcon, SearchIcon } from 'lucide-react'
import useQueryParams from '@/hooks/use-query-params'
import CustomPage, { CustomPageContainer } from '@/components/CustomPage/CustomPage'
import CustomTable from '@/components/CustomTable/CustomTable'
import FilterChips from '@/components/FilterChips/FilterChips'
import OptionSelect, { type SelectOption } from '@/components/OptionSelect/OptionSelect'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { BADGE_TONE_CLASS_NAMES } from '@/constants/badge-tones'
import { CLINIC_RECORD_STATUS_LABELS, CLINIC_RECORD_STATUS_TONES } from '@/constants/clinic'
import { formatDate } from '@/lib/date'
import type { ClinicRecord } from '@/modules/employee/clinic/clinic.schema'

type ClinicRecordsProps = {
  records: ClinicRecord[]
}

const KIND_OPTIONS: SelectOption[] = [
  { value: '', label: 'Todo' },
  { value: 'consultation', label: 'Consultas' },
  { value: 'lab-order', label: 'Órdenes de laboratorio' },
  { value: 'prescription', label: 'Recetas' },
]

const PRESET_OPTIONS: SelectOption[] = [
  { value: '', label: 'Todo' },
  { value: 'pending-result', label: 'Pendientes de resultado' },
  { value: 'resolved-today', label: 'Resueltas hoy' },
]

export default function ClinicRecords({ records }: ClinicRecordsProps) {
  const { nextPage, prevPage, search, changeQuery, query } = useQueryParams()
  const currentPage = Number(query.page) || 1

  return (
    <CustomPage
      title="Clínica y Laboratorio"
      description="Expediente médico, órdenes de laboratorio y recetas."
      actions={
        <Button disabled>
          <PlusIcon /> Nueva orden
        </Button>
      }
    >
      <CustomPageContainer className="space-y-3">
        <div className="flex flex-col gap-2 sm:flex-row">
          <div className="relative flex-1">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <input
              type="text"
              aria-label="Buscar registros"
              placeholder="Busca por paciente u orden…"
              defaultValue={query.search || ''}
              onChange={({ target }) => search(target.value)}
              className="w-full pl-10 pr-4 py-2 bg-background border border-input rounded-lg text-foreground"
            />
          </div>
          <OptionSelect label="Tipo de registro" value={query.kind || ''} options={KIND_OPTIONS} onChange={(kind) => changeQuery({ kind, page: null })} />
        </div>
        <FilterChips label="Filtros rápidos de clínica" options={PRESET_OPTIONS} value={query.preset || ''} onChange={(preset) => changeQuery({ preset, page: null })} />
      </CustomPageContainer>

      <CustomTable dataSize={records.length} currentPage={currentPage} nextPage={nextPage} prevPage={prevPage}>
        <CustomTable.Thead>
          <CustomTable.TableRow header={true}>
            <CustomTable.TheadItem>Paciente</CustomTable.TheadItem>
            <CustomTable.TheadItem>Tipo</CustomTable.TheadItem>
            <CustomTable.TheadItem>Fecha</CustomTable.TheadItem>
            <CustomTable.TheadItem>Responsable</CustomTable.TheadItem>
            <CustomTable.TheadItem>Estado</CustomTable.TheadItem>
          </CustomTable.TableRow>
        </CustomTable.Thead>
        <CustomTable.TBody>
          {records.map((record) => (
            <CustomTable.TableRow key={record.id}>
              <CustomTable.TBodyItem><span className="flex flex-col"><span className="font-medium">{record.patientName}</span><span className="text-sub">{record.ownerName}</span></span></CustomTable.TBodyItem>
              <CustomTable.TBodyItem>{record.title}</CustomTable.TBodyItem>
              <CustomTable.TBodyItem>{formatDate(record.createdAt, { day: '2-digit', month: 'short', year: 'numeric' })} · {formatDate(record.createdAt, { hour: '2-digit', minute: '2-digit' })}</CustomTable.TBodyItem>
              <CustomTable.TBodyItem>{record.responsible}</CustomTable.TBodyItem>
              <CustomTable.TBodyItem><Badge variant="outline" className={BADGE_TONE_CLASS_NAMES[CLINIC_RECORD_STATUS_TONES[record.status]]}>{CLINIC_RECORD_STATUS_LABELS[record.status]}</Badge></CustomTable.TBodyItem>
            </CustomTable.TableRow>
          ))}
        </CustomTable.TBody>
      </CustomTable>
    </CustomPage>
  )
}
