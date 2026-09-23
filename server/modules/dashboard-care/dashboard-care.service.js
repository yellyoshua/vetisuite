import {and, desc, eq, inArray, isNull} from '@vetisuite/database/orm.js';
import {db} from '@vetisuite/database/db.js';
import {patientsTable, visitsServiceTable} from '@vetisuite/database/schemas/schemas.js';

export async function getDashboardCare (organization) {
  const now = new Date();
  const todayStr = now.toISOString().slice(0, 10);

  const [
    waitingRows,
    consultationRows,
    dischargedRows,
    referralRows
  ] = await Promise.all([
    fetchWaitingServices(organization),
    fetchOngoingConsultations(organization),
    fetchDischargedServices(organization, todayStr),
    fetchReferralServices(organization)
  ]);

  const kpis = {
    waiting: {value: String(waitingRows.length), detail: 'pacientes en sala'},
    inConsultation: {value: String(consultationRows.length), detail: 'consultas activas'},
    dischargedToday: {value: String(dischargedRows.length), detail: 'altas del día'}
  };

  const panels = {
    ongoingConsultations: {
      meta: `${consultationRows.length} en curso`,
      items: consultationRows.map((row) => ({
        name: row.patientName,
        detail: row.label,
        badge: 'En consulta',
        tone: 'blue'
      }))
    },
    referrals: {
      meta: `${referralRows.length} derivaciones`,
      items: referralRows.map((row) => ({
        name: row.patientName,
        detail: row.label,
        badge: row.type === 'laboratory' ? 'Laboratorio' : 'Peluquería',
        tone: 'green'
      }))
    }
  };

  return {kpis, panels};
}

async function fetchWaitingServices (organization) {
  return db.select({id: visitsServiceTable.id})
  .from(visitsServiceTable)
  .where(and(
    eq(visitsServiceTable.organization, organization),
    eq(visitsServiceTable.status, 'waiting'),
    isNull(visitsServiceTable.archivedAt)
  ));
}

async function fetchOngoingConsultations (organization) {
  return db.select({
    id: visitsServiceTable.id,
    label: visitsServiceTable.label,
    patientName: patientsTable.name
  })
  .from(visitsServiceTable)
  .innerJoin(patientsTable, eq(visitsServiceTable.patient, patientsTable.id))
  .where(and(
    eq(visitsServiceTable.organization, organization),
    eq(visitsServiceTable.type, 'veterinary'),
    eq(visitsServiceTable.status, 'in_consultation'),
    isNull(visitsServiceTable.archivedAt)
  ))
  .orderBy(desc(visitsServiceTable.createdAt))
  .limit(10);
}

async function fetchDischargedServices (organization, todayStr) {
  const rows = await db.select({
    id: visitsServiceTable.id,
    updatedAt: visitsServiceTable.updatedAt
  })
  .from(visitsServiceTable)
  .where(and(
    eq(visitsServiceTable.organization, organization),
    inArray(visitsServiceTable.status, ['done', 'delivered']),
    isNull(visitsServiceTable.archivedAt)
  ));

  return rows.filter((row) => row.updatedAt && row.updatedAt.toISOString().slice(0, 10) === todayStr);
}

async function fetchReferralServices (organization) {
  return db.select({
    id: visitsServiceTable.id,
    type: visitsServiceTable.type,
    label: visitsServiceTable.label,
    patientName: patientsTable.name
  })
  .from(visitsServiceTable)
  .innerJoin(patientsTable, eq(visitsServiceTable.patient, patientsTable.id))
  .where(and(
    eq(visitsServiceTable.organization, organization),
    inArray(visitsServiceTable.type, ['grooming', 'laboratory']),
    isNull(visitsServiceTable.archivedAt)
  ))
  .orderBy(desc(visitsServiceTable.createdAt))
  .limit(10);
}
