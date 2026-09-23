import { useSearchParams } from 'react-router'
import { withModalFromQuery, type ModalInjectedProps } from '@/components/modalWrapper'
import { Button } from '@/components/ui/button'
import useMutation from '@/hooks/use-mutation'
import { OWNERS_DISABLE_MODAL } from '@/constants/modals'
import ownersDisableService from '../owners-disable.service'

type OwnersDisableModalProps = {
  refetch: () => void
}

type DisableBody = {
  id: string | null
  disabled: boolean
}

function OwnersDisableModal({ onClose, refetch, titleId }: OwnersDisableModalProps & ModalInjectedProps) {
  const [searchParams] = useSearchParams()
  const owner = searchParams.get('owner')
  const isDisabling = searchParams.get('disabled') === 'true'
  const [isLoading, toggleStatus] = useMutation((body: DisableBody) => ownersDisableService.put(body), {
    skipConfirm: true,
    successMessage: 'Estado de la cuenta actualizado correctamente',
    onSuccess: () => {
      onClose()
      refetch()
    },
  })

  return (
    <div className="p-6">
      <h2 id={titleId} className="text-xl font-bold text-gray-900 dark:text-white mb-4">
        {isDisabling ? 'Bloquear cuenta' : 'Habilitar cuenta'}
      </h2>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
        {isDisabling
          ? 'El dueño perderá el acceso al sistema. ¿Deseas continuar?'
          : 'El dueño recuperará el acceso al sistema. ¿Deseas continuar?'}
      </p>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onClose} className="cursor-pointer">
          Cancelar
        </Button>
        <Button
          type="button"
          disabled={isLoading}
          onClick={() => toggleStatus({ id: owner, disabled: isDisabling })}
          className="cursor-pointer"
        >
          Confirmar
        </Button>
      </div>
    </div>
  )
}

OwnersDisableModal.modalClassName = 'bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto'

export default withModalFromQuery(OwnersDisableModal, OWNERS_DISABLE_MODAL)
