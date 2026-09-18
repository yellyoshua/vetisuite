import type { BadgeTone } from '@/components/ui/Badge'
import type { ButtonVariant } from '@/components/ui/button-class-name'
import type { IconName } from '@/components/ui/Icon'

export const VISIT_STATUS_VALUES = ['pending', 'in-progress', 'done'] as const

type VisitStatusValue = (typeof VISIT_STATUS_VALUES)[number]

type AdvanceableVisitStatus = Exclude<VisitStatusValue, 'done'>

export const VISIT_NEXT_STATUS: Record<AdvanceableVisitStatus, VisitStatusValue> = {
  pending: 'in-progress',
  'in-progress': 'done',
}

export const VISIT_ADVANCE_VARIANTS: Record<AdvanceableVisitStatus, ButtonVariant> = {
  pending: 'primary',
  'in-progress': 'dark',
}

export const VISIT_STATUS_DOT_CLASS_NAMES: Record<VisitStatusValue, string> = {
  pending: 'bg-amber',
  'in-progress': 'bg-blue',
  done: 'bg-green',
}

export const VISIT_TYPE_VALUES = ['ambulatory', 'grooming', 'laboratory'] as const

type VisitTypeValue = (typeof VISIT_TYPE_VALUES)[number]

export const VISIT_TYPE_LABELS: Record<VisitTypeValue, string> = {
  ambulatory: 'Ambulatorio',
  grooming: 'Estética',
  laboratory: 'Laboratorio',
}

export const VISIT_TYPE_TONES: Record<VisitTypeValue, BadgeTone> = {
  ambulatory: 'blue',
  grooming: 'amber',
  laboratory: 'green',
}

export const VISIT_TYPE_ICONS: Record<VisitTypeValue, IconName> = {
  ambulatory: 'stethoscope',
  grooming: 'scissors',
  laboratory: 'flask-conical',
}

type VisitBoardScope = {
  title: string
  description: string
  actionLabel: string
  isTypeVisible: boolean
  columnLabels: Record<VisitStatusValue, string>
  advanceLabels: Record<VisitStatusValue, string>
}

export const VISIT_BOARD_SCOPES: Record<'all' | VisitTypeValue, VisitBoardScope> = {
  all: {
    title: 'Visitas',
    description:
      'Tablero maestro: toda la clínica en un solo lugar, con el servicio que escogió cada paciente y el módulo al que se deriva.',
    actionLabel: 'Nueva visita',
    isTypeVisible: true,
    columnLabels: { pending: 'En espera', 'in-progress': 'En proceso', done: 'Finalizado' },
    advanceLabels: { pending: 'Derivar', 'in-progress': 'Finalizar', done: 'Facturar' },
  },
  ambulatory: {
    title: 'Visitas',
    description: 'Atención ambulatoria: cada paciente avanza de la espera a la consulta y al alta.',
    actionLabel: 'Nueva visita',
    isTypeVisible: false,
    columnLabels: { pending: 'En espera', 'in-progress': 'En consulta', done: 'Finalizado' },
    advanceLabels: { pending: 'Iniciar', 'in-progress': 'Finalizar', done: 'Facturar' },
  },
  grooming: {
    title: 'Visitas',
    description: 'Pacientes de estética derivados desde Atención, por etapa del servicio.',
    actionLabel: 'Nuevo check-in',
    isTypeVisible: false,
    columnLabels: { pending: 'Pendiente', 'in-progress': 'En proceso', done: 'Terminado' },
    advanceLabels: { pending: 'Iniciar', 'in-progress': 'Finalizar', done: 'Facturar' },
  },
  laboratory: {
    title: 'Visitas',
    description: 'Muestras y órdenes derivadas desde Atención, por etapa del análisis.',
    actionLabel: 'Nueva orden',
    isTypeVisible: false,
    columnLabels: { pending: 'Solicitado', 'in-progress': 'En análisis', done: 'Con resultado' },
    advanceLabels: { pending: 'Iniciar', 'in-progress': 'Finalizar', done: 'Facturar' },
  },
}
