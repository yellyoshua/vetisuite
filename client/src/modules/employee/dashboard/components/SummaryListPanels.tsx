import EmptyState from '@/components/EmptyState'
import Badge from '@/components/legacy-ui/Badge'
import Card from '@/components/legacy-ui/Card'
import Icon, { type IconName } from '@/components/legacy-ui/Icon'
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
  icon: IconName
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
  return (
    <Card className="p-5">
      <div className="mb-3 flex items-center gap-2">
        <span className={ICON_TONE_CLASS_NAMES[definition.tone]}>
          <Icon name={definition.icon} size={15} />
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
              <Badge tone={item.tone}>{item.badge}</Badge>
            </li>
          ))}
        </ul>
      )}
    </Card>
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
