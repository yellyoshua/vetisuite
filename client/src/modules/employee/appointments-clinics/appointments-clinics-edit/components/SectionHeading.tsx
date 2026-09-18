import type { ReactNode } from 'react'

type SectionHeadingProps = {
  title: string
  description: string
  actions?: ReactNode
}

export default function SectionHeading({ title, description, actions }: SectionHeadingProps) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div className="min-w-0">
        <h2 className="m-0 font-head text-[15px] font-semibold text-ink">{title}</h2>
        <p className="mt-[3px] max-w-[70ch] text-[12.5px] text-pretty text-sub">{description}</p>
      </div>
      {actions}
    </div>
  )
}
