import type { Dispatch } from 'react'
import Card from '@/components/legacy-ui/Card'
import Field from '@/components/legacy-ui/Field'
import Select from '@/components/legacy-ui/Select'
import Toggle from '@/components/legacy-ui/Toggle'
import {
  BOOKING_RULE_LABELS,
  BOOKING_RULE_OPTIONS,
  BOOKING_RULE_VALUES,
  BOOKING_TOGGLE_HINTS,
  BOOKING_TOGGLE_LABELS,
  BOOKING_TOGGLE_VALUES,
} from '@/constants/appointments-clinics'
import type { ClinicAvailability } from '../../appointments-clinics.schema'
import type { AvailabilityDraftAction } from '../use-availability-draft'
import SectionHeading from './SectionHeading'

type BookingRulesCardProps = Pick<ClinicAvailability, 'bookingRules' | 'bookingToggles'> & {
  dispatch: Dispatch<AvailabilityDraftAction>
}

export default function BookingRulesCard({ bookingRules, bookingToggles, dispatch }: BookingRulesCardProps) {
  return (
    <Card className="p-5">
      <SectionHeading
        title="Reglas de reserva"
        description="Rigen tanto la agenda de Recepción como el portal de reservas."
      />
      <div className="mt-[18px] grid grid-cols-[repeat(auto-fit,minmax(min(180px,100%),1fr))] gap-3">
        {BOOKING_RULE_VALUES.map((rule) => (
          <Field key={rule} label={BOOKING_RULE_LABELS[rule]}>
            <Select
              value={bookingRules[rule]}
              onChange={(event) => dispatch({ type: 'change-rule', rule, value: event.target.value })}
            >
              {BOOKING_RULE_OPTIONS[rule].map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </Select>
          </Field>
        ))}
      </div>
      <div className="mt-[18px] flex flex-col gap-3.5 border-t border-line-soft pt-4">
        {BOOKING_TOGGLE_VALUES.map((toggle) => (
          <Toggle
            key={toggle}
            label={BOOKING_TOGGLE_LABELS[toggle]}
            hint={BOOKING_TOGGLE_HINTS[toggle]}
            checked={bookingToggles[toggle]}
            onChange={(event) => dispatch({ type: 'change-toggle', toggle, isChecked: event.target.checked })}
          />
        ))}
      </div>
    </Card>
  )
}
