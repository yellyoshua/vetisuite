import type { ReactNode } from 'react'

type PageHeaderProps = {
  title: string
  description: string
  actions?: ReactNode
}

export default function PageHeader({ title, description, actions }: PageHeaderProps) {
  return (
    <header className="mb-[18px] flex flex-wrap items-end justify-between gap-3">
      <div className="min-w-0">
        <h1 className="m-0 font-head text-[22px] font-bold tracking-[-0.3px] text-ink">{title}</h1>
        <p className="mt-[3px] max-w-[72ch] text-[13px] text-pretty text-sub">{description}</p>
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </header>
  )
}
