import type { Params } from 'react-router'
import { DEFAULT_SETTINGS_SECTION } from '@/constants/settings'
import type { ResolverSearch } from '@/hooks/use-resolver'
import { TIME_ZONE_VALUES, UTC_TIME_ZONE } from '@/lib/date'
import { NotFoundError } from '@/lib/not-found-error'
import { parseInput } from '@/lib/parse-input'
import organizationService from '@/modules/employee/settings/organization.service'
import {
  settingsValuesSchema,
  type ApiOrganization,
  type SettingsSection,
  type SettingsUpdate,
  type SettingsValues,
} from '@/modules/employee/settings/settings.schema'

const TIME_ZONE_FIELD = 'timeZone'

const SETTINGS_SECTIONS: SettingsSection[] = [
  {
    id: 'clinic',
    title: 'Datos de la clínica',
    description: 'Identidad fiscal y de contacto. Aparece en las facturas emitidas y en los portales publicados.',
    fields: [
      { name: 'tradeName', label: 'Nombre comercial', type: 'text', value: 'Clínica Veterinaria Huellitas' },
      { name: 'legalName', label: 'Razón social', type: 'text', value: 'Huellitas Servicios Veterinarios S.A.' },
      { name: 'taxId', label: 'RUC', type: 'text', value: '1791234567001' },
      { name: 'phone', label: 'Teléfono', type: 'tel', value: '02 245 8890' },
      { name: 'email', label: 'Correo', type: 'email', value: 'contacto@huellitas.vet' },
      { name: 'city', label: 'Ciudad', type: 'text', value: 'Quito' },
      { name: 'address', label: 'Dirección', type: 'text', value: 'Av. Amazonas N34-120 y Atahualpa', isWide: true },
      {
        name: TIME_ZONE_FIELD,
        label: 'Zona horaria',
        type: 'select',
        value: UTC_TIME_ZONE,
        options: TIME_ZONE_VALUES,
      },
    ],
    toggles: [],
  },
  {
    id: 'billing',
    title: 'Facturación y moneda',
    description: 'Rige lo que emite el módulo de Facturación. Ningún otro módulo puede cambiar estos valores.',
    fields: [
      {
        name: 'currency',
        label: 'Moneda',
        type: 'select',
        value: 'USD ($)',
        options: ['USD ($)'],
        isLocked: true,
        note: 'Definida al crear la clínica',
      },
      { name: 'vatRate', label: 'IVA', type: 'select', value: '15%', options: ['0%', '12%', '15%'] },
      { name: 'invoiceSeries', label: 'Serie de factura', type: 'text', value: '001-001' },
      {
        name: 'invoiceSequence',
        label: 'Secuencial actual',
        type: 'text',
        value: '0319',
        isLocked: true,
        note: 'Lo avanza cada factura emitida',
      },
      { name: 'environment', label: 'Ambiente', type: 'select', value: 'Producción', options: ['Pruebas', 'Producción'] },
      {
        name: 'defaultDueTerm',
        label: 'Vencimiento por defecto',
        type: 'select',
        value: '15 días',
        options: ['Contado', '8 días', '15 días', '30 días'],
      },
    ],
    toggles: [
      {
        name: 'emailInvoice',
        label: 'Enviar la factura por correo al cobrar',
        hint: 'El cliente recibe el PDF apenas se registra el pago.',
        isChecked: true,
      },
      {
        name: 'requireTaxId',
        label: 'Exigir datos fiscales antes de facturar',
        hint: 'Bloquea la emisión si al cliente le falta cédula o RUC.',
        isChecked: false,
      },
      {
        name: 'closeOnInvoice',
        label: 'Cerrar la visita al facturar',
        hint: 'La visita pasa a estado final y deja de admitir cargos nuevos.',
        isChecked: true,
      },
    ],
  },
  {
    id: 'operations',
    title: 'Operación entre módulos',
    description: 'Define cómo viaja una visita desde Recepción hasta el cierre en Facturación.',
    fields: [
      {
        name: 'maxWaitTime',
        label: 'Tiempo máximo en espera',
        type: 'select',
        value: '45 minutos',
        options: ['30 minutos', '45 minutos', '60 minutos'],
      },
      {
        name: 'noShowPolicy',
        label: 'Política de no asistencia',
        type: 'select',
        value: 'Marcar y avisar',
        options: ['Solo marcar', 'Marcar y avisar', 'Marcar y cobrar'],
      },
      {
        name: 'cashClosing',
        label: 'Cierre de caja',
        type: 'select',
        value: 'Diario a las 20:00',
        options: ['Diario a las 20:00', 'Por turno', 'Manual'],
      },
    ],
    toggles: [
      {
        name: 'autoRoute',
        label: 'Derivar visitas automáticamente',
        hint: 'El servicio escogido en Recepción manda la visita a Estética o Laboratorio.',
        isChecked: true,
      },
      {
        name: 'requireConsent',
        label: 'Exigir consentimiento firmado',
        hint: 'Bloquea el alta de la visita si falta el consentimiento del dueño.',
        isChecked: false,
      },
      {
        name: 'notifyOwner',
        label: 'Avisar al cliente cuando el servicio termine',
        hint: 'Mensaje automático al pasar la visita a finalizado.',
        isChecked: true,
      },
    ],
  },
  {
    id: 'notifications',
    title: 'Recordatorios y avisos',
    description: 'Mensajes automáticos al cliente. Se envían con los datos de contacto de su ficha.',
    fields: [
      {
        name: 'appointmentReminder',
        label: 'Recordatorio de cita',
        type: 'select',
        value: '24 horas antes',
        options: ['12 horas antes', '24 horas antes', '48 horas antes'],
      },
      {
        name: 'preferredChannel',
        label: 'Canal preferido',
        type: 'select',
        value: 'Correo',
        options: ['Correo', 'WhatsApp', 'Correo y WhatsApp'],
      },
      { name: 'senderEmail', label: 'Remitente', type: 'email', value: 'recordatorios@huellitas.vet' },
    ],
    toggles: [
      {
        name: 'remind24',
        label: 'Recordar la cita al cliente',
        hint: 'Se cancela solo si la cita se anula antes del envío.',
        isChecked: true,
      },
      {
        name: 'remindWhatsapp',
        label: 'Duplicar el aviso por WhatsApp',
        hint: 'Requiere el número verificado en la ficha del cliente.',
        isChecked: false,
      },
    ],
  },
  {
    id: 'security',
    title: 'Seguridad y sesiones',
    description: 'Se aplica a todas las cuentas del sistema. Los permisos por rol se editan en Usuarios y roles.',
    fields: [
      {
        name: 'sessionDuration',
        label: 'Duración de la sesión',
        type: 'select',
        value: '8 horas',
        options: ['4 horas', '8 horas', '12 horas'],
      },
      {
        name: 'lockoutAttempts',
        label: 'Bloqueo tras intentos fallidos',
        type: 'select',
        value: '5 intentos',
        options: ['3 intentos', '5 intentos', '10 intentos'],
      },
    ],
    toggles: [
      {
        name: 'twoFactor',
        label: 'Segundo factor para administradores',
        hint: 'Código de un solo uso al iniciar sesión.',
        isChecked: false,
      },
      {
        name: 'sessionTimeout',
        label: 'Cerrar sesión por inactividad',
        hint: 'Protege la estación de recepción cuando queda sola.',
        isChecked: true,
      },
    ],
  },
]

function findSection(sectionId: string): SettingsSection {
  const section = SETTINGS_SECTIONS.find((candidate) => candidate.id === sectionId)
  if (!section) {
    throw new NotFoundError('No encontramos esa sección de la configuración.')
  }

  return section
}

function applyValues(section: SettingsSection, values: SettingsValues): SettingsSection {
  return {
    ...section,
    fields: section.fields.map((field) => ({
      ...field,
      value: field.isLocked ? field.value : values.fields[field.name],
    })),
    toggles: section.toggles.map((toggle) => ({ ...toggle, isChecked: values.toggles[toggle.name] })),
  }
}

function withTimeZone(section: SettingsSection, timezone: string): SettingsSection {
  return {
    ...section,
    fields: section.fields.map((field) => (field.name === TIME_ZONE_FIELD ? { ...field, value: timezone } : field)),
  }
}

async function resolveSection(sectionId: string): Promise<SettingsSection> {
  const section = findSection(sectionId)
  if (!section.fields.some((field) => field.name === TIME_ZONE_FIELD)) {
    return section
  }
  const organization = await organizationService.get<ApiOrganization>()

  return withTimeZone(section, organization.timezone)
}

export async function saveClinicSettings({ section, values }: SettingsUpdate): Promise<SettingsSection> {
  const currentSection = findSection(section)
  const input = parseInput(settingsValuesSchema(currentSection), values)
  const timezone = input.fields[TIME_ZONE_FIELD]
  let savedSection = applyValues(currentSection, input)
  if (timezone !== undefined) {
    const organization = await organizationService.put<ApiOrganization>({ timezone })
    savedSection = withTimeZone(savedSection, organization.timezone)
  }
  SETTINGS_SECTIONS.splice(SETTINGS_SECTIONS.indexOf(currentSection), 1, savedSection)

  return savedSection
}

export default {
  section: (_params: Readonly<Params>, search: ResolverSearch) =>
    resolveSection(search.section ? String(search.section) : DEFAULT_SETTINGS_SECTION),
}
