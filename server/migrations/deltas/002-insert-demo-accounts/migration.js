import authCore from '@/core/auth-core.js';
import {createEmployeeAccount, createSuperadminAccount} from '@/modules/accounts/accounts.service.js';
import {createOrganization, registerOrganization} from '@/modules/organizations/organizations.service.js';

const PASSWORD = 'cambiar-esta-clave';
const REQUEST_ID = 'delta-002';

async function isRegistered (email) {
  return Boolean(await authCore.user.findByEmail(email));
}

async function insertSuperadmin () {
  const email = 'demo+superadmin@vetisuite.com';

  if (await isRegistered(email)) {
    return;
  }

  const platform = await createOrganization({name: 'VetiSuite'});

  await createSuperadminAccount({
    organization: platform.id,
    firstName: 'Superadmin',
    lastName: 'VetiSuite',
    user: {email, password: PASSWORD}
  }, {requestId: REQUEST_ID});
}

async function insertClinic () {
  const ownerEmail = 'demo+owner@vetisuite.com';

  if (await isRegistered(ownerEmail)) {
    return;
  }

  const {organization} = await registerOrganization({
    name: 'Clínica Demo',
    owner: {firstName: 'Dueña', lastName: 'Demo', user: {email: ownerEmail, password: PASSWORD}}
  }, {requestId: REQUEST_ID});

  await createEmployeeAccount({
    organization: organization.id,
    firstName: 'Recepción',
    lastName: 'Demo',
    position: 'receptionist',
    user: {email: 'demo+employee@vetisuite.com', password: PASSWORD}
  }, {requestId: REQUEST_ID});
}

export default {
  description: 'Insert demo accounts (non-production)',
  async execute () {
    if (process.env.APP_ENV === 'production') {
      return;
    }

    await insertSuperadmin();
    await insertClinic();
  }
};
