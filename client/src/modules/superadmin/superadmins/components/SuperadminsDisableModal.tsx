import { useSearchParams } from 'react-router'
import { withModalFromQuery, type ModalInjectedProps } from '@/components/modalWrapper'
import { Button } from '@/components/ui/button'
import useMutation from '@/hooks/use-mutation'
import { SUPERADMINS_DISABLE_MODAL } from '@/constants/modals'
import superadminsDisableService from '../superadmins-disable.service'

type SuperadminsDisableModalProps = {
  refetch: () => void
}

type DisableBody = {
  id: string | null
  disabled: boolean
}

function SuperadminsDisableModal({ onClose, refetch, titleId }: SuperadminsDisableModalProps & ModalInjectedProps) {
  const [searchParams] = useSearchParams()
  const superadmin = searchParams.get('superadmin')
  const isDisabling = searchParams.get('disabled') === 'true'
  const [isLoading, toggleStatus] = useMutation((body: DisableBody) => superadminsDisableService.put(body), {
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
          ? 'El super admin perderá el acceso al sistema. ¿Deseas continuar?'
          : 'El super admin recuperará el acceso al sistema. ¿Deseas continuar?'}
      </p>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onClose} className="cursor-pointer">
          Cancelar
        </Button>
        <Button
          type="button"
          disabled={isLoading}
          onClick={() => toggleStatus({ id: superadmin, disabled: isDisabling })}
          className="cursor-pointer"
        >
          Confirmar
        </Button>
      </div>
    </div>
  )
}

SuperadminsDisableModal.modalClassName = 'bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto'

export default withModalFromQuery(SuperadminsDisableModal, SUPERADMINS_DISABLE_MODAL)
