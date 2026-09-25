import authCore from '@/core/auth-core.js';
import {db} from '@vetisuite/database/db.js';
import {eq} from '@vetisuite/database/orm.js';
import {usersTable} from '@vetisuite/database/schemas/schemas.js';
import {createEmployeeAccount} from '@/modules/accounts/accounts.service.js';
import {registerOrganization} from '@/modules/organizations/organizations.service.js';

const PASSWORD = 'cambiar-esta-clave';
const REQUEST_ID = 'delta-010';

const DEMO_CLINIC_EMPLOYEES = [
  {firstName: 'Veterinaria', lastName: 'Demo', position: 'veterinarian', email: 'demo+veterinarian@vetisuite.com'},
  {firstName: 'Peluquero', lastName: 'Demo', position: 'groomer', email: 'demo+groomer@vetisuite.com'}
];

const SECOND_CLINIC_EMPLOYEES = [
  {firstName: 'Veterinario', lastName: 'Norte', position: 'veterinarian', email: 'demo+north-veterinarian@vetisuite.com'},
  {firstName: 'Peluquera', lastName: 'Norte', position: 'groomer', email: 'demo+north-groomer@vetisuite.com'},
  {firstName: 'Recepción', lastName: 'Norte', position: 'receptionist', email: 'demo+north-receptionist@vetisuite.com'}
];

async function isRegistered (email) {
  return Boolean(await authCore.user.findByEmail(email));
}

async function findDemoOrganization () {
  const [demoUser] = await db.select({organization: usersTable.organization})
  .from(usersTable)
  .where(eq(usersTable.email, 'demo+owner@vetisuite.com'))
  .limit(1);

  return demoUser?.organization || null;
}

async function insertEmployees (organization, employees) {
  for (const {email, ...employee} of employees) {
    if (await isRegistered(email)) {
      continue;
    }

    await createEmployeeAccount({
      organization,
      ...employee,
      user: {email, password: PASSWORD}
    }, {requestId: REQUEST_ID});
  }
}

async function insertDemoClinicEmployees () {
  const organization = await findDemoOrganization();

  if (!organization) {
    return;
  }

  await insertEmployees(organization, DEMO_CLINIC_EMPLOYEES);
}

async function insertSecondClinic () {
  const ownerEmail = 'demo+north-owner@vetisuite.com';

  if (await isRegistered(ownerEmail)) {
    return;
  }

  const {organization} = await registerOrganization({
    name: 'Clínica Norte',
    owner: {firstName: 'Dueño', lastName: 'Norte', user: {email: ownerEmail, password: PASSWORD}}
  }, {requestId: REQUEST_ID});

  await insertEmployees(organization.id, SECOND_CLINIC_EMPLOYEES);
}

export default {
  description: 'Insert dev login demo accounts (non-production)',
  async execute () {
    if (process.env.APP_ENV === 'production') {
      return;
    }

    await insertDemoClinicEmployees();
    await insertSecondClinic();
  }
};
