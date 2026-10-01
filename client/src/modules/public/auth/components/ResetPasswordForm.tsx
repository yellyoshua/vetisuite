import { useState } from 'react'
import { Link } from 'react-router'
import { ArrowLeft, Mail } from 'lucide-react'
import useForm from '@/hooks/use-form'
import Form, { FormInput } from '@/components/form/Form'
import { forgotPasswordService } from '../auth.service'
import { resetPasswordSchema, type ResetPasswordValues } from '../auth.schema'

const defaultValues: ResetPasswordValues = { email: '' }

export default function ResetPasswordForm() {
  const [sent, setSent] = useState(false)
  const { control, error, isSubmitting, handleSubmit } = useForm(defaultValues, {
    onSubmit: (body) => forgotPasswordService.post(body),
    schema: resetPasswordSchema,
    onSuccess: () => setSent(true),
    disableToast: true,
  })

  if (sent) {
    return (
      <div className="text-center">
        <div className="w-16 h-16 bg-info-soft rounded-full flex items-center justify-center mx-auto mb-4">
          <Mail className="h-8 w-8 text-info" aria-hidden="true" />
        </div>
        <h1 className="text-2xl font-bold text-foreground mb-2">Revisa tu correo</h1>
        <p className="text-sm text-muted-foreground mb-6">
          Si existe una cuenta con ese correo, recibirás un enlace para restablecer tu contraseña en breve.
        </p>
        <BackToSignIn />
      </div>
    )
  }

  return (
    <>
      <h1 className="text-2xl font-bold text-foreground mb-6">Recuperar Contraseña</h1>

      <p className="text-sm text-muted-foreground mb-6">
        Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña.
      </p>

      <Form onSubmit={handleSubmit} className="space-y-4">

        <FormInput
          control={control}
          name="email"
          label="Correo Electrónico"
          type="email"
          placeholder="tu@email.com"
          autoComplete="email"
        />

        {error && (
          <p className="text-sm text-danger text-center">{error.message}</p>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold transition-colors rounded-xl shadow-[0_3px_0_var(--neutral-shade)] shadow-neutral-shade/18 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Enviando…' : 'Enviar Enlace de Recuperación'}
        </button>

      </Form>

      <div className="mt-6 text-center">
        <BackToSignIn />
      </div>
    </>
  )
}

function BackToSignIn() {
  return (
    <Link to="/sign-in" className="inline-flex items-center text-sm text-primary hover:text-primary/80 font-medium">
      <ArrowLeft className="h-4 w-4 mr-1" aria-hidden="true" />
      Volver a Iniciar Sesión
    </Link>
  )
}
