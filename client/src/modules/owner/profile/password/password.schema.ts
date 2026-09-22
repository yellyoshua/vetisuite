import zod from 'zod'

export const changePasswordSchema = zod.object({
  currentPassword: zod.string().min(1, 'Debes ingresar tu contraseña actual'),
  password: zod.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
  confirmPassword: zod.string().min(1, 'Debes confirmar la nueva contraseña'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmPassword'],
})

export type ChangePasswordValues = zod.infer<typeof changePasswordSchema>
