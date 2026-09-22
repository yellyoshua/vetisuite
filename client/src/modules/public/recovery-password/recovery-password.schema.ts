import zod from 'zod'

const recoveryPasswordSchema = zod.object({
  token: zod.string().min(1, 'Token requerido'),
  password: zod.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
  confirmPassword: zod.string().min(1, 'Confirma tu contraseña'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmPassword'],
})

export type RecoveryPasswordValues = zod.infer<typeof recoveryPasswordSchema>

export default recoveryPasswordSchema
