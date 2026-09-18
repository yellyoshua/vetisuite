import { useReducer, type Dispatch } from 'react'
import { COPY_MONDAY_TARGETS } from '@/constants/appointments-clinics'
import {
  canAddBlock,
  canRemoveBlock,
  createNextBlock,
  summarizeWeek,
  type BookableService,
  type BookingRule,
  type BookingToggle,
  type ClinicAvailability,
  type ScheduleDay,
  type TimeBlock,
  type Weekday,
  type WeeklySummary,
} from '../appointments-clinics.schema'

type DayAction =
  | { type: 'toggle-day'; weekday: Weekday }
  | { type: 'change-block'; weekday: Weekday; blockIndex: number; block: TimeBlock }
  | { type: 'add-block'; weekday: Weekday }
  | { type: 'remove-block'; weekday: Weekday; blockIndex: number }
  | { type: 'change-capacity'; weekday: Weekday; parallelCapacity: number }

type EditAction =
  | DayAction
  | { type: 'copy-monday' }
  | { type: 'change-rule'; rule: BookingRule; value: string }
  | { type: 'change-toggle'; toggle: BookingToggle; isChecked: boolean }
  | {
      type: 'change-service'
      serviceId: string
      changes: Partial<Pick<BookableService, 'durationMinutes' | 'isPortalVisible'>>
    }

export type AvailabilityDraftAction =
  | EditAction
  | { type: 'reset-schedule' }
  | { type: 'discard' }
  | { type: 'commit'; availability: ClinicAvailability }

type DraftState = {
  baseline: ClinicAvailability
  draft: ClinicAvailability
  isSaved: boolean
}

type AvailabilityDraft = {
  draft: ClinicAvailability
  isSaved: boolean
  weeklySummary: WeeklySummary
  dispatch: Dispatch<AvailabilityDraftAction>
}

function reduceDay(day: ScheduleDay, action: DayAction): ScheduleDay {
  switch (action.type) {
    case 'toggle-day':
      return { ...day, isOpen: !day.isOpen }
    case 'change-block':
      return { ...day, blocks: day.blocks.map((block, index) => (index === action.blockIndex ? action.block : block)) }
    case 'add-block':
      return canAddBlock(day) ? { ...day, blocks: [...day.blocks, createNextBlock(day)] } : day
    case 'remove-block':
      return canRemoveBlock(day) ? { ...day, blocks: day.blocks.filter((_, index) => index !== action.blockIndex) } : day
    case 'change-capacity':
      return { ...day, parallelCapacity: action.parallelCapacity }
  }
}

function copyMonday(days: ScheduleDay[]): ScheduleDay[] {
  const monday = days.find((day) => day.weekday === 'monday')
  if (!monday) {
    return days
  }

  return days.map((day) => (COPY_MONDAY_TARGETS.includes(day.weekday) ? { ...monday, weekday: day.weekday } : day))
}

function reduceDraft(draft: ClinicAvailability, action: EditAction): ClinicAvailability {
  switch (action.type) {
    case 'copy-monday':
      return { ...draft, days: copyMonday(draft.days) }
    case 'change-rule':
      return { ...draft, bookingRules: { ...draft.bookingRules, [action.rule]: action.value } }
    case 'change-toggle':
      return { ...draft, bookingToggles: { ...draft.bookingToggles, [action.toggle]: action.isChecked } }
    case 'change-service':
      return {
        ...draft,
        services: draft.services.map((service) =>
          service.id === action.serviceId ? { ...service, ...action.changes } : service,
        ),
      }
    default:
      return { ...draft, days: draft.days.map((day) => (day.weekday === action.weekday ? reduceDay(day, action) : day)) }
  }
}

function reduceAvailabilityDraft(state: DraftState, action: AvailabilityDraftAction): DraftState {
  switch (action.type) {
    case 'discard':
      return { ...state, draft: state.baseline, isSaved: false }
    case 'commit':
      return { baseline: action.availability, draft: action.availability, isSaved: true }
    case 'reset-schedule':
      return { ...state, draft: { ...state.draft, days: state.baseline.days }, isSaved: false }
    default:
      return { ...state, draft: reduceDraft(state.draft, action), isSaved: false }
  }
}

export default function useAvailabilityDraft(availability: ClinicAvailability): AvailabilityDraft {
  const [state, dispatch] = useReducer(reduceAvailabilityDraft, {
    baseline: availability,
    draft: availability,
    isSaved: false,
  })

  return { draft: state.draft, isSaved: state.isSaved, weeklySummary: summarizeWeek(state.draft.days), dispatch }
}
