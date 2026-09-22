import type { ReactNode } from 'react'
import { Link } from 'react-router'
import { buttonClassName, type ButtonSize, type ButtonVariant } from './button-class-name'

type ButtonLinkProps = {
  children: ReactNode
  to: string
  variant?: ButtonVariant
  size?: ButtonSize
  ariaLabel?: string
}

export default function ButtonLink({ children, to, variant = 'primary', size = 'md', ariaLabel }: ButtonLinkProps) {
  return (
    <Link to={to} aria-label={ariaLabel} className={buttonClassName(variant, size)}>
      {children}
    </Link>
  )
}
