import type { ReactNode } from 'react'
import Card from '@/components/legacy-ui/Card'

type SummaryPanelProps = {
  title: string
  meta?: string
  action?: ReactNode
  children: ReactNode
}

export default function SummaryPanel({ title, meta, action, children }: SummaryPanelProps) {
  return (
    <Card className="p-5">
      <div className={`flex justify-between gap-2.5 ${action ? 'items-center' : 'items-baseline'}`}>
        <h2 className="font-head text-[15px] font-semibold text-ink">{title}</h2>
        {meta && <span className="text-[11.5px] text-sub">{meta}</span>}
        {action}
      </div>
      {children}
    </Card>
  )
}
