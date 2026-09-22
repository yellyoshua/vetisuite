import { useEffect, useId, useRef } from 'react'
import ErrorState from '@/components/ErrorState'
import LoadingState from '@/components/LoadingState'
import Button from '@/components/legacy-ui/Button'
import Icon from '@/components/legacy-ui/Icon'
import { DELETE_SCHEDULE_EXCEPTION_MODAL, DELETE_SCHEDULE_EXCEPTION_PARAMS } from '@/constants/modals'
import useModalQuery from '@/hooks/use-modal-query'
import useMutation from '@/hooks/legacy/use-mutation'
import useResolver from '@/hooks/legacy/use-resolver'
import { formatDate } from '@/lib/format-date'
import { deleteScheduleException, resolveScheduleException } from './resolvers'

type ConfirmDialogContentProps = {
  exceptionId: string
  descriptionId: string
  onClose: () => void
}

function ConfirmDialogContent({ exceptionId, descriptionId, onClose }: ConfirmDialogContentProps) {
  const { data, error, isLoading } = useResolver(resolveScheduleException, { exceptionId })
  const [isDeleting, confirmDeletion, deleteError] = useMutation(deleteScheduleException, { onSuccess: onClose })

  return (
    <div className="p-5">
      {isLoading && <LoadingState />}
      {error && <ErrorState error={error} />}
      {data && (
        <p id={descriptionId} className="text-[13.5px] text-ink">
          Se eliminará la excepción del <b>{formatDate(data.date)}</b> ({data.reason}). Ese día vuelve a regir el
          horario semanal.
        </p>
      )}
      {deleteError && (
        <p role="alert" className="mt-3 text-[12.5px] text-red">
          {deleteError.message}
        </p>
      )}
      <div className="mt-5 flex flex-wrap justify-end gap-2">
        <Button variant="ghost" onClick={onClose}>
          Cancelar
        </Button>
        {data && (
          <Button variant="danger" isDisabled={isDeleting} onClick={() => confirmDeletion({ exceptionId })}>
            <Icon name="trash-2" size={14} /> Eliminar excepción
          </Button>
        )}
      </div>
    </div>
  )
}

export default function ConfirmDialog() {
  const { isOpen, params, closeModal } = useModalQuery(DELETE_SCHEDULE_EXCEPTION_MODAL, DELETE_SCHEDULE_EXCEPTION_PARAMS)
  const dialogRef = useRef<HTMLDialogElement>(null)
  const titleId = useId()
  const descriptionId = useId()

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) {
      return
    }
    if (isOpen && !dialog.open) {
      dialog.showModal()
    }
    if (!isOpen && dialog.open) {
      dialog.close()
    }
  }, [isOpen])

  return (
    <dialog
      ref={dialogRef}
      onCancel={closeModal}
      onClose={() => isOpen && closeModal()}
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      className="m-auto max-h-[88vh] w-[min(460px,calc(100%-2rem))] overflow-y-auto overscroll-contain rounded-modal border-0 bg-card p-0 text-ink shadow-drawer backdrop:bg-shade/50"
    >
      <div className="sticky top-0 z-10 flex items-center justify-between border-b border-line bg-card px-5 py-4">
        <h2 id={titleId} className="font-head text-base font-semibold text-ink">
          Eliminar excepción
        </h2>
        <button
          type="button"
          onClick={closeModal}
          aria-label="Cerrar"
          className="cursor-pointer rounded-control border-0 bg-transparent p-1 text-sub"
        >
          <Icon name="x" size={18} />
        </button>
      </div>
      {isOpen && (
        <ConfirmDialogContent
          exceptionId={params.exceptionId ?? ''}
          descriptionId={descriptionId}
          onClose={closeModal}
        />
      )}
    </dialog>
  )
}
