import useInput, { type InputProps } from './input.handlers'

export default function Input(props: InputProps) {
  const { inputProps } = useInput(props)

  return <input {...inputProps} />
}
