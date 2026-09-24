import {db} from '@vetisuite/database/db.js';
import {eq} from '@vetisuite/database/orm.js';
import {todayInTimeZone} from '@/utils/timezone.js';
import {
  appointmentsAvailabilityTable,
  appointmentsTable,
  consultationsPrescriptionTable,
  consultationsTable,
  employeesTable,
  expensesTable,
  invoicesItemTable,
  invoicesTable,
  organizationsTable,
  patientsTable,
  portalsTable,
  productsTable,
  usersTable,
  visitsServiceGroomingTable,
  visitsServiceLabTable,
  visitsServiceTable,
  visitsTable
} from '@vetisuite/database/schemas/schemas.js';

const DEMO_TIMEZONE = 'America/Guayaquil';

export default {
  description: 'Insert wave 2 demo data (appointments, visits, clinic, inventory, billing, finance, portals)',
  async execute () {
    if (process.env.APP_ENV === 'production') {
      return;
    }

    const organization = await findDemoOrganization();

    if (!organization) {
      return;
    }

    const existingProducts = await db.select({id: productsTable.id})
    .from(productsTable)
    .where(eq(productsTable.organization, organization))
    .limit(1);

    if (existingProducts.length > 0) {
      return;
    }

    const [employee] = await db.select({id: employeesTable.id})
    .from(employeesTable)
    .where(eq(employeesTable.organization, organization))
    .limit(1);

    const patients = await db.select({id: patientsTable.id, client: patientsTable.client})
    .from(patientsTable)
    .where(eq(patientsTable.organization, organization))
    .limit(5);

    if (patients.length === 0) {
      return;
    }

    const employeeId = employee?.id || null;

    await db.transaction(async (tx) => {
      await tx.update(organizationsTable).set({timezone: DEMO_TIMEZONE}).where(eq(organizationsTable.id, organization)).returning({id: organizationsTable.id});
      await insertAvailability(tx, organization);
      await insertAppointments(tx, organization, patients, employeeId);
      await insertVisitsAndClinic(tx, organization, patients, employeeId);
      await insertProducts(tx, organization);
      await insertBillingAndExpenses(tx, organization, patients);
      await insertPortals(tx, organization);
    });
  }
};

async function findDemoOrganization () {
  const [demoUser] = await db.select({organization: usersTable.organization})
  .from(usersTable)
  .where(eq(usersTable.email, 'demo+owner@vetisuite.com'))
  .limit(1);

  return demoUser?.organization || null;
}

async function insertAvailability (tx, organization) {
  const week = [
    {weekday: 'monday', enabled: true, ranges: [{start: '09:00', end: '18:00'}]},
    {weekday: 'tuesday', enabled: true, ranges: [{start: '09:00', end: '18:00'}]},
    {weekday: 'wednesday', enabled: true, ranges: [{start: '09:00', end: '18:00'}]},
    {weekday: 'thursday', enabled: true, ranges: [{start: '09:00', end: '18:00'}]},
    {weekday: 'friday', enabled: true, ranges: [{start: '09:00', end: '18:00'}]},
    {weekday: 'saturday', enabled: true, ranges: [{start: '09:00', end: '14:00'}]},
    {weekday: 'sunday', enabled: false, ranges: []}
  ];

  await tx.insert(appointmentsAvailabilityTable).values({
    organization,
    week,
    overrides: [],
    slotMinutes: 30,
    bufferBefore: 0,
    bufferAfter: 0,
    minNoticeHours: 2,
    maxAdvanceDays: 60,
    maxPerDay: 0,
    onlineBooking: true,
    autoConfirm: false
  });
}

async function insertAppointments (tx, organization, patients, employeeId) {
  const today = todayInTimeZone(DEMO_TIMEZONE);
  const at = (hour) => `${today}T${hour}:00:00`;

  const demoAppointments = [
    {patient: patients[0].id, vet: employeeId, startsAt: at(10), reason: 'Consulta general y vacunación', status: 'confirmed', source: 'staff'},
    {patient: (patients[1] || patients[0]).id, vet: employeeId, startsAt: at(11), reason: 'Chequeo de rutina', status: 'pending', source: 'portal'},
    {patient: (patients[2] || patients[0]).id, vet: employeeId, startsAt: at(12), reason: 'Corte y baño higiénico', status: 'completed', source: 'staff'}
  ];

  await tx.insert(appointmentsTable).values(demoAppointments.map((item) => ({organization, timezone: DEMO_TIMEZONE, durationMinutes: 30, ...item})));
}

async function insertVisitsAndClinic (tx, organization, patients, employeeId) {
  const second = patients[1] || patients[0];
  const [visit1] = await tx.insert(visitsTable).values({organization, client: patients[0].client, started: true}).returning({id: visitsTable.id});
  const [visit2] = second.client === patients[0].client
    ? [visit1]
    : await tx.insert(visitsTable).values({organization, client: second.client, started: true}).returning({id: visitsTable.id});

  await tx.insert(visitsServiceTable).values({
    organization,
    visit: visit1.id,
    patient: patients[0].id,
    type: 'veterinary',
    label: 'Consulta médica general',
    price: 25.00,
    status: 'done',
    started: true
  }).returning({id: visitsServiceTable.id});

  const [service2] = await tx.insert(visitsServiceTable).values({
    organization,
    visit: visit1.id,
    patient: patients[0].id,
    type: 'grooming',
    label: 'Baño y corte premium',
    price: 30.00,
    status: 'in_progress',
    started: true
  }).returning({id: visitsServiceTable.id});

  const [service3] = await tx.insert(visitsServiceTable).values({
    organization,
    visit: visit2.id,
    patient: second.id,
    type: 'laboratory',
    label: 'Hemograma completo',
    price: 35.00,
    status: 'resulted',
    started: true
  }).returning({id: visitsServiceTable.id});

  await tx.insert(visitsServiceGroomingTable).values({
    organization,
    visitService: service2.id,
    groomer: employeeId,
    belongings: 'Collar rojo y correa'
  });

  const [consultation] = await tx.insert(consultationsTable).values({
    organization,
    patient: patients[0].id,
    vet: employeeId,
    weightKg: 14.2,
    temperatureC: 38.6,
    heartRateBpm: 95,
    anamnesis: 'Paciente alegre, apetito normal, viene por chequeo anual',
    diagnosis: 'Paciente en excelente condición física'
  }).returning({id: consultationsTable.id});

  await tx.insert(consultationsPrescriptionTable).values({
    organization,
    consultation: consultation.id,
    medication: 'Complejo Vitamínico Canino',
    dosage: '1 pastilla diaria por 30 días'
  });

  await tx.insert(visitsServiceLabTable).values({
    organization,
    visitService: service3.id,
    result: 'Hemograma dentro de parámetros normales. Leucocitos y plaquetas correctos.'
  });
}

async function insertProducts (tx, organization) {
  const demoProducts = [
    {name: 'Vacuna Séxtuple Canina', category: 'vaccines', stock: 45, minStock: 10, price: 22.50, expiry: '2027-03-15'},
    {name: 'Amoxicilina + Ácido Clavulánico 250mg', category: 'medications', stock: 80, minStock: 20, price: 15.00, expiry: '2026-11-20'},
    {name: 'Shampoo Hipoalergénico Avena 500ml', category: 'grooming', stock: 18, minStock: 5, price: 18.00, expiry: '2028-01-10'},
    {name: 'Alimento Premium Adulto 15kg', category: 'food', stock: 12, minStock: 4, price: 65.00, expiry: '2026-12-05'},
    {name: 'Jeringas Descartables 3ml x 100', category: 'supplies', stock: 25, minStock: 5, price: 12.00, expiry: '2029-06-30'}
  ];

  await tx.insert(productsTable).values(demoProducts.map((prod) => ({organization, ...prod})));
}

async function insertBillingAndExpenses (tx, organization, patients) {
  const second = patients[1] || patients[0];

  const [invoice1] = await tx.insert(invoicesTable).values({
    organization,
    client: patients[0].client,
    number: 1040,
    subtotal: 55.00,
    discount: 0,
    discountPercent: 0,
    tax: 8.25,
    previousDebt: 0,
    total: 63.25,
    method: 'cash'
  }).returning({id: invoicesTable.id});

  const [invoice2] = await tx.insert(invoicesTable).values({
    organization,
    client: second.client,
    number: 1041,
    subtotal: 35.00,
    discount: 0,
    discountPercent: 0,
    tax: 5.25,
    previousDebt: 15.00,
    total: 55.25,
    method: 'card'
  }).returning({id: invoicesTable.id});

  await tx.insert(invoicesItemTable).values([
    {organization, invoice: invoice1.id, description: 'Consulta médica general', amount: 25.00, area: 'clinic', patient: patients[0].id},
    {organization, invoice: invoice1.id, description: 'Baño y corte premium', amount: 30.00, area: 'grooming', patient: patients[0].id},
    {organization, invoice: invoice2.id, description: 'Hemograma completo', amount: 35.00, area: 'laboratory', patient: second.id}
  ]);

  await tx.insert(expensesTable).values([
    {organization, category: 'supplies', description: 'Reposición de descartables y gasas', amount: 120.00}
  ]);
}

async function insertPortals (tx, organization) {
  await tx.insert(portalsTable).values([
    {
      organization,
      name: 'Portal Principal de Reservas',
      slug: 'reservas-central',
      purpose: 'booking',
      status: 'published',
      palettePrimary: '#2563eb',
      paletteAccent: '#3b82f6',
      paletteBackground: '#f8fafc',
      markdown: '# Agenda tu cita médica veterinaria en línea\nSelecciona el profesional y horario conveniente.',
      logoUrl: 'https://images.vetisuite.test/logo-demo.png',
      vetPolicy: 'clinic_assigns',
      autoConfirm: true
    },
    {
      organization,
      name: 'Campaña Vacunación 2026',
      slug: 'vacunacion-2026',
      purpose: 'capture',
      status: 'draft',
      palettePrimary: '#059669',
      paletteAccent: '#10b981',
      paletteBackground: '#f0fdf4',
      markdown: '# Registro Anticipado de Vacunación\nRegistra a tu mascota para acceder a descuentos.',
      logoUrl: 'https://images.vetisuite.test/vacuna-demo.png',
      vetPolicy: 'clinic_assigns',
      autoConfirm: false
    }
  ]);
}
