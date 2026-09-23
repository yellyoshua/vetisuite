import {desc, eq} from '@vetisuite/database/orm.js';
import {db} from '@vetisuite/database/db.js';
import {
  employeesTable,
  ownersTable,
  sessionsTable,
  usersTable
} from '@vetisuite/database/schemas/schemas.js';

export async function getDashboardAdministration (organization) {
  const [users, employees, owners, sessions] = await Promise.all([
    fetchUsers(organization),
    fetchEmployees(organization),
    fetchOwners(organization),
    fetchSessions(organization)
  ]);

  const kpis = buildKpis(users, employees, sessions);
  const panels = buildPanels(users, employees, owners, sessions);

  return {kpis, panels};
}

function buildKpis (users, employees, sessions) {
  const activeUsers = users.filter((row) => !row.disabled);
  const todayStr = new Date().toISOString().slice(0, 10);
  const todaySessions = sessions.filter((row) => row.createdAt.toISOString().slice(0, 10) === todayStr);

  const distinctRoles = new Set(['owner', ...employees.map((row) => row.position)]);

  return {
    activeUsers: {
      value: String(activeUsers.length),
      detail: `de ${users.length} cuentas creadas`
    },
    roles: {
      value: String(distinctRoles.size),
      detail: 'administrador, veterinario, estilista, recepción'
    },
    todayLogins: {
      value: String(todaySessions.length),
      detail: todaySessions.length > 0 ? `${todaySessions.length} accesos hoy` : 'sin accesos hoy'
    },
    enabledModules: {
      value: '8',
      detail: 'de 8 módulos disponibles'
    }
  };
}

function buildPanels (users, employees, owners, sessions) {
  const employeesByPosition = employees.reduce((acc, row) => {
    acc[row.position] = (acc[row.position] || 0) + 1;

    return acc;
  }, {});

  const roleItems = [
    {
      name: 'Administrador',
      detail: `acceso total · ${owners.length} usuario${owners.length === 1 ? '' : 's'}`,
      badge: 'total',
      tone: 'blue'
    },
    {
      name: 'Veterinario',
      detail: `Atención, Laboratorio · ${employeesByPosition.veterinarian || 0} usuarios`,
      badge: 'atención',
      tone: 'green'
    },
    {
      name: 'Estilista',
      detail: `Estética · ${employeesByPosition.groomer || 0} usuarios`,
      badge: 'estética',
      tone: 'green'
    },
    {
      name: 'Recepción',
      detail: `Recepción, Facturación · ${employeesByPosition.receptionist || 0} usuarios`,
      badge: 'entrada',
      tone: 'green'
    }
  ];

  const userMap = new Map();
  owners.forEach((row) => userMap.set(row.user, `${row.firstName} ${row.lastName}`));
  employees.forEach((row) => userMap.set(row.user, `${row.firstName} ${row.lastName}`));

  const recentLoginItems = sessions.slice(0, 10).map((row) => {
    const userName = userMap.get(row.user) || 'Usuario';
    const dateStr = row.createdAt.toISOString().slice(0, 10);

    return {
      name: userName,
      detail: `Acceso registrado el ${dateStr}`,
      badge: 'activo',
      tone: 'green'
    };
  });

  return {
    rolePermissions: {
      meta: '4 roles',
      items: roleItems
    },
    recentLogins: {
      meta: `${recentLoginItems.length} sesiones`,
      items: recentLoginItems
    }
  };
}

async function fetchUsers (organization) {
  return db.select({
    id: usersTable.id,
    role: usersTable.role,
    disabled: usersTable.disabled,
    createdAt: usersTable.createdAt
  })
  .from(usersTable)
  .where(eq(usersTable.organization, organization));
}

async function fetchEmployees (organization) {
  return db.select({
    id: employeesTable.id,
    user: employeesTable.user,
    firstName: employeesTable.firstName,
    lastName: employeesTable.lastName,
    position: employeesTable.position
  })
  .from(employeesTable)
  .where(eq(employeesTable.organization, organization));
}

async function fetchOwners (organization) {
  return db.select({
    id: ownersTable.id,
    user: ownersTable.user,
    firstName: ownersTable.firstName,
    lastName: ownersTable.lastName
  })
  .from(ownersTable)
  .where(eq(ownersTable.organization, organization));
}

async function fetchSessions (organization) {
  return db.select({
    id: sessionsTable.id,
    user: sessionsTable.user,
    createdAt: sessionsTable.createdAt
  })
  .from(sessionsTable)
  .innerJoin(usersTable, eq(sessionsTable.user, usersTable.id))
  .where(eq(usersTable.organization, organization))
  .orderBy(desc(sessionsTable.createdAt));
}
