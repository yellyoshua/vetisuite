import { useSearchParams } from 'react-router'
import { withModalFromQuery, type ModalInjectedProps } from '@/components/modalWrapper'
import { Button } from '@/components/ui/button'
import useMutation from '@/hooks/use-mutation'
import { EMPLOYEES_DISABLE_MODAL } from '@/constants/modals'
import employeesDisableService from '../employees-disable.service'

type EmployeesDisableModalProps = {
  refetch: () => void
}

type DisableBody = {
  id: string | null
  disabled: boolean
}

function EmployeesDisableModal({ onClose, refetch, titleId }: EmployeesDisableModalProps & ModalInjectedProps) {
  const [searchParams] = useSearchParams()
  const employee = searchParams.get('employee')
  const isDisabling = searchParams.get('disabled') === 'true'
  const [isLoading, toggleStatus] = useMutation((body: DisableBody) => employeesDisableService.put(body), {
    skipConfirm: true,
    successMessage: 'Estado de la cuenta actualizado correctamente',
    onSuccess: () => {
      onClose()
      refetch()
    },
  })

  return (
    <div className="p-6">
      <h2 id={titleId} className="text-xl font-bold text-foreground mb-4">
        {isDisabling ? 'Bloquear cuenta' : 'Habilitar cuenta'}
      </h2>
      <p className="text-sm text-muted-foreground mb-6">
        {isDisabling
          ? 'El empleado perderá el acceso al sistema. ¿Deseas continuar?'
          : 'El empleado recuperará el acceso al sistema. ¿Deseas continuar?'}
      </p>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onClose} className="cursor-pointer">
          Cancelar
        </Button>
        <Button
          type="button"
          disabled={isLoading}
          onClick={() => toggleStatus({ id: employee, disabled: isDisabling })}
          className="cursor-pointer"
        >
          Confirmar
        </Button>
      </div>
    </div>
  )
}

EmployeesDisableModal.modalClassName = 'bg-card rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto'

export default withModalFromQuery(EmployeesDisableModal, EMPLOYEES_DISABLE_MODAL)
