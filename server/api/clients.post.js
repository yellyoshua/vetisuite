import baseRoute from '@/core/base-route.js';
import {createClientSchema} from '@/modules/clients/clients.schema.js';
import {createClient} from '@/modules/clients/clients.service.js';

export default baseRoute(async (data, context) => {
  return createClient(context.profile.organization, data);
}, createClientSchema, {module: 'clients'});
