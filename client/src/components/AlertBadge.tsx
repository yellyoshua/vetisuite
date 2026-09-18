import type { ReactNode } from 'react'

type AlertBadgeProps = {
  children: ReactNode
}

export default function AlertBadge({ children }: AlertBadgeProps) {
  return (
    <strong className="inline-flex items-center gap-1.5 rounded-md border border-red/25 bg-red-soft px-2 py-1 text-xs font-bold tracking-wide text-red uppercase">
      <svg viewBox="0 0 20 20" aria-hidden="true" focusable="false" className="size-4 shrink-0 fill-current">
        <path
          fillRule="evenodd"
          d="M10.87 2.6a1 1 0 0 0-1.74 0L.9 17.02A1 1 0 0 0 1.77 18.5h16.46a1 1 0 0 0 .87-1.48L10.87 2.6ZM9.2 7.2h1.6v5.1H9.2V7.2Zm0 6.5h1.6v1.6H9.2v-1.6Z"
        />
      </svg>
      <span className="sr-only">Advertencia: </span>
      {children}
    </strong>
  )
}
