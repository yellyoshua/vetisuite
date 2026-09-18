import { useParams } from 'react-router'
import AlertBadge from '@/components/AlertBadge'
import DataTable, { type DataTableColumn } from '@/components/DataTable/DataTable'
import IdentityCell from '@/components/DataTable/IdentityCell'
import RowActions from '@/components/DataTable/RowActions'
import PageHeader from '@/components/PageHeader'
import ButtonLink from '@/components/ui/ButtonLink'
import Icon from '@/components/ui/Icon'
import { PATIENT_SPECIES_LABELS } from '@/constants/clients'
import useListQuery from '@/hooks/use-list-query'
import useResolver from '@/hooks/use-resolver'
import type { Patient } from '../patients.schema'
import { resolvePatientsList } from './resolvers'

const TABLE_MIN_WIDTH = 820

function PatientAlerts({ patient }: { patient: Patient }) {
  const allergies = patient.allergies ?? []
  if (!patient.isAggressive && allergies.length === 0) {
    return <span className="text-sub">Sin alertas</span>
  }

  return (
    <span className="flex flex-wrap gap-1.5">
      {patient.isAggressive && <AlertBadge>Agresivo</AlertBadge>}
      {allergies.map((allergy) => (
        <AlertBadge key={allergy}>Alergia: {allergy}</AlertBadge>
      ))}
    </span>
  )
}

function buildColumns(clientId: string): DataTableColumn<Patient>[] {
  return [
    {
      key: 'patient',
      header: 'Mascota',
      render: (patient) => <IdentityCell title={patient.name} subtitle={PATIENT_SPECIES_LABELS[patient.species]} />,
    },
    { key: 'breed', header: 'Raza', render: (patient) => patient.breed || '—' },
    { key: 'age', header: 'Edad', render: (patient) => patient.age || '—' },
    { key: 'alerts', header: 'Alertas clínicas', render: (patient) => <PatientAlerts patient={patient} /> },
    {
      key: 'actions',
      header: 'Acciones',
      align: 'right',
      isHeaderHidden: true,
      render: (patient) => (
        <RowActions subject={patient.name} editTo={`/clients/${clientId}/patients/${patient.id}/edit`} />
      ),
    },
  ]
}

export default function PatientsListPage() {
  const { clientId = '' } = useParams()
  const { query, setPage } = useListQuery()
  const { data, error, isLoading } = useResolver(resolvePatientsList, { ...query, clientId })

  return (
    <>
      <PageHeader
        title={data ? `Mascotas de ${data.owner.name}` : 'Mascotas'}
        description="Pacientes del dueño con sus alertas clínicas: revísalas antes de cada atención."
        actions={
          <ButtonLink to={`/clients/${clientId}/patients/create`}>
            <Icon name="plus" size={14} /> Nueva mascota
          </ButtonLink>
        }
      />
      <DataTable
        label="Mascotas del cliente"
        columns={buildColumns(clientId)}
        data={data?.patients ?? null}
        error={error}
        isLoading={isLoading}
        pageSize={query.pageSize}
        minWidth={TABLE_MIN_WIDTH}
        rowKey={(patient) => patient.id}
        onPageChange={setPage}
        emptyTitle="Sin mascotas registradas"
        emptyHint="Registra la primera mascota de este dueño con “Nueva mascota”."
      />
    </>
  )
}
