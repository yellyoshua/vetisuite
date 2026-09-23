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
