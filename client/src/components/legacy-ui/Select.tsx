import type { SelectHTMLAttributes } from 'react'
import { CONTROL_CLASS_NAME } from './control-class-name'

type SelectProps = Omit<SelectHTMLAttributes<HTMLSelectElement>, 'className' | 'style'>

export default function Select(props: SelectProps) {
  return <select {...props} className={CONTROL_CLASS_NAME} />
}
