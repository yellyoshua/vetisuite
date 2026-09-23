import type { SelectOption } from '@/components/OptionSelect/OptionSelect'
import { cn } from '@/lib/utils'

type FilterChipsProps = {
  label: string
  options: SelectOption[]
  value: string
  onChange: (value: string) => void
}

export default function FilterChips({ label, options, value, onChange }: FilterChipsProps) {
  return (
    <div role="group" aria-label={label} className="flex flex-wrap items-center gap-2">
      {options.map((option) => {
        const isActive = option.value === value

        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={isActive}
            onClick={() => onChange(option.value)}
            className={cn(
              'cursor-pointer rounded-full border px-3 py-1.5 text-xs whitespace-nowrap',
              isActive ? 'border-transparent bg-green-soft font-semibold text-green' : 'border-line bg-card font-medium text-sub',
            )}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}
