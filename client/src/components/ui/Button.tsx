import type { ReactNode } from 'react'

type ButtonVariant = 'primary' | 'secondary'

type ButtonProps = {
  children: ReactNode
  type?: 'button' | 'submit'
  variant?: ButtonVariant
  onClick?: () => void
}

const VARIANT_CLASS_NAMES: Record<ButtonVariant, string> = {
  primary: 'bg-brand text-surface hover:bg-brand-strong',
  secondary: 'border border-line bg-surface text-brand hover:bg-brand-soft',
}

export default function Button({ children, type = 'button', variant = 'primary', onClick }: ButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      className={`inline-flex min-h-12 items-center justify-center rounded-lg px-5 text-base font-semibold transition-colors ${VARIANT_CLASS_NAMES[variant]}`}
    >
      {children}
    </button>
  )
}
