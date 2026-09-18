import { z } from 'zod'

export const clientSchema = z.object({
  name: z.string().trim().min(1, 'El nombre es obligatorio'),
  phone: z.string().trim().min(1, 'El teléfono es obligatorio'),
  email: z.email('El correo electrónico no es válido').optional(),
})

export type ClientInput = z.infer<typeof clientSchema>

export type Client = ClientInput & {
  id: string
}
