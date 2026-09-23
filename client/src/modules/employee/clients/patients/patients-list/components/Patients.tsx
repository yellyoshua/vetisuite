import { Link } from 'react-router'
import { PencilIcon, PlusIcon } from 'lucide-react'
import useQueryParams from '@/hooks/use-query-params'
import CustomPage from '@/components/CustomPage/CustomPage'
import CustomTable from '@/components/CustomTable/CustomTable'
import CustomTooltip from '@/components/CustomTooltip/CustomTooltip'
import { Button } from '@/components/ui/button'
import { PATIENT_SEX_LABELS, PATIENT_SPECIES_LABELS } from '@/constants/clients'
import { formatDate } from '@/lib/date'
import type { Client } from '@/modules/employee/clients/clients.schema'
import type { Patient } from '@/modules/employee/clients/patients/patients.schema'

type PatientsProps = {
  client: Client
  patients: Patient[]
}

export default function Patients({ client, patients }: PatientsProps) {
  const { nextPage, prevPage, query } = useQueryParams()
  const currentPage = Number(query.page) || 1

  return (
    <CustomPage
      title={`Mascotas de ${client.name}`}
      description="Pacientes del dueño."
      goBackPath="/clients"
      actions={
        <Button asChild>
          <Link to={`/clients/${client.id}/patients/create`}>
            <PlusIcon className="w-5 h-5" />
            Nueva mascota
          </Link>
        </Button>
      }
    >
      <CustomTable dataSize={patients.length} currentPage={currentPage} nextPage={nextPage} prevPage={prevPage}>
        <CustomTable.Thead>
          <CustomTable.TableRow header={true}>
            <CustomTable.TheadItem>Mascota</CustomTable.TheadItem>
            <CustomTable.TheadItem>Especie</CustomTable.TheadItem>
            <CustomTable.TheadItem>Raza</CustomTable.TheadItem>
            <CustomTable.TheadItem>Sexo</CustomTable.TheadItem>
            <CustomTable.TheadItem>Nacimiento</CustomTable.TheadItem>
            <CustomTable.TheadItem className="text-right">Acciones</CustomTable.TheadItem>
          </CustomTable.TableRow>
        </CustomTable.Thead>
        <CustomTable.TBody>
          {patients.map((patient) => (
            <CustomTable.TableRow key={patient.id}>
              <CustomTable.TBodyItem className="font-medium">{patient.name}</CustomTable.TBodyItem>
              <CustomTable.TBodyItem>{PATIENT_SPECIES_LABELS[patient.species]}</CustomTable.TBodyItem>
              <CustomTable.TBodyItem>{patient.breed || '—'}</CustomTable.TBodyItem>
              <CustomTable.TBodyItem>{patient.sex ? PATIENT_SEX_LABELS[patient.sex] : '—'}</CustomTable.TBodyItem>
              <CustomTable.TBodyItem>{patient.birthDate ? formatDate(`${patient.birthDate}T00:00:00`) : '—'}</CustomTable.TBodyItem>
              <CustomTable.TBodyItem type="actions">
                <CustomTooltip content="Editar">
                  <Button asChild variant="outline" size="icon">
                    <Link to={`/clients/${client.id}/patients/${patient.id}/edit`} aria-label={`Editar a ${patient.name}`}>
                      <PencilIcon className="w-4 h-4 text-blue" />
                    </Link>
                  </Button>
                </CustomTooltip>
              </CustomTable.TBodyItem>
            </CustomTable.TableRow>
          ))}
        </CustomTable.TBody>
      </CustomTable>
    </CustomPage>
  )
}
