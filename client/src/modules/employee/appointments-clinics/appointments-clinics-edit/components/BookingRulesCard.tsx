import type { Control } from 'react-hook-form'
import { CustomPageContainer } from '@/components/CustomPage/CustomPage'
import { FormInputSelect, FormSwitch } from '@/components/form/Form'
import {
  BOOKING_RULE_LABELS,
  BOOKING_RULE_OPTIONS,
  BOOKING_RULE_VALUES,
  BOOKING_TOGGLE_HINTS,
  BOOKING_TOGGLE_LABELS,
  BOOKING_TOGGLE_VALUES,
} from '@/constants/appointments-clinics'
import type { ClinicAvailabilityInput } from '@/modules/employee/appointments-clinics/appointments-clinics.schema'
import SectionHeading from './SectionHeading'

type BookingRulesCardProps = {
  control: Control<ClinicAvailabilityInput>
}

export default function BookingRulesCard({ control }: BookingRulesCardProps) {
  return (
    <CustomPageContainer className="p-5">
      <SectionHeading
        title="Reglas de reserva"
        description="Rigen tanto la agenda de Recepción como el portal de reservas."
      />
      <div className="mt-[18px] grid grid-cols-[repeat(auto-fit,minmax(min(180px,100%),1fr))] gap-3">
        {BOOKING_RULE_VALUES.map((rule) => (
          <FormInputSelect
            key={rule}
            control={control}
            name={`bookingRules.${rule}`}
            label={BOOKING_RULE_LABELS[rule]}
            options={BOOKING_RULE_OPTIONS[rule].map((option) => ({ value: option, label: option }))}
          />
        ))}
      </div>
      <div className="mt-[18px] flex flex-col gap-3.5 border-t border-line-soft pt-4">
        {BOOKING_TOGGLE_VALUES.map((toggle) => (
          <FormSwitch
            key={toggle}
            control={control}
            name={`bookingToggles.${toggle}`}
            label={BOOKING_TOGGLE_LABELS[toggle]}
            hint={BOOKING_TOGGLE_HINTS[toggle]}
          />
        ))}
      </div>
    </CustomPageContainer>
  )
}
