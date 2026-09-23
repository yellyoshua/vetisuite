import { LockIcon, PlusIcon } from 'lucide-react'
import { CustomPageContainer } from '@/components/CustomPage/CustomPage'
import EmptyState from '@/components/EmptyState/EmptyState'
import { FormSwitch } from '@/components/form/Form'
import { Button } from '@/components/ui/button'
import type useForm from '@/hooks/use-form'
import { formatCurrency } from '@/lib/format-currency'
import type { BookableService, ClinicAvailabilityInput } from '@/modules/employee/appointments-clinics/appointments-clinics.schema'
import SectionHeading from './SectionHeading'

type AvailabilityForm = ReturnType<typeof useForm<ClinicAvailabilityInput>>

type ServiceRowProps = {
  service: BookableService
  serviceIndex: number
  form: AvailabilityForm
}

type BookableServicesCardProps = {
  services: BookableService[]
  form: AvailabilityForm
}

function ServiceRow({ service, serviceIndex, form }: ServiceRowProps) {
  return (
    <div className="mt-3 flex flex-wrap items-center gap-3 border-t border-line-soft py-3">
      <div className="min-w-0 flex-[1_1_200px]">
        <p className="font-head text-[13.5px] font-semibold text-ink">{service.name}</p>
        <p className="mt-px text-[11.5px] text-sub">{service.area}</p>
      </div>
      <div className="flex min-w-[100px] flex-[0_1_120px] flex-col gap-0.5">
        <span className="font-head text-[13.5px] font-semibold text-ink tabular-nums">{formatCurrency(service.price)}</span>
        <span className="flex items-center gap-1 text-[10.5px] text-sub">
          <LockIcon className="size-[11px]" aria-hidden="true" />
          desde Catálogo
        </span>
      </div>
      <div className="min-w-[170px] flex-[0_1_190px]">
        <FormSwitch
          control={form.control}
          name={`services.${serviceIndex}.isPortalVisible`}
          label="Visible en el portal"
          ariaLabel={`Visible en el portal, ${service.name}`}
        />
      </div>
    </div>
  )
}

export default function BookableServicesCard({ services, form }: BookableServicesCardProps) {
  return (
    <CustomPageContainer className="p-5">
      <SectionHeading
        title="Servicios que se pueden reservar"
        description="Decide qué ofrece el portal y cuánto ocupa cada servicio en la agenda. El precio lo publica el Catálogo de Inventario."
        actions={
          <Button type="button" variant="ghost" size="sm" disabled>
            <PlusIcon /> Añadir servicio
          </Button>
        }
      />
      {services.length === 0 && (
        <EmptyState
          title="Sin servicios reservables"
          hint="Los servicios aparecen aquí cuando el Catálogo de Inventario los publica."
        />
      )}
      {services.map((service, serviceIndex) => (
        <ServiceRow key={service.id} service={service} serviceIndex={serviceIndex} form={form} />
      ))}
    </CustomPageContainer>
  )
}
