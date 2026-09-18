import type { ListPage } from '@/hooks/use-list-query'
import { matchesSearch } from '@/lib/matches-search'
import { paginateRows } from '@/lib/paginate-rows'
import type { GroomingListQuery, GroomingPreset, GroomingService } from '../grooming.schema'

const GROOMING_SERVICES: GroomingService[] = [
  { id: 'grm-1', patientName: 'Luna', ownerName: 'Carolina Ríos', serviceName: 'Baño completo', stylistName: 'Sofía Mena', checkInTime: '08:45', status: 'pending' },
  { id: 'grm-2', patientName: 'Nala', ownerName: 'Jorge Paredes', serviceName: 'Corte + baño', stylistName: 'David Coro', checkInTime: '09:30', status: 'in-progress' },
  { id: 'grm-3', patientName: 'Toby', ownerName: 'Andrés Lema', serviceName: 'Baño medicado', stylistName: 'Sofía Mena', checkInTime: '08:10', status: 'finished' },
  { id: 'grm-4', patientName: 'Coco', ownerName: 'Paula Andrade', serviceName: 'Corte de uñas', stylistName: 'David Coro', checkInTime: '07:50', status: 'delivered' },
  { id: 'grm-5', patientName: 'Bruno', ownerName: 'Gabriela Montes', serviceName: 'Deslanado', stylistName: 'Sofía Mena', checkInTime: '10:05', status: 'pending' },
  { id: 'grm-6', patientName: 'Pelusa', ownerName: 'Lucía Benítez', serviceName: 'Corte de raza', stylistName: 'David Coro', checkInTime: '10:20', status: 'pending' },
  { id: 'grm-7', patientName: 'Rex', ownerName: 'Ricardo Guamán', serviceName: 'Baño completo', stylistName: 'Sofía Mena', checkInTime: '09:15', status: 'in-progress' },
  { id: 'grm-8', patientName: 'Mía', ownerName: 'Diego Carrión', serviceName: 'Limpieza de oídos', stylistName: 'David Coro', checkInTime: '08:30', status: 'finished' },
  { id: 'grm-9', patientName: 'Canela', ownerName: 'Lucía Benítez', serviceName: 'Baño antipulgas', stylistName: 'Sofía Mena', checkInTime: '08:00', status: 'delivered' },
  { id: 'grm-10', patientName: 'Thor', ownerName: 'Fernando Ortiz', serviceName: 'Corte + baño', stylistName: 'David Coro', checkInTime: '07:40', status: 'delivered' },
  { id: 'grm-11', patientName: 'Chispa', ownerName: 'Sofía Villacís', serviceName: 'Corte de uñas', stylistName: 'Sofía Mena', checkInTime: '10:40', status: 'pending' },
  { id: 'grm-12', patientName: 'Kiwi', ownerName: 'Elena Buitrón', serviceName: 'Baño completo', stylistName: 'David Coro', checkInTime: '09:50', status: 'finished' },
]

function matchesPreset(service: GroomingService, preset: GroomingPreset): boolean {
  const presetRules: Record<GroomingPreset, boolean> = {
    undelivered: service.status !== 'delivered',
    delivered: service.status === 'delivered',
  }

  return presetRules[preset]
}

function filterGroomingServices({ search, filters }: GroomingListQuery): GroomingService[] {
  return GROOMING_SERVICES.filter(
    (service) =>
      matchesSearch(search, [service.patientName, service.ownerName]) &&
      (!filters.status || service.status === filters.status) &&
      (!filters.preset || matchesPreset(service, filters.preset as GroomingPreset)),
  )
}

export function resolveGroomingList(query: GroomingListQuery): Promise<ListPage<GroomingService>> {
  return Promise.resolve().then(() => paginateRows(filterGroomingServices(query), query))
}
