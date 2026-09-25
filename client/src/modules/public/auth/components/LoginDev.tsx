import { useState } from 'react'
import { signInService } from '../auth.service'

type SignInResponse = {
  authorize_url: string
}

type DemoAccount = {
  name: string
  email: string
}

type DemoRole = {
  label: string
  accounts: DemoAccount[]
}

type DemoOrganization = {
  name: string
  roles: DemoRole[]
}

const PASSWORD = 'cambiar-esta-clave'

const DEMO_ORGANIZATIONS: DemoOrganization[] = [
  {
    name: 'VetiSuite',
    roles: [
      { label: 'Superadmin', accounts: [{ name: 'Superadmin VetiSuite', email: 'demo+superadmin@vetisuite.com' }] },
    ],
  },
  {
    name: 'Clínica Demo',
    roles: [
      { label: 'Dueño', accounts: [{ name: 'Dueña Demo', email: 'demo+owner@vetisuite.com' }] },
      { label: 'Veterinario', accounts: [{ name: 'Veterinaria Demo', email: 'demo+veterinarian@vetisuite.com' }] },
      { label: 'Peluquero', accounts: [{ name: 'Peluquero Demo', email: 'demo+groomer@vetisuite.com' }] },
      { label: 'Recepción', accounts: [{ name: 'Recepción Demo', email: 'demo+employee@vetisuite.com' }] },
    ],
  },
  {
    name: 'Clínica Norte',
    roles: [
      { label: 'Dueño', accounts: [{ name: 'Dueño Norte', email: 'demo+north-owner@vetisuite.com' }] },
      { label: 'Veterinario', accounts: [{ name: 'Veterinario Norte', email: 'demo+north-veterinarian@vetisuite.com' }] },
      { label: 'Peluquero', accounts: [{ name: 'Peluquera Norte', email: 'demo+north-groomer@vetisuite.com' }] },
      { label: 'Recepción', accounts: [{ name: 'Recepción Norte', email: 'demo+north-receptionist@vetisuite.com' }] },
    ],
  },
]

type SignInFailure = {
  error?: string
  message?: string
}

export default function LoginDev() {
  const [pendingEmail, setPendingEmail] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const signIn = async (email: string) => {
    setPendingEmail(email)
    setError(null)

    try {
      const response = await signInService.post<SignInResponse>({ email, password: PASSWORD })
      window.location.assign(response.authorize_url)
    } catch (reason) {
      const failure = reason as SignInFailure
      setError(failure.error || failure.message || 'Ocurrió un error inesperado')
      setPendingEmail(null)
    }
  }

  return (
    <section aria-labelledby="login-dev-title" className="w-full max-w-5xl bg-white rounded-3xl shadow-xl p-6 md:p-10">
      <h2 id="login-dev-title" className="text-lg font-bold text-gray-800 mb-4">Cuentas demo</h2>

      {error && (
        <p role="alert" className="text-sm text-red-600 text-center mb-4">{error}</p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {DEMO_ORGANIZATIONS.map((organization) => (
          <div key={organization.name}>
            <h3 className="text-sm font-semibold text-gray-800 mb-2">{organization.name}</h3>

            <div className="space-y-3">
              {organization.roles.map((role) => (
                <div key={role.label}>
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-600 mb-1.5">{role.label}</p>

                  <ul className="space-y-2">
                    {role.accounts.map((account) => (
                      <li key={account.email}>
                        <button
                          type="button"
                          onClick={() => signIn(account.email)}
                          disabled={pendingEmail !== null}
                          aria-busy={pendingEmail === account.email}
                          className="w-full min-h-12 touch-manipulation text-left bg-white border-2 border-gray-300 hover:border-green rounded-xl px-3 py-2 transition-colors shadow-[0_2px_0_rgba(0,0,0,0.08)] disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                          <span className="block text-sm font-semibold text-gray-800">
                            {pendingEmail === account.email ? 'Ingresando…' : account.name}
                          </span>
                          <span className="block text-xs text-gray-600 break-all">{account.email}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
