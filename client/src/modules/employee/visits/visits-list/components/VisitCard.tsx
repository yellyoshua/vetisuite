import Avatar from '@/components/ui/Avatar'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import ButtonLink from '@/components/ui/ButtonLink'
import Icon from '@/components/ui/Icon'
import { VISIT_ADVANCE_VARIANTS, VISIT_TYPE_ICONS, VISIT_TYPE_LABELS, VISIT_TYPE_TONES } from '@/constants/visits'
import { getInitials } from '@/lib/get-initials'
import type { Visit } from '../../visits.schema'

type VisitAdvanceActionProps = {
  visit: Visit
  label: string
  isAdvancing: boolean
  onAdvance: (visitId: string) => void
}

type VisitCardProps = Omit<VisitAdvanceActionProps, 'label'> & {
  advanceLabel: string
  isTypeVisible: boolean
}

function VisitAdvanceAction({ visit, label, isAdvancing, onAdvance }: VisitAdvanceActionProps) {
  const ariaLabel = `${label} visita de ${visit.patientName}`
  if (visit.status === 'done') {
    return (
      <ButtonLink to="/billing" variant="ghost" size="sm" ariaLabel={ariaLabel}>
        {label} <Icon name="receipt" size={13} />
      </ButtonLink>
    )
  }

  return (
    <Button
      variant={VISIT_ADVANCE_VARIANTS[visit.status]}
      size="sm"
      isDisabled={isAdvancing}
      ariaLabel={ariaLabel}
      onClick={() => onAdvance(visit.id)}
    >
      {label} <Icon name="chevron-right" size={13} />
    </Button>
  )
}

export default function VisitCard({ visit, advanceLabel, isTypeVisible, isAdvancing, onAdvance }: VisitCardProps) {
  return (
    <li className="rounded-row border border-line p-3">
      <div className="flex items-center gap-2.5">
        <Avatar initials={getInitials(visit.patientName)} size={32} />
        <div className="min-w-0 flex-1">
          <p className="truncate font-head text-[13.5px] font-semibold text-ink">{visit.patientName}</p>
          <p className="truncate text-[11.5px] text-sub">{visit.ownerName}</p>
        </div>
        <span className="font-head text-[11.5px] text-sub tabular-nums">{visit.time}</span>
      </div>
      <p className="mt-2.5 text-[12.5px] text-ink">{visit.service}</p>
      <p className="mt-0.5 text-[11.5px] text-sub">{visit.staffName}</p>
      {isTypeVisible && (
        <div className="mt-[9px] flex items-center gap-1.5">
          <Badge tone={VISIT_TYPE_TONES[visit.type]}>
            <Icon name={VISIT_TYPE_ICONS[visit.type]} size={11} />
            {VISIT_TYPE_LABELS[visit.type]}
          </Badge>
        </div>
      )}
      <div className="mt-3 flex items-center gap-1.5">
        <Button variant="ghost" size="sm" isDisabled ariaLabel={`Ver visita de ${visit.patientName}`}>
          <Icon name="eye" size={13} /> Ver
        </Button>
        <div className="ml-auto">
          <VisitAdvanceAction visit={visit} label={advanceLabel} isAdvancing={isAdvancing} onAdvance={onAdvance} />
        </div>
      </div>
    </li>
  )
}
