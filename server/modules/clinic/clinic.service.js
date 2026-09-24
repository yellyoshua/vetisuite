import {and, eq, ilike, isNull, or} from '@vetisuite/database/orm.js';
import {db} from '@vetisuite/database/db.js';
import {
  clientsTable,
  consultationsPrescriptionTable,
  consultationsTable,
  employeesTable,
  patientsTable,
  visitsServiceLabTable,
  visitsServiceTable
} from '@vetisuite/database/schemas/schemas.js';
import {dateInTimeZone, todayInTimeZone} from '@/utils/timezone.js';

export async function listClinic (organization, timezone, params = {}) {
  const employees = await findOrganizationEmployees(organization);
  const scoped = {...params, timezone};
  const [consultations, prescriptions, labOrders] = await Promise.all([
    fetchConsultations(organization, scoped),
    fetchPrescriptions(organization, scoped),
    fetchLabOrders(organization, scoped, employees)
  ]);

  const allRecords = [...consultations, ...prescriptions, ...labOrders];
  const sorted = sortRecords(allRecords, params.order);
  const page = Math.max(1, params.page || 1);
  const limit = Math.min(100, Math.max(1, params.limit || 10));
  const offset = (page - 1) * limit;

  return sorted.slice(offset, offset + limit);
}

export async function countClinic (organization, timezone, params = {}) {
  const employees = await findOrganizationEmployees(organization);
  const scoped = {...params, timezone};
  const [consultations, prescriptions, labOrders] = await Promise.all([
    fetchConsultations(organization, scoped),
    fetchPrescriptions(organization, scoped),
    fetchLabOrders(organization, scoped, employees)
  ]);

  return consultations.length + prescriptions.length + labOrders.length;
}

async function fetchConsultations (organization, params) {
  if (shouldSkipConsultations(params)) {
    return [];
  }

  const conditions = [
    eq(consultationsTable.organization, organization)
  ];

  if (params.id) {
    conditions.push(eq(consultationsTable.id, params.id));
  }

  if (params.search) {
    conditions.push(buildSearchCondition(consultationsTable.diagnosis, params.search));
  }

  const rows = await db.select({
    id: consultationsTable.id,
    diagnosis: consultationsTable.diagnosis,
    createdAt: consultationsTable.createdAt,
    patientName: patientsTable.name,
    ownerName: clientsTable.name,
    vetFirstName: employeesTable.firstName,
    vetLastName: employeesTable.lastName
  })
  .from(consultationsTable)
  .leftJoin(patientsTable, eq(consultationsTable.patient, patientsTable.id))
  .leftJoin(clientsTable, eq(patientsTable.client, clientsTable.id))
  .leftJoin(employeesTable, eq(consultationsTable.vet, employeesTable.id))
  .where(and(...conditions))
  .limit(100);

  const mapped = rows.map((row) => ({
    id: row.id,
    patientName: row.patientName || 'Paciente',
    ownerName: row.ownerName || 'Cliente',
    kind: 'consultation',
    title: row.diagnosis || 'Consulta médica',
    createdAt: row.createdAt.toISOString(),
    responsible: formatResponsible(row.vetFirstName, row.vetLastName),
    status: 'result',
    resolvedAt: row.createdAt.toISOString()
  }));

  if (params.preset === 'resolved-today') {
    return mapped.filter((item) => isResolvedToday(item.resolvedAt, params.timezone));
  }

  return mapped;
}

async function fetchPrescriptions (organization, params) {
  if (shouldSkipPrescriptions(params)) {
    return [];
  }

  const conditions = [
    eq(consultationsPrescriptionTable.organization, organization)
  ];

  if (params.id) {
    conditions.push(eq(consultationsPrescriptionTable.id, params.id));
  }

  if (params.search) {
    conditions.push(buildSearchCondition(consultationsPrescriptionTable.medication, params.search));
  }

  const rows = await db.select({
    id: consultationsPrescriptionTable.id,
    medication: consultationsPrescriptionTable.medication,
    createdAt: consultationsPrescriptionTable.createdAt,
    patientName: patientsTable.name,
    ownerName: clientsTable.name,
    vetFirstName: employeesTable.firstName,
    vetLastName: employeesTable.lastName
  })
  .from(consultationsPrescriptionTable)
  .leftJoin(consultationsTable, eq(consultationsPrescriptionTable.consultation, consultationsTable.id))
  .leftJoin(patientsTable, eq(consultationsTable.patient, patientsTable.id))
  .leftJoin(clientsTable, eq(patientsTable.client, clientsTable.id))
  .leftJoin(employeesTable, eq(consultationsTable.vet, employeesTable.id))
  .where(and(...conditions))
  .limit(100);

  const mapped = rows.map((row) => ({
    id: row.id,
    patientName: row.patientName || 'Paciente',
    ownerName: row.ownerName || 'Cliente',
    kind: 'prescription',
    title: formatPrescriptionTitle(row.medication),
    createdAt: row.createdAt.toISOString(),
    responsible: formatResponsible(row.vetFirstName, row.vetLastName),
    status: 'result',
    resolvedAt: row.createdAt.toISOString()
  }));

  if (params.preset === 'resolved-today') {
    return mapped.filter((item) => isResolvedToday(item.resolvedAt, params.timezone));
  }

  return mapped;
}

async function fetchLabOrders (organization, params, employees) {
  if (params.kind && params.kind !== 'lab-order') {
    return [];
  }

  const conditions = [
    eq(visitsServiceTable.organization, organization),
    eq(visitsServiceTable.type, 'laboratory'),
    isNull(visitsServiceTable.archivedAt)
  ];

  if (params.id) {
    conditions.push(eq(visitsServiceTable.id, params.id));
  }

  if (params.search) {
    conditions.push(buildSearchCondition(visitsServiceTable.label, params.search));
  }

  const rows = await db.select({
    id: visitsServiceTable.id,
    label: visitsServiceTable.label,
    serviceStatus: visitsServiceTable.status,
    serviceStarted: visitsServiceTable.started,
    createdAt: visitsServiceTable.createdAt,
    updatedAt: visitsServiceTable.updatedAt,
    labResult: visitsServiceLabTable.result,
    labCreatedAt: visitsServiceLabTable.createdAt,
    patientName: patientsTable.name,
    ownerName: clientsTable.name
  })
  .from(visitsServiceTable)
  .leftJoin(visitsServiceLabTable, eq(visitsServiceLabTable.visitService, visitsServiceTable.id))
  .leftJoin(patientsTable, eq(visitsServiceTable.patient, patientsTable.id))
  .leftJoin(clientsTable, eq(patientsTable.client, clientsTable.id))
  .where(and(...conditions))
  .limit(100);

  const staffName = resolveStaffName(employees, 'laboratory');

  const mapped = rows.map((row) => {
    const status = resolveLabStatus(row.labResult, row.serviceStatus, row.serviceStarted);
    const resolvedAt = status === 'result' ? resolveLabResolvedAt(row) : null;

    return {
      id: row.id,
      patientName: row.patientName || 'Paciente',
      ownerName: row.ownerName || 'Cliente',
      kind: 'lab-order',
      title: row.label || 'Orden de laboratorio',
      createdAt: row.createdAt.toISOString(),
      responsible: staffName,
      status,
      resolvedAt
    };
  });

  return mapped.filter((item) => matchesStatusAndPreset(item, params));
}

function shouldSkipConsultations (params) {
  if (params.kind && params.kind !== 'consultation') {
    return true;
  }

  if (params.status && params.status !== 'result') {
    return true;
  }

  return params.preset === 'pending-result';
}

function shouldSkipPrescriptions (params) {
  if (params.kind && params.kind !== 'prescription') {
    return true;
  }

  if (params.status && params.status !== 'result') {
    return true;
  }

  return params.preset === 'pending-result';
}

function buildSearchCondition (titleColumn, search) {
  const pattern = `%${search.replace(/[%_\\]/g, '\\$&')}%`;

  return or(
    ilike(patientsTable.name, pattern),
    ilike(clientsTable.name, pattern),
    ilike(titleColumn, pattern)
  );
}

function formatPrescriptionTitle (medication) {
  if (!medication) {
    return 'Receta médica';
  }

  return medication.toLowerCase().startsWith('receta') ? medication : `Receta: ${medication}`;
}

function formatResponsible (firstName, lastName) {
  if (firstName && lastName) {
    return `${firstName} ${lastName}`;
  }

  return 'Veterinario';
}

function resolveLabStatus (labResult, serviceStatus, serviceStarted) {
  if (labResult || serviceStatus === 'resulted' || serviceStatus === 'done') {
    return 'result';
  }

  if (serviceStarted || serviceStatus === 'in_progress') {
    return 'in-progress';
  }

  return 'requested';
}

function resolveLabResolvedAt (row) {
  const date = row.labCreatedAt || row.updatedAt || row.createdAt;

  return date ? date.toISOString() : null;
}

function matchesStatusAndPreset (item, params) {
  if (params.status && item.status !== params.status) {
    return false;
  }

  if (params.preset === 'pending-result' && item.status === 'result') {
    return false;
  }

  if (params.preset === 'resolved-today' && (item.status !== 'result' || !isResolvedToday(item.resolvedAt, params.timezone))) {
    return false;
  }

  return true;
}

function isResolvedToday (dateString, timezone) {
  if (!dateString) {
    return false;
  }

  return dateInTimeZone(new Date(dateString), timezone) === todayInTimeZone(timezone);
}

function sortRecords (records, order) {
  return [...records].sort((first, second) => {
    const firstTime = new Date(first.createdAt).getTime();
    const secondTime = new Date(second.createdAt).getTime();

    return order === 'asc' ? firstTime - secondTime : secondTime - firstTime;
  });
}

async function findOrganizationEmployees (organization) {
  return db.select({
    id: employeesTable.id,
    firstName: employeesTable.firstName,
    lastName: employeesTable.lastName,
    position: employeesTable.position
  })
  .from(employeesTable)
  .where(and(eq(employeesTable.organization, organization), isNull(employeesTable.archivedAt)));
}

function resolveStaffName (employees, serviceType) {
  const targetPosition = serviceType === 'grooming' ? 'groomer' : 'veterinarian';
  const match = employees.find((emp) => emp.position === targetPosition) || employees[0];

  return match ? `${match.firstName} ${match.lastName}` : 'Lab. interno';
}
