import { useState, type ComponentProps, type MouseEvent } from 'react'
import { cn } from '@/lib/utils'

export type SwitchProps = Omit<ComponentProps<'button'>, 'value' | 'defaultValue'> & {
  checked?: boolean
  defaultChecked?: boolean
  value?: string
  required?: boolean
  onCheckedChange?: (checked: boolean) => void
}

export default function useSwitch({
  checked,
  defaultChecked = false,
  value = 'on',
  name,
  required,
  onCheckedChange,
  onClick,
  className,
  ...rest
}: SwitchProps) {
  const [innerChecked, setInnerChecked] = useState(defaultChecked)
  const isChecked = checked ?? innerChecked

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    onClick?.(event)
    if (event.defaultPrevented) return
    if (checked === undefined) setInnerChecked(!isChecked)
    onCheckedChange?.(!isChecked)
  }

  const switchClassName = cn(
    'inline-flex h-5 w-9 shrink-0 cursor-pointer touch-manipulation items-center rounded-full border border-transparent p-0.5 transition-colors duration-150 ease-out-expo motion-reduce:transition-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-danger',
    isChecked ? 'bg-primary' : 'bg-border',
    className,
  )

  const thumbClassName = cn('block size-4 rounded-full bg-card shadow-control transition-transform duration-150 ease-out-expo motion-reduce:transition-none', isChecked ? 'translate-x-3.5' : 'translate-x-0')

  return {
    switchProps: { ...rest, type: 'button' as const, role: 'switch', 'aria-checked': isChecked, 'aria-required': required, onClick: handleClick, className: switchClassName },
    thumbClassName,
    hiddenInputProps: name && isChecked ? { type: 'hidden', name, value } : null,
  }
}
