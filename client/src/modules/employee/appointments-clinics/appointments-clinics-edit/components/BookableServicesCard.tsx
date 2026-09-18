import type { Dispatch } from 'react'
import EmptyState from '@/components/EmptyState'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import Icon from '@/components/ui/Icon'
import Select from '@/components/ui/Select'
import Toggle from '@/components/ui/Toggle'
import { SERVICE_DURATION_VALUES } from '@/constants/appointments-clinics'
import { formatCurrency } from '@/lib/format-currency'
import type { BookableService } from '../../appointments-clinics.schema'
import type { AvailabilityDraftAction } from '../use-availability-draft'
import SectionHeading from './SectionHeading'

type DraftDispatch = Dispatch<AvailabilityDraftAction>

type ServiceRowProps = {
  service: BookableService
  dispatch: DraftDispatch
}

type BookableServicesCardProps = {
  services: BookableService[]
  dispatch: DraftDispatch
}

function ServiceRow({ service, dispatch }: ServiceRowProps) {
  return (
    <div className="mt-3 flex flex-wrap items-center gap-3 border-t border-line-soft py-3">
      <div className="min-w-0 flex-[1_1_200px]">
        <p className="font-head text-[13.5px] font-semibold text-ink">{service.name}</p>
        <p className="mt-px text-[11.5px] text-sub">{service.area}</p>
      </div>
      <div className="min-w-[130px] flex-[0_1_150px]">
        <Select
          aria-label={`Duración, ${service.name}`}
          value={service.durationMinutes}
          onChange={(event) =>
            dispatch({
              type: 'change-service',
              serviceId: service.id,
              changes: { durationMinutes: Number(event.target.value) },
            })
          }
        >
          {SERVICE_DURATION_VALUES.map((minutes) => (
            <option key={minutes} value={minutes}>
              {minutes} min
            </option>
          ))}
        </Select>
      </div>
      <div className="flex min-w-[100px] flex-[0_1_120px] flex-col gap-0.5">
        <span className="font-head text-[13.5px] font-semibold text-ink tabular-nums">{formatCurrency(service.price)}</span>
        <span className="flex items-center gap-1 text-[10.5px] text-sub">
          <Icon name="lock" size={11} />
          desde Catálogo
        </span>
      </div>
      <div className="min-w-[170px] flex-[0_1_190px]">
        <Toggle
          label="Visible en el portal"
          aria-label={`Visible en el portal, ${service.name}`}
          checked={service.isPortalVisible}
          onChange={(event) =>
            dispatch({
              type: 'change-service',
              serviceId: service.id,
              changes: { isPortalVisible: event.target.checked },
            })
          }
        />
      </div>
    </div>
  )
}

export default function BookableServicesCard({ services, dispatch }: BookableServicesCardProps) {
  return (
    <Card className="p-5">
      <SectionHeading
        title="Servicios que se pueden reservar"
        description="Decide qué ofrece el portal y cuánto ocupa cada servicio en la agenda. El precio lo publica el Catálogo de Inventario."
        actions={
          <Button variant="ghost" size="sm" isDisabled>
            <Icon name="plus" size={13} /> Añadir servicio
          </Button>
        }
      />
      {services.length === 0 && (
        <EmptyState
          title="Sin servicios reservables"
          hint="Los servicios aparecen aquí cuando el Catálogo de Inventario los publica."
        />
      )}
      {services.map((service) => (
        <ServiceRow key={service.id} service={service} dispatch={dispatch} />
      ))}
    </Card>
  )
}
