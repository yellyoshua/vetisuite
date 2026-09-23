import type { Params } from 'react-router'
import type { ResolverSearch, SearchValue } from '@/hooks/use-resolver'
import { matchesSearch } from '@/lib/matches-search'
import { pageRows } from '@/lib/page-rows'
import type { Movement } from '@/modules/employee/inventory/movements/movements.schema'

const MOVEMENTS: Movement[] = [
  { id: 'mov-1', productName: 'Vacuna Antirrábica', batchCode: 'L-2607-A', type: 'out', quantity: 1, destination: 'Visita de Max · Atención', date: '2026-09-06', time: '09:05', responsibleName: 'Dra. María Torres' },
  { id: 'mov-2', productName: 'Shampoo dermatológico', batchCode: 'L-2801-A', type: 'out', quantity: 1, destination: 'Baño medicado de Toby · Estética', date: '2026-09-06', time: '08:15', responsibleName: 'Sofía Mena' },
  { id: 'mov-3', productName: 'Shampoo dermatológico', batchCode: 'L-2801-A', type: 'in', quantity: 24, destination: 'Compra a Provet S.A.', date: '2026-09-05', time: '16:40', responsibleName: 'Ramiro Guerra' },
  { id: 'mov-4', productName: 'Jeringas 5 ml', batchCode: 'L-2705-D', type: 'out', quantity: 4, destination: 'Toma de muestras · Laboratorio', date: '2026-09-05', time: '10:10', responsibleName: 'Lab. interno' },
  { id: 'mov-5', productName: 'Amoxicilina 250 mg', batchCode: 'L-2512-C', type: 'write-off', quantity: 14, destination: 'Lote vencido · descarte', date: '2026-09-04', time: '18:00', responsibleName: 'Ramiro Guerra' },
  { id: 'mov-6', productName: 'Meloxicam 1.5 mg/ml', batchCode: 'L-2703-B', type: 'out', quantity: 1, destination: 'Visita de Rocky · Atención', date: '2026-09-04', time: '11:20', responsibleName: 'Dr. Andrés Vela' },
  { id: 'mov-7', productName: 'Vacuna Triple felina', batchCode: 'L-2610-C', type: 'out', quantity: 1, destination: 'Visita de Luna · Atención', date: '2026-09-03', time: '15:40', responsibleName: 'Dra. Lucía Páez' },
  { id: 'mov-8', productName: 'Pipeta antipulgas perro mediano', batchCode: 'L-2702-A', type: 'in', quantity: 12, destination: 'Compra a Provet S.A.', date: '2026-09-03', time: '09:30', responsibleName: 'Ramiro Guerra' },
  { id: 'mov-9', productName: 'Colonia para mascotas', batchCode: 'L-2803-A', type: 'out', quantity: 1, destination: 'Corte + baño de Nala · Estética', date: '2026-09-02', time: '10:05', responsibleName: 'David Coro' },
  { id: 'mov-10', productName: 'Desparasitante interno', batchCode: 'L-2609-A', type: 'write-off', quantity: 3, destination: 'Empaque dañado · descarte', date: '2026-09-01', time: '17:30', responsibleName: 'Ramiro Guerra' },
  { id: 'mov-11', productName: 'Alimento renal 2 kg', batchCode: 'L-2611-A', type: 'in', quantity: 12, destination: 'Compra a Nutrican Cía. Ltda.', date: '2026-08-30', time: '12:00', responsibleName: 'Ramiro Guerra' },
  { id: 'mov-12', productName: 'Jeringas 5 ml', batchCode: 'L-2705-D', type: 'out', quantity: 2, destination: 'Toma de muestras · Laboratorio', date: '2026-08-29', time: '09:45', responsibleName: 'Lab. interno' },
]

function resolveMovements(search: ResolverSearch): Promise<Movement[]> {
  const type = asText(search.type)

  return Promise.resolve().then(() =>
    pageRows(
      MOVEMENTS.filter(
        (movement) =>
          matchesSearch(asText(search.search), [movement.productName, movement.destination]) &&
          (!type || movement.type === type),
      ),
      search.page,
    ),
  )
}

function asText(value: SearchValue | undefined): string {
  return value === undefined || value === null ? '' : String(value)
}

export default {
  movements: (_params: Readonly<Params>, search: ResolverSearch) => resolveMovements(search),
}
