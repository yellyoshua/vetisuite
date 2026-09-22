import type { ReactNode } from 'react'

type FieldProps = {
  label: string
  children: ReactNode
}

export default function Field({ label, children }: FieldProps) {
  return (
    <label className="block min-w-0">
      <span className="mb-[5px] block text-[11.5px] font-semibold tracking-[0.3px] text-sub uppercase">{label}</span>
      {children}
    </label>
  )
}
