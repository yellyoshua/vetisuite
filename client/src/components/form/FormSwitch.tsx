import { useController, type Control, type FieldPath, type FieldValues } from 'react-hook-form'
import SwitchField from '@/components/SwitchField/SwitchField'

type FormSwitchProps<TValues extends FieldValues> = {
  control: Control<TValues>
  name: FieldPath<TValues>
  label: string
  hint?: string
  ariaLabel?: string
}

export function FormSwitch<TValues extends FieldValues>({ control, name, label, hint, ariaLabel }: FormSwitchProps<TValues>) {
  const { field } = useController({ control, name })

  return <SwitchField label={label} hint={hint} ariaLabel={ariaLabel} checked={Boolean(field.value)} onCheckedChange={field.onChange} />
}
