import zod from 'zod'

export const updateProfileSchema = zod.object({
  firstName: zod.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  lastName: zod.string().min(2, 'El apellido debe tener al menos 2 caracteres'),
  avatar: zod.string().nullish(),
  email: zod.email('Email inválido'),
})

export const changePasswordSchema = zod.object({
  currentPassword: zod.string().min(1, 'Debes ingresar tu contraseña actual'),
  password: zod.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
  confirmPassword: zod.string().min(1, 'Debes confirmar la nueva contraseña'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmPassword'],
})

export type UpdateProfileValues = zod.infer<typeof updateProfileSchema>

export type ChangePasswordValues = zod.infer<typeof changePasswordSchema>

export type Profile = {
  avatar: string | null
  firstName: string
  lastName: string
  user: {
    email: string
    emailConfirmed: boolean
    emailConfirmedAt: string | null
    createdAt: string
    lastSignInAt: string | null
    disabled: boolean
    bannedUntil: string | null
  }
}

export type UpdateProfileResponse = {
  success: boolean
  avatar: string | null
}
