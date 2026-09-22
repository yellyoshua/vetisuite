import type { ComponentProps, ReactNode } from 'react'
import { useState } from 'react'
import { useController, type Control, type FieldPath, type FieldValues } from 'react-hook-form'
import { ChevronDownIcon } from 'lucide-react'
import { Field, FieldDescription, FieldError, FieldLabel } from '@/components/ui/field'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'

type ControlledProps<TValues extends FieldValues> = {
  control: Control<TValues>
  name: FieldPath<TValues>
  label: ReactNode
  description?: ReactNode
  placeholder?: string
  labelClassName?: string
}

type FormInputProps<TValues extends FieldValues> = ControlledProps<TValues> &
  Omit<ComponentProps<typeof Input>, 'name' | 'placeholder'> & { inputClassName?: string }

type FormTextareaProps<TValues extends FieldValues> = ControlledProps<TValues> &
  Omit<ComponentProps<typeof Textarea>, 'name' | 'placeholder'> & { inputClassName?: string }

export type SelectOption = {
  value: string
  label: ReactNode
}

type FormInputSelectProps<TValues extends FieldValues> = ControlledProps<TValues> &
  Omit<ComponentProps<typeof Select>, 'name' | 'value' | 'onValueChange'> & {
    options: SelectOption[]
    className?: string
  }

type FormInputDatePickerProps<TValues extends FieldValues> = {
  control: Control<TValues>
  name: FieldPath<TValues>
  label: ReactNode
  valueFormat?: 'date'
}

export default function Form({ children, onSubmit, ...props }: ComponentProps<'form'>) {
  return (
    <form onSubmit={onSubmit} {...props}>{children}</form>
  )
}

export function FormInput<TValues extends FieldValues>({ control, name, label, description, placeholder, labelClassName, inputClassName, ...props }: FormInputProps<TValues>) {
  const { field, fieldState } = useController({ name, control })

  return (
    <Field data-invalid={fieldState.invalid}>
      <FieldLabel htmlFor={name} className={labelClassName}>{label}</FieldLabel>
      <Input
        {...field}
        {...props}
        id={name}
        placeholder={placeholder}
        aria-invalid={fieldState.invalid}
        autoComplete="off"
        className={inputClassName}
      />
      {description && <FieldDescription>{description}</FieldDescription>}
      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
    </Field>
  )
}

export function FormTextarea<TValues extends FieldValues>({ control, name, label, description, placeholder, labelClassName, inputClassName, ...props }: FormTextareaProps<TValues>) {
  const { field, fieldState } = useController({ name, control })

  return (
    <Field data-invalid={fieldState.invalid}>
      <FieldLabel htmlFor={name} className={labelClassName}>{label}</FieldLabel>
      <Textarea {...field} {...props} id={name} placeholder={placeholder} aria-invalid={fieldState.invalid} className={inputClassName} />
      {description && <FieldDescription>{description}</FieldDescription>}
      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
    </Field>
  )
}

export function FormInputSelect<TValues extends FieldValues>({ control, name, label, description, placeholder, options, labelClassName, className, ...props }: FormInputSelectProps<TValues>) {
  const { field, fieldState } = useController({ name, control })

  return (
    <Field data-invalid={fieldState.invalid}>
      <FieldLabel htmlFor={name} className={labelClassName}>{label}</FieldLabel>
      <Select value={field.value ?? undefined} onValueChange={field.onChange} {...props}>
        <SelectTrigger id={name} aria-invalid={fieldState.invalid} className={className || 'w-full'}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {description && <FieldDescription>{description}</FieldDescription>}
      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
    </Field>
  )
}

function toDateOnly(date: Date): string {
  const pad = (value: number) => String(value).padStart(2, '0')

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

function parseDateOnly(value: unknown): Date | undefined {
  if (!value) {
    return undefined
  }

  const [year, month, day] = String(value).split('-').map(Number)

  return new Date(year, month - 1, day)
}

function toFieldValue(date: Date | undefined, isDateOnly: boolean): Date | string | null {
  if (!date) {
    return null
  }

  return isDateOnly ? toDateOnly(date) : date
}

export function FormInputDatePicker<TValues extends FieldValues>({ control, name, label, valueFormat }: FormInputDatePickerProps<TValues>) {
  const [open, setOpen] = useState(false)
  const isDateOnly = valueFormat === 'date'
  const { field, fieldState } = useController({ name, control })
  const selectedDate: Date | undefined = isDateOnly ? parseDateOnly(field.value) : field.value

  return (
    <div className="flex flex-col gap-3">
      <Label htmlFor={name} className="px-1">
        {label}
      </Label>
      <Field data-invalid={fieldState.invalid}>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              id={name}
              className="w-full justify-between font-normal"
            >
              {selectedDate ? new Date(selectedDate).toLocaleDateString() || '' : 'Seleccionar fecha'}
              <ChevronDownIcon />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto overflow-hidden p-0" align="start">
            <Calendar
              mode="single"
              selected={selectedDate}
              captionLayout="dropdown"
              className="w-full"
              onSelect={(date) => {
                field.onChange(toFieldValue(date, isDateOnly))
                setOpen(false)
              }}
            />
          </PopoverContent>
        </Popover>
        {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
      </Field>
    </div>
  )
}

export { FormUploadAvatar } from './FormUploadAvatar'
export { FormUploadFiles } from './FormUploadFiles'
