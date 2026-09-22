import zod from 'zod'

export const updateProfileSchema = zod.object({
  avatar: zod.string().nullish(),
  firstName: zod.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  lastName: zod.string().min(2, 'El apellido debe tener al menos 2 caracteres'),
  email: zod.email('Email inválido'),
  phone: zod.string().nullish(),
})

export type UpdateProfileValues = zod.infer<typeof updateProfileSchema>

export type Profile = {
  avatar: string | null
  firstName: string
  lastName: string
  phone: string | null
  position: string
  color: string | null
  createdAt: string
  user: {
    email: string
    emailConfirmed: boolean
  }
  organization: {
    id: string
    name: string
    slug: string
  }
}

export type UpdateProfileResponse = {
  success: boolean
  avatar: string | null
}
