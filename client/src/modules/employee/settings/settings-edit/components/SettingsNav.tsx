import { Link } from 'react-router'
import Card from '@/components/legacy-ui/Card'
import Icon from '@/components/legacy-ui/Icon'
import {
  SETTINGS_SECTION_ICONS,
  SETTINGS_SECTION_LABELS,
  SETTINGS_SECTION_PARAM,
  SETTINGS_SECTION_VALUES,
} from '@/constants/settings'

type SettingsNavProps = {
  activeSection: string
}

const LINK_CLASS_NAME = 'mb-0.5 flex w-full items-center gap-2.5 rounded-control px-[11px] py-2.5 font-body text-[13.5px]'

export default function SettingsNav({ activeSection }: SettingsNavProps) {
  return (
    <Card className="max-w-[250px] min-w-[180px] flex-[1_1_200px] p-2">
      <nav aria-label="Secciones de la configuración">
        {SETTINGS_SECTION_VALUES.map((section) => {
          const isActive = section === activeSection

          return (
            <Link
              key={section}
              to={`?${SETTINGS_SECTION_PARAM}=${section}`}
              aria-current={isActive ? 'page' : undefined}
              className={`${LINK_CLASS_NAME} ${isActive ? 'bg-green-soft font-semibold text-green' : 'text-ink'}`}
            >
              <span className={isActive ? 'text-green' : 'text-sub'}>
                <Icon name={SETTINGS_SECTION_ICONS[section]} size={15} />
              </span>
              <span className="min-w-0 flex-1">{SETTINGS_SECTION_LABELS[section]}</span>
            </Link>
          )
        })}
      </nav>
    </Card>
  )
}
