import Icon, { type IconName } from './Icon'
import Tooltip from './Tooltip'

type IconButtonVariant = 'plain' | 'soft'

const VARIANT_CLASS_NAMES: Record<IconButtonVariant, string> = {
  plain: 'bg-transparent',
  soft: 'bg-bg',
}

type IconButtonProps = {
  icon: IconName
  label: string
  variant?: IconButtonVariant
  isDisabled?: boolean
  onClick?: () => void
}

export default function IconButton({ icon, label, variant = 'plain', isDisabled = false, onClick }: IconButtonProps) {
  return (
    <Tooltip content={label}>
      {(describedById) => (
        <button
          type="button"
          onClick={onClick}
          disabled={isDisabled}
          aria-label={label}
          aria-describedby={describedById}
          className={`flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-lg border-0 text-sub disabled:cursor-not-allowed disabled:opacity-50 ${VARIANT_CLASS_NAMES[variant]}`}
        >
          <Icon name={icon} size={14} />
        </button>
      )}
    </Tooltip>
  )
}
