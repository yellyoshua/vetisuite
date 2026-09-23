import zod from 'zod'

export const createSuperadminSchema = zod.object({
  firstName: zod.string('El nombre es requerido').min(2, 'El nombre debe tener al menos 2 caracteres'),
  lastName: zod.string('El apellido es requerido').min(2, 'El apellido debe tener al menos 2 caracteres'),
  email: zod.email('Email inválido'),
  password: zod.string('La contraseña es requerida').min(6, 'La contraseña debe tener al menos 6 caracteres'),
})

export const updateSuperadminSchema = zod.object({
  firstName: zod.string('El nombre es requerido').min(2, 'El nombre debe tener al menos 2 caracteres'),
  lastName: zod.string('El apellido es requerido').min(2, 'El apellido debe tener al menos 2 caracteres'),
})

export type CreateSuperadminValues = zod.infer<typeof createSuperadminSchema>

export type UpdateSuperadminValues = zod.infer<typeof updateSuperadminSchema>

export type Superadmin = {
  id: string
  avatar: string | null
  firstName: string
  lastName: string
  createdAt: string
  user: {
    id: string
    email: string
    emailConfirmed: boolean
    lastSignInAt: string | null
    disabled: boolean
    createdAt: string
  }
}
