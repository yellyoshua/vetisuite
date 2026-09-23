import { CheckIcon, RotateCcwIcon } from 'lucide-react'
import CustomPage from '@/components/CustomPage/CustomPage'
import { Button } from '@/components/ui/button'
import type { SettingsSection } from '@/modules/employee/settings/settings.schema'
import SettingsForm from './SettingsForm'
import SettingsNav from './SettingsNav'

type SettingsProps = {
  section: SettingsSection
  refetch: () => void
}

const FORM_ID = 'clinic-settings-form'

export default function Settings({ section, refetch }: SettingsProps) {
  return (
    <CustomPage
      title="Configuración de la clínica"
      description="Datos fiscales, moneda e IVA, y las preferencias que rigen a todos los módulos."
      actions={
        <>
          <Button type="reset" form={FORM_ID} variant="ghost">
            <RotateCcwIcon /> Descartar
          </Button>
          <Button type="submit" form={FORM_ID}>
            <CheckIcon /> Guardar cambios
          </Button>
        </>
      }
    >
      <div className="flex flex-wrap items-start gap-3.5">
        <SettingsNav activeSection={section.id} />
        <div className="flex min-w-0 flex-[999_1_340px] flex-col gap-3.5">
          <SettingsForm key={section.id} formId={FORM_ID} section={section} refetch={refetch} />
        </div>
      </div>
    </CustomPage>
  )
}
