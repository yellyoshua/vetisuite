import { useEffect, useImperativeHandle, useRef, type ChangeEvent, type ComponentProps } from 'react'
import { cn } from '@/lib/utils'

type SearchLabel = { 'aria-label': string; id?: string } | { 'aria-label'?: undefined; id: string }

export type SearchInputProps = Omit<ComponentProps<'input'>, 'type' | 'aria-label' | 'id'> &
  SearchLabel & {
    onValueChange?: (value: string) => void
    shortcut?: string
    onShortcut?: () => void
  }

export default function useSearchInput({ onValueChange, onChange, shortcut, onShortcut, className, ref, ...rest }: SearchInputProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  useImperativeHandle(ref, () => inputRef.current as HTMLInputElement)

  useEffect(() => {
    if (!shortcut) return
    const onKeyDown = (event: KeyboardEvent) => {
      const input = inputRef.current
      if (event.key.toLowerCase() !== 'k' || !(event.metaKey || event.ctrlKey)) return
      if (!input || input.getClientRects().length === 0) return
      event.preventDefault()
      input.focus()
      onShortcut?.()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [shortcut, onShortcut])

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    onChange?.(event)
    onValueChange?.(event.target.value)
  }

  return {
    shortcut,
    rootClassName: cn(
      'flex h-8 w-full min-w-0 items-center gap-2 rounded-control border border-border bg-card pr-2 pl-2.5 shadow-lift transition-[border-color] duration-150 ease-out-expo focus-within:border-muted-foreground hover:border-muted-foreground/40 has-[input:disabled]:opacity-50 has-[input[aria-invalid=true]]:border-danger motion-reduce:transition-none dark:shadow-none',
      className,
    ),
    iconClassName: 'size-4 shrink-0 text-muted-foreground',
    kbdClassName: 'shrink-0 rounded-sm border border-border bg-muted px-1 font-body text-xs leading-4 font-medium text-muted-foreground',
    inputProps: {
      ...rest,
      ref: inputRef,
      type: 'search',
      'aria-keyshortcuts': shortcut ? 'Meta+K Control+K' : undefined,
      onChange: handleChange,
      className:
        'h-full min-w-0 flex-1 bg-transparent text-[13px] leading-none text-foreground placeholder:text-muted-foreground focus-visible:outline-offset-4 disabled:cursor-not-allowed [&::-webkit-search-cancel-button]:hidden',
    },
  }
}
