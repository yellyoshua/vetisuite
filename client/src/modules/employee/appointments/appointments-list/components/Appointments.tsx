import { useMemo } from 'react'
import { CalendarDaysIcon, PlusIcon, SearchIcon } from 'lucide-react'
import useQueryParams from '@/hooks/use-query-params'
import CustomPage, { CustomPageContainer } from '@/components/CustomPage/CustomPage'
import CustomTable from '@/components/CustomTable/CustomTable'
import OptionSelect, { type SelectOption } from '@/components/OptionSelect/OptionSelect'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { APPOINTMENT_STATUS_LABELS, APPOINTMENT_STATUS_TONES } from '@/constants/appointments'
import { BADGE_TONE_CLASS_NAMES } from '@/constants/badge-tones'
import { formatDate } from '@/lib/date'
import type { Appointment, AppointmentsAgenda as AgendaType } from '@/modules/employee/appointments/appointments.schema'
import AppointmentsAgenda from './AppointmentsAgenda'

type AppointmentsProps = {
  agenda: AgendaType
  appointments: Appointment[]
}

const STATUS_OPTIONS: SelectOption[] = [
  { value: '', label: 'Todos los estados' },
  { value: 'pending', label: 'Pendientes' },
  { value: 'confirmed', label: 'Confirmadas' },
  { value: 'completed', label: 'Completadas' },
  { value: 'cancelled', label: 'Canceladas' },
]

export default function Appointments({ agenda, appointments }: AppointmentsProps) {
  const { nextPage, prevPage, search, changeQuery, query } = useQueryParams()
  const currentPage = Number(query.page) || 1

  const doctorOptions: SelectOption[] = useMemo(() => {
    const map = new Map<string, string>()
    for (const appointment of appointments) {
      if (appointment.vet) {
        map.set(appointment.vet.id, `${appointment.vet.firstName} ${appointment.vet.lastName}`)
      }
    }
    for (const doctor of agenda.doctors) {
      map.set(doctor.id, doctor.name)
    }

    return [
      { value: '', label: 'Todos los médicos' },
      ...Array.from(map.entries()).map(([id, label]) => ({ value: id, label })),
    ]
  }, [appointments, agenda.doctors])

  return (
    <CustomPage
      title="Citas"
      description="Un médico no puede tener dos citas en el mismo horario. Confirmar o cancelar es un cambio de estado."
      actions={
        <>
          <Button variant="ghost" disabled>
            <CalendarDaysIcon /> Ver calendario
          </Button>
          <Button disabled>
            <PlusIcon /> Nueva cita
          </Button>
        </>
      }
    >
      <CustomPageContainer className="space-y-3">
        <AppointmentsAgenda agenda={agenda} onDateChange={(date) => changeQuery({ date, page: null })} />
        <div className="flex flex-col gap-2 sm:flex-row">
          <div className="relative flex-1">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <input
              type="text"
              aria-label="Buscar citas"
              placeholder="Busca por motivo…"
              defaultValue={query.search || ''}
              onChange={({ target }) => search(target.value)}
              className="w-full pl-10 pr-4 py-2 bg-background border border-input rounded-lg text-foreground"
            />
          </div>
          <OptionSelect label="Estado" value={query.status || ''} options={STATUS_OPTIONS} onChange={(status) => changeQuery({ status, page: null })} />
          <OptionSelect label="Médico" value={query.doctor || ''} options={doctorOptions} onChange={(doctor) => changeQuery({ doctor, page: null })} />
        </div>
      </CustomPageContainer>

      <CustomTable dataSize={appointments.length} currentPage={currentPage} nextPage={nextPage} prevPage={prevPage}>
        <CustomTable.Thead>
          <CustomTable.TableRow header={true}>
            <CustomTable.TheadItem>Paciente</CustomTable.TheadItem>
            <CustomTable.TheadItem>Hora</CustomTable.TheadItem>
            <CustomTable.TheadItem>Motivo</CustomTable.TheadItem>
            <CustomTable.TheadItem>Médico</CustomTable.TheadItem>
            <CustomTable.TheadItem>Estado</CustomTable.TheadItem>
          </CustomTable.TableRow>
        </CustomTable.Thead>
        <CustomTable.TBody>
          {appointments.map((appointment) => (
            <CustomTable.TableRow key={appointment.id}>
              <CustomTable.TBodyItem className="font-medium">
                {appointment.patient.name}
              </CustomTable.TBodyItem>
              <CustomTable.TBodyItem className="font-semibold">
                {formatDate(appointment.startsAt, { hour: '2-digit', minute: '2-digit' })}
              </CustomTable.TBodyItem>
              <CustomTable.TBodyItem>{appointment.reason}</CustomTable.TBodyItem>
              <CustomTable.TBodyItem>
                {appointment.vet ? `${appointment.vet.firstName} ${appointment.vet.lastName}` : '—'}
              </CustomTable.TBodyItem>
              <CustomTable.TBodyItem>
                <Badge variant="outline" className={BADGE_TONE_CLASS_NAMES[APPOINTMENT_STATUS_TONES[appointment.status]]}>
                  {APPOINTMENT_STATUS_LABELS[appointment.status]}
                </Badge>
              </CustomTable.TBodyItem>
            </CustomTable.TableRow>
          ))}
        </CustomTable.TBody>
      </CustomTable>
    </CustomPage>
  )
}
