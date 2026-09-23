import zod from 'zod'

export const createOwnerSchema = zod.object({
  firstName: zod.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  lastName: zod.string().min(2, 'El apellido debe tener al menos 2 caracteres'),
  email: zod.email('Email inválido'),
  password: zod.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
  phone: zod.string().nullish(),
})

export const updateOwnerSchema = zod.object({
  firstName: zod.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  lastName: zod.string().min(2, 'El apellido debe tener al menos 2 caracteres'),
  phone: zod.string().nullish(),
  position: zod.string().nullish(),
  occupation: zod.string().nullish(),
  description: zod.string().max(500, 'La descripción no debe superar los 500 caracteres').nullish(),
})

export type CreateOwnerValues = zod.infer<typeof createOwnerSchema>

export type UpdateOwnerValues = zod.infer<typeof updateOwnerSchema>

export type Owner = {
  id: string
  avatar: string | null
  firstName: string
  lastName: string
  phone: string | null
  description: string | null
  position: string | null
  occupation: string | null
  createdAt: string
  user: {
    id: string
    email: string
    emailConfirmed: boolean
    lastSignInAt: string | null
    disabled: boolean
    createdAt: string
  }
  organization: {
    id: string
    name: string
    slug: string
  }
}
