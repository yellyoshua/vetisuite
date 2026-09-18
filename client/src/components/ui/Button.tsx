import type { ReactNode, Ref } from 'react'
import { buttonClassName, type ButtonSize, type ButtonVariant } from './button-class-name'

type ButtonProps = {
  children: ReactNode
  type?: 'button' | 'submit' | 'reset'
  variant?: ButtonVariant
  size?: ButtonSize
  isDisabled?: boolean
  ariaLabel?: string
  form?: string
  ref?: Ref<HTMLButtonElement>
  onClick?: () => void
}

export default function Button({
  children,
  type = 'button',
  variant = 'primary',
  size = 'md',
  isDisabled = false,
  ariaLabel,
  form,
  ref,
  onClick,
}: ButtonProps) {
  return (
    <button
      ref={ref}
      type={type}
      form={form}
      onClick={onClick}
      disabled={isDisabled}
      aria-label={ariaLabel}
      className={buttonClassName(variant, size)}
    >
      {children}
    </button>
  )
}
