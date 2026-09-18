import type { ReactNode } from 'react'

type KpiGridProps = {
  children: ReactNode
}

export default function KpiGrid({ children }: KpiGridProps) {
  return <div className="mb-3.5 grid grid-cols-[repeat(auto-fit,minmax(min(180px,100%),1fr))] gap-3">{children}</div>
}
