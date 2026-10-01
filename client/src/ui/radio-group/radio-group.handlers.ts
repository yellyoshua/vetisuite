import type { ChangeEvent, ComponentProps } from 'react'
import { cn } from '@/lib/utils'

export type RadioGroupOption = { value: string; label: string; disabled?: boolean }

export type RadioGroupProps = Omit<ComponentProps<'div'>, 'onChange' | 'defaultValue'> & {
  name: string
  options: RadioGroupOption[]
  value?: string
  defaultValue?: string
  disabled?: boolean
  required?: boolean
  orientation?: 'vertical' | 'horizontal'
  onValueChange?: (value: string) => void
  onChange?: (event: ChangeEvent<HTMLInputElement>) => void
}

export default function useRadioGroup({
  name,
  options,
  value,
  defaultValue,
  disabled,
  required,
  orientation = 'vertical',
  onValueChange,
  onChange,
  className,
  ...rest
}: RadioGroupProps) {
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    onChange?.(event)
    onValueChange?.(event.target.value)
  }

  const items = options.map((option) => ({
    key: option.value,
    label: option.label,
    inputProps: {
      type: 'radio',
      name,
      value: option.value,
      required,
      disabled: disabled || option.disabled,
      onChange: handleChange,
      ...(value === undefined ? { defaultChecked: defaultValue === option.value } : { checked: value === option.value }),
      className: 'peer absolute inset-0 m-0 size-full cursor-pointer opacity-0 disabled:cursor-not-allowed',
    },
    rootClassName: 'relative inline-flex size-4 shrink-0',
    circleClassName:
      'pointer-events-none flex size-4 items-center justify-center rounded-full border border-border bg-card transition-[background-color,border-color] duration-150 ease-out-expo motion-reduce:transition-none peer-hover:border-muted-foreground/40 peer-checked:border-primary peer-checked:bg-primary peer-focus-visible:ring-2 peer-focus-visible:ring-ring dark:shadow-none [&>span]:invisible peer-checked:[&>span]:visible',
    labelClassName: cn('flex cursor-pointer items-center gap-2 text-[13px] leading-none text-foreground', (disabled || option.disabled) && 'cursor-not-allowed opacity-50'),
  }))

  const groupClassName = cn(
    'flex gap-3 aria-invalid:rounded-control aria-invalid:ring-2 aria-invalid:ring-danger',
    orientation === 'vertical' ? 'flex-col' : 'flex-row flex-wrap',
    className,
  )

  return {
    items,
    groupProps: { ...rest, role: 'radiogroup', 'aria-orientation': orientation, 'aria-required': required, 'aria-disabled': disabled, className: groupClassName },
  }
}
