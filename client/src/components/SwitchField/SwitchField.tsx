import { useId } from 'react'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'

type SwitchFieldProps = {
  label: string
  hint?: string
  checked: boolean
  ariaLabel?: string
  onCheckedChange: (checked: boolean) => void
}

export default function SwitchField({ label, hint, checked, ariaLabel, onCheckedChange }: SwitchFieldProps) {
  const id = useId()

  return (
    <div className="flex items-start gap-3">
      <Switch id={id} checked={checked} aria-label={ariaLabel} onCheckedChange={onCheckedChange} className="mt-0.5" />
      <Label htmlFor={id} className="flex-col items-start gap-0.5">
        <span className="text-[13.5px] font-semibold text-ink">{label}</span>
        {hint && <span className="text-xs font-normal text-sub">{hint}</span>}
      </Label>
    </div>
  )
}
