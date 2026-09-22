import baseRoute from '@/core/base-route.js';
import {updateOwnerSchema} from '@/modules/owners/owners.schema.js';
import {updateOwnerAccount} from '@/modules/accounts/accounts.service.js';
import ownersRepository from '@/modules/owners/owners.repository.js';

export default baseRoute(async ({id, ...profile}, context) => {
  await updateOwnerAccount({...profile, id, user: {}}, {requestId: context.requestId});

  return ownersRepository.findOne({id}, {join: {user: 'id email role emailConfirmed lastSignInAt disabled createdAt', organization: 'id name slug'}});
}, updateOwnerSchema, {module: 'owners'});
