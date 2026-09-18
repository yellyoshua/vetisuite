import type { AdministrationSummary } from '../dashboard.schema'

const ADMINISTRATION_SUMMARY: AdministrationSummary = {
  kpis: {
    activeUsers: { value: '6', detail: 'de 7 cuentas creadas' },
    roles: { value: '4', detail: 'administrador, veterinario, estilista, recepción' },
    todayLogins: { value: '5', detail: 'último a las 08:10' },
    enabledModules: { value: '8', detail: 'de 8 disponibles' },
  },
  panels: {
    rolePermissions: {
      meta: '4 roles',
      items: [
        { name: 'Administrador', detail: 'acceso a los 8 módulos · 1 usuario', badge: 'total', tone: 'blue' },
        { name: 'Veterinario', detail: 'Recepción, Atención, Laboratorio · 3 usuarios', badge: 'atención', tone: 'green' },
        { name: 'Estilista', detail: 'Estética · 2 usuarios', badge: 'estética', tone: 'green' },
        { name: 'Recepción', detail: 'Recepción, Marketing, Facturación · 1 usuario', badge: 'entrada', tone: 'green' },
      ],
    },
    recentLogins: {
      meta: 'hoy',
      items: [
        { name: 'Valeria Cruz', detail: 'Recepción · 07:30', badge: 'activo', tone: 'green' },
        { name: 'Dra. María Torres', detail: 'Atención · 07:42', badge: 'activo', tone: 'green' },
        { name: 'Sofía Mena', detail: 'Estética · 07:55', badge: 'activo', tone: 'green' },
        { name: 'Ramiro Guerra', detail: 'sin acceso desde el 04 sep', badge: 'suspendido', tone: 'gray' },
      ],
    },
  },
}

export function resolveAdministrationSummary(): Promise<AdministrationSummary> {
  return Promise.resolve().then(() => ADMINISTRATION_SUMMARY)
}
