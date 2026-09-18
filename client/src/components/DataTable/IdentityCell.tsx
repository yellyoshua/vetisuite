import Avatar from '@/components/ui/Avatar'
import { getInitials } from '@/lib/get-initials'

type IdentityCellProps = {
  title: string
  subtitle: string
}

export default function IdentityCell({ title, subtitle }: IdentityCellProps) {
  return (
    <div className="flex items-center gap-[11px]">
      <Avatar initials={getInitials(title)} />
      <div className="min-w-0">
        <p className="font-head text-sm font-semibold text-ink">{title}</p>
        <p className="mt-px text-[11.5px] text-sub">{subtitle}</p>
      </div>
    </div>
  )
}
