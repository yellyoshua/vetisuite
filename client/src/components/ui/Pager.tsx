import { useEffect, useRef } from 'react'
import Button from './Button'
import Icon from './Icon'

type PagerProps = {
  page: number
  total: number
  pageSize: number
  onPageChange: (page: number) => void
}

type FocusTarget = 'previous' | 'next' | null

export default function Pager({ page, total, pageSize, onPageChange }: PagerProps) {
  const previousRef = useRef<HTMLButtonElement>(null)
  const nextRef = useRef<HTMLButtonElement>(null)
  const pendingFocusRef = useRef<FocusTarget>(null)
  const pageCount = Math.max(1, Math.ceil(total / pageSize))
  const firstShown = total === 0 ? 0 : (page - 1) * pageSize + 1
  const lastShown = Math.min(total, page * pageSize)

  useEffect(() => {
    const target = pendingFocusRef.current === 'previous' ? previousRef.current : nextRef.current
    if (pendingFocusRef.current && target && document.activeElement === document.body) {
      target.focus()
    }
    pendingFocusRef.current = null
  }, [page])

  function goToPreviousPage() {
    pendingFocusRef.current = page - 1 <= 1 ? 'next' : null
    onPageChange(page - 1)
  }

  function goToNextPage() {
    pendingFocusRef.current = page + 1 >= pageCount ? 'previous' : null
    onPageChange(page + 1)
  }

  return (
    <nav aria-label="Paginación" className="flex flex-wrap items-center justify-between gap-2">
      <span className="text-[11.5px] text-sub tabular-nums">
        Mostrando {firstShown}–{lastShown} de {total}
      </span>
      <div className="flex gap-1.5">
        <Button ref={previousRef} variant="ghost" size="sm" isDisabled={page <= 1} onClick={goToPreviousPage}>
          <Icon name="chevron-left" size={13} /> Anterior
        </Button>
        <Button ref={nextRef} variant="ghost" size="sm" isDisabled={page >= pageCount} onClick={goToNextPage}>
          Siguiente <Icon name="chevron-right" size={13} />
        </Button>
      </div>
    </nav>
  )
}
