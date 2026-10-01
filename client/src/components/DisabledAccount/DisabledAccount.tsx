import type { ReactNode } from 'react'
import { MailIcon, ShieldOffIcon } from 'lucide-react'
import useLogout from '@/hooks/use-logout'
import { supportEmail } from '@/constants/support'

type StepProps = {
  icon: ReactNode
  text: string
  action: ReactNode
}

export default function DisabledAccount() {
  const [loading, logout] = useLogout()

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-6">
      <div className="max-w-lg w-full">

        <div className="flex justify-center mb-8">
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-danger-soft flex items-center justify-center">
              <ShieldOffIcon className="w-12 h-12 text-danger" />
            </div>
            <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-danger animate-ping opacity-60" />
            <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-danger" />
          </div>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-foreground mb-3">
            Tu cuenta ha sido deshabilitada
          </h1>
          <p className="text-muted-foreground text-sm leading-relaxed">
            El acceso a tu cuenta ha sido temporalmente suspendido por un administrador.
            Si crees que esto es un error, ponte en contacto con nuestro equipo de soporte.
          </p>
        </div>

        <div className="bg-card border border-border rounded-xl p-6 mb-6 space-y-4">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            ¿Qué puedo hacer?
          </h2>

          <div className="space-y-3">
            <Step
              icon={<MailIcon className="w-4 h-4" />}
              text="Escríbenos a"
              action={
                <a
                  href={`mailto:${supportEmail}`}
                  className="text-primary hover:underline font-medium"
                >
                  {supportEmail}
                </a>
              }
            />
          </div>
        </div>

        <div className="text-center">
          <button
            type="button"
            onClick={() => logout()}
            disabled={loading}
            className="text-sm text-neutral-faint hover:text-muted-foreground transition-colors underline underline-offset-2 disabled:opacity-50"
          >
            {loading ? 'Cerrando sesión...' : 'Cerrar sesión'}
          </button>
        </div>

      </div>
    </div>
  )
}

function Step({ icon, text, action }: StepProps) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 w-7 h-7 rounded-full bg-muted flex items-center justify-center text-muted-foreground shrink-0">
        {icon}
      </div>
      <p className="text-sm text-muted-foreground leading-relaxed">
        {text}{' '}
        {action}
      </p>
    </div>
  )
}
