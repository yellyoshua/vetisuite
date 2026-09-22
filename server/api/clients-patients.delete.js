import baseRoute from '@/core/base-route.js';
import {deletePatientSchema} from '@/modules/clients-patients/clients-patients.schema.js';
import {archivePatient} from '@/modules/clients-patients/clients-patients.service.js';

export default baseRoute(async ({id}) => {
  return archivePatient(id);
}, deletePatientSchema, {module: 'clients-patients'});
