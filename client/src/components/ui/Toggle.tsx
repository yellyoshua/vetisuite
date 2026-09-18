import type { InputHTMLAttributes } from 'react'

type ToggleProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'className' | 'style'> & {
  label: string
  hint?: string
}

export default function Toggle({ label, hint, ...inputProps }: ToggleProps) {
  return (
    <label className="flex cursor-pointer items-start gap-3">
      <span className="relative mt-0.5 h-[22px] w-[38px] shrink-0">
        <input {...inputProps} type="checkbox" className="peer absolute inset-0 size-full cursor-pointer opacity-0" />
        <span
          aria-hidden="true"
          className="block size-full rounded-full bg-track transition-colors peer-checked:bg-green motion-reduce:transition-none peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-green"
        />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute top-0.5 left-0.5 size-[18px] rounded-full bg-white transition-transform peer-checked:translate-x-4 motion-reduce:transition-none"
        />
      </span>
      <span>
        <span className="block text-[13.5px] font-semibold text-ink">{label}</span>
        {hint && <span className="mt-0.5 block text-xs text-sub">{hint}</span>}
      </span>
    </label>
  )
}
