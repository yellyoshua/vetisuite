import { useState, type FormEvent } from 'react'
import Card from '@/components/ui/Card'
import Toggle from '@/components/ui/Toggle'
import useMutation from '@/hooks/use-mutation'
import type { SettingsSection, SettingsValues } from '../../settings.schema'
import { saveClinicSettings } from '../resolvers'
import SettingsFieldControl from './SettingsFieldControl'
import SettingsSaveBar from './SettingsSaveBar'

type SettingsFormProps = {
  id: string
  section: SettingsSection
}

type SavedSettings = {
  section: SettingsSection
  revision: number
}

type SaveStatusInput = {
  isSaving: boolean
  hasSaved: boolean
}

function readSettingsForm(form: HTMLFormElement, section: SettingsSection): SettingsValues {
  const formData = new FormData(form)
  const editableFields = section.fields.filter((field) => !field.isLocked)

  return {
    fields: Object.fromEntries(editableFields.map((field) => [field.name, String(formData.get(field.name))] as const)),
    toggles: Object.fromEntries(section.toggles.map((toggle) => [toggle.name, formData.get(toggle.name) === 'on'] as const)),
  }
}

function describeSaveStatus({ isSaving, hasSaved }: SaveStatusInput): string {
  if (isSaving) {
    return 'Guardando…'
  }

  if (hasSaved) {
    return 'Cambios guardados'
  }

  return ''
}

export default function SettingsForm({ id, section }: SettingsFormProps) {
  const [saved, setSaved] = useState<SavedSettings>({ section, revision: 0 })
  const [isSaving, saveSettings, saveError] = useMutation(saveClinicSettings, {
    onSuccess: (savedSection) => setSaved((current) => ({ section: savedSection, revision: current.revision + 1 })),
  })
  const current = saved.section
  const titleId = `${id}-title`
  const status = describeSaveStatus({ isSaving, hasSaved: saved.revision > 0 && saveError === null })

  function submitSettings(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    saveSettings({ section: current.id, values: readSettingsForm(event.currentTarget, current) })
  }

  return (
    <>
      <Card className="p-5">
        <form key={saved.revision} id={id} aria-labelledby={titleId} onSubmit={submitSettings}>
          <h2 id={titleId} className="m-0 font-head text-[15px] font-semibold text-ink">
            {current.title}
          </h2>
          <p className="mt-[3px] max-w-[70ch] text-[12.5px] text-pretty text-sub">{current.description}</p>
          <div className="@container mt-[18px] grid grid-cols-[repeat(auto-fit,minmax(min(190px,100%),1fr))] gap-3">
            {current.fields.map((field) => (
              <SettingsFieldControl key={field.name} field={field} />
            ))}
          </div>
          {current.toggles.length > 0 && (
            <div className="mt-[18px] flex flex-col gap-3.5 border-t border-line-soft pt-4">
              {current.toggles.map((toggle) => (
                <Toggle
                  key={toggle.name}
                  name={toggle.name}
                  label={toggle.label}
                  hint={toggle.hint}
                  defaultChecked={toggle.isChecked}
                />
              ))}
            </div>
          )}
        </form>
      </Card>
      <SettingsSaveBar formId={id} status={status} error={saveError} />
    </>
  )
}
