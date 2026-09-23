import { Link } from 'react-router'
import { ChevronRightIcon, EyeIcon, ReceiptIcon } from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { BADGE_TONE_CLASS_NAMES } from '@/constants/badge-tones'
import { VISIT_ADVANCE_VARIANTS, VISIT_TYPE_ICONS, VISIT_TYPE_LABELS, VISIT_TYPE_TONES } from '@/constants/visits'
import { formatDate } from '@/lib/date'
import { getInitials } from '@/lib/utils'
import type { Visit } from '@/modules/employee/visits/visits.schema'

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
      <Button asChild variant="ghost" size="sm">
        <Link to="/billing" aria-label={ariaLabel}>
          {label} <ReceiptIcon />
        </Link>
      </Button>
    )
  }

  return (
    <Button
      variant={VISIT_ADVANCE_VARIANTS[visit.status]}
      size="sm"
      disabled={isAdvancing}
      aria-label={ariaLabel}
      onClick={() => onAdvance(visit.id)}
    >
      {label} <ChevronRightIcon />
    </Button>
  )
}

export default function VisitCard({ visit, advanceLabel, isTypeVisible, isAdvancing, onAdvance }: VisitCardProps) {
  const TypeIcon = VISIT_TYPE_ICONS[visit.type]

  return (
    <li className="rounded-row border border-line p-3">
      <div className="flex items-center gap-2.5">
        <Avatar>
          <AvatarFallback className="bg-green-soft text-green text-xs font-semibold">{getInitials(visit.patientName)}</AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <p className="truncate font-head text-[13.5px] font-semibold text-ink">{visit.patientName}</p>
          <p className="truncate text-[11.5px] text-sub">{visit.ownerName}</p>
        </div>
        <span className="font-head text-[11.5px] text-sub tabular-nums">{formatDate(visit.createdAt, { hour: '2-digit', minute: '2-digit' })}</span>
      </div>
      <p className="mt-2.5 text-[12.5px] text-ink">{visit.service}</p>
      <p className="mt-0.5 text-[11.5px] text-sub">{visit.staffName}</p>
      {isTypeVisible && (
        <div className="mt-[9px] flex items-center gap-1.5">
          <Badge variant="outline" className={BADGE_TONE_CLASS_NAMES[VISIT_TYPE_TONES[visit.type]]}>
            <TypeIcon />
            {VISIT_TYPE_LABELS[visit.type]}
          </Badge>
        </div>
      )}
      <div className="mt-3 flex items-center gap-1.5">
        <Button variant="ghost" size="sm" disabled aria-label={`Ver visita de ${visit.patientName}`}>
          <EyeIcon /> Ver
        </Button>
        <div className="ml-auto">
          <VisitAdvanceAction visit={visit} label={advanceLabel} isAdvancing={isAdvancing} onAdvance={onAdvance} />
        </div>
      </div>
    </li>
  )
}
