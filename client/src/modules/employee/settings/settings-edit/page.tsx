import { useId } from 'react'
import { useSearchParams } from 'react-router'
import ErrorState from '@/components/ErrorState'
import LoadingState from '@/components/LoadingState'
import PageHeader from '@/components/PageHeader'
import Button from '@/components/legacy-ui/Button'
import Card from '@/components/legacy-ui/Card'
import Icon from '@/components/legacy-ui/Icon'
import { DEFAULT_SETTINGS_SECTION, SETTINGS_SECTION_PARAM } from '@/constants/settings'
import useResolver from '@/hooks/legacy/use-resolver'
import SettingsForm from './components/SettingsForm'
import SettingsNav from './components/SettingsNav'
import { resolveClinicSettings } from './resolvers'

export default function SettingsEditPage() {
  const [searchParams] = useSearchParams()
  const section = searchParams.get(SETTINGS_SECTION_PARAM) ?? DEFAULT_SETTINGS_SECTION
  const formId = useId()
  const { data, error, isLoading } = useResolver(resolveClinicSettings, { section })
  const hasForm = data !== null

  return (
    <>
      <PageHeader
        title="Configuración de la clínica"
        description="Datos fiscales, moneda e IVA, y las preferencias que rigen a todos los módulos."
        actions={
          <>
            <Button type="reset" form={formId} variant="ghost" isDisabled={!hasForm}>
              <Icon name="rotate-ccw" size={14} /> Descartar
            </Button>
            <Button type="submit" form={formId} isDisabled={!hasForm}>
              <Icon name="check" size={14} /> Guardar cambios
            </Button>
          </>
        }
      />
      <div className="flex flex-wrap items-start gap-3.5">
        <SettingsNav activeSection={section} />
        <div className="flex min-w-0 flex-[999_1_340px] flex-col gap-3.5">
          {isLoading && (
            <Card>
              <LoadingState />
            </Card>
          )}
          {error && (
            <Card>
              <ErrorState error={error} />
            </Card>
          )}
          {data && <SettingsForm key={data.id} id={formId} section={data} />}
        </div>
      </div>
    </>
  )
}
