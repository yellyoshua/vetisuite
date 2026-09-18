import DataTable, { type DataTableColumn } from '@/components/DataTable/DataTable'
import DataTableToolbar, { type ToolbarSelect } from '@/components/DataTable/DataTableToolbar'
import IdentityCell from '@/components/DataTable/IdentityCell'
import RowActions from '@/components/DataTable/RowActions'
import PageHeader from '@/components/PageHeader'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import Icon from '@/components/ui/Icon'
import { APPOINTMENT_STATUS_LABELS, APPOINTMENT_STATUS_TONES } from '@/constants/appointments'
import useListQuery from '@/hooks/use-list-query'
import useResolver from '@/hooks/use-resolver'
import type { Appointment, AppointmentDoctor, AppointmentFilterKey } from '../appointments.schema'
import AppointmentsDayNav from './components/AppointmentsDayNav'
import { resolveAppointmentsAgenda, resolveAppointmentsList } from './resolvers'

const FILTER_KEYS: AppointmentFilterKey[] = ['status', 'doctor', 'date']

const TABLE_MIN_WIDTH = 960

const DAY_EMPTY_TITLE = 'Sin citas para este día'

const DAY_EMPTY_HINT = 'Cambia de fecha o crea una cita nueva.'

const STATUS_SELECT: ToolbarSelect<AppointmentFilterKey> = {
  key: 'status',
  label: 'Estado',
  options: [
    { value: '', label: 'Todos los estados' },
    { value: 'pending', label: 'Pendientes' },
    { value: 'confirmed', label: 'Confirmadas' },
    { value: 'completed', label: 'Completadas' },
    { value: 'cancelled', label: 'Canceladas' },
  ],
}

const COLUMNS: DataTableColumn<Appointment>[] = [
  {
    key: 'patient',
    header: 'Paciente',
    render: (appointment) => <IdentityCell title={appointment.patientName} subtitle={appointment.ownerName} />,
  },
  { key: 'time', header: 'Hora', render: (appointment) => <span className="font-semibold">{appointment.time}</span> },
  { key: 'reason', header: 'Motivo', render: (appointment) => appointment.reason },
  { key: 'doctor', header: 'Médico', render: (appointment) => appointment.doctorName },
  {
    key: 'status',
    header: 'Estado',
    render: (appointment) => (
      <Badge tone={APPOINTMENT_STATUS_TONES[appointment.status]}>{APPOINTMENT_STATUS_LABELS[appointment.status]}</Badge>
    ),
  },
  {
    key: 'actions',
    header: 'Acciones',
    align: 'right',
    isHeaderHidden: true,
    render: (appointment) => <RowActions subject={`la cita de ${appointment.patientName}`} />,
  },
]

function buildDoctorSelect(doctors: AppointmentDoctor[]): ToolbarSelect<AppointmentFilterKey> {
  return {
    key: 'doctor',
    label: 'Médico',
    options: [
      { value: '', label: 'Todos los médicos' },
      ...doctors.map((doctor) => ({ value: doctor.id, label: doctor.name })),
    ],
  }
}

export default function AppointmentsListPage() {
  const { query, setPage, setSearch, setFilter } = useListQuery(FILTER_KEYS)
  const agenda = useResolver(resolveAppointmentsAgenda, { date: query.filters.date })
  const { data, error, isLoading } = useResolver(resolveAppointmentsList, query)
  const hasActiveFilters = Boolean(query.search || query.filters.status || query.filters.doctor)

  return (
    <>
      <PageHeader
        title="Citas"
        description="Un médico no puede tener dos citas en el mismo horario. Confirmar o cancelar es un cambio de estado."
        actions={
          <>
            <Button variant="ghost" isDisabled>
              <Icon name="calendar-days" size={14} /> Ver calendario
            </Button>
            <Button isDisabled>
              <Icon name="plus" size={14} /> Nueva cita
            </Button>
          </>
        }
      />
      <AppointmentsDayNav agenda={agenda.data} error={agenda.error} onDateChange={(date) => setFilter('date', date)} />
      <DataTableToolbar
        searchPlaceholder="Busca por paciente o dueño…"
        search={query.search}
        selects={[STATUS_SELECT, buildDoctorSelect(agenda.data?.doctors ?? [])]}
        filters={query.filters}
        onSearchChange={setSearch}
        onFilterChange={setFilter}
      />
      <DataTable
        label="Citas del día"
        columns={COLUMNS}
        data={data}
        error={error}
        isLoading={isLoading}
        pageSize={query.pageSize}
        minWidth={TABLE_MIN_WIDTH}
        rowKey={(appointment) => appointment.id}
        onPageChange={setPage}
        emptyTitle={hasActiveFilters ? undefined : DAY_EMPTY_TITLE}
        emptyHint={hasActiveFilters ? undefined : DAY_EMPTY_HINT}
      />
    </>
  )
}
