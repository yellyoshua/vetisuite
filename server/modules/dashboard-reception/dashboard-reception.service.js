import {and, asc, eq, isNull} from '@vetisuite/database/orm.js';
import {db} from '@vetisuite/database/db.js';
import {appointmentsTable, clientsTable, employeesTable, patientsTable} from '@vetisuite/database/schemas/schemas.js';
import {todayInTimeZone} from '@/utils/timezone.js';

const STATUS_TONES = {
  confirmed: 'green',
  pending: 'amber',
  completed: 'blue',
  cancelled: 'red'
};

const STATUS_LABELS = {
  confirmed: 'confirmada',
  pending: 'pendiente',
  completed: 'completada',
  cancelled: 'cancelada'
};

const DAY_LABELS = ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'];

export async function getDashboardReception (organization, timezone, params = {}) {
  const allRows = await db.select({
    id: appointmentsTable.id,
    startsAt: appointmentsTable.startsAt,
    reason: appointmentsTable.reason,
    status: appointmentsTable.status,
    patientName: patientsTable.name,
    clientName: clientsTable.name,
    vetFirstName: employeesTable.firstName,
    vetLastName: employeesTable.lastName
  })
  .from(appointmentsTable)
  .innerJoin(patientsTable, eq(appointmentsTable.patient, patientsTable.id))
  .innerJoin(clientsTable, eq(patientsTable.client, clientsTable.id))
  .leftJoin(employeesTable, eq(appointmentsTable.vet, employeesTable.id))
  .where(and(
    eq(appointmentsTable.organization, organization),
    isNull(appointmentsTable.archivedAt)
  ))
  .orderBy(asc(appointmentsTable.startsAt))
  .limit(500);

  const targetDate = params.date || resolveTargetDate(allRows, todayInTimeZone(timezone));
  const todayRows = allRows.filter((row) => row.startsAt.slice(0, 10) === targetDate);

  const kpis = buildKpis(todayRows, allRows);
  const dailyAppointments = buildDailyAppointments(allRows, targetDate);
  const todayStatuses = buildTodayStatuses(todayRows);
  const demandHours = buildDemandHours(allRows);
  const agenda = todayRows.map((row) => formatAgendaEntry(row));

  return {
    kpis,
    dailyAppointments,
    todayStatuses,
    demandHours,
    agenda
  };
}

function resolveTargetDate (rows, today) {
  if (rows.length === 0) {
    return today;
  }

  const hasToday = rows.some((row) => row.startsAt.slice(0, 10) === today);

  return hasToday ? today : rows[0].startsAt.slice(0, 10);
}

function buildKpis (todayRows, allRows) {
  const confirmed = todayRows.filter((row) => row.status === 'confirmed').length;
  const pending = todayRows.filter((row) => row.status === 'pending').length;
  const total = todayRows.length;
  const confirmedPercent = total > 0 ? Math.round((confirmed / total) * 100) : 0;

  const attendedCount = allRows.filter((row) => row.status === 'completed').length;
  const resolvedCount = allRows.filter((row) => row.status === 'completed' || row.status === 'cancelled').length;
  const attendanceRate = resolvedCount > 0 ? Math.round((attendedCount / resolvedCount) * 100) : 100;

  return {
    todayAppointments: {value: String(total), detail: 'citas agendadas hoy'},
    confirmed: {value: String(confirmed), detail: `${confirmedPercent}% de la agenda`},
    pending: {value: String(pending), detail: 'por confirmar'},
    attendance: {value: `${attendanceRate}%`, detail: 'últimos 30 días'}
  };
}

function buildDailyAppointments (rows, targetDateStr) {
  const baseTime = new Date(`${targetDateStr}T00:00:00.000Z`).getTime();

  return Array.from({length: 7}).map((_, index) => {
    const dayDate = new Date(baseTime - (6 - index) * 86400000);
    const dateStr = dayDate.toISOString().slice(0, 10);
    const isToday = index === 6;
    const label = isToday ? 'hoy' : DAY_LABELS[dayDate.getUTCDay()];
    const value = rows.filter((row) => row.startsAt.slice(0, 10) === dateStr).length;

    return {label, value, isToday};
  });
}

function buildTodayStatuses (todayRows) {
  const total = todayRows.length;
  const safeTotal = total || 1;
  const confirmed = todayRows.filter((row) => row.status === 'confirmed').length;
  const pending = todayRows.filter((row) => row.status === 'pending').length;
  const completed = todayRows.filter((row) => row.status === 'completed').length;
  const cancelled = todayRows.filter((row) => row.status === 'cancelled').length;

  return {
    total: String(total),
    segments: [
      {label: 'Confirmadas', value: String(confirmed), percent: Math.round((confirmed / safeTotal) * 100), tone: 'green'},
      {label: 'Pendientes', value: String(pending), percent: Math.round((pending / safeTotal) * 100), tone: 'amber'},
      {label: 'Completadas', value: String(completed), percent: Math.round((completed / safeTotal) * 100), tone: 'blue'}
    ],
    cancelledOrNoShow: String(cancelled)
  };
}

function buildDemandHours (rows) {
  const slots = [
    {label: '08–10', min: 8, max: 10},
    {label: '10–12', min: 10, max: 12},
    {label: '12–14', min: 12, max: 14},
    {label: '14–16', min: 14, max: 16},
    {label: '16–18', min: 16, max: 18},
    {label: '18–20', min: 18, max: 20}
  ];

  const counts = slots.map((slot) => {
    const value = rows.filter((row) => {
      const hour = Number(row.startsAt.slice(11, 13));

      return hour >= slot.min && hour < slot.max;
    }).length;

    return {label: slot.label, value};
  });

  const maxValue = Math.max(...counts.map((item) => item.value), 1);

  return counts.map((item) => ({
    label: item.label,
    value: item.value,
    percent: Math.round((item.value / maxValue) * 100)
  }));
}

function formatAgendaEntry (row) {
  const vetName = [row.vetFirstName, row.vetLastName].filter(Boolean).join(' ');
  const detail = [row.reason, vetName ? `Dr(a). ${vetName}` : ''].filter(Boolean).join(' · ');

  return {
    id: row.id,
    time: row.startsAt.slice(11, 16),
    patientName: row.patientName,
    ownerName: row.clientName,
    detail,
    status: STATUS_LABELS[row.status] || row.status,
    tone: STATUS_TONES[row.status] || 'sub'
  };
}
