import type { ChangeEvent, ComponentProps } from 'react'
import { cn } from '@/lib/utils'

export type SelectOption = { value: string; label: string; disabled?: boolean }

export type SelectProps = ComponentProps<'select'> & {
  options?: SelectOption[]
  placeholder?: string
  onValueChange?: (value: string) => void
}

export default function useSelect({ options = [], placeholder, onValueChange, onChange, className, ...rest }: SelectProps) {
  const handleChange = (event: ChangeEvent<HTMLSelectElement>) => {
    onChange?.(event)
    onValueChange?.(event.target.value)
  }

  const selectClassName = cn(
    'h-8 w-full min-w-0 cursor-pointer pr-2 pl-2.5 rounded-control border border-border bg-card text-[13px] text-foreground shadow-lift transition-[color,border-color,box-shadow] duration-150 ease-out-expo motion-reduce:transition-none placeholder:text-muted-foreground hover:border-muted-foreground/40 focus:border-muted-foreground disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-border aria-invalid:border-danger dark:shadow-none',
    className,
  )

  return { options, placeholder, selectProps: { ...rest, onChange: handleChange, className: selectClassName } }
}
