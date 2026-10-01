import type { ChangeEvent, ComponentProps } from 'react'
import { cn } from '@/lib/utils'

export type CheckboxProps = Omit<ComponentProps<'input'>, 'type'> & {
  onCheckedChange?: (checked: boolean) => void
}

export default function useCheckbox({ onCheckedChange, onChange, className, ...rest }: CheckboxProps) {
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    onChange?.(event)
    onCheckedChange?.(event.target.checked)
  }

  const boxClassName = cn(
    'pointer-events-none flex size-4 items-center justify-center rounded-sm border border-border bg-card text-primary-foreground transition-[background-color,border-color] duration-150 ease-out-expo motion-reduce:transition-none peer-hover:border-muted-foreground/40 peer-checked:border-primary peer-checked:bg-primary peer-focus-visible:ring-2 peer-focus-visible:ring-ring peer-disabled:opacity-50 peer-aria-invalid:border-danger dark:shadow-none [&>svg]:invisible peer-checked:[&>svg]:visible',
    className,
  )

  return {
    rootClassName: 'relative inline-flex size-4 shrink-0',
    boxClassName,
    checkboxProps: { ...rest, type: 'checkbox', onChange: handleChange, className: 'peer absolute inset-0 m-0 size-full cursor-pointer opacity-0 disabled:cursor-not-allowed' },
  }
}
