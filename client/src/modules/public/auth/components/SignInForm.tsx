import { Link } from 'react-router'
import { ShieldCheck } from 'lucide-react'
import useForm from '@/hooks/use-form'
import Form, { FormInput } from '@/components/form/Form'
import { landingDomain } from '@/lib/environment'
import PasswordInput from './PasswordInput'
import { signInService } from '../auth.service'
import { signInSchema, type SignInValues } from '../auth.schema'

type SignInResponse = {
  authorize_url: string
}

const SIGNUP_URL = `${landingDomain}/?modal=signup`

const defaultValues: SignInValues = { email: '', password: '' }

export default function SignInForm() {
  const { control, error, isSubmitting, handleSubmit } = useForm(defaultValues, {
    onSubmit: (body) => signInService.post<SignInResponse>(body),
    schema: signInSchema,
    onSuccess: (response) => {
      window.location.href = response.authorize_url
    },
    disableToast: true,
  })

  return (
    <>
      <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6">Iniciar Sesión</h1>

      <div className="bg-white border-2 border-gray-300 rounded-2xl p-4 mb-6 flex items-start shadow-[0_3px_0_rgba(0,0,0,0.08)]">
        <ShieldCheck className="h-5 w-5 text-gray-800 mr-3 mt-0.5 shrink-0" aria-hidden="true" />
        <p className="text-sm text-gray-700">
          Inicia sesión para garantizar una experiencia segura y personalizada.
        </p>
      </div>

      <div className="flex bg-white border-2 border-gray-300 rounded-2xl p-1.5 mb-6 shadow-[0_3px_0_rgba(0,0,0,0.08)]">
        <span className="flex-1 py-2.5 px-4 rounded-xl text-sm font-semibold text-center bg-green text-white shadow-[0_2px_0_rgba(0,0,0,0.2)]">
          Iniciar Sesión
        </span>
        <a
          href={SIGNUP_URL}
          className="flex-1 py-2.5 px-4 rounded-xl text-sm font-semibold transition-colors text-center text-gray-600 hover:text-gray-900"
        >
          Crear cuenta
        </a>
      </div>

      <Form onSubmit={handleSubmit} className="space-y-4">

        <FormInput
          control={control}
          name="email"
          label="Email"
          type="email"
          placeholder="correo@ejemplo.com"
          autoComplete="email"
        />

        <PasswordInput
          control={control}
          name="password"
          label="Contraseña"
          placeholder="••••••••"
          autoComplete="current-password"
        />

        <div className="text-right">
          <Link to="/reset-password" className="text-sm text-gray-600 hover:text-gray-900 font-medium">
            ¿Olvidaste tu contraseña?
          </Link>
        </div>

        {error && (
          <p className="text-sm text-red-600 text-center">{error.message}</p>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full h-12 bg-green hover:bg-green/90 text-white font-semibold transition-colors rounded-xl shadow-[0_3px_0_rgba(0,0,0,0.18)] disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Ingresando…' : 'Iniciar Sesión'}
        </button>

      </Form>

      <div className="mt-6 text-center text-sm text-gray-600">
        ¿Aún no tienes cuenta?{' '}
        <a href={SIGNUP_URL} className="text-blue-600 hover:text-blue-700 font-semibold">
          Crear cuenta
        </a>
      </div>
    </>
  )
}
