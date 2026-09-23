import {db} from '@vetisuite/database/db.js';
import {eq} from '@vetisuite/database/orm.js';
import {clientsTable, patientsTable, usersTable} from '@vetisuite/database/schemas/schemas.js';

const DEMO_CLIENTS = [
  {name: 'Carla Méndez', phone: '5551001', email: 'carla@correo.test'},
  {name: 'Jorge Lara', phone: '5551002', email: 'jorge.lara@correo.test'},
  {name: 'Carolina Ríos', phone: '5551003', email: 'carolina.rios@correo.test'},
  {name: 'Marco Salazar', phone: '5551004', email: 'marco.salazar@correo.test'},
  {name: 'Elena Buitrón', phone: '5551005', email: 'elena.buitron@correo.test'}
];

const DEMO_PATIENTS_BY_INDEX = [
  [{name: 'Firulais', species: 'dog', breed: 'Golden Retriever', sex: 'male', birthDate: '2021-03-15'}],
  [{name: 'Michi', species: 'cat', breed: 'Siamés', sex: 'female', birthDate: '2022-07-20'}],
  [
    {name: 'Max', species: 'dog', breed: 'Labrador', sex: 'male', birthDate: '2020-11-10'},
    {name: 'Luna', species: 'cat', breed: 'Persa', sex: 'female', birthDate: '2023-01-05'}
  ],
  [{name: 'Rocky', species: 'dog', breed: 'Bulldog Francés', sex: 'male', birthDate: '2019-09-18'}],
  [{name: 'Kiwi', species: 'bird', breed: 'Periquito Australiano', sex: 'female', birthDate: '2023-04-12'}]
];

async function findDemoOrganization () {
  const [demoUser] = await db.select({organization: usersTable.organization})
  .from(usersTable)
  .where(eq(usersTable.email, 'demo+owner@vetisuite.com'))
  .limit(1);

  return demoUser?.organization || null;
}

export default {
  description: 'Insert wave 1 demo clients and patients (non-production)',
  async execute () {
    if (process.env.APP_ENV === 'production') {
      return;
    }

    const organization = await findDemoOrganization();

    if (!organization) {
      return;
    }

    const existingClients = await db.select({id: clientsTable.id})
    .from(clientsTable)
    .where(eq(clientsTable.organization, organization))
    .limit(1);

    if (existingClients.length > 0) {
      return;
    }

    for (const [index, clientData] of DEMO_CLIENTS.entries()) {
      const [client] = await db.insert(clientsTable).values({
        organization,
        name: clientData.name,
        phone: clientData.phone,
        email: clientData.email
      }).returning({id: clientsTable.id});

      const patients = DEMO_PATIENTS_BY_INDEX[index] || [];

      for (const patientData of patients) {
        await db.insert(patientsTable).values({
          organization,
          client: client.id,
          name: patientData.name,
          species: patientData.species,
          breed: patientData.breed,
          sex: patientData.sex,
          birthDate: patientData.birthDate
        }).returning({id: patientsTable.id});
      }
    }
  }
};
