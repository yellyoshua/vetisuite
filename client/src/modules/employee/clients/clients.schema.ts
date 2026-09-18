import { z } from 'zod'
import { CLIENT_STATUS_VALUES } from '@/constants/clients'
import type { ListQuery } from '@/hooks/use-list-query'

export const clientSchema = z.object({
  name: z.string().trim().min(1, 'El nombre es obligatorio'),
  nationalId: z.string().trim().min(1, 'La cédula es obligatoria'),
  phone: z.string().trim().min(1, 'El teléfono es obligatorio'),
  email: z.email('El correo electrónico no es válido').or(z.literal('')),
})

export type ClientInput = z.infer<typeof clientSchema>

export type ClientStatus = (typeof CLIENT_STATUS_VALUES)[number]

export type Client = ClientInput & {
  id: string
  status: ClientStatus
  hasOpenAccount: boolean
  createdAt: string
  lastVisitAt: string | null
  petNames: string[]
}

export type ClientPreset = 'open-account' | 'new-this-month' | 'no-recent-visit'

export type ClientFilterKey = 'status' | 'preset'

export type ClientListQuery = ListQuery<ClientFilterKey>
