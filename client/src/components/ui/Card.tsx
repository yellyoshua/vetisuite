import type { ReactNode } from 'react'

type CardProps = {
  children: ReactNode
  className?: string
}

export default function Card({ children, className = '' }: CardProps) {
  return <div className={`rounded-card border border-line bg-card ${className}`}>{children}</div>
}
