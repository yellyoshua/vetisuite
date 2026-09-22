import type { ComponentType } from 'react'
import { useCallback, useEffect, useId, useRef } from 'react'
import { useSearchParams } from 'react-router'

export type ModalInjectedProps = {
  isOpen: boolean
  onClose: () => void
  titleId: string
}

type ModalContent<TProps> = ComponentType<TProps & ModalInjectedProps> & {
  modalClassName?: string
}

export function withModalFromQuery<TProps extends object>(ModalComponent: ModalContent<TProps>, modalId: string) {
  return function ModalWithQuery(props: TProps) {
    const [searchParams, setSearchParams] = useSearchParams()
    const panelRef = useRef<HTMLDivElement>(null)
    const titleId = useId()
    const isOpen = searchParams.get('modal') === modalId

    const handleClose = useCallback(() => {
      const params = new URLSearchParams(searchParams)
      params.delete('modal')
      setSearchParams(params, { replace: true })
    }, [searchParams, setSearchParams])

    useEffect(() => {
      if (!isOpen) {
        return undefined
      }

      const previouslyFocused = document.activeElement

      panelRef.current?.focus()

      return () => {
        if (previouslyFocused instanceof HTMLElement) {
          previouslyFocused.focus()
        }
      }
    }, [isOpen])

    useEffect(() => {
      if (!isOpen) {
        return undefined
      }

      const handleKeyDown = (event: KeyboardEvent) => {
        if (event.key === 'Escape') {
          handleClose()
        }
      }

      document.addEventListener('keydown', handleKeyDown)

      return () => document.removeEventListener('keydown', handleKeyDown)
    }, [isOpen, handleClose])

    if (!isOpen) {
      return null
    }

    return (
      <div
        role="presentation"
        onClick={handleClose}
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      >
        <div
          ref={panelRef}
          role="dialog"
          aria-labelledby={titleId}
          tabIndex={-1}
          onClick={(event) => event.stopPropagation()}
          className={ModalComponent.modalClassName || 'bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto'}
        >
          <ModalComponent
            {...props}
            isOpen={isOpen}
            onClose={handleClose}
            titleId={titleId}
          />
        </div>
      </div>
    )
  }
}

export function useOpenModal() {
  const [searchParams, setSearchParams] = useSearchParams()

  return (modalId: string, extraParams: Record<string, string> = {}) => {
    const params = new URLSearchParams(searchParams)
    params.set('modal', modalId)
    Object.entries(extraParams).forEach(([key, value]) => params.set(key, value))
    setSearchParams(params)
  }
}

export function useCloseModal() {
  const [searchParams, setSearchParams] = useSearchParams()

  return () => {
    const params = new URLSearchParams(searchParams)
    params.delete('modal')
    setSearchParams(params, { replace: true })
  }
}
