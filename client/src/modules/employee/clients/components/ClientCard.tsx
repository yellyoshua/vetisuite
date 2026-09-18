import AlertBadge from '@/components/AlertBadge'

type ClientCardPatient = {
  id: string
  name: string
  speciesLabel: string
  detail: string
  alerts: string[]
}

type ClientCardProps = {
  name: string
  phone: string
  email?: string
  patients: ClientCardPatient[]
}

export default function ClientCard({ name, phone, email, patients }: ClientCardProps) {
  return (
    <article className="rounded-xl border border-line bg-surface p-5">
      <h3 className="text-lg font-semibold text-ink">{name}</h3>
      <dl className="mt-2 flex flex-wrap gap-x-6 gap-y-1 text-sm text-sub">
        <div className="flex gap-2">
          <dt className="font-medium">Teléfono:</dt>
          <dd>
            <a href={`tel:${phone}`} className="rounded text-brand underline">
              {phone}
            </a>
          </dd>
        </div>
        <div className="flex gap-2">
          <dt className="font-medium">Correo:</dt>
          <dd>{email ?? 'Sin correo registrado'}</dd>
        </div>
      </dl>

      <h4 className="mt-4 text-xs font-bold tracking-wide text-sub uppercase">Mascotas</h4>
      <ul className="mt-2 flex flex-col gap-2">
        {patients.map((patient) => (
          <li key={patient.id} className="rounded-lg border border-line bg-canvas px-3 py-2">
            <p className="font-medium text-ink">
              {patient.name} <span className="font-normal text-sub">· {patient.speciesLabel}</span>
            </p>
            <p className="text-sm text-sub">{patient.detail}</p>
            {patient.alerts.length > 0 && (
              <p className="mt-2 flex flex-wrap gap-2">
                {patient.alerts.map((alert) => (
                  <AlertBadge key={alert}>{alert}</AlertBadge>
                ))}
              </p>
            )}
          </li>
        ))}
      </ul>
    </article>
  )
}
