import { X } from 'lucide-react'
import useChip, { type ChipProps } from './chip.handlers'

export default function Chip(props: ChipProps) {
  const { label, chipProps, removeProps } = useChip(props)

  return (
    <span {...chipProps}>
      {label}
      {removeProps && (
        <button {...removeProps}>
          <X aria-hidden="true" />
        </button>
      )}
    </span>
  )
}
