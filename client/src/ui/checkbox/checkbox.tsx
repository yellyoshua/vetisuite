import { Check } from 'lucide-react'
import useCheckbox, { type CheckboxProps } from './checkbox.handlers'

export default function Checkbox(props: CheckboxProps) {
  const { rootClassName, boxClassName, checkboxProps } = useCheckbox(props)

  return (
    <span className={rootClassName}>
      <input {...checkboxProps} />
      <span aria-hidden="true" className={boxClassName}>
        <Check className="size-3" strokeWidth={3} />
      </span>
    </span>
  )
}
