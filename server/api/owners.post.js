import baseRoute from '@/core/base-route.js';
import {createOwnerSchema} from '@/modules/owners/owners.schema.js';
import {createOwnerAccount} from '@/modules/accounts/accounts.service.js';
import {assertOrganizationExists} from '@/modules/organizations/organizations.service.js';
import ownersRepository from '@/modules/owners/owners.repository.js';

export default baseRoute(async (data, context) => {
  await assertOrganizationExists(data.organization);

  const owner = await createOwnerAccount({
    organization: data.organization,
    firstName: data.firstName,
    lastName: data.lastName,
    phone: data.phone,
    user: {email: data.email, password: data.password}
  }, {requestId: context.requestId});

  return ownersRepository.findOne({id: owner.id}, {join: {user: 'id email role emailConfirmed lastSignInAt disabled createdAt', organization: 'id name slug'}});
}, createOwnerSchema, {module: 'owners'});
