import { NotFoundError } from '@/lib/not-found-error'
import { resolveScheduleExceptionIds } from '@/modals/ConfirmDialog/resolvers'
import { parseInput } from '@/lib/parse-input'
import {
  clinicAvailabilitySchema,
  type BookableService,
  type ClinicAvailability,
  type ClinicAvailabilityInput,
  type ScheduleException,
  type ScheduleDay,
  type Weekday,
} from '../appointments-clinics.schema'

function createWorkday(weekday: Weekday): ScheduleDay {
  return {
    weekday,
    isOpen: true,
    parallelCapacity: 2,
    blocks: [
      { from: '08:00', to: '13:00' },
      { from: '14:00', to: '18:00' },
    ],
  }
}

let clinicAvailability: ClinicAvailability = {
  days: [
    createWorkday('monday'),
    createWorkday('tuesday'),
    createWorkday('wednesday'),
    createWorkday('thursday'),
    createWorkday('friday'),
    { weekday: 'saturday', isOpen: true, parallelCapacity: 1, blocks: [{ from: '09:00', to: '14:00' }] },
    { weekday: 'sunday', isOpen: false, parallelCapacity: 1, blocks: [{ from: '09:00', to: '13:00' }] },
  ],
  bookingRules: {
    appointmentDuration: '30 minutos',
    bufferTime: '10 minutos',
    minimumNotice: '2 horas',
    bookingWindow: '30 días',
    freeCancellation: '12 horas antes',
    timeZone: 'America/Guayaquil',
  },
  bookingToggles: {
    portalBooking: true,
    autoConfirm: false,
    waitlist: true,
    requirePetData: true,
  },
  services: [
    { id: 'svc-1', name: 'Consulta general', area: 'Atención · ambulatorio', durationMinutes: 30, price: 25, isPortalVisible: true },
    { id: 'svc-2', name: 'Vacunación', area: 'Atención · ambulatorio', durationMinutes: 20, price: 30, isPortalVisible: true },
    { id: 'svc-3', name: 'Baño y corte', area: 'Estética', durationMinutes: 60, price: 22, isPortalVisible: true },
    { id: 'svc-4', name: 'Toma de muestras', area: 'Laboratorio', durationMinutes: 20, price: 17, isPortalVisible: false },
  ],
  exceptions: [
    { id: 'exc-1', date: '2026-10-12', reason: 'Feriado nacional', kind: 'closed' },
    {
      id: 'exc-2',
      date: '2026-11-02',
      reason: 'Feriado · guardia de urgencias',
      kind: 'reduced-hours',
      hours: { from: '10:00', to: '14:00' },
    },
    {
      id: 'exc-3',
      date: '2026-12-24',
      reason: 'Jornada corta',
      kind: 'reduced-hours',
      hours: { from: '08:00', to: '13:00' },
    },
  ],
}

function applyServiceChanges(
  services: BookableService[],
  changes: ClinicAvailabilityInput['services'],
): BookableService[] {
  return changes.map((change) => {
    const service = services.find((candidate) => candidate.id === change.id)
    if (!service) {
      throw new NotFoundError('No encontramos uno de los servicios que intentas guardar.')
    }

    return { ...service, ...change }
  })
}

export function resolveClinicAvailability(): Promise<ClinicAvailability> {
  return Promise.resolve().then(() => clinicAvailability)
}

export function resolveScheduleExceptions(): Promise<ScheduleException[]> {
  return resolveScheduleExceptionIds().then((existingIds) =>
    clinicAvailability.exceptions.filter((exception) => existingIds.includes(exception.id)),
  )
}

export function saveClinicAvailability(draft: ClinicAvailability): Promise<ClinicAvailability> {
  return Promise.resolve().then(() => {
    const input = parseInput(clinicAvailabilitySchema, draft)
    clinicAvailability = {
      ...clinicAvailability,
      ...input,
      services: applyServiceChanges(clinicAvailability.services, input.services),
    }

    return clinicAvailability
  })
}
