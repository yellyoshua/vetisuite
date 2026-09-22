import { Button } from '@/components/ui/button'
import useMutation from '@/hooks/use-mutation'
import { useSessionStore } from '@/stores/session.store'
import { formatDate } from '@/lib/date'
import { deviceLabel } from '@/lib/user-agent'
import sessionsService, { type ProfileSession } from '@/modules/superadmin/profile/sessions/sessions.service'

type SessionRowProps = {
  session: ProfileSession
  position: number
  total: number
  refetch: () => void
}

const STARTED_AT_FORMAT: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }

export default function SessionRow({ session, position, total, refetch }: SessionRowProps) {
  const device = deviceLabel(session.userAgent)
  const startedAt = formatDate(session.createdAt, STARTED_AT_FORMAT)
  const [isLoading, submit] = useMutation(
    () => sessionsService.remove({ id: session.id }),
    session.isCurrent ? currentSessionOptions() : otherSessionOptions(refetch),
  )

  return (
    <li className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium text-gray-900 dark:text-white">{device}</span>
          {session.isCurrent
            ? <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs font-medium rounded-full">
              Actual
            </span>
            : null}
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Inicio: {startedAt}</p>
      </div>
      <Button
        type="button"
        variant="destructive"
        className="cursor-pointer w-full sm:w-auto"
        disabled={isLoading}
        aria-label={`Cerrar sesión de ${device} iniciada el ${startedAt} (${position} de ${total})`}
        onClick={() => submit()}
      >
        Cerrar sesión
      </Button>
    </li>
  )
}

function currentSessionOptions() {
  return {
    confirm: {
      title: '¿Cerrar la sesión actual?',
      description: 'Es la sesión que estás usando: se cerrará y saldrás de la aplicación. Tendrás que iniciar sesión de nuevo.',
      confirmText: 'Cerrar y salir',
    },
    successMessage: 'Sesión cerrada correctamente',
    onSuccess: endSession,
    onError: endSession,
  }
}

function otherSessionOptions(refetch: () => void) {
  return {
    skipConfirm: true,
    successMessage: 'Sesión cerrada correctamente',
    onSuccess: () => refetch(),
    onError: () => refetch(),
  }
}

function endSession() {
  useSessionStore.getState().clear()
  window.location.assign('/')
}
