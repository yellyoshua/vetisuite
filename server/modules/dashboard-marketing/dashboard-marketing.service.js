import {desc, eq} from '@vetisuite/database/orm.js';
import {db} from '@vetisuite/database/db.js';
import {
  appointmentsTable,
  clientsTable,
  portalsSubmissionTable,
  portalsTable
} from '@vetisuite/database/schemas/schemas.js';

export async function getDashboardMarketing (organization) {
  const [appointments, clients, portals, submissions] = await Promise.all([
    fetchAppointments(organization),
    fetchClients(organization),
    fetchPortals(organization),
    fetchSubmissions(organization)
  ]);

  const kpis = buildKpis(appointments, clients);
  const bookingOrigins = buildBookingOrigins(appointments);
  const portalPerformance = buildPortalPerformance(portals, submissions);
  const funnel = buildFunnel(appointments);

  return {kpis, bookingOrigins, portalPerformance, funnel};
}

function buildKpis (appointments, clients) {
  const portalBookings = appointments.filter((row) => row.source === 'portal');

  return {
    onlineBookings: {value: String(portalBookings.length), detail: 'reservas por portal'},
    newClients: {value: String(clients.length), detail: 'clientes registrados'}
  };
}

function buildBookingOrigins (appointments) {
  const total = appointments.length;

  const countBySource = appointments.reduce((acc, row) => {
    const src = row.source || 'staff';
    acc[src] = (acc[src] || 0) + 1;

    return acc;
  }, {});

  const portalCount = countBySource.portal || 0;
  const staffCount = countBySource.staff || 0;

  const segments = [
    {
      label: 'Portal de reservas',
      value: String(portalCount),
      percent: total > 0 ? Math.round((portalCount / total) * 100) : 0,
      tone: 'green'
    },
    {
      label: 'Clínica / Recepción',
      value: String(staffCount),
      percent: total > 0 ? Math.round((staffCount / total) * 100) : 0,
      tone: 'blue'
    }
  ];

  return {
    total: String(total),
    segments
  };
}

function buildPortalPerformance (portals, submissions) {
  const submissionsByPortal = submissions.reduce((acc, row) => {
    acc[row.portal] = (acc[row.portal] || 0) + 1;

    return acc;
  }, {});

  const totalSubmissions = submissions.length;

  return portals.map((portal) => {
    const count = submissionsByPortal[portal.id] || 0;
    const percent = totalSubmissions > 0 ? Math.round((count / totalSubmissions) * 100) : 0;
    const tone = portal.status === 'published' ? 'green' : 'gray';

    return {
      name: portal.name,
      status: portal.status,
      tone,
      detail: `${count} solicitudes`,
      percent
    };
  });
}

function buildFunnel (appointments) {
  const portalAppointments = appointments.filter((row) => row.source === 'portal');
  const bookedTotal = portalAppointments.length;
  const attendedAppointments = portalAppointments.filter((row) => row.status === 'completed');
  const attendedTotal = attendedAppointments.length;

  const attendedPercent = bookedTotal > 0 ? Math.round((attendedTotal / bookedTotal) * 100) : 0;

  return {
    booked: {
      value: String(bookedTotal),
      share: '100%',
      percent: 100
    },
    attended: {
      value: String(attendedTotal),
      share: `${attendedPercent}%`,
      percent: attendedPercent
    }
  };
}

async function fetchAppointments (organization) {
  return db.select({
    id: appointmentsTable.id,
    source: appointmentsTable.source,
    status: appointmentsTable.status,
    createdAt: appointmentsTable.createdAt
  })
  .from(appointmentsTable)
  .where(eq(appointmentsTable.organization, organization))
  .orderBy(desc(appointmentsTable.createdAt));
}

async function fetchClients (organization) {
  return db.select({
    id: clientsTable.id,
    createdAt: clientsTable.createdAt
  })
  .from(clientsTable)
  .where(eq(clientsTable.organization, organization));
}

async function fetchPortals (organization) {
  return db.select({
    id: portalsTable.id,
    name: portalsTable.name,
    status: portalsTable.status
  })
  .from(portalsTable)
  .where(eq(portalsTable.organization, organization));
}

async function fetchSubmissions (organization) {
  return db.select({
    id: portalsSubmissionTable.id,
    portal: portalsSubmissionTable.portal,
    status: portalsSubmissionTable.status
  })
  .from(portalsSubmissionTable)
  .where(eq(portalsSubmissionTable.organization, organization));
}
