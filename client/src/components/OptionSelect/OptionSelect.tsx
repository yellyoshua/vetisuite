import { cn } from '@/lib/utils'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export type SelectOption = {
  value: string
  label: string
}

type OptionSelectProps = {
  label: string
  value: string
  options: SelectOption[]
  onChange: (value: string) => void
  className?: string
}

const ALL_VALUE = '__all__'

export default function OptionSelect({ label, value, options, onChange, className }: OptionSelectProps) {
  return (
    <Select value={value || ALL_VALUE} onValueChange={(next) => onChange(next === ALL_VALUE ? '' : next)}>
      <SelectTrigger aria-label={label} className={cn('w-full sm:w-[200px]', className)}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option.value || ALL_VALUE} value={option.value || ALL_VALUE}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
