import { useEffect, useId, useRef, useState, type ChangeEvent, type KeyboardEvent } from 'react'
import { cn } from '@/lib/utils'

export type ComboBoxOption = {
  value: string
  label: string
}

export type ComboBoxProps = {
  options: ComboBoxOption[]
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  name?: string
  id?: string
  placeholder?: string
  disabled?: boolean
  required?: boolean
  emptyText?: string
  className?: string
  'aria-label'?: string
  'aria-invalid'?: boolean
}

export default function useComboBox({
  options,
  value,
  defaultValue = '',
  onValueChange,
  name,
  id,
  placeholder,
  disabled,
  required,
  emptyText = 'Sin resultados',
  className,
  ...aria
}: ComboBoxProps) {
  const [internalValue, setInternalValue] = useState(defaultValue)
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [activeIndex, setActiveIndex] = useState(0)
  const rootRef = useRef<HTMLDivElement>(null)
  const listId = useId()
  const optionId = useId()

  const selectedValue = value ?? internalValue
  const selectedLabel = options.find((option) => option.value === selectedValue)?.label ?? ''
  const normalizedQuery = query.trim().toLowerCase()
  const filtered =
    query === selectedLabel ? options : options.filter((option) => option.label.toLowerCase().includes(normalizedQuery))
  const active = Math.min(activeIndex, filtered.length - 1)

  useEffect(() => {
    if (!open) return
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [open])

  useEffect(() => {
    if (open && active >= 0) document.getElementById(`${optionId}-${active}`)?.scrollIntoView({ block: 'nearest' })
  }, [open, active, optionId])

  const openList = (index = 0) => {
    setQuery(selectedLabel)
    setActiveIndex(index)
    setOpen(true)
  }

  const select = (option: ComboBoxOption) => {
    if (value === undefined) setInternalValue(option.value)
    onValueChange?.(option.value)
    setOpen(false)
  }

  const onInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    setQuery(event.target.value)
    setActiveIndex(0)
    setOpen(true)
  }

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    const count = filtered.length
    const actions: Record<string, () => void> = {
      ArrowDown: () => (open ? setActiveIndex((active + 1) % Math.max(count, 1)) : openList(0)),
      ArrowUp: () => (open ? setActiveIndex((active - 1 + count) % Math.max(count, 1)) : openList(options.length - 1)),
      Home: () => open && setActiveIndex(0),
      End: () => open && setActiveIndex(count - 1),
      Enter: () => {
        if (open && filtered[active]) select(filtered[active])
      },
      Escape: () => setOpen(false),
    }
    const action = actions[event.key]
    if (!action || ((event.key === 'Home' || event.key === 'End') && !open)) return
    if (event.key !== 'Enter' || open) event.preventDefault()
    action()
  }

  return {
    open,
    emptyText,
    isEmpty: filtered.length === 0,
    emptyProps: { role: 'status' as const, 'aria-live': 'polite' as const, className: 'flex h-7 items-center px-2 text-[13px] text-muted-foreground' },
    rootProps: { ref: rootRef, className: cn('relative w-full', className) },
    inputProps: {
      id,
      type: 'text',
      role: 'combobox' as const,
      autoComplete: 'off',
      spellCheck: false,
      placeholder,
      disabled,
      required,
      value: open ? query : selectedLabel,
      'aria-label': aria['aria-label'],
      'aria-invalid': aria['aria-invalid'],
      'aria-autocomplete': 'list' as const,
      'aria-expanded': open,
      'aria-controls': listId,
      'aria-activedescendant': open && active >= 0 ? `${optionId}-${active}` : undefined,
      onChange: onInputChange,
      onKeyDown,
      onClick: () => !open && openList(0),
      onBlur: () => setOpen(false),
      className:
        'h-8 w-full pr-2 pl-2.5 rounded-control border border-border bg-card text-[13px] text-foreground shadow-lift transition-[color,border-color,box-shadow] duration-150 ease-out-expo motion-reduce:transition-none placeholder:text-muted-foreground hover:border-muted-foreground/40 focus:border-muted-foreground disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-border aria-invalid:border-danger dark:shadow-none',
    },
    hiddenProps: { type: 'hidden', name, value: selectedValue },
    listProps: {
      id: listId,
      role: 'listbox' as const,
      hidden: !open,
      className:
        'absolute top-full left-0 z-50 mt-1 max-h-60 w-full overflow-y-auto overscroll-contain rounded-row border border-border bg-popover p-1 text-popover-foreground shadow-popup dark:shadow-none',
    },
    options: filtered.map((option, index) => ({
      key: option.value,
      label: option.label,
      props: {
        id: `${optionId}-${index}`,
        role: 'option' as const,
        'aria-selected': option.value === selectedValue,
        onMouseDown: (event: { preventDefault: () => void }) => event.preventDefault(),
        onClick: () => select(option),
        onMouseEnter: () => setActiveIndex(index),
        className: cn(
          'flex min-h-7 cursor-pointer touch-manipulation items-center rounded-control px-2 py-1 text-[13px] text-muted-foreground break-words transition-colors duration-150 ease-out-expo motion-reduce:transition-none aria-selected:font-medium aria-selected:text-foreground',
          index === active && 'bg-muted text-foreground',
        ),
      },
    })),
  }
}
