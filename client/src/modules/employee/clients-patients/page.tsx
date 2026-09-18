import type { FormEvent } from 'react'
import { Link } from 'react-router'
import { PATIENT_SPECIES } from '@/constants/clients'
import PatientForm from './components/PatientForm'

const EXAMPLE_CLIENT_NAME = 'María Fernanda Solís'

export default function NewPatientPage() {
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
  }

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-4 py-10">
      <nav aria-label="Ruta de navegación">
        <Link to="/clients" className="rounded text-sm font-medium text-brand underline">
          Volver a clientes
        </Link>
      </nav>

      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-ink">Nueva mascota</h1>
        <p className="text-sub">Registra una mascota y sus alertas clínicas para este dueño.</p>
      </header>

      <PatientForm clientName={EXAMPLE_CLIENT_NAME} speciesOptions={PATIENT_SPECIES} onSubmit={handleSubmit} />
    </main>
  )
}
