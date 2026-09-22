import DataTable, { type DataTableColumn } from '@/components/DataTable/DataTable'
import DataTableToolbar, { type FilterOption, type ToolbarSelect } from '@/components/DataTable/DataTableToolbar'
import FilterPresets from '@/components/DataTable/FilterPresets'
import IdentityCell from '@/components/DataTable/IdentityCell'
import RowActions from '@/components/DataTable/RowActions'
import PageHeader from '@/components/PageHeader'
import Badge from '@/components/legacy-ui/Badge'
import Button from '@/components/legacy-ui/Button'
import Icon from '@/components/legacy-ui/Icon'
import { CLINIC_RECORD_STATUS_LABELS, CLINIC_RECORD_STATUS_TONES } from '@/constants/clinic'
import useListQuery from '@/hooks/use-list-query'
import useResolver from '@/hooks/legacy/use-resolver'
import { formatDate } from '@/lib/format-date'
import type { ClinicRecord, ClinicRecordFilterKey } from '../clinic.schema'
import { resolveClinicRecordsList } from './resolvers'

const FILTER_KEYS: ClinicRecordFilterKey[] = ['kind', 'preset']

const TABLE_MIN_WIDTH = 980

const KIND_SELECT: ToolbarSelect<ClinicRecordFilterKey> = {
  key: 'kind',
  label: 'Tipo de registro',
  options: [
    { value: '', label: 'Todo' },
    { value: 'consultation', label: 'Consultas' },
    { value: 'lab-order', label: 'Órdenes de laboratorio' },
    { value: 'prescription', label: 'Recetas' },
  ],
}

const PRESET_OPTIONS: FilterOption[] = [
  { value: '', label: 'Todo' },
  { value: 'pending-result', label: 'Pendientes de resultado' },
  { value: 'resolved-today', label: 'Resueltas hoy' },
]

const COLUMNS: DataTableColumn<ClinicRecord>[] = [
  {
    key: 'patient',
    header: 'Paciente',
    render: (record) => <IdentityCell title={record.patientName} subtitle={record.ownerName} />,
  },
  { key: 'kind', header: 'Tipo', render: (record) => record.title },
  { key: 'date', header: 'Fecha', render: (record) => `${formatDate(record.date)} · ${record.time}` },
  { key: 'responsible', header: 'Responsable', render: (record) => record.responsible },
  {
    key: 'status',
    header: 'Estado',
    render: (record) => (
      <Badge tone={CLINIC_RECORD_STATUS_TONES[record.status]}>{CLINIC_RECORD_STATUS_LABELS[record.status]}</Badge>
    ),
  },
  {
    key: 'actions',
    header: 'Acciones',
    align: 'right',
    isHeaderHidden: true,
    render: (record) => <RowActions subject={`${record.title} de ${record.patientName}`} />,
  },
]

export default function ClinicListPage() {
  const { query, setPage, setSearch, setFilter } = useListQuery(FILTER_KEYS)
  const { data, error, isLoading } = useResolver(resolveClinicRecordsList, query)

  return (
    <>
      <PageHeader
        title="Clínica y Laboratorio"
        description="Expediente médico, órdenes de laboratorio y recetas."
        actions={
          <Button isDisabled>
            <Icon name="plus" size={14} /> Nueva orden
          </Button>
        }
      />
      <DataTableToolbar
        searchPlaceholder="Busca por paciente u orden…"
        search={query.search}
        selects={[KIND_SELECT]}
        filters={query.filters}
        onSearchChange={setSearch}
        onFilterChange={setFilter}
      />
      <FilterPresets
        label="Filtros rápidos de clínica"
        presets={PRESET_OPTIONS}
        activeValue={query.filters.preset}
        count={data && { shown: data.rows.length, total: data.total }}
        onChange={(preset) => setFilter('preset', preset)}
      />
      <DataTable
        label="Clínica y Laboratorio"
        columns={COLUMNS}
        data={data}
        error={error}
        isLoading={isLoading}
        pageSize={query.pageSize}
        minWidth={TABLE_MIN_WIDTH}
        rowKey={(record) => record.id}
        onPageChange={setPage}
      />
    </>
  )
}
