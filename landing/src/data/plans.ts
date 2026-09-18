export type PlanPrice = {
  amount: number
  currency: string
  interval: 'month' | 'unit'
}

export type BasePlan = {
  name: string
  tagline: string
  capabilities: readonly string[]
  price?: PlanPrice
}

export type AddonModule = {
  name: string
  audience: string
  value: string
  price?: PlanPrice
}

export type UsageService = {
  name: string
  description: string
  price?: PlanPrice
}

export const BASE_PLAN: BasePlan = {
  name: 'Plan Base Operativo',
  tagline:
    'La cuota mensual mínima obligatoria: todo lo que una clínica necesita para operar el mostrador desde el primer día.',
  capabilities: [
    'Directorio de clientes y pacientes con alertas visuales de salud y manejo.',
    'Agenda y gestión de citas con matriz de médicos y prevención de dobles reservas.',
    'Visitas: check-in del paciente y contenedor de todos los servicios del día.',
    'Inventario esencial: catálogo de productos y control de stock.',
    'Facturación básica con cálculo de IVA y control de saldos pendientes.',
    'Dashboard operativo del día para saber qué pasa en la clínica ahora mismo.',
  ],
}

export const ADDON_MODULES: readonly AddonModule[] = [
  {
    name: 'Peluquería y Estética',
    audience: 'Clínicas con servicios de baño, corte y grooming.',
    value:
      'Kanban operativo en vivo con cronómetro, control de pertenencias (collares, correas) y cargo automático a la visita.',
  },
  {
    name: 'Clínica y Laboratorio',
    audience: 'Clínicas con consultas médicas especializadas y diagnóstico.',
    value:
      'Expedientes médicos inmutables, registro de signos vitales, órdenes de laboratorio con carga de resultados y recetas digitales.',
  },
  {
    name: 'Portales y Campañas',
    audience: 'Clínicas que desean captar clientes por internet.',
    value:
      'Páginas públicas bajo slug propio con wizard de reserva en línea y formularios para campañas, como vacunación masiva.',
  },
  {
    name: 'Finanzas y Rentabilidad',
    audience: 'Administradores y directores de clínica.',
    value:
      'Análisis del margen real de la jornada, desglose de ingresos por área operativa y conciliación por método de pago.',
  },
]

export const USAGE_SERVICES: readonly UsageService[] = [
  {
    name: 'Mensajería transaccional',
    description:
      'Recordatorios de citas y avisos de "mascota lista para retiro" por WhatsApp o SMS, en paquetes prepagados.',
  },
  {
    name: 'Almacenamiento clínico extendido',
    description:
      'Espacio en la nube para adjuntar radiografías, ecografías y fotos del tratamiento dentro del expediente.',
  },
  {
    name: 'Sedes adicionales',
    description:
      'Operación multi-sede centralizada para cadenas veterinarias que comparten dueños y pacientes.',
  },
]
