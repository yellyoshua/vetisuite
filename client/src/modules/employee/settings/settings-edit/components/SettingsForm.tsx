import { LockIcon, InfoIcon, CheckIcon } from 'lucide-react'
import useForm from '@/hooks/use-form'
import { CustomPageContainer } from '@/components/CustomPage/CustomPage'
import Form, { FormInput, FormInputSelect, FormSwitch } from '@/components/form/Form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { settingsValuesSchema, type SettingsSection, type SettingsValues } from '@/modules/employee/settings/settings.schema'
import { saveClinicSettings } from '../resolvers'

type SettingsFormProps = {
  formId: string
  section: SettingsSection
  refetch: () => void
}

function toSettingsValues(section: SettingsSection): SettingsValues {
  return {
    fields: Object.fromEntries(section.fields.filter((field) => !field.isLocked).map((field) => [field.name, field.value])),
    toggles: Object.fromEntries(section.toggles.map((toggle) => [toggle.name, toggle.isChecked])),
  }
}

export default function SettingsForm({ formId, section, refetch }: SettingsFormProps) {
  const values = toSettingsValues(section)
  const form = useForm<SettingsValues>(values, {
    schema: settingsValuesSchema(section),
    onSubmit: (body) => saveClinicSettings({ section: section.id, values: body }),
    successMessage: 'Cambios guardados',
    onSuccess: () => refetch(),
  })

  return (
    <>
      <CustomPageContainer className="p-5">
        <Form id={formId} onSubmit={form.handleSubmit} onReset={(event) => { event.preventDefault(); form.reset(values) }}>
          <h2 className="m-0 font-head text-[15px] font-semibold text-ink">{section.title}</h2>
          <p className="mt-[3px] max-w-[70ch] text-[12.5px] text-pretty text-sub">{section.description}</p>
          <div className="@container mt-[18px] grid grid-cols-[repeat(auto-fit,minmax(min(190px,100%),1fr))] gap-3">
            {section.fields.map((field) => (
              <div key={field.name} className={field.isWide ? 'min-w-0 @min-[392px]:col-span-2' : 'min-w-0'}>
                {field.isLocked && (
                  <div className="flex flex-col gap-3">
                    <Label htmlFor={`locked-${field.name}`}>{field.label}</Label>
                    <Input id={`locked-${field.name}`} value={field.value} disabled readOnly />
                  </div>
                )}
                {!field.isLocked && field.type === 'select' && (
                  <FormInputSelect
                    control={form.control}
                    name={`fields.${field.name}`}
                    label={field.label}
                    options={field.options.map((option) => ({ value: option, label: option }))}
                  />
                )}
                {!field.isLocked && field.type !== 'select' && (
                  <FormInput control={form.control} name={`fields.${field.name}`} label={field.label} type={field.type} />
                )}
                {field.note && (
                  <p className="mt-[5px] flex items-center gap-[5px] text-[11px] text-sub">
                    <LockIcon className="size-[11px]" aria-hidden="true" />
                    {field.note}
                  </p>
                )}
              </div>
            ))}
          </div>
          {section.toggles.length > 0 && (
            <div className="mt-[18px] flex flex-col gap-3.5 border-t border-line-soft pt-4">
              {section.toggles.map((toggle) => (
                <FormSwitch key={toggle.name} control={form.control} name={`toggles.${toggle.name}`} label={toggle.label} hint={toggle.hint} />
              ))}
            </div>
          )}
        </Form>
      </CustomPageContainer>
      <CustomPageContainer className="sticky bottom-0 flex flex-wrap items-center gap-3 px-4 py-3">
        <span className="flex items-center gap-[7px] text-xs text-sub">
          <InfoIcon className="size-3.5" aria-hidden="true" />
          Los cambios se aplican a todos los módulos en cuanto guardas.
        </span>
        <div className="ml-auto flex items-center gap-2">
          <Button type="reset" form={formId} variant="ghost" size="sm" disabled={form.isSubmitting}>
            Descartar
          </Button>
          <Button type="submit" form={formId} size="sm" disabled={form.isSubmitting}>
            <CheckIcon /> Guardar cambios
          </Button>
        </div>
      </CustomPageContainer>
    </>
  )
}
