import { VISIT_NEXT_STATUS, VISIT_STATUS_VALUES } from '@/constants/visits'
import { matchesSearch } from '@/lib/matches-search'
import { NotFoundError } from '@/lib/not-found-error'
import { parseInput } from '@/lib/parse-input'
import { visitAdvanceSchema, type Visit, type VisitAdvanceInput, type VisitBoard, type VisitBoardQuery } from '../visits.schema'

const STAFF_NAMES = ['Dra. María Torres', 'Dr. Andrés Vela', 'Dra. Lucía Páez', 'Sofía Mena', 'David Coro', 'Lab. interno']

const VISITS: Visit[] = [
  { id: 'vis-1', type: 'ambulatory', patientName: 'Kiwi', ownerName: 'Elena Buitrón', service: 'Consulta general', staffName: 'Dra. María Torres', time: '09:20', status: 'in-progress' },
  { id: 'vis-2', type: 'ambulatory', patientName: 'Max', ownerName: 'Carolina Ríos', service: 'Vacunación anual', staffName: 'Dra. Lucía Páez', time: '09:00', status: 'done' },
  { id: 'vis-3', type: 'ambulatory', patientName: 'Rocky', ownerName: 'Marco Salazar', service: 'Control dermatológico', staffName: 'Dr. Andrés Vela', time: '10:05', status: 'pending' },
  { id: 'vis-4', type: 'ambulatory', patientName: 'Simba', ownerName: 'Paula Andrade', service: 'Desparasitación', staffName: 'Dra. María Torres', time: '11:15', status: 'pending' },
  { id: 'vis-5', type: 'grooming', patientName: 'Luna', ownerName: 'Carolina Ríos', service: 'Baño completo', staffName: 'Sofía Mena', time: '08:45', status: 'pending' },
  { id: 'vis-6', type: 'grooming', patientName: 'Nala', ownerName: 'Jorge Paredes', service: 'Corte + baño', staffName: 'David Coro', time: '09:30', status: 'in-progress' },
  { id: 'vis-7', type: 'grooming', patientName: 'Toby', ownerName: 'Andrés Lema', service: 'Baño medicado', staffName: 'Sofía Mena', time: '08:10', status: 'done' },
  { id: 'vis-8', type: 'laboratory', patientName: 'Rocky', ownerName: 'Marco Salazar', service: 'Hemograma completo', staffName: 'Lab. externo', time: '10:20', status: 'pending' },
  { id: 'vis-9', type: 'laboratory', patientName: 'Kiwi', ownerName: 'Elena Buitrón', service: 'Perfil renal', staffName: 'Lab. interno', time: '09:40', status: 'in-progress' },
  { id: 'vis-10', type: 'laboratory', patientName: 'Max', ownerName: 'Carolina Ríos', service: 'Coproparasitario', staffName: 'Lab. interno', time: '09:05', status: 'done' },
]

function filterVisits({ scope, search, staff }: VisitBoardQuery): Visit[] {
  return VISITS.filter(
    (visit) =>
      (scope === 'all' || visit.type === scope) &&
      (!staff || visit.staffName === staff) &&
      matchesSearch(search, [visit.patientName, visit.ownerName]),
  )
}

function findVisit(visitId: string): Visit {
  const visit = VISITS.find((candidate) => candidate.id === visitId)
  if (!visit) {
    throw new NotFoundError('No encontramos la visita que quieres avanzar.')
  }

  return visit
}

export function resolveVisitBoard(query: VisitBoardQuery): Promise<VisitBoard> {
  return Promise.resolve().then(() => {
    const visits = filterVisits(query)
    const billableCount = visits.filter((visit) => visit.status === 'done').length

    return {
      columns: VISIT_STATUS_VALUES.map((status) => ({
        status,
        visits: visits.filter((visit) => visit.status === status),
      })),
      staffNames: STAFF_NAMES,
      summary: { openCount: visits.length - billableCount, billableCount },
    }
  })
}

export function advanceVisit(input: VisitAdvanceInput): Promise<Visit> {
  return Promise.resolve().then(() => {
    const visit = findVisit(parseInput(visitAdvanceSchema, input).visitId)
    if (visit.status === 'done') {
      throw new Error('La visita ya está finalizada: se cobra desde Facturación.')
    }
    const advancedVisit: Visit = { ...visit, status: VISIT_NEXT_STATUS[visit.status] }
    VISITS.splice(VISITS.indexOf(visit), 1, advancedVisit)

    return advancedVisit
  })
}
