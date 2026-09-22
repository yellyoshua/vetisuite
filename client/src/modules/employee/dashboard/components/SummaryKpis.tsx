import KpiCard, { type KpiTone } from '@/components/KpiCard'
import KpiGrid from '@/components/KpiGrid'
import type { IconName } from '@/components/legacy-ui/Icon'
import type { KpiValue } from '../dashboard.schema'

export type KpiDefinition<TKey extends string> = {
  key: TKey
  label: string
  icon: IconName
  tone: KpiTone
}

type SummaryKpisProps<TKey extends string> = {
  definitions: KpiDefinition<TKey>[]
  values: Record<TKey, KpiValue>
}

export default function SummaryKpis<TKey extends string>({ definitions, values }: SummaryKpisProps<TKey>) {
  return (
    <KpiGrid>
      {definitions.map((definition) => (
        <KpiCard
          key={definition.key}
          label={definition.label}
          value={values[definition.key].value}
          detail={values[definition.key].detail}
          icon={definition.icon}
          tone={definition.tone}
        />
      ))}
    </KpiGrid>
  )
}
