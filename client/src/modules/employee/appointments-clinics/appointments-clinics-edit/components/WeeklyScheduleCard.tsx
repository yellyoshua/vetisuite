import { ClockIcon, CopyIcon, PlusIcon, RotateCcwIcon, Trash2Icon } from 'lucide-react'
import { CustomPageContainer } from '@/components/CustomPage/CustomPage'
import CustomTooltip from '@/components/CustomTooltip/CustomTooltip'
import SwitchField from '@/components/SwitchField/SwitchField'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type useForm from '@/hooks/use-form'
import {
  COPY_MONDAY_TARGETS,
  ESTIMATE_SLOT_MINUTES,
  TIME_BLOCK_TAGS,
  WEEKDAY_LABELS,
} from '@/constants/appointments-clinics'
import {
  canAddBlock,
  canRemoveBlock,
  createNextBlock,
  summarizeWeek,
  type ClinicAvailabilityInput,
  type TimeBlock,
} from '@/modules/employee/appointments-clinics/appointments-clinics.schema'
import SectionHeading from './SectionHeading'

type AvailabilityForm = ReturnType<typeof useForm<ClinicAvailabilityInput>>

type FormDays = ClinicAvailabilityInput['days']

type FormDay = FormDays[number]

type DayProps = {
  day: FormDay
  dayIndex: number
  form: AvailabilityForm
}

type TimeBlockRowProps = DayProps & {
  block: TimeBlock
  blockIndex: number
}

type WeeklyScheduleCardProps = {
  form: AvailabilityForm
  initialDays: FormDays
}

const DIRTY = { shouldDirty: true }

function TimeBlockRow({ day, dayIndex, form, block, blockIndex }: TimeBlockRowProps) {
  const blockLabel = `${WEEKDAY_LABELS[day.weekday]}, bloque ${blockIndex + 1}`

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <div className="w-[110px]">
        <Input
          type="time"
          required
          aria-label={`${blockLabel}, desde`}
          value={block.from}
          onChange={(event) => form.setValue(`days.${dayIndex}.blocks.${blockIndex}.from`, event.target.value, DIRTY)}
        />
      </div>
      <span className="text-xs text-sub">a</span>
      <div className="w-[110px]">
        <Input
          type="time"
          required
          aria-label={`${blockLabel}, hasta`}
          value={block.to}
          onChange={(event) => form.setValue(`days.${dayIndex}.blocks.${blockIndex}.to`, event.target.value, DIRTY)}
        />
      </div>
      <span className="ml-0.5 text-[11.5px] text-sub">{TIME_BLOCK_TAGS[blockIndex]}</span>
      {canRemoveBlock(day) && (
        <CustomTooltip content="Quitar bloque">
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label="Quitar bloque"
            onClick={() => form.setValue(`days.${dayIndex}.blocks`, day.blocks.filter((_, index) => index !== blockIndex), DIRTY)}
          >
            <Trash2Icon />
          </Button>
        </CustomTooltip>
      )}
    </div>
  )
}

function ScheduleDayBlocks({ day, dayIndex, form }: DayProps) {
  return (
    <div className="flex min-w-0 flex-[2_1_300px] flex-col gap-2">
      {day.blocks.map((block, blockIndex) => (
        <TimeBlockRow key={blockIndex} day={day} dayIndex={dayIndex} form={form} block={block} blockIndex={blockIndex} />
      ))}
      {canAddBlock(day) && (
        <div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => form.setValue(`days.${dayIndex}.blocks`, [...day.blocks, createNextBlock(day)], DIRTY)}
          >
            <PlusIcon /> Añadir bloque
          </Button>
        </div>
      )}
    </div>
  )
}

function ScheduleDayRow({ day, dayIndex, form }: DayProps) {
  const dayError = form.formState.errors.days?.[dayIndex]

  return (
    <div className="border-t border-line-soft py-3">
      <div className="flex flex-wrap items-start gap-3">
        <div className="min-w-0 flex-[1_1_170px] pt-1.5">
          <SwitchField
            label={WEEKDAY_LABELS[day.weekday]}
            checked={day.isOpen}
            onCheckedChange={(isOpen) => form.setValue(`days.${dayIndex}.isOpen`, isOpen, DIRTY)}
          />
        </div>
        {day.isOpen && <ScheduleDayBlocks day={day} dayIndex={dayIndex} form={form} />}
        {!day.isOpen && (
          <p className="flex-[1_1_300px] pt-2 text-[12.5px] text-sub">
            Cerrado · el portal no ofrece horas y la agenda bloquea las citas nuevas.
          </p>
        )}
      </div>
      {dayError?.message && (
        <p role="alert" className="mt-2 text-xs text-red">{dayError.message}</p>
      )}
    </div>
  )
}

function copyMonday(days: FormDays): FormDays {
  const monday = days.find((day) => day.weekday === 'monday')

  if (!monday) {
    return days
  }

  return days.map((day) => (COPY_MONDAY_TARGETS.includes(day.weekday) ? { ...monday, weekday: day.weekday } : day))
}

export default function WeeklyScheduleCard({ form, initialDays }: WeeklyScheduleCardProps) {
  const days = form.watch('days')
  const weeklySummary = summarizeWeek(days)

  return (
    <CustomPageContainer className="p-5">
      <SectionHeading
        title="Horario de atención"
        description="Cada día puede tener varios bloques: mañana y tarde se separan para que el portal no ofrezca la hora del almuerzo."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Button type="button" variant="ghost" size="sm" onClick={() => form.setValue('days', copyMonday(days), DIRTY)}>
              <CopyIcon /> Copiar lunes a todos
            </Button>
            <Button type="button" variant="ghost" size="sm" onClick={() => form.setValue('days', initialDays, DIRTY)}>
              <RotateCcwIcon /> Restablecer
            </Button>
          </div>
        }
      />
      <div className="mt-[18px] flex flex-wrap gap-3 pb-2 text-[11px] font-semibold tracking-[0.4px] text-sub uppercase">
        <span className="min-w-0 flex-[1_1_170px]">Día</span>
        <span className="min-w-0 flex-[2_1_300px]">Bloques de atención</span>
      </div>
      {days.map((day, dayIndex) => (
        <ScheduleDayRow key={day.weekday} day={day} dayIndex={dayIndex} form={form} />
      ))}
      <p className="mt-3.5 flex flex-wrap items-center gap-2 border-t border-line-soft pt-3.5 text-xs text-sub">
        <ClockIcon className="size-3.5" aria-hidden="true" />
        <span>
          {weeklySummary.hours} h de atención a la semana · {weeklySummary.openDays} días abiertos · capacidad estimada
          de {weeklySummary.estimatedAppointments} citas de {ESTIMATE_SLOT_MINUTES} min
        </span>
      </p>
    </CustomPageContainer>
  )
}
