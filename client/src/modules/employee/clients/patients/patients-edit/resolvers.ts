import type { Params } from 'react-router'
import clientsPatientsService from '@/modules/employee/clients/patients/clients-patients.service'
import type { Patient } from '@/modules/employee/clients/patients/patients.schema'

export default {
  patient: async (params: Readonly<Params>) => {
    const patient = await clientsPatientsService.getOne<Patient>({ id: params.patientId, client: params.clientId })

    if (!patient) {
      throw new Error('No se encontró la mascota')
    }

    return patient
  },
}
