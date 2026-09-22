import Field from '@/components/legacy-ui/Field'
import Icon from '@/components/legacy-ui/Icon'
import Input from '@/components/legacy-ui/Input'
import Select from '@/components/legacy-ui/Select'
import type { SettingsField } from '../../settings.schema'

type SettingsFieldControlProps = {
  field: SettingsField
}

export default function SettingsFieldControl({ field }: SettingsFieldControlProps) {
  return (
    <div className={field.isWide ? 'min-w-0 @min-[392px]:col-span-2' : 'min-w-0'}>
      <Field label={field.label}>
        {field.type === 'select' ? (
          <Select name={field.name} defaultValue={field.value} disabled={field.isLocked}>
            {field.options.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </Select>
        ) : (
          <Input
            name={field.name}
            type={field.type}
            defaultValue={field.value}
            disabled={field.isLocked}
            required
            autoComplete="off"
          />
        )}
      </Field>
      {field.note && (
        <p className="mt-[5px] flex items-center gap-[5px] text-[11px] text-sub">
          <Icon name="lock" size={11} />
          {field.note}
        </p>
      )}
    </div>
  )
}
