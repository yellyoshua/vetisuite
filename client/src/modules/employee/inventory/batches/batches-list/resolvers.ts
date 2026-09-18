import type { ListPage } from '@/hooks/use-list-query'
import { matchesSearch } from '@/lib/matches-search'
import { paginateRows } from '@/lib/paginate-rows'
import { getExpiryStatus } from '../../inventory.schema'
import type { Batch, BatchListQuery } from '../batches.schema'

type BatchRecord = Omit<Batch, 'status'>

const BATCHES: BatchRecord[] = [
  { id: 'bat-1', productName: 'Vacuna Antirrábica', category: 'vaccines', code: 'L-2607-A', quantity: 3, receivedAt: '2026-08-14', expiresAt: '2027-03-12' },
  { id: 'bat-2', productName: 'Amoxicilina 250 mg', category: 'medicines', code: 'L-2512-C', quantity: 14, receivedAt: '2026-02-02', expiresAt: '2026-08-01' },
  { id: 'bat-3', productName: 'Vacuna Séxtuple', category: 'vaccines', code: 'L-2609-B', quantity: 9, receivedAt: '2026-06-20', expiresAt: '2026-09-15' },
  { id: 'bat-4', productName: 'Alimento renal 2 kg', category: 'food', code: 'L-2611-A', quantity: 11, receivedAt: '2026-08-30', expiresAt: '2026-11-04' },
  { id: 'bat-5', productName: 'Shampoo dermatológico', category: 'grooming', code: 'L-2801-A', quantity: 22, receivedAt: '2026-09-05', expiresAt: '2028-01-20' },
  { id: 'bat-6', productName: 'Meloxicam 1.5 mg/ml', category: 'medicines', code: 'L-2703-B', quantity: 18, receivedAt: '2026-07-02', expiresAt: '2027-05-30' },
  { id: 'bat-7', productName: 'Pipeta antipulgas perro mediano', category: 'medicines', code: 'L-2702-A', quantity: 4, receivedAt: '2026-09-03', expiresAt: '2027-02-28' },
  { id: 'bat-8', productName: 'Vacuna Triple felina', category: 'vaccines', code: 'L-2610-C', quantity: 7, receivedAt: '2026-05-04', expiresAt: '2026-10-30' },
  { id: 'bat-9', productName: 'Alimento cachorro 3 kg', category: 'food', code: 'L-2704-A', quantity: 6, receivedAt: '2026-04-22', expiresAt: '2027-04-10' },
  { id: 'bat-10', productName: 'Colonia para mascotas', category: 'grooming', code: 'L-2803-A', quantity: 15, receivedAt: '2026-03-15', expiresAt: '2028-03-01' },
  { id: 'bat-11', productName: 'Desparasitante interno', category: 'medicines', code: 'L-2609-A', quantity: 2, receivedAt: '2026-03-10', expiresAt: '2026-09-10' },
  { id: 'bat-12', productName: 'Shampoo dermatológico', category: 'grooming', code: 'L-2610-B', quantity: 3, receivedAt: '2026-01-20', expiresAt: '2026-11-05' },
]

export function resolveBatchesList(query: BatchListQuery): Promise<ListPage<Batch>> {
  return Promise.resolve().then(() => {
    const today = new Date()
    const batches = BATCHES.map((batch) => ({ ...batch, status: getExpiryStatus(batch.expiresAt, today) })).filter(
      (batch) =>
        matchesSearch(query.search, [batch.productName, batch.code]) &&
        (!query.filters.status || batch.status === query.filters.status),
    )

    return paginateRows(batches, query)
  })
}
