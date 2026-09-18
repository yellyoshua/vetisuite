import Button from '@/components/ui/Button'
import ClientCard from './components/ClientCard'

const EXAMPLE_CLIENTS = [
  {
    id: 'cli-1',
    name: 'María Fernanda Solís',
    phone: '+506 8812 4590',
    email: 'mf.solis@correo.com',
    patients: [
      {
        id: 'pat-1',
        name: 'Rocky',
        speciesLabel: 'Perro',
        detail: 'Labrador · 4 años',
        alerts: ['Agresivo', 'Alergia a penicilina'],
      },
      {
        id: 'pat-2',
        name: 'Nube',
        speciesLabel: 'Gato',
        detail: 'Siamés · 2 años',
        alerts: [],
      },
    ],
  },
  {
    id: 'cli-2',
    name: 'Carlos Vindas Rojas',
    phone: '+506 7043 1188',
    email: undefined,
    patients: [
      {
        id: 'pat-3',
        name: 'Kiwi',
        speciesLabel: 'Ave',
        detail: 'Perico · 1 año',
        alerts: ['Alergia a semillas de girasol'],
      },
    ],
  },
]

export default function ClientsPage() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-10">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-ink">Clientes</h1>
        <p className="text-sub">Directorio de dueños y sus mascotas registradas.</p>
      </header>

      <search className="flex flex-col gap-2 rounded-xl border border-line bg-surface p-5">
        <label htmlFor="clients-search" className="font-medium text-ink">
          Buscar cliente
        </label>
        <div className="flex flex-wrap gap-3">
          <input
            id="clients-search"
            name="search"
            type="search"
            autoComplete="off"
            placeholder="Nombre, teléfono o correo"
            aria-describedby="clients-search-hint"
            className="min-h-12 flex-1 rounded-lg border border-line bg-surface px-3 text-base text-ink"
          />
          <Button>Buscar</Button>
        </div>
        <p id="clients-search-hint" className="text-sm text-sub">
          Localiza a un dueño por su nombre, número telefónico o correo electrónico.
        </p>
      </search>

      <ul className="flex flex-col gap-4">
        {EXAMPLE_CLIENTS.map((client) => (
          <li key={client.id}>
            <ClientCard name={client.name} phone={client.phone} email={client.email} patients={client.patients} />
          </li>
        ))}
      </ul>
    </main>
  )
}
