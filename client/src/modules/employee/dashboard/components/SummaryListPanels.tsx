import EmptyState from '@/components/EmptyState/EmptyState'
import type { LucideIcon } from 'lucide-react'
import { CustomPageContainer } from '@/components/CustomPage/CustomPage'
import { Badge } from '@/components/ui/badge'
import { BADGE_TONE_CLASS_NAMES } from '@/constants/badge-tones'
import type { ListPanelData } from '../dashboard.schema'

type PanelIconTone = 'green' | 'amber' | 'blue' | 'red' | 'sub'

const ICON_TONE_CLASS_NAMES: Record<PanelIconTone, string> = {
  green: 'text-green',
  amber: 'text-amber',
  blue: 'text-blue',
  red: 'text-red',
  sub: 'text-sub',
}

export type ListPanelDefinition<TKey extends string> = {
  key: TKey
  title: string
  icon: LucideIcon
  tone: PanelIconTone
}

type ListPanelProps = {
  definition: ListPanelDefinition<string>
  panel: ListPanelData
}

type SummaryListPanelsProps<TKey extends string> = {
  definitions: ListPanelDefinition<TKey>[]
  panels: Record<TKey, ListPanelData>
}

function ListPanel({ definition, panel }: ListPanelProps) {
  const Icon = definition.icon

  return (
    <CustomPageContainer className="p-5">
      <div className="mb-3 flex items-center gap-2">
        <span className={ICON_TONE_CLASS_NAMES[definition.tone]}>
          <Icon className="size-[15px]" aria-hidden="true" />
        </span>
        <h2 className="min-w-0 flex-1 font-head text-[15px] font-semibold text-ink">{definition.title}</h2>
        <span className="text-[11.5px] text-sub">{panel.meta}</span>
      </div>
      {panel.items.length === 0 ? (
        <EmptyState title="Sin registros" hint="Aquí aparecerán en cuanto haya actividad." />
      ) : (
        <ul>
          {panel.items.map((item) => (
            <li key={item.name} className="flex flex-wrap items-center gap-2.5 border-t border-line-soft py-2.5">
              <div className="min-w-0 flex-1">
                <p className="text-[13.5px] font-semibold text-ink">{item.name}</p>
                <p className="text-[12px] text-sub">{item.detail}</p>
              </div>
              <Badge variant="outline" className={BADGE_TONE_CLASS_NAMES[item.tone]}>{item.badge}</Badge>
            </li>
          ))}
        </ul>
      )}
    </CustomPageContainer>
  )
}

export default function SummaryListPanels<TKey extends string>({ definitions, panels }: SummaryListPanelsProps<TKey>) {
  return (
    <div className="grid grid-cols-[repeat(auto-fit,minmax(min(330px,100%),1fr))] items-start gap-3.5">
      {definitions.map((definition) => (
        <ListPanel key={definition.key} definition={definition} panel={panels[definition.key]} />
      ))}
    </div>
  )
}
