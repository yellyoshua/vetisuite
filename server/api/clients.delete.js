import baseRoute from '@/core/base-route.js';
import {deleteClientSchema} from '@/modules/clients/clients.schema.js';
import {archiveClient} from '@/modules/clients/clients.service.js';

export default baseRoute(async ({id}) => {
  return archiveClient(id);
}, deleteClientSchema, {module: 'clients'});
