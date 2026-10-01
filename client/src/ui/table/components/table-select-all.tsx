import { Check, Minus } from 'lucide-react'
import useTableSelectAll, { type TableSelectAllProps } from './table-select-all.handlers'

export default function TableSelectAll(props: TableSelectAllProps) {
  const { wrapperProps, inputProps, boxProps } = useTableSelectAll(props)

  return (
    <span {...wrapperProps}>
      <input {...inputProps} />
      <span {...boxProps}>
        <Check className="check" strokeWidth={3} />
        <Minus className="minus" strokeWidth={3} />
      </span>
    </span>
  )
}
