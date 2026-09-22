import baseRoute from '@/core/base-route.js';
import {updatePatientSchema} from '@/modules/clients-patients/clients-patients.schema.js';
import {updatePatient} from '@/modules/clients-patients/clients-patients.service.js';

export default baseRoute(async ({id, ...data}) => {
  return updatePatient(id, data);
}, updatePatientSchema, {module: 'clients-patients'});
