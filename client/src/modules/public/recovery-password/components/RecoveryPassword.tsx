import type { ReactNode } from 'react'
import { Link } from 'react-router'
import useForm from '@/hooks/use-form'
import Form, { FormInput } from '@/components/form/Form'
import recoveryPasswordService from '../recovery-password.service'
import recoveryPasswordSchema, { type RecoveryPasswordValues } from '../recovery-password.schema'

type RecoveryPasswordProps = {
  token: string
}

type TokenFlowCardProps = {
  children: ReactNode
}

const defaultValues = (token: string): RecoveryPasswordValues => ({
  token,
  password: '',
  confirmPassword: '',
})

export default function RecoveryPassword({ token }: RecoveryPasswordProps) {
  const { control, error, isSubmitting, handleSubmit } = useForm(
    defaultValues(token),
    {
      onSubmit: (body) => recoveryPasswordService.post(body),
      schema: recoveryPasswordSchema,
      successMessage: 'Contraseña restablecida correctamente',
      redirectTo: '/',
    },
  )

  if (!token) {
    return (
      <TokenFlowCard>
        <div className="w-28 h-28 mx-auto mb-8 bg-muted rounded-full flex items-center justify-center text-6xl">🤔</div>
        <h1 className="text-3xl font-black text-foreground mb-4 tracking-tight">Enlace inválido</h1>
        <p className="text-lg text-muted-foreground mb-10 font-bold">
          El enlace de restablecimiento no es válido o ha expirado.
        </p>
        <Link to="/" className="inline-block bg-muted text-foreground font-bold px-10 py-4 rounded-xl w-full">
          Volver al inicio
        </Link>
      </TokenFlowCard>
    )
  }

  return (
    <TokenFlowCard>
      <div className="w-28 h-28 mx-auto mb-8 bg-warning-soft rounded-full flex items-center justify-center text-6xl">🔑</div>
      <h1 className="text-3xl font-black text-foreground mb-2 tracking-tight">Nueva contraseña</h1>
      <p className="text-base text-muted-foreground mb-8 font-semibold">
        Elige una contraseña segura para tu cuenta.
      </p>

      <Form onSubmit={handleSubmit} className="text-left space-y-4">

        <FormInput
          control={control}
          name="password"
          label="Contraseña"
          placeholder="Mínimo 6 caracteres"
          type="password"
        />

        <FormInput
          control={control}
          name="confirmPassword"
          label="Confirmar contraseña"
          placeholder="Repite tu contraseña"
          type="password"
        />

        {error && (
          <p className="text-danger text-sm font-semibold text-center">{error.message}</p>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-primary-strong text-primary-strong-foreground font-bold px-10 py-4 rounded-xl hover:bg-primary-strong/90 transition-all hover:-translate-y-1 shadow-md mt-2 disabled:opacity-60 disabled:cursor-not-allowed">
          {isSubmitting ? 'Procesando...' : 'Restablecer contraseña →'}
        </button>

      </Form>
    </TokenFlowCard>
  )
}

function TokenFlowCard({ children }: TokenFlowCardProps) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-card rounded-[2.5rem] shadow-sm p-10 text-center border-2 border-b-[6px] border-border">
        {children}
      </div>
    </div>
  )
}
