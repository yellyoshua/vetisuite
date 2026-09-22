import type { InputHTMLAttributes } from 'react'
import { CONTROL_CLASS_NAME } from './control-class-name'

type InputProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'className' | 'style'>

export default function Input(props: InputProps) {
  return <input {...props} className={CONTROL_CLASS_NAME} />
}
