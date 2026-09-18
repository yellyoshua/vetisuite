import type { ListQuery } from '@/hooks/use-list-query'
import type { ExpiryStatus, ProductCategory } from '../inventory.schema'

export type Batch = {
  id: string
  productName: string
  category: ProductCategory
  code: string
  quantity: number
  receivedAt: string
  expiresAt: string
  status: ExpiryStatus
}

export type BatchFilterKey = 'status'

export type BatchListQuery = ListQuery<BatchFilterKey>
