import zod from 'zod'

export const signInSchema = zod.object({
  email: zod.email('Correo electrónico no válido'),
  password: zod.string().min(1, 'Contraseña no válida'),
})

export const resetPasswordSchema = zod.object({
  email: zod.email('El email debe ser válido'),
})

export type SignInValues = zod.infer<typeof signInSchema>

export type ResetPasswordValues = zod.infer<typeof resetPasswordSchema>
