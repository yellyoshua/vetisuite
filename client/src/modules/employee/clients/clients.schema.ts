import zod from 'zod'

export const clientSchema = zod.object({
  name: zod.string().trim().min(2, 'El nombre debe tener al menos 2 caracteres'),
  phone: zod.string().trim().min(6, 'El teléfono debe tener al menos 6 dígitos'),
  email: zod.union([zod.email('Email inválido'), zod.literal('')]).nullish(),
})

export type ClientValues = zod.infer<typeof clientSchema>

export type Client = {
  id: string
  name: string
  phone: string
  email: string | null
  debt: string
  createdAt: string
  updatedAt: string
}
