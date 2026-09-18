import { MOVEMENT_TYPE_VALUES } from '@/constants/inventory'
import type { ListQuery } from '@/hooks/use-list-query'

export type MovementType = (typeof MOVEMENT_TYPE_VALUES)[number]

export type Movement = {
  id: string
  productName: string
  batchCode: string
  type: MovementType
  quantity: number
  destination: string
  date: string
  time: string
  responsibleName: string
}

export type MovementFilterKey = 'type'

export type MovementListQuery = ListQuery<MovementFilterKey>
