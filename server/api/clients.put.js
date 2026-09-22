import baseRoute from '@/core/base-route.js';
import {updateClientSchema} from '@/modules/clients/clients.schema.js';
import {updateClient} from '@/modules/clients/clients.service.js';

export default baseRoute(async ({id, ...data}) => {
  return updateClient(id, data);
}, updateClientSchema, {module: 'clients'});
