import useButton, { type ButtonProps } from './button.handlers'

export default function Button(props: ButtonProps) {
  const { buttonProps } = useButton(props)

  return <button {...buttonProps} />
}
