import type { Dispatch } from 'react'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import Icon from '@/components/ui/Icon'
import IconButton from '@/components/ui/IconButton'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Toggle from '@/components/ui/Toggle'
import {
  ESTIMATE_SLOT_MINUTES,
  PARALLEL_CAPACITY_LABELS,
  PARALLEL_CAPACITY_VALUES,
  TIME_BLOCK_TAGS,
  WEEKDAY_LABELS,
} from '@/constants/appointments-clinics'
import {
  canAddBlock,
  canRemoveBlock,
  type ScheduleDay,
  type TimeBlock,
  type WeeklySummary,
} from '../../appointments-clinics.schema'
import type { AvailabilityDraftAction } from '../use-availability-draft'
import SectionHeading from './SectionHeading'

type DraftDispatch = Dispatch<AvailabilityDraftAction>

type TimeBlockRowProps = {
  day: ScheduleDay
  block: TimeBlock
  blockIndex: number
  dispatch: DraftDispatch
}

type ScheduleDayProps = {
  day: ScheduleDay
  dispatch: DraftDispatch
}

type WeeklyScheduleCardProps = {
  days: ScheduleDay[]
  weeklySummary: WeeklySummary
  dispatch: DraftDispatch
}

function TimeBlockRow({ day, block, blockIndex, dispatch }: TimeBlockRowProps) {
  const blockLabel = `${WEEKDAY_LABELS[day.weekday]}, bloque ${blockIndex + 1}`

  function changeBlock(changes: Partial<TimeBlock>) {
    dispatch({ type: 'change-block', weekday: day.weekday, blockIndex, block: { ...block, ...changes } })
  }

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <div className="w-[110px]">
        <Input
          type="time"
          required
          aria-label={`${blockLabel}, desde`}
          value={block.from}
          onChange={(event) => changeBlock({ from: event.target.value })}
        />
      </div>
      <span className="text-xs text-sub">a</span>
      <div className="w-[110px]">
        <Input
          type="time"
          required
          aria-label={`${blockLabel}, hasta`}
          value={block.to}
          onChange={(event) => changeBlock({ to: event.target.value })}
        />
      </div>
      <span className="ml-0.5 text-[11.5px] text-sub">{TIME_BLOCK_TAGS[blockIndex]}</span>
      {canRemoveBlock(day) && (
        <IconButton
          icon="trash-2"
          label="Quitar bloque"
          onClick={() => dispatch({ type: 'remove-block', weekday: day.weekday, blockIndex })}
        />
      )}
    </div>
  )
}

function ScheduleDayBlocks({ day, dispatch }: ScheduleDayProps) {
  return (
    <>
      <div className="flex min-w-0 flex-[2_1_300px] flex-col gap-2">
        {day.blocks.map((block, blockIndex) => (
          <TimeBlockRow key={blockIndex} day={day} block={block} blockIndex={blockIndex} dispatch={dispatch} />
        ))}
        {canAddBlock(day) && (
          <div>
            <Button variant="ghost" size="sm" onClick={() => dispatch({ type: 'add-block', weekday: day.weekday })}>
              <Icon name="plus" size={13} /> Añadir bloque
            </Button>
          </div>
        )}
      </div>
      <div className="min-w-[140px] flex-[0_1_160px]">
        <Select
          aria-label={`Citas en paralelo, ${WEEKDAY_LABELS[day.weekday]}`}
          value={day.parallelCapacity}
          onChange={(event) =>
            dispatch({ type: 'change-capacity', weekday: day.weekday, parallelCapacity: Number(event.target.value) })
          }
        >
          {PARALLEL_CAPACITY_VALUES.map((capacity) => (
            <option key={capacity} value={capacity}>
              {PARALLEL_CAPACITY_LABELS[capacity]}
            </option>
          ))}
        </Select>
      </div>
    </>
  )
}

function ScheduleDayRow({ day, dispatch }: ScheduleDayProps) {
  return (
    <div className="flex flex-wrap items-start gap-3 border-t border-line-soft py-3">
      <div className="min-w-0 flex-[1_1_170px] pt-1.5">
        <Toggle
          label={WEEKDAY_LABELS[day.weekday]}
          checked={day.isOpen}
          onChange={() => dispatch({ type: 'toggle-day', weekday: day.weekday })}
        />
      </div>
      {day.isOpen && <ScheduleDayBlocks day={day} dispatch={dispatch} />}
      {!day.isOpen && (
        <p className="flex-[1_1_300px] pt-2 text-[12.5px] text-sub">
          Cerrado · el portal no ofrece horas y la agenda bloquea las citas nuevas.
        </p>
      )}
    </div>
  )
}

export default function WeeklyScheduleCard({ days, weeklySummary, dispatch }: WeeklyScheduleCardProps) {
  return (
    <Card className="p-5">
      <SectionHeading
        title="Horario de atención"
        description="Cada día puede tener varios bloques: mañana y tarde se separan para que el portal no ofrezca la hora del almuerzo."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => dispatch({ type: 'copy-monday' })}>
              <Icon name="copy" size={13} /> Copiar lunes a todos
            </Button>
            <Button variant="ghost" size="sm" onClick={() => dispatch({ type: 'reset-schedule' })}>
              <Icon name="rotate-ccw" size={13} /> Restablecer
            </Button>
          </div>
        }
      />
      <div className="mt-[18px] flex flex-wrap gap-3 pb-2 text-[11px] font-semibold tracking-[0.4px] text-sub uppercase">
        <span className="min-w-0 flex-[1_1_170px]">Día</span>
        <span className="min-w-0 flex-[2_1_300px]">Bloques de atención</span>
        <span className="min-w-0 flex-[0_1_160px]">Citas en paralelo</span>
      </div>
      {days.map((day) => (
        <ScheduleDayRow key={day.weekday} day={day} dispatch={dispatch} />
      ))}
      <p className="mt-3.5 flex flex-wrap items-center gap-2 border-t border-line-soft pt-3.5 text-xs text-sub">
        <Icon name="clock" size={14} />
        <span>
          {weeklySummary.hours} h de atención a la semana · {weeklySummary.openDays} días abiertos · capacidad estimada
          de {weeklySummary.estimatedAppointments} citas de {ESTIMATE_SLOT_MINUTES} min
        </span>
      </p>
    </Card>
  )
}
