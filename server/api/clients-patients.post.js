import baseRoute from '@/core/base-route.js';
import {createPatientSchema} from '@/modules/clients-patients/clients-patients.schema.js';
import {createPatient} from '@/modules/clients-patients/clients-patients.service.js';

export default baseRoute(async (data, context) => {
  return createPatient(context.profile.organization, data);
}, createPatientSchema, {module: 'clients-patients'});
